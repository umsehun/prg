/**
 * Zod schemas for IPC communication validation
 * Type-safe validation for all Electron IPC messages
 */

import { z } from 'zod';

/**
 * Basic validation utilities
 */
const NonEmptyString = z.string().min(1).trim();
const PositiveNumber = z.number().positive();
const NonNegativeNumber = z.number().nonnegative();
const BoundedNumber = (min: number, max: number) => z.number().min(min).max(max);
const ChartIdSchema = NonEmptyString.brand<'ChartId'>();
const SessionIdSchema = NonEmptyString.brand<'SessionId'>();

/**
 * Game modifiers validation
 */
export const GameModifiersSchema = z.object({
    noFail: z.boolean().default(false),
    easy: z.boolean().default(false),
    hardRock: z.boolean().default(false),
    doubleTime: z.boolean().default(false),
    halfTime: z.boolean().default(false),
    hidden: z.boolean().default(false),
    flashlight: z.boolean().default(false),
    autoplay: z.boolean().default(false),
    relax: z.boolean().default(false),
    speedMultiplier: BoundedNumber(0.25, 4.0).default(1.0),
}).strict();

/**
 * Game API Request/Response schemas
 */
export const GameStartRequestSchema = z.object({
    chartId: ChartIdSchema,
    difficulty: NonEmptyString,
    modifiers: GameModifiersSchema.optional(),
}).strict();

export const GameStartResponseSchema = z.object({
    success: z.boolean(),
    sessionId: SessionIdSchema.optional(),
    chartData: z.unknown().optional(), // Will be typed more specifically later
    error: z.object({
        code: z.string(),
        message: z.string(),
        category: z.enum(['SYSTEM', 'GAME', 'AUDIO', 'OSZ', 'IPC', 'PHYSICS']),
        severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
        recoverable: z.boolean(),
        details: z.unknown().optional(),
    }).optional(),
    timestamp: z.number(),
}).strict();

export const GameStopResponseSchema = z.object({
    success: z.boolean(),
    finalScore: z.object({
        sessionId: SessionIdSchema,
        chartId: ChartIdSchema,
        difficulty: NonEmptyString,
        totalScore: NonNegativeNumber,
        accuracy: BoundedNumber(0, 100),
        maxCombo: NonNegativeNumber,
        judgmentCounts: z.record(z.enum(['KOOL', 'COOL', 'GOOD', 'MISS']), NonNegativeNumber),
        grade: z.enum(['SS', 'S', 'A', 'B', 'C', 'D', 'F']),
        modifiers: GameModifiersSchema,
        playTime: PositiveNumber,
        completedAt: z.date(),
    }).optional(),
    error: z.object({
        code: z.string(),
        message: z.string(),
        category: z.enum(['SYSTEM', 'GAME', 'AUDIO', 'OSZ', 'IPC', 'PHYSICS']),
        severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
        recoverable: z.boolean(),
        details: z.unknown().optional(),
    }).optional(),
    timestamp: z.number(),
}).strict();

export const GamePauseResponseSchema = z.object({
    success: z.boolean(),
    isPaused: z.boolean(),
    pauseTime: PositiveNumber,
    error: z.object({
        code: z.string(),
        message: z.string(),
        category: z.enum(['SYSTEM', 'GAME', 'AUDIO', 'OSZ', 'IPC', 'PHYSICS']),
        severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
        recoverable: z.boolean(),
        details: z.unknown().optional(),
    }).optional(),
    timestamp: z.number(),
}).strict();

export const GameResumeResponseSchema = z.object({
    success: z.boolean(),
    isPaused: z.boolean(),
    resumeTime: PositiveNumber,
    error: z.object({
        code: z.string(),
        message: z.string(),
        category: z.enum(['SYSTEM', 'GAME', 'AUDIO', 'OSZ', 'IPC', 'PHYSICS']),
        severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
        recoverable: z.boolean(),
        details: z.unknown().optional(),
    }).optional(),
    timestamp: z.number(),
}).strict();

