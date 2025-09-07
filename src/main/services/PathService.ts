// src/main/services/PathService.ts
import { app } from 'electron';
import * as path from 'path';
import { pathToFileURL } from 'url';

class PathService {
  private static instance: PathService;

  private constructor() { }

  public static getInstance(): PathService {
    if (!PathService.instance) {
      PathService.instance = new PathService();
    }
    return PathService.instance;
  }

  /**
   * Resolves a custom protocol URI to an absolute file path.
   * @param uri The URI to resolve (e.g., 'user://charts/song/audio.mp3')
   * @returns The absolute file path.
   */
  public resolve(uri: string): string {
    // If it's already an absolute path, return it directly.
    if (path.isAbsolute(uri)) {
      return uri;
    }

    // If it doesn't seem to be a URI, return it as-is but warn the user.
    if (!uri.includes('://')) {
      console.warn(`[PathService] Received a non-URI path to resolve: "${uri}". This may indicate an issue. Passing through.`);
      return uri;
    }

    const url = new URL(uri);
    const scheme = url.protocol.slice(0, -1); // 'user:' -> 'user'
    // Decode URI-encoded characters (e.g., %20 -> space) to get a valid file path
    const decodedPathname = decodeURIComponent(url.pathname);
    const rest = path.join(url.hostname, decodedPathname);

    switch (scheme) {
      case 'media': {
        const chartsPath = path.join('/Users/user/Library/Application Support/prg', 'charts');
        return path.join(chartsPath, rest);
      }
      case 'user': {
        const userDataPath = '/Users/user/Library/Application Support/prg';
        return path.join(userDataPath, rest);
      }
      case 'asset': {
        if (app.isPackaged) {
          return path.join(process.resourcesPath, 'app', 'public', 'assets', rest);
        } else {
          // In dev, go up from dist/main to project root
          return path.join(app.getAppPath(), '..', '..', 'public', 'assets', rest);
        }
      }
      default:
        throw new Error(`Unknown URI scheme: ${scheme}`);
    }
  }

  /**
   * Converts a custom protocol URI or path to a file:// URL for renderer use.
   * @param uri The URI to convert (e.g., 'media://chart-id/audio.mp3')
   * @returns A file:// URL that can be used directly in the renderer
   */
  public getAssetUrl(uri: string): string {
    if (!uri) return '';

    // If it's already a file:// URL, return as-is
    if (uri.startsWith('file://')) {
      return uri;
    }

    // Resolve to absolute path first
    const absolutePath = this.resolve(uri);

    // Convert to file:// URL
    return pathToFileURL(absolutePath).href;
  }
}

export const pathService = PathService.getInstance();
