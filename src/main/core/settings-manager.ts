/**
 * Settings Manager - Centralized application settings management
 * Handles loading, saving, and managing user preferences
 */

import { app } from 'electron';
import { promises as fs } from 'fs';
import { join } from 'path';
import { z } from 'zod';
import { logger } from '../../shared/globals/logger';
import { UserSettingsSchema, type ValidatedUserSettings } from '../../shared/schemas/settings.schema';

/**
 * Application settings structure
 */
export interface AppSettings {
  readonly version: string;
  readonly userSettings: ValidatedUserSettings;
  readonly ui: {
    readonly theme: 'light' | 'dark' | 'auto';
    readonly language: string;
    readonly windowState?: {
      readonly width: number;
      readonly height: number;
      readonly x?: number;
      readonly y?: number;
      readonly maximized: boolean;
    };
  };
  readonly performance: {
    readonly enableHardwareAcceleration: boolean;
    readonly maxFPS: number;
    readonly reduceMotion: boolean;
  };
  readonly privacy: {
    readonly sendCrashReports: boolean;
    readonly sendUsageStats: boolean;
  };
}

/**
 * Settings validation schema
 */
const AppSettingsSchema = z.object({
  version: z.string(),
  userSettings: UserSettingsSchema,
  ui: z.object({
    theme: z.enum(['light', 'dark', 'auto']).default('auto'),
    language: z.string().default('en'),
    windowState: z.object({
      width: z.number().min(800),
      height: z.number().min(600),
      x: z.number().optional(),
      y: z.number().optional(),
      maximized: z.boolean().default(false),
    }).optional(),
  }),
  performance: z.object({
    enableHardwareAcceleration: z.boolean().default(true),
    maxFPS: z.number().min(30).max(240).default(60),
    reduceMotion: z.boolean().default(false),
  }),
  privacy: z.object({
    sendCrashReports: z.boolean().default(false),
    sendUsageStats: z.boolean().default(false),
  }),
});

export class SettingsManager {
  private settings: AppSettings;
  private settingsPath: string;
  private isInitialized = false;
  private saveTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.settingsPath = join(app.getPath('userData'), 'settings.json');
    this.settings = this.getDefaultSettings();
  }

  /**
   * Initialize settings manager
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      logger.warn('settings', 'Settings manager already initialized');
      return;
    }

    try {
      logger.info('settings', 'Initializing settings manager');

      // Ensure user data directory exists
      await this.ensureUserDataDirectory();

      // Load existing settings or create defaults
      await this.load();

      this.isInitialized = true;
      logger.info('settings', 'Settings manager initialized successfully');

    } catch (error) {
      logger.error('settings', 'Failed to initialize settings manager', error);
      throw error;
    }
  }

  /**
   * Load settings from disk
   */
  public async load(): Promise<void> {
    try {
      const settingsData = await fs.readFile(this.settingsPath, 'utf-8');
      const parsedSettings = JSON.parse(settingsData);
      
      // Validate and merge with defaults
      const validatedSettings = AppSettingsSchema.parse(parsedSettings);
      this.settings = validatedSettings as AppSettings;

      logger.info('settings', 'Settings loaded successfully');
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        logger.info('settings', 'Settings file not found, using defaults');
        await this.save();
      } else {
        logger.warn('settings', 'Failed to load settings, using defaults', error);
        this.settings = this.getDefaultSettings();
        await this.save();
      }
    }
  }

  /**
   * Save settings to disk (debounced)
   */
  public async save(): Promise<void> {
    try {
      // Clear existing timeout
      if (this.saveTimeout) {
        clearTimeout(this.saveTimeout);
      }

      // Debounce saves to avoid frequent disk writes
      this.saveTimeout = setTimeout(async () => {
        try {
          const settingsData = JSON.stringify(this.settings, null, 2);
          await fs.writeFile(this.settingsPath, settingsData, 'utf-8');
          
          logger.debug('settings', 'Settings saved successfully');
        } catch (error) {
          logger.error('settings', 'Failed to save settings', error);
        }
      }, 500);

    } catch (error) {
      logger.error('settings', 'Failed to schedule settings save', error);
    }
  }

  /**
   * Get current settings
   */
  public getSettings(): AppSettings {
    return { ...this.settings };
  }

  /**
   * Get specific setting value
   */
  public get<K extends keyof AppSettings>(key: K): AppSettings[K] {
    return this.settings[key];
  }

  /**
   * Update settings
   */
  public async updateSettings(updates: Partial<AppSettings>): Promise<void> {
    try {
      // Validate updates
      const updatedSettings = { ...this.settings, ...updates };
      const validatedSettings = AppSettingsSchema.parse(updatedSettings);
      
      this.settings = validatedSettings as AppSettings;
      await this.save();

      logger.info('settings', 'Settings updated successfully');
    } catch (error) {
      logger.error('settings', 'Failed to update settings', error);
      throw error;
    }
  }

  /**
   * Reset settings to defaults
   */
  public async resetToDefaults(): Promise<void> {
    try {
      this.settings = this.getDefaultSettings();
      await this.save();

      logger.info('settings', 'Settings reset to defaults');
    } catch (error) {
      logger.error('settings', 'Failed to reset settings', error);
      throw error;
    }
  }

  /**
   * Export settings to file
   */
  public async exportSettings(filePath: string): Promise<void> {
    try {
      const settingsData = JSON.stringify(this.settings, null, 2);
      await fs.writeFile(filePath, settingsData, 'utf-8');

      logger.info('settings', 'Settings exported successfully', { filePath });
    } catch (error) {
      logger.error('settings', 'Failed to export settings', error);
      throw error;
    }
  }

  /**
   * Import settings from file
   */
  public async importSettings(filePath: string): Promise<void> {
    try {
      const settingsData = await fs.readFile(filePath, 'utf-8');
      const parsedSettings = JSON.parse(settingsData);
      
      // Validate imported settings
      const validatedSettings = AppSettingsSchema.parse(parsedSettings);
      this.settings = validatedSettings as AppSettings;
      
      await this.save();

      logger.info('settings', 'Settings imported successfully', { filePath });
    } catch (error) {
      logger.error('settings', 'Failed to import settings', error);
      throw error;
    }
  }

  /**
   * Get default settings
   */
  private getDefaultSettings(): AppSettings {
    // Create default user settings
    const defaultUserSettings = UserSettingsSchema.parse({
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
      version: app.getVersion(),
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
  private async ensureUserDataDirectory(): Promise<void> {
    try {
      const userDataPath = app.getPath('userData');
      await fs.mkdir(userDataPath, { recursive: true });
      
      logger.debug('settings', 'User data directory ensured', { path: userDataPath });
    } catch (error) {
      logger.error('settings', 'Failed to create user data directory', error);
      throw error;
    }
  }

  /**
   * Cleanup settings manager
   */
  public cleanup(): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
      this.saveTimeout = null;
    }

    logger.debug('settings', 'Settings manager cleanup completed');
  }

  /**
   * Check if settings manager is initialized
   */
  public isSettingsInitialized(): boolean {
    return this.isInitialized;
  }
}
