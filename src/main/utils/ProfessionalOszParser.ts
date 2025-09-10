/**
 * Professional OSZ Parser using osu-parsers library
 * Complete support for multiple .osu files with proper difficulty handling
 * Based on official osu!lazer source code
 */

import { promises as fs } from 'fs';
import { join, extname, basename } from 'path';
import * as yauzl from 'yauzl';
import { BeatmapDecoder } from 'osu-parsers';
import type { Beatmap } from 'osu-classes';
import { logger } from '../../shared/globals/logger';
import type { SongData, NoteData } from '../../shared/d.ts/ipc';

export interface DifficultyInfo {
    name: string;                    // Version from [Metadata]
    overallDifficulty: number;       // OD
    approachRate: number;            // AR  
    circleSize: number;              // CS
    hpDrainRate: number;             // HP
    starRating?: number;             // Calculated if available
    noteCount: number;               // Total hit objects
    bpm: number;                     // Calculated BPM
    duration: number;                // Duration in milliseconds
}

export interface CompleteSongData extends SongData {
    difficulties: DifficultyInfo[];  // All parsed difficulties
    preferredDifficulty: string;     // Which difficulty to use as default
}

export class ProfessionalOszParser {
    private decoder: BeatmapDecoder;

    constructor() {
        this.decoder = new BeatmapDecoder();
    }

