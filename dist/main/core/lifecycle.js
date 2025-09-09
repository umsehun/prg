"use strict";
/**
 * Lifecycle Manager - Handles application lifecycle events
 * Manages app startup, shutdown, and system events
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LifecycleManager = void 0;
const electron_1 = require("electron");
const logger_1 = require("../../shared/globals/logger");
class LifecycleManager {
    constructor() {
        Object.defineProperty(this, "eventHandlers", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
        Object.defineProperty(this, "isSetup", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
    }
    /**
     * Setup all lifecycle event handlers
     */
    setup() {
        if (this.isSetup) {
            logger_1.logger.warn('lifecycle', 'Lifecycle handlers already setup');
            return;
        }
        try {
            logger_1.logger.info('lifecycle', 'Setting up lifecycle handlers');
            // Single instance handler
            this.setupSingleInstance();
            // Window management handlers
            this.setupWindowHandlers();
            // Security handlers
            this.setupSecurityHandlers();
            // Process signal handlers
            this.setupProcessHandlers();
            this.isSetup = true;
            logger_1.logger.info('lifecycle', 'Lifecycle handlers setup completed');
        }
        catch (error) {
            logger_1.logger.error('lifecycle', 'Failed to setup lifecycle handlers', error);
            throw error;
        }
    }
    /**
     * Cleanup lifecycle handlers
     */
    cleanup() {
        if (!this.isSetup) {
            return;
        }
        try {
            logger_1.logger.info('lifecycle', 'Cleaning up lifecycle handlers');
            // Remove process signal handlers
            process.removeAllListeners('SIGTERM');
            process.removeAllListeners('SIGINT');
            this.isSetup = false;
            logger_1.logger.info('lifecycle', 'Lifecycle cleanup completed');
        }
        catch (error) {
            logger_1.logger.error('lifecycle', 'Error during lifecycle cleanup', error);
        }
    }
    /**
     * Setup single instance enforcement
     */
    setupSingleInstance() {
        const gotTheLock = electron_1.app.requestSingleInstanceLock();
        if (!gotTheLock) {
            logger_1.logger.info('lifecycle', 'Another instance already running, quitting');
            electron_1.app.quit();
            return;
        }
        // Handle second instance attempt
        electron_1.app.on('second-instance', () => {
            logger_1.logger.info('lifecycle', 'Second instance attempted, focusing main window');
            // Focus the main window if it exists
            const windows = electron_1.BrowserWindow.getAllWindows();
            if (windows.length > 0) {
                const mainWindow = windows[0];
                if (mainWindow && !mainWindow.isDestroyed()) {
                    if (mainWindow.isMinimized()) {
                        mainWindow.restore();
                    }
                    mainWindow.focus();
                }
            }
            // Call custom handler if provided
            if (this.eventHandlers.onSecondInstance) {
                this.eventHandlers.onSecondInstance();
            }
        });
        logger_1.logger.debug('lifecycle', 'Single instance enforcement setup');
    }
    /**
     * Setup window management handlers
     */
    setupWindowHandlers() {
        // Handle window-all-closed
        electron_1.app.on('window-all-closed', () => {
            logger_1.logger.info('lifecycle', 'All windows closed');
            // On macOS, keep app running even when all windows are closed
            if (process.platform !== 'darwin') {
                electron_1.app.quit();
            }
            // Call custom handler if provided
            if (this.eventHandlers.onWindowAllClosed) {
                this.eventHandlers.onWindowAllClosed();
            }
        });
        // Handle activate (macOS)
        electron_1.app.on('activate', async () => {
            logger_1.logger.info('lifecycle', 'App activated');
            // On macOS, re-create window when dock icon is clicked
            if (electron_1.BrowserWindow.getAllWindows().length === 0) {
                // This would typically create a new window
                // The actual window creation is handled by the WindowManager
            }
            // Call custom handler if provided
            if (this.eventHandlers.onActivate) {
                await this.eventHandlers.onActivate();
            }
        });
        // Handle before-quit
        electron_1.app.on('before-quit', (_event) => {
            logger_1.logger.info('lifecycle', 'App preparing to quit');
            // Allow custom handler to potentially prevent quit
            if (this.eventHandlers.onBeforeQuit) {
                this.eventHandlers.onBeforeQuit();
            }
        });
        logger_1.logger.debug('lifecycle', 'Window handlers setup');
    }
    /**
     * Setup security event handlers
     */
    setupSecurityHandlers() {
        // Handle web-contents-created for security
        electron_1.app.on('web-contents-created', (_event, contents) => {
            logger_1.logger.debug('lifecycle', 'Web contents created');
            // Prevent navigation to external sites
            contents.on('will-navigate', (navigationEvent, url) => {
                const allowedOrigins = [
                    'http://localhost:',
                    'file://',
                    'prg-media://'
                ];
                const isAllowed = allowedOrigins.some(origin => url.startsWith(origin));
                if (!isAllowed) {
                    navigationEvent.preventDefault();
                    logger_1.logger.warn('lifecycle', 'Blocked navigation attempt', { url });
                }
            });
            // Block window.open
            contents.setWindowOpenHandler(({ url }) => {
                logger_1.logger.warn('lifecycle', 'Blocked window.open attempt', { url });
                return { action: 'deny' };
            });
            // Call custom handler if provided
            if (this.eventHandlers.onWebContentsCreated) {
                this.eventHandlers.onWebContentsCreated();
            }
        });
        // Handle certificate errors
        electron_1.app.on('certificate-error', (event, _webContents, _url, _error, _certificate, callback) => {
            if (process.env.NODE_ENV === 'development') {
                // In development, ignore certificate errors
                event.preventDefault();
                callback(true);
                logger_1.logger.debug('lifecycle', 'Certificate error ignored in development');
            }
            else {
                // In production, use default behavior
                callback(false);
                logger_1.logger.warn('lifecycle', 'Certificate error in production');
            }
            // Call custom handler if provided
            if (this.eventHandlers.onCertificateError) {
                this.eventHandlers.onCertificateError();
            }
        });
        logger_1.logger.debug('lifecycle', 'Security handlers setup');
    }
    /**
     * Setup process signal handlers
     */
    setupProcessHandlers() {
        // Handle SIGTERM (graceful shutdown)
        process.on('SIGTERM', () => {
            logger_1.logger.info('lifecycle', 'SIGTERM received, initiating graceful shutdown');
            electron_1.app.quit();
        });
        // Handle SIGINT (Ctrl+C)
        process.on('SIGINT', () => {
            logger_1.logger.info('lifecycle', 'SIGINT received, initiating shutdown');
            electron_1.app.quit();
        });
        // Handle uncaught exceptions
        process.on('uncaughtException', (error) => {
            logger_1.logger.fatal('lifecycle', 'Uncaught exception', error);
            // In production, we might want to restart or quit gracefully
            if (process.env.NODE_ENV === 'production') {
                electron_1.app.quit();
            }
        });
        // Handle unhandled promise rejections
        process.on('unhandledRejection', (reason, promise) => {
            logger_1.logger.error('lifecycle', 'Unhandled promise rejection', { reason, promise });
        });
        logger_1.logger.debug('lifecycle', 'Process handlers setup');
    }
    /**
     * Register custom event handlers
     */
    registerEventHandlers(handlers) {
        this.eventHandlers = { ...this.eventHandlers, ...handlers };
        logger_1.logger.debug('lifecycle', 'Custom event handlers registered');
    }
    /**
     * Check if lifecycle is setup
     */
    isLifecycleSetup() {
        return this.isSetup;
    }
}
exports.LifecycleManager = LifecycleManager;
