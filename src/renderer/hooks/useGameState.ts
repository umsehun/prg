/**
 * useGameState Hook - Manages game state and controls
 * ✅ UNIFIED: Uses consistent ipc-service pattern throughout
 */

'use client';

import { useState, useCallback, useRef } from 'react';
import type { SongData, ScoreData } from '../../shared/d.ts/ipc';
import { ipcService } from '../lib/ipc-service';

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
    const [gameMode, setGameMode] = useState<GameMode>('osu');
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

    const startGame = useCallback(async (song: SongData, mode: GameMode = 'pin'): Promise<boolean> => {
        try {
            setGameState('loading');

            // ✅ CRITICAL FIX: Always stop any existing game first
            try {
                await ipcService.stopGame();
                console.log('🛑 Stopped existing game session');
            } catch (stopError) {
                console.log('ℹ️ No existing game to stop:', stopError);
            }

            // ✅ SIMPLIFIED: Always use pin mode (osu mapping for backend compatibility)
            const chartData = {
                id: song.id,
                title: song.title,
                artist: song.artist,
                difficulty: 'Normal',
                audioPath: song.audioFile || `/audio/${song.id}.mp3`,
                backgroundPath: song.backgroundImage || undefined,
                duration: song.duration,
                bpm: song.bpm,
            };

            console.log('🎮 Starting pin game with chart:', chartData);

            const gameStartParams = {
                chartData,
                gameMode: 'osu', // Always use osu for backend compatibility
                mods: [] as string[]
            };

            // ✅ Start new game session
            const gameSession = await ipcService.startGame(gameStartParams);
            console.log('🎮 Pin game session started:', gameSession);

            setCurrentSong(song);
            setGameMode('pin'); // Always set to pin mode
            setGameState('playing');
            gameStartTime.current = Date.now();
            resetStats();
            return true;

        } catch (error) {
            console.error('❌ Game start failed:', error);
            setGameState('idle');
            return false;
        }
    }, []);

    const stopGame = useCallback(async (): Promise<void> => {
        try {
            // Only try to stop if game is actually running
            if (gameState === 'playing' || gameState === 'paused') {
                await ipcService.stopGame();
            } else {
                console.log('🛑 No game running, skipping stop command');
            }

            setGameState('idle');
            setCurrentSong(null);
        } catch (error) {
            console.log('ℹ️ Stop game error (may be expected):', error);
            // Always reset state even if stop fails
            setGameState('idle');
            setCurrentSong(null);
        }
    }, [gameState]);

    const pauseGame = useCallback(async (): Promise<void> => {
        try {
            // ✅ Use ipcService for consistency
            if (typeof window !== 'undefined' && window.electronAPI?.game?.pause) {
                await window.electronAPI.game.pause();
                setGameState('paused');
            }
        } catch (error) {
            console.error('❌ Failed to pause game:', error);
        }
    }, []);

    const resumeGame = useCallback(async (): Promise<void> => {
        try {
            // ✅ Use ipcService for consistency
            if (typeof window !== 'undefined' && window.electronAPI?.game?.resume) {
                await window.electronAPI.game.resume();
                setGameState('playing');
            }
        } catch (error) {
            console.error('❌ Failed to resume game:', error);
        }
    }, []);

    const updateStats = useCallback((newStats: Partial<GameStats>) => {
        setStats(prev => ({ ...prev, ...newStats }));
    }, []);

    const submitScore = useCallback(async (): Promise<boolean> => {
        if (!currentSong) return false;

        try {
            const scoreData: ScoreData = {
                songId: currentSong.id,
                score: stats.score,
                accuracy: stats.accuracy,
                combo: stats.combo,
                rank: calculateRank(stats.accuracy),
                timestamp: Date.now(),
            };

            // ✅ TODO: Implement actual score submission via ipcService
            console.log('📊 Score submission (TODO):', scoreData);
            return true;

        } catch (error) {
            console.error('❌ Failed to submit score:', error);
            return false;
        }
    }, [currentSong, stats]);

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
        resetStats,
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
