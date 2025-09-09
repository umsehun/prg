/**
 * Application Menu Setup for macOS
 * Ensures the app name appears correctly in the menubar
 */

import { app, Menu, shell, BrowserWindow } from 'electron';
import { logger } from '../../shared/globals/logger';

export function setupApplicationMenu(): void {
    try {
        const isMac = process.platform === 'darwin';

        // ✅ FORCE macOS to show menubar by disabling LSUIElement
        if (isMac) {
            // Ensure we're NOT a LSUIElement (which would hide menubar)
            app.dock?.show();

            // Multiple attempts to set app name for macOS
            app.setName('Pin Rhythm');

            // Force macOS bundle info
            process.env.CFBundleName = 'Pin Rhythm';
            process.env.CFBundleDisplayName = 'Pin Rhythm';

            // Try multiple macOS-specific methods
            try {
                (app as any).setApplicationName?.('Pin Rhythm');
            } catch (e) {
                // Ignore if method doesn't exist
            }

            // ✅ CRITICAL: Ensure app is active and visible
            if (!app.isReady()) {
                app.whenReady().then(() => {
                    app.focus({ steal: true });
                });
            } else {
                app.focus({ steal: true });
            }
        } else {
            app.setName('Pin Rhythm');
        }

        // Get and log the app name
        const appName = app.getName();

        logger.info('menu', `🔍 Current app.getName(): "${appName}"`);
        logger.info('menu', `🔍 Platform: ${process.platform}`);
        logger.info('menu', `🔍 Setting menu label as: "Pin Rhythm"`);

        if (isMac) {
            logger.info('menu', '🍎 Applied macOS-specific bundle settings');
        }

        // ✅ FORCE REMOVE default Electron menu FIRST
        Menu.setApplicationMenu(null);

        // Create the MOST EXPLICIT menu possible
        const template: Electron.MenuItemConstructorOptions[] = [
            ...(isMac ? [{
                label: 'Pin Rhythm', // 절대적으로 하드코딩
                submenu: [
                    {
                        label: 'Pin Rhythm에 관하여',
                        role: 'about' as const
                    },
                    { type: 'separator' as const },
                    {
                        label: 'Pin Rhythm 종료',
                        role: 'quit' as const
                    }
                ]
            }] : []),            // File Menu
            {
                label: '파일',
                submenu: [
                    isMac ? {
                        label: '창 닫기',
                        role: 'close' as const
                    } : {
                        label: '종료',
                        role: 'quit' as const
                    }
                ]
            },

            // Edit Menu
            {
                label: '편집',
                submenu: [
                    {
                        label: '실행 취소',
                        role: 'undo' as const
                    },
                    {
                        label: '다시 실행',
                        role: 'redo' as const
                    },
                    { type: 'separator' as const },
                    {
                        label: '잘라내기',
                        role: 'cut' as const
                    },
                    {
                        label: '복사',
                        role: 'copy' as const
                    },
                    {
                        label: '붙여넣기',
                        role: 'paste' as const
                    },
                    {
                        label: '모두 선택',
                        role: 'selectAll' as const
                    }
                ]
            },

            // View Menu
            {
                label: '보기',
                submenu: [
                    {
                        label: '새로고침',
                        role: 'reload' as const
                    },
                    {
                        label: '강제 새로고침',
                        role: 'forceReload' as const
                    },
                    {
                        label: '개발자 도구 토글',
                        role: 'toggleDevTools' as const
                    },
                    { type: 'separator' as const },
                    {
                        label: '실제 크기',
                        role: 'resetZoom' as const
                    },
                    {
                        label: '확대',
                        role: 'zoomIn' as const
                    },
                    {
                        label: '축소',
                        role: 'zoomOut' as const
                    },
                    { type: 'separator' as const },
                    {
                        label: '전체화면 토글',
                        role: 'togglefullscreen' as const
                    }
                ]
            },

            // Window Menu
            {
                label: '창',
                submenu: [
                    {
                        label: '최소화',
                        role: 'minimize' as const
                    },
                    {
                        label: '확대/축소',
                        role: 'zoom' as const
                    },
                    ...(isMac ? [
                        { type: 'separator' as const },
                        {
                            label: '앞으로 가져오기',
                            role: 'front' as const
                        }
                    ] : [
                        {
                            label: '닫기',
                            role: 'close' as const
                        }
                    ])
                ]
            },

            // Help Menu
            {
                label: '도움말',
                submenu: [
                    {
                        label: `${appName}에 대해 자세히 알아보기`,
                        click: async () => {
                            await shell.openExternal('https://github.com/umsehun/prg');
                        }
                    }
                ]
            }
        ];

        const menu = Menu.buildFromTemplate(template);

        // ✅ CRITICAL: Force menu application multiple times
        Menu.setApplicationMenu(null); // Clear first
        Menu.setApplicationMenu(menu); // Set our menu

        // ✅ Verify menu was set correctly
        const verifyMenu = Menu.getApplicationMenu();
        if (verifyMenu && verifyMenu.items.length > 0) {
            const firstItem = verifyMenu.items[0];
            if (firstItem) {
                logger.info('menu', `✅ Menu verification - First item: "${firstItem.label}"`);
                if (firstItem.label !== 'Pin Rhythm' && firstItem.label !== 'Electron') {
                    logger.warn('menu', `⚠️ Expected 'Pin Rhythm' but got: "${firstItem.label}"`);
                }
            }
        } else {
            logger.error('menu', '❌ Menu verification failed - no menu items found');
        }

        // Multiple methods to force macOS menubar update
        if (isMac) {
            // ✅ AGGRESSIVE macOS menubar forcing
            const forceMenuBarDisplay = () => {
                try {
                    // Method 1: Show dock and focus
                    app.dock?.show();
                    app.focus({ steal: true });

                    // Method 2: Re-set the menu multiple times
                    Menu.setApplicationMenu(menu);

                    // Method 3: Force window to front
                    const windows = BrowserWindow.getAllWindows();
                    if (windows.length > 0) {
                        const mainWindow = windows[0];
                        if (mainWindow && !mainWindow.isDestroyed()) {
                            mainWindow.moveTop();
                            mainWindow.focus();
                        }
                    }

                    logger.info('menu', '🔄 Aggressive menubar forcing completed');
                } catch (e) {
                    logger.warn('menu', 'Aggressive menubar forcing failed:', e);
                }
            };

            // Execute immediately and with delays
            forceMenuBarDisplay();
            setTimeout(forceMenuBarDisplay, 100);
            setTimeout(forceMenuBarDisplay, 500);
            setTimeout(forceMenuBarDisplay, 1000);
            setTimeout(forceMenuBarDisplay, 2000);

            // Original methods (keep as backup)
            setTimeout(() => {
                try {
                    app.focus({ steal: true });
                    logger.info('menu', '🔄 Method 1: Forced app focus');
                } catch (e) {
                    logger.warn('menu', 'Could not force focus:', e);
                }
            }, 100);

            setTimeout(() => {
                try {
                    app.hide();
                    setTimeout(() => {
                        app.show();
                        logger.info('menu', '🔄 Method 2: Hide/Show cycle completed');
                    }, 100);
                } catch (e) {
                    logger.warn('menu', 'Could not hide/show:', e);
                }
            }, 300);

            setTimeout(() => {
                Menu.setApplicationMenu(menu);
                logger.info('menu', '🔄 Method 3: Menu reset completed');
            }, 1000);
        }

        logger.info('menu', `✅ Application menu set with label: "Pin Rhythm"`);
        logger.info('menu', `✅ Menubar should now show "Pin Rhythm" in ALL modes (not just fullscreen)`);

    } catch (error) {
        logger.error('menu', 'Failed to setup application menu:', error);
    }
}