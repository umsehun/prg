"use strict";
/**
 * IPC handlers registry
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerIpcHandlers = registerIpcHandlers;
const game_handler_1 = require("./game.handler");
const osz_handler_1 = require("./osz.handler");
const settings_handler_1 = require("./settings.handler");
const system_handler_1 = require("./system.handler");
function registerIpcHandlers(mainWindow) {
    console.log('🔗 Registering IPC handlers...');
    // Register all handler modules
    (0, game_handler_1.setupGameHandlers)(mainWindow);
    (0, osz_handler_1.setupOszHandlers)(mainWindow);
    (0, settings_handler_1.setupSettingsHandlers)(mainWindow);
    (0, system_handler_1.setupSystemHandlers)(mainWindow);
    console.log('✅ All IPC handlers registered');
}
