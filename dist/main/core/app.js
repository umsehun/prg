"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initApp = initApp;
// src/main/core/app.ts
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const window_1 = require("./window");
const ipcHandlers_1 = require("./ipcHandlers");
const ipcService_1 = require("../services/ipcService");
function initApp() {
    electron_1.app.on('ready', () => {
        const mainWindow = (0, window_1.createMainWindow)();
        // Provide the main window to the IPC service
        ipcService_1.ipcService.setWindow(mainWindow);
        // Register all IPC event handlers
        (0, ipcHandlers_1.registerIpcHandlers)();
        // Register a custom protocol to serve media files from the charts directory
        electron_1.protocol.handle('media', (request) => {
            const url = new URL(request.url);
            const chartId = url.hostname;
            const assetName = path_1.default.normalize(url.pathname).substring(1); // remove leading slash
            const chartsDir = path_1.default.join(electron_1.app.getPath('userData'), 'charts');
            const filePath = path_1.default.join(chartsDir, chartId, assetName);
            // Use net.fetch with a file:// URL to create the response.
            // This is the standard and secure way to serve local files in Electron 15+.
            return electron_1.net.fetch(`file://${filePath}`);
        });
    });
    electron_1.app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') {
            electron_1.app.quit();
        }
    });
    electron_1.app.on('activate', () => {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (!globalThis.mainWindow || globalThis.mainWindow.isDestroyed()) {
            const newWindow = (0, window_1.createMainWindow)();
            ipcService_1.ipcService.setWindow(newWindow);
        }
    });
}
