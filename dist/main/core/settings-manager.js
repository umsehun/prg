"use strict";
/**
 * Settings Manager - Centralized application settings management
 * Handles loading, saving, and managing user preferences
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsManager = void 0;
const electron_1 = require("electron");
const fs_1 = require("fs");
const path_1 = require("path");
const zod_1 = require("zod");
const logger_1 = require("../../shared/globals/logger");
const settings_schema_1 = require("../../shared/schemas/settings.schema");
/**
 * Settings validation schema
 */
const AppSettingsSchema = zod_1.z.object({
    version: zod_1.z.string(),
    userSettings: settings_schema_1.UserSettingsSchema,
    ui: zod_1.z.object({
        theme: zod_1.z.enum(['light', 'dark', 'auto']).default('auto'),
        language: zod_1.z.string().default('en'),
        windowState: zod_1.z.object({
            width: zod_1.z.number().min(800),
            height: zod_1.z.number().min(600),
            x: zod_1.z.number().optional(),
            y: zod_1.z.number().optional(),
            maximized: zod_1.z.boolean().default(false),
        }).optional(),
    }),
    performance: zod_1.z.object({
        enableHardwareAcceleration: zod_1.z.boolean().default(true),
        maxFPS: zod_1.z.number().min(30).max(240).default(60),
        reduceMotion: zod_1.z.boolean().default(false),
    }),
    privacy: zod_1.z.object({
        sendCrashReports: zod_1.z.boolean().default(false),
        sendUsageStats: zod_1.z.boolean().default(false),
    }),
});
class SettingsManager {
    constructor() {
        Object.defineProperty(this, "settings", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "settingsPath", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "isInitialized", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "saveTimeout", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        this.settingsPath = (0, path_1.join)(electron_1.app.getPath('userData'), 'settings.json');
        this.settings = this.getDefaultSettings();
    }
    /**
     * Initialize settings manager
     */
    async initialize() {
        if (this.isInitialized) {
            logger_1.logger.warn('settings', 'Settings manager already initialized');
            return;
        }
        try {
            logger_1.logger.info('settings', 'Initializing settings manager');
            // Ensure user data directory exists
            await this.ensureUserDataDirectory();
            // Load existing settings or create defaults
            await this.load();
            this.isInitialized = true;
            logger_1.logger.info('settings', 'Settings manager initialized successfully');
        }
        catch (error) {
            logger_1.logger.error('settings', 'Failed to initialize settings manager', error);
            throw error;
        }
    }
    /**
     * Load settings from disk
     */
    async load() {
        try {
            const settingsData = await fs_1.promises.readFile(this.settingsPath, 'utf-8');
            const parsedSettings = JSON.parse(settingsData);
            // Validate and merge with defaults
            const validatedSettings = AppSettingsSchema.parse(parsedSettings);
            this.settings = validatedSettings;
            logger_1.logger.info('settings', 'Settings loaded successfully');
        }
        catch (error) {
            if (error.code === 'ENOENT') {
                logger_1.logger.info('settings', 'Settings file not found, using defaults');
                await this.save();
            }
            else {
                logger_1.logger.warn('settings', 'Failed to load settings, using defaults', error);
                this.settings = this.getDefaultSettings();
                await this.save();
            }
        }
    }
    /**
     * Save settings to disk (debounced)
     */
    async save() {
        try {
            // Clear existing timeout
            if (this.saveTimeout) {
                clearTimeout(this.saveTimeout);
            }
            // Debounce saves to avoid frequent disk writes
            this.saveTimeout = setTimeout(async () => {
                try {
                    const settingsData = JSON.stringify(this.settings, null, 2);
                    await fs_1.promises.writeFile(this.settingsPath, settingsData, 'utf-8');
                    logger_1.logger.debug('settings', 'Settings saved successfully');
                }
                catch (error) {
                    logger_1.logger.error('settings', 'Failed to save settings', error);
                }
            }, 500);
        }
        catch (error) {
            logger_1.logger.error('settings', 'Failed to schedule settings save', error);
        }
    }
    /**
     * Get current settings
     */
    getSettings() {
        return { ...this.settings };
    }
    /**
     * Get specific setting value
     */
    get(key) {
        return this.settings[key];
    }
    /**
     * Update settings
     */
    async updateSettings(updates) {
        try {
            // Validate updates
            const updatedSettings = { ...this.settings, ...updates };
            const validatedSettings = AppSettingsSchema.parse(updatedSettings);
            this.settings = validatedSettings;
            await this.save();
            logger_1.logger.info('settings', 'Settings updated successfully');
        }
        catch (error) {
            logger_1.logger.error('settings', 'Failed to update settings', error);
            throw error;
        }
    }
    /**
     * Reset settings to defaults
     */
    async resetToDefaults() {
        try {
            this.settings = this.getDefaultSettings();
            await this.save();
            logger_1.logger.info('settings', 'Settings reset to defaults');
        }
        catch (error) {
            logger_1.logger.error('settings', 'Failed to reset settings', error);
            throw error;
        }
    }
    /**
     * Export settings to file
     */
    async exportSettings(filePath) {
        try {
            const settingsData = JSON.stringify(this.settings, null, 2);
            await fs_1.promises.writeFile(filePath, settingsData, 'utf-8');
            logger_1.logger.info('settings', 'Settings exported successfully', { filePath });
        }
        catch (error) {
            logger_1.logger.error('settings', 'Failed to export settings', error);
            throw error;
        }
    }
    /**
     * Import settings from file
     */
    async importSettings(filePath) {
        try {
            const settingsData = await fs_1.promises.readFile(filePath, 'utf-8');
            const parsedSettings = JSON.parse(settingsData);
            // Validate imported settings
            const validatedSettings = AppSettingsSchema.parse(parsedSettings);
            this.settings = validatedSettings;
            await this.save();
            logger_1.logger.info('settings', 'Settings imported successfully', { filePath });
        }
        catch (error) {
            logger_1.logger.error('settings', 'Failed to import settings', error);
            throw error;
        }
    }
    /**
     * Get default settings
     */
    getDefaultSettings() {
        // Create default user settings
        const defaultUserSettings = settings_schema_1.UserSettingsSchema.parse({
            profile: {
                username: 'Player',
                country: 'US',
                timezone: 'UTC',
                language: 'en',
                preferredGameMode: 'osu',
                showOnlineStatus: true,
                allowFriendRequests: true,
                allowPrivateMessages: true,
                filterOffensiveWords: true,
            },
            audio: {
                masterVolume: 1.0,
                effectVolume: 1.0,
                musicVolume: 1.0,
                audioOffset: 0,
                outputDevice: 'default',
                sampleRate: 44100,
                bufferSize: 1024,
                audioEngine: 'auto',
            },
            visual: {
                backgroundDim: 0.5,
                showVideoBackground: true,
                showStoryboard: true,
                reducedMotion: false,
                showSeasonalThemes: true,
                comboBurstStyle: 'default',
                showInterface: true,
                alwaysShowKeyOverlay: false,
                showProgressBar: true,
            },
            input: {
                keyBindings: {
                    key1: 'KeyZ',
                    key2: 'KeyX',
                    pause: 'Escape',
                    restart: 'KeyR',
                },
                mouseSensitivity: 1.0,
                mouseAcceleration: false,
                keyRepeat: false,
                rawInput: false,
                ignoreMouseButtons: false,
                mouseDisableWheel: false,
                mouseDisableButtons: false,
                confineMouseMode: 'fullscreen',
            },
            gameplay: {
                noteSpeed: 1.0,
                scrollDirection: 'down',
                showAccuracy: true,
                showScoreboard: true,
                showReplayControls: true,
                pauseOnFocusLost: true,
                enableModAssist: false,
                showHitErrorBar: true,
                skipCutscenes: false,
                scoreDisplayMode: 'standardised',
                enableCustomSkins: true,
            },
            skin: {
                currentSkin: 'default',
                skinPath: '',
                useCustomSounds: true,
                alwaysUseDefaultSkin: false,
                ignoreBeatmapSkins: false,
                tintSliderBalls: false,
                useTaikoSkin: false,
                showApproachCircle: true,
                showCursor: true,
                showCursorTrail: true,
            },
            performance: {
                frameLimit: 60,
                compatibilityMode: false,
                reduceDroppedFrames: true,
                detectPerformanceIssues: true,
                lowLatencyAudio: false,
                threadedOptimization: true,
                showFPSCounter: false,
                enableGarbageCollection: true,
                memoryOptimization: true,
            },
            network: {
                automaticDownloads: true,
                autoDownloadBeatmaps: true,
                autoDownloadReplays: false,
                preferNoVideo: false,
                chatFilter: 'some',
                allowIncomingRequests: true,
                shareCity: false,
                enableSpectating: true,
                integrateOsuDirect: true,
                enableIngameLeaderboard: true,
                enableNotificationSounds: true,
                enableNotificationDuringGameplay: false,
                enableOnlineIntegration: true,
                banDuration: 0,
            },
            directories: {
                songsDirectory: '',
                skinsDirectory: '',
                replaysDirectory: '',
                screenshotsDirectory: '',
                beatmapsDirectory: '',
            },
            debug: {
                showFPS: false,
                showFrameTime: false,
                logLevel: 'info',
                enableDebugOutput: false,
                saveDebugLogs: false,
                detailedProfiling: false,
                memoryProfiling: false,
                gpuProfiling: false,
            },
            accessibility: {
                colorblindSupport: false,
                highContrast: false,
                largeText: false,
                enableScreenReader: false,
                enableKeyboardNavigation: true,
                enableTooltips: true,
                reduceAnimation: false,
            },
            migration: {
                hasRunMigration: false,
                migrationVersion: '1.0.0',
                lastMigrationCheck: new Date().toISOString(),
            },
        });
        return {
            version: electron_1.app.getVersion(),
            userSettings: defaultUserSettings,
            ui: {
                theme: 'auto',
                language: 'en',
            },
            performance: {
                enableHardwareAcceleration: true,
                maxFPS: 60,
                reduceMotion: false,
            },
            privacy: {
                sendCrashReports: false,
                sendUsageStats: false,
            },
        };
    }
    /**
     * Ensure user data directory exists
     */
    async ensureUserDataDirectory() {
        try {
            const userDataPath = electron_1.app.getPath('userData');
            await fs_1.promises.mkdir(userDataPath, { recursive: true });
            logger_1.logger.debug('settings', 'User data directory ensured', { path: userDataPath });
        }
        catch (error) {
            logger_1.logger.error('settings', 'Failed to create user data directory', error);
            throw error;
        }
    }
    /**
     * Cleanup settings manager
     */
    cleanup() {
        if (this.saveTimeout) {
            clearTimeout(this.saveTimeout);
            this.saveTimeout = null;
        }
        logger_1.logger.debug('settings', 'Settings manager cleanup completed');
    }
    /**
     * Check if settings manager is initialized
     */
    isSettingsInitialized() {
        return this.isInitialized;
    }
}
exports.SettingsManager = SettingsManager;
