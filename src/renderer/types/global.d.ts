/**
 * Global type definitions for Electron IPC
 */

import type { ElectronAPI } from './ipc';

declare global {
    interface Window {
        electronAPI: ElectronAPI;
    }
}

export { };