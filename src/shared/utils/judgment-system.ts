/**
 * Complete judgment system for PRG
 * Handles timing judgment, accuracy calculation, and score computation
 */

import { logger } from '../globals/logger';
import { GAME_CONFIG } from '../globals/constants';
import { calculateJudgmentWindows, judgeHit } from './osu-calculations';
import type { OsuDifficulty, Judgment } from '../types/core';

export interface JudgmentResult {
    judgment: Judgment;
    timingError: number; // ms, negative = early, positive = late
    accuracy: number; // 0-100%
    score: number;
    combo: number;
    isComboBreak: boolean;
    timestamp: number;
}

export interface ScoreState {
    totalScore: number;
    accuracy: number; // Overall accuracy percentage
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
    unstableRate: number; // osu! UR metric
    hitErrorHistory: number[]; // Last 50 hits for UR calculation
}

export class JudgmentEngine {
    private difficulty: OsuDifficulty;
    private judgmentWindows: Record<Judgment, number>;
    private scoreState: ScoreState;
    private performanceMetrics: PerformanceMetrics;
    private timingHistory: number[] = [];

    constructor(difficulty: OsuDifficulty) {
        this.difficulty = difficulty;
        this.judgmentWindows = calculateJudgmentWindows(difficulty.overallDifficulty);

        this.scoreState = {
            totalScore: 0,
            accuracy: 100,
            combo: 0,
            maxCombo: 0,
            judgmentCounts: { KOOL: 0, COOL: 0, GOOD: 0, MISS: 0 },
            totalNotes: 0,
            hitNotes: 0
        };

        this.performanceMetrics = {
            averageTimingError: 0,
            timingStandardDeviation: 0,
            unstableRate: 0,
            hitErrorHistory: []
        };

        logger.game('info', 'Judgment engine initialized', {
            difficulty: this.difficulty,
            windows: this.judgmentWindows
        });
    }

    /**
     * Process a knife hit and return judgment result
     */
    public processHit(hitTime: number, expectedTime: number): JudgmentResult {
        const hitResult = judgeHit(hitTime, expectedTime, this.judgmentWindows);

        // Update score state
        this.scoreState.totalNotes++;
        this.scoreState.judgmentCounts[hitResult.judgment]++;

        const isComboBreak = hitResult.judgment === 'MISS';

        if (isComboBreak) {
            this.scoreState.combo = 0;
        } else {
            this.scoreState.combo++;
            this.scoreState.hitNotes++;
            this.scoreState.maxCombo = Math.max(this.scoreState.maxCombo, this.scoreState.combo);
        }

        // Calculate score for this hit
        const baseScore = this.getBaseScore(hitResult.judgment);
        const comboMultiplier = this.getComboMultiplier(this.scoreState.combo);
        const score = Math.floor(baseScore * comboMultiplier);

        this.scoreState.totalScore += score;

        // Update accuracy
        this.updateAccuracy();

        // Update performance metrics
        if (!isComboBreak) {
            this.updatePerformanceMetrics(hitResult.timingError);
        }

        const result: JudgmentResult = {
            judgment: hitResult.judgment,
            timingError: hitResult.timingError,
            accuracy: hitResult.accuracy,
            score,
            combo: this.scoreState.combo,
            isComboBreak,
            timestamp: Date.now()
        };

        logger.game('debug', 'Hit processed', {
            result,
            currentScore: this.scoreState.totalScore,
            currentAccuracy: this.scoreState.accuracy
        });

        return result;
    }

    /**
     * Process a missed note (no hit within timing window)
     */
    public processMiss(expectedTime: number): JudgmentResult {
        this.scoreState.totalNotes++;
        this.scoreState.judgmentCounts.MISS++;
        this.scoreState.combo = 0;

        this.updateAccuracy();

        const result: JudgmentResult = {
            judgment: 'MISS',
            timingError: 999, // Arbitrary large value for complete miss
            accuracy: 0,
            score: 0,
            combo: 0,
            isComboBreak: true,
            timestamp: Date.now()
        };

        logger.game('debug', 'Miss processed', {
            expectedTime,
            currentScore: this.scoreState.totalScore,
            currentAccuracy: this.scoreState.accuracy
        });

        return result;
    }

    /**
     * Get base score for judgment type
     */
    private getBaseScore(judgment: Judgment): number {
        switch (judgment) {
            case 'KOOL': return GAME_CONFIG.SCORING.KOOL_SCORE;
            case 'COOL': return GAME_CONFIG.SCORING.COOL_SCORE;
            case 'GOOD': return GAME_CONFIG.SCORING.GOOD_SCORE;
            case 'MISS': return GAME_CONFIG.SCORING.MISS_SCORE;
        }
    }

    /**
     * Calculate combo multiplier
     */
    private getComboMultiplier(combo: number): number {
        if (combo < 10) return 1.0;

        const bonusMultiplier = Math.min(
            GAME_CONFIG.SCORING.MAX_COMBO_BONUS,
            Math.floor(combo / 10)
        ) * 0.1;

        return 1.0 + bonusMultiplier;
    }

