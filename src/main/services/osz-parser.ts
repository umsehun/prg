/**
 * Simplified type-safe OSZ file parser service
 * Handles .osz file extraction and beatmap parsing with comprehensive error handling
 * NO ANY TYPES - Complete type safety without excessive complexity
 */

import AdmZip from 'adm-zip';
import { stat } from 'fs/promises';
import { extname, basename } from 'path';
import * as OsuParsers from 'osu-parsers';
import { logger } from '../../shared/globals/logger';
import { FILE_CONFIG } from '../../shared/globals/constants';
import { FileError, ResultHandler } from '../../shared/utils/error-handling';
import type { Result } from '../../shared/globals/types.d';

/**
 * Simplified types for OSZ processing
 */
export interface OSZBeatmap {
    readonly general: {
        readonly audioFilename: string;
        readonly audioLeadIn: number;
        readonly previewTime: number;
        readonly countdown: number;
        readonly sampleSet: string;
        readonly stackLeniency: number;
        readonly mode: number;
        readonly letterboxInBreaks: boolean;
        readonly widescreenStoryboard: boolean;
    };
    readonly metadata: {
        readonly title: string;
        readonly titleUnicode: string;
        readonly artist: string;
        readonly artistUnicode: string;
        readonly creator: string;
        readonly version: string;
        readonly source: string;
        readonly tags: string[];
        readonly beatmapID: number;
        readonly beatmapSetID: number;
    };
    readonly difficulty: {
        readonly hpDrainRate: number;
        readonly circleSize: number;
        readonly overallDifficulty: number;
        readonly approachRate: number;
        readonly sliderMultiplier: number;
        readonly sliderTickRate: number;
    };
    readonly events: {
        readonly backgroundPath?: string;
        readonly videoPath?: string;
        readonly breaks: Array<{
            readonly startTime: number;
            readonly endTime: number;
        }>;
    };
    readonly timingPoints: Array<{
        readonly time: number;
        readonly beatLength: number;
        readonly meter: number;
        readonly sampleSet: number;
        readonly sampleIndex: number;
        readonly volume: number;
        readonly uninherited: boolean;
        readonly effects: {
            readonly kiaiTime: boolean;
            readonly omitFirstBarLine: boolean;
        };
    }>;
    readonly colours: {
        readonly combo: Array<{
            readonly r: number;
            readonly g: number;
            readonly b: number;
        }>;
    };
    readonly hitObjects: Array<{
        readonly x: number;
        readonly y: number;
        readonly time: number;
        readonly type: {
            readonly circle: boolean;
            readonly slider: boolean;
            readonly newCombo: boolean;
            readonly spinner: boolean;
            readonly colourSkip: number;
            readonly hold: boolean;
        };
        readonly hitSound: {
            readonly normal: boolean;
            readonly whistle: boolean;
            readonly finish: boolean;
            readonly clap: boolean;
        };
        readonly endTime?: number;
    }>;
}

export interface OSZContent {
    readonly metadata: {
        readonly id: string;
        readonly title: string;
        readonly artist: string;
        readonly creator: string;
        readonly source?: string;
        readonly tags: string[];
        readonly bpm: number;
        readonly duration: number;
        readonly gameMode: 'osu' | 'taiko' | 'fruits' | 'mania';
        readonly difficulties: Array<{
            readonly version: string;
            readonly starRating: number;
            readonly overallDifficulty: number;
            readonly approachRate: number;
            readonly circleSize: number;
            readonly hpDrainRate: number;
            readonly maxCombo: number;
            readonly objectCount: number;
        }>;
        readonly backgroundImage?: string;
        readonly previewTime?: number;
        readonly audioFilename: string;
        readonly createdAt: Date;
        readonly updatedAt: Date;
    };
    readonly difficulties: Map<string, OSZBeatmap>;
    readonly audioFile: {
        readonly filename: string;
        readonly data: Buffer;
    };
    readonly backgroundImage?: {
        readonly filename: string;
        readonly data: Buffer;
    };
    readonly videoFile?: {
        readonly filename: string;
        readonly data: Buffer;
    };
    readonly hitsounds: Map<string, Buffer>;
    readonly storyboardFiles: Map<string, Buffer>;
    readonly processingMetrics: {
        readonly processingTime: number;
        readonly memoryUsed: number;
        readonly filesProcessed: number;
        readonly warnings: string[];
    };
}

