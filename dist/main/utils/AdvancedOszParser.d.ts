/**
 * Advanced OSZ Parser - Complete implementation with proper .osu file parsing
 * Extracts real BPM, duration, and difficulty data from .osu beatmap files
 * Based on official osu! file format specification
 */
import type { SongData } from '../../shared/d.ts/ipc';
export interface TimingPoint {
    time: number;
    beatLength: number;
    meter: number;
    sampleSet: number;
    sampleIndex: number;
    volume: number;
    uninherited: boolean;
    effects: number;
}
export interface DifficultyData {
    hpDrainRate: number;
    circleSize: number;
    overallDifficulty: number;
    approachRate: number;
    sliderMultiplier: number;
    sliderTickRate: number;
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
export declare class AdvancedOszParser {
    /**
     * Extract and parse an OSZ file with complete .osu parsing
     */
    parseOszFile(oszPath: string, outputDir: string): Promise<SongData | null>;
    /**
     * Parse .osu file content with complete section parsing
     */
    private parseOsuContent;
    /**
     * Parse metadata section lines
     */
    private parseMetadataLine;
    /**
     * Parse general section lines
     */
    private parseGeneralLine;
    /**
     * Parse difficulty section lines
     */
    private parseDifficultyLine;
    /**
     * Parse timing point lines with proper format handling
     */
    private parseTimingPointLine;
    /**
     * Parse hit object lines
     */
    private parseHitObjectLine;
    /**
     * Calculate BPM from timing points using official formula
     */
    private calculateBPM;
    /**
     * Calculate song duration from hit objects
     */
    private calculateDuration;
    /**
     * Calculate difficulty levels based on actual difficulty data
     */
    private calculateDifficultyLevels;
    /**
     * Convert hit objects to our note format
     */
    private convertHitObjectsToNotes;
    /**
     * Generate unique ID from file path
     */
    private generateId;
}
//# sourceMappingURL=AdvancedOszParser.d.ts.map