/**
 * Standardized error handling utilities
 */
import type { ErrorInfo, Result } from '../globals/types.d';
/**
 * Custom error class with structured information
 */
export declare class PrgError extends Error {
    readonly code: string;
    readonly category: ErrorInfo['category'];
    readonly severity: ErrorInfo['severity'];
    readonly timestamp: string;
    readonly data?: any;
    constructor(code: string, message: string, category: ErrorInfo['category'], severity?: ErrorInfo['severity'], data?: any);
    /**
     * Convert to ErrorInfo object
     */
    toErrorInfo(): ErrorInfo;
    /**
     * Create error from unknown source
     */
    static fromUnknown(error: unknown, category: ErrorInfo['category']): PrgError;
}
/**
 * Result wrapper with error handling
 */
export declare class ResultHandler {
    /**
     * Create success result
     */
    static success<T>(data?: T): Result<T>;
    /**
     * Create error result
     */
    static error<T = any>(error: string | PrgError): Result<T>;
    /**
     * Wrap async function with error handling
     */
    static wrap<T>(fn: () => Promise<T>, category: ErrorInfo['category'], errorCode?: string): Promise<Result<T>>;
    /**
     * Wrap sync function with error handling
     */
    static wrapSync<T>(fn: () => T, category: ErrorInfo['category'], errorCode?: string): Result<T>;
}
/**
 * Pre-defined error factories
 */
export declare const GameError: {
    notInitialized: (details?: string) => PrgError;
    alreadyRunning: () => PrgError;
    invalidChartData: (details?: string) => PrgError;
    physicsError: (details?: string) => PrgError;
};
export declare const AudioError: {
    contextFailed: (details?: string) => PrgError;
    decodeFailed: (filename?: string) => PrgError;
    playbackFailed: (details?: string) => PrgError;
    unsupportedFormat: (format: string) => PrgError;
};
export declare const FileError: {
    notFound: (filepath: string) => PrgError;
    tooLarge: (filepath: string, size: number, limit: number) => PrgError;
    invalidFormat: (filepath: string, expected?: string) => PrgError;
    parseFailed: (filepath: string, details?: string) => PrgError;
    permissionDenied: (filepath: string) => PrgError;
};
export declare const IpcError: {
    handlerNotFound: (channel: string) => PrgError;
    invalidParams: (channel: string, details?: string) => PrgError;
    timeout: (channel: string, timeoutMs: number) => PrgError;
};
/**
 * Global error boundary for unhandled errors
 */
export declare class ErrorBoundary {
    private static handlers;
    /**
     * Initialize global error handlers
     */
    static initialize(): void;
    /**
     * Add error handler
     */
    static addHandler(id: string, handler: (error: ErrorInfo) => void): () => void;
    /**
     * Notify all error handlers
     */
    private static notifyHandlers;
}
//# sourceMappingURL=error-handling.d.ts.map