"use strict";
/**
 * Zod schemas for IPC communication validation
 * Type-safe validation for all Electron IPC messages
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.IpcSchemas = exports.SettingsResetEventSchema = exports.SettingsChangeEventSchema = exports.LibraryChangeEventSchema = exports.ImportProgressEventSchema = exports.ScoreUpdateEventSchema = exports.KnifeResultEventSchema = exports.DeleteFileResponseSchema = exports.DeleteFileRequestSchema = exports.WriteFileResponseSchema = exports.WriteFileRequestSchema = exports.ReadFileResponseSchema = exports.ReadFileRequestSchema = exports.ShowInFolderResponseSchema = exports.ShowInFolderRequestSchema = exports.OpenPathResponseSchema = exports.OpenPathRequestSchema = exports.FileDialogResponseSchema = exports.SaveDialogOptionsSchema = exports.FileDialogOptionsSchema = exports.SettingsImportResponseSchema = exports.SettingsExportResponseSchema = exports.SettingsResetResponseSchema = exports.SettingsSetResponseSchema = exports.SettingsSetRequestSchema = exports.SettingsGetResponseSchema = exports.SettingsGetRequestSchema = exports.SettingsGetAllResponseSchema = exports.ChartDataResponseSchema = exports.ChartDataRequestSchema = exports.AudioDataResponseSchema = exports.AudioDataRequestSchema = exports.OszRemoveResponseSchema = exports.OszRemoveRequestSchema = exports.OszLibraryResponseSchema = exports.OszImportResponseSchema = exports.OszImportRequestSchema = exports.KnifeThrowResponseSchema = exports.KnifeThrowRequestSchema = exports.GameResumeResponseSchema = exports.GamePauseResponseSchema = exports.GameStopResponseSchema = exports.GameStartResponseSchema = exports.GameStartRequestSchema = exports.GameModifiersSchema = void 0;
const zod_1 = require("zod");
/**
 * Basic validation utilities
 */
const NonEmptyString = zod_1.z.string().min(1).trim();
const PositiveNumber = zod_1.z.number().positive();
const NonNegativeNumber = zod_1.z.number().nonnegative();
const BoundedNumber = (min, max) => zod_1.z.number().min(min).max(max);
const ChartIdSchema = NonEmptyString.brand();
const SessionIdSchema = NonEmptyString.brand();
/**
 * Game modifiers validation
 */
exports.GameModifiersSchema = zod_1.z.object({
    noFail: zod_1.z.boolean().default(false),
    easy: zod_1.z.boolean().default(false),
    hardRock: zod_1.z.boolean().default(false),
    doubleTime: zod_1.z.boolean().default(false),
    halfTime: zod_1.z.boolean().default(false),
    hidden: zod_1.z.boolean().default(false),
    flashlight: zod_1.z.boolean().default(false),
    autoplay: zod_1.z.boolean().default(false),
    relax: zod_1.z.boolean().default(false),
    speedMultiplier: BoundedNumber(0.25, 4.0).default(1.0),
}).strict();
/**
 * Game API Request/Response schemas
 */
