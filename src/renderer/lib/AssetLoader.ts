// src/renderer/lib/AssetLoader.ts
import type { IpcApi } from '../../types/ipc';

/**
 * Client-side asset loader that uses Electron IPC to load assets from the main process.
 * This replaces HTTP requests with secure IPC communication.
 */
export class AssetLoader {
  /**
   * Load an audio asset and create a blob URL for use in the browser.
   * @param assetPath - Path relative to public/assets (e.g., 'bad-apple/Bad_Apple.ogg')
   * @returns Promise<string> - Blob URL for the audio file
   */
  static async loadAudio(assetPath: string): Promise<string> {
    try {
      const electron = (window as unknown as { electron: { loadAsset: (assetPath: string) => Promise<ArrayBuffer> } }).electron;
      const buffer = await electron.loadAsset(assetPath);
      const blob = new Blob([buffer], { type: 'audio/ogg' });
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error(`Failed to load audio asset: ${assetPath}`, error);
      throw new Error(`Failed to load audio: ${assetPath}`);
    }
  }

  /**
   * Load an image asset and create a blob URL for use in the browser.
   * @param assetPath - Path relative to public/assets (e.g., 'bad-apple/Bad_Apple.png')
   * @returns Promise<string> - Blob URL for the image file
   */
  static async loadImage(assetPath: string): Promise<string> {
    try {
      const electron = (window as unknown as { electron: { loadAsset: (assetPath: string) => Promise<ArrayBuffer> } }).electron;
      const buffer = await electron.loadAsset(assetPath);
      const blob = new Blob([buffer], { type: 'image/png' });
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error(`Failed to load image asset: ${assetPath}`, error);
      throw new Error(`Failed to load image: ${assetPath}`);
    }
  }

  /**
   * Check if an asset exists.
   * @param assetPath - Path relative to public/assets
   * @returns Promise<boolean> - True if asset exists
   */
  static async exists(assetPath: string): Promise<boolean> {
    try {
      const electron = (window as unknown as { electron: { assetExists: (assetPath: string) => Promise<boolean> } }).electron;
      return await electron.assetExists(assetPath);
    } catch (error) {
      console.error(`Failed to check asset existence: ${assetPath}`, error);
      return false;
    }
  }

  /**
   * Clean up blob URLs to prevent memory leaks.
   * @param blobUrl - The blob URL to revoke
   */
  static cleanup(blobUrl: string): void {
    if (blobUrl.startsWith('blob:')) {
      URL.revokeObjectURL(blobUrl);
    }
  }
}
