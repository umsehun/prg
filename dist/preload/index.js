"use strict";
/**
 * Preload script - secure bridge between main and renderer processes
 * Exposes limited APIs to the renderer with full TypeScript support
 */
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
// Game API with proper typing
const gameApi = {
    // Start game with chart data
    start: (params) => electron_1.ipcRenderer.invoke('game:start', params),
    // Stop current game
    stop: () => electron_1.ipcRenderer.invoke('game:stop'),
    // Throw knife (fire-and-forget)
    throwKnife: (throwData) => electron_1.ipcRenderer.send('game:knife-throw', throwData),
    // Pause/resume
    pause: () => electron_1.ipcRenderer.invoke('game:pause'),
    resume: () => electron_1.ipcRenderer.invoke('game:resume'),
    // Listen for game events with cleanup
    onKnifeResult: (callback) => {
        const handler = (_event, result) => callback(result);
        electron_1.ipcRenderer.on('game:knife-result', handler);
        return () => electron_1.ipcRenderer.removeListener('game:knife-result', handler);
    },
    // Listen for knife throw processed events
    onKnifeThrowProcessed: (callback) => {
        const handler = (_event, data) => callback(data);
        electron_1.ipcRenderer.on('game:knife-throw-processed', handler);
        return () => electron_1.ipcRenderer.removeListener('game:knife-throw-processed', handler);
    },
};
// OSZ/Charts API with proper typing
const chartsApi = {
    // Get chart library
    getLibrary: () => electron_1.ipcRenderer.invoke('osz:get-library'),
    // Get specific chart
    getChart: (chartId) => electron_1.ipcRenderer.invoke('osz:get-chart', chartId),
    // Import OSZ file
    import: (filePath) => electron_1.ipcRenderer.invoke('osz:import', filePath),
    // Remove chart
    remove: (chartId) => electron_1.ipcRenderer.invoke('osz:remove-chart', chartId),
    // Get audio data
    getAudio: (chartId) => electron_1.ipcRenderer.invoke('osz:get-audio', chartId),
    // Get background image
    getBackground: (chartId) => electron_1.ipcRenderer.invoke('osz:get-background', chartId),
};
// OSZ API (legacy compatibility)
const oszApi = {
    // Get chart library (same as charts.getLibrary)
    getLibrary: () => electron_1.ipcRenderer.invoke('osz:get-library'),
    // Import OSZ file
    importFile: (filePath) => electron_1.ipcRenderer.invoke('osz:import', filePath),
    // Parse OSZ file
    parseOsz: (filePath) => electron_1.ipcRenderer.invoke('osz:parse', filePath),
    // Get audio path
    getAudioPath: (songId) => electron_1.ipcRenderer.invoke('osz:get-audio-path', songId),
};
// Settings API with proper typing
const settingsApi = {
    // Get all settings
    getAll: () => electron_1.ipcRenderer.invoke('settings:get-all'),
    // Set setting
    set: (key, value) => electron_1.ipcRenderer.invoke('settings:set', key, value),
    // Reset to defaults
    reset: () => electron_1.ipcRenderer.invoke('settings:reset'),
    // Listen for setting changes with cleanup
    onChange: (callback) => {
        const handler = (_event, settings) => callback(settings);
        electron_1.ipcRenderer.on('settings:changed', handler);
        return () => electron_1.ipcRenderer.removeListener('settings:changed', handler);
    },
};
// System API with proper typing
const systemApi = {
    // Get app version
    getVersion: () => electron_1.ipcRenderer.invoke('system:get-version'),
    // Open external URL
    openExternal: (url) => electron_1.ipcRenderer.invoke('system:open-external', url),
    // Show message box
    showMessageBox: (options) => electron_1.ipcRenderer.invoke('system:show-message-box', options),
    // Platform info
    platform: process.platform,
    // Development mode check
    isDev: process.env.NODE_ENV === 'development'
};
// Expose APIs to renderer process with type safety
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    game: gameApi,
    charts: chartsApi,
    osz: oszApi, // Add OSZ API
    settings: settingsApi,
    system: systemApi
});
// Debug logging
console.log('✅ Preload script (TypeScript) loaded successfully');
console.log('✅ ElectronAPI exposed with types:', {
    game: Object.keys(gameApi),
    charts: Object.keys(chartsApi),
    osz: Object.keys(oszApi), // Add OSZ API logging
    settings: Object.keys(settingsApi),
    system: Object.keys(systemApi)
});
