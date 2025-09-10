"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupIpcHandlers = setupIpcHandlers;
// src/main/core/ipcHandlers.ts
const electron_1 = require("electron");
const ChartImportService_1 = require("../services/ChartImportService");
function setupIpcHandlers() {
    const chartImportService = new ChartImportService_1.ChartImportService();
    electron_1.ipcMain.handle('songs:get-all', async () => {
        try {
            return await chartImportService.autoScanOszFiles();
        }
        catch (error) {
            console.error('Failed to get chart list:', error);
            throw new Error('Failed to retrieve chart list from the backend.');
        }
    });
    electron_1.ipcMain.handle('songs:toggle-favorite', async (_event, songId) => {
        // This is a placeholder. In a real app, you would have a database or
        // a file where you store user preferences.
        console.log(`Toggling favorite for song ID: ${songId}`);
        // For now, we'll just log it and return success.
        return { success: true };
    });
    // You can add more handlers here as your application grows
    console.log('IPC handlers set up.');
}
