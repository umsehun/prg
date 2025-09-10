/**
 * OSU-style Hit Judgment System
 * Shows hit accuracy feedback and manages scoring
 */

import React, { useState, useEffect } from 'react';

export interface HitResult {
    id: string;
    judgment: 'PERFECT' | 'GREAT' | 'GOOD' | 'MISS';
    accuracy: number; // 0-300
    timestamp: number;
    x: number;
    y: number;
}

export interface OsuJudgmentProps {
    hitResult: HitResult | null;
    onResultClear: () => void;
}

export function OsuJudgment({ hitResult, onResultClear }: OsuJudgmentProps) {
    const [displayResult, setDisplayResult] = useState<HitResult | null>(null);

    useEffect(() => {
        if (hitResult) {
            setDisplayResult(hitResult);
            
            // Clear after animation
            const timer = setTimeout(() => {
                setDisplayResult(null);
                onResultClear();
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, [hitResult, onResultClear]);

    if (!displayResult) return null;

    const getJudgmentColor = (judgment: string) => {
        switch (judgment) {
            case 'PERFECT': return '#00ff88';
            case 'GREAT': return '#88ff00';
            case 'GOOD': return '#ffff00';
            case 'MISS': return '#ff0000';
            default: return '#ffffff';
        }
    };

    const getJudgmentText = (judgment: string) => {
        switch (judgment) {
            case 'PERFECT': return '300';
            case 'GREAT': return '100';
            case 'GOOD': return '50';
            case 'MISS': return 'MISS';
            default: return '';
        }
    };

    return (
        <div
            className="fixed pointer-events-none z-50 animate-bounce"
            style={{
                left: `${displayResult.x}px`,
                top: `${displayResult.y}px`,
                transform: 'translate(-50%, -50%)',
                color: getJudgmentColor(displayResult.judgment),
                fontSize: '2rem',
                fontWeight: 'bold',
                textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                animation: 'osuHitFade 1s ease-out forwards'
            }}
        >
            {getJudgmentText(displayResult.judgment)}

            <style jsx>{`
                @keyframes osuHitFade {
                    0% {
                        opacity: 1;
                        transform: translate(-50%, -50%) scale(1.5);
                    }
                    70% {
                        opacity: 1;
                        transform: translate(-50%, -50%) scale(1);
                    }
                    100% {
                        opacity: 0;
                        transform: translate(-50%, -50%) scale(0.8);
                    }
                }
            `}</style>
        </div>
    );
}

// Utility function to calculate judgment from accuracy
export function calculateJudgment(timeDiff: number): HitResult['judgment'] {
    const absTimeDiff = Math.abs(timeDiff);
    
    if (absTimeDiff <= 50) return 'PERFECT';
    if (absTimeDiff <= 100) return 'GREAT';
    if (absTimeDiff <= 150) return 'GOOD';
    return 'MISS';
}

// Score calculation
export function calculateScore(judgment: HitResult['judgment'], combo: number): number {
    const baseScore = {
        'PERFECT': 300,
        'GREAT': 100,
        'GOOD': 50,
        'MISS': 0
    };

    const comboMultiplier = Math.min(1 + combo * 0.01, 2); // Max 2x multiplier
    return Math.floor(baseScore[judgment] * comboMultiplier);
}
