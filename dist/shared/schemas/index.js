"use strict";
/**
 * Schema validation system index
 * Exports all Zod schemas for data validation throughout the PRG project
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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllSchemas = exports.SettingsSchemas = exports.IpcSchemas = exports.OszSchemas = void 0;
exports.validateWithSchema = validateWithSchema;
// OSZ and beatmap schemas
var osz_schema_1 = require("./osz.schema");
Object.defineProperty(exports, "OszSchemas", { enumerable: true, get: function () { return osz_schema_1.OszSchemas; } });
// IPC communication schemas
var ipc_schema_1 = require("./ipc.schema");
Object.defineProperty(exports, "IpcSchemas", { enumerable: true, get: function () { return ipc_schema_1.IpcSchemas; } });
// Settings and configuration schemas
var settings_schema_1 = require("./settings.schema");
Object.defineProperty(exports, "SettingsSchemas", { enumerable: true, get: function () { return settings_schema_1.SettingsSchemas; } });
/**
 * Combined schema collections for easy access
 */
exports.AllSchemas = {
    Osz: () => Promise.resolve().then(() => __importStar(require('./osz.schema'))).then(m => m.OszSchemas),
    Ipc: () => Promise.resolve().then(() => __importStar(require('./ipc.schema'))).then(m => m.IpcSchemas),
    Settings: () => Promise.resolve().then(() => __importStar(require('./settings.schema'))).then(m => m.SettingsSchemas),
};
/**
 * Generic schema validator helper
 */
function validateWithSchema(schema, data) {
    try {
        const result = schema.safeParse(data);
        if (result.success) {
            return {
                success: true,
                data: result.data,
            };
        }
        else {
            return {
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Data validation failed',
                    issues: result.error.issues.map(issue => ({
                        path: issue.path.map(String),
                        message: issue.message,
                        code: issue.code,
                    })),
                },
            };
        }
    }
    catch (error) {
        return {
            success: false,
            error: {
                code: 'SCHEMA_ERROR',
                message: error instanceof Error ? error.message : 'Unknown schema error',
                issues: [],
            },
        };
    }
}