exports.GameStartRequestSchema = zod_1.z.object({
    chartId: ChartIdSchema,
    difficulty: NonEmptyString,
    modifiers: exports.GameModifiersSchema.optional(),
}).strict();
exports.GameStartResponseSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    sessionId: SessionIdSchema.optional(),
    chartData: zod_1.z.unknown().optional(), // Will be typed more specifically later
    error: zod_1.z.object({
        code: zod_1.z.string(),
        message: zod_1.z.string(),
        category: zod_1.z.enum(['SYSTEM', 'GAME', 'AUDIO', 'OSZ', 'IPC', 'PHYSICS']),
        severity: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
        recoverable: zod_1.z.boolean(),
        details: zod_1.z.unknown().optional(),
    }).optional(),
    timestamp: zod_1.z.number(),
}).strict();
exports.GameStopResponseSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    finalScore: zod_1.z.object({
        sessionId: SessionIdSchema,
        chartId: ChartIdSchema,
        difficulty: NonEmptyString,
        totalScore: NonNegativeNumber,
        accuracy: BoundedNumber(0, 100),
        maxCombo: NonNegativeNumber,
        judgmentCounts: zod_1.z.record(zod_1.z.enum(['KOOL', 'COOL', 'GOOD', 'MISS']), NonNegativeNumber),
        grade: zod_1.z.enum(['SS', 'S', 'A', 'B', 'C', 'D', 'F']),
        modifiers: exports.GameModifiersSchema,
        playTime: PositiveNumber,
        completedAt: zod_1.z.date(),
    }).optional(),
    error: zod_1.z.object({
        code: zod_1.z.string(),
        message: zod_1.z.string(),
        category: zod_1.z.enum(['SYSTEM', 'GAME', 'AUDIO', 'OSZ', 'IPC', 'PHYSICS']),
        severity: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
        recoverable: zod_1.z.boolean(),
        details: zod_1.z.unknown().optional(),
    }).optional(),
    timestamp: zod_1.z.number(),
}).strict();
exports.GamePauseResponseSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    isPaused: zod_1.z.boolean(),
    pauseTime: PositiveNumber,
    error: zod_1.z.object({
        code: zod_1.z.string(),
        message: zod_1.z.string(),
        category: zod_1.z.enum(['SYSTEM', 'GAME', 'AUDIO', 'OSZ', 'IPC', 'PHYSICS']),
        severity: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
        recoverable: zod_1.z.boolean(),
        details: zod_1.z.unknown().optional(),
    }).optional(),
    timestamp: zod_1.z.number(),
}).strict();
exports.GameResumeResponseSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    isPaused: zod_1.z.boolean(),
    resumeTime: PositiveNumber,
    error: zod_1.z.object({
        code: zod_1.z.string(),
        message: zod_1.z.string(),
        category: zod_1.z.enum(['SYSTEM', 'GAME', 'AUDIO', 'OSZ', 'IPC', 'PHYSICS']),
        severity: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
        recoverable: zod_1.z.boolean(),
        details: zod_1.z.unknown().optional(),
    }).optional(),
    timestamp: zod_1.z.number(),
}).strict();
exports.KnifeThrowRequestSchema = zod_1.z.object({
    sessionId: SessionIdSchema,
    throwTime: PositiveNumber,
    inputLatency: PositiveNumber.optional(),
}).strict();
exports.KnifeThrowResponseSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    knifeId: NonEmptyString.optional(),
    serverTime: PositiveNumber.optional(),
    error: zod_1.z.object({
        code: zod_1.z.string(),
        message: zod_1.z.string(),
        category: zod_1.z.enum(['SYSTEM', 'GAME', 'AUDIO', 'OSZ', 'IPC', 'PHYSICS']),
        severity: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
        recoverable: zod_1.z.boolean(),
        details: zod_1.z.unknown().optional(),
    }).optional(),
    timestamp: zod_1.z.number(),
}).strict();
/**
 * OSZ API Request/Response schemas
 */
