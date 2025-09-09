/**
 * Main Application Core - Central coordinator for the Electron app
 * Manages application lifecycle, window state, and core services
 */

import { app, BrowserWindow, protocol } from 'electron';
import { join } from 'path';
import { logger } from '../../shared/globals/logger';
import { WindowManager } from '../managers/window-manager';
import { IPCManager } from '../managers/ipc-manager';
import { LifecycleManager } from '../managers/lifecycle';
import { SettingsManager } from '../managers/settings-manager';
import { PlatformUtils } from '../utils/platform';
import { setupSecurityPolicies } from './security';
import { setupApplicationMenu } from './menu';
import { debugMacOSMenuBar, forceMacOSMenuBarVisible } from './menubar-debug';

/**
 * Main application class that orchestrates all core components
 */
export class ApplicationCore {
    private static instance: ApplicationCore | null = null;

    private windowManager: WindowManager;
    private ipcManager: IPCManager;
    private lifecycleManager: LifecycleManager;
    private settingsManager: SettingsManager;
    private isInitialized = false;

    private constructor() {
        this.windowManager = new WindowManager();
        this.ipcManager = new IPCManager();
        this.lifecycleManager = new LifecycleManager();
        this.settingsManager = new SettingsManager();
    }

    /**
     * Singleton instance getter
     */
    public static getInstance(): ApplicationCore {
        if (!ApplicationCore.instance) {
            ApplicationCore.instance = new ApplicationCore();
        }
        return ApplicationCore.instance;
    }

    /**
     * Initialize the application
     */
    public async initialize(): Promise<void> {
        if (this.isInitialized) {
            logger.warn('app', 'Application already initialized');
            return;
        }

        try {
            logger.info('app', 'Starting application initialization');

            // Set application name VERY EARLY for menubar
            app.setName('Pin Rhythm');

            // ✅ CRITICAL: For macOS menubar visibility  
            if (PlatformUtils.isMacOS) {
                // ENSURE LSUIElement is NOT set (this would hide menubar)
                delete process.env.LSUIElement;
                process.env.LSUIElement = 'false';

                // ✅ CRITICAL: Disable automatic menu creation
                app.setAboutPanelOptions({
                    applicationName: 'Pin Rhythm',
                    applicationVersion: app.getVersion(),
                    version: app.getVersion(),
                    authors: ['Pin Rhythm Team']
                });

                // Ensure dock is visible (critical for menubar)
                try {
                    app.dock?.show();
                } catch (e) {
                    logger.warn('app', 'Could not show dock:', e);
                }

                // Set bundle info early
                process.env.CFBundleName = 'Pin Rhythm';
                process.env.CFBundleDisplayName = 'Pin Rhythm';
                process.env.CFBundleIdentifier = 'com.pinrhythm.app';

                // Additional bundle info to ensure normal app behavior
                process.env.CFBundlePackageType = 'APPL';
                process.env.CFBundleExecutable = 'Pin Rhythm';
            } logger.info('app', `✅ App name set to: ${app.getName()}`);

            // Log platform information
            logger.info('app', `Platform: ${PlatformUtils.info.name} (${PlatformUtils.info.arch})`);
            logger.info('app', `Electron: ${PlatformUtils.info.version}`);
            logger.info('app', `Development: ${PlatformUtils.info.isDev}`);

            // Initialize settings first
            await this.settingsManager.initialize();

            // Setup security policies
            await setupSecurityPolicies();

            // Register custom protocols
            this.registerCustomProtocols();

            // Setup lifecycle handlers
            this.lifecycleManager.setup();

            // ✅ CRITICAL: Set menu BEFORE creating window (macOS requirement)
            if (PlatformUtils.isMacOS) {
                debugMacOSMenuBar();
            }
            setupApplicationMenu();
            if (PlatformUtils.isMacOS) {
                forceMacOSMenuBarVisible();
            }

            // Create main window AFTER menu is set
            const mainWindow = await this.windowManager.createMainWindow();

            // Initialize IPC handlers
            await this.ipcManager.initialize(mainWindow);

            this.isInitialized = true;
            logger.info('app', 'Application initialized successfully');

        } catch (error) {
            logger.error('app', 'Failed to initialize application', error);
            throw error;
        }
    }

    /**
     * Shutdown the application gracefully
     */
    public async shutdown(): Promise<void> {
        try {
            logger.info('app', 'Starting graceful shutdown');

            // Save settings
            await this.settingsManager.save();

            // Close all windows
            this.windowManager.closeAllWindows();

            // Cleanup IPC handlers
            this.ipcManager.cleanup();

            // Cleanup lifecycle handlers
            this.lifecycleManager.cleanup();

            this.isInitialized = false;
            logger.info('app', 'Application shutdown completed');

        } catch (error) {
            logger.error('app', 'Error during shutdown', error);
            throw error;
        }
    }

    /**
     * Register custom protocols
     */
    private registerCustomProtocols(): void {
        // Register media protocol for chart assets
        protocol.registerFileProtocol('prg-media', (request, callback) => {
            try {
                const url = request.url.substring('prg-media://'.length);
                const filePath = join(app.getPath('userData'), 'charts', url);
                callback(filePath);

                logger.debug('app', 'Media protocol request', { url, filePath });
            } catch (error) {
                logger.error('app', 'Media protocol error', { url: request.url, error });
                callback({ error: -2 }); // NET_FAILED
            }
        });

        logger.info('app', 'Custom protocols registered');
    }

    /**
     * Get managers for external access
     */
    public getWindowManager(): WindowManager {
        return this.windowManager;
    }

    public getIPCManager(): IPCManager {
        return this.ipcManager;
    }

    public getSettingsManager(): SettingsManager {
        return this.settingsManager;
    }

    public getLifecycleManager(): LifecycleManager {
        return this.lifecycleManager;
    }

    /**
     * Application state getters
     */
    public isAppInitialized(): boolean {
        return this.isInitialized;
    }

    public getMainWindow(): BrowserWindow | null {
        return this.windowManager.getMainWindow();
    }
}

/**
 * Export singleton instance for convenience
 */
export const appCore = ApplicationCore.getInstance();
