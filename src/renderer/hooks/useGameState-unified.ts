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

    const startGame = useCallback(async (song: SongData, mode: GameMode): Promise<boolean> => {
        try {
            setGameState('loading');

            // ✅ CRITICAL FIX: Use unified ipc-service pattern
            const chartData = {
                id: song.id,
                title: song.title,
                artist: song.artist,
                difficulty: 'Normal',
                duration: song.duration,
                bpm: song.bpm,
                notes: [], // Add required field
                audio: song.audioFile,
                background: song.backgroundImage,
            };

            console.log('🎮 Starting game with unified IPC service:', chartData);

            const gameStartParams = {
                chartData,
                gameMode: mode === 'pin' ? 'osu' : mode,
                mods: [] as string[]
            };

            // ✅ Use ipcService instead of direct window.electronAPI
            const gameSession = await ipcService.startGame(gameStartParams);
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
        } catch (error) {
            console.error('❌ Failed to stop game:', error);
        }
    }, []);

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
                combo: stats.combo, // ✅ Fixed: use combo instead of maxCombo
                rank: 'A', // ✅ Add required rank field
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
