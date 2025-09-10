/**
 * Advanced OSZ Parser - Complete implementation with proper .osu file parsing
 * Extracts real BPM, duration, and difficulty data from .osu beatmap files
 * Based on official osu! file format specification
 */

import { promises as fs } from 'fs';
import { join, extname, basename } from 'path';
import * as yauzl from 'yauzl';
import { logger } from '../../shared/globals/logger';
import type { SongData, NoteData } from '../../shared/d.ts/ipc';

export interface TimingPoint {
    time: number;           // Start time in milliseconds
    beatLength: number;     // Milliseconds per beat (if positive) or SV multiplier (if negative)
    meter: number;          // Time signature numerator
    sampleSet: number;      // Sample set
    sampleIndex: number;    // Sample index
    volume: number;         // Volume (0-100)
    uninherited: boolean;   // True for uninherited (red) timing points
    effects: number;        // Effects flags
}

export interface DifficultyData {
    hpDrainRate: number;        // HP Drain (0-10)
    circleSize: number;         // Circle Size (0-10)
    overallDifficulty: number;  // Overall Difficulty (0-10)
    approachRate: number;       // Approach Rate (0-10)
    sliderMultiplier: number;   // Slider Multiplier
    sliderTickRate: number;     // Slider Tick Rate
}

export interface MetadataSection {
    title: string;
    titleUnicode: string;
    artist: string;
    artistUnicode: string;
    creator: string;
    version: string;
    source: string;
    tags: string[];
    beatmapId: number;
    beatmapSetId: number;
}

export interface GeneralSection {
    audioFilename: string;
    audioLeadIn: number;
    audioHash: string;
    previewTime: number;
    countdown: number;
    sampleSet: string;
    stackLeniency: number;
    mode: number;
    letterboxInBreaks: boolean;
    storyFireInFront: boolean;
    useSkinSprites: boolean;
    alwaysShowPlayfield: boolean;
    overlayPosition: string;
    skinPreference: string;
    epilepsyWarning: boolean;
    countdownOffset: number;
    specialStyle: boolean;
    widescreenStoryboard: boolean;
    samplesMatchPlaybackRate: boolean;
}

export class AdvancedOszParser {

