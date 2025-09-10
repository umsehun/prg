/**
 * osu! timing and judgment calculations
 * Based on official osu! formulas
 */
import type { OsuDifficulty, Judgment, GameConfig } from '../types/core';
/**
 * Calculate judgment windows from Overall Difficulty
 * Uses official osu! formulas
 */
export declare function calculateJudgmentWindows(overallDifficulty: number): Record<Judgment, number>;
/**
 * Calculate approach time from Approach Rate
 * Uses official osu! formulas
 */
export declare function calculateApproachTime(approachRate: number): number;
/**
 * Calculate circle size (for visual feedback)
 */
export declare function calculateCircleSize(circleSize: number): number;
/**
 * Calculate target rotation speed from BPM
 * Slower rotation for lower BPM, faster for higher BPM
 */
export declare function calculateTargetRotationSpeed(bpm: number): number;
/**
 * Judge timing accuracy
 */
export declare function judgeHit(hitTime: number, noteTime: number, judgmentWindows: Record<Judgment, number>): {
    judgment: Judgment;
    timingError: number;
    accuracy: number;
};
/**
 * Create game configuration from beatmap difficulty
 */
export declare function createGameConfig(difficulty: OsuDifficulty, bpm: number, canvasWidth?: number, canvasHeight?: number): GameConfig;
//# sourceMappingURL=osu-calculations.d.ts.map