"use strict";
/**
 * Settings management IPC handlers
 * Type-safe settings with Zod validation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSettingsHandlers = setupSettingsHandlers;
const electron_1 = require("electron");
const zod_1 = require("zod");
const logger_1 = require("../../shared/globals/logger");
/**
 * Settings validation schemas
 */
const AudioSettingsSchema = zod_1.z.object({
    masterVolume: zod_1.z.number().min(0).max(1),
    effectVolume: zod_1.z.number().min(0).max(1),
    musicVolume: zod_1.z.number().min(0).max(1),
    audioOffset: zod_1.z.number().min(-500).max(500),
});
const GameSettingsSchema = zod_1.z.object({
    noteSpeed: zod_1.z.number().min(0.1).max(5.0),
    backgroundDim: zod_1.z.number().min(0).max(1),
    showHitErrorBar: zod_1.z.boolean(),
    showAccuracy: zod_1.z.boolean(),
    showJudgmentText: zod_1.z.boolean(),
    showHitParticles: zod_1.z.boolean(),
});
const GraphicsSettingsSchema = zod_1.z.object({
    resolution: zod_1.z.string().regex(/^\d+x\d+$/, 'Resolution must be in format "widthxheight"'),
    vsync: zod_1.z.boolean(),
    frameLimit: zod_1.z.number().min(30).max(240),
    fullscreen: zod_1.z.boolean(),
});
const InputSettingsSchema = zod_1.z.object({
    keyBindings: zod_1.z.object({
        key1: zod_1.z.string().min(1),
        key2: zod_1.z.string().min(1),
        pause: zod_1.z.string().min(1),
        restart: zod_1.z.string().min(1),
    }),
    mouseSensitivity: zod_1.z.number().min(0.1).max(5.0),
});
/**
 * Default settings with type safety
 */
