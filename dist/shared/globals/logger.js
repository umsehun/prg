"use strict";
/**
 * Production-ready structured logging system
 * Works across main process, renderer, and workers
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = exports.logger = exports.Logger = exports.LogLevel = void 0;
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["DEBUG"] = 0] = "DEBUG";
    LogLevel[LogLevel["INFO"] = 1] = "INFO";
    LogLevel[LogLevel["WARN"] = 2] = "WARN";
    LogLevel[LogLevel["ERROR"] = 3] = "ERROR";
    LogLevel[LogLevel["FATAL"] = 4] = "FATAL";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
class Logger {
    constructor() {
        Object.defineProperty(this, "minLevel", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: LogLevel.INFO
        });
        Object.defineProperty(this, "listeners", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        // Set log level based on environment
        if (typeof process !== 'undefined') {
            this.minLevel = process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.INFO;
        }
    }
    static getInstance() {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }
    setLevel(level) {
        this.minLevel = level;
    }
    addListener(listener) {
        this.listeners.push(listener);
        return () => {
            const index = this.listeners.indexOf(listener);
            if (index > -1) {
                this.listeners.splice(index, 1);
            }
        };
    }
    log(level, category, message, data) {
        if (level < this.minLevel)
            return;
        const processType = (() => {
            if (typeof window === 'undefined' && typeof process !== 'undefined') {
                return 'main';
            }
            else if (typeof self !== 'undefined' && typeof window === 'undefined') {
                return 'worker';
            }
            else {
                return 'renderer';
            }
        })();
        const entry = {
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
            }
            catch (error) {
                console.error('Logger listener error:', error);
            }
        });
    }
    outputToConsole(entry) {
        const colors = {
            [LogLevel.DEBUG]: '\x1b[36m', // Cyan
            [LogLevel.INFO]: '\x1b[32m', // Green
            [LogLevel.WARN]: '\x1b[33m', // Yellow
            [LogLevel.ERROR]: '\x1b[31m', // Red
            [LogLevel.FATAL]: '\x1b[35m' // Magenta
        };
        const reset = '\x1b[0m';
        const color = colors[entry.level];
        const levelName = LogLevel[entry.level];
        const prefix = `${color}[${entry.processType.toUpperCase()}:${levelName}]${reset} ${entry.category}:`;
        if (entry.data) {
            console.log(prefix, entry.message, entry.data);
        }
        else {
            console.log(prefix, entry.message);
        }
        if (entry.stack && entry.level >= LogLevel.ERROR) {
            console.error(entry.stack);
        }
    }
    // Public logging methods
    debug(category, message, data) {
        this.log(LogLevel.DEBUG, category, message, data);
    }
    info(category, message, data) {
        this.log(LogLevel.INFO, category, message, data);
    }
    warn(category, message, data) {
        this.log(LogLevel.WARN, category, message, data);
    }
    error(category, message, data) {
        this.log(LogLevel.ERROR, category, message, data);
    }
    fatal(category, message, data) {
        this.log(LogLevel.FATAL, category, message, data);
    }
    // Convenience methods for specific categories
    game(level, message, data) {
        this[level]('GAME', message, data);
    }
    audio(level, message, data) {
        this[level]('AUDIO', message, data);
    }
    physics(level, message, data) {
        this[level]('PHYSICS', message, data);
    }
    ipc(level, message, data) {
        this[level]('IPC', message, data);
    }
    osz(level, message, data) {
        this[level]('OSZ', message, data);
    }
}
exports.Logger = Logger;
// Global logger instance
exports.logger = Logger.getInstance();
// Export convenience functions
exports.log = {
    debug: (category, message, data) => exports.logger.debug(category, message, data),
    info: (category, message, data) => exports.logger.info(category, message, data),
    warn: (category, message, data) => exports.logger.warn(category, message, data),
    error: (category, message, data) => exports.logger.error(category, message, data),
    fatal: (category, message, data) => exports.logger.fatal(category, message, data),
    game: exports.logger.game.bind(exports.logger),
    audio: exports.logger.audio.bind(exports.logger),
    physics: exports.logger.physics.bind(exports.logger),
    ipc: exports.logger.ipc.bind(exports.logger),
    osz: exports.logger.osz.bind(exports.logger)
};