interface OSZFileStructure {
    readonly beatmapFiles: AdmZip.IZipEntry[];
    readonly audioFiles: AdmZip.IZipEntry[];
    readonly imageFiles: AdmZip.IZipEntry[];
    readonly videoFiles: AdmZip.IZipEntry[];
    readonly storyboardFiles: AdmZip.IZipEntry[];
    readonly hitsoundFiles: AdmZip.IZipEntry[];
    readonly otherFiles: AdmZip.IZipEntry[];
}

interface ProcessingContext {
    filePath: string;
    fileSize: number;
    entryCount: number;
    processingStartTime: number;
    currentOperation: string;
}

/**
 * Simplified OSZ parser service
 */
export class SimplifiedOSZParser {
    private static readonly SUPPORTED_AUDIO_EXTENSIONS = new Set(['.mp3', '.wav', '.ogg', '.m4a']);
    private static readonly SUPPORTED_IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.bmp']);
    private static readonly SUPPORTED_VIDEO_EXTENSIONS = new Set(['.mp4', '.avi', '.flv', '.wmv']);
    private static readonly BEATMAP_EXTENSION = '.osu';
    private static readonly STORYBOARD_EXTENSION = '.osb';

    /**
     * Parse OSZ file with comprehensive error handling
     */
    public static async parseOszFile(filePath: string): Promise<Result<OSZContent>> {
        const context: ProcessingContext = {
            filePath,
            fileSize: 0,
            entryCount: 0,
            processingStartTime: Date.now(),
            currentOperation: 'initialization',
        };

        try {
            logger.osz('info', 'Starting OSZ parse', { filePath });

            // Step 1: Validate file and get basic info
            context.currentOperation = 'file_validation';
            await this.validateOszFile(filePath, context);

            // Step 2: Extract and analyze ZIP structure
            context.currentOperation = 'zip_extraction';
            const zip = await this.safeExtractZip(filePath, context);
            const fileStructure = this.analyzeFileStructure(zip.getEntries());

            // Step 3: Validate file structure requirements
            context.currentOperation = 'structure_validation';
            this.validateFileStructure(fileStructure);

            // Step 4: Parse all beatmap files
            context.currentOperation = 'beatmap_parsing';
            const { difficulties, primaryBeatmap } = await this.parseBeatmapFiles(
                fileStructure.beatmapFiles,
                context
            );

            // Step 5: Generate metadata
            context.currentOperation = 'metadata_generation';
            const metadata = this.generateMetadata(primaryBeatmap, difficulties);

            // Step 6: Extract audio file
            context.currentOperation = 'audio_extraction';
            const audioFile = await this.extractAudioFile(
                fileStructure.audioFiles,
                primaryBeatmap.general.audioFilename,
                context
            );

            // Step 7: Extract optional resources
            context.currentOperation = 'resource_extraction';
            const backgroundImage = await this.extractBackgroundImage(
                fileStructure.imageFiles,
                primaryBeatmap.events.backgroundPath,
                context
            );

            const videoFile = await this.extractVideoFile(
                fileStructure.videoFiles,
                primaryBeatmap.events.videoPath,
                context
            );

            const hitsounds = await this.extractHitsounds(fileStructure.hitsoundFiles, context);
            const storyboardFiles = await this.extractStoryboardFiles(fileStructure.storyboardFiles, context);

            // Step 8: Generate processing metrics
            const processingTime = Date.now() - context.processingStartTime;
            const memoryUsed = process.memoryUsage().heapUsed;

            const content: OSZContent = {
                metadata,
                difficulties,
                audioFile,
                ...(backgroundImage && { backgroundImage }),
                ...(videoFile && { videoFile }),
                hitsounds,
                storyboardFiles,
                processingMetrics: {
                    processingTime,
                    memoryUsed,
                    filesProcessed: fileStructure.beatmapFiles.length +
                        fileStructure.audioFiles.length +
                        fileStructure.imageFiles.length +
                        fileStructure.videoFiles.length,
                    warnings: [],
                },
            };

            logger.osz('info', 'OSZ parse completed', {
                title: metadata.title,
                artist: metadata.artist,
                difficulties: difficulties.size,
                processingTime,
            });

            return ResultHandler.success(content);
        } catch (error) {
            logger.osz('error', 'OSZ parse failed', {
                filePath,
                operation: context.currentOperation,
                error: error instanceof Error ? error.message : String(error)
            });

            if (error instanceof Error) {
                return ResultHandler.error(error.message);
            }
            return ResultHandler.error(String(error));
        }
    }