    /**
     * Parse OSZ file with complete multi-difficulty support
     */
    public async parseOszFile(oszPath: string, outputDir: string): Promise<CompleteSongData | null> {
        try {
            logger.info('professional-osz', `🎵 Parsing OSZ with professional parser: ${basename(oszPath)}`);

            // Create output directory
            await fs.mkdir(outputDir, { recursive: true });

            return new Promise((resolve, reject) => {
                yauzl.open(oszPath, { lazyEntries: true }, (err, zipfile) => {
                    if (err || !zipfile) {
                        logger.error('professional-osz', `Failed to open OSZ: ${err}`);
                        reject(err);
                        return;
                    }

                    const osuFiles: { name: string; content: string }[] = [];
                    let commonMetadata: any = {};
                    let audioFile = '';
                    let backgroundImage = '';
                    const extractedFiles: string[] = [];

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
                            logger.debug('professional-osz', `📋 Found .osu file: ${fileName}`);

                            zipfile.openReadStream(entry, (streamErr, readStream) => {
                                if (streamErr || !readStream) {
                                    logger.error('professional-osz', `Failed to read .osu file: ${streamErr}`);
                                    zipfile.readEntry();
                                    return;
                                }

                                let content = '';
                                readStream.on('data', (chunk) => {
                                    content += chunk.toString('utf8');
                                });

                                readStream.on('end', () => {
                                    osuFiles.push({ name: fileName, content });
                                    logger.debug('professional-osz', `✅ Loaded .osu: ${fileName} (${content.length} chars)`);
                                    zipfile.readEntry();
                                });

                                readStream.on('error', (readErr) => {
                                    logger.error('professional-osz', `Error reading .osu content: ${readErr}`);
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

                            const outputPath = join(outputDir, fileName);
                            const writeStream = require('fs').createWriteStream(outputPath);

                            readStream.pipe(writeStream);

                            writeStream.on('finish', () => {
                                extractedFiles.push(fileName);

                                // Track important files
                                const ext = extname(fileName).toLowerCase();
                                if (['.mp3', '.wav', '.ogg', '.m4a'].includes(ext)) {
                                    audioFile = fileName;
                                } else if (['.jpg', '.jpeg', '.png', '.bmp'].includes(ext)) {
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
                                logger.warn('professional-osz', 'No .osu files found in OSZ');
                                resolve(null);
                                return;
                            }

                            logger.info('professional-osz', `🔍 Processing ${osuFiles.length} .osu files`);

                            // Parse all .osu files using professional parser
                            const difficulties: DifficultyInfo[] = [];
                            let commonTitle = '';
                            let commonArtist = '';

                            for (const osuFile of osuFiles) {
                                try {
                                    logger.debug('professional-osz', `📊 Parsing difficulty: ${osuFile.name}`);

                                    // Use professional osu-parsers library
                                    const beatmap: Beatmap = this.decoder.decodeFromString(osuFile.content);

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
                                    const difficulty: DifficultyInfo = {
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

                                    logger.info('professional-osz',
                                        `✅ Parsed "${difficulty.name}": ` +
                                        `OD=${difficulty.overallDifficulty}, ` +
                                        `AR=${difficulty.approachRate}, ` +
                                        `BPM=${bpm}, ` +
                                        `Notes=${difficulty.noteCount}`
                                    );

                                } catch (parseError) {
                                    logger.error('professional-osz', `Failed to parse ${osuFile.name}: ${parseError}`);
                                }
                            }

                            if (difficulties.length === 0) {
                                logger.warn('professional-osz', 'No difficulties successfully parsed');
                                resolve(null);
                                return;
                            }

                            // Select preferred difficulty (usually hardest or most complete)
                            const preferredDiff = this.selectPreferredDifficulty(difficulties);

                            // Create final song data
                            const finalSongData: CompleteSongData = {
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
                                const chartDataPath = join(outputDir, 'chart.json');
                                await fs.writeFile(chartDataPath, JSON.stringify(finalSongData, null, 2));
                                logger.debug('professional-osz', `💾 Saved complete chart data: ${chartDataPath}`);
                            } catch (saveError) {
                                logger.error('professional-osz', `Failed to save chart data: ${saveError}`);
                            }

                            logger.info('professional-osz',
                                `🎉 Successfully parsed "${commonTitle}" by ${commonArtist}` +
                                `\n   📊 ${difficulties.length} difficulties: ${difficulties.map(d => d.name).join(', ')}` +
                                `\n   🎵 BPM: ${finalSongData.bpm}, Duration: ${Math.round(finalSongData.duration / 1000)}s` +
                                `\n   ⭐ Preferred: ${preferredDiff.name} (${preferredDiff.noteCount} notes)`
                            );

                            resolve(finalSongData);

                        } catch (error) {
                            logger.error('professional-osz', `Error processing .osu files: ${error}`);
                            resolve(null);
                        }
                    });

                    zipfile.on('error', (zipErr) => {
                        logger.error('professional-osz', `ZIP file error: ${zipErr}`);
                        reject(zipErr);
                    });
                });
            });

        } catch (error) {
            logger.error('professional-osz', `Failed to parse OSZ file ${oszPath}: ${error}`);
            return null;
        }
    }

    /**
     * Calculate BPM from beatmap timing points
     */
    private calculateBPMFromBeatmap(beatmap: Beatmap): number {
        const timingPoints = beatmap.controlPoints.timingPoints;

        if (timingPoints.length === 0) {
            logger.warn('professional-osz', 'No timing points found, using default BPM');
            return 120;
        }

        // Get BPM from first timing point (most common approach)
        const firstTiming = timingPoints[0];
        if (!firstTiming) {
            logger.warn('professional-osz', 'Invalid timing point, using default BPM');
            return 120;
        }

        const bpm = 60000 / firstTiming.beatLength;

        return Math.round(bpm);
    }

    /**
     * Calculate duration from beatmap hit objects
     */
    private calculateDurationFromBeatmap(beatmap: Beatmap): number {
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
    private selectPreferredDifficulty(difficulties: DifficultyInfo[]): DifficultyInfo {
        if (difficulties.length === 0) {
            throw new Error('No difficulties available');
        }

        // Sort by note count (more complete charts preferred)
        const sorted = difficulties.sort((a, b) => b.noteCount - a.noteCount);
        return sorted[0]!;
    }

    /**
     * Create our difficulty level structure from parsed difficulties
     */
    private createDifficultyLevels(difficulties: DifficultyInfo[]): SongData['difficulty'] {
        if (difficulties.length === 0) {
            return { easy: 1, normal: 3, hard: 5, expert: 7 };
        }

        // Find representative difficulties for each level
        const sorted = difficulties.sort((a, b) => a.overallDifficulty - b.overallDifficulty);

        return {
            easy: sorted.length > 0 ? Math.round(sorted[0]!.overallDifficulty) : 1,
            normal: sorted.length > 1 ? Math.round(sorted[Math.floor(sorted.length * 0.33)]!.overallDifficulty) : 3,
            hard: sorted.length > 2 ? Math.round(sorted[Math.floor(sorted.length * 0.66)]!.overallDifficulty) : 5,
            expert: sorted.length > 0 ? Math.round(sorted[sorted.length - 1]!.overallDifficulty) : 7
        };
    }

    /**
     * Create note data from .osu content (simplified for now)
     */
    private createNotesFromDifficulty(content: string): NoteData[] {
        const lines = content.split('\n');
        let inHitObjects = false;
        const notes: NoteData[] = [];

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
    private generateId(filePath: string): string {
        const name = basename(filePath, '.osz');
        return name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    }
}
