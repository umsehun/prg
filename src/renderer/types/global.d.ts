/**
 * Global type definitions for Electron IPC
 */

import type { ElectronAPI } from '@shared/d.ts/ipc';

declare global {
    interface Window {
        electronAPI: ElectronAPI;
    }
}

export { };