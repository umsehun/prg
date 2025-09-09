/**
 * useSongs Hook - Manages song library and OSZ files
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import type { SongData } from '@shared/d.ts/ipc';

interface UseSongsReturn {
    songs: SongData[];
    loading: boolean;
    error: string | null;
    refreshLibrary: () => Promise<void>;
    importOsz: (filePath: string) => Promise<boolean>;
    getSong: (id: string) => SongData | undefined;
}

export function useSongs(): UseSongsReturn {
    const [songs, setSongs] = useState<SongData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refreshLibrary = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            if (typeof window !== 'undefined' && window.electronAPI?.osz) {
                const library = await window.electronAPI.osz.getLibrary();
                setSongs(library);
            } else {
                // Fallback for web or missing IPC
                console.warn('Electron IPC not available, using mock data');
                setSongs(getMockSongs());
            }
        } catch (err) {
            console.error('Failed to load song library:', err);
            setError(err instanceof Error ? err.message : 'Failed to load songs');

            // Fallback to mock data on error
            setSongs(getMockSongs());
        } finally {
            setLoading(false);
        }
    }, []);

    const importOsz = useCallback(async (filePath: string): Promise<boolean> => {
        try {
            setError(null);

            if (typeof window !== 'undefined' && window.electronAPI?.osz) {
                const songData = await window.electronAPI.osz.importFile(filePath);
                setSongs(prev => [...prev, songData]);
                return true;
            } else {
                console.warn('Electron IPC not available for OSZ import');
                return false;
            }
        } catch (err) {
            console.error('Failed to import OSZ file:', err);
            setError(err instanceof Error ? err.message : 'Failed to import OSZ');
            return false;
        }
    }, []);

    const getSong = useCallback((id: string): SongData | undefined => {
        return songs.find(song => song.id === id);
    }, [songs]);

    // Load library on mount
    useEffect(() => {
        refreshLibrary();
    }, [refreshLibrary]);

    return {
        songs,
        loading,
        error,
        refreshLibrary,
        importOsz,
        getSong
    };
}

// Mock data for development/fallback
function getMockSongs(): SongData[] {
    return [
        {
            id: 'ahoy',
            title: 'Ahoy! 我ら宝鳥海賊団☆',
            artist: '宝鳥マリン',
            audioFile: '/assets/ahoy/ahoy.mp3',
            backgroundImage: '/assets/ahoy/bg.jpg',
            difficulty: {
                easy: 2,
                normal: 4,
                hard: 6,
                expert: 8
            },
            bpm: 160,
            duration: 180000, // 3 minutes
            filePath: '/assets/ahoy/ahoy.osz',
            notes: []
        },
        {
            id: 'badapple',
            title: 'Bad Apple!!',
            artist: 'Alstroemeria Records',
            audioFile: '/assets/bad-apple/badapple.mp3',
            backgroundImage: '/assets/bad-apple/bg.jpg',
            difficulty: {
                easy: 3,
                normal: 5,
                hard: 7,
                expert: 9
            },
            bpm: 138,
            duration: 219000, // 3:39
            filePath: '/assets/bad-apple/badapple.osz',
            notes: []
        },
        {
            id: 'jinxed',
            title: 'Get Jinxed',
            artist: 'Riot Games',
            audioFile: '/assets/jink/Get-Jinxed.mp3',
            backgroundImage: '/assets/jink/bg.jpg',
            difficulty: {
                easy: 4,
                normal: 6,
                hard: 8,
                expert: 10
            },
            bpm: 175,
            duration: 195000, // 3:15
            filePath: '/assets/jink/Get-Jinxed.osz',
            notes: []
        },
        {
            id: 'popinto',
            title: 'Pop in to',
            artist: 'Various Artists',
            audioFile: '/assets/pop/popInTo.mp3',
            backgroundImage: '/assets/pop/bg.jpg',
            difficulty: {
                easy: 2,
                normal: 4,
                hard: 6,
                expert: 7
            },
            bpm: 120,
            duration: 165000, // 2:45
            filePath: '/assets/pop/popInTo.osz',
            notes: []
        }
    ];
}