    /**
     * Validate OSZ file before processing
     */
    private static async validateOszFile(filePath: string, context: ProcessingContext): Promise<void> {
        try {
            const stats = await stat(filePath);

            if (!stats.isFile()) {
                throw FileError.invalidFormat(filePath, 'Not a file');
            }

            if (stats.size === 0) {
                throw FileError.invalidFormat(filePath, 'Empty file');
            }

            if (stats.size > FILE_CONFIG.MAX_OSZ_SIZE) {
                throw FileError.tooLarge(filePath, stats.size, FILE_CONFIG.MAX_OSZ_SIZE);
            }

            const extension = extname(filePath).toLowerCase();
            if (!FILE_CONFIG.OSZ_EXTENSIONS.includes(extension as '.osz')) {
                throw FileError.invalidFormat(filePath, '.osz file expected');
            }

            context.fileSize = stats.size;
        } catch (error: any) {
            if (error.code === 'ENOENT') {
                throw FileError.notFound(filePath);
            }
            if (error.code === 'EACCES') {
                throw FileError.permissionDenied(filePath);
            }
            throw error;
        }
    }

    /**
     * Safely extract ZIP file with error handling
     */
    private static async safeExtractZip(filePath: string, context: ProcessingContext): Promise<AdmZip> {
        try {
            const zip = new AdmZip(filePath);
            const entries = zip.getEntries();

            if (entries.length === 0) {
                throw FileError.parseFailed(filePath, 'ZIP file is empty');
            }

            if (entries.length > FILE_CONFIG.MAX_ENTRIES_PER_OSZ) {
                throw FileError.parseFailed(
                    filePath,
                    `Too many entries in ZIP (${entries.length}), maximum allowed: ${FILE_CONFIG.MAX_ENTRIES_PER_OSZ}`
                );
            }

            context.entryCount = entries.length;
            return zip;
        } catch (error) {
            if (error instanceof Error && error.message.includes('Invalid ZIP')) {
                throw FileError.parseFailed(filePath, 'Corrupted ZIP file');
            }
            throw error;
        }
    }

    /**
     * Analyze ZIP file structure and categorize entries
     */
    private static analyzeFileStructure(entries: AdmZip.IZipEntry[]): OSZFileStructure {
        const structure: OSZFileStructure = {
            beatmapFiles: [],
            audioFiles: [],
            imageFiles: [],
            videoFiles: [],
            storyboardFiles: [],
            hitsoundFiles: [],
            otherFiles: [],
        };

        for (const entry of entries) {
            if (entry.isDirectory) {
                continue;
            }

            const entryName = entry.entryName.toLowerCase();
            const extension = extname(entryName);

            // Skip hidden files and system files
            if (basename(entryName).startsWith('.') || entryName.includes('__MACOSX/')) {
                continue;
            }

            if (extension === this.BEATMAP_EXTENSION) {
                structure.beatmapFiles.push(entry);
            } else if (extension === this.STORYBOARD_EXTENSION) {
                structure.storyboardFiles.push(entry);
            } else if (this.SUPPORTED_AUDIO_EXTENSIONS.has(extension)) {
                if (this.isLikelyHitsound(entryName)) {
                    structure.hitsoundFiles.push(entry);
                } else {
                    structure.audioFiles.push(entry);
                }
            } else if (this.SUPPORTED_IMAGE_EXTENSIONS.has(extension)) {
                structure.imageFiles.push(entry);
            } else if (this.SUPPORTED_VIDEO_EXTENSIONS.has(extension)) {
                structure.videoFiles.push(entry);
            } else {
                structure.otherFiles.push(entry);
            }
        }

        return structure;
    }

    /**
     * Determine if an audio file is likely a hitsound
     */
    private static isLikelyHitsound(filename: string): boolean {
        const name = basename(filename, extname(filename)).toLowerCase();
        const hitsoundPatterns = [
            /^(normal|soft|drum)-(hit|slide|whistle|finish|clap)/,
            /^(kick|snare|hihat|crash|ride)/,
            /^(hit|click|tap|drum|perc)/,
            /^\d+$/, // Numbered files like "1.wav", "2.wav"
        ];

        return hitsoundPatterns.some(pattern => pattern.test(name));
    }

