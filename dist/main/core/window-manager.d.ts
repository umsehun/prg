/**
 * Window Manager - Handles all browser window operations
 * Manages window creation, state, and lifecycle
 */
import { BrowserWindow } from 'electron';
export declare class WindowManager {
    private mainWindow;
    private windowState;
    /**
     * Create the main application window
     */
    createMainWindow(): Promise<BrowserWindow>;
    /**
     * Get the main window instance
     */
    getMainWindow(): BrowserWindow | null;
    /**
     * Close all windows
     */
    closeAllWindows(): void;
    /**
     * Focus the main window
     */
    focusMainWindow(): void;
    /**
     * Get window configuration
     */
    private getWindowConfig;
    /**
     * Setup window event handlers
     */
    private setupWindowEventHandlers;
    /**
     * Load the application into the window
     */
    private loadApplication;
    /**
     * Save current window state
     */
    private saveWindowState;
    /**
     * Restore window state
     */
    private restoreWindowState;
}
//# sourceMappingURL=window-manager.d.ts.map