import * as path from 'path';
import * as fs from 'fs/promises';
import { spawn } from 'child_process';
import { logger } from '../../shared/logger';

/**
 * Video converter service - converts all video formats to MP4 using ffmpeg
 */
export class VideoConverter {
  // Supported input video formats for conversion
  private static readonly SUPPORTED_VIDEO_FORMATS = [
    '.mp4', '.avi', '.webm', '.flv', '.mov', '.wmv', '.m4v', '.3gp', 
    '.mkv', '.mp3', '.ogg', '.wav' // Audio formats that might be in OSZ files
  ];

  /**
   * Check if ffmpeg is available on the system
   */
  static async checkFfmpegAvailable(): Promise<boolean> {
    return new Promise((resolve) => {
      const ffmpeg = spawn('ffmpeg', ['-version'], { stdio: 'pipe' });
      ffmpeg.on('close', (code) => {
        resolve(code === 0);
      });
      ffmpeg.on('error', () => {
        resolve(false);
      });
    });
  }

  /**
   * Convert a video file to MP4 format using ffmpeg
   */
  static async convertToMp4(inputPath: string, outputPath: string): Promise<boolean> {
    try {
      const inputExt = path.extname(inputPath).toLowerCase();

      if (inputExt === '.mp4') {
        // If input is already MP4, copy it to output location
        if (inputPath !== outputPath) {
          await fs.copyFile(inputPath, outputPath);
          logger.info(`[VideoConverter] Copied MP4 file: ${inputPath} -> ${outputPath}`);
        } else {
          logger.info(`[VideoConverter] MP4 file already at correct location: ${inputPath}`);
        }
        return true;
      }

      // Check if ffmpeg is available
      const ffmpegAvailable = await this.checkFfmpegAvailable();
      if (!ffmpegAvailable) {
        logger.warn(`[VideoConverter] FFmpeg not available, cannot convert ${inputExt} to MP4`);
        // Copy original file if conversion is not possible
        if (inputPath !== outputPath) {
          await fs.copyFile(inputPath, outputPath);
        }
        return false;
      }

      logger.info(`[VideoConverter] Converting ${inputExt} to MP4: ${inputPath} -> ${outputPath}`);

      // Ensure output directory exists
      const outputDir = path.dirname(outputPath);
      await fs.mkdir(outputDir, { recursive: true });

      return new Promise<boolean>((resolve) => {
        // FFmpeg command for video conversion with optimized settings
        const args = [
          '-i', inputPath,
          '-c:v', 'libx264',       // H.264 video codec
          '-preset', 'fast',        // Fast encoding preset
          '-crf', '23',             // Good quality/size balance
          '-c:a', 'aac',           // AAC audio codec
          '-strict', 'experimental', // For compatibility
          '-movflags', '+faststart', // Optimize for web playback
          '-y',                     // Overwrite output file
          outputPath
        ];

        const ffmpeg = spawn('ffmpeg', args, {
          stdio: ['pipe', 'pipe', 'pipe']
        });

        let stderr = '';

        ffmpeg.stderr.on('data', (data: Buffer) => {
          stderr += data.toString();
        });

        ffmpeg.on('close', (code) => {
          if (code === 0) {
            logger.info(`[VideoConverter] Successfully converted: ${outputPath}`);
            resolve(true);
          } else {
            logger.error(`[VideoConverter] Conversion failed with code ${code}: ${stderr}`);
            resolve(false);
          }
        });

        ffmpeg.on('error', (error) => {
          logger.error(`[VideoConverter] FFmpeg spawn error:`, error);
          resolve(false);
        });
      });
    } catch (error) {
      logger.error(`[VideoConverter] Failed to process video: ${inputPath}`, error);
      return false;
    }
  }

  /**
   * Check if video format is supported for conversion
   */
  static isSupportedVideoFormat(filePath: string): boolean {
    const ext = path.extname(filePath).toLowerCase();
    return this.SUPPORTED_VIDEO_FORMATS.includes(ext);
  }

  /**
   * Check if video needs conversion
   */
  static needsConversion(videoPath: string): boolean {
    const ext = path.extname(videoPath).toLowerCase();
    return ext !== '.mp4' && this.isSupportedVideoFormat(videoPath);
  }

  /**
   * Get MP4 path for a video file
   */
  static getMp4Path(videoPath: string): string {
    const parsedPath = path.parse(videoPath);
    return path.join(parsedPath.dir, parsedPath.name + '.mp4');
  }

  /**
   * Ensure MP4 version exists for all supported video formats
   */
  static async ensureMp4(videoPath: string): Promise<string | null> {
    try {
      // Check if original file exists
      await fs.access(videoPath);

      const ext = path.extname(videoPath).toLowerCase();

      // Check if format is supported
      if (!this.isSupportedVideoFormat(videoPath)) {
        logger.warn(`[VideoConverter] Unsupported video format: ${ext} for ${videoPath}`);
        return null;
      }

      if (ext === '.mp4') {
        // Already MP4, return as-is
        logger.info(`[VideoConverter] Video already in MP4 format: ${videoPath}`);
        return videoPath;
      }

      // For other formats, try to find or create MP4 version
      const mp4Path = this.getMp4Path(videoPath);

      try {
        await fs.access(mp4Path);
        logger.info(`[VideoConverter] Found existing MP4 version: ${mp4Path}`);
        return mp4Path;
      } catch {
        // MP4 version doesn't exist, try to convert
        logger.info(`[VideoConverter] Converting ${ext} to MP4: ${videoPath}`);
        const converted = await this.convertToMp4(videoPath, mp4Path);
        if (converted) {
          logger.info(`[VideoConverter] Successfully converted to MP4: ${mp4Path}`);
          return mp4Path;
        } else {
          // Conversion failed, return original file for compatibility
          logger.warn(`[VideoConverter] Conversion failed, using original: ${videoPath}`);
          return videoPath;
        }
      }
    } catch (error) {
      logger.error(`[VideoConverter] Video file not found: ${videoPath}`, error);
      return null;
    }
  }
}
