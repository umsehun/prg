"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ipcService = void 0;
class IpcService {
    constructor() {
        Object.defineProperty(this, "mainWindow", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
    }
    /**
     * Sets the main browser window instance.
     * @param window The main BrowserWindow.
     */
    setWindow(window) {
        this.mainWindow = window;
    }
    /**
     * Sends a message to the renderer process.
     * @param channel The channel to send the message on.
     * @param args The arguments to send with the message.
     */
    send(channel, ...args) {
        if (this.mainWindow && !this.mainWindow.isDestroyed()) {
            this.mainWindow.webContents.send(channel, ...args);
        }
        else {
            console.warn(`[IpcService] Attempted to send to a non-existent window on channel: ${channel}`);
        }
    }
}
// Export a singleton instance
exports.ipcService = new IpcService();
