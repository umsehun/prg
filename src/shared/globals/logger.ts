/**
 * Production-ready structured logging system
 * Works across main process, renderer, and workers
 */

export enum LogLevel {
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

export class Logger {
    private static instance: Logger;
    private minLevel: LogLevel = LogLevel.INFO;
    private listeners: Array<(entry: LogEntry) => void> = [];

    private constructor() {
        // Set log level based on environment
        if (typeof process !== 'undefined') {
            this.minLevel = process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.INFO;
        }
    }

    public static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }

    public setLevel(level: LogLevel): void {
        this.minLevel = level;
    }

    public addListener(listener: (entry: LogEntry) => void): () => void {
        this.listeners.push(listener);
        return () => {
            const index = this.listeners.indexOf(listener);
            if (index > -1) {
                this.listeners.splice(index, 1);
            }
        };
    }

    private log(level: LogLevel, category: string, message: string, data?: any): void {
        if (level < this.minLevel) return;

        const processType: LogEntry['processType'] = (() => {
            if (typeof window === 'undefined' && typeof process !== 'undefined') {
                return 'main';
            } else if (typeof self !== 'undefined' && typeof window === 'undefined') {
                return 'worker';
            } else {
                return 'renderer';
            }
        })();

        const entry: LogEntry = {
            timestamp: new Date().toISOString(),
            level,
            category,
            message,
            data,
            processType
        };

        // Capture stack for errors
        if (level >= LogLevel.ERROR) {
            const stack = new Error().stack;
            if (stack) {
                entry.stack = stack;
            }
        }

        // Console output with colors
        this.outputToConsole(entry);

        // Notify listeners
        this.listeners.forEach(listener => {
            try {
                listener(entry);
            } catch (error) {
                console.error('Logger listener error:', error);
            }
        });
    }

    private outputToConsole(entry: LogEntry): void {
        const colors = {
            [LogLevel.DEBUG]: '\x1b[36m', // Cyan
            [LogLevel.INFO]: '\x1b[32m',  // Green
            [LogLevel.WARN]: '\x1b[33m',  // Yellow
            [LogLevel.ERROR]: '\x1b[31m', // Red
            [LogLevel.FATAL]: '\x1b[35m'  // Magenta
        };

        const reset = '\x1b[0m';
        const color = colors[entry.level];
        const levelName = LogLevel[entry.level];

        const prefix = `${color}[${entry.processType.toUpperCase()}:${levelName}]${reset} ${entry.category}:`;

        if (entry.data) {
            console.log(prefix, entry.message, entry.data);
        } else {
            console.log(prefix, entry.message);
        }

        if (entry.stack && entry.level >= LogLevel.ERROR) {
            console.error(entry.stack);
        }
    }

    // Public logging methods
    public debug(category: string, message: string, data?: any): void {
        this.log(LogLevel.DEBUG, category, message, data);
    }

    public info(category: string, message: string, data?: any): void {
        this.log(LogLevel.INFO, category, message, data);
    }

    public warn(category: string, message: string, data?: any): void {
        this.log(LogLevel.WARN, category, message, data);
    }

    public error(category: string, message: string, data?: any): void {
        this.log(LogLevel.ERROR, category, message, data);
    }

    public fatal(category: string, message: string, data?: any): void {
        this.log(LogLevel.FATAL, category, message, data);
    }

    // Convenience methods for specific categories
    public game(level: 'debug' | 'info' | 'warn' | 'error', message: string, data?: any): void {
        this[level]('GAME', message, data);
    }

    public audio(level: 'debug' | 'info' | 'warn' | 'error', message: string, data?: any): void {
        this[level]('AUDIO', message, data);
    }

    public physics(level: 'debug' | 'info' | 'warn' | 'error', message: string, data?: any): void {
        this[level]('PHYSICS', message, data);
    }

    public ipc(level: 'debug' | 'info' | 'warn' | 'error', message: string, data?: any): void {
        this[level]('IPC', message, data);
    }

    public osz(level: 'debug' | 'info' | 'warn' | 'error', message: string, data?: any): void {
        this[level]('OSZ', message, data);
    }
}

// Global logger instance
export const logger = Logger.getInstance();

// Export convenience functions
export const log = {
    debug: (category: string, message: string, data?: any) => logger.debug(category, message, data),
    info: (category: string, message: string, data?: any) => logger.info(category, message, data),
    warn: (category: string, message: string, data?: any) => logger.warn(category, message, data),
    error: (category: string, message: string, data?: any) => logger.error(category, message, data),
    fatal: (category: string, message: string, data?: any) => logger.fatal(category, message, data),

    game: logger.game.bind(logger),
    audio: logger.audio.bind(logger),
    physics: logger.physics.bind(logger),
    ipc: logger.ipc.bind(logger),
    osz: logger.osz.bind(logger)
};
