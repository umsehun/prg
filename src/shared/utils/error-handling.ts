/**
 * Standardized error handling utilities
 */

import { logger } from '../globals/logger';
import { ERROR_CODES } from '../globals/constants';
import type { ErrorInfo, Result } from '../globals/types.d';

/**
 * Custom error class with structured information
 */
export class PrgError extends Error {
    public readonly code: string;
    public readonly category: ErrorInfo['category'];
    public readonly severity: ErrorInfo['severity'];
    public readonly timestamp: string;
    public readonly data?: any;

    constructor(
        code: string,
        message: string,
        category: ErrorInfo['category'],
        severity: ErrorInfo['severity'] = 'MEDIUM',
        data?: any
    ) {
        super(message);
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
    toErrorInfo(): ErrorInfo {
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
    static fromUnknown(error: unknown, category: ErrorInfo['category']): PrgError {
        if (error instanceof PrgError) {
            return error;
        }

        if (error instanceof Error) {
            return new PrgError(
                'UNKNOWN_ERROR',
                error.message,
                category,
                'MEDIUM',
                { originalName: error.name, originalStack: error.stack }
            );
        }

        return new PrgError(
            'UNKNOWN_ERROR',
            String(error),
            category,
            'MEDIUM',
            { originalError: error }
        );
    }
}

/**
 * Result wrapper with error handling
 */
export class ResultHandler {
    /**
     * Create success result
     */
    static success<T>(data?: T): Result<T> {
        return {
            success: true,
            ...(data !== undefined && { data })
        };
    }

    /**
     * Create error result
     */
    static error<T = any>(error: string | PrgError): Result<T> {
        if (typeof error === 'string') {
            return {
                success: false,
                error
            };
        }

        return {
            success: false,
            error: error.message,
            data: error.toErrorInfo() as any
        };
    }

    /**
     * Wrap async function with error handling
     */
    static async wrap<T>(
        fn: () => Promise<T>,
        category: ErrorInfo['category'],
        errorCode?: string
    ): Promise<Result<T>> {
        try {
            const data = await fn();
            return ResultHandler.success(data);
        } catch (error) {
            const prgError = error instanceof PrgError
                ? error
                : new PrgError(
                    errorCode || 'ASYNC_ERROR',
                    error instanceof Error ? error.message : String(error),
                    category,
                    'MEDIUM'
                );

            // Log the error
            logger.error(category, prgError.message, prgError.toErrorInfo());

            return ResultHandler.error(prgError);
        }
    }

    /**
     * Wrap sync function with error handling
     */
    static wrapSync<T>(
        fn: () => T,
        category: ErrorInfo['category'],
        errorCode?: string
    ): Result<T> {
        try {
            const data = fn();
            return ResultHandler.success(data);
        } catch (error) {
            const prgError = error instanceof PrgError
                ? error
                : new PrgError(
                    errorCode || 'SYNC_ERROR',
                    error instanceof Error ? error.message : String(error),
                    category,
                    'MEDIUM'
                );

            // Log the error
            logger.error(category, prgError.message, prgError.toErrorInfo());

            return ResultHandler.error(prgError);
        }
    }
}

/**
 * Pre-defined error factories
 */
export const GameError = {
    notInitialized: (details?: string) => new PrgError(
        ERROR_CODES.GAME_NOT_INITIALIZED,
        `Game not initialized${details ? `: ${details}` : ''}`,
        'GAME',
        'HIGH'
    ),

    alreadyRunning: () => new PrgError(
        ERROR_CODES.GAME_ALREADY_RUNNING,
        'Game is already running',
        'GAME',
        'MEDIUM'
    ),

    invalidChartData: (details?: string) => new PrgError(
        ERROR_CODES.INVALID_CHART_DATA,
        `Invalid chart data${details ? `: ${details}` : ''}`,
        'GAME',
        'HIGH'
    ),

    physicsError: (details?: string) => new PrgError(
        ERROR_CODES.PHYSICS_ENGINE_ERROR,
        `Physics engine error${details ? `: ${details}` : ''}`,
        'GAME',
        'CRITICAL'
    )
};

export const AudioError = {
    contextFailed: (details?: string) => new PrgError(
        ERROR_CODES.AUDIO_CONTEXT_FAILED,
        `Failed to initialize audio context${details ? `: ${details}` : ''}`,
        'AUDIO',
        'CRITICAL'
    ),

    decodeFailed: (filename?: string) => new PrgError(
        ERROR_CODES.AUDIO_DECODE_FAILED,
        `Failed to decode audio${filename ? ` file: ${filename}` : ''}`,
        'AUDIO',
        'HIGH'
    ),

    playbackFailed: (details?: string) => new PrgError(
        ERROR_CODES.AUDIO_PLAYBACK_FAILED,
        `Audio playback failed${details ? `: ${details}` : ''}`,
        'AUDIO',
        'HIGH'
    ),

    unsupportedFormat: (format: string) => new PrgError(
        ERROR_CODES.UNSUPPORTED_AUDIO_FORMAT,
        `Unsupported audio format: ${format}`,
        'AUDIO',
        'MEDIUM'
    )
};

export const FileError = {
    notFound: (filepath: string) => new PrgError(
        ERROR_CODES.FILE_NOT_FOUND,
        `File not found: ${filepath}`,
        'OSZ',
        'HIGH'
    ),

    tooLarge: (filepath: string, size: number, limit: number) => new PrgError(
        ERROR_CODES.FILE_TOO_LARGE,
        `File too large: ${filepath} (${size} bytes, limit: ${limit} bytes)`,
        'OSZ',
        'MEDIUM'
    ),

    invalidFormat: (filepath: string, expected?: string) => new PrgError(
        ERROR_CODES.INVALID_FILE_FORMAT,
        `Invalid file format: ${filepath}${expected ? `, expected: ${expected}` : ''}`,
        'OSZ',
        'MEDIUM'
    ),

    parseFailed: (filepath: string, details?: string) => new PrgError(
        ERROR_CODES.FILE_PARSE_ERROR,
        `Failed to parse file: ${filepath}${details ? `: ${details}` : ''}`,
        'OSZ',
        'HIGH'
    ),

    permissionDenied: (filepath: string) => new PrgError(
        ERROR_CODES.PERMISSION_DENIED,
        `Permission denied: ${filepath}`,
        'OSZ',
        'HIGH'
    )
};

export const IpcError = {
    handlerNotFound: (channel: string) => new PrgError(
        ERROR_CODES.IPC_HANDLER_NOT_FOUND,
        `IPC handler not found: ${channel}`,
        'IPC',
        'HIGH'
    ),

    invalidParams: (channel: string, details?: string) => new PrgError(
        ERROR_CODES.IPC_INVALID_PARAMS,
        `Invalid IPC parameters for ${channel}${details ? `: ${details}` : ''}`,
        'IPC',
        'MEDIUM'
    ),

    timeout: (channel: string, timeoutMs: number) => new PrgError(
        ERROR_CODES.IPC_TIMEOUT,
        `IPC timeout for ${channel} (${timeoutMs}ms)`,
        'IPC',
        'HIGH'
    )
};

/**
 * Global error boundary for unhandled errors
 */
export class ErrorBoundary {
    private static handlers: Map<string, (error: ErrorInfo) => void> = new Map();

    /**
     * Initialize global error handlers
     */
    static initialize(): void {
        // Handle unhandled promise rejections
        if (typeof process !== 'undefined') {
            process.on('unhandledRejection', (reason, promise) => {
                const error = PrgError.fromUnknown(reason, 'SYSTEM');
                logger.fatal('SYSTEM', 'Unhandled promise rejection', { reason, promise });
                ErrorBoundary.notifyHandlers(error.toErrorInfo());
            });

            process.on('uncaughtException', (error) => {
                const prgError = PrgError.fromUnknown(error, 'SYSTEM');
                logger.fatal('SYSTEM', 'Uncaught exception', prgError.toErrorInfo());
                ErrorBoundary.notifyHandlers(prgError.toErrorInfo());
            });
        } else if (typeof window !== 'undefined') {
            window.addEventListener('unhandledrejection', (event) => {
                const error = PrgError.fromUnknown(event.reason, 'SYSTEM');
                logger.fatal('SYSTEM', 'Unhandled promise rejection', error.toErrorInfo());
                ErrorBoundary.notifyHandlers(error.toErrorInfo());
            });

            window.addEventListener('error', (event) => {
                const error = PrgError.fromUnknown(event.error || event.message, 'SYSTEM');
                logger.fatal('SYSTEM', 'Uncaught error', error.toErrorInfo());
                ErrorBoundary.notifyHandlers(error.toErrorInfo());
            });
        }
    }

    /**
     * Add error handler
     */
    static addHandler(id: string, handler: (error: ErrorInfo) => void): () => void {
        ErrorBoundary.handlers.set(id, handler);
        return () => ErrorBoundary.handlers.delete(id);
    }

    /**
     * Notify all error handlers
     */
    private static notifyHandlers(error: ErrorInfo): void {
        ErrorBoundary.handlers.forEach((handler, id) => {
            try {
                handler(error);
            } catch (handlerError) {
                logger.error('SYSTEM', `Error in error handler ${id}`, handlerError);
            }
        });
    }
}

// Initialize error boundary
ErrorBoundary.initialize();
