"use strict";
/**
 * Core module exports
 * Centralizes all core application components
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsManager = exports.LifecycleManager = exports.IPCManager = exports.WindowManager = exports.createWindow = exports.setupSecurityPolicies = exports.appCore = exports.ApplicationCore = void 0;
var app_1 = require("./app");
Object.defineProperty(exports, "ApplicationCore", { enumerable: true, get: function () { return app_1.ApplicationCore; } });
Object.defineProperty(exports, "appCore", { enumerable: true, get: function () { return app_1.appCore; } });
var security_1 = require("./security");
Object.defineProperty(exports, "setupSecurityPolicies", { enumerable: true, get: function () { return security_1.setupSecurityPolicies; } });
var window_1 = require("./window");
Object.defineProperty(exports, "createWindow", { enumerable: true, get: function () { return window_1.createWindow; } });
// Re-export managers for convenience
var managers_1 = require("../managers");
Object.defineProperty(exports, "WindowManager", { enumerable: true, get: function () { return managers_1.WindowManager; } });
Object.defineProperty(exports, "IPCManager", { enumerable: true, get: function () { return managers_1.IPCManager; } });
Object.defineProperty(exports, "LifecycleManager", { enumerable: true, get: function () { return managers_1.LifecycleManager; } });
Object.defineProperty(exports, "SettingsManager", { enumerable: true, get: function () { return managers_1.SettingsManager; } });