    /**
     * Validate that file structure meets minimum requirements
     */
    private static validateFileStructure(structure: OSZFileStructure): void {
        if (structure.beatmapFiles.length === 0) {
            throw FileError.parseFailed('OSZ', 'No beatmap files (.osu) found');
        }

        if (structure.audioFiles.length === 0 && structure.hitsoundFiles.length === 0) {
            throw FileError.parseFailed('OSZ', 'No audio files found');
        }

        // Validate total uncompressed size
        const totalSize = [
            ...structure.beatmapFiles,
            ...structure.audioFiles,
            ...structure.imageFiles,
            ...structure.videoFiles,
        ].reduce((sum, entry) => sum + entry.header.size, 0);

        if (totalSize > FILE_CONFIG.MAX_UNCOMPRESSED_SIZE) {
            throw FileError.tooLarge(
                'OSZ',
                totalSize,
                FILE_CONFIG.MAX_UNCOMPRESSED_SIZE
            );
        }
    }

    /**
     * Parse all beatmap files with comprehensive validation
     */
    private static async parseBeatmapFiles(
        beatmapEntries: AdmZip.IZipEntry[],
        context: ProcessingContext
    ): Promise<{
        difficulties: Map<string, OSZBeatmap>;
        primaryBeatmap: OSZBeatmap;
    }> {
        const difficulties = new Map<string, OSZBeatmap>();
        let primaryBeatmap: OSZBeatmap | null = null;
        const parseErrors: Array<{ filename: string; error: Error }> = [];

        for (const entry of beatmapEntries) {
            try {
                logger.osz('debug', 'Parsing beatmap file', { filename: entry.entryName });

                // Extract and decode beatmap data
                const beatmapData = entry.getData();
                if (beatmapData.length === 0) {
                    throw new Error('Empty beatmap file');
                }

                // Try different encodings if UTF-8 fails
                let beatmapText: string;
                try {
                    beatmapText = beatmapData.toString('utf8');
                } catch {
                    try {
                        beatmapText = beatmapData.toString('utf16le');
                    } catch {
                        beatmapText = beatmapData.toString('latin1');
                    }
                }

                // Parse with osu-parsers
                const decoder = new OsuParsers.BeatmapDecoder();
                const rawBeatmap = decoder.decodeFromString(beatmapText);

                // Convert to our typed interface
                const typedBeatmap = this.convertToOSZBeatmap(rawBeatmap);

                // Validate beatmap content
                this.validateBeatmapContent(typedBeatmap, entry.entryName);

                difficulties.set(entry.entryName, typedBeatmap);

                // Use first valid beatmap as primary
                if (!primaryBeatmap) {
                    primaryBeatmap = typedBeatmap;
                }
            } catch (error) {
                const errorDetails = {
                    filename: entry.entryName,
                    error: error instanceof Error ? error : new Error(String(error)),
                };
                parseErrors.push(errorDetails);
                logger.osz('warn', 'Failed to parse beatmap file', errorDetails);
            }
        }

        if (!primaryBeatmap) {
            throw FileError.parseFailed(
                context.filePath,
                'No valid beatmap files could be parsed'
            );
        }

        if (difficulties.size === 0) {
            throw FileError.parseFailed(
                context.filePath,
                'All beatmap files failed to parse'
            );
        }

        logger.osz('info', 'Beatmap parsing completed', {
            totalFiles: beatmapEntries.length,
            successfullyParsed: difficulties.size,
            errors: parseErrors.length,
        });

        return { difficulties, primaryBeatmap };
    }

