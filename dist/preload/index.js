"use strict";
// src/preload/index.js
const { contextBridge, ipcRenderer } = require('electron');
/**
 * @type {import('../types/ipc').IpcApi}
 */
const api = {
    startGame: (chart) => ipcRenderer.invoke('startGame', chart),
    stopGame: () => ipcRenderer.invoke('stopGame'),
    handlePinPress: (currentTimeSec) => ipcRenderer.send('handle-pin-press', currentTimeSec),
    loadPinChart: (chartPath) => ipcRenderer.invoke('load-pin-chart', chartPath),
    discoverCharts: () => ipcRenderer.invoke('discover-charts'),
    // OSZ Import functionality
    invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
    getChartLibrary: () => ipcRenderer.invoke('get-chart-library'),
    importOszFile: (filePath) => ipcRenderer.invoke('import-osz-file', filePath),
    selectOszFile: () => ipcRenderer.invoke('select-osz-file'),
    convertDifficultyToPinChart: (oszChart, difficultyIndex) => ipcRenderer.invoke('convert-difficulty-to-pin-chart', oszChart, difficultyIndex),
    convertOszToPinChart: (chartMetadata) => ipcRenderer.invoke('convert-osz-to-pin-chart', chartMetadata),
    onGameUpdate: (callback) => {
        const listener = (event, args) => callback(args);
        ipcRenderer.on('gameUpdate', listener);
        return () => {
            ipcRenderer.removeListener('gameUpdate', listener);
        };
    },
    onPlayMusic: (callback) => {
        const listener = (event, args) => callback(args);
        ipcRenderer.on('playMusic', listener);
        return () => {
            ipcRenderer.removeListener('playMusic', listener);
        };
    },
    onStopMusic: (callback) => {
        const listener = () => callback();
        ipcRenderer.on('stopMusic', listener);
        return () => {
            ipcRenderer.removeListener('stopMusic', listener);
        };
    },
    onNoteUpdate: (callback) => {
        const listener = (event, notes) => callback(notes);
        ipcRenderer.on('noteUpdate', listener);
        return () => {
            ipcRenderer.removeListener('noteUpdate', listener);
        };
    },
    getSetting: (key) => ipcRenderer.invoke('getSetting', key),
    setSetting: (key, value) => ipcRenderer.send('setSetting', key, value),
    loadAsset: (assetPath) => ipcRenderer.invoke('load-asset', assetPath),
    assetExists: (assetPath) => ipcRenderer.invoke('asset-exists', assetPath),
    importAllOszFiles: (assetsPath) => ipcRenderer.invoke('import-all-osz-files', assetsPath),
};
contextBridge.exposeInMainWorld('electron', api);
