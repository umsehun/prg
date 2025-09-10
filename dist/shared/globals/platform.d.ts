/**
 * Cross-platform utility functions
 * Handles platform-specific operations and feature detection
 */
export type PlatformType = 'win32' | 'darwin' | 'linux' | 'unknown';
export interface PlatformInfo {
    type: PlatformType;
    name: string;
    version: string;
    arch: string;
    isElectron: boolean;
    isDevelopment: boolean;
}
export declare class Platform {
    private static _info;
    /**
     * Get comprehensive platform information
     */
    static getInfo(): PlatformInfo;
    private static detectPlatform;
    /**
     * Check if running on Windows
     */
    static isWindows(): boolean;
    /**
     * Check if running on macOS
     */
    static isMac(): boolean;
    /**
     * Check if running on Linux
     */
    static isLinux(): boolean;
    /**
     * Check if running in Electron
     */
    static isElectron(): boolean;
    /**
     * Check if in development mode
     */
    static isDevelopment(): boolean;
    /**
     * Get platform-specific path separator
     */
    static getPathSeparator(): string;
    /**
     * Get platform-specific line ending
     */
    static getLineEnding(): string;
    /**
     * Get platform-specific data directory
     */
    static getDataDirectory(): string;
    /**
     * Check if system supports specific features
     */
    static checkFeatureSupport(): {
        webAudio: boolean;
        webWorkers: boolean;
        canvas: boolean;
        fileSystemAccess: boolean;
        gamepads: boolean;
    };
    /**
     * Get optimal worker count for current system
     */
    static getOptimalWorkerCount(): number;
    /**
     * Format file size for display
     */
    static formatFileSize(bytes: number): string;
    /**
     * Get system memory info (Electron only)
     */
    static getMemoryInfo(): {
        total: number;
        free: number;
        used: number;
    } | null;
}
export declare const platform: {
    getInfo: typeof Platform.getInfo;
    isWindows: typeof Platform.isWindows;
    isMac: typeof Platform.isMac;
    isLinux: typeof Platform.isLinux;
    isElectron: typeof Platform.isElectron;
    isDevelopment: typeof Platform.isDevelopment;
    getPathSeparator: typeof Platform.getPathSeparator;
    getLineEnding: typeof Platform.getLineEnding;
    getDataDirectory: typeof Platform.getDataDirectory;
    checkFeatureSupport: typeof Platform.checkFeatureSupport;
    getOptimalWorkerCount: typeof Platform.getOptimalWorkerCount;
    formatFileSize: typeof Platform.formatFileSize;
    getMemoryInfo: typeof Platform.getMemoryInfo;
};
//# sourceMappingURL=platform.d.ts.map