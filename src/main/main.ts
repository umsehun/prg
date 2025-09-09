/**
 * Electron main entry point - Simplified bootstrapper
 * Uses ApplicationCore for centralized initialization
 */

import { app } from 'electron';
import { logger } from '../shared/globals/logger';
import { appCore } from './core/app';
import { setupApplicationMenu } from './core/menu';
import { forceMacOSMenuBarVisible } from './core/menubar-debug';

/**
 * Bootstrap the application
 */
async function bootstrap(): Promise<void> {
    try {
        logger.info('main', 'Starting PRG Application');

        // Wait for Electron to be ready
        await app.whenReady();

        // ✅ CRITICAL: Force menu setup IMMEDIATELY after ready
        if (process.platform === 'darwin') {
            logger.info('main', '🍎 macOS detected - forcing menu setup after ready');
            setupApplicationMenu();
            forceMacOSMenuBarVisible();
        }

        // Initialize the application core
        await appCore.initialize();

        logger.info('main', '✅ PRG Application started successfully');

    } catch (error) {
        logger.fatal('main', '❌ Failed to start application', error);

        // Exit gracefully
        try {
            await appCore.shutdown();
        } catch (shutdownError) {
            logger.error('main', 'Error during emergency shutdown', shutdownError);
        }

        app.exit(1);
    }
}

/**
 * Handle application shutdown
 */
async function shutdown(): Promise<void> {
    try {
        logger.info('main', 'Shutting down PRG Application');

        await appCore.shutdown();

        logger.info('main', '✅ PRG Application shut down successfully');
    } catch (error) {
        logger.error('main', 'Error during shutdown', error);
        app.exit(1);
    }
}

// Start the application
bootstrap().catch((error) => {
    logger.fatal('main', 'Fatal error during bootstrap', error);
    app.exit(1);
});

// Handle app quit
app.on('before-quit', async (event) => {
    event.preventDefault();
    await shutdown();
    app.exit(0);
});
