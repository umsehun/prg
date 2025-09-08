/**
 * Lifecycle Manager - Handles application lifecycle events
 * Manages app startup, shutdown, and system events
 */
/**
 * Lifecycle event handlers interface
 */
interface LifecycleEventHandlers {
    onReady?: () => Promise<void> | void;
    onWindowAllClosed?: () => Promise<void> | void;
    onActivate?: () => Promise<void> | void;
    onSecondInstance?: () => Promise<void> | void;
    onBeforeQuit?: () => Promise<void> | void;
    onWebContentsCreated?: () => Promise<void> | void;
    onCertificateError?: () => Promise<void> | void;
}
export declare class LifecycleManager {
    private eventHandlers;
    private isSetup;
    /**
     * Setup all lifecycle event handlers
     */
    setup(): void;
    /**
     * Cleanup lifecycle handlers
     */
    cleanup(): void;
    /**
     * Setup single instance enforcement
     */
    private setupSingleInstance;
    /**
     * Setup window management handlers
     */
    private setupWindowHandlers;
    /**
     * Setup security event handlers
     */
    private setupSecurityHandlers;
    /**
     * Setup process signal handlers
     */
    private setupProcessHandlers;
    /**
     * Register custom event handlers
     */
    registerEventHandlers(handlers: LifecycleEventHandlers): void;
    /**
     * Check if lifecycle is setup
     */
    isLifecycleSetup(): boolean;
}
export {};
//# sourceMappingURL=lifecycle.d.ts.map