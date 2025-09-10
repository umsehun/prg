/**
 * useSettings Hook - Manages application settings
 */

'use client';

import { useState, useEffect, useCallback } from 'react';

// Settings interface matching the backend structure
export interface GameSettings {
    audio: {
        masterVolume: number;
        musicVolume: number;
        effectVolume: number;
        enableFeedback: boolean;
    };
    game: {
        scrollSpeed: number;
        noteSize: number;
        enableParticles: boolean;
        showFps: boolean;
    };
    controls: {
        keyBindings: {
            lane1: string;
            lane2: string;
            lane3: string;
            lane4: string;
        };
    };
    display: {
        fullscreen: boolean;
        vsync: boolean;
        targetFps: number;
    };
}

// Default settings
const defaultSettings: GameSettings = {
    audio: {
        masterVolume: 0.75,
        musicVolume: 0.8,
        effectVolume: 0.7,
        enableFeedback: true,
    },
    game: {
        scrollSpeed: 1.0,
        noteSize: 1.0,
        enableParticles: true,
        showFps: false,
    },
    controls: {
        keyBindings: {
            lane1: 'D',
            lane2: 'F',
            lane3: 'J',
            lane4: 'K',
        },
    },
    display: {
        fullscreen: false,
        vsync: true,
        targetFps: 60,
    },
};

export interface UseSettingsReturn {
    settings: GameSettings;
    loading: boolean;
    error: string | null;

    // Settings management
    updateSetting: (path: string, value: any) => Promise<void>;
    resetSettings: () => Promise<void>;
    saveSettings: () => Promise<void>;

    // Convenience methods
    updateAudioSetting: (key: keyof GameSettings['audio'], value: any) => Promise<void>;
    updateGameSetting: (key: keyof GameSettings['game'], value: any) => Promise<void>;
    updateControlSetting: (key: keyof GameSettings['controls'], value: any) => Promise<void>;
    updateDisplaySetting: (key: keyof GameSettings['display'], value: any) => Promise<void>;
}

export function useSettings(): UseSettingsReturn {
    const [settings, setSettings] = useState<GameSettings>(defaultSettings);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load settings from backend on mount
    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);
            setError(null);

            // Try to load from Electron IPC if available
            if (typeof window !== 'undefined' && (window as any).electronAPI) {
                const loadedSettings = await (window as any).electronAPI.settings.get();
                if (loadedSettings) {
                    setSettings({ ...defaultSettings, ...loadedSettings });
                } else {
                    setSettings(defaultSettings);
                }
            } else {
                // Fallback to localStorage for web version
                const stored = localStorage.getItem('prg-settings');
                if (stored) {
                    try {
                        const parsed = JSON.parse(stored);
                        setSettings({ ...defaultSettings, ...parsed });
                    } catch {
                        setSettings(defaultSettings);
                    }
                } else {
                    setSettings(defaultSettings);
                }
            }
        } catch (err) {

            console.error('Failed to load settings:', err);
            setError('설정을 불러오는 데 실패했습니다');
            setSettings(defaultSettings);
        } finally {
            setLoading(false);
        }
    };

    // Helper function to set nested property by path
    const setNestedProperty = (obj: any, path: string, value: any) => {
        const keys = path.split('.');
        let current = obj;

        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            if (key && !(key in current)) {
                current[key] = {};
            }
            if (key) {
                current = current[key];
            }
        }

        const finalKey = keys[keys.length - 1];
        if (finalKey) {
            current[finalKey] = value;
        }
    };

    const updateSetting = useCallback(async (path: string, value: any) => {
        try {
            const newSettings = { ...settings };
            setNestedProperty(newSettings, path, value);
            setSettings(newSettings);

            // Save to backend
            await saveSettingsToBackend(newSettings);
        } catch (err) {
            console.error('Failed to update setting:', err);
            setError('설정 업데이트에 실패했습니다');
            // Revert on error
            await loadSettings();
        }
    }, [settings]);

    const resetSettings = useCallback(async () => {
        try {
            setSettings(defaultSettings);
            await saveSettingsToBackend(defaultSettings);
        } catch (err) {
            console.error('Failed to reset settings:', err);
            setError('설정 초기화에 실패했습니다');
        }
    }, []);

    const saveSettings = useCallback(async () => {
        try {
            await saveSettingsToBackend(settings);
        } catch (err) {
            console.error('Failed to save settings:', err);
            setError('설정 저장에 실패했습니다');
        }
    }, [settings]);

    const saveSettingsToBackend = async (settingsToSave: GameSettings) => {
        if (typeof window !== 'undefined' && (window as any).electronAPI) {
            await (window as any).electronAPI.settings.set(settingsToSave);
        } else {
            // Fallback to localStorage
            localStorage.setItem('prg-settings', JSON.stringify(settingsToSave));
        }
    };

    // Convenience methods for specific setting categories
    const updateAudioSetting = useCallback(async (key: keyof GameSettings['audio'], value: any) => {
        await updateSetting(`audio.${key}`, value);
    }, [updateSetting]);

    const updateGameSetting = useCallback(async (key: keyof GameSettings['game'], value: any) => {
        await updateSetting(`game.${key}`, value);
    }, [updateSetting]);

    const updateControlSetting = useCallback(async (key: keyof GameSettings['controls'], value: any) => {
        await updateSetting(`controls.${key}`, value);
    }, [updateSetting]);

    const updateDisplaySetting = useCallback(async (key: keyof GameSettings['display'], value: any) => {
        await updateSetting(`display.${key}`, value);
    }, [updateSetting]);

    return {
        settings,
        loading,
        error,
        updateSetting,
        resetSettings,
        saveSettings,
        updateAudioSetting,
        updateGameSetting,
        updateControlSetting,
        updateDisplaySetting,
    };
}

export default useSettings;
