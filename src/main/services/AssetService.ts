// src/main/services/AssetService.ts
import path from 'path';
import fs from 'fs/promises';
import { app } from 'electron';

/**
 * Service for handling asset file operations in the main process.
 * Provides secure access to static assets like images, audio, and chart files.
 */
export class AssetService {
  private static getBasePath(): string {
    const isDev = process.env.NODE_ENV === 'development';
    if (isDev) {
      return path.join(app.getAppPath(), '..', '..');
    } else {
      return process.resourcesPath;
    }
  }

  /**
   * Load an asset file and return its buffer data.
   * @param assetPath - Path relative to public/assets (e.g., 'bad-apple/Bad_Apple.ogg')
   * @returns Promise<Buffer> - The file buffer
   */
  static async loadAsset(assetPath: string): Promise<Buffer> {
    try {
      // If path starts with /assets/, remove it to get the relative path
      const relativePath = assetPath.startsWith('/assets/')
        ? assetPath.substring('/assets/'.length)
        : assetPath;

      // Sanitize the path to prevent directory traversal
      const sanitizedPath = relativePath.replace(/\.\./g, '');
      const basePath = this.getBasePath();
      const fullPath = path.join(basePath, 'public', 'assets', sanitizedPath);

      // Verify the file exists and is within the assets directory
      const resolvedPath = path.resolve(fullPath);
      const assetsDir = path.resolve(path.join(basePath, 'public', 'assets'));
      
      if (!resolvedPath.startsWith(assetsDir)) {
        throw new Error('Invalid asset path: Path traversal detected');
      }

      // Check if file exists
      await fs.access(resolvedPath);

      // Read and return the file buffer
      return await fs.readFile(resolvedPath);
    } catch (error) {
      console.error(`Failed to load asset: ${assetPath}`, error);
      throw new Error(`Asset not found: ${assetPath}`);
    }
  }

  /**
   * Get the MIME type for a file based on its extension.
   * @param filePath - The file path
   * @returns The MIME type string
   */
  static getMimeType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    
    const mimeTypes: { [key: string]: string } = {
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
  static async assetExists(assetPath: string): Promise<boolean> {
    try {
      // If path starts with /assets/, remove it to get the relative path
      const relativePath = assetPath.startsWith('/assets/')
        ? assetPath.substring('/assets/'.length)
        : assetPath;

      // Sanitize the path to prevent directory traversal
      const sanitizedPath = relativePath.replace(/\.\./g, '');
      const basePath = this.getBasePath();
      const fullPath = path.join(basePath, 'public', 'assets', sanitizedPath);
      
      await fs.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }
}
