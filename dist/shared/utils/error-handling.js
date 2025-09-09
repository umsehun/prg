"use strict";
/**
 * Standardized error handling utilities
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorBoundary = exports.IpcError = exports.FileError = exports.AudioError = exports.GameError = exports.ResultHandler = exports.PrgError = void 0;
const logger_1 = require("../globals/logger");
const constants_1 = require("../globals/constants");
/**
 * Custom error class with structured information
 */
class PrgError extends Error {
    constructor(code, message, category, severity = 'MEDIUM', data) {
        super(message);
        Object.defineProperty(this, "code", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "category", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "severity", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "timestamp", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "data", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.name = 'PrgError';
        this.code = code;
        this.category = category;
        this.severity = severity;
        this.timestamp = new Date().toISOString();
        this.data = data;
        // Maintain proper stack trace
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, PrgError);
        }
    }
    /**
     * Convert to ErrorInfo object
     */
    toErrorInfo() {
        return {
            code: this.code,
            message: this.message,
            category: this.category,
            severity: this.severity,
            timestamp: this.timestamp,
            ...(this.stack && { stack: this.stack }),
            data: this.data
        };
    }
    /**
     * Create error from unknown source
     */
    static fromUnknown(error, category) {
        if (error instanceof PrgError) {
            return error;
        }
        if (error instanceof Error) {
            return new PrgError('UNKNOWN_ERROR', error.message, category, 'MEDIUM', { originalName: error.name, originalStack: error.stack });
        }
        return new PrgError('UNKNOWN_ERROR', String(error), category, 'MEDIUM', { originalError: error });
    }
}
exports.PrgError = PrgError;
/**
 * Result wrapper with error handling
 */
class ResultHandler {
    /**
     * Create success result
     */
    static success(data) {
        return {
            success: true,
            ...(data !== undefined && { data })
        };
    }
    /**
     * Create error result
     */
    static error(error) {
        if (typeof error === 'string') {
            return {
                success: false,
                error
            };
        }
        return {
            success: false,
            error: error.message,
            data: error.toErrorInfo()
        };
    }
    /**
     * Wrap async function with error handling
     */
    static async wrap(fn, category, errorCode) {
        try {
            const data = await fn();
            return ResultHandler.success(data);
        }
        catch (error) {
            const prgError = error instanceof PrgError
                ? error
                : new PrgError(errorCode || 'ASYNC_ERROR', error instanceof Error ? error.message : String(error), category, 'MEDIUM');
            // Log the error
            logger_1.logger.error(category, prgError.message, prgError.toErrorInfo());
            return ResultHandler.error(prgError);
        }
    }
    /**
     * Wrap sync function with error handling
     */
    static wrapSync(fn, category, errorCode) {
        try {
            const data = fn();
            return ResultHandler.success(data);
        }
        catch (error) {
            const prgError = error instanceof PrgError
                ? error
                : new PrgError(errorCode || 'SYNC_ERROR', error instanceof Error ? error.message : String(error), category, 'MEDIUM');
            // Log the error
            logger_1.logger.error(category, prgError.message, prgError.toErrorInfo());
            return ResultHandler.error(prgError);
        }
    }
}
exports.ResultHandler = ResultHandler;
/**
 * Pre-defined error factories
 */
