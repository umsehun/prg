/**
 * Pin Mode Page - Knife Hit Style Rhythm Game with Real Data
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Pause, Play, Square, ArrowLeft, Zap } from 'lucide-react';
import { useGameState } from '@/hooks/useGameState';
import Link from 'next/link';

interface Pin {
    id: number;
    angle: number;
    timestamp: number;
}

export default function PinModePage() {
    const {
        currentSong,
        gameState,
        stats,
        isPlaying,
        pauseGame,
        resumeGame,
        stopGame,
        updateStats
    } = useGameState();

    const [targetRotation, setTargetRotation] = useState(0);
    const [pins, setPins] = useState<Pin[]>([]);
    const [rotationSpeed, setRotationSpeed] = useState(2);

    // Rotation animation
    useEffect(() => {
        if (gameState === 'playing') {
            const interval = setInterval(() => {
                setTargetRotation(prev => (prev + rotationSpeed) % 360);
            }, 16); // ~60fps
            return () => clearInterval(interval);
        }
    }, [gameState, rotationSpeed]);

    // Handle pin throwing
    const handlePinThrow = useCallback(() => {
        if (gameState === 'playing' && currentSong) {
            const newPin: Pin = {
                id: Date.now(),
                angle: targetRotation,
                timestamp: Date.now()
            };

            setPins(prev => [...prev, newPin]);

            // Calculate score based on timing and accuracy
            const baseScore = 100;
            const comboBonus = stats.combo * 10;
            const scoreIncrease = baseScore + comboBonus;

            // Update game stats
            updateStats({
                score: stats.score + scoreIncrease,
                combo: stats.combo + 1,
                hits: {
                    ...stats.hits,
                    perfect: stats.hits.perfect + 1
                }
            });

            // Gradually increase difficulty
            if (stats.combo > 0 && stats.combo % 10 === 0) {
                setRotationSpeed(prev => Math.min(prev + 0.2, 5));
            }
        }
    }, [gameState, currentSong, targetRotation, stats, updateStats]);

    // Keyboard controls
    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            if (event.code === 'Space') {
                event.preventDefault();
                handlePinThrow();
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [handlePinThrow]);

    const handlePause = () => {
        if (gameState === 'playing') {
            pauseGame();
        } else if (gameState === 'paused') {
            resumeGame();
        }
    };

    const handleStop = () => {
        stopGame();
        setPins([]);
        setTargetRotation(0);
        setRotationSpeed(2);
    };

    // If no song is selected, show selection prompt
    if (!currentSong) {
        return (
            <div className="min-h-full bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center">
                <Card className="bg-slate-800/50 border-slate-700 max-w-lg">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Target className="w-6 h-6" />
                            핀 모드
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center py-8">
                        <div className="text-slate-400 mb-6">
                            <Target className="w-24 h-24 mx-auto mb-4 opacity-50" />
                            핀 모드에 선택된 곡이 없습니다
                        </div>
                        <p className="text-slate-300 mb-6">
                            플레이 페이지에서 곡을 선택하여 핀 모드 게임을 시작하세요.
                        </p>
                        <Link href="/play">
                            <Button className="bg-purple-500 hover:bg-purple-600 text-white">
                                곡 선택하기
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-full bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 p-4 pt-20">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <Link href="/play">
                            <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                돌아가기
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-white">{currentSong.title}</h1>
                            <p className="text-slate-400">{currentSong.artist}</p>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-2">
                        <Button
                            onClick={handlePause}
                            variant="outline"
                            size="sm"
                            className="border-slate-600 text-slate-300"
                            disabled={gameState === 'idle'}
                        >
                            {gameState === 'playing' ? (
                                <>
                                    <Pause className="w-4 h-4 mr-2" />
                                    Pause
                                </>
                            ) : (
                                <>
                                    <Play className="w-4 h-4 mr-2" />
                                    Resume
                                </>
                            )}
                        </Button>
                        <Button
                            onClick={handleStop}
                            variant="outline"
                            size="sm"
                            className="border-red-600 text-red-300 hover:bg-red-900/20"
                            disabled={gameState === 'idle'}
                        >
                            <Square className="w-4 h-4 mr-2" />
                            정지
                        </Button>
                    </div>
                </div>

                {/* Score Display */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardContent className="text-center py-4">
                            <div className="text-3xl font-bold text-white mb-1">{stats.score.toLocaleString()}</div>
                            <div className="text-slate-400 text-sm">점수</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardContent className="text-center py-4">
                            <div className="text-3xl font-bold text-purple-400 mb-1">{stats.combo}x</div>
                            <div className="text-slate-400 text-sm">콤보</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardContent className="text-center py-4">
                            <div className="text-3xl font-bold text-green-400 mb-1">{stats.accuracy}%</div>
                            <div className="text-slate-400 text-sm">정확도</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Game Area */}
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Target Area */}
                    <div className="flex-1 flex flex-col items-center justify-center min-h-[500px]">
                        <div className="relative">
                            {/* Spinning Target */}
                            <div
                                className="w-80 h-80 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-2xl"
                                style={{
                                    transform: `rotate(${targetRotation}deg)`,
                                    transition: gameState === 'paused' ? 'none' : 'transform 0.016s linear'
                                }}
                            >
                                <div className="w-72 h-72 rounded-full bg-slate-900 flex items-center justify-center">
                                    <Target className="w-32 h-32 text-white opacity-80" />
                                </div>

                                {/* Pins stuck in target */}
                                {pins.map((pin) => (
                                    <div
                                        key={pin.id}
                                        className="absolute w-1 h-8 bg-yellow-400 origin-bottom"
                                        style={{
                                            transform: `rotate(${pin.angle}deg) translateY(-140px)`,
                                            transformOrigin: '50% 140px'
                                        }}
                                    />
                                ))}
                            </div>

                            {/* Aim Line */}
                            <div className="absolute top-1/2 left-1/2 w-1 h-20 bg-red-500 transform -translate-x-1/2 -translate-y-full opacity-80"></div>
                        </div>

                        {/* Throw Button */}
                        <Button
                            onClick={handlePinThrow}
                            disabled={gameState !== 'playing'}
                            className="mt-8 px-12 py-4 text-xl bg-purple-500 hover:bg-purple-600 text-white disabled:opacity-50"
                        >
                            <Zap className="w-6 h-6 mr-2" />
                            핀 던지기 (스페이스)
                        </Button>
                    </div>

                    {/* Game Info */}
                    <div className="lg:w-80 space-y-4">
                        <Card className="bg-slate-800/50 border-slate-700">
                            <CardHeader>
                                <CardTitle className="text-white text-lg">게임 방법</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-slate-300 text-sm">
                                <p>• 스페이스 키 또는 "핀 던지기" 버튼을 눌러 핀을 발사하세요</p>
                                <p>• 회전하는 타겟을 조준하세요</p>
                                <p>• 콤보를 쌓아 더 높은 점수를 획득하세요</p>
                                <p>• 콤보가 증가할수록 속도가 빨라집니다!</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-slate-800/50 border-slate-700">
                            <CardHeader>
                                <CardTitle className="text-white text-lg">게임 상태</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-slate-300 text-sm">
                                <div className="flex justify-between">
                                    <span>상태:</span>
                                    <span className={`font-medium ${gameState === 'playing' ? 'text-green-400' :
                                        gameState === 'paused' ? 'text-yellow-400' :
                                            'text-slate-400'
                                        }`}>
                                        {gameState === 'playing' ? '플레이 중' :
                                            gameState === 'paused' ? '일시정지' :
                                                gameState === 'idle' ? '대기' : gameState}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>속도:</span>
                                    <span className="text-purple-400">{rotationSpeed.toFixed(1)}x</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>핀 개수:</span>
                                    <span className="text-blue-400">{pins.length}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
