/**
 * Core module exports
 * Centralizes all core application components
 */

export { ApplicationCore, appCore } from './app';
export { WindowManager } from './window-manager';
export { IPCManager } from './ipc-manager';
export { LifecycleManager } from './lifecycle';
export { SettingsManager, type AppSettings } from './settings-manager';
export { setupSecurityPolicies } from './security';
export { createWindow } from './window';

// Re-export commonly used types
export type { BrowserWindow } from 'electron';
