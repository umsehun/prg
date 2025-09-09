/**
 * PathService - Handles file system paths for the application
 */
export declare class PathService {
    private readonly isDev;
    /**
     * Get the assets directory path
     */
    getAssetsPath(): string;
    /**
     * Get the user data directory path
     */
    getUserDataPath(): string;
    /**
     * Get the app data directory path (Application Support)
     */
    getAppDataPath(): string;
    /**
     * Get the charts directory path
     */
    getChartsPath(): string;
    /**
     * Get the settings file path
     */
    getSettingsPath(): string;
    /**
     * Ensure a directory exists, create if it doesn't
     */
    ensureDirectory(dirPath: string): Promise<void>;
    /**
     * Initialize all necessary directories
     */
    initializeDirectories(): Promise<void>;
    /**
     * Get temporary directory path
     */
    getTempPath(): string;
    /**
     * Clean up temporary files
     */
    cleanupTemp(): Promise<void>;
}
export default PathService;
//# sourceMappingURL=PathService.d.ts.map