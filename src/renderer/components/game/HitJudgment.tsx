/**
 * HitJudgment - Dedicated Hit Detection and Judgment System
 * Single Responsibility: Handle all hit detection, timing, and judgment logic
 */

'use client';

import { useCallback } from 'react';
import type { Pin, HitEffect } from './GameCanvas';

interface GameStats {
    score: number;
    combo: number;
    accuracy: number;
    hits: {
        perfect: number;
        great: number;
        good: number;
        miss: number;
    };
}

interface HitJudgmentProps {
    pins: Pin[];
    onHitResult: (result: 'PERFECT' | 'GOOD' | 'MISS', effect: HitEffect) => void;
    onStatsUpdate: (stats: GameStats) => void;
    currentStats: GameStats;
}

// Game Constants
const SAFE_ZONE = 30; // degrees between pins
const TARGET_RADIUS = 150;

export function HitJudgment({
    pins,
    onHitResult,
    onStatsUpdate,
    currentStats
}: HitJudgmentProps) {

    // Hit detection logic
    const checkHitDetection = useCallback((throwAngle: number): 'PERFECT' | 'GOOD' | 'MISS' => {
        // Check for collision with existing pins
        for (const pin of pins) {
            const angleDiff = Math.abs(throwAngle - pin.angle);
            const normalizedDiff = Math.min(angleDiff, 360 - angleDiff);

            if (normalizedDiff < SAFE_ZONE / 3) {
                return 'MISS'; // Too close to existing pin
            }
        }

        // Timing-based accuracy (simplified - in real game, this would be rhythm-based)
        const timing = Math.random(); // Replace with actual rhythm timing calculation

        if (timing > 0.8) return 'PERFECT';
        if (timing > 0.5) return 'GOOD';
        return 'MISS';
    }, [pins]);

    // Process hit with full judgment logic
    const processHit = useCallback((throwAngle: number) => {
        const hitResult = checkHitDetection(throwAngle);

        // Create visual effect
        const effect: HitEffect = {
            id: Date.now(),
            x: Math.cos((throwAngle * Math.PI) / 180) * TARGET_RADIUS * 0.7,
            y: Math.sin((throwAngle * Math.PI) / 180) * TARGET_RADIUS * 0.7,
            type: hitResult,
            timestamp: Date.now()
        };

        // Calculate score and update stats
        const newStats = { ...currentStats };

        if (hitResult === 'PERFECT') {
            newStats.hits.perfect++;
            newStats.score += 300 + (currentStats.combo * 5); // Combo bonus
            newStats.combo++;
        } else if (hitResult === 'GOOD') {
            newStats.hits.good++;
            newStats.score += 100 + (currentStats.combo * 2);
            newStats.combo++;
        } else {
            newStats.hits.miss++;
            newStats.combo = 0; // Reset combo on miss
        }

        // Calculate accuracy
        const totalHits = newStats.hits.perfect + newStats.hits.good + newStats.hits.miss;
        const accurateHits = newStats.hits.perfect + newStats.hits.good;
        newStats.accuracy = totalHits > 0 ? Math.round((accurateHits / totalHits) * 100) : 100;

        // Trigger callbacks
        onHitResult(hitResult, effect);
        onStatsUpdate(newStats);

        return hitResult;
    }, [checkHitDetection, onHitResult, onStatsUpdate, currentStats]);

    // Calculate timing window for rhythm games
    const calculateRhythmTiming = useCallback((currentTime: number, bpm: number): number => {
        // Simplified rhythm timing - in real implementation, this would sync with audio
        const beatInterval = (60 / bpm) * 1000; // ms per beat
        const timeSinceLastBeat = currentTime % beatInterval;
        const normalizedTiming = timeSinceLastBeat / beatInterval;

        // Perfect timing is close to beat (0 or 1)
        const distanceFromBeat = Math.min(normalizedTiming, 1 - normalizedTiming);
        return 1 - (distanceFromBeat * 2); // Convert to 0-1 where 1 is perfect
    }, []);

    // Check if throw is safe (no collision)
    const isThrowSafe = useCallback((throwAngle: number): boolean => {
        for (const pin of pins) {
            const angleDiff = Math.abs(throwAngle - pin.angle);
            const normalizedDiff = Math.min(angleDiff, 360 - angleDiff);

            if (normalizedDiff < SAFE_ZONE) {
                return false;
            }
        }
        return true;
    }, [pins]);

    // Get difficulty multiplier based on pin count
    const getDifficultyMultiplier = useCallback((): number => {
        const pinCount = pins.length;
        if (pinCount < 5) return 1.0;
        if (pinCount < 10) return 1.2;
        if (pinCount < 15) return 1.5;
        return 2.0;
    }, [pins.length]);

    // Return judgment functions for use by parent component
    return {
        processHit,
        checkHitDetection,
        calculateRhythmTiming,
        isThrowSafe,
        getDifficultyMultiplier,
        // Stats helpers
        getAccuracy: () => currentStats.accuracy,
        getCombo: () => currentStats.combo,
        getScore: () => currentStats.score
    };
}

export type { HitJudgmentProps, GameStats };
