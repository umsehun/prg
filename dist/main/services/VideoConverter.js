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
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoConverter = void 0;
const path = __importStar(require("path"));
const fs = __importStar(require("fs/promises"));
// import ffmpeg from 'fluent-ffmpeg'; // Temporarily disabled due to type issues
const logger_1 = require("../../shared/logger");
/**
 * Video converter service - currently disabled
 * TODO: Re-implement when fluent-ffmpeg type issues are resolved
 */
class VideoConverter {
    /**
     * Convert a video file to MP4 format
     * Currently disabled - using original video files directly
     */
    static async convertToMp4(inputPath, outputPath) {
        logger_1.logger.info(`[VideoConverter] Video conversion disabled, using original: ${inputPath}`);
        return true;
    }
    /**
     * Check if video needs conversion (always false for now)
     */
    static needsConversion(videoPath) {
        return false;
    }
    /**
     * Get MP4 path for a video file
     */
    static getMp4Path(videoPath) {
        const parsedPath = path.parse(videoPath);
        return path.join(parsedPath.dir, parsedPath.name + '.mp4');
    }
    /**
     * Ensure MP4 version exists (currently returns original path)
     */
    static async ensureMp4(videoPath) {
        try {
            await fs.access(videoPath);
            return videoPath; // Return original path since conversion is disabled
        }
        catch (error) {
            logger_1.logger.error(`[VideoConverter] Video file not found: ${videoPath}`, error);
            return null;
        }
    }
}
exports.VideoConverter = VideoConverter;
