"use strict";
/**
 * Electron main entry point - Simplified bootstrapper
 * Uses ApplicationCore for centralized initialization
 */
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const logger_1 = require("../shared/globals/logger");
const app_1 = require("./core/app");
/**
 * Bootstrap the application
 */
async function bootstrap() {
    try {
        logger_1.logger.info('main', 'Starting PRG Application');
        // Wait for Electron to be ready
        await electron_1.app.whenReady();
        // Initialize the application core
        await app_1.appCore.initialize();
        logger_1.logger.info('main', '✅ PRG Application started successfully');
    }
    catch (error) {
        logger_1.logger.fatal('main', '❌ Failed to start application', error);
        // Exit gracefully
        try {
            await app_1.appCore.shutdown();
        }
        catch (shutdownError) {
            logger_1.logger.error('main', 'Error during emergency shutdown', shutdownError);
        }
        electron_1.app.exit(1);
    }
}
/**
 * Handle application shutdown
 */
async function shutdown() {
    try {
        logger_1.logger.info('main', 'Shutting down PRG Application');
        await app_1.appCore.shutdown();
        logger_1.logger.info('main', '✅ PRG Application shut down successfully');
    }
    catch (error) {
        logger_1.logger.error('main', 'Error during shutdown', error);
        electron_1.app.exit(1);
    }
}
// Start the application
bootstrap().catch((error) => {
    logger_1.logger.fatal('main', 'Fatal error during bootstrap', error);
    electron_1.app.exit(1);
});
// Handle app quit
electron_1.app.on('before-quit', async (event) => {
    event.preventDefault();
    await shutdown();
    electron_1.app.exit(0);
});
