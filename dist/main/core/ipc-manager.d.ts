/**
 * IPC Manager - Centralizes all IPC handler registration and management
 * Provides a clean interface for setting up inter-process communication
 */
import { BrowserWindow } from 'electron';
export declare class IPCManager {
    private handlers;
    private isInitialized;
    constructor();
    /**
     * Initialize all IPC handlers
     */
    initialize(mainWindow: BrowserWindow): Promise<void>;
    /**
     * Cleanup all IPC handlers
     */
    cleanup(): void;
    /**
     * Register all available handlers
     */
    private registerHandlers;
    /**
     * Get handler information
     */
    getHandlerInfo(): Array<{
        name: string;
        description: string;
    }>;
    /**
     * Check if IPC is initialized
     */
    isIPCInitialized(): boolean;
}
//# sourceMappingURL=ipc-manager.d.ts.map