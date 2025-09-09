/**
 * Global type definitions for PRG project
 * Available across all modules without explicit import
 */

declare global {
    /**
     * Electron API exposed through preload script
     */
    interface Window {
        electronAPI?: {
            game: {
                start: (gameStartParams: { chartData: any; gameMode: string; mods?: string[] }) => Promise<{ success: boolean; message?: string; error?: string }>;
                stop: () => Promise<{ success: boolean; message?: string; error?: string }>;
                throwKnife: (throwData: { id: string; time: number }) => void;
                pause: () => Promise<{ success: boolean; isPaused?: boolean; error?: string }>;
                resume: () => Promise<{ success: boolean; isPaused?: boolean; error?: string }>;
                onKnifeResult: (callback: (result: any) => void) => () => void;
            };

            osz: {
                import: (filePath?: string) => Promise<{ success: boolean; chart?: any; error?: string }>;
                getLibrary: () => Promise<{ success: boolean; charts?: any[]; error?: string }>;
                removeChart: (chartId: string) => Promise<{ success: boolean; message?: string; error?: string }>;
                getAudio: (chartId: string) => Promise<{ success: boolean; audioData?: ArrayBuffer; error?: string }>;
            };

            settings: {
                getAll: () => Promise<{ success: boolean; settings?: any; error?: string }>;
                get: (key: string) => Promise<{ success: boolean; value?: any; error?: string }>;
                set: (key: string, value: any) => Promise<{ success: boolean; message?: string; error?: string }>;
                reset: () => Promise<{ success: boolean; settings?: any; error?: string }>;
                export: () => Promise<{ success: boolean; message?: string; error?: string }>;
                import: () => Promise<{ success: boolean; message?: string; error?: string }>;
                onChange: (callback: (change: { key: string; value: any }) => void) => () => void;
                onReset: (callback: (settings: any) => void) => () => void;
            };

            system: {
                platform: string;
                version: string;
                isDev: boolean;
            };
        };
    }

    /**
     * Environment variables
     */
    namespace NodeJS {
        interface ProcessEnv {
            NODE_ENV: 'development' | 'production' | 'test';
            ELECTRON_IS_DEV?: string;
            VITE_DEV_SERVER_URL?: string;
        }
    }

    /**
     * Module declarations for assets and workers
     */
    declare module '*.worker.ts' {
        const WorkerFactory: new () => Worker;
        export default WorkerFactory;
    }

    declare module '*.osz' {
        const content: string;
        export default content;
    }

    declare module '*.osu' {
        const content: string;
        export default content;
    }

    declare module '*.mp3' {
        const src: string;
        export default src;
    }

    declare module '*.wav' {
        const src: string;
        export default src;
    }

    declare module '*.ogg' {
        const src: string;
        export default src;
    }

    /**
     * Matter.js augmentation for better TypeScript support
     */
    namespace Matter {
        interface Body {
            label: string;
            customData?: Record<string, any>;
        }
    }
}

/**
 * Utility types
 */
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Function types
 */
export type EventHandler<T = void> = (event: T) => void;
export type AsyncEventHandler<T = void> = (event: T) => Promise<void>;
export type Cleanup = () => void;

/**
 * Common result types
 */
export interface Result<T = any, E = string> {
    success: boolean;
    data?: T;
    error?: E;
}

export interface AsyncResult<T = any, E = string> extends Promise<Result<T, E>> { }

/**
 * Performance timing types
 */
export interface PerformanceMetrics {
    fps: number;
    frameTime: number;
    memoryUsage?: {
        used: number;
        total: number;
    };
    audioLatency?: number;
    physicsTime?: number;
}

/**
 * Error types
 */
export interface ErrorInfo {
    code: string;
    message: string;
    category: 'GAME' | 'AUDIO' | 'PHYSICS' | 'IPC' | 'OSZ' | 'SYSTEM';
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    timestamp: string;
    stack?: string;
    data?: any;
}

/**
 * Game event types
 */
export type GameEventType =
    | 'game:started'
    | 'game:paused'
    | 'game:resumed'
    | 'game:finished'
    | 'game:failed'
    | 'knife:thrown'
    | 'knife:hit'
    | 'knife:missed'
    | 'knife:collision'
    | 'target:rotated'
    | 'score:updated'
    | 'combo:changed';

export interface GameEvent<T = any> {
    type: GameEventType;
    timestamp: number;
    data?: T;
}

/**
 * Chart metadata types
 */
export interface ChartDifficulty {
    version: string;
    overallDifficulty: number;
    approachRate: number;
    circleSize: number;
    hpDrainRate: number;
    starRating?: number;
}

export interface ChartMetadata {
    id: string;
    title: string;
    artist: string;
    creator: string;
    source?: string;
    tags?: string[];
    bpm: number;
    duration: number; // seconds
    difficulties: ChartDifficulty[];
    backgroundImage?: string;
    previewTime?: number;
}

// Export empty object to make this a module
export { };
