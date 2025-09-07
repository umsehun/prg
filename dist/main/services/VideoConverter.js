"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoConverter = void 0;
const path = __importStar(require("path"));
const fs = __importStar(require("fs/promises"));
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const logger_1 = require("../../shared/logger");
class VideoConverter {
    /**
     * Convert a video file to MP4 format
     * @param inputPath - Path to the input video file
     * @param outputPath - Path where the converted MP4 file should be saved
     * @returns Promise<boolean> - True if conversion successful, false otherwise
     */
    static async convertToMp4(inputPath, outputPath) {
        return new Promise((resolve) => {
            logger_1.logger.info(`[VideoConverter] Starting conversion: ${inputPath} -> ${outputPath}`);
            (0, fluent_ffmpeg_1.default)(inputPath)
                .output(outputPath)
                .videoCodec('libx264')
                .audioCodec('aac')
                .format('mp4')
                .on('start', (commandLine) => {
                logger_1.logger.info(`[VideoConverter] FFmpeg command: ${commandLine}`);
            })
                .on('progress', (progress) => {
                if (progress.percent) {
                    logger_1.logger.info(`[VideoConverter] Progress: ${Math.round(progress.percent)}%`);
                }
            })
                .on('end', () => {
                logger_1.logger.info(`[VideoConverter] Conversion completed: ${outputPath}`);
                resolve(true);
            })
                .on('error', (err) => {
                logger_1.logger.error(`[VideoConverter] Conversion failed: ${err.message}`);
                resolve(false);
            })
                .run();
        });
    }
    /**
     * Check if a video file needs conversion to MP4
     * @param videoPath - Path to the video file
     * @returns boolean - True if conversion is needed
     */
    static needsConversion(videoPath) {
        const ext = path.extname(videoPath).toLowerCase();
        return ext !== '.mp4';
    }
    /**
     * Get the MP4 equivalent path for a video file
     * @param videoPath - Original video file path
     * @returns string - Path where the MP4 version should be stored
     */
    static getMp4Path(videoPath) {
        const dir = path.dirname(videoPath);
        const basename = path.basename(videoPath, path.extname(videoPath));
        return path.join(dir, `${basename}.mp4`);
    }
    /**
     * Convert video file to MP4 if needed, return the MP4 path
     * @param videoPath - Original video file path
     * @returns Promise<string | null> - Path to MP4 file or null if conversion failed
     */
    static async ensureMp4(videoPath) {
        try {
            // Check if original file exists
            await fs.access(videoPath);
            const mp4Path = this.getMp4Path(videoPath);
            // If it's already MP4, return as-is
            if (!this.needsConversion(videoPath)) {
                return videoPath;
            }
            // Check if MP4 version already exists
            try {
                await fs.access(mp4Path);
                logger_1.logger.info(`[VideoConverter] MP4 version already exists: ${mp4Path}`);
                return mp4Path;
            }
            catch {
                // MP4 version doesn't exist, need to convert
            }
            logger_1.logger.info(`[VideoConverter] Converting ${videoPath} to MP4 format`);
            const success = await this.convertToMp4(videoPath, mp4Path);
            if (success) {
                // Verify the converted file exists and has content
                const stats = await fs.stat(mp4Path);
                if (stats.size > 0) {
                    return mp4Path;
                }
                else {
                    logger_1.logger.error(`[VideoConverter] Converted file is empty: ${mp4Path}`);
                    return null;
                }
            }
            else {
                return null;
            }
        }
        catch (error) {
            logger_1.logger.error(`[VideoConverter] Error processing video: ${error}`);
            return null;
        }
    }
}
exports.VideoConverter = VideoConverter;
