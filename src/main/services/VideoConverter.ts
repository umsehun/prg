import * as path from 'path';
import * as fs from 'fs/promises';
// import ffmpeg from 'fluent-ffmpeg'; // Temporarily disabled due to type issues
import { logger } from '../../shared/logger';

/**
 * Video converter service - currently disabled
 * TODO: Re-implement when fluent-ffmpeg type issues are resolved
 */
export class VideoConverter {
  /**
   * Convert a video file to MP4 format
   * Currently disabled - using original video files directly
   */
  static async convertToMp4(inputPath: string, outputPath: string): Promise<boolean> {
    logger.info(`[VideoConverter] Video conversion disabled, using original: ${inputPath}`);
    return true;
  }

  /**
   * Check if video needs conversion (always false for now)
   */
  static needsConversion(videoPath: string): boolean {
    return false;
  }

  /**
   * Get MP4 path for a video file
   */
  static getMp4Path(videoPath: string): string {
    const parsedPath = path.parse(videoPath);
    return path.join(parsedPath.dir, parsedPath.name + '.mp4');
  }

  /**
   * Ensure MP4 version exists (currently returns original path)
   */
  static async ensureMp4(videoPath: string): Promise<string | null> {
    try {
      await fs.access(videoPath);
      return videoPath; // Return original path since conversion is disabled
    } catch (error) {
      logger.error(`[VideoConverter] Video file not found: ${videoPath}`, error);
      return null;
    }
  }
}