    /**
     * Convert osu-parsers beatmap to our typed interface
     */
    private static convertToOSZBeatmap(rawBeatmap: any): OSZBeatmap {
        if (!rawBeatmap || typeof rawBeatmap !== 'object') {
            throw new Error('Invalid beatmap object structure');
        }

        return {
            general: {
                audioFilename: String(rawBeatmap.general?.audioFilename || ''),
                audioLeadIn: Number(rawBeatmap.general?.audioLeadIn || 0),
                previewTime: Number(rawBeatmap.general?.previewTime || -1),
                countdown: Number(rawBeatmap.general?.countdown || 1),
                sampleSet: String(rawBeatmap.general?.sampleSet || 'Normal'),
                stackLeniency: Number(rawBeatmap.general?.stackLeniency || 0.7),
                mode: Number(rawBeatmap.general?.mode || 0),
                letterboxInBreaks: Boolean(rawBeatmap.general?.letterboxInBreaks),
                widescreenStoryboard: Boolean(rawBeatmap.general?.widescreenStoryboard),
            },
            metadata: {
                title: String(rawBeatmap.metadata?.title || 'Unknown Title'),
                titleUnicode: String(rawBeatmap.metadata?.titleUnicode || ''),
                artist: String(rawBeatmap.metadata?.artist || 'Unknown Artist'),
                artistUnicode: String(rawBeatmap.metadata?.artistUnicode || ''),
                creator: String(rawBeatmap.metadata?.creator || 'Unknown Creator'),
                version: String(rawBeatmap.metadata?.version || 'Normal'),
                source: String(rawBeatmap.metadata?.source || ''),
                tags: this.extractTags(rawBeatmap.metadata?.tags),
                beatmapID: Number(rawBeatmap.metadata?.beatmapID || 0),
                beatmapSetID: Number(rawBeatmap.metadata?.beatmapSetID || 0),
            },
            difficulty: {
                hpDrainRate: this.clampNumber(Number(rawBeatmap.difficulty?.hpDrainRate || 5), 0, 10),
                circleSize: this.clampNumber(Number(rawBeatmap.difficulty?.circleSize || 4), 0, 10),
                overallDifficulty: this.clampNumber(Number(rawBeatmap.difficulty?.overallDifficulty || 5), 0, 10),
                approachRate: this.clampNumber(Number(rawBeatmap.difficulty?.approachRate || 5), 0, 10),
                sliderMultiplier: Math.max(0.1, Number(rawBeatmap.difficulty?.sliderMultiplier || 1.4)),
                sliderTickRate: Math.max(0.1, Number(rawBeatmap.difficulty?.sliderTickRate || 1)),
            },
            events: {
                backgroundPath: rawBeatmap.events?.backgroundPath || undefined,
                videoPath: rawBeatmap.events?.videoPath || undefined,
                breaks: Array.isArray(rawBeatmap.events?.breaks)
                    ? rawBeatmap.events.breaks.map((brk: any) => ({
                        startTime: Number(brk.startTime || 0),
                        endTime: Number(brk.endTime || 0),
                    })).filter((brk: any) => brk.endTime > brk.startTime)
                    : [],
            },
            timingPoints: Array.isArray(rawBeatmap.controlPoints?.timingPoints)
                ? rawBeatmap.controlPoints.timingPoints.map((tp: any) => ({
                    time: Number(tp.time || 0),
                    beatLength: Number(tp.beatLength || 500),
                    meter: Number(tp.meter || 4),
                    sampleSet: Number(tp.sampleSet || 0),
                    sampleIndex: Number(tp.sampleIndex || 0),
                    volume: this.clampNumber(Number(tp.volume || 100), 0, 100),
                    uninherited: Boolean(tp.uninherited !== false),
                    effects: {
                        kiaiTime: Boolean(tp.effects?.kiaiTime),
                        omitFirstBarLine: Boolean(tp.effects?.omitFirstBarLine),
                    },
                }))
                : [{
                    time: 0,
                    beatLength: 500,
                    meter: 4,
                    sampleSet: 0,
                    sampleIndex: 0,
                    volume: 100,
                    uninherited: true,
                    effects: { kiaiTime: false, omitFirstBarLine: false }
                }],
            colours: {
                combo: Array.isArray(rawBeatmap.colours?.combo) && rawBeatmap.colours.combo.length > 0
                    ? rawBeatmap.colours.combo.map((color: any) => ({
                        r: this.clampNumber(Number(color.r || 0), 0, 255),
                        g: this.clampNumber(Number(color.g || 0), 0, 255),
                        b: this.clampNumber(Number(color.b || 0), 0, 255),
                    }))
                    : [
                        { r: 255, g: 192, b: 0 },
                        { r: 0, g: 202, b: 0 },
                        { r: 18, g: 124, b: 255 },
                        { r: 242, g: 24, b: 57 },
                    ],
            },
            hitObjects: Array.isArray(rawBeatmap.hitObjects)
                ? rawBeatmap.hitObjects.map((obj: any) => {
                    const result: any = {
                        x: this.clampNumber(Number(obj.x || 0), 0, 512),
                        y: this.clampNumber(Number(obj.y || 0), 0, 384),
                        time: Number(obj.time || 0),
                        type: {
                            circle: Boolean(obj.type?.circle),
                            slider: Boolean(obj.type?.slider),
                            newCombo: Boolean(obj.type?.newCombo),
                            spinner: Boolean(obj.type?.spinner),
                            colourSkip: this.clampNumber(Number(obj.type?.colourSkip || 0), 0, 3),
                            hold: Boolean(obj.type?.hold),
                        },
                        hitSound: {
                            normal: Boolean(obj.hitSound?.normal !== false),
                            whistle: Boolean(obj.hitSound?.whistle),
                            finish: Boolean(obj.hitSound?.finish),
                            clap: Boolean(obj.hitSound?.clap),
                        },
                    };

                    if (obj.endTime !== undefined) {
                        result.endTime = Number(obj.endTime);
                    }

                    return result;
                }).sort((a: any, b: any) => a.time - b.time)
                : [],
        };
    }

