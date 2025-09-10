"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RuntimeOsuParser = void 0;
// src/main/services/RuntimeOsuParser.ts
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const osu_parsers_1 = require("osu-parsers");
const logger_1 = require("../../shared/globals/logger");
/**
 * Runtime .osu file parser for loading chart data during game
 */
class RuntimeOsuParser {
    /**
     * Get available difficulties for a chart directory
     */
    async getDifficulties(chartDirPath) {
        try {
            const files = await fs_1.promises.readdir(chartDirPath);
            const osuFiles = files.filter(file => file.endsWith('.osu'));
            const difficulties = [];
            for (const osuFile of osuFiles) {
                const osuPath = path_1.default.join(chartDirPath, osuFile);
                const beatmap = await this.parseBeatmapMetadata(osuPath);
                if (beatmap) {
                    difficulties.push({
                        name: beatmap.metadata.version || path_1.default.basename(osuFile, '.osu'),
                        filename: osuFile,
                        starRating: beatmap.difficulty.overallDifficulty || 5,
                        difficultyName: beatmap.metadata.version || 'Normal'
                    });
                }
            }
            // Sort by difficulty (star rating)
            return difficulties.sort((a, b) => a.starRating - b.starRating);
        }
        catch (error) {
            logger_1.logger.error('runtime-osu-parser', `Failed to get difficulties for ${chartDirPath}: ${error}`);
            return [];
        }
    }
    /**
     * Parse notes from specific .osu file
     */
    async parseNotesFromOsu(chartDirPath, osuFilename) {
        try {
            const osuPath = path_1.default.join(chartDirPath, osuFilename);
            const beatmap = await this.parseBeatmap(osuPath);
            if (!beatmap) {
                logger_1.logger.error('runtime-osu-parser', `Failed to parse beatmap: ${osuPath}`);
                return [];
            }
            const notes = [];
            // Convert hit objects to notes
            for (const hitObject of beatmap.hitObjects) {
                const note = {
                    time: hitObject.startTime,
                    type: this.getHitObjectType(hitObject),
                    position: {
                        x: hitObject.startPosition.x,
                        y: hitObject.startPosition.y
                    }
                };
                // For hold notes (sliders), check if it has duration
                if ('endTime' in hitObject && typeof hitObject.endTime === 'number' && hitObject.endTime > hitObject.startTime) {
                    note.duration = hitObject.endTime - hitObject.startTime;
                }
                notes.push(note);
            }
            // Sort by time
            notes.sort((a, b) => a.time - b.time);
            logger_1.logger.info('runtime-osu-parser', `Parsed ${notes.length} notes from ${osuFilename}`);
            return notes;
        }
        catch (error) {
            logger_1.logger.error('runtime-osu-parser', `Failed to parse notes from ${osuFilename}: ${error}`);
            return [];
        }
    }
    /**
     * Get chart info including available difficulties
     */
    async getChartInfo(chartDirPath, preferredDifficulty) {
        const difficulties = await this.getDifficulties(chartDirPath);
        if (difficulties.length === 0) {
            return {
                difficulties: [],
                selectedDifficulty: null,
                notes: [],
                audioVideoFiles: { audioFile: null, videoFile: null, backgroundFile: null }
            };
        }
        // Select difficulty
        let selectedDifficulty = difficulties[0] || null; // Default to first (easiest)
        if (preferredDifficulty && selectedDifficulty) {
            const found = difficulties.find(d => d.name.toLowerCase().includes(preferredDifficulty.toLowerCase()) ||
                d.difficultyName.toLowerCase().includes(preferredDifficulty.toLowerCase()));
            if (found)
                selectedDifficulty = found;
        }
        // Parse notes for selected difficulty
        const notes = selectedDifficulty
            ? await this.parseNotesFromOsu(chartDirPath, selectedDifficulty.filename)
            : [];
        // Get audio/video files
        const audioVideoFiles = await this.getAudioVideoFiles(chartDirPath, selectedDifficulty?.filename);
        return {
            difficulties,
            selectedDifficulty,
            notes,
            audioVideoFiles
        };
    }
    /**
     * Parse beatmap metadata only (faster than full parse)
     */
    async parseBeatmapMetadata(osuPath) {
        try {
            const content = await fs_1.promises.readFile(osuPath, 'utf-8');
            const decoder = new osu_parsers_1.BeatmapDecoder();
            const beatmap = decoder.decodeFromString(content);
            return beatmap;
        }
        catch (error) {
            logger_1.logger.debug('runtime-osu-parser', `Failed to parse beatmap metadata: ${osuPath}`);
            return null;
        }
    }
    /**
     * Parse full beatmap with hit objects
     */
    async parseBeatmap(osuPath) {
        try {
            const content = await fs_1.promises.readFile(osuPath, 'utf-8');
            const decoder = new osu_parsers_1.BeatmapDecoder();
            const beatmap = decoder.decodeFromString(content);
            return beatmap;
        }
        catch (error) {
            logger_1.logger.debug('runtime-osu-parser', `Failed to parse beatmap: ${osuPath}`);
            return null;
        }
    }
    /**
     * Determine hit object type for our game
     */
    getHitObjectType(hitObject) {
        // Simple mapping - you can make this more sophisticated
        if ('endTime' in hitObject && typeof hitObject.endTime === 'number' && hitObject.endTime > hitObject.startTime + 100) {
            return 'hold';
        }
        if ('type' in hitObject && hitObject.type && hitObject.type.toString().includes('slider')) {
            return 'slider';
        }
        return 'tap';
    }
    /**
     * Get audio and video files from chart directory
     */
    async getAudioVideoFiles(chartDirPath, osuFilename) {
        try {
            const files = await fs_1.promises.readdir(chartDirPath);
            let audioFile = null;
            let videoFile = null;
            let backgroundFile = null;
            // If we have an osu file, try to read the AudioFilename from it
            if (osuFilename) {
                const audioFromOsu = await this.getAudioFilenameFromOsu(chartDirPath, osuFilename);
                if (audioFromOsu && files.includes(audioFromOsu)) {
                    audioFile = path_1.default.join(chartDirPath, audioFromOsu);
                }
            }
            // Fallback: search for common audio file patterns
            if (!audioFile) {
                const audioExtensions = ['.mp3', '.ogg', '.wav', '.m4a'];
                const commonAudioNames = ['audio', 'song', 'music'];
                for (const file of files) {
                    const ext = path_1.default.extname(file).toLowerCase();
                    const baseName = path_1.default.basename(file, ext).toLowerCase();
                    if (audioExtensions.includes(ext)) {
                        // Prioritize common names
                        if (commonAudioNames.includes(baseName)) {
                            audioFile = path_1.default.join(chartDirPath, file);
                            break;
                        }
                        // Otherwise use the first audio file we find
                        if (!audioFile) {
                            audioFile = path_1.default.join(chartDirPath, file);
                        }
                    }
                }
            }
            // Find video file
            const videoExtensions = ['.mp4', '.avi', '.mkv', '.webm'];
            for (const file of files) {
                const ext = path_1.default.extname(file).toLowerCase();
                if (videoExtensions.includes(ext)) {
                    videoFile = path_1.default.join(chartDirPath, file);
                    break; // Use first video file found
                }
            }
            // Find background image
            const imageExtensions = ['.jpg', '.jpeg', '.png', '.bmp'];
            for (const file of files) {
                const ext = path_1.default.extname(file).toLowerCase();
                const baseName = path_1.default.basename(file, ext).toLowerCase();
                if (imageExtensions.includes(ext)) {
                    // Prefer files with "bg", "background" in name
                    if (baseName.includes('bg') || baseName.includes('background')) {
                        backgroundFile = path_1.default.join(chartDirPath, file);
                        break;
                    }
                    // Otherwise use first image
                    if (!backgroundFile) {
                        backgroundFile = path_1.default.join(chartDirPath, file);
                    }
                }
            }
            logger_1.logger.info('runtime-osu-parser', `Found media files in ${path_1.default.basename(chartDirPath)}:`, {
                audio: audioFile ? path_1.default.basename(audioFile) : null,
                video: videoFile ? path_1.default.basename(videoFile) : null,
                background: backgroundFile ? path_1.default.basename(backgroundFile) : null
            });
            return { audioFile, videoFile, backgroundFile };
        }
        catch (error) {
            logger_1.logger.error('runtime-osu-parser', `Failed to get media files for ${chartDirPath}: ${error}`);
            return { audioFile: null, videoFile: null, backgroundFile: null };
        }
    }
    /**
     * Extract AudioFilename from .osu file
     */
    async getAudioFilenameFromOsu(chartDirPath, osuFilename) {
        try {
            const osuPath = path_1.default.join(chartDirPath, osuFilename);
            const content = await fs_1.promises.readFile(osuPath, 'utf-8');
            // Find AudioFilename line
            const lines = content.split('\n');
            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed.startsWith('AudioFilename:')) {
                    const filename = trimmed.substring('AudioFilename:'.length).trim();
                    return filename;
                }
            }
            return null;
        }
        catch (error) {
            logger_1.logger.debug('runtime-osu-parser', `Failed to read AudioFilename from ${osuFilename}: ${error}`);
            return null;
        }
    }
}
exports.RuntimeOsuParser = RuntimeOsuParser;
