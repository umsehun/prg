/**
 * Global utilities and types export index
 */

// Re-export all global utilities
export * from './logger';
export * from './platform';
export * from './constants';

// Re-export types (these are also available globally via types.d.ts)
export type * from './types.d';

// Default exports for convenience
export { logger as default } from './logger';
export { platform } from './platform';
export {
    APP_CONFIG,
    GAME_CONFIG,
    AUDIO_CONFIG,
    FILE_CONFIG,
    UI_CONFIG,
    ERROR_CODES,
    PERFORMANCE,
    DEV_CONFIG
} from './constants';
