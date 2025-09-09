/**
 * Preload script - secure bridge between main and renderer processes
 * Exposes limited APIs to the renderer with full TypeScript support
 */

import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

// Type definitions for API
interface ThrowData {
    timestamp: number;
    angle: number;
    force: number;
    position: { x: number; y: number };
}

interface ChartData {
    id: string;
    title: string;
    artist: string;
    difficulty: string;
    audioPath: string;
    backgroundPath?: string;
    bpm: number;
    duration: number;
}

interface KnifeResult {
    success: boolean;
    judgment?: 'KOOL' | 'COOL' | 'GOOD' | 'MISS';
    score?: number;
    combo?: number;
}

interface Settings {
    [key: string]: any;
}

interface MessageBoxOptions {
    type?: 'info' | 'warning' | 'error' | 'question';
    title?: string;
    message: string;
    buttons?: string[];
}

// Game API with proper typing
const gameApi = {
    // Start game with chart data
    start: (params: { chartData: ChartData; gameMode: string; mods?: string[] }): Promise<{ success: boolean; message?: string; error?: string }> =>
        ipcRenderer.invoke('game:start', params),

    // Stop current game
    stop: (): Promise<void> =>
        ipcRenderer.invoke('game:stop'),

    // Throw knife (fire-and-forget)
    throwKnife: (throwData: ThrowData): void =>
        ipcRenderer.send('game:knife-throw', throwData),

    // Pause/resume
    pause: (): Promise<void> => ipcRenderer.invoke('game:pause'),
    resume: (): Promise<void> => ipcRenderer.invoke('game:resume'),

    // Listen for game events with cleanup
    onKnifeResult: (callback: (result: KnifeResult) => void): (() => void) => {
        const handler = (_event: IpcRendererEvent, result: KnifeResult) => callback(result);
        ipcRenderer.on('game:knife-result', handler);
        return () => ipcRenderer.removeListener('game:knife-result', handler);
    },

    // Listen for knife throw processed events
    onKnifeThrowProcessed: (callback: (data: any) => void): (() => void) => {
        const handler = (_event: IpcRendererEvent, data: any) => callback(data);
        ipcRenderer.on('game:knife-throw-processed', handler);
        return () => ipcRenderer.removeListener('game:knife-throw-processed', handler);
    },
};

// OSZ/Charts API with proper typing
const chartsApi = {
    // Get chart library
    getLibrary: (): Promise<ChartData[]> =>
        ipcRenderer.invoke('osz:get-library'),

    // Get specific chart
    getChart: (chartId: string): Promise<ChartData | null> =>
        ipcRenderer.invoke('osz:get-chart', chartId),

    // Import OSZ file
    import: (filePath: string): Promise<boolean> =>
        ipcRenderer.invoke('osz:import', filePath),

    // Remove chart
    remove: (chartId: string): Promise<boolean> =>
        ipcRenderer.invoke('osz:remove-chart', chartId),

    // Get audio data
    getAudio: (chartId: string): Promise<ArrayBuffer | null> =>
        ipcRenderer.invoke('osz:get-audio', chartId),

    // Get background image
    getBackground: (chartId: string): Promise<ArrayBuffer | null> =>
        ipcRenderer.invoke('osz:get-background', chartId),
};

// OSZ API (legacy compatibility)
const oszApi = {
    // Get chart library (same as charts.getLibrary)
    getLibrary: (): Promise<any> =>
        ipcRenderer.invoke('osz:get-library'),

    // Import OSZ file
    importFile: (filePath: string): Promise<any> =>
        ipcRenderer.invoke('osz:import', filePath),

    // Parse OSZ file
    parseOsz: (filePath: string): Promise<any> =>
        ipcRenderer.invoke('osz:parse', filePath),

    // Get audio path
    getAudioPath: (songId: string): Promise<string> =>
        ipcRenderer.invoke('osz:get-audio-path', songId),
};

// Settings API with proper typing
const settingsApi = {
    // Get all settings
    getAll: (): Promise<Settings> =>
        ipcRenderer.invoke('settings:get-all'),

    // Set setting
    set: (key: string, value: any): Promise<void> =>
        ipcRenderer.invoke('settings:set', key, value),

    // Reset to defaults
    reset: (): Promise<void> =>
        ipcRenderer.invoke('settings:reset'),

    // Listen for setting changes with cleanup
    onChange: (callback: (settings: Settings) => void): (() => void) => {
        const handler = (_event: IpcRendererEvent, settings: Settings) => callback(settings);
        ipcRenderer.on('settings:changed', handler);
        return () => ipcRenderer.removeListener('settings:changed', handler);
    },
};

// System API with proper typing
const systemApi = {
    // Get app version
    getVersion: (): Promise<string> =>
        ipcRenderer.invoke('system:get-version'),

    // Open external URL
    openExternal: (url: string): Promise<void> =>
        ipcRenderer.invoke('system:open-external', url),

    // Show message box
    showMessageBox: (options: MessageBoxOptions): Promise<number> =>
        ipcRenderer.invoke('system:show-message-box', options),

    // Platform info
    platform: process.platform,

    // Development mode check
    isDev: process.env.NODE_ENV === 'development'
};

// Combined API interface
export interface ElectronAPI {
    game: typeof gameApi;
    charts: typeof chartsApi;
    osz: typeof oszApi; // Add OSZ API for legacy compatibility
    settings: typeof settingsApi;
    system: typeof systemApi;
}

// Expose APIs to renderer process with type safety
contextBridge.exposeInMainWorld('electronAPI', {
    game: gameApi,
    charts: chartsApi,
    osz: oszApi, // Add OSZ API
    settings: settingsApi,
    system: systemApi
} as ElectronAPI);

// Debug logging
console.log('✅ Preload script (TypeScript) loaded successfully');
console.log('✅ ElectronAPI exposed with types:', {
    game: Object.keys(gameApi),
    charts: Object.keys(chartsApi),
    osz: Object.keys(oszApi), // Add OSZ API logging
    settings: Object.keys(settingsApi),
    system: Object.keys(systemApi)
});