/**
 * useSongs Hook - Manages song library and OSZ files
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import type { SongData } from '../../shared/d.ts/ipc';

interface UseSongsReturn {
    songs: SongData[];
    loading: boolean;
    error: string | null;
    refreshLibrary: () => Promise<void>;
    importOsz: (filePath: string) => Promise<boolean>;
    getSong: (id: string) => SongData | undefined;
    importFromFile: (file: File) => Promise<boolean>;
}

export function useSongs(): UseSongsReturn {
    const [songs, setSongs] = useState<SongData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refreshLibrary = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            if (typeof window !== 'undefined' && (window as any).electronAPI?.osz) {
                const library = await (window as any).electronAPI.osz.getLibrary();
                if (library && Array.isArray(library)) {
                    setSongs(library);
                } else {
                    // 라이브러리가 비어있는 경우
                    setSongs([]);
                }
            } else {
                // Electron IPC를 사용할 수 없는 경우
                console.warn('Electron IPC not available');
                setSongs([]);
                setError('Electron IPC를 사용할 수 없습니다');
            }
        } catch (err) {
            console.error('Failed to load song library:', err);
            setError('곡 라이브러리를 불러오는 데 실패했습니다');
            setSongs([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const importOsz = useCallback(async (filePath: string): Promise<boolean> => {
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
    };
}

export default useSongs;
