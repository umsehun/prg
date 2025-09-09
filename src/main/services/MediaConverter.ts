/**
 * MediaConverter - Handles audio and video format conversions
 */

import ffmpeg from 'fluent-ffmpeg';
import { promises as fs } from 'fs';
import { join, extname, basename } from 'path';
import { logger } from '../../shared/globals/logger';

export class MediaConverter {
    private static instance: MediaConverter;

    public static getInstance(): MediaConverter {
        if (!MediaConverter.instance) {
            MediaConverter.instance = new MediaConverter();
        }
        return MediaConverter.instance;
    }

    /**
     * Convert audio file to MP3 format
     */
    public async convertToMp3(inputPath: string, outputPath: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            logger.debug('media-converter', `Converting audio: ${inputPath} -> ${outputPath}`);

            ffmpeg(inputPath)
                .audioCodec('libmp3lame')
                .audioBitrate('192k')
                .audioFrequency(44100)
                .audioChannels(2)
                .format('mp3')
                .on('start', (commandLine) => {
                    logger.debug('media-converter', `FFmpeg command: ${commandLine}`);
                })
                .on('progress', (progress) => {
                    logger.debug('media-converter', `Audio conversion progress: ${progress.percent}%`);
                })
                .on('end', () => {
                    logger.info('media-converter', `Audio conversion completed: ${outputPath}`);
                    resolve(true);
                })
                .on('error', (err) => {
                    logger.error('media-converter', `Audio conversion failed: ${err.message}`);
                    reject(err);
                })
                .save(outputPath);
        });
    }

    /**
     * Convert video file to MP4 format
     */
    public async convertToMp4(inputPath: string, outputPath: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            logger.debug('media-converter', `Converting video: ${inputPath} -> ${outputPath}`);

            ffmpeg(inputPath)
                .videoCodec('libx264')
                .audioCodec('aac')
                .videoBitrate('1000k')
                .audioBitrate('128k')
                .format('mp4')
                .on('start', (commandLine) => {
                    logger.debug('media-converter', `FFmpeg command: ${commandLine}`);
                })
                .on('progress', (progress) => {
                    logger.debug('media-converter', `Video conversion progress: ${progress.percent}%`);
                })
                .on('end', () => {
                    logger.info('media-converter', `Video conversion completed: ${outputPath}`);
                    resolve(true);
                })
                .on('error', (err) => {
                    logger.error('media-converter', `Video conversion failed: ${err.message}`);
                    reject(err);
                })
                .save(outputPath);
        });
    }

    /**
     * Check if file is a supported audio format
     */
    public isSupportedAudioFormat(filePath: string): boolean {
        const supportedFormats = ['.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac', '.wma'];
        const ext = extname(filePath).toLowerCase();
        return supportedFormats.includes(ext);
    }

    /**
     * Check if file is a supported video format
     */
    public isSupportedVideoFormat(filePath: string): boolean {
        const supportedFormats = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.mkv', '.webm'];
        const ext = extname(filePath).toLowerCase();
        return supportedFormats.includes(ext);
    }

    /**
     * Convert audio file to MP3 if needed
     */
    public async ensureMp3(inputPath: string, outputDir: string): Promise<string> {
        const ext = extname(inputPath).toLowerCase();

        if (ext === '.mp3') {
            // Already MP3, just copy to output directory
            const fileName = basename(inputPath);
            const outputPath = join(outputDir, fileName);
            await fs.copyFile(inputPath, outputPath);
            return outputPath;
        }

        // Convert to MP3
        const baseName = basename(inputPath, ext);
        const outputPath = join(outputDir, `${baseName}.mp3`);

        await this.convertToMp3(inputPath, outputPath);
        return outputPath;
    }

    /**
     * Convert video file to MP4 if needed
     */
    public async ensureMp4(inputPath: string, outputDir: string): Promise<string> {
        const ext = extname(inputPath).toLowerCase();

        if (ext === '.mp4') {
            // Already MP4, just copy to output directory
            const fileName = basename(inputPath);
            const outputPath = join(outputDir, fileName);
            await fs.copyFile(inputPath, outputPath);
            return outputPath;
        }

        // Convert to MP4
        const baseName = basename(inputPath, ext);
        const outputPath = join(outputDir, `${baseName}.mp4`);

        await this.convertToMp4(inputPath, outputPath);
        return outputPath;
    }

    /**
     * Get media file duration in seconds
     */
    public async getMediaDuration(filePath: string): Promise<number> {
        return new Promise((resolve, reject) => {
            ffmpeg.ffprobe(filePath, (err, metadata) => {
                if (err) {
                    logger.error('media-converter', `Failed to probe media file: ${err.message}`);
                    reject(err);
                    return;
                }

                const duration = metadata.format?.duration;
                if (duration) {
                    resolve(Math.floor(duration));
                } else {
                    reject(new Error('Could not determine media duration'));
                }
            });
        });
    }

    /**
     * Get audio file BPM (if available in metadata)
     */
    public async getAudioBPM(filePath: string): Promise<number | null> {
        return new Promise((resolve) => {
            ffmpeg.ffprobe(filePath, (err, metadata) => {
                if (err) {
                    resolve(null);
                    return;
                }

                // Try to find BPM in tags
                const tags = metadata.format?.tags;
                if (tags) {
                    const bpmKeys = ['BPM', 'bpm', 'TBPM', 'Bpm'];
                    for (const key of bpmKeys) {
                        if (tags[key]) {
                            const bpmValue = typeof tags[key] === 'string' ? tags[key] : String(tags[key]);
                            const bpm = parseInt(bpmValue);
                            if (!isNaN(bpm) && bpm > 0) {
                                resolve(bpm);
                                return;
                            }
                        }
                    }
                }

                resolve(null);
            });
        });
    }
}
