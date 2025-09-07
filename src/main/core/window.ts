// src/main/core/window.ts
import { BrowserWindow } from 'electron';
import path from 'path';

declare global {
    // eslint-disable-next-line no-var
    var mainWindow: BrowserWindow | null;
}

export function createMainWindow() {
    const win = new BrowserWindow({
        width: 1280,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, '../../preload/index.js'),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    const isDev = process.env.NODE_ENV === 'development';

    if (isDev) {
        win.loadURL('http://localhost:5173');
        win.webContents.openDevTools();
    } else {
        win.loadFile(path.join(__dirname, '../../renderer/out/index.html'));
    }

    globalThis.mainWindow = win;
    return win;
}
