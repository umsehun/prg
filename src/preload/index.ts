/**
 * Preload script - secure bridge between main and renderer processes
 * Exposes limited, type-safe APIs to the renderer
 */

import { contextBridge, ipcRenderer } from 'electron';

// Game API
const gameApi = {
    // Start game with chart data
    start: (chartData: any) => ipcRenderer.invoke('game:start', chartData),

    // Stop current game
    stop: () => ipcRenderer.invoke('game:stop'),

    // Throw knife (fire-and-forget)
    throwKnife: (throwData: { id: string; time: number }) =>
        ipcRenderer.send('game:knife-throw', throwData),

    // Pause/resume
    pause: () => ipcRenderer.invoke('game:pause'),
    resume: () => ipcRenderer.invoke('game:resume'),

    // Listen for game events
    onKnifeResult: (callback: (result: any) => void) => {
        ipcRenderer.on('game:knife-result', (_event, result) => callback(result));
        return () => ipcRenderer.removeAllListeners('game:knife-result');
    },
};

// OSZ API  
const oszApi = {
    // Import OSZ file
    import: (filePath?: string) => ipcRenderer.invoke('osz:import', filePath),

    // Get chart library
    getLibrary: () => ipcRenderer.invoke('osz:get-library'),

    // Remove chart
    removeChart: (chartId: string) => ipcRenderer.invoke('osz:remove-chart', chartId),

    // Get audio data
    getAudio: (chartId: string) => ipcRenderer.invoke('osz:get-audio', chartId),
};

// Settings API
const settingsApi = {
    // Get all settings
    getAll: () => ipcRenderer.invoke('settings:get-all'),

    // Get specific setting
    get: (key: string) => ipcRenderer.invoke('settings:get', key),

    // Set setting
    set: (key: string, value: any) => ipcRenderer.invoke('settings:set', key, value),

    // Reset to defaults
    reset: () => ipcRenderer.invoke('settings:reset'),

    // Export/import
    export: () => ipcRenderer.invoke('settings:export'),
    import: () => ipcRenderer.invoke('settings:import'),

    // Listen for setting changes
    onChange: (callback: (change: { key: string; value: any }) => void) => {
        ipcRenderer.on('settings:changed', (_event, change) => callback(change));
        return () => ipcRenderer.removeAllListeners('settings:changed');
    },

    onReset: (callback: (settings: any) => void) => {
        ipcRenderer.on('settings:reset', (_event, settings) => callback(settings));
        return () => ipcRenderer.removeAllListeners('settings:reset');
    },
};

// System API
const systemApi = {
    // Platform info
    platform: process.platform,

    // App version (if available)
    version: process.env.npm_package_version || '1.0.0',

    // Development mode check
    isDev: process.env.NODE_ENV === 'development'
};

// Expose APIs to renderer process
contextBridge.exposeInMainWorld('electronAPI', {
    game: gameApi,
    osz: oszApi,
    settings: settingsApi,
    system: systemApi
});

// Types for renderer (this will be used in renderer's type definitions)
export interface ElectronAPI {
    game: typeof gameApi;
    osz: typeof oszApi;
    settings: typeof settingsApi;
    system: typeof systemApi;
}
