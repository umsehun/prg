/**
 * Platform Utils - Cross-platform compatibility utilities
 * Handles differences between Windows, macOS, and Linux
 */
export interface PlatformInfo {
    name: 'windows' | 'macos' | 'linux';
    arch: string;
    version: string;
    isDev: boolean;
}
export declare class PlatformUtils {
    private static _info;
    static get info(): PlatformInfo;
    private static normalizePlatformName;
    /**
     * Get platform-specific user data directory
     */
    static getUserDataPath(): string;
    /**
     * Get platform-specific application data directory
     */
    static getAppDataPath(): string;
    /**
     * Get platform-specific documents directory
     */
    static getDocumentsPath(): string;
    /**
     * Get platform-specific downloads directory
     */
    static getDownloadsPath(): string;
    /**
     * Get platform-specific settings directory
     */
    static getSettingsPath(): string;
    /**
     * Get platform-specific charts directory
     */
    static getChartsPath(): string;
    /**
     * Get platform-specific logs directory
     */
    static getLogsPath(): string;
    /**
     * Get platform-specific window configuration
     */
    static getWindowConfig(): {
        width: number;
        height: number;
        minWidth: number;
        minHeight: number;
        frame: boolean;
        titleBarStyle: "default";
        webSecurity: boolean;
    };
    /**
     * Check if running on macOS
     */
    static get isMacOS(): boolean;
    /**
     * Check if running on Windows
     */
    static get isWindows(): boolean;
    /**
     * Check if running on Linux
     */
    static get isLinux(): boolean;
    /**
     * Get platform-specific keyboard shortcuts
     */
    static getShortcuts(): {
        quit: string;
        minimize: string;
        close: string;
        fullscreen: string;
        devtools: string;
        reload: string;
        forceReload: string;
    };
    /**
     * Get platform-specific file associations
     */
    static getFileAssociations(): {
        extensions: string[];
        mimeType: string;
        description: string;
        role?: never;
    } | {
        extensions: string[];
        mimeType: string;
        description: string;
        role: string;
    };
    /**
     * Log platform information
     */
    static logInfo(): void;
}
//# sourceMappingURL=platform.d.ts.map