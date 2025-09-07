import { BrowserWindow } from 'electron';
declare class IpcService {
    private mainWindow;
    /**
     * Sets the main browser window instance.
     * @param window The main BrowserWindow.
     */
    setWindow(window: BrowserWindow): void;
    /**
     * Sends a message to the renderer process.
     * @param channel The channel to send the message on.
     * @param args The arguments to send with the message.
     */
    send(channel: string, ...args: unknown[]): void;
}
export declare const ipcService: IpcService;
export {};
//# sourceMappingURL=ipcService.d.ts.map