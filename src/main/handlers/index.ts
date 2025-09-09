/**
 * IPC handlers registry
 */

import { BrowserWindow } from 'electron';
import { setupGameHandlers } from './game.handler';
import { setupOszHandlers } from './osz.handler';
import { setupSettingsHandlers } from './settings.handler';
import { setupSystemHandlers } from './system.handler';

export function registerIpcHandlers(mainWindow: BrowserWindow): void {
    console.log('🔗 Registering IPC handlers...');

    // Register all handler modules
    setupGameHandlers(mainWindow);
    setupOszHandlers(mainWindow);
    setupSettingsHandlers(mainWindow);
    setupSystemHandlers(mainWindow);

    console.log('✅ All IPC handlers registered');
}