    /**
     * Extract and parse an OSZ file with complete .osu parsing
     */
    public async parseOszFile(oszPath: string, outputDir: string): Promise<SongData | null> {
        try {
            logger.info('advanced-osz', `🎵 Parsing OSZ file: ${basename(oszPath)}`);

            // Create output directory
            await fs.mkdir(outputDir, { recursive: true });

            return new Promise((resolve, reject) => {
                yauzl.open(oszPath, { lazyEntries: true }, (err, zipfile) => {
                    if (err) {
                        logger.error('advanced-osz', `Failed to open OSZ: ${err}`);
                        reject(err);
                        return;
                    }

                    if (!zipfile) {
                        reject(new Error('Failed to open zipfile'));
                        return;
                    }

                    let songData: Partial<SongData> = {
                        id: this.generateId(oszPath),
                        filePath: outputDir,
                        notes: []
                    };

                    let osuFileContent = '';
                    const extractedFiles: string[] = [];

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
                            logger.debug('advanced-osz', `Found .osu file: ${fileName}`);

                            zipfile.openReadStream(entry, (streamErr, readStream) => {
                                if (streamErr || !readStream) {
                                    logger.error('advanced-osz', `Failed to read .osu file: ${streamErr}`);
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
                                    logger.error('advanced-osz', `Error reading .osu content: ${readErr}`);
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

                            const outputPath = join(outputDir, fileName);
                            const writeStream = require('fs').createWriteStream(outputPath);

                            readStream.pipe(writeStream);

                            writeStream.on('finish', () => {
                                extractedFiles.push(fileName);

                                // Track important files
                                const ext = extname(fileName).toLowerCase();
                                if (['.mp3', '.wav', '.ogg', '.m4a'].includes(ext)) {
                                    songData.audioFile = fileName;
                                } else if (['.jpg', '.jpeg', '.png', '.bmp'].includes(ext)) {
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
                                logger.info('advanced-osz', `🔍 Parsing .osu file content (${osuFileContent.length} characters)`);
                                const parsedData = this.parseOsuContent(osuFileContent);
                                songData = { ...songData, ...parsedData };
                            }

                            // Validate required fields
                            if (!songData.title || !songData.artist) {
                                logger.warn('advanced-osz', 'Missing required song metadata');
                                resolve(null);
                                return;
                            }

                            const finalSongData: SongData = {
                                id: songData.id!,
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
                                const chartDataPath = join(outputDir, 'chart.json');
                                await fs.writeFile(chartDataPath, JSON.stringify(finalSongData, null, 2));
                                logger.debug('advanced-osz', `💾 Saved chart data: ${chartDataPath}`);
                            } catch (saveError) {
                                logger.error('advanced-osz', `Failed to save chart data: ${saveError}`);
                            }

                            logger.info('advanced-osz', `✅ Successfully parsed: "${finalSongData.title}" by ${finalSongData.artist}`);
                            logger.info('advanced-osz', `📊 BPM: ${finalSongData.bpm}, Duration: ${Math.round(finalSongData.duration / 1000)}s, Notes: ${finalSongData.notes?.length || 0}`);
                            resolve(finalSongData);
                        } catch (parseError) {
                            logger.error('advanced-osz', `Error finalizing song data: ${parseError}`);
                            resolve(null);
                        }
                    });

                    zipfile.on('error', (zipErr) => {
                        logger.error('advanced-osz', `ZIP file error: ${zipErr}`);
                        reject(zipErr);
                    });
                });
            });

        } catch (error) {
            logger.error('advanced-osz', `Failed to parse OSZ file ${oszPath}: ${error}`);
            return null;
        }
    }

    /**
     * Parse .osu file content with complete section parsing
     */
    private parseOsuContent(content: string): Partial<SongData> {
        const lines = content.split('\n').map(line => line.trim());

        let currentSection = '';
        let metadata: Partial<MetadataSection> = {};
        let general: Partial<GeneralSection> = {};
        let difficulty: Partial<DifficultyData> = {};
        let timingPoints: TimingPoint[] = [];
        let hitObjects: any[] = [];

        logger.debug('advanced-osz', `📖 Parsing .osu content with ${lines.length} lines`);

        for (const line of lines) {
            if (!line || line.startsWith('//')) continue;

            // Section headers
            if (line.startsWith('[') && line.endsWith(']')) {
                currentSection = line.slice(1, -1);
                logger.debug('advanced-osz', `📋 Section: ${currentSection}`);
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

        logger.info('advanced-osz', `🎯 Parsed results: BPM=${result.bpm}, Duration=${Math.round(result.duration / 1000)}s, TimingPoints=${timingPoints.length}, HitObjects=${hitObjects.length}`);

        return result;
    }

    /**
     * Parse metadata section lines
     */
    private parseMetadataLine(line: string, metadata: Partial<MetadataSection>): void {
        const colonIndex = line.indexOf(':');
        if (colonIndex === -1) return;

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
    private parseGeneralLine(line: string, general: Partial<GeneralSection>): void {
        const colonIndex = line.indexOf(':');
        if (colonIndex === -1) return;

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
    private parseDifficultyLine(line: string, difficulty: Partial<DifficultyData>): void {
        const colonIndex = line.indexOf(':');
        if (colonIndex === -1) return;

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
    private parseTimingPointLine(line: string, timingPoints: TimingPoint[]): void {
        const parts = line.split(',');
        if (parts.length < 2) return;

        const time = parseFloat(parts[0] || '0');
        const beatLength = parseFloat(parts[1] || '0');

        // Skip invalid timing points
        if (isNaN(time) || isNaN(beatLength)) return;

        const timingPoint: TimingPoint = {
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
            logger.debug('advanced-osz', `⏱️  Uninherited timing point: ${time}ms, beatLength: ${beatLength}ms`);
        }
    }

    /**
     * Parse hit object lines
     */
    private parseHitObjectLine(line: string, hitObjects: any[]): void {
        const parts = line.split(',');
        if (parts.length < 4) return;

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
    private calculateBPM(timingPoints: TimingPoint[]): number {
        const uninheritedPoints = timingPoints.filter(tp => tp.uninherited && tp.beatLength > 0);

        if (uninheritedPoints.length === 0) {
            logger.warn('advanced-osz', '⚠️ No valid uninherited timing points found, using default BPM 120');
            return 120;
        }

        // Calculate BPM using the official formula: BPM = 60,000 / millisecondsPerBeat
        const bpmValues = uninheritedPoints.map(tp => 60000 / tp.beatLength);
        const averageBpm = bpmValues.reduce((sum, bpm) => sum + bpm, 0) / bpmValues.length;

        logger.info('advanced-osz', `🎵 Calculated BPM: ${Math.round(averageBpm)} (from ${uninheritedPoints.length} timing points)`);

        return Math.round(averageBpm);
    }

    /**
     * Calculate song duration from hit objects
     */
    private calculateDuration(hitObjects: any[]): number {
        if (hitObjects.length === 0) {
            logger.warn('advanced-osz', '⚠️ No hit objects found, using default duration');
            return 180000; // 3 minutes default
        }

        const lastObjectTime = Math.max(...hitObjects.map(obj => obj.time));
        const duration = lastObjectTime + 5000; // Add 5 seconds buffer

        logger.info('advanced-osz', `⏳ Calculated duration: ${Math.round(duration / 1000)}s (from ${hitObjects.length} hit objects)`);

        return duration;
    }

    /**
     * Calculate difficulty levels based on actual difficulty data
     */
    private calculateDifficultyLevels(difficulty: Partial<DifficultyData>, _noteCount: number): SongData['difficulty'] {
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
    private convertHitObjectsToNotes(hitObjects: any[]): NoteData[] {
        return hitObjects.map(obj => ({
            time: obj.time,
            type: 'tap' as const
        }));
    }

    /**
     * Generate unique ID from file path
     */
    private generateId(filePath: string): string {
        const name = basename(filePath, '.osz');
        return name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    }
}
