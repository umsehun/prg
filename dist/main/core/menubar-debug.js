"use strict";
/**
 * macOS MenuBar Debugging Utility
 * Helps diagnose menubar visibility issues
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.debugMacOSMenuBar = debugMacOSMenuBar;
exports.forceMacOSMenuBarVisible = forceMacOSMenuBarVisible;
const electron_1 = require("electron");
const logger_1 = require("../../shared/globals/logger");
function debugMacOSMenuBar() {
    if (process.platform !== 'darwin') {
        logger_1.logger.info('menubar-debug', 'Not macOS, skipping menubar debug');
        return;
    }
    try {
        logger_1.logger.info('menubar-debug', '🔍 macOS MenuBar Debug Information:');
        // App info
        logger_1.logger.info('menubar-debug', `App Name: "${electron_1.app.getName()}"`);
        logger_1.logger.info('menubar-debug', `App Version: "${electron_1.app.getVersion()}"`);
        logger_1.logger.info('menubar-debug', `Bundle ID: "${electron_1.app.getName()}"`);
        // Dock info
        logger_1.logger.info('menubar-debug', `Dock visible: ${electron_1.app.dock ? 'Yes' : 'No'}`);
        // Menu info
        const currentMenu = electron_1.Menu.getApplicationMenu();
        logger_1.logger.info('menubar-debug', `Current menu set: ${currentMenu ? 'Yes' : 'No'}`);
        if (currentMenu) {
            logger_1.logger.info('menubar-debug', `Menu items count: ${currentMenu.items.length}`);
            const appMenuItem = currentMenu.items[0];
            if (appMenuItem) {
                logger_1.logger.info('menubar-debug', `First menu item label: "${appMenuItem.label}"`);
            }
        }
        // System preferences
        try {
            const autoHideMenuBar = electron_1.systemPreferences.getUserDefault('AppleMenuBarVisibleInFullscreen', 'boolean');
            logger_1.logger.info('menubar-debug', `System auto-hide menubar: ${autoHideMenuBar}`);
        }
        catch (e) {
            logger_1.logger.warn('menubar-debug', 'Could not get system menubar preference:', e);
        }
        // Environment variables
        logger_1.logger.info('menubar-debug', `CFBundleName: "${process.env.CFBundleName || 'Not set'}"`);
        logger_1.logger.info('menubar-debug', `CFBundleDisplayName: "${process.env.CFBundleDisplayName || 'Not set'}"`);
        // App state
        logger_1.logger.info('menubar-debug', `App ready: ${electron_1.app.isReady()}`);
        logger_1.logger.info('menubar-debug', `App active: ${electron_1.app.isSecureKeyboardEntryEnabled ? electron_1.app.isSecureKeyboardEntryEnabled() : 'Unknown'}`);
        // LSUIElement check
        const isLSUIElement = process.env.LSUIElement === 'true' || process.env.LSUIElement === '1';
        logger_1.logger.info('menubar-debug', `LSUIElement: ${isLSUIElement ? 'Yes (PROBLEM!)' : 'No (Good)'}`);
        if (isLSUIElement) {
            logger_1.logger.error('menubar-debug', '❌ LSUIElement is enabled - this HIDES the menubar!');
            logger_1.logger.info('menubar-debug', '💡 To fix: Set LSUIElement to false in Info.plist or remove it');
        }
    }
    catch (error) {
        logger_1.logger.error('menubar-debug', 'Failed to debug macOS menubar:', error);
    }
}
function forceMacOSMenuBarVisible() {
    if (process.platform !== 'darwin') {
        return;
    }
    try {
        logger_1.logger.info('menubar-debug', '🔧 Forcing macOS menubar visibility...');
        // Multiple aggressive approaches
        const forceMenu = () => {
            // Ensure dock is shown
            electron_1.app.dock?.show();
            // Focus the app
            electron_1.app.focus({ steal: true });
            // Re-set the menu
            const currentMenu = electron_1.Menu.getApplicationMenu();
            if (currentMenu) {
                electron_1.Menu.setApplicationMenu(currentMenu);
            }
            // Move all windows to front
            const { BrowserWindow } = require('electron');
            const windows = BrowserWindow.getAllWindows();
            windows.forEach((window) => {
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
        logger_1.logger.info('menubar-debug', '✅ MenuBar forcing completed');
    }
    catch (error) {
        logger_1.logger.error('menubar-debug', 'Failed to force menubar visibility:', error);
    }
}
