"use strict";
/**
 * Enhanced OSZ Parser with better osu-parsers integration
 * Properly extracts ALL difficulty information and metadata
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
exports.EnhancedOszParser = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const yauzl = __importStar(require("yauzl"));
const osu_parsers_1 = require("osu-parsers");
const osu_classes_1 = require("osu-classes");
const logger_1 = require("../../shared/globals/logger");
class EnhancedOszParser {
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
     * Parse OSZ file with enhanced multi-difficulty support and complete metadata extraction
     */
    async parseOszFile(oszPath, outputDir) {
        try {
            logger_1.logger.info('enhanced-osz', `🎵 Enhanced parsing OSZ: ${(0, path_1.basename)(oszPath)}`);
            // Create output directory
            await fs_1.promises.mkdir(outputDir, { recursive: true });
            return new Promise((resolve, reject) => {
                yauzl.open(oszPath, { lazyEntries: true }, (err, zipfile) => {
                    if (err || !zipfile) {
                        logger_1.logger.error('enhanced-osz', `Failed to open OSZ: ${err}`);
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
                            logger_1.logger.debug('enhanced-osz', `📋 Found .osu file: ${fileName}`);
                            zipfile.openReadStream(entry, (streamErr, readStream) => {
                                if (streamErr || !readStream) {
                                    logger_1.logger.error('enhanced-osz', `Failed to read .osu file: ${streamErr}`);
                                    zipfile.readEntry();
                                    return;
                                }
                                let content = '';
                                readStream.on('data', (chunk) => {
                                    content += chunk.toString('utf8');
                                });
                                readStream.on('end', () => {
                                    osuFiles.push({ name: fileName, content });
                                    logger_1.logger.debug('enhanced-osz', `✅ Loaded .osu: ${fileName} (${content.length} chars)`);
                                    zipfile.readEntry();
                                });
                                readStream.on('error', (readErr) => {
                                    logger_1.logger.error('enhanced-osz', `Error reading .osu content: ${readErr}`);
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
                                logger_1.logger.warn('enhanced-osz', 'No .osu files found in OSZ');
                                resolve(null);
                                return;
                            }
                            logger_1.logger.info('enhanced-osz', `🔍 Processing ${osuFiles.length} .osu difficulties`);
                            // Parse all .osu files using enhanced parsing
                            const difficulties = [];
                            let commonTitle = '';
                            let commonArtist = '';
                            let commonCreator = '';
                            let commonSource = '';
                            let commonTags = [];
                            let commonPreviewTime = -1;
                            let beatmapSetId;
                            for (const osuFile of osuFiles) {
                                try {
                                    logger_1.logger.debug('enhanced-osz', `📊 Enhanced parsing difficulty: ${osuFile.name}`);
                                    // Use professional osu-parsers library
                                    const beatmap = this.decoder.decodeFromString(osuFile.content);
                                    // Extract common metadata from first beatmap
                                    if (!commonTitle) {
                                        commonTitle = beatmap.metadata.title || 'Unknown Title';
                                        commonArtist = beatmap.metadata.artist || 'Unknown Artist';
                                        commonCreator = beatmap.metadata.creator || 'Unknown Creator';
                                        commonSource = beatmap.metadata.source || '';
                                        commonTags = Array.isArray(beatmap.metadata.tags)
                                            ? beatmap.metadata.tags
                                            : (typeof beatmap.metadata.tags === 'string'
                                                ? beatmap.metadata.tags.split(' ').filter((tag) => tag.length > 0)
                                                : []);
                                        commonPreviewTime = beatmap.general.previewTime;
                                        beatmapSetId = beatmap.metadata.beatmapSetId;
                                        // Update common metadata
                                        commonMetadata = {
                                            title: commonTitle,
                                            artist: commonArtist,
                                            creator: commonCreator,
                                            source: commonSource,
                                            tags: commonTags,
                                            audioFile: beatmap.general.audioFilename || audioFile,
                                            previewTime: commonPreviewTime,
                                            beatmapSetId
                                        };
                                    }
                                    // Enhanced BPM calculation from timing points
                                    const bpm = this.calculateEnhancedBPM(beatmap);
                                    // Enhanced duration calculation
                                    const duration = this.calculateEnhancedDuration(beatmap);
                                    // Count different types of hit objects
                                    const { circleCount, sliderCount, spinnerCount } = this.countHitObjectTypes(beatmap.hitObjects);
                                    // Calculate max combo
                                    const maxCombo = this.calculateMaxCombo(beatmap.hitObjects);
                                    // Create enhanced difficulty info
                                    const difficulty = {
                                        name: beatmap.metadata.version || 'Unknown',
                                        overallDifficulty: beatmap.difficulty.overallDifficulty,
                                        approachRate: beatmap.difficulty.approachRate,
                                        circleSize: beatmap.difficulty.circleSize,
                                        hpDrainRate: beatmap.difficulty.drainRate,
                                        sliderMultiplier: beatmap.difficulty.sliderMultiplier,
                                        sliderTickRate: beatmap.difficulty.sliderTickRate,
                                        noteCount: beatmap.hitObjects.length,
                                        circleCount,
                                        sliderCount,
                                        spinnerCount,
                                        bpm,
                                        duration,
                                        maxCombo,
                                        fileName: osuFile.name
                                    };
                                    difficulties.push(difficulty);
                                    logger_1.logger.info('enhanced-osz', `✅ Enhanced parsed "${difficulty.name}": ` +
                                        `OD=${difficulty.overallDifficulty}, AR=${difficulty.approachRate}, ` +
                                        `CS=${difficulty.circleSize}, HP=${difficulty.hpDrainRate}, ` +
                                        `BPM=${bpm}, Notes=${difficulty.noteCount} ` +
                                        `(${circleCount}c/${sliderCount}s/${spinnerCount}sp), MaxCombo=${maxCombo}`);
                                }
                                catch (parseError) {
                                    logger_1.logger.error('enhanced-osz', `Failed to parse ${osuFile.name}: ${parseError}`);
                                }
                            }
                            if (difficulties.length === 0) {
                                logger_1.logger.warn('enhanced-osz', 'No difficulties successfully parsed');
                                resolve(null);
                                return;
                            }
                            // Select preferred difficulty (most notes = most complete)
                            const preferredDiff = this.selectBestDifficulty(difficulties);
                            // Create final chart data with complete information
                            const finalChartData = {
                                id: this.generateId(oszPath),
                                title: commonTitle,
                                artist: commonArtist,
                                creator: commonCreator,
                                source: commonSource || undefined,
                                tags: commonTags,
                                previewTime: commonPreviewTime,
                                beatmapSetId,
                                audioFile: commonMetadata.audioFile || audioFile,
                                backgroundImage: backgroundImage,
                                difficulty: this.createBalancedDifficultyLevels(difficulties),
                                bpm: preferredDiff.bpm,
                                duration: preferredDiff.duration,
                                filePath: outputDir,
                                notes: this.createEnhancedNotesFromDifficulty(osuFiles.find(f => f.name === preferredDiff.fileName)?.content || ''),
                                difficulties,
                                preferredDifficulty: preferredDiff.name
                            };
                            // Save complete chart data as JSON
                            try {
                                const chartDataPath = (0, path_1.join)(outputDir, 'chart.json');
                                await fs_1.promises.writeFile(chartDataPath, JSON.stringify(finalChartData, null, 2));
                                logger_1.logger.debug('enhanced-osz', `💾 Saved enhanced chart data: ${chartDataPath}`);
                            }
                            catch (saveError) {
                                logger_1.logger.error('enhanced-osz', `Failed to save chart data: ${saveError}`);
                            }
                            logger_1.logger.info('enhanced-osz', `🎉 Enhanced parsing complete: "${commonTitle}" by ${commonArtist}` +
                                `\n   👤 Creator: ${commonCreator}` +
                                `\n   📊 ${difficulties.length} difficulties: ${difficulties.map(d => `${d.name}(${d.noteCount})`).join(', ')}` +
                                `\n   🎵 BPM: ${finalChartData.bpm}, Duration: ${Math.round(finalChartData.duration / 1000)}s` +
                                `\n   ⭐ Preferred: ${preferredDiff.name} (${preferredDiff.noteCount} notes, ${preferredDiff.maxCombo} combo)` +
                                `\n   📋 Tags: ${commonTags.join(', ') || 'None'}`);
                            resolve(finalChartData);
                        }
                        catch (error) {
                            logger_1.logger.error('enhanced-osz', `Error processing .osu files: ${error}`);
                            resolve(null);
                        }
                    });
                    zipfile.on('error', (zipErr) => {
                        logger_1.logger.error('enhanced-osz', `ZIP file error: ${zipErr}`);
                        reject(zipErr);
                    });
                });
            });
        }
        catch (error) {
            logger_1.logger.error('enhanced-osz', `Failed to parse OSZ file ${oszPath}: ${error}`);
            return null;
        }
    }
    /**
     * Enhanced BPM calculation considering all timing points
     */
    calculateEnhancedBPM(beatmap) {
        const timingPoints = beatmap.controlPoints.timingPoints;
        if (timingPoints.length === 0) {
            logger_1.logger.warn('enhanced-osz', 'No timing points found, using default BPM');
            return 120;
        }
        // Get all uninherited (red) timing points
        const redTimingPoints = timingPoints.filter((tp) => tp.beatLength > 0);
        if (redTimingPoints.length === 0) {
            logger_1.logger.warn('enhanced-osz', 'No red timing points found, using first timing point');
            const firstPoint = timingPoints[0];
            return firstPoint ? Math.round(60000 / Math.abs(firstPoint.beatLength)) : 120;
        }
        // Calculate weighted average BPM (longer sections have more weight)
        let totalTime = 0;
        let weightedBPM = 0;
        for (let i = 0; i < redTimingPoints.length; i++) {
            const current = redTimingPoints[i];
            const next = redTimingPoints[i + 1];
            if (!current)
                continue;
            // Duration this timing point is active
            const duration = next ? next.startTime - current.startTime : 30000; // 30 seconds for last section
            const bpm = 60000 / current.beatLength;
            weightedBPM += bpm * duration;
            totalTime += duration;
        }
        return totalTime > 0 ? Math.round(weightedBPM / totalTime) : 120;
    }
    /**
     * Enhanced duration calculation with proper hit object analysis
     */
    calculateEnhancedDuration(beatmap) {
        const hitObjects = beatmap.hitObjects;
        if (hitObjects.length === 0) {
            return 180000; // 3 minutes default
        }
        // Find the latest ending time considering sliders and spinners
        let latestTime = 0;
        for (const obj of hitObjects) {
            let objEndTime = obj.startTime;
            // For sliders and spinners, check if they have endTime/duration
            if ('endTime' in obj && typeof obj.endTime === 'number' && obj.endTime > obj.startTime) {
                objEndTime = obj.endTime;
            }
            else if ('duration' in obj && typeof obj.duration === 'number') {
                objEndTime = obj.startTime + obj.duration;
            }
            latestTime = Math.max(latestTime, objEndTime);
        }
        return latestTime + 5000; // Add 5 second buffer
    }
    /**
     * Count different types of hit objects
     */
    countHitObjectTypes(hitObjects) {
        let circleCount = 0;
        let sliderCount = 0;
        let spinnerCount = 0;
        for (const obj of hitObjects) {
            // Use HitType enum to check object types
            const isCircle = (obj.hitType & osu_classes_1.HitType.Normal) !== 0;
            const isSlider = (obj.hitType & osu_classes_1.HitType.Slider) !== 0;
            const isSpinner = (obj.hitType & osu_classes_1.HitType.Spinner) !== 0;
            if (isCircle && !isSlider && !isSpinner) {
                circleCount++;
            }
            else if (isSlider) {
                sliderCount++;
            }
            else if (isSpinner) {
                spinnerCount++;
            }
        }
        return { circleCount, sliderCount, spinnerCount };
    }
    /**
     * Calculate maximum possible combo
     */
    calculateMaxCombo(hitObjects) {
        let maxCombo = 0;
        for (const obj of hitObjects) {
            // Use HitType enum to check object types
            const isCircle = (obj.hitType & osu_classes_1.HitType.Normal) !== 0;
            const isSlider = (obj.hitType & osu_classes_1.HitType.Slider) !== 0;
            const isSpinner = (obj.hitType & osu_classes_1.HitType.Spinner) !== 0;
            if (isCircle && !isSlider && !isSpinner) {
                maxCombo += 1;
            }
            else if (isSlider) {
                // Sliders contribute more to combo based on slider ticks
                // Simplified: assume 2-3 combo per slider on average
                maxCombo += 2;
            }
            else if (isSpinner) {
                // Spinners contribute 1 to combo
                maxCombo += 1;
            }
        }
        return maxCombo;
    }
    /**
     * Select the best difficulty (most complete/interesting)
     */
    selectBestDifficulty(difficulties) {
        if (difficulties.length === 0) {
            throw new Error('No difficulties available');
        }
        // Sort by completeness score (note count + variety bonus)
        const scored = difficulties.map(diff => ({
            diff,
            score: diff.noteCount +
                (diff.sliderCount > 0 ? 10 : 0) +
                (diff.spinnerCount > 0 ? 5 : 0) +
                (diff.overallDifficulty * 2) // Prefer higher difficulty
        }));
        scored.sort((a, b) => b.score - a.score);
        return scored[0].diff;
    }
    /**
     * Create balanced difficulty level structure from parsed difficulties
     */
    createBalancedDifficultyLevels(difficulties) {
        if (difficulties.length === 0) {
            return { easy: 1, normal: 3, hard: 5, expert: 7 };
        }
        // Sort by overall difficulty
        const sorted = difficulties.sort((a, b) => a.overallDifficulty - b.overallDifficulty);
        // Create balanced mapping
        const minOD = sorted[0].overallDifficulty;
        const maxOD = sorted[sorted.length - 1].overallDifficulty;
        return {
            easy: Math.max(1, Math.round(minOD)),
            normal: Math.round(sorted[Math.floor(sorted.length * 0.25)]?.overallDifficulty || (minOD + 2)),
            hard: Math.round(sorted[Math.floor(sorted.length * 0.75)]?.overallDifficulty || (maxOD - 2)),
            expert: Math.min(10, Math.round(maxOD))
        };
    }
    /**
     * Create enhanced note data with proper hit object types
     */
    createEnhancedNotesFromDifficulty(content) {
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
                if (parts.length >= 4) {
                    const x = parseInt(parts[0] || '0');
                    const y = parseInt(parts[1] || '0');
                    const time = parseInt(parts[2] || '0');
                    const type = parseInt(parts[3] || '0');
                    if (!isNaN(time)) {
                        // Determine hit object type from bit flags
                        let noteType = 'tap';
                        if (type & 2) { // Slider
                            noteType = 'slider';
                        }
                        else if (type & 128) { // Hold note (mania)
                            noteType = 'hold';
                        }
                        notes.push({
                            time,
                            type: noteType,
                            position: {
                                x: x / 512, // Normalize to 0-1
                                y: y / 384 // Normalize to 0-1
                            }
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
exports.EnhancedOszParser = EnhancedOszParser;
