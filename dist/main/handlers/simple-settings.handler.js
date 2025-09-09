"use strict";
/**
 * Simple Settings Handler - for UI development
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSimpleSettingsHandlers = setupSimpleSettingsHandlers;
const electron_1 = require("electron");
const logger_1 = require("../../shared/globals/logger");
const app_1 = require("../core/app");
function setupSimpleSettingsHandlers(_mainWindow) {
    // Get all settings
    electron_1.ipcMain.handle('settings:get-all', async () => {
        try {
            const app = app_1.ApplicationCore.getInstance();
            const settingsManager = app.getSettingsManager();
            const settings = settingsManager.getSettings();
            return {
                success: true,
                settings
            };
        }
        catch (error) {
            logger_1.logger.error('settings', 'Failed to get settings', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    });
    // Set individual setting
    electron_1.ipcMain.handle('settings:set', async (_event, key, value) => {
        try {
            const app = app_1.ApplicationCore.getInstance();
            const settingsManager = app.getSettingsManager();
            await settingsManager.updateSetting(key, value);
            return {
                success: true,
                message: `Setting ${key} updated`
            };
        }
        catch (error) {
            logger_1.logger.error('settings', 'Failed to set setting', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    });
    // Reset all settings
    electron_1.ipcMain.handle('settings:reset', async () => {
        try {
            const app = app_1.ApplicationCore.getInstance();
            const settingsManager = app.getSettingsManager();
            await settingsManager.resetToDefaults();
            const settings = settingsManager.getSettings();
            return {
                success: true,
                settings
            };
        }
        catch (error) {
            logger_1.logger.error('settings', 'Failed to reset settings', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    });
    // Settings change listener (mock for now)
    electron_1.ipcMain.on('settings:onChange', (_event, _callback) => {
        // In a real implementation, this would set up a listener
        // For now, we'll just acknowledge it
        logger_1.logger.debug('settings', 'Settings change listener registered');
    });
    logger_1.logger.info('ipc', 'Simple settings handlers registered');
}
