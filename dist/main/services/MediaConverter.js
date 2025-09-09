"use strict";
/**
 * MediaConverter - Handles audio and video format conversions
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaConverter = void 0;
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const fs_1 = require("fs");
const path_1 = require("path");
const logger_1 = require("../../shared/globals/logger");
class MediaConverter {
    static getInstance() {
        if (!MediaConverter.instance) {
            MediaConverter.instance = new MediaConverter();
        }
        return MediaConverter.instance;
    }
    /**
     * Convert audio file to MP3 format
     */
    async convertToMp3(inputPath, outputPath) {
        return new Promise((resolve, reject) => {
            logger_1.logger.debug('media-converter', `Converting audio: ${inputPath} -> ${outputPath}`);
            (0, fluent_ffmpeg_1.default)(inputPath)
                .audioCodec('libmp3lame')
                .audioBitrate('192k')
                .audioFrequency(44100)
                .audioChannels(2)
                .format('mp3')
                .on('start', (commandLine) => {
                logger_1.logger.debug('media-converter', `FFmpeg command: ${commandLine}`);
            })
                .on('progress', (progress) => {
                logger_1.logger.debug('media-converter', `Audio conversion progress: ${progress.percent}%`);
            })
                .on('end', () => {
                logger_1.logger.info('media-converter', `Audio conversion completed: ${outputPath}`);
                resolve(true);
            })
                .on('error', (err) => {
                logger_1.logger.error('media-converter', `Audio conversion failed: ${err.message}`);
                reject(err);
            })
                .save(outputPath);
        });
    }
    /**
     * Convert video file to MP4 format
     */
    async convertToMp4(inputPath, outputPath) {
        return new Promise((resolve, reject) => {
            logger_1.logger.debug('media-converter', `Converting video: ${inputPath} -> ${outputPath}`);
            (0, fluent_ffmpeg_1.default)(inputPath)
                .videoCodec('libx264')
                .audioCodec('aac')
                .videoBitrate('1000k')
                .audioBitrate('128k')
                .format('mp4')
                .on('start', (commandLine) => {
                logger_1.logger.debug('media-converter', `FFmpeg command: ${commandLine}`);
            })
                .on('progress', (progress) => {
                logger_1.logger.debug('media-converter', `Video conversion progress: ${progress.percent}%`);
            })
                .on('end', () => {
                logger_1.logger.info('media-converter', `Video conversion completed: ${outputPath}`);
                resolve(true);
            })
                .on('error', (err) => {
                logger_1.logger.error('media-converter', `Video conversion failed: ${err.message}`);
                reject(err);
            })
                .save(outputPath);
        });
    }
    /**
     * Check if file is a supported audio format
     */
    isSupportedAudioFormat(filePath) {
        const supportedFormats = ['.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac', '.wma'];
        const ext = (0, path_1.extname)(filePath).toLowerCase();
        return supportedFormats.includes(ext);
    }
    /**
     * Check if file is a supported video format
     */
    isSupportedVideoFormat(filePath) {
        const supportedFormats = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.mkv', '.webm'];
        const ext = (0, path_1.extname)(filePath).toLowerCase();
        return supportedFormats.includes(ext);
    }
    /**
     * Convert audio file to MP3 if needed
     */
    async ensureMp3(inputPath, outputDir) {
        const ext = (0, path_1.extname)(inputPath).toLowerCase();
        if (ext === '.mp3') {
            // Already MP3, just copy to output directory
            const fileName = (0, path_1.basename)(inputPath);
            const outputPath = (0, path_1.join)(outputDir, fileName);
            await fs_1.promises.copyFile(inputPath, outputPath);
            return outputPath;
        }
        // Convert to MP3
        const baseName = (0, path_1.basename)(inputPath, ext);
        const outputPath = (0, path_1.join)(outputDir, `${baseName}.mp3`);
        await this.convertToMp3(inputPath, outputPath);
        return outputPath;
    }
    /**
     * Convert video file to MP4 if needed
     */
    async ensureMp4(inputPath, outputDir) {
        const ext = (0, path_1.extname)(inputPath).toLowerCase();
        if (ext === '.mp4') {
            // Already MP4, just copy to output directory
            const fileName = (0, path_1.basename)(inputPath);
            const outputPath = (0, path_1.join)(outputDir, fileName);
            await fs_1.promises.copyFile(inputPath, outputPath);
            return outputPath;
        }
        // Convert to MP4
        const baseName = (0, path_1.basename)(inputPath, ext);
        const outputPath = (0, path_1.join)(outputDir, `${baseName}.mp4`);
        await this.convertToMp4(inputPath, outputPath);
        return outputPath;
    }
    /**
     * Get media file duration in seconds
     */
    async getMediaDuration(filePath) {
        return new Promise((resolve, reject) => {
            fluent_ffmpeg_1.default.ffprobe(filePath, (err, metadata) => {
                if (err) {
                    logger_1.logger.error('media-converter', `Failed to probe media file: ${err.message}`);
                    reject(err);
                    return;
                }
                const duration = metadata.format?.duration;
                if (duration) {
                    resolve(Math.floor(duration));
                }
                else {
                    reject(new Error('Could not determine media duration'));
                }
            });
        });
    }
    /**
     * Get audio file BPM (if available in metadata)
     */
    async getAudioBPM(filePath) {
        return new Promise((resolve) => {
            fluent_ffmpeg_1.default.ffprobe(filePath, (err, metadata) => {
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
exports.MediaConverter = MediaConverter;
