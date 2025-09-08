/**
 * Settings management IPC handlers
 * Type-safe settings with Zod validation
 */

import { ipcMain, BrowserWindow } from 'electron';
import { z } from 'zod';
import { logger } from '../../shared/globals/logger';

/**
 * Game settings interface with strict typing
 */
interface GameSettings {
    readonly audio: {
        readonly masterVolume: number;
        readonly effectVolume: number;
        readonly musicVolume: number;
        readonly audioOffset: number; // ms
    };
    readonly game: {
        readonly noteSpeed: number;
        readonly backgroundDim: number;
        readonly showHitErrorBar: boolean;
        readonly showAccuracy: boolean;
        readonly showJudgmentText: boolean;
        readonly showHitParticles: boolean;
    };
    readonly graphics: {
        readonly resolution: string;
        readonly vsync: boolean;
        readonly frameLimit: number;
        readonly fullscreen: boolean;
    };
    readonly input: {
        readonly keyBindings: {
            readonly key1: string;
            readonly key2: string;
            readonly pause: string;
            readonly restart: string;
        };
        readonly mouseSensitivity: number;
    };
}

/**
 * Settings validation schemas
 */
const AudioSettingsSchema = z.object({
    masterVolume: z.number().min(0).max(1),
    effectVolume: z.number().min(0).max(1),
    musicVolume: z.number().min(0).max(1),
    audioOffset: z.number().min(-500).max(500),
});

const GameSettingsSchema = z.object({
    noteSpeed: z.number().min(0.1).max(5.0),
    backgroundDim: z.number().min(0).max(1),
    showHitErrorBar: z.boolean(),
    showAccuracy: z.boolean(),
    showJudgmentText: z.boolean(),
    showHitParticles: z.boolean(),
});

const GraphicsSettingsSchema = z.object({
    resolution: z.string().regex(/^\d+x\d+$/, 'Resolution must be in format "widthxheight"'),
    vsync: z.boolean(),
    frameLimit: z.number().min(30).max(240),
    fullscreen: z.boolean(),
});

const InputSettingsSchema = z.object({
    keyBindings: z.object({
        key1: z.string().min(1),
        key2: z.string().min(1),
        pause: z.string().min(1),
        restart: z.string().min(1),
    }),
    mouseSensitivity: z.number().min(0.1).max(5.0),
});

/**
 * Default settings with type safety
 */
const createDefaultSettings = (): GameSettings => ({
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
let currentSettings: GameSettings = createDefaultSettings();

export function setupSettingsHandlers(mainWindow: BrowserWindow): void {
    logger.info('settings', 'Setting up settings handlers');

    /**
     * Get current settings
     */
    ipcMain.handle('settings:get', async (): Promise<{ success: boolean; settings?: GameSettings; error?: string }> => {
        try {
            logger.info('settings', 'Settings get requested');
            return {
                success: true,
                settings: currentSettings,
            };
        } catch (error) {
            logger.error('settings', 'Failed to get settings', error);
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
    ipcMain.handle('settings:update-audio', async (_event, audioSettings: Partial<GameSettings['audio']>): Promise<{ success: boolean; error?: string }> => {
        try {
            logger.info('settings', 'Audio settings update requested', audioSettings);

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

            logger.info('settings', 'Audio settings updated successfully');
            mainWindow.webContents.send('settings:audio-changed', currentSettings.audio);
            return { success: true };

        } catch (error) {
            logger.error('settings', 'Audio settings update failed', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error during audio settings update',
            };
        }
    });

    /**
     * Update game settings
     */
    ipcMain.handle('settings:update-game', async (_event, gameSettings: Partial<GameSettings['game']>): Promise<{ success: boolean; error?: string }> => {
        try {
            logger.info('settings', 'Game settings update requested', gameSettings);

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

            logger.info('settings', 'Game settings updated successfully');
            mainWindow.webContents.send('settings:game-changed', currentSettings.game);
            return { success: true };

        } catch (error) {
            logger.error('settings', 'Game settings update failed', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error during game settings update',
            };
        }
    });

    /**
     * Update graphics settings
     */
    ipcMain.handle('settings:update-graphics', async (_event, graphicsSettings: Partial<GameSettings['graphics']>): Promise<{ success: boolean; error?: string }> => {
        try {
            logger.info('settings', 'Graphics settings update requested', graphicsSettings);

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

            logger.info('settings', 'Graphics settings updated successfully');
            mainWindow.webContents.send('settings:graphics-changed', currentSettings.graphics);
            return { success: true };

        } catch (error) {
            logger.error('settings', 'Graphics settings update failed', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error during graphics settings update',
            };
        }
    });

    /**
     * Update input settings
     */
    ipcMain.handle('settings:update-input', async (_event, inputSettings: Partial<GameSettings['input']>): Promise<{ success: boolean; error?: string }> => {
        try {
            logger.info('settings', 'Input settings update requested', inputSettings);

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

            logger.info('settings', 'Input settings updated successfully');
            mainWindow.webContents.send('settings:input-changed', currentSettings.input);
            return { success: true };

        } catch (error) {
            logger.error('settings', 'Input settings update failed', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error during input settings update',
            };
        }
    });

    /**
     * Reset settings to defaults
     */
    ipcMain.handle('settings:reset', async (): Promise<{ success: boolean; settings?: GameSettings; error?: string }> => {
        try {
            logger.info('settings', 'Settings reset requested');

            currentSettings = createDefaultSettings();

            logger.info('settings', 'Settings reset successfully');
            mainWindow.webContents.send('settings:reset', currentSettings);
            return {
                success: true,
                settings: currentSettings,
            };
        } catch (error) {
            logger.error('settings', 'Settings reset failed', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error during settings reset',
            };
        }
    });

    logger.info('settings', 'Settings handlers setup completed');
}