exports.OszImportRequestSchema = zod_1.z.object({
    filePath: NonEmptyString.optional(), // Optional for file dialog
}).strict();
exports.OszImportResponseSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    chartId: ChartIdSchema.optional(),
    metadata: zod_1.z.object({
        id: ChartIdSchema,
        title: NonEmptyString,
        artist: NonEmptyString,
        creator: NonEmptyString,
        source: zod_1.z.string().optional(),
        tags: zod_1.z.array(zod_1.z.string()).default([]),
        bpm: PositiveNumber,
        duration: PositiveNumber,
        gameMode: zod_1.z.enum(['osu', 'taiko', 'fruits', 'mania']).default('osu'),
        difficulties: zod_1.z.array(zod_1.z.object({
            version: NonEmptyString,
            starRating: NonNegativeNumber.default(0),
            overallDifficulty: BoundedNumber(0, 10),
            approachRate: BoundedNumber(0, 10),
            circleSize: BoundedNumber(0, 10),
            hpDrainRate: BoundedNumber(0, 10),
            maxCombo: NonNegativeNumber.default(0),
            objectCount: NonNegativeNumber.default(0),
        })).min(1),
        backgroundImage: zod_1.z.string().optional(),
        previewTime: NonNegativeNumber.optional(),
        audioFilename: NonEmptyString,
        createdAt: zod_1.z.date().default(() => new Date()),
        updatedAt: zod_1.z.date().default(() => new Date()),
    }).optional(),
    importedFiles: zod_1.z.array(zod_1.z.string()).default([]),
    error: zod_1.z.object({
        code: zod_1.z.string(),
        message: zod_1.z.string(),
        category: zod_1.z.enum(['SYSTEM', 'GAME', 'AUDIO', 'OSZ', 'IPC', 'PHYSICS']),
        severity: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
        recoverable: zod_1.z.boolean(),
        details: zod_1.z.unknown().optional(),
    }).optional(),
    timestamp: zod_1.z.number(),
}).strict();
exports.OszLibraryResponseSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    charts: zod_1.z.array(zod_1.z.object({
        id: ChartIdSchema,
        title: NonEmptyString,
        artist: NonEmptyString,
        creator: NonEmptyString,
        source: zod_1.z.string().optional(),
        tags: zod_1.z.array(zod_1.z.string()).default([]),
        bpm: PositiveNumber,
        duration: PositiveNumber,
        gameMode: zod_1.z.enum(['osu', 'taiko', 'fruits', 'mania']).default('osu'),
        difficulties: zod_1.z.array(zod_1.z.object({
            version: NonEmptyString,
            starRating: NonNegativeNumber.default(0),
            overallDifficulty: BoundedNumber(0, 10),
            approachRate: BoundedNumber(0, 10),
            circleSize: BoundedNumber(0, 10),
            hpDrainRate: BoundedNumber(0, 10),
            maxCombo: NonNegativeNumber.default(0),
            objectCount: NonNegativeNumber.default(0),
        })).min(1),
        backgroundImage: zod_1.z.string().optional(),
        previewTime: NonNegativeNumber.optional(),
        audioFilename: NonEmptyString,
        createdAt: zod_1.z.date().default(() => new Date()),
        updatedAt: zod_1.z.date().default(() => new Date()),
    })).default([]),
    totalCount: NonNegativeNumber,
    error: zod_1.z.object({
        code: zod_1.z.string(),
        message: zod_1.z.string(),
        category: zod_1.z.enum(['SYSTEM', 'GAME', 'AUDIO', 'OSZ', 'IPC', 'PHYSICS']),
        severity: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
        recoverable: zod_1.z.boolean(),
        details: zod_1.z.unknown().optional(),
    }).optional(),
    timestamp: zod_1.z.number(),
}).strict();
exports.OszRemoveRequestSchema = zod_1.z.object({
    chartId: ChartIdSchema,
}).strict();
exports.OszRemoveResponseSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    removedFiles: zod_1.z.array(zod_1.z.string()).default([]),
    error: zod_1.z.object({
        code: zod_1.z.string(),
        message: zod_1.z.string(),
        category: zod_1.z.enum(['SYSTEM', 'GAME', 'AUDIO', 'OSZ', 'IPC', 'PHYSICS']),
        severity: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
        recoverable: zod_1.z.boolean(),
        details: zod_1.z.unknown().optional(),
    }).optional(),
    timestamp: zod_1.z.number(),
}).strict();
exports.AudioDataRequestSchema = zod_1.z.object({
    chartId: ChartIdSchema,
}).strict();
exports.AudioDataResponseSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    audioData: zod_1.z.instanceof(ArrayBuffer).optional(),
    format: zod_1.z.object({
        sampleRate: PositiveNumber,
        channels: zod_1.z.number().int().min(1).max(8),
        bitDepth: zod_1.z.union([zod_1.z.literal(16), zod_1.z.literal(24), zod_1.z.literal(32)]),
        codec: zod_1.z.enum(['mp3', 'wav', 'ogg', 'm4a']),
        duration: PositiveNumber,
        bitrate: PositiveNumber.optional(),
    }).optional(),
    error: zod_1.z.object({
        code: zod_1.z.string(),
        message: zod_1.z.string(),
        category: zod_1.z.enum(['SYSTEM', 'GAME', 'AUDIO', 'OSZ', 'IPC', 'PHYSICS']),
        severity: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
        recoverable: zod_1.z.boolean(),
        details: zod_1.z.unknown().optional(),
    }).optional(),
    timestamp: zod_1.z.number(),
}).strict();
exports.ChartDataRequestSchema = zod_1.z.object({
    chartId: ChartIdSchema,
    difficulty: NonEmptyString.optional(),
}).strict();
exports.ChartDataResponseSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    chartData: zod_1.z.unknown().optional(), // Will be typed more specifically later
    difficulty: zod_1.z.object({
        version: NonEmptyString,
        overallDifficulty: BoundedNumber(0, 10),
        approachRate: BoundedNumber(0, 10),
        circleSize: BoundedNumber(0, 10),
        hpDrainRate: BoundedNumber(0, 10),
        sliderMultiplier: PositiveNumber,
        sliderTickRate: PositiveNumber,
        stackLeniency: BoundedNumber(0, 1),
    }).optional(),
    error: zod_1.z.object({
        code: zod_1.z.string(),
        message: zod_1.z.string(),
        category: zod_1.z.enum(['SYSTEM', 'GAME', 'AUDIO', 'OSZ', 'IPC', 'PHYSICS']),
        severity: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
        recoverable: zod_1.z.boolean(),
        details: zod_1.z.unknown().optional(),
    }).optional(),
    timestamp: zod_1.z.number(),
}).strict();
/**
 * Settings API Request/Response schemas
 */
