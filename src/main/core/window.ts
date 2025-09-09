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
        title: 'Pin Rhythm - 혁신적인 리듬 게임', // 창 타이틀 설정
        show: true, // 즉시 창 표시하여 타이틀바 확인
        autoHideMenuBar: false, // 개발 중에는 메뉴바도 표시

        webPreferences: {
            // Security settings
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: false, // IPC를 위해 sandbox 비활성화

            // Preload script
            preload: join(__dirname, '../../preload/index.js'),

            // Additional security
            allowRunningInsecureContent: false,
            experimentalFeatures: false,

            // Development settings
            devTools: isDev,
            webSecurity: true // Always keep web security enabled
        },

        // Window styling: 기본 OS 프레임 사용
        frame: true, // 기본 프레임 명시적 사용
        titleBarStyle: 'default', // 명시적으로 기본 타이틀바 스타일 지정

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

    // Focus window when ready in development
    window.once('ready-to-show', () => {
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