export const KnifeThrowRequestSchema = z.object({
    sessionId: SessionIdSchema,
    throwTime: PositiveNumber,
    inputLatency: PositiveNumber.optional(),
}).strict();

export const KnifeThrowResponseSchema = z.object({
    success: z.boolean(),
    knifeId: NonEmptyString.optional(),
    serverTime: PositiveNumber.optional(),
    error: z.object({
        code: z.string(),
        message: z.string(),
        category: z.enum(['SYSTEM', 'GAME', 'AUDIO', 'OSZ', 'IPC', 'PHYSICS']),
        severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
        recoverable: z.boolean(),
        details: z.unknown().optional(),
    }).optional(),
    timestamp: z.number(),
}).strict();

/**
 * OSZ API Request/Response schemas
 */
export const OszImportRequestSchema = z.object({
    filePath: NonEmptyString.optional(), // Optional for file dialog
}).strict();

export const OszImportResponseSchema = z.object({
    success: z.boolean(),
    chartId: ChartIdSchema.optional(),
    metadata: z.object({
        id: ChartIdSchema,
        title: NonEmptyString,
        artist: NonEmptyString,
        creator: NonEmptyString,
        source: z.string().optional(),
        tags: z.array(z.string()).default([]),
        bpm: PositiveNumber,
        duration: PositiveNumber,
        gameMode: z.enum(['osu', 'taiko', 'fruits', 'mania']).default('osu'),
        difficulties: z.array(z.object({
            version: NonEmptyString,
            starRating: NonNegativeNumber.default(0),
            overallDifficulty: BoundedNumber(0, 10),
            approachRate: BoundedNumber(0, 10),
            circleSize: BoundedNumber(0, 10),
            hpDrainRate: BoundedNumber(0, 10),
            maxCombo: NonNegativeNumber.default(0),
            objectCount: NonNegativeNumber.default(0),
        })).min(1),
        backgroundImage: z.string().optional(),
        previewTime: NonNegativeNumber.optional(),
        audioFilename: NonEmptyString,
        createdAt: z.date().default(() => new Date()),
        updatedAt: z.date().default(() => new Date()),
    }).optional(),
    importedFiles: z.array(z.string()).default([]),
    error: z.object({
        code: z.string(),
        message: z.string(),
        category: z.enum(['SYSTEM', 'GAME', 'AUDIO', 'OSZ', 'IPC', 'PHYSICS']),
        severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
        recoverable: z.boolean(),
        details: z.unknown().optional(),
    }).optional(),
    timestamp: z.number(),
}).strict();

export const OszLibraryResponseSchema = z.object({
    success: z.boolean(),
    charts: z.array(z.object({
        id: ChartIdSchema,
        title: NonEmptyString,
        artist: NonEmptyString,
        creator: NonEmptyString,
        source: z.string().optional(),
        tags: z.array(z.string()).default([]),
        bpm: PositiveNumber,
        duration: PositiveNumber,
        gameMode: z.enum(['osu', 'taiko', 'fruits', 'mania']).default('osu'),
        difficulties: z.array(z.object({
            version: NonEmptyString,
            starRating: NonNegativeNumber.default(0),
            overallDifficulty: BoundedNumber(0, 10),
            approachRate: BoundedNumber(0, 10),
            circleSize: BoundedNumber(0, 10),
            hpDrainRate: BoundedNumber(0, 10),
            maxCombo: NonNegativeNumber.default(0),
            objectCount: NonNegativeNumber.default(0),
        })).min(1),
        backgroundImage: z.string().optional(),
        previewTime: NonNegativeNumber.optional(),
        audioFilename: NonEmptyString,
        createdAt: z.date().default(() => new Date()),
        updatedAt: z.date().default(() => new Date()),
    })).default([]),
    totalCount: NonNegativeNumber,
    error: z.object({
        code: z.string(),
        message: z.string(),
        category: z.enum(['SYSTEM', 'GAME', 'AUDIO', 'OSZ', 'IPC', 'PHYSICS']),
        severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
        recoverable: z.boolean(),
        details: z.unknown().optional(),
    }).optional(),
    timestamp: z.number(),
}).strict();

