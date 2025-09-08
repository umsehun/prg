/**
 * Complete judgment system for PRG
 * Handles timing judgment, accuracy calculation, and score computation
 */
import type { OsuDifficulty, Judgment } from '../types/core';
export interface JudgmentResult {
    judgment: Judgment;
    timingError: number;
    accuracy: number;
    score: number;
    combo: number;
    isComboBreak: boolean;
    timestamp: number;
}
export interface ScoreState {
    totalScore: number;
    accuracy: number;
    combo: number;
    maxCombo: number;
    judgmentCounts: {
        KOOL: number;
        COOL: number;
        GOOD: number;
        MISS: number;
    };
    totalNotes: number;
    hitNotes: number;
}
export interface PerformanceMetrics {
    averageTimingError: number;
    timingStandardDeviation: number;
    unstableRate: number;
    hitErrorHistory: number[];
}
export declare class JudgmentEngine {
    private difficulty;
    private judgmentWindows;
    private scoreState;
    private performanceMetrics;
    private timingHistory;
    constructor(difficulty: OsuDifficulty);
    /**
     * Process a knife hit and return judgment result
     */
    processHit(hitTime: number, expectedTime: number): JudgmentResult;
    /**
     * Process a missed note (no hit within timing window)
     */
    processMiss(expectedTime: number): JudgmentResult;
    /**
     * Get base score for judgment type
     */
    private getBaseScore;
    /**
     * Calculate combo multiplier
     */
    private getComboMultiplier;
    /**
     * Update overall accuracy
     */
    private updateAccuracy;
    /**
     * Update performance metrics for timing analysis
     */
    private updatePerformanceMetrics;
    /**
     * Get current score state
     */
    getScoreState(): Readonly<ScoreState>;
    /**
     * Get performance metrics
     */
    getPerformanceMetrics(): Readonly<PerformanceMetrics>;
    /**
     * Get judgment windows for display
     */
    getJudgmentWindows(): Record<Judgment, number>;
    /**
     * Calculate grade based on accuracy
     */
    calculateGrade(): string;
    /**
     * Generate detailed score report
     */
    generateScoreReport(): {
        scoreState: ScoreState;
        performanceMetrics: PerformanceMetrics;
        grade: string;
        playTime: number;
        hitRate: number;
    };
    /**
     * Reset judgment engine for new game
     */
    reset(newDifficulty?: OsuDifficulty): void;
    /**
     * Check if timing is within any judgment window
     */
    isWithinTimingWindow(timingError: number): boolean;
    /**
     * Get expected judgment for timing error (without processing)
     */
    previewJudgment(timingError: number): Judgment;
}
//# sourceMappingURL=judgment-system.d.ts.map