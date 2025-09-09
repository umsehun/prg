/**
 * Managers module exports
 * Centralizes all application managers
 */

export { WindowManager } from './window-manager';
export { IPCManager } from './ipc-manager';
export { LifecycleManager } from './lifecycle';
export { SettingsManager } from './settings-manager';

// Re-export commonly used types
export type { BrowserWindow } from 'electron';