export const OszRemoveRequestSchema = z.object({
    chartId: ChartIdSchema,
}).strict();

export const OszRemoveResponseSchema = z.object({
    success: z.boolean(),
    removedFiles: z.array(z.string()).default([]),
    error: z.object({
        code: z.string(),
        message: z.string(),
        category: z.enum(['SYSTEM', 'GAME', 'AUDIO', 'OSZ', 'IPC', 'PHYSICS']),
        severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
        recoverable: z.boolean(),
        details: z.unknown().optional(),
    }).optional(),
    timestamp: z.number(),
}).strict();

export const AudioDataRequestSchema = z.object({
    chartId: ChartIdSchema,
}).strict();

export const AudioDataResponseSchema = z.object({
    success: z.boolean(),
    audioData: z.instanceof(ArrayBuffer).optional(),
    format: z.object({
        sampleRate: PositiveNumber,
        channels: z.number().int().min(1).max(8),
        bitDepth: z.union([z.literal(16), z.literal(24), z.literal(32)]),
        codec: z.enum(['mp3', 'wav', 'ogg', 'm4a']),
        duration: PositiveNumber,
        bitrate: PositiveNumber.optional(),
    }).optional(),
    error: z.object({
        code: z.string(),
        message: z.string(),
        category: z.enum(['SYSTEM', 'GAME', 'AUDIO', 'OSZ', 'IPC', 'PHYSICS']),
        severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
        recoverable: z.boolean(),
        details: z.unknown().optional(),
    }).optional(),
    timestamp: z.number(),
}).strict();

export const ChartDataRequestSchema = z.object({
    chartId: ChartIdSchema,
    difficulty: NonEmptyString.optional(),
}).strict();

export const ChartDataResponseSchema = z.object({
    success: z.boolean(),
    chartData: z.unknown().optional(), // Will be typed more specifically later
    difficulty: z.object({
        version: NonEmptyString,
        overallDifficulty: BoundedNumber(0, 10),
        approachRate: BoundedNumber(0, 10),
        circleSize: BoundedNumber(0, 10),
        hpDrainRate: BoundedNumber(0, 10),
        sliderMultiplier: PositiveNumber,
        sliderTickRate: PositiveNumber,
        stackLeniency: BoundedNumber(0, 1),
    }).optional(),
    error: z.object({
        code: z.string(),
        message: z.string(),
        category: z.enum(['SYSTEM', 'GAME', 'AUDIO', 'OSZ', 'IPC', 'PHYSICS']),
        severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
        recoverable: z.boolean(),
        details: z.unknown().optional(),
    }).optional(),
    timestamp: z.number(),
}).strict();

/**
 * Settings API Request/Response schemas
 */
export const SettingsGetAllResponseSchema = z.object({
    success: z.boolean(),
    settings: z.record(z.string(), z.unknown()).optional(),
    error: z.object({
        code: z.string(),
        message: z.string(),
        category: z.enum(['SYSTEM', 'GAME', 'AUDIO', 'OSZ', 'IPC', 'PHYSICS']),
        severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
        recoverable: z.boolean(),
        details: z.unknown().optional(),
    }).optional(),
    timestamp: z.number(),
}).strict();

export const SettingsGetRequestSchema = z.object({
    key: NonEmptyString,
}).strict();

export const SettingsGetResponseSchema = z.object({
    success: z.boolean(),
    value: z.unknown().optional(),
    error: z.object({
        code: z.string(),
        message: z.string(),
        category: z.enum(['SYSTEM', 'GAME', 'AUDIO', 'OSZ', 'IPC', 'PHYSICS']),
        severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
        recoverable: z.boolean(),
        details: z.unknown().optional(),
    }).optional(),
    timestamp: z.number(),
}).strict();

export const SettingsSetRequestSchema = z.object({
    key: NonEmptyString,
    value: z.unknown(),
}).strict();

