/**
 * Professional OSZ Parser using osu-parsers library
 * Complete support for multiple .osu files with proper difficulty handling
 * Based on official osu!lazer source code
 */
import type { SongData } from '../../shared/d.ts/ipc';
export interface DifficultyInfo {
    name: string;
    overallDifficulty: number;
    approachRate: number;
    circleSize: number;
    hpDrainRate: number;
    starRating?: number;
    noteCount: number;
    bpm: number;
    duration: number;
}
export interface CompleteSongData extends SongData {
    difficulties: DifficultyInfo[];
    preferredDifficulty: string;
}
export declare class ProfessionalOszParser {
    private decoder;
    constructor();
    /**
     * Parse OSZ file with complete multi-difficulty support
     */
    parseOszFile(oszPath: string, outputDir: string): Promise<CompleteSongData | null>;
    /**
     * Calculate BPM from beatmap timing points
     */
    private calculateBPMFromBeatmap;
    /**
     * Calculate duration from beatmap hit objects
     */
    private calculateDurationFromBeatmap;
    /**
     * Select the preferred difficulty (usually the most complete or hardest)
     */
    private selectPreferredDifficulty;
    /**
     * Create our difficulty level structure from parsed difficulties
     */
    private createDifficultyLevels;
    /**
     * Create note data from .osu content (simplified for now)
     */
    private createNotesFromDifficulty;
    /**
     * Generate unique ID from file path
     */
    private generateId;
}
//# sourceMappingURL=ProfessionalOszParser.d.ts.map