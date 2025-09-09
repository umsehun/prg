/**
 * Pin Mode Game Page - Container Component
 * Single Responsibility: Compose and coordinate single-purpose game components
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useGameState } from '@/hooks/useGameState';
import { useRouter } from 'next/navigation';

// Single Responsibility Components
import { GameCanvas, type Pin, type HitEffect } from '@/components/game/GameCanvas';
import { HitJudgment, type GameStats } from '@/components/game/HitJudgment';
import { ScoreBoard } from '@/components/game/ScoreBoard';
import { GameControls } from '@/components/game/GameControls';

export default function PinGamePage() {
    const router = useRouter();
    const {
        currentSong,
        gameState,
        stats,
        pauseGame,
        resumeGame,
        stopGame,
        updateStats
    } = useGameState();

    // Game State
    const [targetRotation, setTargetRotation] = useState(0);
    const [pins, setPins] = useState<Pin[]>([]);
    const [rotationSpeed, setRotationSpeed] = useState(2);
    const [hitEffects, setHitEffects] = useState<HitEffect[]>([]);
    const [currentPinAngle, setCurrentPinAngle] = useState(0);

    // Hit Judgment System
    const handleHitResult = useCallback((result: 'PERFECT' | 'GOOD' | 'MISS', effect: HitEffect) => {
        // Add visual effect
        setHitEffects(prev => [...prev, effect]);

        // Add pin if successful hit
        if (result !== 'MISS') {
            const newPin: Pin = {
                id: Date.now(),
                angle: (targetRotation + currentPinAngle) % 360,
                timestamp: Date.now(),
                stuck: true
            };
            setPins(prev => [...prev, newPin]);

            // Increase rotation speed based on combo
            if (stats.combo > 0 && stats.combo % 10 === 0) {
                setRotationSpeed(prev => Math.min(prev + 0.2, 5));
            }
        }

        // Clean up effect after animation
        setTimeout(() => {
            setHitEffects(prev => prev.filter(e => e.id !== effect.id));
        }, 1000);
    }, [targetRotation, currentPinAngle, stats.combo]);

    // Initialize Hit Judgment System
    const hitJudgment = HitJudgment({
        pins,
        onHitResult: handleHitResult,
        onStatsUpdate: updateStats,
        currentStats: stats
    });

    // Target rotation animation
    useEffect(() => {
        if (gameState === 'playing') {
            const interval = setInterval(() => {
                setTargetRotation(prev => (prev + rotationSpeed) % 360);
            }, 16); // ~60fps
            return () => clearInterval(interval);
        }
    }, [gameState, rotationSpeed]);

    // Pin throwing handler
    const handlePinThrow = useCallback(() => {
        if (gameState !== 'playing' || !currentSong) return;

        const throwAngle = (targetRotation + currentPinAngle) % 360;
        hitJudgment.processHit(throwAngle);
    }, [gameState, currentSong, targetRotation, currentPinAngle, hitJudgment]);

    // Keyboard controls
    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            if (event.code === 'Space') {
                event.preventDefault();
                handlePinThrow();
            } else if (event.code === 'Escape') {
                event.preventDefault();
                if (gameState === 'playing') {
                    pauseGame();
                } else if (gameState === 'paused') {
                    resumeGame();
                }
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [handlePinThrow, gameState, pauseGame, resumeGame]);

    // Navigation handlers
    const handleBack = useCallback(() => {
        stopGame();
        router.push('/select');
    }, [stopGame, router]);

    const handleStop = useCallback(() => {
        stopGame();
        // Reset game state
        setPins([]);
        setHitEffects([]);
        setTargetRotation(0);
        setRotationSpeed(2);
    }, [stopGame]);

    // No song selected state
    if (!currentSong) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
                <div className="max-w-4xl mx-auto">
                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardContent className="p-8 text-center">
                            <h2 className="text-2xl font-bold text-purple-300 mb-4">
                                곡을 선택해주세요
                            </h2>
                            <p className="text-slate-400 mb-6">
                                핀 게임을 시작하려면 먼저 곡을 선택해야 합니다.
                            </p>
                            <GameControls
                                gameState="idle"
                                onPinThrow={() => { }}
                                onPause={() => { }}
                                onResume={() => { }}
                                onStop={() => { }}
                                onBack={handleBack}
                                showThrowButton={false}
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-purple-300 mb-2">핀 게임</h1>
                    <p className="text-slate-400">{currentSong.title} - {currentSong.artist}</p>
                </div>

                {/* Game Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Game Canvas Area */}
                    <div className="lg:col-span-3">
                        <Card className="bg-slate-800/50 border-slate-700">
                            <CardContent className="p-6">
                                <div className="relative">
                                    <GameCanvas
                                        targetRotation={targetRotation}
                                        pins={pins}
                                        hitEffects={hitEffects}
                                        currentPinAngle={currentPinAngle}
                                        gameState={gameState}
                                        width={600}
                                        height={600}
                                    />

                                    {/* Game Status Overlay */}
                                    {gameState !== 'playing' && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                                            <div className="text-center">
                                                <h3 className="text-2xl font-bold text-white mb-4">
                                                    {gameState === 'idle' ? '게임 시작 대기' :
                                                        gameState === 'paused' ? '일시정지' :
                                                            gameState === 'loading' ? '로딩 중...' : '게임 종료'}
                                                </h3>
                                                {gameState === 'paused' && (
                                                    <p className="text-slate-300">
                                                        재개하려면 플레이 버튼을 클릭하거나 ESC를 누르세요
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Controls and Stats Panel */}
                    <div className="space-y-4">
                        {/* Game Controls */}
                        <Card className="bg-slate-800/50 border-slate-700">
                            <CardContent className="p-4">
                                <GameControls
                                    gameState={gameState}
                                    onPinThrow={handlePinThrow}
                                    onPause={pauseGame}
                                    onResume={resumeGame}
                                    onStop={handleStop}
                                    onBack={handleBack}
                                />
                            </CardContent>
                        </Card>

                        {/* Score Board */}
                        <ScoreBoard
                            stats={stats}
                            currentSong={currentSong}
                            gameInfo={{
                                rotationSpeed,
                                pinCount: pins.length,
                                difficulty: hitJudgment.getDifficultyMultiplier() > 1.5 ? 'Hard' :
                                    hitJudgment.getDifficultyMultiplier() > 1.2 ? 'Normal' : 'Easy'
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
