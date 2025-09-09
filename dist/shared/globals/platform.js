"use strict";
/**
 * Cross-platform utility functions
 * Handles platform-specific operations and feature detection
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.platform = exports.Platform = void 0;
class Platform {
    /**
     * Get comprehensive platform information
     */
    static getInfo() {
        if (!Platform._info) {
            Platform._info = Platform.detectPlatform();
        }
        return Platform._info;
    }
    static detectPlatform() {
        // Default values for browser environment
        let type = 'unknown';
        let name = 'Unknown';
        let version = '0.0.0';
        let arch = 'unknown';
        // Check if we're in Node.js/Electron environment
        if (typeof process !== 'undefined') {
            type = process.platform;
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
        }
        else if (typeof navigator !== 'undefined') {
            // Browser environment - try to detect from user agent
            const userAgent = navigator.userAgent.toLowerCase();
            if (userAgent.includes('win')) {
                type = 'win32';
                name = 'Windows';
            }
            else if (userAgent.includes('mac')) {
                type = 'darwin';
                name = 'macOS';
            }
            else if (userAgent.includes('linux')) {
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
    static isWindows() {
        return Platform.getInfo().type === 'win32';
    }
    /**
     * Check if running on macOS
     */
    static isMac() {
        return Platform.getInfo().type === 'darwin';
    }
    /**
     * Check if running on Linux
     */
    static isLinux() {
        return Platform.getInfo().type === 'linux';
    }
    /**
     * Check if running in Electron
     */
    static isElectron() {
        return Platform.getInfo().isElectron;
    }
    /**
     * Check if in development mode
     */
    static isDevelopment() {
        return Platform.getInfo().isDevelopment;
    }
    /**
     * Get platform-specific path separator
     */
    static getPathSeparator() {
        return Platform.isWindows() ? '\\' : '/';
    }
    /**
     * Get platform-specific line ending
     */
    static getLineEnding() {
        return Platform.isWindows() ? '\r\n' : '\n';
    }
    /**
     * Get platform-specific data directory
     */
    static getDataDirectory() {
        const info = Platform.getInfo();
        if (typeof process !== 'undefined' && 'env' in process) {
            // Electron main process
            try {
                const { app } = require('electron');
                return app.getPath('userData');
            }
            catch {
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
    static checkFeatureSupport() {
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
    static getOptimalWorkerCount() {
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
    static formatFileSize(bytes) {
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
    static getMemoryInfo() {
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
exports.Platform = Platform;
Object.defineProperty(Platform, "_info", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: null
});
// Export convenience functions
exports.platform = {
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