exports.GameError = {
    notInitialized: (details) => new PrgError(constants_1.ERROR_CODES.GAME_NOT_INITIALIZED, `Game not initialized${details ? `: ${details}` : ''}`, 'GAME', 'HIGH'),
    alreadyRunning: () => new PrgError(constants_1.ERROR_CODES.GAME_ALREADY_RUNNING, 'Game is already running', 'GAME', 'MEDIUM'),
    invalidChartData: (details) => new PrgError(constants_1.ERROR_CODES.INVALID_CHART_DATA, `Invalid chart data${details ? `: ${details}` : ''}`, 'GAME', 'HIGH'),
    physicsError: (details) => new PrgError(constants_1.ERROR_CODES.PHYSICS_ENGINE_ERROR, `Physics engine error${details ? `: ${details}` : ''}`, 'GAME', 'CRITICAL')
};
exports.AudioError = {
    contextFailed: (details) => new PrgError(constants_1.ERROR_CODES.AUDIO_CONTEXT_FAILED, `Failed to initialize audio context${details ? `: ${details}` : ''}`, 'AUDIO', 'CRITICAL'),
    decodeFailed: (filename) => new PrgError(constants_1.ERROR_CODES.AUDIO_DECODE_FAILED, `Failed to decode audio${filename ? ` file: ${filename}` : ''}`, 'AUDIO', 'HIGH'),
    playbackFailed: (details) => new PrgError(constants_1.ERROR_CODES.AUDIO_PLAYBACK_FAILED, `Audio playback failed${details ? `: ${details}` : ''}`, 'AUDIO', 'HIGH'),
    unsupportedFormat: (format) => new PrgError(constants_1.ERROR_CODES.UNSUPPORTED_AUDIO_FORMAT, `Unsupported audio format: ${format}`, 'AUDIO', 'MEDIUM')
};
exports.FileError = {
    notFound: (filepath) => new PrgError(constants_1.ERROR_CODES.FILE_NOT_FOUND, `File not found: ${filepath}`, 'OSZ', 'HIGH'),
    tooLarge: (filepath, size, limit) => new PrgError(constants_1.ERROR_CODES.FILE_TOO_LARGE, `File too large: ${filepath} (${size} bytes, limit: ${limit} bytes)`, 'OSZ', 'MEDIUM'),
    invalidFormat: (filepath, expected) => new PrgError(constants_1.ERROR_CODES.INVALID_FILE_FORMAT, `Invalid file format: ${filepath}${expected ? `, expected: ${expected}` : ''}`, 'OSZ', 'MEDIUM'),
    parseFailed: (filepath, details) => new PrgError(constants_1.ERROR_CODES.FILE_PARSE_ERROR, `Failed to parse file: ${filepath}${details ? `: ${details}` : ''}`, 'OSZ', 'HIGH'),
    permissionDenied: (filepath) => new PrgError(constants_1.ERROR_CODES.PERMISSION_DENIED, `Permission denied: ${filepath}`, 'OSZ', 'HIGH')
};
exports.IpcError = {
    handlerNotFound: (channel) => new PrgError(constants_1.ERROR_CODES.IPC_HANDLER_NOT_FOUND, `IPC handler not found: ${channel}`, 'IPC', 'HIGH'),
    invalidParams: (channel, details) => new PrgError(constants_1.ERROR_CODES.IPC_INVALID_PARAMS, `Invalid IPC parameters for ${channel}${details ? `: ${details}` : ''}`, 'IPC', 'MEDIUM'),
    timeout: (channel, timeoutMs) => new PrgError(constants_1.ERROR_CODES.IPC_TIMEOUT, `IPC timeout for ${channel} (${timeoutMs}ms)`, 'IPC', 'HIGH')
};
/**
 * Global error boundary for unhandled errors
 */
class ErrorBoundary {
    /**
     * Initialize global error handlers
     */
    static initialize() {
        // Handle unhandled promise rejections
        if (typeof process !== 'undefined') {
            process.on('unhandledRejection', (reason, promise) => {
                const error = PrgError.fromUnknown(reason, 'SYSTEM');
                logger_1.logger.fatal('SYSTEM', 'Unhandled promise rejection', { reason, promise });
                ErrorBoundary.notifyHandlers(error.toErrorInfo());
            });
            process.on('uncaughtException', (error) => {
                const prgError = PrgError.fromUnknown(error, 'SYSTEM');
                logger_1.logger.fatal('SYSTEM', 'Uncaught exception', prgError.toErrorInfo());
                ErrorBoundary.notifyHandlers(prgError.toErrorInfo());
            });
        }
        else if (typeof window !== 'undefined') {
            window.addEventListener('unhandledrejection', (event) => {
                const error = PrgError.fromUnknown(event.reason, 'SYSTEM');
                logger_1.logger.fatal('SYSTEM', 'Unhandled promise rejection', error.toErrorInfo());
                ErrorBoundary.notifyHandlers(error.toErrorInfo());
            });
            window.addEventListener('error', (event) => {
                const error = PrgError.fromUnknown(event.error || event.message, 'SYSTEM');
                logger_1.logger.fatal('SYSTEM', 'Uncaught error', error.toErrorInfo());
                ErrorBoundary.notifyHandlers(error.toErrorInfo());
            });
        }
    }
    /**
     * Add error handler
     */
    static addHandler(id, handler) {
        ErrorBoundary.handlers.set(id, handler);
        return () => ErrorBoundary.handlers.delete(id);
    }
    /**
     * Notify all error handlers
     */
    static notifyHandlers(error) {
        ErrorBoundary.handlers.forEach((handler, id) => {
            try {
                handler(error);
            }
            catch (handlerError) {
                logger_1.logger.error('SYSTEM', `Error in error handler ${id}`, handlerError);
            }
        });
    }
}
exports.ErrorBoundary = ErrorBoundary;
Object.defineProperty(ErrorBoundary, "handlers", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: new Map()
});
// Initialize error boundary
ErrorBoundary.initialize();
