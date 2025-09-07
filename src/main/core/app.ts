// src/main/core/app.ts
import { app, protocol, net } from 'electron';
import path from 'path';
import { createMainWindow } from './window';
import { registerIpcHandlers } from './ipcHandlers';
import { ipcService } from '../services/ipcService';

export function initApp() {
  app.on('ready', () => {
        const mainWindow = createMainWindow();

    // Provide the main window to the IPC service
    ipcService.setWindow(mainWindow);

    // Register all IPC event handlers
    registerIpcHandlers();

    // Register a custom protocol to serve media files from the charts directory
    protocol.handle('media', (request) => {
      const url = new URL(request.url);
      const chartId = url.hostname;
      const assetName = path.normalize(url.pathname).substring(1); // remove leading slash

      const chartsDir = path.join(app.getPath('userData'), 'charts');
      const filePath = path.join(chartsDir, chartId, assetName);

      // Use net.fetch with a file:// URL to create the response.
      // This is the standard and secure way to serve local files in Electron 15+.
      return net.fetch(`file://${filePath}`);
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (!globalThis.mainWindow || globalThis.mainWindow.isDestroyed()) {
      const newWindow = createMainWindow();
      ipcService.setWindow(newWindow);
    }
  });
}

