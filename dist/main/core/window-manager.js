"use strict";
/**
 * Window Manager - Handles all browser window operations
 * Manages window creation, state, and lifecycle
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.WindowManager = void 0;
const electron_1 = require("electron");
const path_1 = require("path");
const logger_1 = require("../../shared/globals/logger");
class WindowManager {
    constructor() {
        Object.defineProperty(this, "mainWindow", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "windowState", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
    }
    /**
     * Create the main application window
     */
    async createMainWindow() {
        if (this.mainWindow && !this.mainWindow.isDestroyed()) {
            logger_1.logger.warn('window', 'Main window already exists');
            return this.mainWindow;
        }
        try {
            logger_1.logger.info('window', 'Creating main window');
            const config = this.getWindowConfig();
            this.mainWindow = new electron_1.BrowserWindow(config);
            // Setup window event handlers
            this.setupWindowEventHandlers();
            // Load the application
            await this.loadApplication();
            // Show window when ready
            this.mainWindow.once('ready-to-show', () => {
                if (this.mainWindow) {
                    this.mainWindow.show();
                    // Restore window state if available
                    this.restoreWindowState();
                    logger_1.logger.info('window', 'Main window shown');
                }
            });
            logger_1.logger.info('window', 'Main window created successfully');
            return this.mainWindow;
        }
        catch (error) {
            logger_1.logger.error('window', 'Failed to create main window', error);
            throw error;
        }
    }
    /**
     * Get the main window instance
     */
    getMainWindow() {
        return this.mainWindow;
    }
    /**
     * Close all windows
     */
    closeAllWindows() {
        logger_1.logger.info('window', 'Closing all windows');
        if (this.mainWindow && !this.mainWindow.isDestroyed()) {
            this.saveWindowState();
            this.mainWindow.close();
        }
    }
    /**
     * Focus the main window
     */
    focusMainWindow() {
        if (this.mainWindow && !this.mainWindow.isDestroyed()) {
            if (this.mainWindow.isMinimized()) {
                this.mainWindow.restore();
            }
            this.mainWindow.focus();
        }
    }
    /**
     * Get window configuration
     */
    getWindowConfig() {
        const primaryDisplay = electron_1.screen.getPrimaryDisplay();
        const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;
        const windowWidth = Math.min(1280, Math.floor(screenWidth * 0.8));
        const windowHeight = Math.min(800, Math.floor(screenHeight * 0.8));
        const baseConfig = {
            width: windowWidth,
            height: windowHeight,
            minWidth: 800,
            minHeight: 600,
            show: false,
            autoHideMenuBar: true,
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                sandbox: true,
                preload: (0, path_1.join)(__dirname, '../../preload/index.js'),
                allowRunningInsecureContent: false,
                experimentalFeatures: false,
                devTools: process.env.NODE_ENV === 'development',
                webSecurity: true,
            },
            titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
        };
        // Platform-specific configurations
        const platformConfig = {};
        if (process.platform === 'darwin') {
            platformConfig.vibrancy = 'under-window';
        }
        if (process.platform === 'linux') {
            platformConfig.icon = (0, path_1.join)(__dirname, '../../../public/icon.png');
        }
        return { ...baseConfig, ...platformConfig };
    }
    /**
     * Setup window event handlers
     */
    setupWindowEventHandlers() {
        if (!this.mainWindow)
            return;
        // Save window state on close
        this.mainWindow.on('close', () => {
            this.saveWindowState();
        });
        // Handle window destroyed
        this.mainWindow.on('closed', () => {
            logger_1.logger.info('window', 'Main window closed');
            this.mainWindow = null;
        });
        // Handle window minimize/restore
        this.mainWindow.on('minimize', () => {
            logger_1.logger.debug('window', 'Window minimized');
        });
        this.mainWindow.on('restore', () => {
            logger_1.logger.debug('window', 'Window restored');
        });
        // Handle window resize/move
        this.mainWindow.on('resized', () => {
            this.saveWindowState();
        });
        this.mainWindow.on('moved', () => {
            this.saveWindowState();
        });
        // Security handlers
        this.mainWindow.webContents.on('will-navigate', (event, url) => {
            if (!url.startsWith('http://localhost:') && !url.startsWith('file://')) {
                event.preventDefault();
                logger_1.logger.warn('window', 'Blocked navigation attempt', { url });
            }
        });
        this.mainWindow.webContents.setWindowOpenHandler(({ url }) => {
            logger_1.logger.warn('window', 'Blocked window.open attempt', { url });
            return { action: 'deny' };
        });
    }
    /**
     * Load the application into the window
     */
    async loadApplication() {
        if (!this.mainWindow)
            return;
        try {
            if (process.env.NODE_ENV === 'development') {
                // Development: Load from dev server
                await this.mainWindow.loadURL('http://localhost:5173');
                // Open DevTools in development
                this.mainWindow.webContents.openDevTools();
            }
            else {
                // Production: Load from built files
                await this.mainWindow.loadFile((0, path_1.join)(__dirname, '../../../renderer/out/index.html'));
            }
            logger_1.logger.info('window', 'Application loaded successfully');
        }
        catch (error) {
            logger_1.logger.error('window', 'Failed to load application', error);
            throw error;
        }
    }
    /**
     * Save current window state
     */
    saveWindowState() {
        if (!this.mainWindow || this.mainWindow.isDestroyed())
            return;
        try {
            const bounds = this.mainWindow.getBounds();
            this.windowState = {
                x: bounds.x,
                y: bounds.y,
                width: bounds.width,
                height: bounds.height,
                isMaximized: this.mainWindow.isMaximized(),
                isFullScreen: this.mainWindow.isFullScreen(),
            };
            logger_1.logger.debug('window', 'Window state saved', this.windowState);
        }
        catch (error) {
            logger_1.logger.error('window', 'Failed to save window state', error);
        }
    }
    /**
     * Restore window state
     */
    restoreWindowState() {
        if (!this.mainWindow || !this.windowState)
            return;
        try {
            // Restore window bounds
            const bounds = {
                width: this.windowState.width,
                height: this.windowState.height,
            };
            if (this.windowState.x !== undefined) {
                bounds.x = this.windowState.x;
            }
            if (this.windowState.y !== undefined) {
                bounds.y = this.windowState.y;
            }
            this.mainWindow.setBounds(bounds);
            // Restore maximized state
            if (this.windowState.isMaximized) {
                this.mainWindow.maximize();
            }
            // Restore fullscreen state
            if (this.windowState.isFullScreen) {
                this.mainWindow.setFullScreen(true);
            }
            logger_1.logger.debug('window', 'Window state restored');
        }
        catch (error) {
            logger_1.logger.error('window', 'Failed to restore window state', error);
        }
    }
}
exports.WindowManager = WindowManager;
