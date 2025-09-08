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
import { setupSecurityPolicies } from './security';

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

            // Initialize settings first
            await this.settingsManager.initialize();

            // Setup security policies
            await setupSecurityPolicies();

            // Register custom protocols
            this.registerCustomProtocols();

            // Setup lifecycle handlers
            this.lifecycleManager.setup();

            // Create main window
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
