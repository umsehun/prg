"use strict";
/**
 * Enhanced security policies for Electron app
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSecurityPolicies = setupSecurityPolicies;
const electron_1 = require("electron");
async function setupSecurityPolicies() {
    // Default session security
    const defaultSession = electron_1.session.defaultSession;
    // Content Security Policy for development/production
    const isDev = process.env.NODE_ENV === 'development';
    if (isDev) {
        // Development CSP - more permissive
        defaultSession.webRequest.onHeadersReceived((details, callback) => {
            callback({
                responseHeaders: {
                    ...details.responseHeaders,
                    'Content-Security-Policy': [
                        "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: ws: wss: http://localhost:*;"
                    ]
                }
            });
        });
    }
    else {
        // Production CSP - strict
        defaultSession.webRequest.onHeadersReceived((details, callback) => {
            callback({
                responseHeaders: {
                    ...details.responseHeaders,
                    'Content-Security-Policy': [
                        "default-src 'self'; " +
                            "script-src 'self' 'wasm-unsafe-eval'; " +
                            "style-src 'self' 'unsafe-inline'; " +
                            "img-src 'self' data: blob: prg-media:; " +
                            "media-src 'self' blob: prg-media:; " +
                            "connect-src 'self';"
                    ]
                }
            });
        });
    }
    // Block dangerous permissions
    defaultSession.setPermissionRequestHandler((_webContents, permission, callback) => {
        const allowedPermissions = new Set([
            'media', // For audio playback
            'audioCapture' // For microphone (if needed for future features)
        ]);
        if (allowedPermissions.has(permission)) {
            callback(true);
        }
        else {
            console.warn('🔒 Blocked permission request:', permission);
            callback(false);
        }
    });
    // Block external resource loading
    defaultSession.webRequest.onBeforeRequest({ urls: ['*://*/*'] }, (details, callback) => {
        const url = new URL(details.url);
        // Allow localhost in development
        if (isDev && url.hostname === 'localhost') {
            callback({});
            return;
        }
        // Allow file:// protocol
        if (url.protocol === 'file:') {
            callback({});
            return;
        }
        // Allow custom protocol
        if (url.protocol === 'prg-media:') {
            callback({});
            return;
        }
        // Block everything else
        console.warn('🔒 Blocked external request:', details.url);
        callback({ cancel: true });
    });
    // Clear cache and cookies on startup
    await defaultSession.clearCache();
    await defaultSession.clearStorageData({
        storages: ['cookies', 'localstorage', 'serviceworkers']
    });
    console.log('🔒 Security policies applied');
}
