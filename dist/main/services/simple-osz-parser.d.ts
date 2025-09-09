/**
 * Simplified OSZ Parser - Stable version for reliable extraction
 * Focuses on core functionality with enhanced error handling
 */
export interface SimpleOSZContent {
    id: string;
    title: string;
    artist: string;
    creator: string;
    audioFilename: string;
    backgroundImage?: string | undefined;
    bpm: number;
    duration: number;
    difficulties: string[];
}
export declare class SimpleOSZParser {
    /**
     * Parse OSZ file with basic functionality
     */
    static parseOSZFile(filePath: string): Promise<SimpleOSZContent | null>;
    /**
     * Extract metadata from beatmap content
     */
    private static extractBeatmapMetadata;
    /**
     * Check if file is an audio file
     */
    private static isAudioFile;
    /**
     * Check if file is an image file
     */
    private static isImageFile;
    /**
     * Generate unique ID from title and artist
     */
    private static generateId;
    /**
     * Extract specific file from OSZ
     */
    static extractFile(filePath: string, targetFilename: string): Buffer | null;
    /**
     * List all files in OSZ
     */
    static listFiles(filePath: string): string[];
}
//# sourceMappingURL=simple-osz-parser.d.ts.map