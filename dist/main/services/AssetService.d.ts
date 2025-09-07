/**
 * Service for handling asset file operations in the main process.
 * Provides secure access to static assets like images, audio, and chart files.
 */
export declare class AssetService {
    private static getBasePath;
    /**
     * Load an asset file and return its buffer data.
     * @param assetPath - Path relative to public/assets (e.g., 'bad-apple/Bad_Apple.ogg')
     * @returns Promise<Buffer> - The file buffer
     */
    static loadAsset(assetPath: string): Promise<Buffer>;
    /**
     * Get the MIME type for a file based on its extension.
     * @param filePath - The file path
     * @returns The MIME type string
     */
    static getMimeType(filePath: string): string;
    /**
     * Check if an asset file exists.
     * @param assetPath - Path relative to public/assets
     * @returns Promise<boolean> - True if file exists
     */
    static assetExists(assetPath: string): Promise<boolean>;
}
//# sourceMappingURL=AssetService.d.ts.map