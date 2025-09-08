/**
 * Core module exports
 * Centralizes all core application components
 */

export { ApplicationCore, appCore } from './app';
export { setupSecurityPolicies } from './security';
export { createWindow } from './window';

// Re-export managers for convenience
export {
    WindowManager,
    IPCManager,
    LifecycleManager,
    SettingsManager,
    type AppSettings
} from '../managers';

// Re-export commonly used types
export type { BrowserWindow } from 'electron';