    /**
     * Update overall accuracy
     */
    private updateAccuracy(): void {
        if (this.scoreState.totalNotes === 0) {
            this.scoreState.accuracy = 100;
            return;
        }

        const { KOOL, COOL, GOOD, MISS } = this.scoreState.judgmentCounts;
        const totalPossibleScore = this.scoreState.totalNotes * GAME_CONFIG.SCORING.KOOL_SCORE;
        const actualScore =
            KOOL * GAME_CONFIG.SCORING.KOOL_SCORE +
            COOL * GAME_CONFIG.SCORING.COOL_SCORE +
            GOOD * GAME_CONFIG.SCORING.GOOD_SCORE +
            MISS * GAME_CONFIG.SCORING.MISS_SCORE;

        this.scoreState.accuracy = Math.max(0, (actualScore / totalPossibleScore) * 100);
    }

    /**
     * Update performance metrics for timing analysis
     */
    private updatePerformanceMetrics(timingError: number): void {
        this.timingHistory.push(timingError);

        // Keep only last 50 hits for UR calculation
        if (this.timingHistory.length > 50) {
            this.timingHistory.shift();
        }

        // Calculate average timing error
        const sum = this.timingHistory.reduce((acc, val) => acc + val, 0);
        this.performanceMetrics.averageTimingError = sum / this.timingHistory.length;

        // Calculate standard deviation
        const variance = this.timingHistory.reduce((acc, val) => {
            const diff = val - this.performanceMetrics.averageTimingError;
            return acc + diff * diff;
        }, 0) / this.timingHistory.length;

        this.performanceMetrics.timingStandardDeviation = Math.sqrt(variance);

        // Calculate Unstable Rate (UR) - osu! standard metric
        this.performanceMetrics.unstableRate = this.performanceMetrics.timingStandardDeviation * 10;

        // Update hit error history for external analysis
        this.performanceMetrics.hitErrorHistory = [...this.timingHistory];
    }

    /**
     * Get current score state
     */
    public getScoreState(): Readonly<ScoreState> {
        return { ...this.scoreState };
    }

    /**
     * Get performance metrics
     */
    public getPerformanceMetrics(): Readonly<PerformanceMetrics> {
        return { ...this.performanceMetrics };
    }

    /**
     * Get judgment windows for display
     */
    public getJudgmentWindows(): Record<Judgment, number> {
        return { ...this.judgmentWindows };
    }

    /**
     * Calculate grade based on accuracy
     */
    public calculateGrade(): string {
        const acc = this.scoreState.accuracy;
        const missCount = this.scoreState.judgmentCounts.MISS;

        if (acc === 100) return 'SS';
        if (acc > 95 && missCount === 0) return 'S';
        if (acc > 90) return 'A';
        if (acc > 80) return 'B';
        if (acc > 70) return 'C';
        return 'D';
    }

    /**
     * Generate detailed score report
     */
    public generateScoreReport(): {
        scoreState: ScoreState;
        performanceMetrics: PerformanceMetrics;
        grade: string;
        playTime: number;
        hitRate: number;
    } {
        return {
            scoreState: this.getScoreState(),
            performanceMetrics: this.getPerformanceMetrics(),
            grade: this.calculateGrade(),
            playTime: this.scoreState.totalNotes * 1000, // Approximate, should be actual play time
            hitRate: this.scoreState.totalNotes > 0
                ? (this.scoreState.hitNotes / this.scoreState.totalNotes) * 100
                : 0
        };
    }

    /**
     * Reset judgment engine for new game
     */
    public reset(newDifficulty?: OsuDifficulty): void {
        if (newDifficulty) {
            this.difficulty = newDifficulty;
            this.judgmentWindows = calculateJudgmentWindows(newDifficulty.overallDifficulty);
        }

        this.scoreState = {
            totalScore: 0,
            accuracy: 100,
            combo: 0,
            maxCombo: 0,
            judgmentCounts: { KOOL: 0, COOL: 0, GOOD: 0, MISS: 0 },
            totalNotes: 0,
            hitNotes: 0
        };

        this.performanceMetrics = {
            averageTimingError: 0,
            timingStandardDeviation: 0,
            unstableRate: 0,
            hitErrorHistory: []
        };

        this.timingHistory = [];

        logger.game('info', 'Judgment engine reset', { difficulty: this.difficulty });
    }

    /**
     * Check if timing is within any judgment window
     */
    public isWithinTimingWindow(timingError: number): boolean {
        return Math.abs(timingError) <= this.judgmentWindows.MISS;
    }

    /**
     * Get expected judgment for timing error (without processing)
     */
    public previewJudgment(timingError: number): Judgment {
        const absError = Math.abs(timingError);

        if (absError <= this.judgmentWindows.KOOL) return 'KOOL';
        if (absError <= this.judgmentWindows.COOL) return 'COOL';
        if (absError <= this.judgmentWindows.GOOD) return 'GOOD';
        return 'MISS';
    }
}