exports.SettingsGetAllResponseSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    settings: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()).optional(),
    error: zod_1.z.object({
        code: zod_1.z.string(),
        message: zod_1.z.string(),
        category: zod_1.z.enum(['SYSTEM', 'GAME', 'AUDIO', 'OSZ', 'IPC', 'PHYSICS']),
        severity: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
        recoverable: zod_1.z.boolean(),
        details: zod_1.z.unknown().optional(),
    }).optional(),
    timestamp: zod_1.z.number(),
}).strict();
exports.SettingsGetRequestSchema = zod_1.z.object({
    key: NonEmptyString,
}).strict();
exports.SettingsGetResponseSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    value: zod_1.z.unknown().optional(),
    error: zod_1.z.object({
        code: zod_1.z.string(),
        message: zod_1.z.string(),
        category: zod_1.z.enum(['SYSTEM', 'GAME', 'AUDIO', 'OSZ', 'IPC', 'PHYSICS']),
        severity: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
        recoverable: zod_1.z.boolean(),
        details: zod_1.z.unknown().optional(),
    }).optional(),
    timestamp: zod_1.z.number(),
}).strict();
exports.SettingsSetRequestSchema = zod_1.z.object({
    key: NonEmptyString,
    value: zod_1.z.unknown(),
}).strict();
exports.SettingsSetResponseSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    oldValue: zod_1.z.unknown().optional(),
    newValue: zod_1.z.unknown().optional(),
    error: zod_1.z.object({
        code: zod_1.z.string(),
        message: zod_1.z.string(),
        category: zod_1.z.enum(['SYSTEM', 'GAME', 'AUDIO', 'OSZ', 'IPC', 'PHYSICS']),
        severity: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
        recoverable: zod_1.z.boolean(),
        details: zod_1.z.unknown().optional(),
    }).optional(),
    timestamp: zod_1.z.number(),
}).strict();
exports.SettingsResetResponseSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    defaultSettings: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()).optional(),
    error: zod_1.z.object({
        code: zod_1.z.string(),
        message: zod_1.z.string(),
        category: zod_1.z.enum(['SYSTEM', 'GAME', 'AUDIO', 'OSZ', 'IPC', 'PHYSICS']),
        severity: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
        recoverable: zod_1.z.boolean(),
        details: zod_1.z.unknown().optional(),
    }).optional(),
    timestamp: zod_1.z.number(),
}).strict();
exports.SettingsExportResponseSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    exportPath: zod_1.z.string().optional(),
    error: zod_1.z.object({
        code: zod_1.z.string(),
        message: zod_1.z.string(),
        category: zod_1.z.enum(['SYSTEM', 'GAME', 'AUDIO', 'OSZ', 'IPC', 'PHYSICS']),
        severity: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
        recoverable: zod_1.z.boolean(),
        details: zod_1.z.unknown().optional(),
    }).optional(),
    timestamp: zod_1.z.number(),
}).strict();
exports.SettingsImportResponseSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    importedSettings: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()).optional(),
    error: zod_1.z.object({
        code: zod_1.z.string(),
        message: zod_1.z.string(),
        category: zod_1.z.enum(['SYSTEM', 'GAME', 'AUDIO', 'OSZ', 'IPC', 'PHYSICS']),
        severity: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
        recoverable: zod_1.z.boolean(),
        details: zod_1.z.unknown().optional(),
    }).optional(),
    timestamp: zod_1.z.number(),
}).strict();
/**
 * File API Request/Response schemas
 */
