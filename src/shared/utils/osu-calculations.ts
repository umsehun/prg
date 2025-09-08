/**
 * osu! timing and judgment calculations
 * Based on official osu! formulas
 */
import type { OsuDifficulty, Judgment, GameConfig } from '../types/core';

/**
 * Calculate judgment windows from Overall Difficulty
 * Uses official osu! formulas
 */
export function calculateJudgmentWindows(overallDifficulty: number): Record<Judgment, number> {
    // Clamp OD to valid range
    const od = Math.max(0, Math.min(10, overallDifficulty));

    // Official osu! formulas (in milliseconds)
    const kool = Math.max(80 - 6 * od, 20);    // 300 window: 20ms-80ms
    const cool = Math.max(140 - 8 * od, 60);   // 100 window: 60ms-140ms  
    const good = Math.max(200 - 10 * od, 100); // 50 window:  100ms-200ms
    const miss = 400;                          // Miss window: always 400ms

    return {
        KOOL: kool,
        COOL: cool,
        GOOD: good,
        MISS: miss
    };
}

/**
 * Calculate approach time from Approach Rate
 * Uses official osu! formulas
 */
export function calculateApproachTime(approachRate: number): number {
    // Clamp AR to valid range
    const ar = Math.max(0, Math.min(10, approachRate));

    // Official osu! formula
    if (ar < 5) {
        return 1200 + 600 * (5 - ar) / 5; // 1200ms-1800ms
    } else {
        return 1200 - 750 * (ar - 5) / 5;  // 450ms-1200ms
    }
}

/**
 * Calculate circle size (for visual feedback)
 */
export function calculateCircleSize(circleSize: number): number {
    const cs = Math.max(0, Math.min(10, circleSize));
    // osu! formula: radius = 32 * (1 - 0.7 * (cs - 5) / 5) for cs >= 5
    // For PRG, we'll use a simpler mapping
    return Math.max(20, Math.min(80, 54.4 - 4.48 * cs));
}

/**
 * Calculate target rotation speed from BPM
 * Slower rotation for lower BPM, faster for higher BPM
 */
export function calculateTargetRotationSpeed(bpm: number): number {
    // Base rotation: 30 degrees per second at 120 BPM
    // Scale with BPM: faster songs = faster rotation
    const baseRotation = 30; // degrees per second
    const bpmScale = bpm / 120; // normalize to 120 BPM

    // Apply reasonable limits
    const rotationSpeed = baseRotation * Math.sqrt(bpmScale);
    return Math.max(15, Math.min(90, rotationSpeed)); // 15-90 deg/sec
}

/**
 * Judge timing accuracy
 */
export function judgeHit(
    hitTime: number,
    noteTime: number,
    judgmentWindows: Record<Judgment, number>
): { judgment: Judgment; timingError: number; accuracy: number } {
    const timingError = hitTime - noteTime;
    const absError = Math.abs(timingError);

    let judgment: Judgment = 'MISS';

    if (absError <= judgmentWindows.KOOL) {
        judgment = 'KOOL';
    } else if (absError <= judgmentWindows.COOL) {
        judgment = 'COOL';
    } else if (absError <= judgmentWindows.GOOD) {
        judgment = 'GOOD';
    } else if (absError <= judgmentWindows.MISS) {
        judgment = 'MISS';
    }

    // Calculate accuracy percentage (100% for KOOL, scaled down)
    let accuracy = 0;
    switch (judgment) {
        case 'KOOL':
            accuracy = 100;
            break;
        case 'COOL':
            accuracy = Math.max(80, 100 - (absError / judgmentWindows.KOOL) * 20);
            break;
        case 'GOOD':
            accuracy = Math.max(50, 80 - (absError / judgmentWindows.COOL) * 30);
            break;
        case 'MISS':
            accuracy = 0;
            break;
    }

    return { judgment, timingError, accuracy };
}

/**
 * Create game configuration from beatmap difficulty
 */
export function createGameConfig(
    difficulty: OsuDifficulty,
    bpm: number,
    canvasWidth: number = 800,
    canvasHeight: number = 600
): GameConfig {
    return {
        // Physics
        knifeVelocity: 400, // pixels per second
        targetRadius: calculateCircleSize(difficulty.circleSize),
        targetRotationSpeed: calculateTargetRotationSpeed(bpm),

        // Judgment
        judgmentWindows: calculateJudgmentWindows(difficulty.overallDifficulty),

        // Visual  
        approachTime: calculateApproachTime(difficulty.approachRate),
        canvasWidth,
        canvasHeight
    };
}