export const SettingsSetResponseSchema = z.object({
    success: z.boolean(),
    oldValue: z.unknown().optional(),
    newValue: z.unknown().optional(),
    error: z.object({
        code: z.string(),
        message: z.string(),
        category: z.enum(['SYSTEM', 'GAME', 'AUDIO', 'OSZ', 'IPC', 'PHYSICS']),
        severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
        recoverable: z.boolean(),
        details: z.unknown().optional(),
    }).optional(),
    timestamp: z.number(),
}).strict();

export const SettingsResetResponseSchema = z.object({
    success: z.boolean(),
    defaultSettings: z.record(z.string(), z.unknown()).optional(),
    error: z.object({
        code: z.string(),
        message: z.string(),
        category: z.enum(['SYSTEM', 'GAME', 'AUDIO', 'OSZ', 'IPC', 'PHYSICS']),
        severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
        recoverable: z.boolean(),
        details: z.unknown().optional(),
    }).optional(),
    timestamp: z.number(),
}).strict();

export const SettingsExportResponseSchema = z.object({
    success: z.boolean(),
    exportPath: z.string().optional(),
    error: z.object({
        code: z.string(),
        message: z.string(),
        category: z.enum(['SYSTEM', 'GAME', 'AUDIO', 'OSZ', 'IPC', 'PHYSICS']),
        severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
        recoverable: z.boolean(),
        details: z.unknown().optional(),
    }).optional(),
    timestamp: z.number(),
}).strict();

export const SettingsImportResponseSchema = z.object({
    success: z.boolean(),
    importedSettings: z.record(z.string(), z.unknown()).optional(),
    error: z.object({
        code: z.string(),
        message: z.string(),
        category: z.enum(['SYSTEM', 'GAME', 'AUDIO', 'OSZ', 'IPC', 'PHYSICS']),
        severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
        recoverable: z.boolean(),
        details: z.unknown().optional(),
    }).optional(),
    timestamp: z.number(),
}).strict();

/**
 * File API Request/Response schemas
 */
export const FileDialogOptionsSchema = z.object({
    title: z.string().optional(),
    defaultPath: z.string().optional(),
    filters: z.array(z.object({
        name: NonEmptyString,
        extensions: z.array(NonEmptyString).min(1),
    })).optional(),
    properties: z.array(z.enum(['openFile', 'openDirectory', 'multiSelections'])).optional(),
}).strict();

export const SaveDialogOptionsSchema = z.object({
    title: z.string().optional(),
    defaultPath: z.string().optional(),
    filters: z.array(z.object({
        name: NonEmptyString,
        extensions: z.array(NonEmptyString).min(1),
    })).optional(),
}).strict();

export const FileDialogResponseSchema = z.object({
    success: z.boolean(),
    filePaths: z.array(z.string()).default([]),
    canceled: z.boolean(),
    error: z.object({
        code: z.string(),
        message: z.string(),
        category: z.enum(['SYSTEM', 'GAME', 'AUDIO', 'OSZ', 'IPC', 'PHYSICS']),
        severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
        recoverable: z.boolean(),
        details: z.unknown().optional(),
    }).optional(),
    timestamp: z.number(),
}).strict();

export const OpenPathRequestSchema = z.object({
    path: NonEmptyString,
}).strict();

export const OpenPathResponseSchema = z.object({
    success: z.boolean(),
    opened: z.boolean(),
    error: z.object({
        code: z.string(),
        message: z.string(),
        category: z.enum(['SYSTEM', 'GAME', 'AUDIO', 'OSZ', 'IPC', 'PHYSICS']),
        severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
        recoverable: z.boolean(),
        details: z.unknown().optional(),
    }).optional(),
    timestamp: z.number(),
}).strict();

export const ShowInFolderRequestSchema = z.object({
    path: NonEmptyString,
}).strict();

export const ShowInFolderResponseSchema = z.object({
    success: z.boolean(),
    shown: z.boolean(),
    error: z.object({
        code: z.string(),
        message: z.string(),
        category: z.enum(['SYSTEM', 'GAME', 'AUDIO', 'OSZ', 'IPC', 'PHYSICS']),
        severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
        recoverable: z.boolean(),
        details: z.unknown().optional(),
    }).optional(),
    timestamp: z.number(),
}).strict();

