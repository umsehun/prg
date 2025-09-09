/**
 * useGameState Hook - Manages game state and controls
 * Uses standardized ipcService for consistent IPC communication
 */

'use client';

import { useState, useCallback, useRef } from 'react';
import type { SongData, ScoreData } from '../../shared/d.ts/ipc';
import { ipcService, type ChartData } from '../lib/ipc-service';

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
    const [gameMode, setGameMode] = useState<GameMode>('pin'); // Default to pin mode
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

            // ✅ Use standardized ipcService for consistent API
            const chartData: ChartData = {
                id: song.id,
                title: song.title,
                artist: song.artist,
                difficulty: 'Normal',
                duration: song.duration,
                bpm: song.bpm,
                notes: [], // Will be populated by OSZ parser
                audio: song.audioFile,
                background: song.backgroundImage,
            };

            console.log('🎮 Starting game via ipcService:', chartData);

            const gameSession = await ipcService.startGame(
                chartData, 
                mode === 'pin' ? 'osu' : mode, // Map pin mode to osu for backend compatibility
                [] // mods
            );
            
            console.log('🎮 Game session started:', gameSession);

            setCurrentSong(song);
            setGameMode(mode);
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
            await ipcService.stopGame();
            setGameState('idle');
            setCurrentSong(null);
            setGameMode('pin');
        } catch (error) {
            console.error('❌ Failed to stop game:', error);
        }
    }, []);

    const pauseGame = useCallback(async (): Promise<void> => {
        try {
            await ipcService.pauseGame();
            setGameState('paused');
        } catch (error) {
            console.error('❌ Failed to pause game:', error);
        }
    }, []);

    const resumeGame = useCallback(async (): Promise<void> => {
        try {
            await ipcService.resumeGame();
            setGameState('playing');
        } catch (error) {
            console.error('❌ Failed to resume game:', error);
        }
    }, []);

    const updateStats = useCallback((newStats: Partial<GameStats>) => {
        setStats(prev => ({
            ...prev,
            ...newStats
        }));
    }, []);

    const submitScore = useCallback(async (): Promise<boolean> => {
        if (!currentSong) {
            console.warn('No current song to submit score for');
            return false;
        }

        try {
            const scoreData: ScoreData = {
                chartId: currentSong.id,
                score: stats.score,
                accuracy: stats.accuracy,
                maxCombo: stats.combo,
                hitCounts: {
                    perfect: stats.hits.perfect,
                    great: stats.hits.great,
                    good: stats.hits.good,
                    miss: stats.hits.miss,
                },
                mods: [], // TODO: Add mods support
                timestamp: Date.now(),
            };

            const result = await ipcService.submitScore(scoreData);
            console.log('📊 Score submitted:', result);
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
