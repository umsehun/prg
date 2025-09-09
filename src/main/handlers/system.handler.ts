/**
 * System Handler - System-level IPC handlers
 * Handles window controls and system operations
 */

import { ipcMain, BrowserWindow } from 'electron';
import { logger } from '../../shared/globals/logger';
import { PlatformUtils } from '../utils/platform';

export function setupSystemHandlers(mainWindow: BrowserWindow): void {
    // Window minimize
    ipcMain.handle('system:minimize', () => {
        try {
            mainWindow.minimize();
            logger.debug('system', 'Window minimized');
            return { success: true };
        } catch (error) {
            logger.error('system', 'Failed to minimize window', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    });

    // Window maximize/restore toggle
    ipcMain.handle('system:toggle-maximize', () => {
        try {
            if (mainWindow.isMaximized()) {
                mainWindow.restore();
                logger.debug('system', 'Window restored');
            } else {
                mainWindow.maximize();
                logger.debug('system', 'Window maximized');
            }
            return {
                success: true,
                isMaximized: mainWindow.isMaximized()
            };
        } catch (error) {
            logger.error('system', 'Failed to toggle maximize window', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    });

    // Window close
    ipcMain.handle('system:close', () => {
        try {
            mainWindow.close();
            logger.debug('system', 'Window closed');
            return { success: true };
        } catch (error) {
            logger.error('system', 'Failed to close window', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    });

    // Get platform info
    ipcMain.handle('system:get-platform-info', () => {
        try {
            const info = PlatformUtils.info;
            logger.debug('system', 'Platform info requested', info);
            return {
                success: true,
                info
            };
        } catch (error) {
            logger.error('system', 'Failed to get platform info', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    });

    // Toggle fullscreen
    ipcMain.handle('system:toggle-fullscreen', () => {
        try {
            const isFullScreen = mainWindow.isFullScreen();
            mainWindow.setFullScreen(!isFullScreen);
            logger.debug('system', `Fullscreen toggled: ${!isFullScreen}`);
            return {
                success: true,
                isFullScreen: !isFullScreen
            };
        } catch (error) {
            logger.error('system', 'Failed to toggle fullscreen', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    });

    // Open external URL
    ipcMain.handle('system:open-external', async (_event, url: string) => {
        try {
            const { shell } = require('electron');
            await shell.openExternal(url);
            logger.debug('system', `External URL opened: ${url}`);
            return { success: true };
        } catch (error) {
            logger.error('system', 'Failed to open external URL', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    });

    logger.info('system', 'System handlers setup completed');
}
