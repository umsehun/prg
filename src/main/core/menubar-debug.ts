/**
 * macOS MenuBar Debugging Utility
 * Helps diagnose menubar visibility issues
 */

import { app, Menu, systemPreferences } from 'electron';
import { logger } from '../../shared/globals/logger';

export function debugMacOSMenuBar(): void {
    if (process.platform !== 'darwin') {
        logger.info('menubar-debug', 'Not macOS, skipping menubar debug');
        return;
    }

    try {
        logger.info('menubar-debug', '🔍 macOS MenuBar Debug Information:');

        // App info
        logger.info('menubar-debug', `App Name: "${app.getName()}"`);
        logger.info('menubar-debug', `App Version: "${app.getVersion()}"`);
        logger.info('menubar-debug', `Bundle ID: "${app.getName()}"`);

        // Dock info
        logger.info('menubar-debug', `Dock visible: ${app.dock ? 'Yes' : 'No'}`);

        // Menu info
        const currentMenu = Menu.getApplicationMenu();
        logger.info('menubar-debug', `Current menu set: ${currentMenu ? 'Yes' : 'No'}`);
        if (currentMenu) {
            logger.info('menubar-debug', `Menu items count: ${currentMenu.items.length}`);
            const appMenuItem = currentMenu.items[0];
            if (appMenuItem) {
                logger.info('menubar-debug', `First menu item label: "${appMenuItem.label}"`);
            }
        }

        // System preferences
        try {
            const autoHideMenuBar = systemPreferences.getUserDefault('AppleMenuBarVisibleInFullscreen', 'boolean');
            logger.info('menubar-debug', `System auto-hide menubar: ${autoHideMenuBar}`);
        } catch (e) {
            logger.warn('menubar-debug', 'Could not get system menubar preference:', e);
        }

        // Environment variables
        logger.info('menubar-debug', `CFBundleName: "${process.env.CFBundleName || 'Not set'}"`);
        logger.info('menubar-debug', `CFBundleDisplayName: "${process.env.CFBundleDisplayName || 'Not set'}"`);

        // App state
        logger.info('menubar-debug', `App ready: ${app.isReady()}`);
        logger.info('menubar-debug', `App active: ${app.isSecureKeyboardEntryEnabled ? app.isSecureKeyboardEntryEnabled() : 'Unknown'}`);

        // LSUIElement check
        const isLSUIElement = process.env.LSUIElement === 'true' || process.env.LSUIElement === '1';
        logger.info('menubar-debug', `LSUIElement: ${isLSUIElement ? 'Yes (PROBLEM!)' : 'No (Good)'}`);

        if (isLSUIElement) {
            logger.error('menubar-debug', '❌ LSUIElement is enabled - this HIDES the menubar!');
            logger.info('menubar-debug', '💡 To fix: Set LSUIElement to false in Info.plist or remove it');
        }

    } catch (error) {
        logger.error('menubar-debug', 'Failed to debug macOS menubar:', error);
    }
}

export function forceMacOSMenuBarVisible(): void {
    if (process.platform !== 'darwin') {
        return;
    }

    try {
        logger.info('menubar-debug', '🔧 Forcing macOS menubar visibility...');

        // Multiple aggressive approaches
        const forceMenu = () => {
            // Ensure dock is shown
            app.dock?.show();

            // Focus the app
            app.focus({ steal: true });

            // Re-set the menu
            const currentMenu = Menu.getApplicationMenu();
            if (currentMenu) {
                Menu.setApplicationMenu(currentMenu);
            }

            // Move all windows to front
            const { BrowserWindow } = require('electron');
            const windows = BrowserWindow.getAllWindows();
            windows.forEach((window: any) => {
                if (!window.isDestroyed()) {
                    window.moveTop();
                    window.focus();
                }
            });
        };

        // Execute multiple times with different delays
        forceMenu();
        setTimeout(forceMenu, 100);
        setTimeout(forceMenu, 500);
        setTimeout(forceMenu, 1000);
        setTimeout(forceMenu, 2000);

        logger.info('menubar-debug', '✅ MenuBar forcing completed');

    } catch (error) {
        logger.error('menubar-debug', 'Failed to force menubar visibility:', error);
    }
}