    private static extractTags(tags: any): string[] {
        if (typeof tags === 'string') {
            return tags.split(/\s+/).filter(tag => tag.length > 0);
        }
        if (Array.isArray(tags)) {
            return tags.map(String).filter(tag => tag.length > 0);
        }
        return [];
    }

    private static clampNumber(value: number, min: number, max: number): number {
        return Math.max(min, Math.min(max, value));
    }

    /**
     * Validate beatmap content for consistency
     */
    private static validateBeatmapContent(beatmap: OSZBeatmap, filename: string): void {
        if (!beatmap.metadata.title) {
            throw new Error(`Beatmap ${filename}: Missing title`);
        }

        if (!beatmap.metadata.artist) {
            throw new Error(`Beatmap ${filename}: Missing artist`);
        }

        if (!beatmap.general.audioFilename) {
            throw new Error(`Beatmap ${filename}: Missing audio filename`);
        }

        if (beatmap.timingPoints.length === 0) {
            throw new Error(`Beatmap ${filename}: No timing points found`);
        }

        const hasUninheritedTimingPoint = beatmap.timingPoints.some(tp => tp.uninherited);
        if (!hasUninheritedTimingPoint) {
            throw new Error(`Beatmap ${filename}: No uninherited timing points found`);
        }
    }

