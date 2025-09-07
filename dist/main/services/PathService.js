"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.pathService = void 0;
// src/main/services/PathService.ts
const electron_1 = require("electron");
const path = __importStar(require("path"));
const url_1 = require("url");
class PathService {
    constructor() { }
    static getInstance() {
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
    resolve(uri) {
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
                if (electron_1.app.isPackaged) {
                    return path.join(process.resourcesPath, 'app', 'public', 'assets', rest);
                }
                else {
                    // In dev, go up from dist/main to project root
                    return path.join(electron_1.app.getAppPath(), '..', '..', 'public', 'assets', rest);
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
    getAssetUrl(uri) {
        if (!uri)
            return '';
        // If it's already a file:// URL, return as-is
        if (uri.startsWith('file://')) {
            return uri;
        }
        // Resolve to absolute path first
        const absolutePath = this.resolve(uri);
        // Convert to file:// URL
        return (0, url_1.pathToFileURL)(absolutePath).href;
    }
}
exports.pathService = PathService.getInstance();
