/**
 * Platform Utils - Cross-platform compatibility utilities
 * Handles differences between Windows, macOS, and Linux
 */

import { platform, arch } from 'os';
import { join } from 'path';
import { app } from 'electron';

export interface PlatformInfo {
    name: 'windows' | 'macos' | 'linux';
    arch: string;
    version: string;
    isDev: boolean;
}

export class PlatformUtils {
    private static _info: PlatformInfo | null = null;

    static get info(): PlatformInfo {
        if (!this._info) {
            const platformName = platform();

            this._info = {
                name: this.normalizePlatformName(platformName),
                arch: arch(),
                version: process.versions.electron || 'unknown',
                isDev: process.env.NODE_ENV === 'development'
            };
        }

        return this._info;
    }

    private static normalizePlatformName(platformName: string): 'windows' | 'macos' | 'linux' {
        switch (platformName) {
            case 'win32':
                return 'windows';
            case 'darwin':
                return 'macos';
            case 'linux':
                return 'linux';
            default:
                return 'linux'; // Default fallback
        }
    }

    /**
     * Get platform-specific user data directory
     */
    static getUserDataPath(): string {
        return app.getPath('userData');
    }

    /**
     * Get platform-specific application data directory
     */
    static getAppDataPath(): string {
        return app.getPath('appData');
    }

    /**
     * Get platform-specific documents directory
     */
    static getDocumentsPath(): string {
        return app.getPath('documents');
    }

    /**
     * Get platform-specific downloads directory
     */
    static getDownloadsPath(): string {
        return app.getPath('downloads');
    }

    /**
     * Get platform-specific settings directory
     */
    static getSettingsPath(): string {
        const userDataPath = this.getUserDataPath();
        return join(userDataPath, 'settings');
    }

    /**
     * Get platform-specific charts directory
     */
    static getChartsPath(): string {
        const userDataPath = this.getUserDataPath();
        return join(userDataPath, 'charts');
    }

    /**
     * Get platform-specific logs directory
     */
    static getLogsPath(): string {
        const userDataPath = this.getUserDataPath();
        return join(userDataPath, 'logs');
    }

    /**
     * Get platform-specific window configuration
     */
    static getWindowConfig() {
        const { name } = this.info;

        const baseConfig = {
            width: 1280,
            height: 800,
            minWidth: 800,
            minHeight: 600,
            frame: true, // ✅ CRITICAL FIX: Show standard OS titlebar
            titleBarStyle: 'default' as const, // ✅ CRITICAL FIX: Use default titlebar
            webSecurity: false,
        };

        switch (name) {
            case 'macos':
                return {
                    ...baseConfig,
                    // ✅ CRITICAL FIX: Use default macOS titlebar (removed hiddenInset)
                    titleBarStyle: 'default' as const,
                    // trafficLightPosition removed - not needed with default titlebar
                };

            case 'windows':
                return {
                    ...baseConfig,
                    // Windows-specific configurations
                };

            case 'linux':
                return {
                    ...baseConfig,
                    // Linux-specific configurations
                };

            default:
                return baseConfig;
        }
    }

    /**
     * Check if running on macOS
     */
    static get isMacOS(): boolean {
        return this.info.name === 'macos';
    }

    /**
     * Check if running on Windows
     */
    static get isWindows(): boolean {
        return this.info.name === 'windows';
    }

    /**
     * Check if running on Linux
     */
    static get isLinux(): boolean {
        return this.info.name === 'linux';
    }

    /**
     * Get platform-specific keyboard shortcuts
     */
    static getShortcuts() {
        const { name } = this.info;
        const modifier = name === 'macos' ? 'Cmd' : 'Ctrl';

        return {
            quit: name === 'macos' ? 'Cmd+Q' : 'Ctrl+Q',
            minimize: name === 'macos' ? 'Cmd+M' : 'Ctrl+M',
            close: name === 'macos' ? 'Cmd+W' : 'Ctrl+W',
            fullscreen: name === 'macos' ? 'Cmd+Ctrl+F' : 'F11',
            devtools: `${modifier}+Shift+I`,
            reload: `${modifier}+R`,
            forceReload: `${modifier}+Shift+R`,
        };
    }

    /**
     * Get platform-specific file associations
     */
    static getFileAssociations() {
        const { name } = this.info;

        const extensions = ['.osz', '.osk'];
        const mimeType = 'application/x-osu-beatmap';

        switch (name) {
            case 'windows':
                return {
                    extensions,
                    mimeType,
                    description: 'osu! Beatmap'
                };

            case 'macos':
                return {
                    extensions,
                    mimeType,
                    description: 'osu! Beatmap',
                    role: 'Editor'
                };

            case 'linux':
                return {
                    extensions,
                    mimeType,
                    description: 'osu! Beatmap'
                };

            default:
                return { extensions, mimeType, description: 'osu! Beatmap' };
        }
    }

    /**
     * Log platform information
     */
    static logInfo() {
        const info = this.info;
        console.log(`Platform: ${info.name} (${info.arch})`);
        console.log(`Electron: ${info.version}`);
        console.log(`Development: ${info.isDev}`);
        console.log(`User Data: ${this.getUserDataPath()}`);
    }
}