export const ReadFileRequestSchema = z.object({
    path: NonEmptyString,
}).strict();

export const ReadFileResponseSchema = z.object({
    success: z.boolean(),
    data: z.instanceof(Buffer).optional(),
    encoding: z.string().optional(),
    error: z.object({
        code: z.string(),
        message: z.string(),
        category: z.enum(['SYSTEM', 'GAME', 'AUDIO', 'OSZ', 'IPC', 'PHYSICS']),
        severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
        recoverable: z.boolean(),
        details: z.unknown().optional(),
    }).optional(),
    timestamp: z.number(),
}).strict();

export const WriteFileRequestSchema = z.object({
    path: NonEmptyString,
    data: z.union([z.instanceof(Buffer), z.string()]),
}).strict();

export const WriteFileResponseSchema = z.object({
    success: z.boolean(),
    bytesWritten: NonNegativeNumber.optional(),
    error: z.object({
        code: z.string(),
        message: z.string(),
        category: z.enum(['SYSTEM', 'GAME', 'AUDIO', 'OSZ', 'IPC', 'PHYSICS']),
        severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
        recoverable: z.boolean(),
        details: z.unknown().optional(),
    }).optional(),
    timestamp: z.number(),
}).strict();

export const DeleteFileRequestSchema = z.object({
    path: NonEmptyString,
}).strict();

export const DeleteFileResponseSchema = z.object({
    success: z.boolean(),
    deleted: z.boolean(),
    error: z.object({
        code: z.string(),
        message: z.string(),
        category: z.enum(['SYSTEM', 'GAME', 'AUDIO', 'OSZ', 'IPC', 'PHYSICS']),
        severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
        recoverable: z.boolean(),
        details: z.unknown().optional(),
    }).optional(),
    timestamp: z.number(),
}).strict();

/**
 * Event schemas
 */
export const KnifeResultEventSchema = z.object({
    knifeId: NonEmptyString,
    result: z.enum(['hit', 'miss', 'collision']),
    timingError: z.number(),
    accuracy: BoundedNumber(0, 100),
    score: NonNegativeNumber,
    combo: NonNegativeNumber,
}).strict();

export const ScoreUpdateEventSchema = z.object({
    sessionId: SessionIdSchema,
    totalScore: NonNegativeNumber,
    accuracy: BoundedNumber(0, 100),
    combo: NonNegativeNumber,
    maxCombo: NonNegativeNumber,
}).strict();

export const ImportProgressEventSchema = z.object({
    progress: BoundedNumber(0, 100),
    currentFile: NonEmptyString,
    totalFiles: PositiveNumber,
    processedFiles: NonNegativeNumber,
}).strict();

export const LibraryChangeEventSchema = z.object({
    action: z.enum(['added', 'removed', 'updated']),
    chartId: ChartIdSchema,
    metadata: z.object({
        id: ChartIdSchema,
        title: NonEmptyString,
        artist: NonEmptyString,
        creator: NonEmptyString,
        source: z.string().optional(),
        tags: z.array(z.string()).default([]),
        bpm: PositiveNumber,
        duration: PositiveNumber,
        gameMode: z.enum(['osu', 'taiko', 'fruits', 'mania']).default('osu'),
        difficulties: z.array(z.object({
            version: NonEmptyString,
            starRating: NonNegativeNumber.default(0),
            overallDifficulty: BoundedNumber(0, 10),
            approachRate: BoundedNumber(0, 10),
            circleSize: BoundedNumber(0, 10),
            hpDrainRate: BoundedNumber(0, 10),
            maxCombo: NonNegativeNumber.default(0),
            objectCount: NonNegativeNumber.default(0),
        })).min(1),
        backgroundImage: z.string().optional(),
        previewTime: NonNegativeNumber.optional(),
        audioFilename: NonEmptyString,
        createdAt: z.date().default(() => new Date()),
        updatedAt: z.date().default(() => new Date()),
    }).optional(),
}).strict();

