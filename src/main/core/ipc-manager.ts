/**
 * IPC Manager - Centralizes all IPC handler registration and management
 * Provides a clean interface for setting up inter-process communication
 */

import { BrowserWindow } from 'electron';
import { logger } from '../../shared/globals/logger';
import { setupGameHandlers } from '../handlers/game.handler';
import { setupOszHandlers } from '../handlers/osz.handler';
import { setupSettingsHandlers } from '../handlers/settings.handler';

/**
 * IPC Handler setup function type
 */
type IPCHandlerSetup = (mainWindow: BrowserWindow) => void;

/**
 * IPC Handler registry
 */
interface IPCHandlerRegistry {
  readonly name: string;
  readonly setup: IPCHandlerSetup;
  readonly description: string;
}

export class IPCManager {
  private handlers: IPCHandlerRegistry[] = [];
  private isInitialized = false;

  constructor() {
    this.registerHandlers();
  }

  /**
   * Initialize all IPC handlers
   */
  public async initialize(mainWindow: BrowserWindow): Promise<void> {
    if (this.isInitialized) {
      logger.warn('ipc', 'IPC handlers already initialized');
      return;
    }

    try {
      logger.info('ipc', 'Initializing IPC handlers');

      for (const handler of this.handlers) {
        try {
          handler.setup(mainWindow);
          logger.debug('ipc', `Handler registered: ${handler.name}`, {
            description: handler.description
          });
        } catch (error) {
          logger.error('ipc', `Failed to register handler: ${handler.name}`, error);
          throw error;
        }
      }

      this.isInitialized = true;
      logger.info('ipc', `Successfully initialized ${this.handlers.length} IPC handlers`);

    } catch (error) {
      logger.error('ipc', 'Failed to initialize IPC handlers', error);
      throw error;
    }
  }

  /**
   * Cleanup all IPC handlers
   */
  public cleanup(): void {
    if (!this.isInitialized) {
      return;
    }

    try {
      logger.info('ipc', 'Cleaning up IPC handlers');

      // Note: Electron doesn't provide a clean way to remove specific handlers
      // In a real application, you might want to track handlers and remove them
      // For now, we just log the cleanup

      this.isInitialized = false;
      logger.info('ipc', 'IPC handlers cleanup completed');

    } catch (error) {
      logger.error('ipc', 'Error during IPC cleanup', error);
    }
  }

  /**
   * Register all available handlers
   */
  private registerHandlers(): void {
    this.handlers = [
      {
        name: 'game',
        setup: setupGameHandlers,
        description: 'Game-related IPC handlers (start, stop, scoring, etc.)'
      },
      {
        name: 'osz',
        setup: setupOszHandlers,
        description: 'OSZ file processing handlers (import, library, audio)'
      },
      {
        name: 'settings',
        setup: setupSettingsHandlers,
        description: 'Application settings handlers (get, set, reset, etc.)'
      }
    ];

    logger.debug('ipc', `Registered ${this.handlers.length} handler types`);
  }

  /**
   * Get handler information
   */
  public getHandlerInfo(): Array<{ name: string; description: string }> {
    return this.handlers.map(h => ({
      name: h.name,
      description: h.description
    }));
  }

  /**
   * Check if IPC is initialized
   */
  public isIPCInitialized(): boolean {
    return this.isInitialized;
  }
}
