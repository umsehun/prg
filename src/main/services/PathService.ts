/**
 * PathService - Handles file system paths for the application
 */

import { app } from 'electron';
import { join } from 'path';
import { promises as fs } from 'fs';
import { logger } from '../../shared/globals/logger';

export class PathService {
    private readonly isDev = process.env.NODE_ENV === 'development';

    /**
     * Get the assets directory path
     */
    public getAssetsPath(): string {
        if (this.isDev) {
            return join(process.cwd(), 'public', 'assets');
        } else {
            return join(app.getPath('userData'), 'assets');
        }
    }

    /**
     * Get the user data directory path
     */
    public getUserDataPath(): string {
        return app.getPath('userData');
    }

    /**
     * Get the app data directory path (Application Support)
     */
    public getAppDataPath(): string {
        // Use direct path to Application Support/prg instead of Electron's userData
        return join(require('os').homedir(), 'Library', 'Application Support', 'prg');
    }

    /**
     * Get the charts directory path
     */
    public getChartsPath(): string {
        return join(this.getAppDataPath(), 'charts');
    }

    /**
     * Get the settings file path
     */
    public getSettingsPath(): string {
        return join(this.getAppDataPath(), 'settings.json');
    }

    /**
     * Get the library.json file path
     */
    public getLibraryPath(): string {
        return join(this.getAppDataPath(), 'library.json');
    }

    /**
     * Ensure a directory exists, create if it doesn't
     */
    public async ensureDirectory(dirPath: string): Promise<void> {
        try {
            await fs.access(dirPath);
        } catch {
            await fs.mkdir(dirPath, { recursive: true });
            logger.debug('path', `Created directory: ${dirPath}`);
        }
    }

    /**
     * Initialize all necessary directories
     */
    public async initializeDirectories(): Promise<void> {
        const directories = [
            this.getAppDataPath(),
            this.getChartsPath(),
            this.getAssetsPath()
        ];

        for (const dir of directories) {
            await this.ensureDirectory(dir);
        }

        logger.info('path', '✅ All directories initialized');
    }

    /**
     * Get temporary directory path
     */
    public getTempPath(): string {
        return join(this.getAppDataPath(), 'temp');
    }

    /**
     * Clean up temporary files
     */
    public async cleanupTemp(): Promise<void> {
        const tempPath = this.getTempPath();
        try {
            await fs.rm(tempPath, { recursive: true, force: true });
            await this.ensureDirectory(tempPath);
            logger.debug('path', 'Temporary directory cleaned');
        } catch (error) {
            logger.warn('path', `Failed to cleanup temp directory: ${error}`);
        }
    }
}

export default PathService;
