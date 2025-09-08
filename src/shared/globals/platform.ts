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

export class Platform {
    private static _info: PlatformInfo | null = null;

    /**
     * Get comprehensive platform information
     */
    public static getInfo(): PlatformInfo {
        if (!Platform._info) {
            Platform._info = Platform.detectPlatform();
        }
        return Platform._info;
    }

    private static detectPlatform(): PlatformInfo {
        // Default values for browser environment
        let type: PlatformType = 'unknown';
        let name = 'Unknown';
        let version = '0.0.0';
        let arch = 'unknown';

        // Check if we're in Node.js/Electron environment
        if (typeof process !== 'undefined') {
            type = process.platform as PlatformType;
            arch = process.arch;
            version = process.versions.node || '0.0.0';

            switch (type) {
                case 'win32':
                    name = 'Windows';
                    break;
                case 'darwin':
                    name = 'macOS';
                    break;
                case 'linux':
                    name = 'Linux';
                    break;
                default:
                    name = 'Unknown';
                    type = 'unknown';
            }
        } else if (typeof navigator !== 'undefined') {
            // Browser environment - try to detect from user agent
            const userAgent = navigator.userAgent.toLowerCase();

            if (userAgent.includes('win')) {
                type = 'win32';
                name = 'Windows';
            } else if (userAgent.includes('mac')) {
                type = 'darwin';
                name = 'macOS';
            } else if (userAgent.includes('linux')) {
                type = 'linux';
                name = 'Linux';
            }
        }

        return {
            type,
            name,
            version,
            arch,
            isElectron: typeof window !== 'undefined' && 'electronAPI' in window,
            isDevelopment: typeof process !== 'undefined' ?
                process.env.NODE_ENV === 'development' :
                false
        };
    }

    /**
     * Check if running on Windows
     */
    public static isWindows(): boolean {
        return Platform.getInfo().type === 'win32';
    }

    /**
     * Check if running on macOS
     */
    public static isMac(): boolean {
        return Platform.getInfo().type === 'darwin';
    }

    /**
     * Check if running on Linux
     */
    public static isLinux(): boolean {
        return Platform.getInfo().type === 'linux';
    }

    /**
     * Check if running in Electron
     */
    public static isElectron(): boolean {
        return Platform.getInfo().isElectron;
    }

    /**
     * Check if in development mode
     */
    public static isDevelopment(): boolean {
        return Platform.getInfo().isDevelopment;
    }

    /**
     * Get platform-specific path separator
     */
    public static getPathSeparator(): string {
        return Platform.isWindows() ? '\\' : '/';
    }

    /**
     * Get platform-specific line ending
     */
    public static getLineEnding(): string {
        return Platform.isWindows() ? '\r\n' : '\n';
    }

    /**
     * Get platform-specific data directory
     */
    public static getDataDirectory(): string {
        const info = Platform.getInfo();

        if (typeof process !== 'undefined' && 'env' in process) {
            // Electron main process
            try {
                const { app } = require('electron');
                return app.getPath('userData');
            } catch {
                // Fallback if electron is not available
            }
        }

        // Fallback for renderer/browser
        switch (info.type) {
            case 'win32':
                return '~/AppData/Roaming/PRG';
            case 'darwin':
                return '~/Library/Application Support/PRG';
            case 'linux':
                return '~/.local/share/prg';
            default:
                return '~/.prg';
        }
    }

    /**
     * Check if system supports specific features
     */
    public static checkFeatureSupport(): {
        webAudio: boolean;
        webWorkers: boolean;
        canvas: boolean;
        fileSystemAccess: boolean;
        gamepads: boolean;
    } {
        const hasWindow = typeof window !== 'undefined';

        return {
            webAudio: hasWindow && 'AudioContext' in window,
            webWorkers: hasWindow && 'Worker' in window,
            canvas: hasWindow && 'CanvasRenderingContext2D' in window,
            fileSystemAccess: hasWindow && 'showOpenFilePicker' in window,
            gamepads: hasWindow && 'getGamepads' in navigator
        };
    }

    /**
     * Get optimal worker count for current system
     */
    public static getOptimalWorkerCount(): number {
        if (typeof navigator !== 'undefined' && 'hardwareConcurrency' in navigator) {
            // Use half of available cores for workers
            return Math.max(1, Math.floor(navigator.hardwareConcurrency / 2));
        }

        // Fallback
        return 2;
    }

    /**
     * Format file size for display
     */
    public static formatFileSize(bytes: number): string {
        const units = ['B', 'KB', 'MB', 'GB', 'TB'];
        let size = bytes;
        let unitIndex = 0;

        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }

        return `${size.toFixed(1)} ${units[unitIndex]}`;
    }

    /**
     * Get system memory info (Electron only)
     */
    public static getMemoryInfo(): { total: number; free: number; used: number } | null {
        if (typeof process !== 'undefined' && 'memoryUsage' in process) {
            const usage = process.memoryUsage();
            return {
                total: usage.heapTotal,
                free: usage.heapTotal - usage.heapUsed,
                used: usage.heapUsed
            };
        }

        return null;
    }
}

// Export convenience functions
export const platform = {
    getInfo: Platform.getInfo.bind(Platform),
    isWindows: Platform.isWindows.bind(Platform),
    isMac: Platform.isMac.bind(Platform),
    isLinux: Platform.isLinux.bind(Platform),
    isElectron: Platform.isElectron.bind(Platform),
    isDevelopment: Platform.isDevelopment.bind(Platform),
    getPathSeparator: Platform.getPathSeparator.bind(Platform),
    getLineEnding: Platform.getLineEnding.bind(Platform),
    getDataDirectory: Platform.getDataDirectory.bind(Platform),
    checkFeatureSupport: Platform.checkFeatureSupport.bind(Platform),
    getOptimalWorkerCount: Platform.getOptimalWorkerCount.bind(Platform),
    formatFileSize: Platform.formatFileSize.bind(Platform),
    getMemoryInfo: Platform.getMemoryInfo.bind(Platform)
};
