/**
 * Production-ready structured logging system
 * Works across main process, renderer, and workers
 */
export declare enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
    FATAL = 4
}
export interface LogEntry {
    timestamp: string;
    level: LogLevel;
    category: string;
    message: string;
    data?: any;
    stack?: string;
    processType: 'main' | 'renderer' | 'worker';
}
export declare class Logger {
    private static instance;
    private minLevel;
    private listeners;
    private constructor();
    static getInstance(): Logger;
    setLevel(level: LogLevel): void;
    addListener(listener: (entry: LogEntry) => void): () => void;
    private log;
    private outputToConsole;
    debug(category: string, message: string, data?: any): void;
    info(category: string, message: string, data?: any): void;
    warn(category: string, message: string, data?: any): void;
    error(category: string, message: string, data?: any): void;
    fatal(category: string, message: string, data?: any): void;
    game(level: 'debug' | 'info' | 'warn' | 'error', message: string, data?: any): void;
    audio(level: 'debug' | 'info' | 'warn' | 'error', message: string, data?: any): void;
    physics(level: 'debug' | 'info' | 'warn' | 'error', message: string, data?: any): void;
    ipc(level: 'debug' | 'info' | 'warn' | 'error', message: string, data?: any): void;
    osz(level: 'debug' | 'info' | 'warn' | 'error', message: string, data?: any): void;
}
export declare const logger: Logger;
export declare const log: {
    debug: (category: string, message: string, data?: any) => void;
    info: (category: string, message: string, data?: any) => void;
    warn: (category: string, message: string, data?: any) => void;
    error: (category: string, message: string, data?: any) => void;
    fatal: (category: string, message: string, data?: any) => void;
    game: (level: "debug" | "info" | "warn" | "error", message: string, data?: any) => void;
    audio: (level: "debug" | "info" | "warn" | "error", message: string, data?: any) => void;
    physics: (level: "debug" | "info" | "warn" | "error", message: string, data?: any) => void;
    ipc: (level: "debug" | "info" | "warn" | "error", message: string, data?: any) => void;
    osz: (level: "debug" | "info" | "warn" | "error", message: string, data?: any) => void;
};
//# sourceMappingURL=logger.d.ts.map