"use strict";
/**
 * PathService - Handles file system paths for the application
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PathService = void 0;
const electron_1 = require("electron");
const path_1 = require("path");
const fs_1 = require("fs");
const logger_1 = require("../../shared/globals/logger");
class PathService {
    constructor() {
        Object.defineProperty(this, "isDev", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: process.env.NODE_ENV === 'development'
        });
    }
    /**
     * Get the assets directory path
     */
    getAssetsPath() {
        if (this.isDev) {
            return (0, path_1.join)(process.cwd(), 'public', 'assets');
        }
        else {
            return (0, path_1.join)(electron_1.app.getPath('userData'), 'assets');
        }
    }
    /**
     * Get the user data directory path
     */
    getUserDataPath() {
        return electron_1.app.getPath('userData');
    }
    /**
     * Get the app data directory path (Application Support)
     */
    getAppDataPath() {
        // Use direct path to Application Support/prg instead of Electron's userData
        return (0, path_1.join)(require('os').homedir(), 'Library', 'Application Support', 'prg');
    }
    /**
     * Get the charts directory path
     */
    getChartsPath() {
        return (0, path_1.join)(this.getAppDataPath(), 'charts');
    }
    /**
     * Get the settings file path
     */
    getSettingsPath() {
        return (0, path_1.join)(this.getAppDataPath(), 'settings.json');
    }
    /**
     * Get the library.json file path
     */
    getLibraryPath() {
        return (0, path_1.join)(this.getAppDataPath(), 'library.json');
    }
    /**
     * Ensure a directory exists, create if it doesn't
     */
    async ensureDirectory(dirPath) {
        try {
            await fs_1.promises.access(dirPath);
        }
        catch {
            await fs_1.promises.mkdir(dirPath, { recursive: true });
            logger_1.logger.debug('path', `Created directory: ${dirPath}`);
        }
    }
    /**
     * Initialize all necessary directories
     */
    async initializeDirectories() {
        const directories = [
            this.getAppDataPath(),
            this.getChartsPath(),
            this.getAssetsPath()
        ];
        for (const dir of directories) {
            await this.ensureDirectory(dir);
        }
        logger_1.logger.info('path', '✅ All directories initialized');
    }
    /**
     * Get temporary directory path
     */
    getTempPath() {
        return (0, path_1.join)(this.getAppDataPath(), 'temp');
    }
    /**
     * Clean up temporary files
     */
    async cleanupTemp() {
        const tempPath = this.getTempPath();
        try {
            await fs_1.promises.rm(tempPath, { recursive: true, force: true });
            await this.ensureDirectory(tempPath);
            logger_1.logger.debug('path', 'Temporary directory cleaned');
        }
        catch (error) {
            logger_1.logger.warn('path', `Failed to cleanup temp directory: ${error}`);
        }
    }
}
exports.PathService = PathService;
exports.default = PathService;
