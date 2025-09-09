/**
 * useGameState Hook - Manages game state and controls
 */

'use client';

import { useState, useCallback, useRef } from 'react';
import type { SongData, ScoreData } from '../../shared/types';

type GameMode = 'osu' | 'pin';
type GameState = 'idle' | 'loading' | 'playing' | 'paused' | 'finished';

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

interface UseGameStateReturn {
    // State
    currentSong: SongData | null;
    gameMode: GameMode;
    gameState: GameState;
    stats: GameStats;
    isPlaying: boolean;

    // Controls
    startGame: (song: SongData, mode: GameMode) => Promise<boolean>;
    stopGame: () => Promise<void>;
    pauseGame: () => Promise<void>;
    resumeGame: () => Promise<void>;

    // Score management
    updateStats: (newStats: Partial<GameStats>) => void;
    submitScore: () => Promise<boolean>;
    resetStats: () => void;
}

export function useGameState(): UseGameStateReturn {
    const [currentSong, setCurrentSong] = useState<SongData | null>(null);
    const [gameMode, setGameMode] = useState<GameMode>('osu'); // Default to osu mode
    const [gameState, setGameState] = useState<GameState>('idle');
    const [stats, setStats] = useState<GameStats>({
        score: 0,
        combo: 0,
        accuracy: 100,
        hits: {
            perfect: 0,
            great: 0,
            good: 0,
            miss: 0
        }
    });

    const gameStartTime = useRef<number>(0);
    const isPlaying = gameState === 'playing';

    const startGame = useCallback(async (song: SongData, mode: GameMode): Promise<boolean> => {
        try {
            setGameState('loading');

            if (typeof window !== 'undefined' && window.electronAPI?.game) {
                const success = await window.electronAPI.game.start({
                    songId: song.id,
                    mode: mode,
                    songData: song
                });
                if (success) {
                    setCurrentSong(song);
                    setGameMode(mode);
                    setGameState('playing');
                    gameStartTime.current = Date.now();
                    resetStats();
                    return true;
                } else {
                    setGameState('idle');
                    return false;
                }
            } else {
                // Fallback for development
                console.warn('Electron IPC not available, starting mock game');
                setCurrentSong(song);
                setGameMode(mode);
                setGameState('playing');
                gameStartTime.current = Date.now();
                resetStats();
                return true;
            }
        } catch (error) {
            console.error('Failed to start game:', error);
            setGameState('idle');
            return false;
        }
    }, []);

    const stopGame = useCallback(async (): Promise<void> => {
        try {
            if (typeof window !== 'undefined' && window.electronAPI?.game) {
                await window.electronAPI.game.stop();
            }

            setGameState('idle');
            setCurrentSong(null);
            setGameMode('pin'); // 기본값을 'pin'으로 설정
        } catch (error) {
            console.error('Failed to stop game:', error);
        }
    }, []);

    const pauseGame = useCallback(async (): Promise<void> => {
        try {
            if (gameState === 'playing') {
                if (typeof window !== 'undefined' && window.electronAPI?.game) {
                    await window.electronAPI.game.pause();
                }
                setGameState('paused');
            }
        } catch (error) {
            console.error('Failed to pause game:', error);
        }
    }, [gameState]);

    const resumeGame = useCallback(async (): Promise<void> => {
        try {
            if (gameState === 'paused') {
                if (typeof window !== 'undefined' && window.electronAPI?.game) {
                    await window.electronAPI.game.resume();
                }
                setGameState('playing');
            }
        } catch (error) {
            console.error('Failed to resume game:', error);
        }
    }, [gameState]);

    const updateStats = useCallback((newStats: Partial<GameStats>) => {
        setStats(prev => {
            const updated = { ...prev, ...newStats };

            // Calculate accuracy
            const totalHits = updated.hits.perfect + updated.hits.great + updated.hits.good + updated.hits.miss;
            if (totalHits > 0) {
                const accurateHits = updated.hits.perfect + updated.hits.great + updated.hits.good;
                updated.accuracy = Math.round((accurateHits / totalHits) * 100);
            }

            return updated;
        });
    }, []);

    const submitScore = useCallback(async (): Promise<boolean> => {
        try {
            if (!currentSong || gameState !== 'finished') {
                return false;
            }

            const scoreData: ScoreData = {
                songId: currentSong.id,
                score: stats.score,
                accuracy: stats.accuracy,
                combo: stats.combo,
                rank: calculateRank(stats.accuracy),
                timestamp: Date.now()
            };

            if (typeof window !== 'undefined' && window.electronAPI?.game) {
                // submitScore가 없으면 임시로 true 반환
                const gameAPI = window.electronAPI.game as any;
                if (gameAPI.submitScore) {
                    return await gameAPI.submitScore(scoreData);
                } else {
                    console.log('Score data prepared:', scoreData);
                    return true;
                }
            } else {
                // Mock submission for development
                console.log('Mock score submission:', scoreData);
                return true;
            }
        } catch (error) {
            console.error('Failed to submit score:', error);
            return false;
        }
    }, [currentSong, gameState, stats]);

    const resetStats = useCallback(() => {
        setStats({
            score: 0,
            combo: 0,
            accuracy: 100,
            hits: {
                perfect: 0,
                great: 0,
                good: 0,
                miss: 0
            }
        });
    }, []);

    return {
        // State
        currentSong,
        gameMode,
        gameState,
        stats,
        isPlaying,

        // Controls
        startGame,
        stopGame,
        pauseGame,
        resumeGame,

        // Score management
        updateStats,
        submitScore,
        resetStats
    };
}

// Helper function to calculate rank based on accuracy
function calculateRank(accuracy: number): ScoreData['rank'] {
    if (accuracy >= 97) return 'SS';
    if (accuracy >= 90) return 'S';
    if (accuracy >= 80) return 'A';
    if (accuracy >= 70) return 'B';
    if (accuracy >= 60) return 'C';
    if (accuracy >= 50) return 'D';
    return 'F';
}
