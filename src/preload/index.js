/**
 * Preload script - secure bridge between main and renderer processes
 * Exposes limited APIs to the renderer
 */

const { contextBridge, ipcRenderer } = require('electron');

// Game API
const gameApi = {
    // Start game with chart data
    start: (chartData) => ipcRenderer.invoke('game:start', chartData),

    // Stop current game
    stop: () => ipcRenderer.invoke('game:stop'),

    // Throw knife (fire-and-forget)
    throwKnife: (throwData) => ipcRenderer.send('game:knife-throw', throwData),

    // Pause/resume
    pause: () => ipcRenderer.invoke('game:pause'),
    resume: () => ipcRenderer.invoke('game:resume'),

    // Listen for game events
    onKnifeResult: (callback) => {
        ipcRenderer.on('game:knife-result', (_event, result) => callback(result));
        return () => ipcRenderer.removeAllListeners('game:knife-result');
    },
};

// OSZ/Charts API  
const chartsApi = {
    // Get chart library
    getLibrary: () => ipcRenderer.invoke('osz:get-library'),

    // Get specific chart
    getChart: (chartId) => ipcRenderer.invoke('osz:get-chart', chartId),

    // Import OSZ file
    import: (filePath) => ipcRenderer.invoke('osz:import', filePath),

    // Remove chart
    remove: (chartId) => ipcRenderer.invoke('osz:remove-chart', chartId),

    // Get audio data
    getAudio: (chartId) => ipcRenderer.invoke('osz:get-audio', chartId),

    // Get background image
    getBackground: (chartId) => ipcRenderer.invoke('osz:get-background', chartId),
};

// Settings API
const settingsApi = {
    // Get all settings
    getAll: () => ipcRenderer.invoke('settings:get-all'),

    // Set setting
    set: (key, value) => ipcRenderer.invoke('settings:set', key, value),

    // Reset to defaults
    reset: () => ipcRenderer.invoke('settings:reset'),

    // Listen for setting changes
    onChange: (callback) => {
        ipcRenderer.on('settings:changed', (_event, settings) => callback(settings));
        return () => ipcRenderer.removeAllListeners('settings:changed');
    },
};

// System API
const systemApi = {
    // Get app version
    getVersion: () => ipcRenderer.invoke('system:get-version'),

    // Open external URL
    openExternal: (url) => ipcRenderer.invoke('system:open-external', url),

    // Show message box
    showMessageBox: (options) => ipcRenderer.invoke('system:show-message-box', options),

    // Platform info
    platform: process.platform,

    // Development mode check
    isDev: process.env.NODE_ENV === 'development'
};

// Expose APIs to renderer process
contextBridge.exposeInMainWorld('electronAPI', {
    game: gameApi,
    charts: chartsApi,
    settings: settingsApi,
    system: systemApi
});

console.log('Preload script loaded successfully');
