"use strict";
/**
 * Global utilities and types export index
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEV_CONFIG = exports.PERFORMANCE = exports.ERROR_CODES = exports.UI_CONFIG = exports.FILE_CONFIG = exports.AUDIO_CONFIG = exports.GAME_CONFIG = exports.APP_CONFIG = exports.platform = exports.default = void 0;
// Re-export all global utilities
__exportStar(require("./logger"), exports);
__exportStar(require("./platform"), exports);
__exportStar(require("./constants"), exports);
// Default exports for convenience
var logger_1 = require("./logger");
Object.defineProperty(exports, "default", { enumerable: true, get: function () { return logger_1.logger; } });
var platform_1 = require("./platform");
Object.defineProperty(exports, "platform", { enumerable: true, get: function () { return platform_1.platform; } });
var constants_1 = require("./constants");
Object.defineProperty(exports, "APP_CONFIG", { enumerable: true, get: function () { return constants_1.APP_CONFIG; } });
Object.defineProperty(exports, "GAME_CONFIG", { enumerable: true, get: function () { return constants_1.GAME_CONFIG; } });
Object.defineProperty(exports, "AUDIO_CONFIG", { enumerable: true, get: function () { return constants_1.AUDIO_CONFIG; } });
Object.defineProperty(exports, "FILE_CONFIG", { enumerable: true, get: function () { return constants_1.FILE_CONFIG; } });
Object.defineProperty(exports, "UI_CONFIG", { enumerable: true, get: function () { return constants_1.UI_CONFIG; } });
Object.defineProperty(exports, "ERROR_CODES", { enumerable: true, get: function () { return constants_1.ERROR_CODES; } });
Object.defineProperty(exports, "PERFORMANCE", { enumerable: true, get: function () { return constants_1.PERFORMANCE; } });
Object.defineProperty(exports, "DEV_CONFIG", { enumerable: true, get: function () { return constants_1.DEV_CONFIG; } });
