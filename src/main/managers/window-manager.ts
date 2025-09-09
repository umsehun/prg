/**
 * Window Manager - Handles all browser window operations
 * Manages window creation, state, and lifecycle
 */

import { BrowserWindow, screen } from 'electron';
import { join } from 'path';
import { logger } from '../../shared/globals/logger';
import { PlatformUtils } from '../utils/platform';

/**
 * Window configuration interface
 */
interface WindowConfig {
  width: number;
  height: number;
  minWidth: number;
  minHeight: number;
  webPreferences: {
    nodeIntegration: boolean;
    contextIsolation: boolean;
    sandbox: boolean;
    preload: string;
    allowRunningInsecureContent: boolean;
    experimentalFeatures: boolean;
    devTools: boolean;
    webSecurity: boolean;
  };
  show: boolean;
  autoHideMenuBar: boolean;
  titleBarStyle: 'default' | 'hidden' | 'hiddenInset' | 'customButtonsOnHover';
  icon?: string;
  vibrancy?: 'under-window' | 'appearance-based';
}

/**
 * Window state interface
 */
interface WindowState {
  readonly x?: number;
  readonly y?: number;
  readonly width: number;
  readonly height: number;
  readonly isMaximized: boolean;
  readonly isFullScreen: boolean;
}

export class WindowManager {
  private mainWindow: BrowserWindow | null = null;
  private windowState: WindowState | null = null;

  /**
   * Create the main application window
   */
  public async createMainWindow(): Promise<BrowserWindow> {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      logger.warn('window', 'Main window already exists');
      return this.mainWindow;
    }

    try {
      logger.info('window', 'Creating main window');

      const config = this.getWindowConfig();
      this.mainWindow = new BrowserWindow(config);

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

          logger.info('window', 'Main window shown');
        }
      });

      logger.info('window', 'Main window created successfully');
      return this.mainWindow;

    } catch (error) {
      logger.error('window', 'Failed to create main window', error);
      throw error;
    }
  }

  /**
   * Get the main window instance
   */
  public getMainWindow(): BrowserWindow | null {
    return this.mainWindow;
  }

  /**
   * Close all windows
   */
  public closeAllWindows(): void {
    logger.info('window', 'Closing all windows');

    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.saveWindowState();
      this.mainWindow.close();
    }
  }

  /**
   * Focus the main window
   */
  public focusMainWindow(): void {
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
  private getWindowConfig(): WindowConfig {
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;

    const windowWidth = Math.min(1280, Math.floor(screenWidth * 0.8));
    const windowHeight = Math.min(800, Math.floor(screenHeight * 0.8));

    // Get platform-specific base configuration
    const platformConfig = PlatformUtils.getWindowConfig();

    const baseConfig: WindowConfig = {
      ...platformConfig,
      width: windowWidth,
      height: windowHeight,
      show: true,
      autoHideMenuBar: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true,
        preload: join(__dirname, '../../preload/index.js'),
        allowRunningInsecureContent: false,
        experimentalFeatures: false,
        devTools: process.env.NODE_ENV === 'development',
        webSecurity: true,
      },
    };

    // Additional platform-specific configurations
    if (PlatformUtils.isMacOS) {
      (baseConfig as any).vibrancy = 'under-window';
    }

    if (PlatformUtils.isLinux) {
      (baseConfig as any).icon = join(__dirname, '../../../public/icon.png');
    }

    return baseConfig;
  }

  /**
   * Setup window event handlers
   */
  private setupWindowEventHandlers(): void {
    if (!this.mainWindow) return;

    // Save window state on close
    this.mainWindow.on('close', () => {
      this.saveWindowState();
    });

    // Handle window destroyed
    this.mainWindow.on('closed', () => {
      logger.info('window', 'Main window closed');
      this.mainWindow = null;
    });

    // Handle window minimize/restore
    this.mainWindow.on('minimize', () => {
      logger.debug('window', 'Window minimized');
    });

    this.mainWindow.on('restore', () => {
      logger.debug('window', 'Window restored');
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
        logger.warn('window', 'Blocked navigation attempt', { url });
      }
    });

    this.mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      logger.warn('window', 'Blocked window.open attempt', { url });
      return { action: 'deny' };
    });
  }

  /**
   * Load the application into the window
   */
  private async loadApplication(): Promise<void> {
    if (!this.mainWindow) return;

    try {
      if (process.env.NODE_ENV === 'development') {
        // Development: Load from dev server
        await this.mainWindow.loadURL('http://localhost:5173');

        // Open DevTools in development (detached mode)
        this.mainWindow.webContents.openDevTools({ mode: 'detach' });
      } else {
        // Production: Load from built files
        await this.mainWindow.loadFile(
          join(__dirname, '../../../renderer/out/index.html')
        );
      }

      logger.info('window', 'Application loaded successfully');
    } catch (error) {
      logger.error('window', 'Failed to load application', error);
      throw error;
    }
  }

  /**
   * Save current window state
   */
  private saveWindowState(): void {
    if (!this.mainWindow || this.mainWindow.isDestroyed()) return;

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

      logger.debug('window', 'Window state saved', this.windowState);
    } catch (error) {
      logger.error('window', 'Failed to save window state', error);
    }
  }

  /**
   * Restore window state
   */
  private restoreWindowState(): void {
    if (!this.mainWindow || !this.windowState) return;

    try {
      // Restore window bounds
      const bounds: Partial<{ x: number; y: number; width: number; height: number }> = {
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

      logger.debug('window', 'Window state restored');
    } catch (error) {
      logger.error('window', 'Failed to restore window state', error);
    }
  }
}
