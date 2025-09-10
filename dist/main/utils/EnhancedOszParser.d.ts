/**
 * Enhanced OSZ Parser with better osu-parsers integration
 * Properly extracts ALL difficulty information and metadata
 */
import type { SongData } from '../../shared/d.ts/ipc';
export interface EnhancedDifficultyInfo {
    name: string;
    overallDifficulty: number;
    approachRate: number;
    circleSize: number;
    hpDrainRate: number;
    sliderMultiplier: number;
    sliderTickRate: number;
    starRating?: number;
    noteCount: number;
    circleCount: number;
    sliderCount: number;
    spinnerCount: number;
    bpm: number;
    duration: number;
    maxCombo: number;
    fileName: string;
}
export interface CompleteChartData extends SongData {
    difficulties: EnhancedDifficultyInfo[];
    preferredDifficulty: string;
    creator: string;
    source?: string;
    tags: string[];
    previewTime: number;
    beatmapSetId?: number;
    beatmapId?: number;
}
export declare class EnhancedOszParser {
    private decoder;
    constructor();
    /**
     * Parse OSZ file with enhanced multi-difficulty support and complete metadata extraction
     */
    parseOszFile(oszPath: string, outputDir: string): Promise<CompleteChartData | null>;
    /**
     * Enhanced BPM calculation considering all timing points
     */
    private calculateEnhancedBPM;
    /**
     * Enhanced duration calculation with proper hit object analysis
     */
    private calculateEnhancedDuration;
    /**
     * Count different types of hit objects
     */
    private countHitObjectTypes;
    /**
     * Calculate maximum possible combo
     */
    private calculateMaxCombo;
    /**
     * Select the best difficulty (most complete/interesting)
     */
    private selectBestDifficulty;
    /**
     * Create balanced difficulty level structure from parsed difficulties
     */
    private createBalancedDifficultyLevels;
    /**
     * Create enhanced note data with proper hit object types
     */
    private createEnhancedNotesFromDifficulty;
    /**
     * Generate unique ID from file path
     */
    private generateId;
}
//# sourceMappingURL=EnhancedOszParser.d.ts.map