export const SettingsChangeEventSchema = z.object({
    key: NonEmptyString,
    oldValue: z.unknown(),
    newValue: z.unknown(),
    source: z.enum(['user', 'import', 'reset']),
}).strict();

export const SettingsResetEventSchema = z.object({
    resetSettings: z.record(z.string(), z.unknown()),
    previousSettings: z.record(z.string(), z.unknown()),
}).strict();

/**
 * Export all IPC schemas
 */
export const IpcSchemas = {
    // Game API
    GameStartRequest: GameStartRequestSchema,
    GameStartResponse: GameStartResponseSchema,
    GameStopResponse: GameStopResponseSchema,
    GamePauseResponse: GamePauseResponseSchema,
    GameResumeResponse: GameResumeResponseSchema,
    KnifeThrowRequest: KnifeThrowRequestSchema,
    KnifeThrowResponse: KnifeThrowResponseSchema,

    // OSZ API
    OszImportRequest: OszImportRequestSchema,
    OszImportResponse: OszImportResponseSchema,
    OszLibraryResponse: OszLibraryResponseSchema,
    OszRemoveRequest: OszRemoveRequestSchema,
    OszRemoveResponse: OszRemoveResponseSchema,
    AudioDataRequest: AudioDataRequestSchema,
    AudioDataResponse: AudioDataResponseSchema,
    ChartDataRequest: ChartDataRequestSchema,
    ChartDataResponse: ChartDataResponseSchema,

    // Settings API
    SettingsGetAllResponse: SettingsGetAllResponseSchema,
    SettingsGetRequest: SettingsGetRequestSchema,
    SettingsGetResponse: SettingsGetResponseSchema,
    SettingsSetRequest: SettingsSetRequestSchema,
    SettingsSetResponse: SettingsSetResponseSchema,
    SettingsResetResponse: SettingsResetResponseSchema,
    SettingsExportResponse: SettingsExportResponseSchema,
    SettingsImportResponse: SettingsImportResponseSchema,

    // File API
    FileDialogOptions: FileDialogOptionsSchema,
    SaveDialogOptions: SaveDialogOptionsSchema,
    FileDialogResponse: FileDialogResponseSchema,
    OpenPathRequest: OpenPathRequestSchema,
    OpenPathResponse: OpenPathResponseSchema,
    ShowInFolderRequest: ShowInFolderRequestSchema,
    ShowInFolderResponse: ShowInFolderResponseSchema,
    ReadFileRequest: ReadFileRequestSchema,
    ReadFileResponse: ReadFileResponseSchema,
    WriteFileRequest: WriteFileRequestSchema,
    WriteFileResponse: WriteFileResponseSchema,
    DeleteFileRequest: DeleteFileRequestSchema,
    DeleteFileResponse: DeleteFileResponseSchema,

    // Events
    KnifeResultEvent: KnifeResultEventSchema,
    ScoreUpdateEvent: ScoreUpdateEventSchema,
    ImportProgressEvent: ImportProgressEventSchema,
    LibraryChangeEvent: LibraryChangeEventSchema,
    SettingsChangeEvent: SettingsChangeEventSchema,
    SettingsResetEvent: SettingsResetEventSchema,

    // Utilities
    GameModifiers: GameModifiersSchema,
} as const;

// Type exports for TypeScript
export type ValidatedGameStartRequest = z.infer<typeof GameStartRequestSchema>;
export type ValidatedGameStartResponse = z.infer<typeof GameStartResponseSchema>;
export type ValidatedOszImportRequest = z.infer<typeof OszImportRequestSchema>;
export type ValidatedOszImportResponse = z.infer<typeof OszImportResponseSchema>;
export type ValidatedKnifeThrowRequest = z.infer<typeof KnifeThrowRequestSchema>;
export type ValidatedKnifeResultEvent = z.infer<typeof KnifeResultEventSchema>;
export type ValidatedGameModifiers = z.infer<typeof GameModifiersSchema>;