exports.FileDialogOptionsSchema = zod_1.z.object({
    title: zod_1.z.string().optional(),
    defaultPath: zod_1.z.string().optional(),
    filters: zod_1.z.array(zod_1.z.object({
        name: NonEmptyString,
        extensions: zod_1.z.array(NonEmptyString).min(1),
    })).optional(),
    properties: zod_1.z.array(zod_1.z.enum(['openFile', 'openDirectory', 'multiSelections'])).optional(),
}).strict();
exports.SaveDialogOptionsSchema = zod_1.z.object({
    title: zod_1.z.string().optional(),
    defaultPath: zod_1.z.string().optional(),
    filters: zod_1.z.array(zod_1.z.object({
        name: NonEmptyString,
        extensions: zod_1.z.array(NonEmptyString).min(1),
    })).optional(),
}).strict();
exports.FileDialogResponseSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    filePaths: zod_1.z.array(zod_1.z.string()).default([]),
    canceled: zod_1.z.boolean(),
    error: zod_1.z.object({
        code: zod_1.z.string(),
        message: zod_1.z.string(),
        category: zod_1.z.enum(['SYSTEM', 'GAME', 'AUDIO', 'OSZ', 'IPC', 'PHYSICS']),
        severity: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
        recoverable: zod_1.z.boolean(),
        details: zod_1.z.unknown().optional(),
    }).optional(),
    timestamp: zod_1.z.number(),
}).strict();
exports.OpenPathRequestSchema = zod_1.z.object({
    path: NonEmptyString,
}).strict();
exports.OpenPathResponseSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    opened: zod_1.z.boolean(),
    error: zod_1.z.object({
        code: zod_1.z.string(),
        message: zod_1.z.string(),
        category: zod_1.z.enum(['SYSTEM', 'GAME', 'AUDIO', 'OSZ', 'IPC', 'PHYSICS']),
        severity: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
        recoverable: zod_1.z.boolean(),
        details: zod_1.z.unknown().optional(),
    }).optional(),
    timestamp: zod_1.z.number(),
}).strict();
exports.ShowInFolderRequestSchema = zod_1.z.object({
    path: NonEmptyString,
}).strict();
exports.ShowInFolderResponseSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    shown: zod_1.z.boolean(),
    error: zod_1.z.object({
        code: zod_1.z.string(),
        message: zod_1.z.string(),
        category: zod_1.z.enum(['SYSTEM', 'GAME', 'AUDIO', 'OSZ', 'IPC', 'PHYSICS']),
        severity: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
        recoverable: zod_1.z.boolean(),
        details: zod_1.z.unknown().optional(),
    }).optional(),
    timestamp: zod_1.z.number(),
}).strict();
exports.ReadFileRequestSchema = zod_1.z.object({
    path: NonEmptyString,
}).strict();
exports.ReadFileResponseSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    data: zod_1.z.instanceof(Buffer).optional(),
    encoding: zod_1.z.string().optional(),
    error: zod_1.z.object({
        code: zod_1.z.string(),
        message: zod_1.z.string(),
        category: zod_1.z.enum(['SYSTEM', 'GAME', 'AUDIO', 'OSZ', 'IPC', 'PHYSICS']),
        severity: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
        recoverable: zod_1.z.boolean(),
        details: zod_1.z.unknown().optional(),
    }).optional(),
    timestamp: zod_1.z.number(),
}).strict();
exports.WriteFileRequestSchema = zod_1.z.object({
    path: NonEmptyString,
    data: zod_1.z.union([zod_1.z.instanceof(Buffer), zod_1.z.string()]),
}).strict();
exports.WriteFileResponseSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    bytesWritten: NonNegativeNumber.optional(),
    error: zod_1.z.object({
        code: zod_1.z.string(),
        message: zod_1.z.string(),
        category: zod_1.z.enum(['SYSTEM', 'GAME', 'AUDIO', 'OSZ', 'IPC', 'PHYSICS']),
        severity: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
        recoverable: zod_1.z.boolean(),
        details: zod_1.z.unknown().optional(),
    }).optional(),
    timestamp: zod_1.z.number(),
}).strict();
exports.DeleteFileRequestSchema = zod_1.z.object({
    path: NonEmptyString,
}).strict();
exports.DeleteFileResponseSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    deleted: zod_1.z.boolean(),
    error: zod_1.z.object({
        code: zod_1.z.string(),
        message: zod_1.z.string(),
        category: zod_1.z.enum(['SYSTEM', 'GAME', 'AUDIO', 'OSZ', 'IPC', 'PHYSICS']),
        severity: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
        recoverable: zod_1.z.boolean(),
        details: zod_1.z.unknown().optional(),
    }).optional(),
    timestamp: zod_1.z.number(),
}).strict();
/**
 * Event schemas
 */
