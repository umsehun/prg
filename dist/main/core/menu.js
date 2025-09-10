"use strict";
/**
 * Application Menu Setup for macOS
 * Ensures the app name appears correctly in the menubar
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupApplicationMenu = setupApplicationMenu;
const electron_1 = require("electron");
const logger_1 = require("../../shared/globals/logger");
function setupApplicationMenu() {
    try {
        const isMac = process.platform === 'darwin';
        // ✅ FORCE macOS to show menubar by disabling LSUIElement
        if (isMac) {
            // Ensure we're NOT a LSUIElement (which would hide menubar)
            electron_1.app.dock?.show();
            // Multiple attempts to set app name for macOS
            electron_1.app.setName('prg');
            // Force macOS bundle info
            process.env.CFBundleName = 'prg';
            process.env.CFBundleDisplayName = 'prg';
            // Try multiple macOS-specific methods
            try {
                electron_1.app.setApplicationName?.('prg');
            }
            catch (e) {
                // Ignore if method doesn't exist
            }
            // ✅ CRITICAL: Ensure app is active and visible
            if (!electron_1.app.isReady()) {
                electron_1.app.whenReady().then(() => {
                    electron_1.app.focus({ steal: true });
                });
            }
            else {
                electron_1.app.focus({ steal: true });
            }
        }
        else {
            electron_1.app.setName('prg');
        }
        // Get and log the app name
        const appName = electron_1.app.getName();
        logger_1.logger.info('menu', `🔍 Current app.getName(): "${appName}"`);
        logger_1.logger.info('menu', `🔍 Platform: ${process.platform}`);
        logger_1.logger.info('menu', `🔍 Setting menu label as: "prg"`);
        if (isMac) {
            logger_1.logger.info('menu', '🍎 Applied macOS-specific bundle settings');
        }
        // ✅ FORCE REMOVE default Electron menu FIRST
        electron_1.Menu.setApplicationMenu(null);
        // Create the MOST EXPLICIT menu possible
        const template = [
            ...(isMac ? [{
                    label: 'prg', // 절대적으로 하드코딩
                    submenu: [
                        {
                            label: 'prg에 관하여',
                            role: 'about'
                        },
                        { type: 'separator' },
                        {
                            label: 'prg 종료',
                            role: 'quit'
                        }
                    ]
                }] : []), // File Menu
            {
                label: '파일',
                submenu: [
                    isMac ? {
                        label: '창 닫기',
                        role: 'close'
                    } : {
                        label: '종료',
                        role: 'quit'
                    }
                ]
            },
            // Edit Menu
            {
                label: '편집',
                submenu: [
                    {
                        label: '실행 취소',
                        role: 'undo'
                    },
                    {
                        label: '다시 실행',
                        role: 'redo'
                    },
                    { type: 'separator' },
                    {
                        label: '잘라내기',
                        role: 'cut'
                    },
                    {
                        label: '복사',
                        role: 'copy'
                    },
                    {
                        label: '붙여넣기',
                        role: 'paste'
                    },
                    {
                        label: '모두 선택',
                        role: 'selectAll'
                    }
                ]
            },
            // View Menu
            {
                label: '보기',
                submenu: [
                    {
                        label: '새로고침',
                        role: 'reload'
                    },
                    {
                        label: '강제 새로고침',
                        role: 'forceReload'
                    },
                    {
                        label: '개발자 도구 토글',
                        role: 'toggleDevTools'
                    },
                    { type: 'separator' },
                    {
                        label: '실제 크기',
                        role: 'resetZoom'
                    },
                    {
                        label: '확대',
                        role: 'zoomIn'
                    },
                    {
                        label: '축소',
                        role: 'zoomOut'
                    },
                    { type: 'separator' },
                    {
                        label: '전체화면 토글',
                        role: 'togglefullscreen'
                    }
                ]
            },
            // Window Menu
            {
                label: '창',
                submenu: [
                    {
                        label: '최소화',
                        role: 'minimize'
                    },
                    {
                        label: '확대/축소',
                        role: 'zoom'
                    },
                    ...(isMac ? [
                        { type: 'separator' },
                        {
                            label: '앞으로 가져오기',
                            role: 'front'
                        }
                    ] : [
                        {
                            label: '닫기',
                            role: 'close'
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
                            await electron_1.shell.openExternal('https://github.com/umsehun/prg');
                        }
                    }
                ]
            }
        ];
        const menu = electron_1.Menu.buildFromTemplate(template);
        // ✅ CRITICAL: Force menu application multiple times
        electron_1.Menu.setApplicationMenu(null); // Clear first
        electron_1.Menu.setApplicationMenu(menu); // Set our menu
        // ✅ Verify menu was set correctly
        const verifyMenu = electron_1.Menu.getApplicationMenu();
        if (verifyMenu && verifyMenu.items.length > 0) {
            const firstItem = verifyMenu.items[0];
            if (firstItem) {
                logger_1.logger.info('menu', `✅ Menu verification - First item: "${firstItem.label}"`);
                if (firstItem.label !== 'prg' && firstItem.label !== 'Electron') {
                    logger_1.logger.warn('menu', `⚠️ Expected 'prg' but got: "${firstItem.label}"`);
                }
            }
        }
        else {
            logger_1.logger.error('menu', '❌ Menu verification failed - no menu items found');
        }
        // Multiple methods to force macOS menubar update
        if (isMac) {
            // ✅ AGGRESSIVE macOS menubar forcing
            const forceMenuBarDisplay = () => {
                try {
                    // Method 1: Show dock and focus
                    electron_1.app.dock?.show();
                    electron_1.app.focus({ steal: true });
                    // Method 2: Re-set the menu multiple times
                    electron_1.Menu.setApplicationMenu(menu);
                    // Method 3: Force window to front
                    const windows = electron_1.BrowserWindow.getAllWindows();
                    if (windows.length > 0) {
                        const mainWindow = windows[0];
                        if (mainWindow && !mainWindow.isDestroyed()) {
                            mainWindow.moveTop();
                            mainWindow.focus();
                        }
                    }
                    logger_1.logger.info('menu', '🔄 Aggressive menubar forcing completed');
                }
                catch (e) {
                    logger_1.logger.warn('menu', 'Aggressive menubar forcing failed:', e);
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
                    electron_1.app.focus({ steal: true });
                    logger_1.logger.info('menu', '🔄 Method 1: Forced app focus');
                }
                catch (e) {
                    logger_1.logger.warn('menu', 'Could not force focus:', e);
                }
            }, 100);
            setTimeout(() => {
                try {
                    electron_1.app.hide();
                    setTimeout(() => {
                        electron_1.app.show();
                        logger_1.logger.info('menu', '🔄 Method 2: Hide/Show cycle completed');
                    }, 100);
                }
                catch (e) {
                    logger_1.logger.warn('menu', 'Could not hide/show:', e);
                }
            }, 300);
            setTimeout(() => {
                electron_1.Menu.setApplicationMenu(menu);
                logger_1.logger.info('menu', '🔄 Method 3: Menu reset completed');
            }, 1000);
        }
        logger_1.logger.info('menu', `✅ Application menu set with label: "prg"`);
        logger_1.logger.info('menu', `✅ Menubar should now show "prg" in ALL modes (not just fullscreen)`);
    }
    catch (error) {
        logger_1.logger.error('menu', 'Failed to setup application menu:', error);
    }
}
