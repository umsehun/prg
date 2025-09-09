"use strict";
/**
 * Simplified type-safe OSZ file parser service
 * Handles .osz file extraction and beatmap parsing with comprehensive error handling
 * NO ANY TYPES - Complete type safety without excessive complexity
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimplifiedOSZParser = void 0;
const adm_zip_1 = __importDefault(require("adm-zip"));
const promises_1 = require("fs/promises");
const path_1 = require("path");
const OsuParsers = __importStar(require("osu-parsers"));
const logger_1 = require("../../shared/globals/logger");
const constants_1 = require("../../shared/globals/constants");
const error_handling_1 = require("../../shared/utils/error-handling");
/**
 * Simplified OSZ parser service
 */
class SimplifiedOSZParser {
    /**
     * Parse OSZ file with comprehensive error handling
     */
    static async parseOszFile(filePath) {
        const context = {
            filePath,
            fileSize: 0,
            entryCount: 0,
            processingStartTime: Date.now(),
            currentOperation: 'initialization',
        };
        try {
            logger_1.logger.osz('info', 'Starting OSZ parse', { filePath });
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
            const { difficulties, primaryBeatmap } = await this.parseBeatmapFiles(fileStructure.beatmapFiles, context);
            // Step 5: Generate metadata
            context.currentOperation = 'metadata_generation';
            const metadata = this.generateMetadata(primaryBeatmap, difficulties);
            // Step 6: Extract audio file
            context.currentOperation = 'audio_extraction';
            const audioFile = await this.extractAudioFile(fileStructure.audioFiles, primaryBeatmap.general.audioFilename, context);
            // Step 7: Extract optional resources
            context.currentOperation = 'resource_extraction';
            const backgroundImage = await this.extractBackgroundImage(fileStructure.imageFiles, primaryBeatmap.events.backgroundPath, context);
            const videoFile = await this.extractVideoFile(fileStructure.videoFiles, primaryBeatmap.events.videoPath, context);
            const hitsounds = await this.extractHitsounds(fileStructure.hitsoundFiles, context);
            const storyboardFiles = await this.extractStoryboardFiles(fileStructure.storyboardFiles, context);
            // Step 8: Generate processing metrics
            const processingTime = Date.now() - context.processingStartTime;
            const memoryUsed = process.memoryUsage().heapUsed;
            const content = {
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
            logger_1.logger.osz('info', 'OSZ parse completed', {
                title: metadata.title,
                artist: metadata.artist,
                difficulties: difficulties.size,
                processingTime,
            });
            return error_handling_1.ResultHandler.success(content);
        }
        catch (error) {
            logger_1.logger.osz('error', 'OSZ parse failed', {
                filePath,
                operation: context.currentOperation,
                error: error instanceof Error ? error.message : String(error)
            });
            if (error instanceof Error) {
                return error_handling_1.ResultHandler.error(error.message);
            }
            return error_handling_1.ResultHandler.error(String(error));
        }
    }
    /**
     * Validate OSZ file before processing
     */
    static async validateOszFile(filePath, context) {
        try {
            const stats = await (0, promises_1.stat)(filePath);
            if (!stats.isFile()) {
                throw error_handling_1.FileError.invalidFormat(filePath, 'Not a file');
            }
            if (stats.size === 0) {
                throw error_handling_1.FileError.invalidFormat(filePath, 'Empty file');
            }
            if (stats.size > constants_1.FILE_CONFIG.MAX_OSZ_SIZE) {
                throw error_handling_1.FileError.tooLarge(filePath, stats.size, constants_1.FILE_CONFIG.MAX_OSZ_SIZE);
            }
            const extension = (0, path_1.extname)(filePath).toLowerCase();
            if (!constants_1.FILE_CONFIG.OSZ_EXTENSIONS.includes(extension)) {
                throw error_handling_1.FileError.invalidFormat(filePath, '.osz file expected');
            }
            context.fileSize = stats.size;
        }
        catch (error) {
            if (error.code === 'ENOENT') {
                throw error_handling_1.FileError.notFound(filePath);
            }
            if (error.code === 'EACCES') {
                throw error_handling_1.FileError.permissionDenied(filePath);
            }
            throw error;
        }
    }
    /**
     * Safely extract ZIP file with error handling
     */
    static async safeExtractZip(filePath, context) {
        try {
            const zip = new adm_zip_1.default(filePath);
            const entries = zip.getEntries();
            if (entries.length === 0) {
                throw error_handling_1.FileError.parseFailed(filePath, 'ZIP file is empty');
            }
            if (entries.length > constants_1.FILE_CONFIG.MAX_ENTRIES_PER_OSZ) {
                throw error_handling_1.FileError.parseFailed(filePath, `Too many entries in ZIP (${entries.length}), maximum allowed: ${constants_1.FILE_CONFIG.MAX_ENTRIES_PER_OSZ}`);
            }
            context.entryCount = entries.length;
            return zip;
        }
        catch (error) {
            if (error instanceof Error && error.message.includes('Invalid ZIP')) {
                throw error_handling_1.FileError.parseFailed(filePath, 'Corrupted ZIP file');
            }
            throw error;
        }
    }
    /**
     * Analyze ZIP file structure and categorize entries
     */
    static analyzeFileStructure(entries) {
        const structure = {
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
            const extension = (0, path_1.extname)(entryName);
            // Skip hidden files and system files
            if ((0, path_1.basename)(entryName).startsWith('.') || entryName.includes('__MACOSX/')) {
                continue;
            }
            if (extension === this.BEATMAP_EXTENSION) {
                structure.beatmapFiles.push(entry);
            }
            else if (extension === this.STORYBOARD_EXTENSION) {
                structure.storyboardFiles.push(entry);
            }
            else if (this.SUPPORTED_AUDIO_EXTENSIONS.has(extension)) {
                if (this.isLikelyHitsound(entryName)) {
                    structure.hitsoundFiles.push(entry);
                }
                else {
                    structure.audioFiles.push(entry);
                }
            }
            else if (this.SUPPORTED_IMAGE_EXTENSIONS.has(extension)) {
                structure.imageFiles.push(entry);
            }
            else if (this.SUPPORTED_VIDEO_EXTENSIONS.has(extension)) {
                structure.videoFiles.push(entry);
            }
            else {
                structure.otherFiles.push(entry);
            }
        }
        return structure;
    }
    /**
     * Determine if an audio file is likely a hitsound
     */
    static isLikelyHitsound(filename) {
        const name = (0, path_1.basename)(filename, (0, path_1.extname)(filename)).toLowerCase();
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
    static validateFileStructure(structure) {
        if (structure.beatmapFiles.length === 0) {
            throw error_handling_1.FileError.parseFailed('OSZ', 'No beatmap files (.osu) found');
        }
        if (structure.audioFiles.length === 0 && structure.hitsoundFiles.length === 0) {
            throw error_handling_1.FileError.parseFailed('OSZ', 'No audio files found');
        }
        // Validate total uncompressed size
        const totalSize = [
            ...structure.beatmapFiles,
            ...structure.audioFiles,
            ...structure.imageFiles,
            ...structure.videoFiles,
        ].reduce((sum, entry) => sum + entry.header.size, 0);
        if (totalSize > constants_1.FILE_CONFIG.MAX_UNCOMPRESSED_SIZE) {
            throw error_handling_1.FileError.tooLarge('OSZ', totalSize, constants_1.FILE_CONFIG.MAX_UNCOMPRESSED_SIZE);
        }
    }
    /**
     * Parse all beatmap files with comprehensive validation
     */
    static async parseBeatmapFiles(beatmapEntries, context) {
        const difficulties = new Map();
        let primaryBeatmap = null;
        const parseErrors = [];
        for (const entry of beatmapEntries) {
            try {
                logger_1.logger.osz('debug', 'Parsing beatmap file', { filename: entry.entryName });
                // Extract and decode beatmap data
                const beatmapData = entry.getData();
                if (beatmapData.length === 0) {
                    throw new Error('Empty beatmap file');
                }
                // Try different encodings if UTF-8 fails
                let beatmapText;
                try {
                    beatmapText = beatmapData.toString('utf8');
                }
                catch {
                    try {
                        beatmapText = beatmapData.toString('utf16le');
                    }
                    catch {
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
            }
            catch (error) {
                const errorDetails = {
                    filename: entry.entryName,
                    error: error instanceof Error ? error : new Error(String(error)),
                };
                parseErrors.push(errorDetails);
                logger_1.logger.osz('warn', 'Failed to parse beatmap file', errorDetails);
            }
        }
        if (!primaryBeatmap) {
            throw error_handling_1.FileError.parseFailed(context.filePath, 'No valid beatmap files could be parsed');
        }
        if (difficulties.size === 0) {
            throw error_handling_1.FileError.parseFailed(context.filePath, 'All beatmap files failed to parse');
        }
        logger_1.logger.osz('info', 'Beatmap parsing completed', {
            totalFiles: beatmapEntries.length,
            successfullyParsed: difficulties.size,
            errors: parseErrors.length,
        });
        return { difficulties, primaryBeatmap };
    }
    /**
     * Convert osu-parsers beatmap to our typed interface
     */
    static convertToOSZBeatmap(rawBeatmap) {
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
                    ? rawBeatmap.events.breaks.map((brk) => ({
                        startTime: Number(brk.startTime || 0),
                        endTime: Number(brk.endTime || 0),
                    })).filter((brk) => brk.endTime > brk.startTime)
                    : [],
            },
            timingPoints: Array.isArray(rawBeatmap.controlPoints?.timingPoints)
                ? rawBeatmap.controlPoints.timingPoints.map((tp) => ({
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
                    ? rawBeatmap.colours.combo.map((color) => ({
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
                ? rawBeatmap.hitObjects.map((obj) => {
                    const result = {
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
                }).sort((a, b) => a.time - b.time)
                : [],
        };
    }
    static extractTags(tags) {
        if (typeof tags === 'string') {
            return tags.split(/\s+/).filter(tag => tag.length > 0);
        }
        if (Array.isArray(tags)) {
            return tags.map(String).filter(tag => tag.length > 0);
        }
        return [];
    }
    static clampNumber(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }
    /**
     * Validate beatmap content for consistency
     */
    static validateBeatmapContent(beatmap, filename) {
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
    static generateMetadata(primaryBeatmap, difficulties) {
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
    static calculateAverageBPM(timingPoints) {
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
    static calculateDuration(hitObjects) {
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
    static calculateMaxCombo(hitObjects) {
        return hitObjects.filter(obj => obj.type.circle || obj.type.slider).length;
    }
    static mapGameMode(mode) {
        const modeMap = {
            0: 'osu',
            1: 'taiko',
            2: 'fruits',
            3: 'mania',
        };
        return modeMap[mode] || 'osu';
    }
    static generateChartId(title, artist, creator) {
        const cleanTitle = title.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        const cleanArtist = artist.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        const cleanCreator = creator.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        const timestamp = Date.now().toString(36);
        return `${cleanArtist}-${cleanTitle}-${cleanCreator}-${timestamp}`;
    }
    /**
     * Extract and validate audio file
     */
    static async extractAudioFile(audioEntries, expectedFilename, context) {
        // Try to find the exact audio file first
        let audioEntry = audioEntries.find(entry => entry.entryName.toLowerCase() === expectedFilename.toLowerCase());
        // If not found, try to find any audio file
        if (!audioEntry && audioEntries.length > 0) {
            audioEntry = audioEntries[0];
            logger_1.logger.osz('warn', 'Expected audio file not found, using alternative', {
                expected: expectedFilename,
                using: audioEntry?.entryName,
            });
        }
        if (!audioEntry) {
            throw error_handling_1.FileError.notFound(`Audio file: ${expectedFilename}`);
        }
        const audioData = audioEntry.getData();
        if (audioData.length === 0) {
            throw error_handling_1.FileError.parseFailed(context.filePath, `Empty audio file: ${audioEntry.entryName}`);
        }
        if (audioData.length > constants_1.FILE_CONFIG.MAX_AUDIO_SIZE) {
            throw error_handling_1.FileError.tooLarge(audioEntry.entryName, audioData.length, constants_1.FILE_CONFIG.MAX_AUDIO_SIZE);
        }
        return {
            filename: audioEntry.entryName,
            data: audioData,
        };
    }
    /**
     * Extract background image
     */
    static async extractBackgroundImage(imageEntries, expectedPath, _context) {
        if (!expectedPath) {
            return undefined;
        }
        const imageEntry = imageEntries.find(entry => entry.entryName.toLowerCase() === expectedPath.toLowerCase() ||
            entry.entryName.toLowerCase().endsWith(expectedPath.toLowerCase()));
        if (!imageEntry) {
            logger_1.logger.osz('warn', 'Background image not found', { expectedPath });
            return undefined;
        }
        const imageData = imageEntry.getData();
        if (imageData.length === 0) {
            logger_1.logger.osz('warn', 'Empty background image file', { filename: imageEntry.entryName });
            return undefined;
        }
        if (imageData.length > constants_1.FILE_CONFIG.MAX_IMAGE_SIZE) {
            logger_1.logger.osz('warn', 'Background image too large, skipping', {
                filename: imageEntry.entryName,
                size: imageData.length,
                maxSize: constants_1.FILE_CONFIG.MAX_IMAGE_SIZE,
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
    static async extractVideoFile(videoEntries, expectedPath, _context) {
        if (!expectedPath || videoEntries.length === 0) {
            return undefined;
        }
        const videoEntry = videoEntries.find(entry => entry.entryName.toLowerCase() === expectedPath.toLowerCase() ||
            entry.entryName.toLowerCase().endsWith(expectedPath.toLowerCase()));
        if (!videoEntry) {
            logger_1.logger.osz('warn', 'Video file not found', { expectedPath });
            return undefined;
        }
        const videoData = videoEntry.getData();
        if (videoData.length === 0) {
            logger_1.logger.osz('warn', 'Empty video file', { filename: videoEntry.entryName });
            return undefined;
        }
        if (videoData.length > constants_1.FILE_CONFIG.MAX_VIDEO_SIZE) {
            logger_1.logger.osz('warn', 'Video file too large, skipping', {
                filename: videoEntry.entryName,
                size: videoData.length,
                maxSize: constants_1.FILE_CONFIG.MAX_VIDEO_SIZE,
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
    static async extractHitsounds(hitsoundEntries, _context) {
        const hitsounds = new Map();
        for (const entry of hitsoundEntries) {
            try {
                const data = entry.getData();
                if (data.length === 0) {
                    logger_1.logger.osz('warn', 'Empty hitsound file', { filename: entry.entryName });
                    continue;
                }
                if (data.length > constants_1.FILE_CONFIG.MAX_HITSOUND_SIZE) {
                    logger_1.logger.osz('warn', 'Hitsound file too large, skipping', {
                        filename: entry.entryName,
                        size: data.length,
                        maxSize: constants_1.FILE_CONFIG.MAX_HITSOUND_SIZE,
                    });
                    continue;
                }
                hitsounds.set(entry.entryName, data);
            }
            catch (error) {
                logger_1.logger.osz('warn', 'Failed to extract hitsound', {
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
    static async extractStoryboardFiles(storyboardEntries, _context) {
        const storyboards = new Map();
        for (const entry of storyboardEntries) {
            try {
                const data = entry.getData();
                if (data.length === 0) {
                    logger_1.logger.osz('warn', 'Empty storyboard file', { filename: entry.entryName });
                    continue;
                }
                if (data.length > constants_1.FILE_CONFIG.MAX_STORYBOARD_SIZE) {
                    logger_1.logger.osz('warn', 'Storyboard file too large, skipping', {
                        filename: entry.entryName,
                        size: data.length,
                        maxSize: constants_1.FILE_CONFIG.MAX_STORYBOARD_SIZE,
                    });
                    continue;
                }
                storyboards.set(entry.entryName, data);
            }
            catch (error) {
                logger_1.logger.osz('warn', 'Failed to extract storyboard', {
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
    static extractDifficulty(content, version) {
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
    static getDifficultyVersions(content) {
        return Array.from(content.difficulties.values()).map(beatmap => beatmap.metadata.version);
    }
    /**
     * Validate OSZ content integrity
     */
    static validateContentIntegrity(content) {
        const errors = [];
        const warnings = [];
        // Check audio file reference consistency
        const audioFilenames = new Set();
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
exports.SimplifiedOSZParser = SimplifiedOSZParser;
Object.defineProperty(SimplifiedOSZParser, "SUPPORTED_AUDIO_EXTENSIONS", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: new Set(['.mp3', '.wav', '.ogg', '.m4a'])
});
Object.defineProperty(SimplifiedOSZParser, "SUPPORTED_IMAGE_EXTENSIONS", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: new Set(['.jpg', '.jpeg', '.png', '.bmp'])
});
Object.defineProperty(SimplifiedOSZParser, "SUPPORTED_VIDEO_EXTENSIONS", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: new Set(['.mp4', '.avi', '.flv', '.wmv'])
});
Object.defineProperty(SimplifiedOSZParser, "BEATMAP_EXTENSION", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: '.osu'
});
Object.defineProperty(SimplifiedOSZParser, "STORYBOARD_EXTENSION", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: '.osb'
});
