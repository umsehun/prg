"use strict";
/**
 * Core module exports
 * Centralizes all core application components
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWindow = exports.setupSecurityPolicies = exports.SettingsManager = exports.LifecycleManager = exports.IPCManager = exports.WindowManager = exports.appCore = exports.ApplicationCore = void 0;
var app_1 = require("./app");
Object.defineProperty(exports, "ApplicationCore", { enumerable: true, get: function () { return app_1.ApplicationCore; } });
Object.defineProperty(exports, "appCore", { enumerable: true, get: function () { return app_1.appCore; } });
var window_manager_1 = require("./window-manager");
Object.defineProperty(exports, "WindowManager", { enumerable: true, get: function () { return window_manager_1.WindowManager; } });
var ipc_manager_1 = require("./ipc-manager");
Object.defineProperty(exports, "IPCManager", { enumerable: true, get: function () { return ipc_manager_1.IPCManager; } });
var lifecycle_1 = require("./lifecycle");
Object.defineProperty(exports, "LifecycleManager", { enumerable: true, get: function () { return lifecycle_1.LifecycleManager; } });
var settings_manager_1 = require("./settings-manager");
Object.defineProperty(exports, "SettingsManager", { enumerable: true, get: function () { return settings_manager_1.SettingsManager; } });
var security_1 = require("./security");
Object.defineProperty(exports, "setupSecurityPolicies", { enumerable: true, get: function () { return security_1.setupSecurityPolicies; } });
var window_1 = require("./window");
Object.defineProperty(exports, "createWindow", { enumerable: true, get: function () { return window_1.createWindow; } });
