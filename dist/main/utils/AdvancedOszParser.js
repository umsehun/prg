"use strict";
/**
 * Advanced OSZ Parser - Complete implementation with proper .osu file parsing
 * Extracts real BPM, duration, and difficulty data from .osu beatmap files
 * Based on official osu! file format specification
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
exports.AdvancedOszParser = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const yauzl = __importStar(require("yauzl"));
const logger_1 = require("../../shared/globals/logger");
class AdvancedOszParser {
    /**
     * Extract and parse an OSZ file with complete .osu parsing
     */
    async parseOszFile(oszPath, outputDir) {
        try {
            logger_1.logger.info('advanced-osz', `🎵 Parsing OSZ file: ${(0, path_1.basename)(oszPath)}`);
            // Create output directory
            await fs_1.promises.mkdir(outputDir, { recursive: true });
            return new Promise((resolve, reject) => {
                yauzl.open(oszPath, { lazyEntries: true }, (err, zipfile) => {
                    if (err) {
                        logger_1.logger.error('advanced-osz', `Failed to open OSZ: ${err}`);
                        reject(err);
                        return;
                    }
                    if (!zipfile) {
                        reject(new Error('Failed to open zipfile'));
                        return;
                    }
                    let songData = {
                        id: this.generateId(oszPath),
                        filePath: outputDir,
                        notes: []
                    };
                    let osuFileContent = '';
                    const extractedFiles = [];
                    zipfile.readEntry();
                    zipfile.on('entry', (entry) => {
                        const fileName = entry.fileName;
                        // Skip directories
                        if (/\/$/.test(fileName)) {
                            zipfile.readEntry();
                            return;
                        }
                        // Process .osu files
                        if (fileName.toLowerCase().endsWith('.osu')) {
                            logger_1.logger.debug('advanced-osz', `Found .osu file: ${fileName}`);
                            zipfile.openReadStream(entry, (streamErr, readStream) => {
                                if (streamErr || !readStream) {
                                    logger_1.logger.error('advanced-osz', `Failed to read .osu file: ${streamErr}`);
                                    zipfile.readEntry();
                                    return;
                                }
                                let content = '';
                                readStream.on('data', (chunk) => {
                                    content += chunk.toString('utf8');
                                });
                                readStream.on('end', () => {
                                    osuFileContent = content;
                                    zipfile.readEntry();
                                });
                                readStream.on('error', (readErr) => {
                                    logger_1.logger.error('advanced-osz', `Error reading .osu content: ${readErr}`);
                                    zipfile.readEntry();
                                });
                            });
                            return;
                        }
                        // Extract other files (audio, images, etc.)
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
                                    songData.audioFile = fileName;
                                }
                                else if (['.jpg', '.jpeg', '.png', '.bmp'].includes(ext)) {
                                    if (!songData.backgroundImage || fileName.toLowerCase().includes('bg') || fileName.toLowerCase().includes('background')) {
                                        songData.backgroundImage = fileName;
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
                            if (osuFileContent) {
                                logger_1.logger.info('advanced-osz', `🔍 Parsing .osu file content (${osuFileContent.length} characters)`);
                                const parsedData = this.parseOsuContent(osuFileContent);
                                songData = { ...songData, ...parsedData };
                            }
                            // Validate required fields
                            if (!songData.title || !songData.artist) {
                                logger_1.logger.warn('advanced-osz', 'Missing required song metadata');
                                resolve(null);
                                return;
                            }
                            const finalSongData = {
                                id: songData.id,
                                title: songData.title,
                                artist: songData.artist,
                                audioFile: songData.audioFile || '',
                                backgroundImage: songData.backgroundImage || '',
                                difficulty: songData.difficulty || { easy: 1, normal: 3, hard: 5, expert: 7 },
                                bpm: songData.bpm || 120,
                                duration: songData.duration || 180000, // milliseconds
                                filePath: outputDir,
                                notes: songData.notes || []
                            };
                            // Save chart data as JSON
                            try {
                                const chartDataPath = (0, path_1.join)(outputDir, 'chart.json');
                                await fs_1.promises.writeFile(chartDataPath, JSON.stringify(finalSongData, null, 2));
                                logger_1.logger.debug('advanced-osz', `💾 Saved chart data: ${chartDataPath}`);
                            }
                            catch (saveError) {
                                logger_1.logger.error('advanced-osz', `Failed to save chart data: ${saveError}`);
                            }
                            logger_1.logger.info('advanced-osz', `✅ Successfully parsed: "${finalSongData.title}" by ${finalSongData.artist}`);
                            logger_1.logger.info('advanced-osz', `📊 BPM: ${finalSongData.bpm}, Duration: ${Math.round(finalSongData.duration / 1000)}s, Notes: ${finalSongData.notes?.length || 0}`);
                            resolve(finalSongData);
                        }
                        catch (parseError) {
                            logger_1.logger.error('advanced-osz', `Error finalizing song data: ${parseError}`);
                            resolve(null);
                        }
                    });
                    zipfile.on('error', (zipErr) => {
                        logger_1.logger.error('advanced-osz', `ZIP file error: ${zipErr}`);
                        reject(zipErr);
                    });
                });
            });
        }
        catch (error) {
            logger_1.logger.error('advanced-osz', `Failed to parse OSZ file ${oszPath}: ${error}`);
            return null;
        }
    }
    /**
     * Parse .osu file content with complete section parsing
     */
    parseOsuContent(content) {
        const lines = content.split('\n').map(line => line.trim());
        let currentSection = '';
        let metadata = {};
        let general = {};
        let difficulty = {};
        let timingPoints = [];
        let hitObjects = [];
        logger_1.logger.debug('advanced-osz', `📖 Parsing .osu content with ${lines.length} lines`);
        for (const line of lines) {
            if (!line || line.startsWith('//'))
                continue;
            // Section headers
            if (line.startsWith('[') && line.endsWith(']')) {
                currentSection = line.slice(1, -1);
                logger_1.logger.debug('advanced-osz', `📋 Section: ${currentSection}`);
                continue;
            }
            // Parse sections
            switch (currentSection) {
                case 'Metadata':
                    this.parseMetadataLine(line, metadata);
                    break;
                case 'General':
                    this.parseGeneralLine(line, general);
                    break;
                case 'Difficulty':
                    this.parseDifficultyLine(line, difficulty);
                    break;
                case 'TimingPoints':
                    this.parseTimingPointLine(line, timingPoints);
                    break;
                case 'HitObjects':
                    this.parseHitObjectLine(line, hitObjects);
                    break;
            }
        }
        // Calculate BPM from timing points
        const calculatedBpm = this.calculateBPM(timingPoints);
        // Calculate duration from hit objects
        const calculatedDuration = this.calculateDuration(hitObjects);
        // Calculate difficulty levels
        const difficultyLevels = this.calculateDifficultyLevels(difficulty, hitObjects.length);
        const result = {
            title: metadata.title || 'Unknown Title',
            artist: metadata.artist || 'Unknown Artist',
            audioFile: general.audioFilename || '',
            bpm: calculatedBpm,
            duration: calculatedDuration,
            difficulty: difficultyLevels,
            notes: this.convertHitObjectsToNotes(hitObjects)
        };
        logger_1.logger.info('advanced-osz', `🎯 Parsed results: BPM=${result.bpm}, Duration=${Math.round(result.duration / 1000)}s, TimingPoints=${timingPoints.length}, HitObjects=${hitObjects.length}`);
        return result;
    }
    /**
     * Parse metadata section lines
     */
    parseMetadataLine(line, metadata) {
        const colonIndex = line.indexOf(':');
        if (colonIndex === -1)
            return;
        const key = line.substring(0, colonIndex);
        const value = line.substring(colonIndex + 1);
        switch (key) {
            case 'Title':
                metadata.title = value;
                break;
            case 'TitleUnicode':
                metadata.titleUnicode = value;
                break;
            case 'Artist':
                metadata.artist = value;
                break;
            case 'ArtistUnicode':
                metadata.artistUnicode = value;
                break;
            case 'Creator':
                metadata.creator = value;
                break;
            case 'Version':
                metadata.version = value;
                break;
        }
    }
    /**
     * Parse general section lines
     */
    parseGeneralLine(line, general) {
        const colonIndex = line.indexOf(':');
        if (colonIndex === -1)
            return;
        const key = line.substring(0, colonIndex).trim();
        const value = line.substring(colonIndex + 1).trim();
        switch (key) {
            case 'AudioFilename':
                general.audioFilename = value;
                break;
            case 'AudioLeadIn':
                general.audioLeadIn = parseInt(value) || 0;
                break;
            case 'PreviewTime':
                general.previewTime = parseInt(value) || -1;
                break;
        }
    }
    /**
     * Parse difficulty section lines
     */
    parseDifficultyLine(line, difficulty) {
        const colonIndex = line.indexOf(':');
        if (colonIndex === -1)
            return;
        const key = line.substring(0, colonIndex);
        const value = parseFloat(line.substring(colonIndex + 1));
        switch (key) {
            case 'HPDrainRate':
                difficulty.hpDrainRate = value;
                break;
            case 'CircleSize':
                difficulty.circleSize = value;
                break;
            case 'OverallDifficulty':
                difficulty.overallDifficulty = value;
                break;
            case 'ApproachRate':
                difficulty.approachRate = value;
                break;
            case 'SliderMultiplier':
                difficulty.sliderMultiplier = value;
                break;
            case 'SliderTickRate':
                difficulty.sliderTickRate = value;
                break;
        }
    }
    /**
     * Parse timing point lines with proper format handling
     */
    parseTimingPointLine(line, timingPoints) {
        const parts = line.split(',');
        if (parts.length < 2)
            return;
        const time = parseFloat(parts[0] || '0');
        const beatLength = parseFloat(parts[1] || '0');
        // Skip invalid timing points
        if (isNaN(time) || isNaN(beatLength))
            return;
        const timingPoint = {
            time,
            beatLength,
            meter: parts.length > 2 ? parseInt(parts[2] || '4') || 4 : 4,
            sampleSet: parts.length > 3 ? parseInt(parts[3] || '1') || 1 : 1,
            sampleIndex: parts.length > 4 ? parseInt(parts[4] || '0') || 0 : 0,
            volume: parts.length > 5 ? parseInt(parts[5] || '100') || 100 : 100,
            uninherited: parts.length > 6 ? (parts[6] || '1') === '1' : beatLength > 0,
            effects: parts.length > 7 ? parseInt(parts[7] || '0') || 0 : 0
        };
        timingPoints.push(timingPoint);
        if (timingPoint.uninherited) {
            logger_1.logger.debug('advanced-osz', `⏱️  Uninherited timing point: ${time}ms, beatLength: ${beatLength}ms`);
        }
    }
    /**
     * Parse hit object lines
     */
    parseHitObjectLine(line, hitObjects) {
        const parts = line.split(',');
        if (parts.length < 4)
            return;
        const hitObject = {
            x: parseInt(parts[0] || '0'),
            y: parseInt(parts[1] || '0'),
            time: parseInt(parts[2] || '0'),
            type: parseInt(parts[3] || '0'),
            hitSound: parts.length > 4 ? parseInt(parts[4] || '0') : 0
        };
        if (!isNaN(hitObject.time)) {
            hitObjects.push(hitObject);
        }
    }
    /**
     * Calculate BPM from timing points using official formula
     */
    calculateBPM(timingPoints) {
        const uninheritedPoints = timingPoints.filter(tp => tp.uninherited && tp.beatLength > 0);
        if (uninheritedPoints.length === 0) {
            logger_1.logger.warn('advanced-osz', '⚠️ No valid uninherited timing points found, using default BPM 120');
            return 120;
        }
        // Calculate BPM using the official formula: BPM = 60,000 / millisecondsPerBeat
        const bpmValues = uninheritedPoints.map(tp => 60000 / tp.beatLength);
        const averageBpm = bpmValues.reduce((sum, bpm) => sum + bpm, 0) / bpmValues.length;
        logger_1.logger.info('advanced-osz', `🎵 Calculated BPM: ${Math.round(averageBpm)} (from ${uninheritedPoints.length} timing points)`);
        return Math.round(averageBpm);
    }
    /**
     * Calculate song duration from hit objects
     */
    calculateDuration(hitObjects) {
        if (hitObjects.length === 0) {
            logger_1.logger.warn('advanced-osz', '⚠️ No hit objects found, using default duration');
            return 180000; // 3 minutes default
        }
        const lastObjectTime = Math.max(...hitObjects.map(obj => obj.time));
        const duration = lastObjectTime + 5000; // Add 5 seconds buffer
        logger_1.logger.info('advanced-osz', `⏳ Calculated duration: ${Math.round(duration / 1000)}s (from ${hitObjects.length} hit objects)`);
        return duration;
    }
    /**
     * Calculate difficulty levels based on actual difficulty data
     */
    calculateDifficultyLevels(difficulty, _noteCount) {
        const od = difficulty.overallDifficulty || 5;
        const ar = difficulty.approachRate || od;
        const cs = difficulty.circleSize || 5;
        const hp = difficulty.hpDrainRate || 5;
        // Create difficulty levels based on actual difficulty values
        const avgDifficulty = (od + ar + cs + hp) / 4;
        return {
            easy: Math.max(1, Math.round(avgDifficulty - 2)),
            normal: Math.round(avgDifficulty),
            hard: Math.min(10, Math.round(avgDifficulty + 2)),
            expert: Math.min(10, Math.round(avgDifficulty + 4))
        };
    }
    /**
     * Convert hit objects to our note format
     */
    convertHitObjectsToNotes(hitObjects) {
        return hitObjects.map(obj => ({
            time: obj.time,
            type: 'tap'
        }));
    }
    /**
     * Generate unique ID from file path
     */
    generateId(filePath) {
        const name = (0, path_1.basename)(filePath, '.osz');
        return name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    }
}
exports.AdvancedOszParser = AdvancedOszParser;
