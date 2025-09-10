"use strict";
/**
 * Main Application Core - Central coordinator for the Electron app
 * Manages application lifecycle, window state, and core services
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.appCore = exports.ApplicationCore = void 0;
const electron_1 = require("electron");
const path_1 = require("path");
const logger_1 = require("../../shared/globals/logger");
const window_manager_1 = require("../managers/window-manager");
const ipc_manager_1 = require("../managers/ipc-manager");
const lifecycle_1 = require("../managers/lifecycle");
const settings_manager_1 = require("../managers/settings-manager");
const platform_1 = require("../utils/platform");
const security_1 = require("./security");
const menu_1 = require("./menu");
const menubar_debug_1 = require("./menubar-debug");
/**
 * Main application class that orchestrates all core components
 */
class ApplicationCore {
    constructor() {
        Object.defineProperty(this, "windowManager", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "ipcManager", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "lifecycleManager", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "settingsManager", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "isInitialized", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        this.windowManager = new window_manager_1.WindowManager();
        this.ipcManager = new ipc_manager_1.IPCManager();
        this.lifecycleManager = new lifecycle_1.LifecycleManager();
        this.settingsManager = new settings_manager_1.SettingsManager();
    }
    /**
     * Singleton instance getter
     */
    static getInstance() {
        if (!ApplicationCore.instance) {
            ApplicationCore.instance = new ApplicationCore();
        }
        return ApplicationCore.instance;
    }
    /**
     * Initialize the application
     */
    async initialize() {
        if (this.isInitialized) {
            logger_1.logger.warn('app', 'Application already initialized');
            return;
        }
        try {
            logger_1.logger.info('app', 'Starting application initialization');
            // Set application name VERY EARLY for menubar
            electron_1.app.setName('Prg');
            // ✅ CRITICAL: For macOS menubar visibility  
            if (platform_1.PlatformUtils.isMacOS) {
                // ENSURE LSUIElement is NOT set (this would hide menubar)
                delete process.env.LSUIElement;
                process.env.LSUIElement = 'false';
                // ✅ CRITICAL: Disable automatic menu creation
                electron_1.app.setAboutPanelOptions({
                    applicationName: 'Prg',
                    applicationVersion: electron_1.app.getVersion(),
                    version: electron_1.app.getVersion(),
                    authors: ['Pin Rhythm Team']
                });
                // Ensure dock is visible (critical for menubar)
                try {
                    electron_1.app.dock?.show();
                }
                catch (e) {
                    logger_1.logger.warn('app', 'Could not show dock:', e);
                }
                // Set bundle info early
                process.env.CFBundleName = 'Pin Rhythm';
                process.env.CFBundleDisplayName = 'Pin Rhythm';
                process.env.CFBundleIdentifier = 'com.pinrhythm.app';
                // Additional bundle info to ensure normal app behavior
                process.env.CFBundlePackageType = 'APPL';
                process.env.CFBundleExecutable = 'Pin Rhythm';
            }
            logger_1.logger.info('app', `✅ App name set to: ${electron_1.app.getName()}`);
            // Log platform information
            logger_1.logger.info('app', `Platform: ${platform_1.PlatformUtils.info.name} (${platform_1.PlatformUtils.info.arch})`);
            logger_1.logger.info('app', `Electron: ${platform_1.PlatformUtils.info.version}`);
            logger_1.logger.info('app', `Development: ${platform_1.PlatformUtils.info.isDev}`);
            // Initialize settings first
            await this.settingsManager.initialize();
            // Setup security policies
            await (0, security_1.setupSecurityPolicies)();
            // Register custom protocols
            this.registerCustomProtocols();
            // Setup lifecycle handlers
            this.lifecycleManager.setup();
            // ✅ CRITICAL: Set menu BEFORE creating window (macOS requirement)
            if (platform_1.PlatformUtils.isMacOS) {
                (0, menubar_debug_1.debugMacOSMenuBar)();
            }
            (0, menu_1.setupApplicationMenu)();
            if (platform_1.PlatformUtils.isMacOS) {
                (0, menubar_debug_1.forceMacOSMenuBarVisible)();
            }
            // Create main window AFTER menu is set
            const mainWindow = await this.windowManager.createMainWindow();
            // Initialize IPC handlers
            await this.ipcManager.initialize(mainWindow);
            this.isInitialized = true;
            logger_1.logger.info('app', 'Application initialized successfully');
        }
        catch (error) {
            logger_1.logger.error('app', 'Failed to initialize application', error);
            throw error;
        }
    }
    /**
     * Shutdown the application gracefully
     */
    async shutdown() {
        try {
            logger_1.logger.info('app', 'Starting graceful shutdown');
            // Save settings
            await this.settingsManager.save();
            // Close all windows
            this.windowManager.closeAllWindows();
            // Cleanup IPC handlers
            this.ipcManager.cleanup();
            // Cleanup lifecycle handlers
            this.lifecycleManager.cleanup();
            this.isInitialized = false;
            logger_1.logger.info('app', 'Application shutdown completed');
        }
        catch (error) {
            logger_1.logger.error('app', 'Error during shutdown', error);
            throw error;
        }
    }
    /**
     * Register custom protocols
     */
    registerCustomProtocols() {
        // Register media protocol for chart assets
        electron_1.protocol.registerFileProtocol('prg-media', (request, callback) => {
            try {
                const url = request.url.substring('prg-media://'.length);
                const filePath = (0, path_1.join)(electron_1.app.getPath('userData'), 'charts', url);
                callback(filePath);
                logger_1.logger.debug('app', 'Media protocol request', { url, filePath });
            }
            catch (error) {
                logger_1.logger.error('app', 'Media protocol error', { url: request.url, error });
                callback({ error: -2 }); // NET_FAILED
            }
        });
        logger_1.logger.info('app', 'Custom protocols registered');
    }
    /**
     * Get managers for external access
     */
    getWindowManager() {
        return this.windowManager;
    }
    getIPCManager() {
        return this.ipcManager;
    }
    getSettingsManager() {
        return this.settingsManager;
    }
    getLifecycleManager() {
        return this.lifecycleManager;
    }
    /**
     * Application state getters
     */
    isAppInitialized() {
        return this.isInitialized;
    }
    getMainWindow() {
        return this.windowManager.getMainWindow();
    }
}
exports.ApplicationCore = ApplicationCore;
Object.defineProperty(ApplicationCore, "instance", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: null
});
/**
 * Export singleton instance for convenience
 */
exports.appCore = ApplicationCore.getInstance();
