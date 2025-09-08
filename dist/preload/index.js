"use strict";
/**
 * Preload script - secure bridge between main and renderer processes
 * Exposes limited, type-safe APIs to the renderer
 */
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
// Game API
const gameApi = {
    // Start game with chart data
    start: (chartData) => electron_1.ipcRenderer.invoke('game:start', chartData),
    // Stop current game
    stop: () => electron_1.ipcRenderer.invoke('game:stop'),
    // Throw knife (fire-and-forget)
    throwKnife: (throwData) => electron_1.ipcRenderer.send('game:knife-throw', throwData),
    // Pause/resume
    pause: () => electron_1.ipcRenderer.invoke('game:pause'),
    resume: () => electron_1.ipcRenderer.invoke('game:resume'),
    // Listen for game events
    onKnifeResult: (callback) => {
        electron_1.ipcRenderer.on('game:knife-result', (_event, result) => callback(result));
        return () => electron_1.ipcRenderer.removeAllListeners('game:knife-result');
    },
};
// OSZ API  
const oszApi = {
    // Import OSZ file
    import: (filePath) => electron_1.ipcRenderer.invoke('osz:import', filePath),
    // Get chart library
    getLibrary: () => electron_1.ipcRenderer.invoke('osz:get-library'),
    // Remove chart
    removeChart: (chartId) => electron_1.ipcRenderer.invoke('osz:remove-chart', chartId),
    // Get audio data
    getAudio: (chartId) => electron_1.ipcRenderer.invoke('osz:get-audio', chartId),
};
// Settings API
const settingsApi = {
    // Get all settings
    getAll: () => electron_1.ipcRenderer.invoke('settings:get-all'),
    // Get specific setting
    get: (key) => electron_1.ipcRenderer.invoke('settings:get', key),
    // Set setting
    set: (key, value) => electron_1.ipcRenderer.invoke('settings:set', key, value),
    // Reset to defaults
    reset: () => electron_1.ipcRenderer.invoke('settings:reset'),
    // Export/import
    export: () => electron_1.ipcRenderer.invoke('settings:export'),
    import: () => electron_1.ipcRenderer.invoke('settings:import'),
    // Listen for setting changes
    onChange: (callback) => {
        electron_1.ipcRenderer.on('settings:changed', (_event, change) => callback(change));
        return () => electron_1.ipcRenderer.removeAllListeners('settings:changed');
    },
    onReset: (callback) => {
        electron_1.ipcRenderer.on('settings:reset', (_event, settings) => callback(settings));
        return () => electron_1.ipcRenderer.removeAllListeners('settings:reset');
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
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    game: gameApi,
    osz: oszApi,
    settings: settingsApi,
    system: systemApi
});
