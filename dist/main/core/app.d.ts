/**
 * Main Application Core - Central coordinator for the Electron app
 * Manages application lifecycle, window state, and core services
 */
import { BrowserWindow } from 'electron';
import { WindowManager } from './window-manager';
import { IPCManager } from './ipc-manager';
import { LifecycleManager } from './lifecycle';
import { SettingsManager } from './settings-manager';
/**
 * Main application class that orchestrates all core components
 */
export declare class ApplicationCore {
    private static instance;
    private windowManager;
    private ipcManager;
    private lifecycleManager;
    private settingsManager;
    private isInitialized;
    private constructor();
    /**
     * Singleton instance getter
     */
    static getInstance(): ApplicationCore;
    /**
     * Initialize the application
     */
    initialize(): Promise<void>;
    /**
     * Shutdown the application gracefully
     */
    shutdown(): Promise<void>;
    /**
     * Register custom protocols
     */
    private registerCustomProtocols;
    /**
     * Get managers for external access
     */
    getWindowManager(): WindowManager;
    getIPCManager(): IPCManager;
    getSettingsManager(): SettingsManager;
    getLifecycleManager(): LifecycleManager;
    /**
     * Application state getters
     */
    isAppInitialized(): boolean;
    getMainWindow(): BrowserWindow | null;
}
/**
 * Export singleton instance for convenience
 */
export declare const appCore: ApplicationCore;
//# sourceMappingURL=app.d.ts.map