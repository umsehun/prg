// src/main/services/ipcService.ts
import { BrowserWindow } from 'electron';

class IpcService {
  private mainWindow: BrowserWindow | null = null;

  /**
   * Sets the main browser window instance.
   * @param window The main BrowserWindow.
   */
  setWindow(window: BrowserWindow): void {
    this.mainWindow = window;
  }

  /**
   * Sends a message to the renderer process.
   * @param channel The channel to send the message on.
   * @param args The arguments to send with the message.
   */
  send(channel: string, ...args: unknown[]): void {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send(channel, ...args);
    } else {
      console.warn(`[IpcService] Attempted to send to a non-existent window on channel: ${channel}`);
    }
  }
}

// Export a singleton instance
export const ipcService = new IpcService();
