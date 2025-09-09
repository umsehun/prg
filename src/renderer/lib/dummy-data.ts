/**
 * DummyData - Provides fallback song data when no OSZ files are parsed
 * Single Responsibility: Generate consistent dummy data for testing
 */

import type { SongData } from '../../shared/d.ts/ipc';

export const DUMMY_SONGS: SongData[] = [
    {
        id: 'dummy-song-1',
        title: 'Sample Rhythm Track',
        artist: 'PRG Studio',
        audioFile: '/sounds/sample.mp3',
        backgroundImage: undefined,
        bpm: 120,
        duration: 180000, // 3 minutes
        difficulty: {
            easy: 2,
            normal: 4,
            hard: 6,
            expert: 8
        },
        filePath: '/dummy/sample.osz',
        notes: []
    },
    {
        id: 'dummy-song-2',
        title: 'Electronic Beat',
        artist: 'Digital Artist',
        audioFile: '/sounds/electronic.mp3',
        backgroundImage: undefined,
        bpm: 140,
        duration: 210000, // 3.5 minutes
        difficulty: {
            easy: 3,
            normal: 5,
            hard: 7,
            expert: 9
        },
        filePath: '/dummy/electronic.osz',
        notes: []
    },
    {
        id: 'dummy-song-3',
        title: 'Acoustic Melody',
        artist: 'Indie Band',
        audioFile: '/sounds/acoustic.mp3',
        backgroundImage: undefined,
        bpm: 100,
        duration: 240000, // 4 minutes
        difficulty: {
            easy: 1,
            normal: 3,
            hard: 5,
            expert: 7
        },
        filePath: '/dummy/acoustic.osz',
        notes: []
    },
    {
        id: 'dummy-song-4',
        title: 'High Energy Dance',
        artist: 'EDM Producer',
        audioFile: '/sounds/dance.mp3',
        backgroundImage: undefined,
        bpm: 160,
        duration: 200000, // 3.33 minutes
        difficulty: {
            easy: 4,
            normal: 6,
            hard: 8,
            expert: 10
        },
        filePath: '/dummy/dance.osz',
        notes: []
    },
    {
        id: 'dummy-song-5',
        title: 'Chill Lofi',
        artist: 'Lofi Beats',
        audioFile: '/sounds/lofi.mp3',
        backgroundImage: undefined,
        bpm: 80,
        duration: 300000, // 5 minutes
        difficulty: {
            easy: 1,
            normal: 2,
            hard: 4,
            expert: 6
        },
        filePath: '/dummy/lofi.osz',
        notes: []
    }
];

/**
 * Get dummy songs with fallback when no real songs are available
 */
export function getDummySongs(): SongData[] {
    return DUMMY_SONGS;
}

/**
 * Check if a song is a dummy song
 */
export function isDummySong(songId: string): boolean {
    return songId.startsWith('dummy-song-');
}

/**
 * Get mixed songs (real + dummy if needed)
 */
export function getMixedSongs(realSongs: SongData[]): SongData[] {
    if (realSongs.length === 0) {
        console.log('🎵 No real songs found, using dummy data');
        return DUMMY_SONGS;
    }

    if (realSongs.length < 3) {
        console.log(`🎵 Only ${realSongs.length} real songs found, adding dummy songs`);
        return [...realSongs, ...DUMMY_SONGS.slice(0, 5 - realSongs.length)];
    }

    return realSongs;
}
