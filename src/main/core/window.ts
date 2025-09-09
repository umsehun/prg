/**
 * Electron window creation with enhanced security
 */

import { BrowserWindow } from 'electron';
import { join } from 'path';

export async function createWindow(): Promise<BrowserWindow> {
    const isDev = process.env.NODE_ENV === 'development';

    const window = new BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        show: false, // Don't show until ready-to-show
        autoHideMenuBar: !isDev, // Hide menu bar in production

        webPreferences: {
            // Security settings
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: true, // Enable sandbox for better security

            // Preload script
            preload: join(__dirname, '../../preload/index.js'),

            // Additional security
            allowRunningInsecureContent: false,
            experimentalFeatures: false,

            // Development settings
            devTools: isDev,
            webSecurity: true // Always keep web security enabled
        },

        // Window styling
        frame: false,
        titleBarStyle: 'hidden',
        ...(process.platform === 'darwin' && {
            vibrancy: 'under-window',
            trafficLightPosition: { x: 15, y: 13 },
        }),

        // Icon (only set for Linux)
        ...(process.platform === 'linux' && { icon: join(__dirname, '../../../public/icon.png') })
    });

    // Load the app
    if (isDev) {
        // Development - load from Next.js dev server
        await window.loadURL('http://localhost:5173');

        // Open DevTools in development
        window.webContents.openDevTools({ mode: 'detach' });
    } else {
        // Production - load from built files
        await window.loadFile(join(__dirname, '../../renderer/out/index.html'));
    }

    // Show window when ready
    window.once('ready-to-show', () => {
        window.show();

        if (isDev) {
            window.focus();
        }
    });

    // Handle window closed
    window.on('closed', () => {
        // Dereference the window object
        return null;
    });

    // Prevent new window creation
    window.webContents.setWindowOpenHandler(() => {
        return { action: 'deny' };
    });

    // Security: prevent navigation
    window.webContents.on('will-navigate', (event, navigationUrl) => {
        const parsedUrl = new URL(navigationUrl);

        if (parsedUrl.origin !== 'http://localhost:5173' && parsedUrl.protocol !== 'file:') {
            event.preventDefault();
        }
    });

    console.log('🪟 Main window created');
    return window;
}
