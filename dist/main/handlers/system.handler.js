"use strict";
/**
 * System Handler - System-level IPC handlers
 * Handles window controls and system operations
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSystemHandlers = setupSystemHandlers;
const electron_1 = require("electron");
const logger_1 = require("../../shared/globals/logger");
const platform_1 = require("../utils/platform");
function setupSystemHandlers(mainWindow) {
    // Window minimize
    electron_1.ipcMain.handle('system:minimize', () => {
        try {
            mainWindow.minimize();
            logger_1.logger.debug('system', 'Window minimized');
            return { success: true };
        }
        catch (error) {
            logger_1.logger.error('system', 'Failed to minimize window', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    });
    // Window maximize/restore toggle
    electron_1.ipcMain.handle('system:toggle-maximize', () => {
        try {
            if (mainWindow.isMaximized()) {
                mainWindow.restore();
                logger_1.logger.debug('system', 'Window restored');
            }
            else {
                mainWindow.maximize();
                logger_1.logger.debug('system', 'Window maximized');
            }
            return {
                success: true,
                isMaximized: mainWindow.isMaximized()
            };
        }
        catch (error) {
            logger_1.logger.error('system', 'Failed to toggle maximize window', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    });
    // Window close
    electron_1.ipcMain.handle('system:close', () => {
        try {
            mainWindow.close();
            logger_1.logger.debug('system', 'Window closed');
            return { success: true };
        }
        catch (error) {
            logger_1.logger.error('system', 'Failed to close window', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    });
    // Get platform info
    electron_1.ipcMain.handle('system:get-platform-info', () => {
        try {
            const info = platform_1.PlatformUtils.info;
            logger_1.logger.debug('system', 'Platform info requested', info);
            return {
                success: true,
                info
            };
        }
        catch (error) {
            logger_1.logger.error('system', 'Failed to get platform info', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    });
    // Toggle fullscreen
    electron_1.ipcMain.handle('system:toggle-fullscreen', () => {
        try {
            const isFullScreen = mainWindow.isFullScreen();
            mainWindow.setFullScreen(!isFullScreen);
            logger_1.logger.debug('system', `Fullscreen toggled: ${!isFullScreen}`);
            return {
                success: true,
                isFullScreen: !isFullScreen
            };
        }
        catch (error) {
            logger_1.logger.error('system', 'Failed to toggle fullscreen', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    });
    // Open external URL
    electron_1.ipcMain.handle('system:open-external', async (_event, url) => {
        try {
            const { shell } = require('electron');
            await shell.openExternal(url);
            logger_1.logger.debug('system', `External URL opened: ${url}`);
            return { success: true };
        }
        catch (error) {
            logger_1.logger.error('system', 'Failed to open external URL', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    });
    logger_1.logger.info('system', 'System handlers setup completed');
}
