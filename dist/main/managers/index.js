"use strict";
/**
 * Managers module exports
 * Centralizes all application managers
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsManager = exports.LifecycleManager = exports.IPCManager = exports.WindowManager = void 0;
var window_manager_1 = require("./window-manager");
Object.defineProperty(exports, "WindowManager", { enumerable: true, get: function () { return window_manager_1.WindowManager; } });
var ipc_manager_1 = require("./ipc-manager");
Object.defineProperty(exports, "IPCManager", { enumerable: true, get: function () { return ipc_manager_1.IPCManager; } });
var lifecycle_1 = require("./lifecycle");
Object.defineProperty(exports, "LifecycleManager", { enumerable: true, get: function () { return lifecycle_1.LifecycleManager; } });
var settings_manager_1 = require("./settings-manager");
Object.defineProperty(exports, "SettingsManager", { enumerable: true, get: function () { return settings_manager_1.SettingsManager; } });
