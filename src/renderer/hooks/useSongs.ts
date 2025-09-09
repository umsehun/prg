/**
 * useSongs Hook - Manages song library and OSZ files with dummy data fallback
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import type { SongData } from '../../shared/d.ts/ipc';
import { getMixedSongs, isDummySong } from '../lib/dummy-data';

interface UseSongsReturn {
    songs: SongData[];
    loading: boolean;
    error: string | null;
    refreshLibrary: () => Promise<void>;
    importOsz: (filePath: string) => Promise<boolean>;
    getSong: (id: string) => SongData | undefined;
    importFromFile: (file: File) => Promise<boolean>;
    hasDummyData: boolean;
}

export function useSongs(): UseSongsReturn {
    const [songs, setSongs] = useState<SongData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hasDummyData, setHasDummyData] = useState(false);

    const refreshLibrary = useCallback(async () => {
        console.log('🔄 refreshLibrary called');
        try {
            setLoading(true);
            setError(null);

            console.log('🔍 Checking window.electronAPI:', {
                hasWindow: typeof window !== 'undefined',
                hasElectronAPI: !!(window as any).electronAPI,
                hasCharts: !!((window as any).electronAPI?.charts),
                hasOsz: !!((window as any).electronAPI?.osz),
                apis: (window as any).electronAPI ? Object.keys((window as any).electronAPI) : 'undefined'
            });

            let realSongs: SongData[] = [];

            if (typeof window !== 'undefined' && (window as any).electronAPI) {
                const electronAPI = (window as any).electronAPI;
                let charts = null;

                // Try charts API first (new way)
                if (electronAPI.charts?.getLibrary) {
                    console.log('📞 Calling electronAPI.charts.getLibrary()');
                    try {
                        const response = await electronAPI.charts.getLibrary();
                        console.log('📨 Charts API Response:', response);

                        if (response && response.success && Array.isArray(response.charts)) {
                            charts = response.charts;
                        } else if (Array.isArray(response)) {
                            charts = response;
                        }
                    } catch (chartError) {
                        console.warn('⚠️ Charts API failed:', chartError);
                    }
                }

                // Try OSZ API as fallback (old way)
                if (!charts && electronAPI.osz?.getLibrary) {
                    console.log('📞 Fallback to electronAPI.osz.getLibrary()');
                    try {
                        const response = await electronAPI.osz.getLibrary();
                        console.log('📨 OSZ API Response:', response);

                        if (response && response.success && Array.isArray(response.charts)) {
                            charts = response.charts;
                        } else if (Array.isArray(response)) {
                            charts = response;
                        }
                    } catch (oszError) {
                        console.warn('⚠️ OSZ API failed:', oszError);
                    }
                }

                if (charts && Array.isArray(charts)) {
                    console.log(`✅ Found ${charts.length} real charts`);
                    // Convert chart data to SongData format with real difficulty data
                    realSongs = charts.map((chart: any) => {
                        // Extract real difficulty data from OSZ chart
                        let difficultyData = {
                            easy: 1,
                            normal: 3,
                            hard: 5,
                            expert: 7
                        };

                        // If chart has difficulties array (from library.json)
                        if (chart.difficulties && Array.isArray(chart.difficulties)) {
                            const diffs = chart.difficulties;
                            // Map OSZ difficulties to our format
                            if (diffs.length > 0) {
                                const avgDiff = diffs.reduce((sum: number, d: any) =>
                                    sum + (d.overallDifficulty || 5), 0) / diffs.length;

                                // Convert to our scale (1-10)
                                const scaledDiff = Math.round(avgDiff);
                                difficultyData = {
                                    easy: Math.max(1, scaledDiff - 2),
                                    normal: scaledDiff,
                                    hard: Math.min(10, scaledDiff + 2),
                                    expert: Math.min(10, scaledDiff + 4)
                                };
                            }
                        }

                        return {
                            id: chart.id,
                            title: chart.title,
                            artist: chart.artist,
                            audioFile: chart.audioFilename || chart.audioPath || chart.audioFile || '',
                            backgroundImage: chart.backgroundFilename || chart.backgroundImage || '',
                            difficulty: difficultyData,
                            bpm: chart.bpm || 120,
                            duration: chart.duration || 180000,
                            filePath: chart.filePath || '',
                            notes: chart.notes || []
                        };
                    });
                }
            }

            // Use only real songs (no dummy data fallback)
            setSongs(realSongs);
            setHasDummyData(false);

            if (realSongs.length > 0) {
                console.log(`✅ Using ${realSongs.length} real songs with actual OSZ data`);
                console.log('📊 Sample song:', realSongs[0]);
            } else {
                console.warn('⚠️ No real songs found');
                setError('곡 라이브러리가 비어있습니다. OSZ 파일을 확인해주세요.');
            }
        } catch (err) {
            console.error('💥 Failed to load song library:', err);
            setError('곡 라이브러리를 불러오는 데 실패했습니다');
            setSongs([]);
        } finally {
            setLoading(false);
        }
    }, []); const importOsz = useCallback(async (filePath: string): Promise<boolean> => {
        try {
            setError(null);

            if (typeof window !== 'undefined' && (window as any).electronAPI?.osz) {
                const result = await (window as any).electronAPI.osz.importFromPath(filePath);

                if (result.success) {
                    // Refresh library after successful import
                    await refreshLibrary();
                    return true;
                } else {
                    setError(result.error || 'OSZ 파일 가져오기에 실패했습니다');
                    return false;
                }
            } else {
                setError('Electron IPC를 사용할 수 없습니다');
                return false;
            }
        } catch (err) {
            console.error('Failed to import OSZ:', err);
            setError('OSZ 파일 가져오기 중 오류가 발생했습니다');
            return false;
        }
    }, [refreshLibrary]);

    const importFromFile = useCallback(async (file: File): Promise<boolean> => {
        try {
            setError(null);

            if (typeof window !== 'undefined' && (window as any).electronAPI?.osz) {
                // Convert File to buffer for IPC
                const arrayBuffer = await file.arrayBuffer();
                const buffer = new Uint8Array(arrayBuffer);

                const result = await (window as any).electronAPI.osz.importFromBuffer({
                    name: file.name,
                    buffer: buffer
                });

                if (result.success) {
                    // Refresh library after successful import
                    await refreshLibrary();
                    return true;
                } else {
                    setError(result.error || 'OSZ 파일 가져오기에 실패했습니다');
                    return false;
                }
            } else {
                setError('Electron IPC를 사용할 수 없습니다');
                return false;
            }
        } catch (err) {
            console.error('Failed to import file:', err);
            setError('파일 가져오기 중 오류가 발생했습니다');
            return false;
        }
    }, [refreshLibrary]);

    const getSong = useCallback((id: string): SongData | undefined => {
        return songs.find(song => song.id === id);
    }, [songs]);

    // Load songs on mount
    useEffect(() => {
        refreshLibrary();
    }, [refreshLibrary]);

    return {
        songs,
        loading,
        error,
        refreshLibrary,
        importOsz,
        getSong,
        importFromFile,
        hasDummyData
    };
}

export default useSongs;
