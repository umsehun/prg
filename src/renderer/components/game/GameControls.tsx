/**
 * GameControls - Dedicated Game Control Interface Component
 * Single Responsibility: Handle all game control interactions and UI
 */

'use client';

import { Button } from '@/components/ui/button';
import { Target, Pause, Play, Square, ArrowLeft, RotateCw, Settings } from 'lucide-react';

interface GameControlsProps {
    gameState: 'idle' | 'loading' | 'playing' | 'paused' | 'ended' | 'finished';
    onPinThrow: () => void;
    onPause: () => void;
    onResume: () => void;
    onStop: () => void;
    onBack: () => void;
    disabled?: boolean;
    showThrowButton?: boolean;
}

export function GameControls({
    gameState,
    onPinThrow,
    onPause,
    onResume,
    onStop,
    onBack,
    disabled = false,
    showThrowButton = true
}: GameControlsProps) {

    const getGameStateText = () => {
        switch (gameState) {
            case 'idle': return '게임 시작 대기';
            case 'loading': return '로딩 중...';
            case 'playing': return '플레이 중';
            case 'paused': return '일시정지';
            case 'ended':
            case 'finished': return '게임 종료';
            default: return '대기';
        }
    };

    const getGameStateColor = () => {
        switch (gameState) {
            case 'playing': return 'text-green-400';
            case 'paused': return 'text-orange-400';
            case 'ended':
            case 'finished': return 'text-red-400';
            case 'loading': return 'text-blue-400';
            default: return 'text-slate-400';
        }
    };

    return (
        <div className="space-y-4">
            {/* Game Status */}
            <div className="text-center">
                <div className={`text-lg font-medium ${getGameStateColor()}`}>
                    {getGameStateText()}
                </div>
                {gameState === 'playing' && (
                    <div className="text-sm text-slate-400 mt-1">
                        스페이스바를 눌러 핀을 던지세요!
                    </div>
                )}
            </div>

            {/* Main Controls */}
            <div className="flex flex-col gap-3">
                {/* Primary Action Button */}
                {showThrowButton && (
                    <Button
                        onClick={onPinThrow}
                        disabled={gameState !== 'playing' || disabled}
                        className="w-full bg-purple-500 hover:bg-purple-600 text-lg px-6 py-4 h-auto"
                    >
                        <Target className="w-6 h-6 mr-2" />
                        핀 던지기
                        <div className="text-sm opacity-75 ml-2">(Space)</div>
                    </Button>
                )}

                {/* Game State Controls */}
                <div className="flex gap-2">
                    {gameState === 'playing' && (
                        <Button
                            onClick={onPause}
                            className="flex-1 bg-orange-500 hover:bg-orange-600"
                            disabled={disabled}
                        >
                            <Pause className="w-4 h-4 mr-2" />
                            일시정지
                        </Button>
                    )}

                    {gameState === 'paused' && (
                        <Button
                            onClick={onResume}
                            className="flex-1 bg-green-500 hover:bg-green-600"
                            disabled={disabled}
                        >
                            <Play className="w-4 h-4 mr-2" />
                            재개
                        </Button>
                    )}

                    <Button
                        onClick={onStop}
                        variant="destructive"
                        className="flex-1"
                        disabled={gameState === 'idle' || disabled}
                    >
                        <Square className="w-4 h-4 mr-2" />
                        정지
                    </Button>
                </div>

                {/* Navigation */}
                <Button
                    onClick={onBack}
                    variant="outline"
                    className="w-full border-slate-600"
                    disabled={disabled}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    곡 선택으로 돌아가기
                </Button>
            </div>

            {/* Keyboard Shortcuts Help */}
            {gameState === 'playing' && (
                <div className="bg-slate-800/30 rounded-lg p-3 text-sm">
                    <div className="text-slate-300 font-medium mb-2">키보드 단축키:</div>
                    <div className="space-y-1 text-slate-400">
                        <div className="flex justify-between">
                            <span>핀 던지기</span>
                            <code className="bg-slate-700 px-2 py-1 rounded">Space</code>
                        </div>
                        <div className="flex justify-between">
                            <span>일시정지</span>
                            <code className="bg-slate-700 px-2 py-1 rounded">Esc</code>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export type { GameControlsProps };