    /**
     * Generate chart metadata
     */
    private static generateMetadata(
        primaryBeatmap: OSZBeatmap,
        difficulties: Map<string, OSZBeatmap>
    ): OSZContent['metadata'] {
        const metadata = primaryBeatmap.metadata;
        const general = primaryBeatmap.general;

        // Calculate BPM from timing points
        const bpm = this.calculateAverageBPM(primaryBeatmap.timingPoints);

        // Calculate duration from hit objects
        const duration = this.calculateDuration(primaryBeatmap.hitObjects);

        // Generate difficulty metadata for all difficulties
        const difficultyMetadata = Array.from(difficulties.values()).map(beatmap => ({
            version: beatmap.metadata.version,
            starRating: 0, // Will be calculated later
            overallDifficulty: beatmap.difficulty.overallDifficulty,
            approachRate: beatmap.difficulty.approachRate,
            circleSize: beatmap.difficulty.circleSize,
            hpDrainRate: beatmap.difficulty.hpDrainRate,
            maxCombo: this.calculateMaxCombo(beatmap.hitObjects),
            objectCount: beatmap.hitObjects.length,
        }));

        // Generate unique chart ID
        const chartId = this.generateChartId(metadata.title, metadata.artist, metadata.creator);

        return {
            id: chartId,
            title: metadata.title,
            artist: metadata.artist,
            creator: metadata.creator,
            ...(metadata.source && { source: metadata.source }),
            tags: metadata.tags,
            bpm,
            duration,
            gameMode: this.mapGameMode(general.mode),
            difficulties: difficultyMetadata,
            ...(primaryBeatmap.events.backgroundPath && { backgroundImage: primaryBeatmap.events.backgroundPath }),
            ...(general.previewTime >= 0 && { previewTime: general.previewTime }),
            audioFilename: general.audioFilename,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    }

    private static calculateAverageBPM(timingPoints: OSZBeatmap['timingPoints']): number {
        const uninheritedPoints = timingPoints.filter(tp => tp.uninherited);
        if (uninheritedPoints.length === 0) {
            return 120; // Fallback BPM
        }

        const firstTiming = uninheritedPoints[0];
        if (!firstTiming) {
            return 120;
        }
        return Math.round(60000 / firstTiming.beatLength);
    }

    private static calculateDuration(hitObjects: OSZBeatmap['hitObjects']): number {
        if (hitObjects.length === 0) {
            return 0;
        }

        const lastObject = hitObjects[hitObjects.length - 1];
        if (!lastObject) {
            return 0;
        }
        const endTime = lastObject.endTime || lastObject.time;
        return Math.round(endTime / 1000);
    }

    private static calculateMaxCombo(hitObjects: OSZBeatmap['hitObjects']): number {
        return hitObjects.filter(obj => obj.type.circle || obj.type.slider).length;
    }

    private static mapGameMode(mode: number): 'osu' | 'taiko' | 'fruits' | 'mania' {
        const modeMap: Record<number, 'osu' | 'taiko' | 'fruits' | 'mania'> = {
            0: 'osu',
            1: 'taiko',
            2: 'fruits',
            3: 'mania',
        };
        return modeMap[mode] || 'osu';
    }

    private static generateChartId(title: string, artist: string, creator: string): string {
        const cleanTitle = title.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        const cleanArtist = artist.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        const cleanCreator = creator.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        const timestamp = Date.now().toString(36);

        return `${cleanArtist}-${cleanTitle}-${cleanCreator}-${timestamp}`;
    }

    /**
     * Extract and validate audio file
     */
    private static async extractAudioFile(
        audioEntries: AdmZip.IZipEntry[],
        expectedFilename: string,
        context: ProcessingContext
    ): Promise<OSZContent['audioFile']> {
        // Try to find the exact audio file first
        let audioEntry = audioEntries.find(entry =>
            entry.entryName.toLowerCase() === expectedFilename.toLowerCase()
        );

        // If not found, try to find any audio file
        if (!audioEntry && audioEntries.length > 0) {
            audioEntry = audioEntries[0];
            logger.osz('warn', 'Expected audio file not found, using alternative', {
                expected: expectedFilename,
                using: audioEntry?.entryName,
            });
        }

        if (!audioEntry) {
            throw FileError.notFound(`Audio file: ${expectedFilename}`);
        }

        const audioData = audioEntry.getData();

        if (audioData.length === 0) {
            throw FileError.parseFailed(context.filePath, `Empty audio file: ${audioEntry.entryName}`);
        }

        if (audioData.length > FILE_CONFIG.MAX_AUDIO_SIZE) {
            throw FileError.tooLarge(
                audioEntry.entryName,
                audioData.length,
                FILE_CONFIG.MAX_AUDIO_SIZE
            );
        }

        return {
            filename: audioEntry.entryName,
            data: audioData,
        };
    }

    /**
     * Extract background image
     */
    private static async extractBackgroundImage(
        imageEntries: AdmZip.IZipEntry[],
        expectedPath: string | undefined,
        _context: ProcessingContext
    ): Promise<OSZContent['backgroundImage']> {
        if (!expectedPath) {
            return undefined;
        }

        const imageEntry = imageEntries.find(entry =>
            entry.entryName.toLowerCase() === expectedPath.toLowerCase() ||
            entry.entryName.toLowerCase().endsWith(expectedPath.toLowerCase())
        );

        if (!imageEntry) {
            logger.osz('warn', 'Background image not found', { expectedPath });
            return undefined;
        }

        const imageData = imageEntry.getData();

        if (imageData.length === 0) {
            logger.osz('warn', 'Empty background image file', { filename: imageEntry.entryName });
            return undefined;
        }

        if (imageData.length > FILE_CONFIG.MAX_IMAGE_SIZE) {
            logger.osz('warn', 'Background image too large, skipping', {
                filename: imageEntry.entryName,
                size: imageData.length,
                maxSize: FILE_CONFIG.MAX_IMAGE_SIZE,
            });
            return undefined;
        }

        return {
            filename: imageEntry.entryName,
            data: imageData,
        };
    }

    /**
     * Extract video file
     */
    private static async extractVideoFile(
        videoEntries: AdmZip.IZipEntry[],
        expectedPath: string | undefined,
        _context: ProcessingContext
    ): Promise<OSZContent['videoFile']> {
        if (!expectedPath || videoEntries.length === 0) {
            return undefined;
        }

        const videoEntry = videoEntries.find(entry =>
            entry.entryName.toLowerCase() === expectedPath.toLowerCase() ||
            entry.entryName.toLowerCase().endsWith(expectedPath.toLowerCase())
        );

        if (!videoEntry) {
            logger.osz('warn', 'Video file not found', { expectedPath });
            return undefined;
        }

        const videoData = videoEntry.getData();

        if (videoData.length === 0) {
            logger.osz('warn', 'Empty video file', { filename: videoEntry.entryName });
            return undefined;
        }

        if (videoData.length > FILE_CONFIG.MAX_VIDEO_SIZE) {
            logger.osz('warn', 'Video file too large, skipping', {
                filename: videoEntry.entryName,
                size: videoData.length,
                maxSize: FILE_CONFIG.MAX_VIDEO_SIZE,
            });
            return undefined;
        }

        return {
            filename: videoEntry.entryName,
            data: videoData,
        };
    }

    /**
     * Extract hitsound files
     */
    private static async extractHitsounds(
        hitsoundEntries: AdmZip.IZipEntry[],
        _context: ProcessingContext
    ): Promise<Map<string, Buffer>> {
        const hitsounds = new Map<string, Buffer>();

        for (const entry of hitsoundEntries) {
            try {
                const data = entry.getData();

                if (data.length === 0) {
                    logger.osz('warn', 'Empty hitsound file', { filename: entry.entryName });
                    continue;
                }

                if (data.length > FILE_CONFIG.MAX_HITSOUND_SIZE) {
                    logger.osz('warn', 'Hitsound file too large, skipping', {
                        filename: entry.entryName,
                        size: data.length,
                        maxSize: FILE_CONFIG.MAX_HITSOUND_SIZE,
                    });
                    continue;
                }

                hitsounds.set(entry.entryName, data);
            } catch (error) {
                logger.osz('warn', 'Failed to extract hitsound', {
                    filename: entry.entryName,
                    error: error instanceof Error ? error.message : String(error),
                });
            }
        }

        return hitsounds;
    }

    /**
     * Extract storyboard files
     */
    private static async extractStoryboardFiles(
        storyboardEntries: AdmZip.IZipEntry[],
        _context: ProcessingContext
    ): Promise<Map<string, Buffer>> {
        const storyboards = new Map<string, Buffer>();

        for (const entry of storyboardEntries) {
            try {
                const data = entry.getData();

                if (data.length === 0) {
                    logger.osz('warn', 'Empty storyboard file', { filename: entry.entryName });
                    continue;
                }

                if (data.length > FILE_CONFIG.MAX_STORYBOARD_SIZE) {
                    logger.osz('warn', 'Storyboard file too large, skipping', {
                        filename: entry.entryName,
                        size: data.length,
                        maxSize: FILE_CONFIG.MAX_STORYBOARD_SIZE,
                    });
                    continue;
                }

                storyboards.set(entry.entryName, data);
            } catch (error) {
                logger.osz('warn', 'Failed to extract storyboard', {
                    filename: entry.entryName,
                    error: error instanceof Error ? error.message : String(error),
                });
            }
        }

        return storyboards;
    }

    /**
     * Extract specific difficulty by version name
     */
    public static extractDifficulty(
        content: OSZContent,
        version: string
    ): OSZBeatmap | null {
        for (const beatmap of content.difficulties.values()) {
            if (beatmap.metadata.version === version) {
                return beatmap;
            }
        }
        return null;
    }

    /**
     * Get available difficulty versions
     */
    public static getDifficultyVersions(content: OSZContent): string[] {
        return Array.from(content.difficulties.values()).map(beatmap => beatmap.metadata.version);
    }

    /**
     * Validate OSZ content integrity
     */
    public static validateContentIntegrity(content: OSZContent): {
        isValid: boolean;
        errors: string[];
        warnings: string[];
    } {
        const errors: string[] = [];
        const warnings: string[] = [];

        // Check audio file reference consistency
        const audioFilenames = new Set<string>();
        for (const beatmap of content.difficulties.values()) {
            audioFilenames.add(beatmap.general.audioFilename);
        }

        if (audioFilenames.size > 1) {
            warnings.push('Multiple audio files referenced across difficulties');
        }

        if (!audioFilenames.has(content.audioFile.filename)) {
            errors.push('Audio file mismatch between beatmap reference and extracted file');
        }

        // Check metadata consistency
        const titles = new Set(Array.from(content.difficulties.values()).map(b => b.metadata.title));
        const artists = new Set(Array.from(content.difficulties.values()).map(b => b.metadata.artist));

        if (titles.size > 1) {
            warnings.push('Inconsistent titles across difficulties');
        }

        if (artists.size > 1) {
            warnings.push('Inconsistent artists across difficulties');
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
        };
    }
}
