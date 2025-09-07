"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetService = void 0;
// src/main/services/AssetService.ts
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const electron_1 = require("electron");
/**
 * Service for handling asset file operations in the main process.
 * Provides secure access to static assets like images, audio, and chart files.
 */
class AssetService {
    static getBasePath() {
        const isDev = process.env.NODE_ENV === 'development';
        if (isDev) {
            return path_1.default.join(electron_1.app.getAppPath(), '..', '..');
        }
        else {
            return process.resourcesPath;
        }
    }
    /**
     * Load an asset file and return its buffer data.
     * @param assetPath - Path relative to public/assets (e.g., 'bad-apple/Bad_Apple.ogg')
     * @returns Promise<Buffer> - The file buffer
     */
    static async loadAsset(assetPath) {
        try {
            // If path starts with /assets/, remove it to get the relative path
            const relativePath = assetPath.startsWith('/assets/')
                ? assetPath.substring('/assets/'.length)
                : assetPath;
            // Sanitize the path to prevent directory traversal
            const sanitizedPath = relativePath.replace(/\.\./g, '');
            const basePath = this.getBasePath();
            const fullPath = path_1.default.join(basePath, 'public', 'assets', sanitizedPath);
            // Verify the file exists and is within the assets directory
            const resolvedPath = path_1.default.resolve(fullPath);
            const assetsDir = path_1.default.resolve(path_1.default.join(basePath, 'public', 'assets'));
            if (!resolvedPath.startsWith(assetsDir)) {
                throw new Error('Invalid asset path: Path traversal detected');
            }
            // Check if file exists
            await promises_1.default.access(resolvedPath);
            // Read and return the file buffer
            return await promises_1.default.readFile(resolvedPath);
        }
        catch (error) {
            console.error(`Failed to load asset: ${assetPath}`, error);
            throw new Error(`Asset not found: ${assetPath}`);
        }
    }
    /**
     * Get the MIME type for a file based on its extension.
     * @param filePath - The file path
     * @returns The MIME type string
     */
    static getMimeType(filePath) {
        const ext = path_1.default.extname(filePath).toLowerCase();
        const mimeTypes = {
            '.ogg': 'audio/ogg',
            '.mp3': 'audio/mpeg',
            '.wav': 'audio/wav',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.gif': 'image/gif',
            '.json': 'application/json',
            '.txt': 'text/plain',
        };
        return mimeTypes[ext] || 'application/octet-stream';
    }
    /**
     * Check if an asset file exists.
     * @param assetPath - Path relative to public/assets
     * @returns Promise<boolean> - True if file exists
     */
    static async assetExists(assetPath) {
        try {
            // If path starts with /assets/, remove it to get the relative path
            const relativePath = assetPath.startsWith('/assets/')
                ? assetPath.substring('/assets/'.length)
                : assetPath;
            // Sanitize the path to prevent directory traversal
            const sanitizedPath = relativePath.replace(/\.\./g, '');
            const basePath = this.getBasePath();
            const fullPath = path_1.default.join(basePath, 'public', 'assets', sanitizedPath);
            await promises_1.default.access(fullPath);
            return true;
        }
        catch {
            return false;
        }
    }
}
exports.AssetService = AssetService;
