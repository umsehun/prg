/**
 * Global type definitions for the entire PRG project
 * These types are available everywhere without explicit import
 */

declare global {
  /**
   * Environment variables with strict typing
   */
  namespace NodeJS {
    interface ProcessEnv {
      readonly NODE_ENV: 'development' | 'production' | 'test';
      readonly ELECTRON_IS_DEV?: '1' | '0';
      readonly VITE_DEV_SERVER_URL?: string;
      readonly PRG_DATA_DIR?: string;
      readonly PRG_LOG_LEVEL?: 'debug' | 'info' | 'warn' | 'error';
    }
  }

  /**
   * Utility types used throughout the project
   */
  type Nullable<T> = T | null;
  type Optional<T> = T | undefined;
  type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
  };
  type DeepRequired<T> = {
    [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
  };

  /**
   * Function types
   */
  type EventHandler<T = void> = (event: T) => void;
  type AsyncEventHandler<T = void> = (event: T) => Promise<void>;
  type Cleanup = () => void;
  type ErrorCallback = (error: Error) => void;

  /**
   * Common result types for async operations
   */
  interface BaseResult {
    readonly success: boolean;
    readonly timestamp: number;
  }

  interface SuccessResult<T = unknown> extends BaseResult {
    readonly success: true;
    readonly data: T;
  }

  interface ErrorResult extends BaseResult {
    readonly success: false;
    readonly error: {
      readonly code: string;
      readonly message: string;
      readonly category: 'SYSTEM' | 'GAME' | 'AUDIO' | 'OSZ' | 'IPC' | 'PHYSICS';
      readonly severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
      readonly recoverable: boolean;
      readonly details?: unknown;
    };
  }

  type Result<T = unknown> = SuccessResult<T> | ErrorResult;

  /**
   * ID types for type safety
   */
  type ChartId = string & { readonly _brand: 'ChartId' };
  type UserId = string & { readonly _brand: 'UserId' };
  type SessionId = string & { readonly _brand: 'SessionId' };
  type ScoreId = string & { readonly _brand: 'ScoreId' };

  /**
   * Timing types
   */
  type Milliseconds = number & { readonly _brand: 'Milliseconds' };
  type Seconds = number & { readonly _brand: 'Seconds' };
  type BPM = number & { readonly _brand: 'BPM' };

  /**
   * Game coordinate types
   */
  interface Point2D {
    readonly x: number;
    readonly y: number;
  }

  interface Size2D {
    readonly width: number;
    readonly height: number;
  }

  interface Rectangle extends Point2D, Size2D {}

  /**
   * Performance metrics
   */
  interface PerformanceSnapshot {
    readonly timestamp: Milliseconds;
    readonly fps: number;
    readonly frameTime: Milliseconds;
    readonly memoryUsage: {
      readonly used: number;
      readonly total: number;
      readonly percentage: number;
    };
    readonly audioLatency: Optional<Milliseconds>;
    readonly physicsTime: Optional<Milliseconds>;
  }

  /**
   * Event system types
   */
  type EventType = 
    | 'game:started'
    | 'game:paused'
    | 'game:resumed'
    | 'game:finished'
    | 'game:failed'
    | 'knife:thrown'
    | 'knife:hit'
    | 'knife:missed'
    | 'target:rotated'
    | 'score:updated'
    | 'combo:changed'
    | 'settings:changed'
    | 'chart:imported'
    | 'error:occurred';

  interface GameEvent<T = unknown> {
    readonly type: EventType;
    readonly timestamp: Milliseconds;
    readonly data?: T;
    readonly source: 'main' | 'renderer' | 'worker';
  }

  /**
   * Module augmentation for better TypeScript support
   */
  declare module '*.worker.ts' {
    const WorkerFactory: new () => Worker;
    export default WorkerFactory;
  }

  declare module '*.osz' {
    const content: ArrayBuffer;
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
   * Matter.js augmentation
   */
  namespace Matter {
    interface Body {
      label: string;
      customData?: Record<string, unknown>;
      prgId?: string;
    }

    interface Engine {
      prgMetrics?: {
        lastUpdateTime: number;
        averageFrameTime: number;
      };
    }
  }
}

// Export empty object to make this a module
export {};
