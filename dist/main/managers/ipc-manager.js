"use strict";
/**
 * IPC Manager - Centralizes all IPC handler registration and management
 * Provides a clean interface for setting up inter-process communication
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.IPCManager = void 0;
const logger_1 = require("../../shared/globals/logger");
const game_handler_1 = require("../handlers/game.handler");
const osz_handler_1 = require("../handlers/osz.handler");
const settings_handler_1 = require("../handlers/settings.handler");
const system_handler_1 = require("../handlers/system.handler");
class IPCManager {
    constructor() {
        Object.defineProperty(this, "handlers", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "isInitialized", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        this.registerHandlers();
    }
    /**
     * Initialize all IPC handlers
     */
    async initialize(mainWindow) {
        if (this.isInitialized) {
            logger_1.logger.warn('ipc', 'IPC handlers already initialized');
            return;
        }
        try {
            logger_1.logger.info('ipc', 'Initializing IPC handlers');
            for (const handler of this.handlers) {
                try {
                    handler.setup(mainWindow);
                    logger_1.logger.debug('ipc', `Handler registered: ${handler.name}`, {
                        description: handler.description
                    });
                }
                catch (error) {
                    logger_1.logger.error('ipc', `Failed to register handler: ${handler.name}`, error);
                    throw error;
                }
            }
            this.isInitialized = true;
            logger_1.logger.info('ipc', `Successfully initialized ${this.handlers.length} IPC handlers`);
        }
        catch (error) {
            logger_1.logger.error('ipc', 'Failed to initialize IPC handlers', error);
            throw error;
        }
    }
    /**
     * Cleanup all IPC handlers
     */
    cleanup() {
        if (!this.isInitialized) {
            return;
        }
        try {
            logger_1.logger.info('ipc', 'Cleaning up IPC handlers');
            // Note: Electron doesn't provide a clean way to remove specific handlers
            // In a real application, you might want to track handlers and remove them
            // For now, we just log the cleanup
            this.isInitialized = false;
            logger_1.logger.info('ipc', 'IPC handlers cleanup completed');
        }
        catch (error) {
            logger_1.logger.error('ipc', 'Error during IPC cleanup', error);
        }
    }
    /**
     * Register all available handlers
     */
    registerHandlers() {
        this.handlers = [
            {
                name: 'game',
                setup: game_handler_1.setupGameHandlers,
                description: 'Game-related IPC handlers (start, stop, scoring, etc.)'
            },
            {
                name: 'osz',
                setup: osz_handler_1.setup,
                description: 'OSZ file processing handlers (import, library, audio)'
            },
            {
                name: 'settings',
                setup: settings_handler_1.setupSettingsHandlers,
                description: 'Application settings handlers (get, set, reset, etc.)'
            },
            {
                name: 'system',
                setup: system_handler_1.setupSystemHandlers,
                description: 'System-level handlers (window controls, platform info, etc.)'
            }
        ];
        logger_1.logger.debug('ipc', `Registered ${this.handlers.length} handler types`);
    }
    /**
     * Get handler information
     */
    getHandlerInfo() {
        return this.handlers.map(h => ({
            name: h.name,
            description: h.description
        }));
    }
    /**
     * Check if IPC is initialized
     */
    isIPCInitialized() {
        return this.isInitialized;
    }
}
exports.IPCManager = IPCManager;
