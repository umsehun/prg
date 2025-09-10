"use strict";
/**
 * Professional OSZ Parser using osu-parsers library
 * Complete support for multiple .osu files with proper difficulty handling
 * Based on official osu!lazer source code
 */
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
exports.ProfessionalOszParser = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const yauzl = __importStar(require("yauzl"));
const osu_parsers_1 = require("osu-parsers");
const logger_1 = require("../../shared/globals/logger");
class ProfessionalOszParser {
    constructor() {
        Object.defineProperty(this, "decoder", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.decoder = new osu_parsers_1.BeatmapDecoder();
    }
    /**
     * Parse OSZ file with complete multi-difficulty support
     */
    async parseOszFile(oszPath, outputDir) {
        try {
            logger_1.logger.info('professional-osz', `🎵 Parsing OSZ with professional parser: ${(0, path_1.basename)(oszPath)}`);
            // Create output directory
            await fs_1.promises.mkdir(outputDir, { recursive: true });
            return new Promise((resolve, reject) => {
                yauzl.open(oszPath, { lazyEntries: true }, (err, zipfile) => {
                    if (err || !zipfile) {
                        logger_1.logger.error('professional-osz', `Failed to open OSZ: ${err}`);
                        reject(err);
                        return;
                    }
                    const osuFiles = [];
                    let commonMetadata = {};
                    let audioFile = '';
                    let backgroundImage = '';
                    const extractedFiles = [];
                    zipfile.readEntry();
                    zipfile.on('entry', (entry) => {
                        const fileName = entry.fileName;
                        // Skip directories
                        if (/\/$/.test(fileName)) {
                            zipfile.readEntry();
                            return;
                        }
                        // Collect .osu files
                        if (fileName.toLowerCase().endsWith('.osu')) {
                            logger_1.logger.debug('professional-osz', `📋 Found .osu file: ${fileName}`);
                            zipfile.openReadStream(entry, (streamErr, readStream) => {
                                if (streamErr || !readStream) {
                                    logger_1.logger.error('professional-osz', `Failed to read .osu file: ${streamErr}`);
                                    zipfile.readEntry();
                                    return;
                                }
                                let content = '';
                                readStream.on('data', (chunk) => {
                                    content += chunk.toString('utf8');
                                });
                                readStream.on('end', () => {
                                    osuFiles.push({ name: fileName, content });
                                    logger_1.logger.debug('professional-osz', `✅ Loaded .osu: ${fileName} (${content.length} chars)`);
                                    zipfile.readEntry();
                                });
                                readStream.on('error', (readErr) => {
                                    logger_1.logger.error('professional-osz', `Error reading .osu content: ${readErr}`);
                                    zipfile.readEntry();
                                });
                            });
                            return;
                        }
                        // Extract other files
                        zipfile.openReadStream(entry, (streamErr, readStream) => {
                            if (streamErr || !readStream) {
                                zipfile.readEntry();
                                return;
                            }
                            const outputPath = (0, path_1.join)(outputDir, fileName);
                            const writeStream = require('fs').createWriteStream(outputPath);
                            readStream.pipe(writeStream);
                            writeStream.on('finish', () => {
                                extractedFiles.push(fileName);
                                // Track important files
                                const ext = (0, path_1.extname)(fileName).toLowerCase();
                                if (['.mp3', '.wav', '.ogg', '.m4a'].includes(ext)) {
                                    audioFile = fileName;
                                }
                                else if (['.jpg', '.jpeg', '.png', '.bmp'].includes(ext)) {
                                    if (!backgroundImage || fileName.toLowerCase().includes('bg') || fileName.toLowerCase().includes('background')) {
                                        backgroundImage = fileName;
                                    }
                                }
                                zipfile.readEntry();
                            });
                            writeStream.on('error', () => {
                                zipfile.readEntry();
                            });
                        });
                    });
                    zipfile.on('end', async () => {
                        try {
                            if (osuFiles.length === 0) {
                                logger_1.logger.warn('professional-osz', 'No .osu files found in OSZ');
                                resolve(null);
                                return;
                            }
                            logger_1.logger.info('professional-osz', `🔍 Processing ${osuFiles.length} .osu files`);
                            // Parse all .osu files using professional parser
                            const difficulties = [];
                            let commonTitle = '';
                            let commonArtist = '';
                            for (const osuFile of osuFiles) {
                                try {
                                    logger_1.logger.debug('professional-osz', `📊 Parsing difficulty: ${osuFile.name}`);
                                    // Use professional osu-parsers library
                                    const beatmap = this.decoder.decodeFromString(osuFile.content);
                                    // Extract common metadata from first beatmap
                                    if (!commonTitle) {
                                        commonTitle = beatmap.metadata.title || 'Unknown Title';
                                        commonArtist = beatmap.metadata.artist || 'Unknown Artist';
                                        commonMetadata = {
                                            title: commonTitle,
                                            artist: commonArtist,
                                            creator: beatmap.metadata.creator,
                                            source: beatmap.metadata.source,
                                            tags: beatmap.metadata.tags,
                                            audioFile: beatmap.general.audioFilename || audioFile,
                                            previewTime: beatmap.general.previewTime
                                        };
                                    }
                                    // Calculate BPM from timing points  
                                    const bpm = this.calculateBPMFromBeatmap(beatmap);
                                    // Calculate duration
                                    const duration = this.calculateDurationFromBeatmap(beatmap);
                                    // Create difficulty info
                                    const difficulty = {
                                        name: beatmap.metadata.version || 'Unknown',
                                        overallDifficulty: beatmap.difficulty.overallDifficulty,
                                        approachRate: beatmap.difficulty.approachRate,
                                        circleSize: beatmap.difficulty.circleSize,
                                        hpDrainRate: beatmap.difficulty.drainRate,
                                        noteCount: beatmap.hitObjects.length,
                                        bpm,
                                        duration
                                    };
                                    difficulties.push(difficulty);
                                    logger_1.logger.info('professional-osz', `✅ Parsed "${difficulty.name}": ` +
                                        `OD=${difficulty.overallDifficulty}, ` +
                                        `AR=${difficulty.approachRate}, ` +
                                        `BPM=${bpm}, ` +
                                        `Notes=${difficulty.noteCount}`);
                                }
                                catch (parseError) {
                                    logger_1.logger.error('professional-osz', `Failed to parse ${osuFile.name}: ${parseError}`);
                                }
                            }
                            if (difficulties.length === 0) {
                                logger_1.logger.warn('professional-osz', 'No difficulties successfully parsed');
                                resolve(null);
                                return;
                            }
                            // Select preferred difficulty (usually hardest or most complete)
                            const preferredDiff = this.selectPreferredDifficulty(difficulties);
                            // Create final song data
                            const finalSongData = {
                                id: this.generateId(oszPath),
                                title: commonTitle,
                                artist: commonArtist,
                                audioFile: commonMetadata.audioFile || audioFile,
                                backgroundImage: backgroundImage,
                                difficulty: this.createDifficultyLevels(difficulties),
                                bpm: preferredDiff.bpm,
                                duration: preferredDiff.duration,
                                filePath: outputDir,
                                notes: this.createNotesFromDifficulty(osuFiles.find(f => f.name.includes(preferredDiff.name))?.content || ''),
                                difficulties,
                                preferredDifficulty: preferredDiff.name
                            };
                            // Save chart data as JSON
                            try {
                                const chartDataPath = (0, path_1.join)(outputDir, 'chart.json');
                                await fs_1.promises.writeFile(chartDataPath, JSON.stringify(finalSongData, null, 2));
                                logger_1.logger.debug('professional-osz', `💾 Saved complete chart data: ${chartDataPath}`);
                            }
                            catch (saveError) {
                                logger_1.logger.error('professional-osz', `Failed to save chart data: ${saveError}`);
                            }
                            logger_1.logger.info('professional-osz', `🎉 Successfully parsed "${commonTitle}" by ${commonArtist}` +
                                `\n   📊 ${difficulties.length} difficulties: ${difficulties.map(d => d.name).join(', ')}` +
                                `\n   🎵 BPM: ${finalSongData.bpm}, Duration: ${Math.round(finalSongData.duration / 1000)}s` +
                                `\n   ⭐ Preferred: ${preferredDiff.name} (${preferredDiff.noteCount} notes)`);
                            resolve(finalSongData);
                        }
                        catch (error) {
                            logger_1.logger.error('professional-osz', `Error processing .osu files: ${error}`);
                            resolve(null);
                        }
                    });
                    zipfile.on('error', (zipErr) => {
                        logger_1.logger.error('professional-osz', `ZIP file error: ${zipErr}`);
                        reject(zipErr);
                    });
                });
            });
        }
        catch (error) {
            logger_1.logger.error('professional-osz', `Failed to parse OSZ file ${oszPath}: ${error}`);
            return null;
        }
    }
    /**
     * Calculate BPM from beatmap timing points
     */
    calculateBPMFromBeatmap(beatmap) {
        const timingPoints = beatmap.controlPoints.timingPoints;
        if (timingPoints.length === 0) {
            logger_1.logger.warn('professional-osz', 'No timing points found, using default BPM');
            return 120;
        }
        // Get BPM from first timing point (most common approach)
        const firstTiming = timingPoints[0];
        if (!firstTiming) {
            logger_1.logger.warn('professional-osz', 'Invalid timing point, using default BPM');
            return 120;
        }
        const bpm = 60000 / firstTiming.beatLength;
        return Math.round(bpm);
    }
    /**
     * Calculate duration from beatmap hit objects
     */
    calculateDurationFromBeatmap(beatmap) {
        const hitObjects = beatmap.hitObjects;
        if (hitObjects.length === 0) {
            return 180000; // 3 minutes default
        }
        const lastObject = hitObjects[hitObjects.length - 1];
        if (!lastObject) {
            return 180000;
        }
        return lastObject.startTime + 5000; // Add 5 second buffer
    }
    /**
     * Select the preferred difficulty (usually the most complete or hardest)
     */
    selectPreferredDifficulty(difficulties) {
        if (difficulties.length === 0) {
            throw new Error('No difficulties available');
        }
        // Sort by note count (more complete charts preferred)
        const sorted = difficulties.sort((a, b) => b.noteCount - a.noteCount);
        return sorted[0];
    }
    /**
     * Create our difficulty level structure from parsed difficulties
     */
    createDifficultyLevels(difficulties) {
        if (difficulties.length === 0) {
            return { easy: 1, normal: 3, hard: 5, expert: 7 };
        }
        // Find representative difficulties for each level
        const sorted = difficulties.sort((a, b) => a.overallDifficulty - b.overallDifficulty);
        return {
            easy: sorted.length > 0 ? Math.round(sorted[0].overallDifficulty) : 1,
            normal: sorted.length > 1 ? Math.round(sorted[Math.floor(sorted.length * 0.33)].overallDifficulty) : 3,
            hard: sorted.length > 2 ? Math.round(sorted[Math.floor(sorted.length * 0.66)].overallDifficulty) : 5,
            expert: sorted.length > 0 ? Math.round(sorted[sorted.length - 1].overallDifficulty) : 7
        };
    }
    /**
     * Create note data from .osu content (simplified for now)
     */
    createNotesFromDifficulty(content) {
        const lines = content.split('\n');
        let inHitObjects = false;
        const notes = [];
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed === '[HitObjects]') {
                inHitObjects = true;
                continue;
            }
            if (inHitObjects && trimmed && !trimmed.startsWith('[')) {
                const parts = trimmed.split(',');
                if (parts.length >= 3) {
                    const time = parseInt(parts[2] || '0');
                    if (!isNaN(time)) {
                        notes.push({
                            time,
                            type: 'tap' // Simplified for now, could be expanded
                        });
                    }
                }
            }
        }
        return notes;
    }
    /**
     * Generate unique ID from file path
     */
    generateId(filePath) {
        const name = (0, path_1.basename)(filePath, '.osz');
        return name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    }
}
exports.ProfessionalOszParser = ProfessionalOszParser;