const createDefaultSettings = () => ({
    audio: {
        masterVolume: 1.0,
        effectVolume: 1.0,
        musicVolume: 1.0,
        audioOffset: 0,
    },
    game: {
        noteSpeed: 1.0,
        backgroundDim: 0.5,
        showHitErrorBar: true,
        showAccuracy: true,
        showJudgmentText: true,
        showHitParticles: true,
    },
    graphics: {
        resolution: '1280x800',
        vsync: true,
        frameLimit: 60,
        fullscreen: false,
    },
    input: {
        keyBindings: {
            key1: 'KeyZ',
            key2: 'KeyX',
            pause: 'Escape',
            restart: 'KeyR',
        },
        mouseSensitivity: 1.0,
    },
});
// Current settings state
let currentSettings = createDefaultSettings();
function setupSettingsHandlers(mainWindow) {
    logger_1.logger.info('settings', 'Setting up settings handlers');
    /**
     * Get current settings
     */
    electron_1.ipcMain.handle('settings:get', async () => {
        try {
            logger_1.logger.info('settings', 'Settings get requested');
            return {
                success: true,
                settings: currentSettings,
            };
        }
        catch (error) {
            logger_1.logger.error('settings', 'Failed to get settings', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to retrieve settings',
            };
        }
    });
    /**
     * Update audio settings
     */
    /**
     * Update audio settings with type safety
     */
    electron_1.ipcMain.handle('settings:update-audio', async (_event, audioSettings) => {
        try {
            logger_1.logger.info('settings', 'Audio settings update requested', audioSettings);
            // Validate audio settings
            const validation = AudioSettingsSchema.partial().safeParse(audioSettings);
            if (!validation.success) {
                const errorMessage = validation.error.issues.map(issue => issue.message).join(', ');
                return {
                    success: false,
                    error: `Audio settings validation failed: ${errorMessage}`,
                };
            }
            // Update audio settings with proper type safety
            currentSettings = {
                ...currentSettings,
                audio: {
                    masterVolume: validation.data.masterVolume ?? currentSettings.audio.masterVolume,
                    effectVolume: validation.data.effectVolume ?? currentSettings.audio.effectVolume,
                    musicVolume: validation.data.musicVolume ?? currentSettings.audio.musicVolume,
                    audioOffset: validation.data.audioOffset ?? currentSettings.audio.audioOffset,
                },
            };
            logger_1.logger.info('settings', 'Audio settings updated successfully');
            mainWindow.webContents.send('settings:audio-changed', currentSettings.audio);
            return { success: true };
        }
        catch (error) {
            logger_1.logger.error('settings', 'Audio settings update failed', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error during audio settings update',
            };
        }
    });
    /**
     * Update game settings
     */
    electron_1.ipcMain.handle('settings:update-game', async (_event, gameSettings) => {
        try {
            logger_1.logger.info('settings', 'Game settings update requested', gameSettings);
            // Validate game settings
            const validation = GameSettingsSchema.partial().safeParse(gameSettings);
            if (!validation.success) {
                const errorMessage = validation.error.issues.map(issue => issue.message).join(', ');
                return {
                    success: false,
                    error: `Game settings validation failed: ${errorMessage}`,
                };
            }
            // Update game settings with proper type safety
            currentSettings = {
                ...currentSettings,
                game: {
                    noteSpeed: validation.data.noteSpeed ?? currentSettings.game.noteSpeed,
                    backgroundDim: validation.data.backgroundDim ?? currentSettings.game.backgroundDim,
                    showHitErrorBar: validation.data.showHitErrorBar ?? currentSettings.game.showHitErrorBar,
                    showAccuracy: validation.data.showAccuracy ?? currentSettings.game.showAccuracy,
                    showJudgmentText: validation.data.showJudgmentText ?? currentSettings.game.showJudgmentText,
                    showHitParticles: validation.data.showHitParticles ?? currentSettings.game.showHitParticles,
                },
            };
            logger_1.logger.info('settings', 'Game settings updated successfully');
            mainWindow.webContents.send('settings:game-changed', currentSettings.game);
            return { success: true };
        }
        catch (error) {
            logger_1.logger.error('settings', 'Game settings update failed', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error during game settings update',
            };
        }
    });
    /**
     * Update graphics settings
     */
    electron_1.ipcMain.handle('settings:update-graphics', async (_event, graphicsSettings) => {
        try {
            logger_1.logger.info('settings', 'Graphics settings update requested', graphicsSettings);
            // Validate graphics settings
            const validation = GraphicsSettingsSchema.partial().safeParse(graphicsSettings);
            if (!validation.success) {
                const errorMessage = validation.error.issues.map(issue => issue.message).join(', ');
                return {
                    success: false,
                    error: `Graphics settings validation failed: ${errorMessage}`,
                };
            }
            // Update graphics settings with proper type safety
            currentSettings = {
                ...currentSettings,
                graphics: {
                    resolution: validation.data.resolution ?? currentSettings.graphics.resolution,
                    vsync: validation.data.vsync ?? currentSettings.graphics.vsync,
                    frameLimit: validation.data.frameLimit ?? currentSettings.graphics.frameLimit,
                    fullscreen: validation.data.fullscreen ?? currentSettings.graphics.fullscreen,
                },
            };
            logger_1.logger.info('settings', 'Graphics settings updated successfully');
            mainWindow.webContents.send('settings:graphics-changed', currentSettings.graphics);
            return { success: true };
        }
        catch (error) {
            logger_1.logger.error('settings', 'Graphics settings update failed', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error during graphics settings update',
            };
        }
    });
    /**
     * Update input settings
     */
    electron_1.ipcMain.handle('settings:update-input', async (_event, inputSettings) => {
        try {
            logger_1.logger.info('settings', 'Input settings update requested', inputSettings);
            // Validate input settings
            const validation = InputSettingsSchema.partial().safeParse(inputSettings);
            if (!validation.success) {
                const errorMessage = validation.error.issues.map(issue => issue.message).join(', ');
                return {
                    success: false,
                    error: `Input settings validation failed: ${errorMessage}`,
                };
            }
            // Update input settings with proper type safety
            currentSettings = {
                ...currentSettings,
                input: {
                    keyBindings: validation.data.keyBindings ?? currentSettings.input.keyBindings,
                    mouseSensitivity: validation.data.mouseSensitivity ?? currentSettings.input.mouseSensitivity,
                },
            };
            logger_1.logger.info('settings', 'Input settings updated successfully');
            mainWindow.webContents.send('settings:input-changed', currentSettings.input);
            return { success: true };
        }
        catch (error) {
            logger_1.logger.error('settings', 'Input settings update failed', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error during input settings update',
            };
        }
    });
    /**
     * Reset settings to defaults
     */
    electron_1.ipcMain.handle('settings:reset', async () => {
        try {
            logger_1.logger.info('settings', 'Settings reset requested');
            currentSettings = createDefaultSettings();
            logger_1.logger.info('settings', 'Settings reset successfully');
            mainWindow.webContents.send('settings:reset', currentSettings);
            return {
                success: true,
                settings: currentSettings,
            };
        }
        catch (error) {
            logger_1.logger.error('settings', 'Settings reset failed', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error during settings reset',
            };
        }
    });
    logger_1.logger.info('settings', 'Settings handlers setup completed');
}