exports.KnifeResultEventSchema = zod_1.z.object({
    knifeId: NonEmptyString,
    result: zod_1.z.enum(['hit', 'miss', 'collision']),
    timingError: zod_1.z.number(),
    accuracy: BoundedNumber(0, 100),
    score: NonNegativeNumber,
    combo: NonNegativeNumber,
}).strict();
exports.ScoreUpdateEventSchema = zod_1.z.object({
    sessionId: SessionIdSchema,
    totalScore: NonNegativeNumber,
    accuracy: BoundedNumber(0, 100),
    combo: NonNegativeNumber,
    maxCombo: NonNegativeNumber,
}).strict();
exports.ImportProgressEventSchema = zod_1.z.object({
    progress: BoundedNumber(0, 100),
    currentFile: NonEmptyString,
    totalFiles: PositiveNumber,
    processedFiles: NonNegativeNumber,
}).strict();
exports.LibraryChangeEventSchema = zod_1.z.object({
    action: zod_1.z.enum(['added', 'removed', 'updated']),
    chartId: ChartIdSchema,
    metadata: zod_1.z.object({
        id: ChartIdSchema,
        title: NonEmptyString,
        artist: NonEmptyString,
        creator: NonEmptyString,
        source: zod_1.z.string().optional(),
        tags: zod_1.z.array(zod_1.z.string()).default([]),
        bpm: PositiveNumber,
        duration: PositiveNumber,
        gameMode: zod_1.z.enum(['osu', 'taiko', 'fruits', 'mania']).default('osu'),
        difficulties: zod_1.z.array(zod_1.z.object({
            version: NonEmptyString,
            starRating: NonNegativeNumber.default(0),
            overallDifficulty: BoundedNumber(0, 10),
            approachRate: BoundedNumber(0, 10),
            circleSize: BoundedNumber(0, 10),
            hpDrainRate: BoundedNumber(0, 10),
            maxCombo: NonNegativeNumber.default(0),
            objectCount: NonNegativeNumber.default(0),
        })).min(1),
        backgroundImage: zod_1.z.string().optional(),
        previewTime: NonNegativeNumber.optional(),
        audioFilename: NonEmptyString,
        createdAt: zod_1.z.date().default(() => new Date()),
        updatedAt: zod_1.z.date().default(() => new Date()),
    }).optional(),
}).strict();
exports.SettingsChangeEventSchema = zod_1.z.object({
    key: NonEmptyString,
    oldValue: zod_1.z.unknown(),
    newValue: zod_1.z.unknown(),
    source: zod_1.z.enum(['user', 'import', 'reset']),
}).strict();
exports.SettingsResetEventSchema = zod_1.z.object({
    resetSettings: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()),
    previousSettings: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()),
}).strict();
/**
 * Export all IPC schemas
 */
