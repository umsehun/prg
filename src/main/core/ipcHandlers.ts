// src/main/core/ipcHandlers.ts
import { ipcMain } from 'electron';
import { ChartImportService } from '../services/ChartImportService';

export function setupIpcHandlers() {
    const chartImportService = new ChartImportService();

    ipcMain.handle('songs:get-all', async () => {
        try {
            return await chartImportService.autoScanOszFiles();
        } catch (error) {
            console.error('Failed to get chart list:', error);
            throw new Error('Failed to retrieve chart list from the backend.');
        }
    });

    ipcMain.handle('songs:toggle-favorite', async (_event, songId: string) => {
        // This is a placeholder. In a real app, you would have a database or
        // a file where you store user preferences.
        console.log(`Toggling favorite for song ID: ${songId}`);
        // For now, we'll just log it and return success.
        return { success: true };
    });

    // You can add more handlers here as your application grows
    console.log('IPC handlers set up.');
}
