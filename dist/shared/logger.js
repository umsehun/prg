"use strict";
// shared/logger.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const getTimestamp = () => new Date().toISOString();
exports.logger = {
    info: (message, ...args) => {
        console.log(`[INFO] ${getTimestamp()}: ${message}`, ...args);
    },
    warn: (message, ...args) => {
        console.warn(`[WARN] ${getTimestamp()}: ${message}`, ...args);
    },
    error: (message, ...args) => {
        console.error(`[ERROR] ${getTimestamp()}: ${message}`, ...args);
    },
};
