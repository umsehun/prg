"use strict";
/**
 * Complete judgment system for PRG
 * Handles timing judgment, accuracy calculation, and score computation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.JudgmentEngine = void 0;
const logger_1 = require("../globals/logger");
const constants_1 = require("../globals/constants");
const osu_calculations_1 = require("./osu-calculations");
class JudgmentEngine {
    constructor(difficulty) {
        Object.defineProperty(this, "difficulty", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "judgmentWindows", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "scoreState", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "performanceMetrics", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "timingHistory", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        this.difficulty = difficulty;
        this.judgmentWindows = (0, osu_calculations_1.calculateJudgmentWindows)(difficulty.overallDifficulty);
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
        logger_1.logger.game('info', 'Judgment engine initialized', {
            difficulty: this.difficulty,
            windows: this.judgmentWindows
        });
    }
    /**
     * Process a knife hit and return judgment result
     */
    processHit(hitTime, expectedTime) {
        const hitResult = (0, osu_calculations_1.judgeHit)(hitTime, expectedTime, this.judgmentWindows);
        // Update score state
        this.scoreState.totalNotes++;
        this.scoreState.judgmentCounts[hitResult.judgment]++;
        const isComboBreak = hitResult.judgment === 'MISS';
        if (isComboBreak) {
            this.scoreState.combo = 0;
        }
        else {
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
        const result = {
            judgment: hitResult.judgment,
            timingError: hitResult.timingError,
            accuracy: hitResult.accuracy,
            score,
            combo: this.scoreState.combo,
            isComboBreak,
            timestamp: Date.now()
        };
        logger_1.logger.game('debug', 'Hit processed', {
            result,
            currentScore: this.scoreState.totalScore,
            currentAccuracy: this.scoreState.accuracy
        });
        return result;
    }
    /**
     * Process a missed note (no hit within timing window)
     */
    processMiss(expectedTime) {
        this.scoreState.totalNotes++;
        this.scoreState.judgmentCounts.MISS++;
        this.scoreState.combo = 0;
        this.updateAccuracy();
        const result = {
            judgment: 'MISS',
            timingError: 999, // Arbitrary large value for complete miss
            accuracy: 0,
            score: 0,
            combo: 0,
            isComboBreak: true,
            timestamp: Date.now()
        };
        logger_1.logger.game('debug', 'Miss processed', {
            expectedTime,
            currentScore: this.scoreState.totalScore,
            currentAccuracy: this.scoreState.accuracy
        });
        return result;
    }
    /**
     * Get base score for judgment type
     */
    getBaseScore(judgment) {
        switch (judgment) {
            case 'KOOL': return constants_1.GAME_CONFIG.SCORING.KOOL_SCORE;
            case 'COOL': return constants_1.GAME_CONFIG.SCORING.COOL_SCORE;
            case 'GOOD': return constants_1.GAME_CONFIG.SCORING.GOOD_SCORE;
            case 'MISS': return constants_1.GAME_CONFIG.SCORING.MISS_SCORE;
        }
    }
    /**
     * Calculate combo multiplier
     */
    getComboMultiplier(combo) {
        if (combo < 10)
            return 1.0;
        const bonusMultiplier = Math.min(constants_1.GAME_CONFIG.SCORING.MAX_COMBO_BONUS, Math.floor(combo / 10)) * 0.1;
        return 1.0 + bonusMultiplier;
    }
    /**
     * Update overall accuracy
     */
    updateAccuracy() {
        if (this.scoreState.totalNotes === 0) {
            this.scoreState.accuracy = 100;
            return;
        }
        const { KOOL, COOL, GOOD, MISS } = this.scoreState.judgmentCounts;
        const totalPossibleScore = this.scoreState.totalNotes * constants_1.GAME_CONFIG.SCORING.KOOL_SCORE;
        const actualScore = KOOL * constants_1.GAME_CONFIG.SCORING.KOOL_SCORE +
            COOL * constants_1.GAME_CONFIG.SCORING.COOL_SCORE +
            GOOD * constants_1.GAME_CONFIG.SCORING.GOOD_SCORE +
            MISS * constants_1.GAME_CONFIG.SCORING.MISS_SCORE;
        this.scoreState.accuracy = Math.max(0, (actualScore / totalPossibleScore) * 100);
    }
    /**
     * Update performance metrics for timing analysis
     */
    updatePerformanceMetrics(timingError) {
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
    getScoreState() {
        return { ...this.scoreState };
    }
    /**
     * Get performance metrics
     */
    getPerformanceMetrics() {
        return { ...this.performanceMetrics };
    }
    /**
     * Get judgment windows for display
     */
    getJudgmentWindows() {
        return { ...this.judgmentWindows };
    }
    /**
     * Calculate grade based on accuracy
     */
    calculateGrade() {
        const acc = this.scoreState.accuracy;
        const missCount = this.scoreState.judgmentCounts.MISS;
        if (acc === 100)
            return 'SS';
        if (acc > 95 && missCount === 0)
            return 'S';
        if (acc > 90)
            return 'A';
        if (acc > 80)
            return 'B';
        if (acc > 70)
            return 'C';
        return 'D';
    }
    /**
     * Generate detailed score report
     */
    generateScoreReport() {
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
    reset(newDifficulty) {
        if (newDifficulty) {
            this.difficulty = newDifficulty;
            this.judgmentWindows = (0, osu_calculations_1.calculateJudgmentWindows)(newDifficulty.overallDifficulty);
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
        logger_1.logger.game('info', 'Judgment engine reset', { difficulty: this.difficulty });
    }
    /**
     * Check if timing is within any judgment window
     */
    isWithinTimingWindow(timingError) {
        return Math.abs(timingError) <= this.judgmentWindows.MISS;
    }
    /**
     * Get expected judgment for timing error (without processing)
     */
    previewJudgment(timingError) {
        const absError = Math.abs(timingError);
        if (absError <= this.judgmentWindows.KOOL)
            return 'KOOL';
        if (absError <= this.judgmentWindows.COOL)
            return 'COOL';
        if (absError <= this.judgmentWindows.GOOD)
            return 'GOOD';
        return 'MISS';
    }
}
exports.JudgmentEngine = JudgmentEngine;
