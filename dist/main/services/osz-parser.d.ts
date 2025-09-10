/**
 * Simplified type-safe OSZ file parser service
 * Handles .osz file extraction and beatmap parsing with comprehensive error handling
 * NO ANY TYPES - Complete type safety without excessive complexity
 */
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
/**
 * Simplified OSZ parser service
 */
export declare class SimplifiedOSZParser {
    private static readonly SUPPORTED_AUDIO_EXTENSIONS;
    private static readonly SUPPORTED_IMAGE_EXTENSIONS;
    private static readonly SUPPORTED_VIDEO_EXTENSIONS;
    private static readonly BEATMAP_EXTENSION;
    private static readonly STORYBOARD_EXTENSION;
    /**
     * Parse OSZ file with comprehensive error handling
     */
    static parseOszFile(filePath: string): Promise<Result<OSZContent>>;
    /**
     * Validate OSZ file before processing
     */
    private static validateOszFile;
    /**
     * Safely extract ZIP file with error handling
     */
    private static safeExtractZip;
    /**
     * Analyze ZIP file structure and categorize entries
     */
    private static analyzeFileStructure;
    /**
     * Determine if an audio file is likely a hitsound
     */
    private static isLikelyHitsound;
    /**
     * Validate that file structure meets minimum requirements
     */
    private static validateFileStructure;
    /**
     * Parse all beatmap files with comprehensive validation
     */
    private static parseBeatmapFiles;
    /**
     * Convert osu-parsers beatmap to our typed interface
     */
    private static convertToOSZBeatmap;
    private static extractTags;
    private static clampNumber;
    /**
     * Validate beatmap content for consistency
     */
    private static validateBeatmapContent;
    /**
     * Generate chart metadata
     */
    private static generateMetadata;
    private static calculateAverageBPM;
    private static calculateDuration;
    private static calculateMaxCombo;
    private static mapGameMode;
    private static generateChartId;
    /**
     * Extract and validate audio file
     */
    private static extractAudioFile;
    /**
     * Extract background image
     */
    private static extractBackgroundImage;
    /**
     * Extract video file
     */
    private static extractVideoFile;
    /**
     * Extract hitsound files
     */
    private static extractHitsounds;
    /**
     * Extract storyboard files
     */
    private static extractStoryboardFiles;
    /**
     * Extract specific difficulty by version name
     */
    static extractDifficulty(content: OSZContent, version: string): OSZBeatmap | null;
    /**
     * Get available difficulty versions
     */
    static getDifficultyVersions(content: OSZContent): string[];
    /**
     * Validate OSZ content integrity
     */
    static validateContentIntegrity(content: OSZContent): {
        isValid: boolean;
        errors: string[];
        warnings: string[];
    };
}
//# sourceMappingURL=osz-parser.d.ts.map