exports.IpcSchemas = {
    // Game API
    GameStartRequest: exports.GameStartRequestSchema,
    GameStartResponse: exports.GameStartResponseSchema,
    GameStopResponse: exports.GameStopResponseSchema,
    GamePauseResponse: exports.GamePauseResponseSchema,
    GameResumeResponse: exports.GameResumeResponseSchema,
    KnifeThrowRequest: exports.KnifeThrowRequestSchema,
    KnifeThrowResponse: exports.KnifeThrowResponseSchema,
    // OSZ API
    OszImportRequest: exports.OszImportRequestSchema,
    OszImportResponse: exports.OszImportResponseSchema,
    OszLibraryResponse: exports.OszLibraryResponseSchema,
    OszRemoveRequest: exports.OszRemoveRequestSchema,
    OszRemoveResponse: exports.OszRemoveResponseSchema,
    AudioDataRequest: exports.AudioDataRequestSchema,
    AudioDataResponse: exports.AudioDataResponseSchema,
    ChartDataRequest: exports.ChartDataRequestSchema,
    ChartDataResponse: exports.ChartDataResponseSchema,
    // Settings API
    SettingsGetAllResponse: exports.SettingsGetAllResponseSchema,
    SettingsGetRequest: exports.SettingsGetRequestSchema,
    SettingsGetResponse: exports.SettingsGetResponseSchema,
    SettingsSetRequest: exports.SettingsSetRequestSchema,
    SettingsSetResponse: exports.SettingsSetResponseSchema,
    SettingsResetResponse: exports.SettingsResetResponseSchema,
    SettingsExportResponse: exports.SettingsExportResponseSchema,
    SettingsImportResponse: exports.SettingsImportResponseSchema,
    // File API
    FileDialogOptions: exports.FileDialogOptionsSchema,
    SaveDialogOptions: exports.SaveDialogOptionsSchema,
    FileDialogResponse: exports.FileDialogResponseSchema,
    OpenPathRequest: exports.OpenPathRequestSchema,
    OpenPathResponse: exports.OpenPathResponseSchema,
    ShowInFolderRequest: exports.ShowInFolderRequestSchema,
    ShowInFolderResponse: exports.ShowInFolderResponseSchema,
    ReadFileRequest: exports.ReadFileRequestSchema,
    ReadFileResponse: exports.ReadFileResponseSchema,
    WriteFileRequest: exports.WriteFileRequestSchema,
    WriteFileResponse: exports.WriteFileResponseSchema,
    DeleteFileRequest: exports.DeleteFileRequestSchema,
    DeleteFileResponse: exports.DeleteFileResponseSchema,
    // Events
    KnifeResultEvent: exports.KnifeResultEventSchema,
    ScoreUpdateEvent: exports.ScoreUpdateEventSchema,
    ImportProgressEvent: exports.ImportProgressEventSchema,
    LibraryChangeEvent: exports.LibraryChangeEventSchema,
    SettingsChangeEvent: exports.SettingsChangeEventSchema,
    SettingsResetEvent: exports.SettingsResetEventSchema,
    // Utilities
    GameModifiers: exports.GameModifiersSchema,
};
