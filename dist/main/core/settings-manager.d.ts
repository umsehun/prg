/**
 * Settings Manager - Centralized application settings management
 * Handles loading, saving, and managing user preferences
 */
import { type ValidatedUserSettings } from '../../shared/schemas/settings.schema';
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
export declare class SettingsManager {
    private settings;
    private settingsPath;
    private isInitialized;
    private saveTimeout;
    constructor();
    /**
     * Initialize settings manager
     */
    initialize(): Promise<void>;
    /**
     * Load settings from disk
     */
    load(): Promise<void>;
    /**
     * Save settings to disk (debounced)
     */
    save(): Promise<void>;
    /**
     * Get current settings
     */
    getSettings(): AppSettings;
    /**
     * Get specific setting value
     */
    get<K extends keyof AppSettings>(key: K): AppSettings[K];
    /**
     * Update settings
     */
    updateSettings(updates: Partial<AppSettings>): Promise<void>;
    /**
     * Reset settings to defaults
     */
    resetToDefaults(): Promise<void>;
    /**
     * Export settings to file
     */
    exportSettings(filePath: string): Promise<void>;
    /**
     * Import settings from file
     */
    importSettings(filePath: string): Promise<void>;
    /**
     * Get default settings
     */
    private getDefaultSettings;
    /**
     * Ensure user data directory exists
     */
    private ensureUserDataDirectory;
    /**
     * Cleanup settings manager
     */
    cleanup(): void;
    /**
     * Check if settings manager is initialized
     */
    isSettingsInitialized(): boolean;
}
//# sourceMappingURL=settings-manager.d.ts.map