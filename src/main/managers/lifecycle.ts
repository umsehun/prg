/**
 * Lifecycle Manager - Handles application lifecycle events
 * Manages app startup, shutdown, and system events
 */

import { app, BrowserWindow } from 'electron';
import { logger } from '../../shared/globals/logger';

/**
 * Lifecycle event handlers interface
 */
interface LifecycleEventHandlers {
  onReady?: () => Promise<void> | void;
  onWindowAllClosed?: () => Promise<void> | void;
  onActivate?: () => Promise<void> | void;
  onSecondInstance?: () => Promise<void> | void;
  onBeforeQuit?: () => Promise<void> | void;
  onWebContentsCreated?: () => Promise<void> | void;
  onCertificateError?: () => Promise<void> | void;
}

export class LifecycleManager {
  private eventHandlers: LifecycleEventHandlers = {};
  private isSetup = false;

  /**
   * Setup all lifecycle event handlers
   */
  public setup(): void {
    if (this.isSetup) {
      logger.warn('lifecycle', 'Lifecycle handlers already setup');
      return;
    }

    try {
      logger.info('lifecycle', 'Setting up lifecycle handlers');

      // Single instance handler
      this.setupSingleInstance();

      // Window management handlers
      this.setupWindowHandlers();

      // Security handlers
      this.setupSecurityHandlers();

      // Process signal handlers
      this.setupProcessHandlers();

      this.isSetup = true;
      logger.info('lifecycle', 'Lifecycle handlers setup completed');

    } catch (error) {
      logger.error('lifecycle', 'Failed to setup lifecycle handlers', error);
      throw error;
    }
  }

  /**
   * Cleanup lifecycle handlers
   */
  public cleanup(): void {
    if (!this.isSetup) {
      return;
    }

    try {
      logger.info('lifecycle', 'Cleaning up lifecycle handlers');

      // Remove process signal handlers
      process.removeAllListeners('SIGTERM');
      process.removeAllListeners('SIGINT');

      this.isSetup = false;
      logger.info('lifecycle', 'Lifecycle cleanup completed');

    } catch (error) {
      logger.error('lifecycle', 'Error during lifecycle cleanup', error);
    }
  }

  /**
   * Setup single instance enforcement
   */
  private setupSingleInstance(): void {
    const gotTheLock = app.requestSingleInstanceLock();
    
    if (!gotTheLock) {
      logger.info('lifecycle', 'Another instance already running, quitting');
      app.quit();
      return;
    }

    // Handle second instance attempt
    app.on('second-instance', () => {
      logger.info('lifecycle', 'Second instance attempted, focusing main window');
      
      // Focus the main window if it exists
      const windows = BrowserWindow.getAllWindows();
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

    logger.debug('lifecycle', 'Single instance enforcement setup');
  }

  /**
   * Setup window management handlers
   */
  private setupWindowHandlers(): void {
    // Handle window-all-closed
    app.on('window-all-closed', () => {
      logger.info('lifecycle', 'All windows closed');
      
      // On macOS, keep app running even when all windows are closed
      if (process.platform !== 'darwin') {
        app.quit();
      }

      // Call custom handler if provided
      if (this.eventHandlers.onWindowAllClosed) {
        this.eventHandlers.onWindowAllClosed();
      }
    });

    // Handle activate (macOS)
    app.on('activate', async () => {
      logger.info('lifecycle', 'App activated');
      
      // On macOS, re-create window when dock icon is clicked
      if (BrowserWindow.getAllWindows().length === 0) {
        // This would typically create a new window
        // The actual window creation is handled by the WindowManager
      }

      // Call custom handler if provided
      if (this.eventHandlers.onActivate) {
        await this.eventHandlers.onActivate();
      }
    });

    // Handle before-quit
    app.on('before-quit', (_event) => {
      logger.info('lifecycle', 'App preparing to quit');
      
      // Allow custom handler to potentially prevent quit
      if (this.eventHandlers.onBeforeQuit) {
        this.eventHandlers.onBeforeQuit();
      }
    });

    logger.debug('lifecycle', 'Window handlers setup');
  }

  /**
   * Setup security event handlers
   */
  private setupSecurityHandlers(): void {
    // Handle web-contents-created for security
    app.on('web-contents-created', (_event, contents) => {
      logger.debug('lifecycle', 'Web contents created');

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
          logger.warn('lifecycle', 'Blocked navigation attempt', { url });
        }
      });

      // Block window.open
      contents.setWindowOpenHandler(({ url }) => {
        logger.warn('lifecycle', 'Blocked window.open attempt', { url });
        return { action: 'deny' };
      });

      // Call custom handler if provided
      if (this.eventHandlers.onWebContentsCreated) {
        this.eventHandlers.onWebContentsCreated();
      }
    });

    // Handle certificate errors
    app.on('certificate-error', (event, _webContents, _url, _error, _certificate, callback) => {
      if (process.env.NODE_ENV === 'development') {
        // In development, ignore certificate errors
        event.preventDefault();
        callback(true);
        logger.debug('lifecycle', 'Certificate error ignored in development');
      } else {
        // In production, use default behavior
        callback(false);
        logger.warn('lifecycle', 'Certificate error in production');
      }

      // Call custom handler if provided
      if (this.eventHandlers.onCertificateError) {
        this.eventHandlers.onCertificateError();
      }
    });

    logger.debug('lifecycle', 'Security handlers setup');
  }

  /**
   * Setup process signal handlers
   */
  private setupProcessHandlers(): void {
    // Handle SIGTERM (graceful shutdown)
    process.on('SIGTERM', () => {
      logger.info('lifecycle', 'SIGTERM received, initiating graceful shutdown');
      app.quit();
    });

    // Handle SIGINT (Ctrl+C)
    process.on('SIGINT', () => {
      logger.info('lifecycle', 'SIGINT received, initiating shutdown');
      app.quit();
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.fatal('lifecycle', 'Uncaught exception', error);
      
      // In production, we might want to restart or quit gracefully
      if (process.env.NODE_ENV === 'production') {
        app.quit();
      }
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('lifecycle', 'Unhandled promise rejection', { reason, promise });
    });

    logger.debug('lifecycle', 'Process handlers setup');
  }

  /**
   * Register custom event handlers
   */
  public registerEventHandlers(handlers: LifecycleEventHandlers): void {
    this.eventHandlers = { ...this.eventHandlers, ...handlers };
    logger.debug('lifecycle', 'Custom event handlers registered');
  }

  /**
   * Check if lifecycle is setup
   */
  public isLifecycleSetup(): boolean {
    return this.isSetup;
  }
}
