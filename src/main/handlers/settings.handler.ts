/**
 * Simple Settings Handler - for UI development
 */

import { ipcMain, BrowserWindow } from 'electron';
import { logger } from '../../shared/globals/logger';
import { ApplicationCore } from '../core/app';

export function setupSettingsHandlers(_mainWindow: BrowserWindow): void {
    // Get all settings
    ipcMain.handle('settings:get-all', async () => {
        try {
            const app = ApplicationCore.getInstance();
            const settingsManager = app.getSettingsManager();
            const settings = settingsManager.getSettings();

            return {
                success: true,
                settings
            };
        } catch (error) {
            logger.error('settings', 'Failed to get settings', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    });

    // Set individual setting
    ipcMain.handle('settings:set', async (_event, key: string, value: any) => {
        try {
            const app = ApplicationCore.getInstance();
            const settingsManager = app.getSettingsManager();

            await settingsManager.updateSetting(key, value);

            return {
                success: true,
                message: `Setting ${key} updated`
            };
        } catch (error) {
            logger.error('settings', 'Failed to set setting', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    });

    // Reset all settings
    ipcMain.handle('settings:reset', async () => {
        try {
            const app = ApplicationCore.getInstance();
            const settingsManager = app.getSettingsManager();

            await settingsManager.resetToDefaults();
            const settings = settingsManager.getSettings();

            return {
                success: true,
                settings
            };
        } catch (error) {
            logger.error('settings', 'Failed to reset settings', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    });

    // Settings change listener (mock for now)
    ipcMain.on('settings:onChange', (_event, _callback) => {
        // In a real implementation, this would set up a listener
        // For now, we'll just acknowledge it
        logger.debug('settings', 'Settings change listener registered');
    });

    logger.info('ipc', 'Simple settings handlers registered');
}
