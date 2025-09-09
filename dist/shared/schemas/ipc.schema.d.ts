/**
 * Zod schemas for IPC communication validation
 * Type-safe validation for all Electron IPC messages
 */
import { z } from 'zod';
/**
 * Game modifiers validation
 */
export declare const GameModifiersSchema: z.ZodObject<{
    noFail: z.ZodDefault<z.ZodBoolean>;
    easy: z.ZodDefault<z.ZodBoolean>;
    hardRock: z.ZodDefault<z.ZodBoolean>;
    doubleTime: z.ZodDefault<z.ZodBoolean>;
    halfTime: z.ZodDefault<z.ZodBoolean>;
    hidden: z.ZodDefault<z.ZodBoolean>;
    flashlight: z.ZodDefault<z.ZodBoolean>;
    autoplay: z.ZodDefault<z.ZodBoolean>;
    relax: z.ZodDefault<z.ZodBoolean>;
    speedMultiplier: z.ZodDefault<z.ZodNumber>;
}, z.core.$strict>;
/**
 * Game API Request/Response schemas
 */
export declare const GameStartRequestSchema: z.ZodObject<{
    chartId: z.core.$ZodBranded<z.ZodString, "ChartId">;
    difficulty: z.ZodString;
    modifiers: z.ZodOptional<z.ZodObject<{
        noFail: z.ZodDefault<z.ZodBoolean>;
        easy: z.ZodDefault<z.ZodBoolean>;
        hardRock: z.ZodDefault<z.ZodBoolean>;
        doubleTime: z.ZodDefault<z.ZodBoolean>;
        halfTime: z.ZodDefault<z.ZodBoolean>;
        hidden: z.ZodDefault<z.ZodBoolean>;
        flashlight: z.ZodDefault<z.ZodBoolean>;
        autoplay: z.ZodDefault<z.ZodBoolean>;
        relax: z.ZodDefault<z.ZodBoolean>;
        speedMultiplier: z.ZodDefault<z.ZodNumber>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export declare const GameStartResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    sessionId: z.ZodOptional<z.core.$ZodBranded<z.ZodString, "SessionId">>;
    chartData: z.ZodOptional<z.ZodUnknown>;
    error: z.ZodOptional<z.ZodObject<{
        code: z.ZodString;
        message: z.ZodString;
        category: z.ZodEnum<{
            GAME: "GAME";
            AUDIO: "AUDIO";
            PHYSICS: "PHYSICS";
            IPC: "IPC";
            OSZ: "OSZ";
            SYSTEM: "SYSTEM";
        }>;
        severity: z.ZodEnum<{
            LOW: "LOW";
            MEDIUM: "MEDIUM";
            HIGH: "HIGH";
            CRITICAL: "CRITICAL";
        }>;
        recoverable: z.ZodBoolean;
        details: z.ZodOptional<z.ZodUnknown>;
    }, z.core.$strip>>;
    timestamp: z.ZodNumber;
}, z.core.$strict>;
export declare const GameStopResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    finalScore: z.ZodOptional<z.ZodObject<{
        sessionId: z.core.$ZodBranded<z.ZodString, "SessionId">;
        chartId: z.core.$ZodBranded<z.ZodString, "ChartId">;
        difficulty: z.ZodString;
        totalScore: z.ZodNumber;
        accuracy: z.ZodNumber;
        maxCombo: z.ZodNumber;
        judgmentCounts: z.ZodRecord<z.ZodEnum<{
            KOOL: "KOOL";
            COOL: "COOL";
            GOOD: "GOOD";
            MISS: "MISS";
        }>, z.ZodNumber>;
        grade: z.ZodEnum<{
            D: "D";
            F: "F";
            B: "B";
            C: "C";
            SS: "SS";
            S: "S";
            A: "A";
        }>;
        modifiers: z.ZodObject<{
            noFail: z.ZodDefault<z.ZodBoolean>;
            easy: z.ZodDefault<z.ZodBoolean>;
            hardRock: z.ZodDefault<z.ZodBoolean>;
            doubleTime: z.ZodDefault<z.ZodBoolean>;
            halfTime: z.ZodDefault<z.ZodBoolean>;
            hidden: z.ZodDefault<z.ZodBoolean>;
            flashlight: z.ZodDefault<z.ZodBoolean>;
            autoplay: z.ZodDefault<z.ZodBoolean>;
            relax: z.ZodDefault<z.ZodBoolean>;
            speedMultiplier: z.ZodDefault<z.ZodNumber>;
        }, z.core.$strict>;
        playTime: z.ZodNumber;
        completedAt: z.ZodDate;
    }, z.core.$strip>>;
    error: z.ZodOptional<z.ZodObject<{
        code: z.ZodString;
        message: z.ZodString;
        category: z.ZodEnum<{
            GAME: "GAME";
            AUDIO: "AUDIO";
            PHYSICS: "PHYSICS";
            IPC: "IPC";
            OSZ: "OSZ";
            SYSTEM: "SYSTEM";
        }>;
        severity: z.ZodEnum<{
            LOW: "LOW";
            MEDIUM: "MEDIUM";
            HIGH: "HIGH";
            CRITICAL: "CRITICAL";
        }>;
        recoverable: z.ZodBoolean;
        details: z.ZodOptional<z.ZodUnknown>;
    }, z.core.$strip>>;
    timestamp: z.ZodNumber;
}, z.core.$strict>;
export declare const GamePauseResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    isPaused: z.ZodBoolean;
    pauseTime: z.ZodNumber;
    error: z.ZodOptional<z.ZodObject<{
        code: z.ZodString;
        message: z.ZodString;
        category: z.ZodEnum<{
            GAME: "GAME";
            AUDIO: "AUDIO";
            PHYSICS: "PHYSICS";
            IPC: "IPC";
            OSZ: "OSZ";
            SYSTEM: "SYSTEM";
        }>;
        severity: z.ZodEnum<{
            LOW: "LOW";
            MEDIUM: "MEDIUM";
            HIGH: "HIGH";
            CRITICAL: "CRITICAL";
        }>;
        recoverable: z.ZodBoolean;
        details: z.ZodOptional<z.ZodUnknown>;
    }, z.core.$strip>>;
    timestamp: z.ZodNumber;
}, z.core.$strict>;
export declare const GameResumeResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    isPaused: z.ZodBoolean;
    resumeTime: z.ZodNumber;
    error: z.ZodOptional<z.ZodObject<{
        code: z.ZodString;
        message: z.ZodString;
        category: z.ZodEnum<{
            GAME: "GAME";
            AUDIO: "AUDIO";
            PHYSICS: "PHYSICS";
            IPC: "IPC";
            OSZ: "OSZ";
            SYSTEM: "SYSTEM";
        }>;
        severity: z.ZodEnum<{
            LOW: "LOW";
            MEDIUM: "MEDIUM";
            HIGH: "HIGH";
            CRITICAL: "CRITICAL";
        }>;
        recoverable: z.ZodBoolean;
        details: z.ZodOptional<z.ZodUnknown>;
    }, z.core.$strip>>;
    timestamp: z.ZodNumber;
}, z.core.$strict>;
export declare const KnifeThrowRequestSchema: z.ZodObject<{
    sessionId: z.core.$ZodBranded<z.ZodString, "SessionId">;
    throwTime: z.ZodNumber;
    inputLatency: z.ZodOptional<z.ZodNumber>;
}, z.core.$strict>;
export declare const KnifeThrowResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    knifeId: z.ZodOptional<z.ZodString>;
    serverTime: z.ZodOptional<z.ZodNumber>;
    error: z.ZodOptional<z.ZodObject<{
        code: z.ZodString;
        message: z.ZodString;
        category: z.ZodEnum<{
            GAME: "GAME";
            AUDIO: "AUDIO";
            PHYSICS: "PHYSICS";
            IPC: "IPC";
            OSZ: "OSZ";
            SYSTEM: "SYSTEM";
        }>;
        severity: z.ZodEnum<{
            LOW: "LOW";
            MEDIUM: "MEDIUM";
            HIGH: "HIGH";
            CRITICAL: "CRITICAL";
        }>;
        recoverable: z.ZodBoolean;
        details: z.ZodOptional<z.ZodUnknown>;
    }, z.core.$strip>>;
    timestamp: z.ZodNumber;
}, z.core.$strict>;
/**
 * OSZ API Request/Response schemas
 */
export declare const OszImportRequestSchema: z.ZodObject<{
    filePath: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export declare const OszImportResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    chartId: z.ZodOptional<z.core.$ZodBranded<z.ZodString, "ChartId">>;
    metadata: z.ZodOptional<z.ZodObject<{
        id: z.core.$ZodBranded<z.ZodString, "ChartId">;
        title: z.ZodString;
        artist: z.ZodString;
        creator: z.ZodString;
        source: z.ZodOptional<z.ZodString>;
        tags: z.ZodDefault<z.ZodArray<z.ZodString>>;
        bpm: z.ZodNumber;
        duration: z.ZodNumber;
        gameMode: z.ZodDefault<z.ZodEnum<{
            osu: "osu";
            taiko: "taiko";
            fruits: "fruits";
            mania: "mania";
        }>>;
        difficulties: z.ZodArray<z.ZodObject<{
            version: z.ZodString;
            starRating: z.ZodDefault<z.ZodNumber>;
            overallDifficulty: z.ZodNumber;
            approachRate: z.ZodNumber;
            circleSize: z.ZodNumber;
            hpDrainRate: z.ZodNumber;
            maxCombo: z.ZodDefault<z.ZodNumber>;
            objectCount: z.ZodDefault<z.ZodNumber>;
        }, z.core.$strip>>;
        backgroundImage: z.ZodOptional<z.ZodString>;
        previewTime: z.ZodOptional<z.ZodNumber>;
        audioFilename: z.ZodString;
        createdAt: z.ZodDefault<z.ZodDate>;
        updatedAt: z.ZodDefault<z.ZodDate>;
    }, z.core.$strip>>;
    importedFiles: z.ZodDefault<z.ZodArray<z.ZodString>>;
    error: z.ZodOptional<z.ZodObject<{
        code: z.ZodString;
        message: z.ZodString;
        category: z.ZodEnum<{
            GAME: "GAME";
            AUDIO: "AUDIO";
            PHYSICS: "PHYSICS";
            IPC: "IPC";
            OSZ: "OSZ";
            SYSTEM: "SYSTEM";
        }>;
        severity: z.ZodEnum<{
            LOW: "LOW";
            MEDIUM: "MEDIUM";
            HIGH: "HIGH";
            CRITICAL: "CRITICAL";
        }>;
        recoverable: z.ZodBoolean;
        details: z.ZodOptional<z.ZodUnknown>;
    }, z.core.$strip>>;
    timestamp: z.ZodNumber;
}, z.core.$strict>;
export declare const OszLibraryResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    charts: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.core.$ZodBranded<z.ZodString, "ChartId">;
        title: z.ZodString;
        artist: z.ZodString;
        creator: z.ZodString;
        source: z.ZodOptional<z.ZodString>;
        tags: z.ZodDefault<z.ZodArray<z.ZodString>>;
        bpm: z.ZodNumber;
        duration: z.ZodNumber;
        gameMode: z.ZodDefault<z.ZodEnum<{
            osu: "osu";
            taiko: "taiko";
            fruits: "fruits";
            mania: "mania";
        }>>;
        difficulties: z.ZodArray<z.ZodObject<{
            version: z.ZodString;
            starRating: z.ZodDefault<z.ZodNumber>;
            overallDifficulty: z.ZodNumber;
            approachRate: z.ZodNumber;
            circleSize: z.ZodNumber;
            hpDrainRate: z.ZodNumber;
            maxCombo: z.ZodDefault<z.ZodNumber>;
            objectCount: z.ZodDefault<z.ZodNumber>;
        }, z.core.$strip>>;
        backgroundImage: z.ZodOptional<z.ZodString>;
        previewTime: z.ZodOptional<z.ZodNumber>;
        audioFilename: z.ZodString;
        createdAt: z.ZodDefault<z.ZodDate>;
        updatedAt: z.ZodDefault<z.ZodDate>;
    }, z.core.$strip>>>;
    totalCount: z.ZodNumber;
    error: z.ZodOptional<z.ZodObject<{
        code: z.ZodString;
        message: z.ZodString;
        category: z.ZodEnum<{
            GAME: "GAME";
            AUDIO: "AUDIO";
            PHYSICS: "PHYSICS";
            IPC: "IPC";
            OSZ: "OSZ";
            SYSTEM: "SYSTEM";
        }>;
        severity: z.ZodEnum<{
            LOW: "LOW";
            MEDIUM: "MEDIUM";
            HIGH: "HIGH";
            CRITICAL: "CRITICAL";
        }>;
        recoverable: z.ZodBoolean;
        details: z.ZodOptional<z.ZodUnknown>;
    }, z.core.$strip>>;
    timestamp: z.ZodNumber;
}, z.core.$strict>;
export declare const OszRemoveRequestSchema: z.ZodObject<{
    chartId: z.core.$ZodBranded<z.ZodString, "ChartId">;
}, z.core.$strict>;
export declare const OszRemoveResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    removedFiles: z.ZodDefault<z.ZodArray<z.ZodString>>;
    error: z.ZodOptional<z.ZodObject<{
        code: z.ZodString;
        message: z.ZodString;
        category: z.ZodEnum<{
            GAME: "GAME";
            AUDIO: "AUDIO";
            PHYSICS: "PHYSICS";
            IPC: "IPC";
            OSZ: "OSZ";
            SYSTEM: "SYSTEM";
        }>;
        severity: z.ZodEnum<{
            LOW: "LOW";
            MEDIUM: "MEDIUM";
            HIGH: "HIGH";
            CRITICAL: "CRITICAL";
        }>;
        recoverable: z.ZodBoolean;
        details: z.ZodOptional<z.ZodUnknown>;
    }, z.core.$strip>>;
    timestamp: z.ZodNumber;
}, z.core.$strict>;
export declare const AudioDataRequestSchema: z.ZodObject<{
    chartId: z.core.$ZodBranded<z.ZodString, "ChartId">;
}, z.core.$strict>;
export declare const AudioDataResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    audioData: z.ZodOptional<z.ZodCustom<ArrayBuffer, ArrayBuffer>>;
    format: z.ZodOptional<z.ZodObject<{
        sampleRate: z.ZodNumber;
        channels: z.ZodNumber;
        bitDepth: z.ZodUnion<readonly [z.ZodLiteral<16>, z.ZodLiteral<24>, z.ZodLiteral<32>]>;
        codec: z.ZodEnum<{
            mp3: "mp3";
            wav: "wav";
            ogg: "ogg";
            m4a: "m4a";
        }>;
        duration: z.ZodNumber;
        bitrate: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>>;
    error: z.ZodOptional<z.ZodObject<{
        code: z.ZodString;
        message: z.ZodString;
        category: z.ZodEnum<{
            GAME: "GAME";
            AUDIO: "AUDIO";
            PHYSICS: "PHYSICS";
            IPC: "IPC";
            OSZ: "OSZ";
            SYSTEM: "SYSTEM";
        }>;
        severity: z.ZodEnum<{
            LOW: "LOW";
            MEDIUM: "MEDIUM";
            HIGH: "HIGH";
            CRITICAL: "CRITICAL";
        }>;
        recoverable: z.ZodBoolean;
        details: z.ZodOptional<z.ZodUnknown>;
    }, z.core.$strip>>;
    timestamp: z.ZodNumber;
}, z.core.$strict>;
export declare const ChartDataRequestSchema: z.ZodObject<{
    chartId: z.core.$ZodBranded<z.ZodString, "ChartId">;
    difficulty: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export declare const ChartDataResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    chartData: z.ZodOptional<z.ZodUnknown>;
    difficulty: z.ZodOptional<z.ZodObject<{
        version: z.ZodString;
        overallDifficulty: z.ZodNumber;
        approachRate: z.ZodNumber;
        circleSize: z.ZodNumber;
        hpDrainRate: z.ZodNumber;
        sliderMultiplier: z.ZodNumber;
        sliderTickRate: z.ZodNumber;
        stackLeniency: z.ZodNumber;
    }, z.core.$strip>>;
    error: z.ZodOptional<z.ZodObject<{
        code: z.ZodString;
        message: z.ZodString;
        category: z.ZodEnum<{
            GAME: "GAME";
            AUDIO: "AUDIO";
            PHYSICS: "PHYSICS";
            IPC: "IPC";
            OSZ: "OSZ";
            SYSTEM: "SYSTEM";
        }>;
        severity: z.ZodEnum<{
            LOW: "LOW";
            MEDIUM: "MEDIUM";
            HIGH: "HIGH";
            CRITICAL: "CRITICAL";
        }>;
        recoverable: z.ZodBoolean;
        details: z.ZodOptional<z.ZodUnknown>;
    }, z.core.$strip>>;
    timestamp: z.ZodNumber;
}, z.core.$strict>;
/**
 * Settings API Request/Response schemas
 */
export declare const SettingsGetAllResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    settings: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    error: z.ZodOptional<z.ZodObject<{
        code: z.ZodString;
        message: z.ZodString;
        category: z.ZodEnum<{
            GAME: "GAME";
            AUDIO: "AUDIO";
            PHYSICS: "PHYSICS";
            IPC: "IPC";
            OSZ: "OSZ";
            SYSTEM: "SYSTEM";
        }>;
        severity: z.ZodEnum<{
            LOW: "LOW";
            MEDIUM: "MEDIUM";
            HIGH: "HIGH";
            CRITICAL: "CRITICAL";
        }>;
        recoverable: z.ZodBoolean;
        details: z.ZodOptional<z.ZodUnknown>;
    }, z.core.$strip>>;
    timestamp: z.ZodNumber;
}, z.core.$strict>;
export declare const SettingsGetRequestSchema: z.ZodObject<{
    key: z.ZodString;
}, z.core.$strict>;
export declare const SettingsGetResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    value: z.ZodOptional<z.ZodUnknown>;
    error: z.ZodOptional<z.ZodObject<{
        code: z.ZodString;
        message: z.ZodString;
        category: z.ZodEnum<{
            GAME: "GAME";
            AUDIO: "AUDIO";
            PHYSICS: "PHYSICS";
            IPC: "IPC";
            OSZ: "OSZ";
            SYSTEM: "SYSTEM";
        }>;
        severity: z.ZodEnum<{
            LOW: "LOW";
            MEDIUM: "MEDIUM";
            HIGH: "HIGH";
            CRITICAL: "CRITICAL";
        }>;
        recoverable: z.ZodBoolean;
        details: z.ZodOptional<z.ZodUnknown>;
    }, z.core.$strip>>;
    timestamp: z.ZodNumber;
}, z.core.$strict>;
export declare const SettingsSetRequestSchema: z.ZodObject<{
    key: z.ZodString;
    value: z.ZodUnknown;
}, z.core.$strict>;
export declare const SettingsSetResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    oldValue: z.ZodOptional<z.ZodUnknown>;
    newValue: z.ZodOptional<z.ZodUnknown>;
    error: z.ZodOptional<z.ZodObject<{
        code: z.ZodString;
        message: z.ZodString;
        category: z.ZodEnum<{
            GAME: "GAME";
            AUDIO: "AUDIO";
            PHYSICS: "PHYSICS";
            IPC: "IPC";
            OSZ: "OSZ";
            SYSTEM: "SYSTEM";
        }>;
        severity: z.ZodEnum<{
            LOW: "LOW";
            MEDIUM: "MEDIUM";
            HIGH: "HIGH";
            CRITICAL: "CRITICAL";
        }>;
        recoverable: z.ZodBoolean;
        details: z.ZodOptional<z.ZodUnknown>;
    }, z.core.$strip>>;
    timestamp: z.ZodNumber;
}, z.core.$strict>;
export declare const SettingsResetResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    defaultSettings: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    error: z.ZodOptional<z.ZodObject<{
        code: z.ZodString;
        message: z.ZodString;
        category: z.ZodEnum<{
            GAME: "GAME";
            AUDIO: "AUDIO";
            PHYSICS: "PHYSICS";
            IPC: "IPC";
            OSZ: "OSZ";
            SYSTEM: "SYSTEM";
        }>;
        severity: z.ZodEnum<{
            LOW: "LOW";
            MEDIUM: "MEDIUM";
            HIGH: "HIGH";
            CRITICAL: "CRITICAL";
        }>;
        recoverable: z.ZodBoolean;
        details: z.ZodOptional<z.ZodUnknown>;
    }, z.core.$strip>>;
    timestamp: z.ZodNumber;
}, z.core.$strict>;
export declare const SettingsExportResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    exportPath: z.ZodOptional<z.ZodString>;
    error: z.ZodOptional<z.ZodObject<{
        code: z.ZodString;
        message: z.ZodString;
        category: z.ZodEnum<{
            GAME: "GAME";
            AUDIO: "AUDIO";
            PHYSICS: "PHYSICS";
            IPC: "IPC";
            OSZ: "OSZ";
            SYSTEM: "SYSTEM";
        }>;
        severity: z.ZodEnum<{
            LOW: "LOW";
            MEDIUM: "MEDIUM";
            HIGH: "HIGH";
            CRITICAL: "CRITICAL";
        }>;
        recoverable: z.ZodBoolean;
        details: z.ZodOptional<z.ZodUnknown>;
    }, z.core.$strip>>;
    timestamp: z.ZodNumber;
}, z.core.$strict>;
export declare const SettingsImportResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    importedSettings: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    error: z.ZodOptional<z.ZodObject<{
        code: z.ZodString;
        message: z.ZodString;
        category: z.ZodEnum<{
            GAME: "GAME";
            AUDIO: "AUDIO";
            PHYSICS: "PHYSICS";
            IPC: "IPC";
            OSZ: "OSZ";
            SYSTEM: "SYSTEM";
        }>;
        severity: z.ZodEnum<{
            LOW: "LOW";
            MEDIUM: "MEDIUM";
            HIGH: "HIGH";
            CRITICAL: "CRITICAL";
        }>;
        recoverable: z.ZodBoolean;
        details: z.ZodOptional<z.ZodUnknown>;
    }, z.core.$strip>>;
    timestamp: z.ZodNumber;
}, z.core.$strict>;
/**
 * File API Request/Response schemas
 */
export declare const FileDialogOptionsSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    defaultPath: z.ZodOptional<z.ZodString>;
    filters: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        extensions: z.ZodArray<z.ZodString>;
    }, z.core.$strip>>>;
    properties: z.ZodOptional<z.ZodArray<z.ZodEnum<{
        openFile: "openFile";
        openDirectory: "openDirectory";
        multiSelections: "multiSelections";
    }>>>;
}, z.core.$strict>;
export declare const SaveDialogOptionsSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    defaultPath: z.ZodOptional<z.ZodString>;
    filters: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        extensions: z.ZodArray<z.ZodString>;
    }, z.core.$strip>>>;
}, z.core.$strict>;
export declare const FileDialogResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    filePaths: z.ZodDefault<z.ZodArray<z.ZodString>>;
    canceled: z.ZodBoolean;
    error: z.ZodOptional<z.ZodObject<{
        code: z.ZodString;
        message: z.ZodString;
        category: z.ZodEnum<{
            GAME: "GAME";
            AUDIO: "AUDIO";
            PHYSICS: "PHYSICS";
            IPC: "IPC";
            OSZ: "OSZ";
            SYSTEM: "SYSTEM";
        }>;
        severity: z.ZodEnum<{
            LOW: "LOW";
            MEDIUM: "MEDIUM";
            HIGH: "HIGH";
            CRITICAL: "CRITICAL";
        }>;
        recoverable: z.ZodBoolean;
        details: z.ZodOptional<z.ZodUnknown>;
    }, z.core.$strip>>;
    timestamp: z.ZodNumber;
}, z.core.$strict>;
export declare const OpenPathRequestSchema: z.ZodObject<{
    path: z.ZodString;
}, z.core.$strict>;
export declare const OpenPathResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    opened: z.ZodBoolean;
    error: z.ZodOptional<z.ZodObject<{
        code: z.ZodString;
        message: z.ZodString;
        category: z.ZodEnum<{
            GAME: "GAME";
            AUDIO: "AUDIO";
            PHYSICS: "PHYSICS";
            IPC: "IPC";
            OSZ: "OSZ";
            SYSTEM: "SYSTEM";
        }>;
        severity: z.ZodEnum<{
            LOW: "LOW";
            MEDIUM: "MEDIUM";
            HIGH: "HIGH";
            CRITICAL: "CRITICAL";
        }>;
        recoverable: z.ZodBoolean;
        details: z.ZodOptional<z.ZodUnknown>;
    }, z.core.$strip>>;
    timestamp: z.ZodNumber;
}, z.core.$strict>;
export declare const ShowInFolderRequestSchema: z.ZodObject<{
    path: z.ZodString;
}, z.core.$strict>;
export declare const ShowInFolderResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    shown: z.ZodBoolean;
    error: z.ZodOptional<z.ZodObject<{
        code: z.ZodString;
        message: z.ZodString;
        category: z.ZodEnum<{
            GAME: "GAME";
            AUDIO: "AUDIO";
            PHYSICS: "PHYSICS";
            IPC: "IPC";
            OSZ: "OSZ";
            SYSTEM: "SYSTEM";
        }>;
        severity: z.ZodEnum<{
            LOW: "LOW";
            MEDIUM: "MEDIUM";
            HIGH: "HIGH";
            CRITICAL: "CRITICAL";
        }>;
        recoverable: z.ZodBoolean;
        details: z.ZodOptional<z.ZodUnknown>;
    }, z.core.$strip>>;
    timestamp: z.ZodNumber;
}, z.core.$strict>;
export declare const ReadFileRequestSchema: z.ZodObject<{
    path: z.ZodString;
}, z.core.$strict>;
export declare const ReadFileResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    data: z.ZodOptional<z.ZodCustom<Buffer<ArrayBufferLike>, Buffer<ArrayBufferLike>>>;
    encoding: z.ZodOptional<z.ZodString>;
    error: z.ZodOptional<z.ZodObject<{
        code: z.ZodString;
        message: z.ZodString;
        category: z.ZodEnum<{
            GAME: "GAME";
            AUDIO: "AUDIO";
            PHYSICS: "PHYSICS";
            IPC: "IPC";
            OSZ: "OSZ";
            SYSTEM: "SYSTEM";
        }>;
        severity: z.ZodEnum<{
            LOW: "LOW";
            MEDIUM: "MEDIUM";
            HIGH: "HIGH";
            CRITICAL: "CRITICAL";
        }>;
        recoverable: z.ZodBoolean;
        details: z.ZodOptional<z.ZodUnknown>;
    }, z.core.$strip>>;
    timestamp: z.ZodNumber;
}, z.core.$strict>;
export declare const WriteFileRequestSchema: z.ZodObject<{
    path: z.ZodString;
    data: z.ZodUnion<readonly [z.ZodCustom<Buffer<ArrayBufferLike>, Buffer<ArrayBufferLike>>, z.ZodString]>;
}, z.core.$strict>;
export declare const WriteFileResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    bytesWritten: z.ZodOptional<z.ZodNumber>;
    error: z.ZodOptional<z.ZodObject<{
        code: z.ZodString;
        message: z.ZodString;
        category: z.ZodEnum<{
            GAME: "GAME";
            AUDIO: "AUDIO";
            PHYSICS: "PHYSICS";
            IPC: "IPC";
            OSZ: "OSZ";
            SYSTEM: "SYSTEM";
        }>;
        severity: z.ZodEnum<{
            LOW: "LOW";
            MEDIUM: "MEDIUM";
            HIGH: "HIGH";
            CRITICAL: "CRITICAL";
        }>;
        recoverable: z.ZodBoolean;
        details: z.ZodOptional<z.ZodUnknown>;
    }, z.core.$strip>>;
    timestamp: z.ZodNumber;
}, z.core.$strict>;
export declare const DeleteFileRequestSchema: z.ZodObject<{
    path: z.ZodString;
}, z.core.$strict>;
export declare const DeleteFileResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    deleted: z.ZodBoolean;
    error: z.ZodOptional<z.ZodObject<{
        code: z.ZodString;
        message: z.ZodString;
        category: z.ZodEnum<{
            GAME: "GAME";
            AUDIO: "AUDIO";
            PHYSICS: "PHYSICS";
            IPC: "IPC";
            OSZ: "OSZ";
            SYSTEM: "SYSTEM";
        }>;
        severity: z.ZodEnum<{
            LOW: "LOW";
            MEDIUM: "MEDIUM";
            HIGH: "HIGH";
            CRITICAL: "CRITICAL";
        }>;
        recoverable: z.ZodBoolean;
        details: z.ZodOptional<z.ZodUnknown>;
    }, z.core.$strip>>;
    timestamp: z.ZodNumber;
}, z.core.$strict>;
/**
 * Event schemas
 */
export declare const KnifeResultEventSchema: z.ZodObject<{
    knifeId: z.ZodString;
    result: z.ZodEnum<{
        miss: "miss";
        hit: "hit";
        collision: "collision";
    }>;
    timingError: z.ZodNumber;
    accuracy: z.ZodNumber;
    score: z.ZodNumber;
    combo: z.ZodNumber;
}, z.core.$strict>;
export declare const ScoreUpdateEventSchema: z.ZodObject<{
    sessionId: z.core.$ZodBranded<z.ZodString, "SessionId">;
    totalScore: z.ZodNumber;
    accuracy: z.ZodNumber;
    combo: z.ZodNumber;
    maxCombo: z.ZodNumber;
}, z.core.$strict>;
export declare const ImportProgressEventSchema: z.ZodObject<{
    progress: z.ZodNumber;
    currentFile: z.ZodString;
    totalFiles: z.ZodNumber;
    processedFiles: z.ZodNumber;
}, z.core.$strict>;
export declare const LibraryChangeEventSchema: z.ZodObject<{
    action: z.ZodEnum<{
        added: "added";
        removed: "removed";
        updated: "updated";
    }>;
    chartId: z.core.$ZodBranded<z.ZodString, "ChartId">;
    metadata: z.ZodOptional<z.ZodObject<{
        id: z.core.$ZodBranded<z.ZodString, "ChartId">;
        title: z.ZodString;
        artist: z.ZodString;
        creator: z.ZodString;
        source: z.ZodOptional<z.ZodString>;
        tags: z.ZodDefault<z.ZodArray<z.ZodString>>;
        bpm: z.ZodNumber;
        duration: z.ZodNumber;
        gameMode: z.ZodDefault<z.ZodEnum<{
            osu: "osu";
            taiko: "taiko";
            fruits: "fruits";
            mania: "mania";
        }>>;
        difficulties: z.ZodArray<z.ZodObject<{
            version: z.ZodString;
            starRating: z.ZodDefault<z.ZodNumber>;
            overallDifficulty: z.ZodNumber;
            approachRate: z.ZodNumber;
            circleSize: z.ZodNumber;
            hpDrainRate: z.ZodNumber;
            maxCombo: z.ZodDefault<z.ZodNumber>;
            objectCount: z.ZodDefault<z.ZodNumber>;
        }, z.core.$strip>>;
        backgroundImage: z.ZodOptional<z.ZodString>;
        previewTime: z.ZodOptional<z.ZodNumber>;
        audioFilename: z.ZodString;
        createdAt: z.ZodDefault<z.ZodDate>;
        updatedAt: z.ZodDefault<z.ZodDate>;
    }, z.core.$strip>>;
}, z.core.$strict>;
export declare const SettingsChangeEventSchema: z.ZodObject<{
    key: z.ZodString;
    oldValue: z.ZodUnknown;
    newValue: z.ZodUnknown;
    source: z.ZodEnum<{
        reset: "reset";
        user: "user";
        import: "import";
    }>;
}, z.core.$strict>;
export declare const SettingsResetEventSchema: z.ZodObject<{
    resetSettings: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    previousSettings: z.ZodRecord<z.ZodString, z.ZodUnknown>;
}, z.core.$strict>;
/**
 * Export all IPC schemas
 */
export declare const IpcSchemas: {
    readonly GameStartRequest: z.ZodObject<{
        chartId: z.core.$ZodBranded<z.ZodString, "ChartId">;
        difficulty: z.ZodString;
        modifiers: z.ZodOptional<z.ZodObject<{
            noFail: z.ZodDefault<z.ZodBoolean>;
            easy: z.ZodDefault<z.ZodBoolean>;
            hardRock: z.ZodDefault<z.ZodBoolean>;
            doubleTime: z.ZodDefault<z.ZodBoolean>;
            halfTime: z.ZodDefault<z.ZodBoolean>;
            hidden: z.ZodDefault<z.ZodBoolean>;
            flashlight: z.ZodDefault<z.ZodBoolean>;
            autoplay: z.ZodDefault<z.ZodBoolean>;
            relax: z.ZodDefault<z.ZodBoolean>;
            speedMultiplier: z.ZodDefault<z.ZodNumber>;
        }, z.core.$strict>>;
    }, z.core.$strict>;
    readonly GameStartResponse: z.ZodObject<{
        success: z.ZodBoolean;
        sessionId: z.ZodOptional<z.core.$ZodBranded<z.ZodString, "SessionId">>;
        chartData: z.ZodOptional<z.ZodUnknown>;
        error: z.ZodOptional<z.ZodObject<{
            code: z.ZodString;
            message: z.ZodString;
            category: z.ZodEnum<{
                GAME: "GAME";
                AUDIO: "AUDIO";
                PHYSICS: "PHYSICS";
                IPC: "IPC";
                OSZ: "OSZ";
                SYSTEM: "SYSTEM";
            }>;
            severity: z.ZodEnum<{
                LOW: "LOW";
                MEDIUM: "MEDIUM";
                HIGH: "HIGH";
                CRITICAL: "CRITICAL";
            }>;
            recoverable: z.ZodBoolean;
            details: z.ZodOptional<z.ZodUnknown>;
        }, z.core.$strip>>;
        timestamp: z.ZodNumber;
    }, z.core.$strict>;
    readonly GameStopResponse: z.ZodObject<{
        success: z.ZodBoolean;
        finalScore: z.ZodOptional<z.ZodObject<{
            sessionId: z.core.$ZodBranded<z.ZodString, "SessionId">;
            chartId: z.core.$ZodBranded<z.ZodString, "ChartId">;
            difficulty: z.ZodString;
            totalScore: z.ZodNumber;
            accuracy: z.ZodNumber;
            maxCombo: z.ZodNumber;
            judgmentCounts: z.ZodRecord<z.ZodEnum<{
                KOOL: "KOOL";
                COOL: "COOL";
                GOOD: "GOOD";
                MISS: "MISS";
            }>, z.ZodNumber>;
            grade: z.ZodEnum<{
                D: "D";
                F: "F";
                B: "B";
                C: "C";
                SS: "SS";
                S: "S";
                A: "A";
            }>;
            modifiers: z.ZodObject<{
                noFail: z.ZodDefault<z.ZodBoolean>;
                easy: z.ZodDefault<z.ZodBoolean>;
                hardRock: z.ZodDefault<z.ZodBoolean>;
                doubleTime: z.ZodDefault<z.ZodBoolean>;
                halfTime: z.ZodDefault<z.ZodBoolean>;
                hidden: z.ZodDefault<z.ZodBoolean>;
                flashlight: z.ZodDefault<z.ZodBoolean>;
                autoplay: z.ZodDefault<z.ZodBoolean>;
                relax: z.ZodDefault<z.ZodBoolean>;
                speedMultiplier: z.ZodDefault<z.ZodNumber>;
            }, z.core.$strict>;
            playTime: z.ZodNumber;
            completedAt: z.ZodDate;
        }, z.core.$strip>>;
        error: z.ZodOptional<z.ZodObject<{
            code: z.ZodString;
            message: z.ZodString;
            category: z.ZodEnum<{
                GAME: "GAME";
                AUDIO: "AUDIO";
                PHYSICS: "PHYSICS";
                IPC: "IPC";
                OSZ: "OSZ";
                SYSTEM: "SYSTEM";
            }>;
            severity: z.ZodEnum<{
                LOW: "LOW";
                MEDIUM: "MEDIUM";
                HIGH: "HIGH";
                CRITICAL: "CRITICAL";
            }>;
            recoverable: z.ZodBoolean;
            details: z.ZodOptional<z.ZodUnknown>;
        }, z.core.$strip>>;
        timestamp: z.ZodNumber;
    }, z.core.$strict>;
    readonly GamePauseResponse: z.ZodObject<{
        success: z.ZodBoolean;
        isPaused: z.ZodBoolean;
        pauseTime: z.ZodNumber;
        error: z.ZodOptional<z.ZodObject<{
            code: z.ZodString;
            message: z.ZodString;
            category: z.ZodEnum<{
                GAME: "GAME";
                AUDIO: "AUDIO";
                PHYSICS: "PHYSICS";
                IPC: "IPC";
                OSZ: "OSZ";
                SYSTEM: "SYSTEM";
            }>;
            severity: z.ZodEnum<{
                LOW: "LOW";
                MEDIUM: "MEDIUM";
                HIGH: "HIGH";
                CRITICAL: "CRITICAL";
            }>;
            recoverable: z.ZodBoolean;
            details: z.ZodOptional<z.ZodUnknown>;
        }, z.core.$strip>>;
        timestamp: z.ZodNumber;
    }, z.core.$strict>;
    readonly GameResumeResponse: z.ZodObject<{
        success: z.ZodBoolean;
        isPaused: z.ZodBoolean;
        resumeTime: z.ZodNumber;
        error: z.ZodOptional<z.ZodObject<{
            code: z.ZodString;
            message: z.ZodString;
            category: z.ZodEnum<{
                GAME: "GAME";
                AUDIO: "AUDIO";
                PHYSICS: "PHYSICS";
                IPC: "IPC";
                OSZ: "OSZ";
                SYSTEM: "SYSTEM";
            }>;
            severity: z.ZodEnum<{
                LOW: "LOW";
                MEDIUM: "MEDIUM";
                HIGH: "HIGH";
                CRITICAL: "CRITICAL";
            }>;
            recoverable: z.ZodBoolean;
            details: z.ZodOptional<z.ZodUnknown>;
        }, z.core.$strip>>;
        timestamp: z.ZodNumber;
    }, z.core.$strict>;
    readonly KnifeThrowRequest: z.ZodObject<{
        sessionId: z.core.$ZodBranded<z.ZodString, "SessionId">;
        throwTime: z.ZodNumber;
        inputLatency: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strict>;
    readonly KnifeThrowResponse: z.ZodObject<{
        success: z.ZodBoolean;
        knifeId: z.ZodOptional<z.ZodString>;
        serverTime: z.ZodOptional<z.ZodNumber>;
        error: z.ZodOptional<z.ZodObject<{
            code: z.ZodString;
            message: z.ZodString;
            category: z.ZodEnum<{
                GAME: "GAME";
                AUDIO: "AUDIO";
                PHYSICS: "PHYSICS";
                IPC: "IPC";
                OSZ: "OSZ";
                SYSTEM: "SYSTEM";
            }>;
            severity: z.ZodEnum<{
                LOW: "LOW";
                MEDIUM: "MEDIUM";
                HIGH: "HIGH";
                CRITICAL: "CRITICAL";
            }>;
            recoverable: z.ZodBoolean;
            details: z.ZodOptional<z.ZodUnknown>;
        }, z.core.$strip>>;
        timestamp: z.ZodNumber;
    }, z.core.$strict>;
    readonly OszImportRequest: z.ZodObject<{
        filePath: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>;
    readonly OszImportResponse: z.ZodObject<{
        success: z.ZodBoolean;
        chartId: z.ZodOptional<z.core.$ZodBranded<z.ZodString, "ChartId">>;
        metadata: z.ZodOptional<z.ZodObject<{
            id: z.core.$ZodBranded<z.ZodString, "ChartId">;
            title: z.ZodString;
            artist: z.ZodString;
            creator: z.ZodString;
            source: z.ZodOptional<z.ZodString>;
            tags: z.ZodDefault<z.ZodArray<z.ZodString>>;
            bpm: z.ZodNumber;
            duration: z.ZodNumber;
            gameMode: z.ZodDefault<z.ZodEnum<{
                osu: "osu";
                taiko: "taiko";
                fruits: "fruits";
                mania: "mania";
            }>>;
            difficulties: z.ZodArray<z.ZodObject<{
                version: z.ZodString;
                starRating: z.ZodDefault<z.ZodNumber>;
                overallDifficulty: z.ZodNumber;
                approachRate: z.ZodNumber;
                circleSize: z.ZodNumber;
                hpDrainRate: z.ZodNumber;
                maxCombo: z.ZodDefault<z.ZodNumber>;
                objectCount: z.ZodDefault<z.ZodNumber>;
            }, z.core.$strip>>;
            backgroundImage: z.ZodOptional<z.ZodString>;
            previewTime: z.ZodOptional<z.ZodNumber>;
            audioFilename: z.ZodString;
            createdAt: z.ZodDefault<z.ZodDate>;
            updatedAt: z.ZodDefault<z.ZodDate>;
        }, z.core.$strip>>;
        importedFiles: z.ZodDefault<z.ZodArray<z.ZodString>>;
        error: z.ZodOptional<z.ZodObject<{
            code: z.ZodString;
            message: z.ZodString;
            category: z.ZodEnum<{
                GAME: "GAME";
                AUDIO: "AUDIO";
                PHYSICS: "PHYSICS";
                IPC: "IPC";
                OSZ: "OSZ";
                SYSTEM: "SYSTEM";
            }>;
            severity: z.ZodEnum<{
                LOW: "LOW";
                MEDIUM: "MEDIUM";
                HIGH: "HIGH";
                CRITICAL: "CRITICAL";
            }>;
            recoverable: z.ZodBoolean;
            details: z.ZodOptional<z.ZodUnknown>;
        }, z.core.$strip>>;
        timestamp: z.ZodNumber;
    }, z.core.$strict>;
    readonly OszLibraryResponse: z.ZodObject<{
        success: z.ZodBoolean;
        charts: z.ZodDefault<z.ZodArray<z.ZodObject<{
            id: z.core.$ZodBranded<z.ZodString, "ChartId">;
            title: z.ZodString;
            artist: z.ZodString;
            creator: z.ZodString;
            source: z.ZodOptional<z.ZodString>;
            tags: z.ZodDefault<z.ZodArray<z.ZodString>>;
            bpm: z.ZodNumber;
            duration: z.ZodNumber;
            gameMode: z.ZodDefault<z.ZodEnum<{
                osu: "osu";
                taiko: "taiko";
                fruits: "fruits";
                mania: "mania";
            }>>;
            difficulties: z.ZodArray<z.ZodObject<{
                version: z.ZodString;
                starRating: z.ZodDefault<z.ZodNumber>;
                overallDifficulty: z.ZodNumber;
                approachRate: z.ZodNumber;
                circleSize: z.ZodNumber;
                hpDrainRate: z.ZodNumber;
                maxCombo: z.ZodDefault<z.ZodNumber>;
                objectCount: z.ZodDefault<z.ZodNumber>;
            }, z.core.$strip>>;
            backgroundImage: z.ZodOptional<z.ZodString>;
            previewTime: z.ZodOptional<z.ZodNumber>;
            audioFilename: z.ZodString;
            createdAt: z.ZodDefault<z.ZodDate>;
            updatedAt: z.ZodDefault<z.ZodDate>;
        }, z.core.$strip>>>;
        totalCount: z.ZodNumber;
        error: z.ZodOptional<z.ZodObject<{
            code: z.ZodString;
            message: z.ZodString;
            category: z.ZodEnum<{
                GAME: "GAME";
                AUDIO: "AUDIO";
                PHYSICS: "PHYSICS";
                IPC: "IPC";
                OSZ: "OSZ";
                SYSTEM: "SYSTEM";
            }>;
            severity: z.ZodEnum<{
                LOW: "LOW";
                MEDIUM: "MEDIUM";
                HIGH: "HIGH";
                CRITICAL: "CRITICAL";
            }>;
            recoverable: z.ZodBoolean;
            details: z.ZodOptional<z.ZodUnknown>;
        }, z.core.$strip>>;
        timestamp: z.ZodNumber;
    }, z.core.$strict>;
    readonly OszRemoveRequest: z.ZodObject<{
        chartId: z.core.$ZodBranded<z.ZodString, "ChartId">;
    }, z.core.$strict>;
    readonly OszRemoveResponse: z.ZodObject<{
        success: z.ZodBoolean;
        removedFiles: z.ZodDefault<z.ZodArray<z.ZodString>>;
        error: z.ZodOptional<z.ZodObject<{
            code: z.ZodString;
            message: z.ZodString;
            category: z.ZodEnum<{
                GAME: "GAME";
                AUDIO: "AUDIO";
                PHYSICS: "PHYSICS";
                IPC: "IPC";
                OSZ: "OSZ";
                SYSTEM: "SYSTEM";
            }>;
            severity: z.ZodEnum<{
                LOW: "LOW";
                MEDIUM: "MEDIUM";
                HIGH: "HIGH";
                CRITICAL: "CRITICAL";
            }>;
            recoverable: z.ZodBoolean;
            details: z.ZodOptional<z.ZodUnknown>;
        }, z.core.$strip>>;
        timestamp: z.ZodNumber;
    }, z.core.$strict>;
    readonly AudioDataRequest: z.ZodObject<{
        chartId: z.core.$ZodBranded<z.ZodString, "ChartId">;
    }, z.core.$strict>;
    readonly AudioDataResponse: z.ZodObject<{
        success: z.ZodBoolean;
        audioData: z.ZodOptional<z.ZodCustom<ArrayBuffer, ArrayBuffer>>;
        format: z.ZodOptional<z.ZodObject<{
            sampleRate: z.ZodNumber;
            channels: z.ZodNumber;
            bitDepth: z.ZodUnion<readonly [z.ZodLiteral<16>, z.ZodLiteral<24>, z.ZodLiteral<32>]>;
            codec: z.ZodEnum<{
                mp3: "mp3";
                wav: "wav";
                ogg: "ogg";
                m4a: "m4a";
            }>;
            duration: z.ZodNumber;
            bitrate: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>>;
        error: z.ZodOptional<z.ZodObject<{
            code: z.ZodString;
            message: z.ZodString;
            category: z.ZodEnum<{
                GAME: "GAME";
                AUDIO: "AUDIO";
                PHYSICS: "PHYSICS";
                IPC: "IPC";
                OSZ: "OSZ";
                SYSTEM: "SYSTEM";
            }>;
            severity: z.ZodEnum<{
                LOW: "LOW";
                MEDIUM: "MEDIUM";
                HIGH: "HIGH";
                CRITICAL: "CRITICAL";
            }>;
            recoverable: z.ZodBoolean;
            details: z.ZodOptional<z.ZodUnknown>;
        }, z.core.$strip>>;
        timestamp: z.ZodNumber;
    }, z.core.$strict>;
    readonly ChartDataRequest: z.ZodObject<{
        chartId: z.core.$ZodBranded<z.ZodString, "ChartId">;
        difficulty: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>;
    readonly ChartDataResponse: z.ZodObject<{
        success: z.ZodBoolean;
        chartData: z.ZodOptional<z.ZodUnknown>;
        difficulty: z.ZodOptional<z.ZodObject<{
            version: z.ZodString;
            overallDifficulty: z.ZodNumber;
            approachRate: z.ZodNumber;
            circleSize: z.ZodNumber;
            hpDrainRate: z.ZodNumber;
            sliderMultiplier: z.ZodNumber;
            sliderTickRate: z.ZodNumber;
            stackLeniency: z.ZodNumber;
        }, z.core.$strip>>;
        error: z.ZodOptional<z.ZodObject<{
            code: z.ZodString;
            message: z.ZodString;
            category: z.ZodEnum<{
                GAME: "GAME";
                AUDIO: "AUDIO";
                PHYSICS: "PHYSICS";
                IPC: "IPC";
                OSZ: "OSZ";
                SYSTEM: "SYSTEM";
            }>;
            severity: z.ZodEnum<{
                LOW: "LOW";
                MEDIUM: "MEDIUM";
                HIGH: "HIGH";
                CRITICAL: "CRITICAL";
            }>;
            recoverable: z.ZodBoolean;
            details: z.ZodOptional<z.ZodUnknown>;
        }, z.core.$strip>>;
        timestamp: z.ZodNumber;
    }, z.core.$strict>;
    readonly SettingsGetAllResponse: z.ZodObject<{
        success: z.ZodBoolean;
        settings: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        error: z.ZodOptional<z.ZodObject<{
            code: z.ZodString;
            message: z.ZodString;
            category: z.ZodEnum<{
                GAME: "GAME";
                AUDIO: "AUDIO";
                PHYSICS: "PHYSICS";
                IPC: "IPC";
                OSZ: "OSZ";
                SYSTEM: "SYSTEM";
            }>;
            severity: z.ZodEnum<{
                LOW: "LOW";
                MEDIUM: "MEDIUM";
                HIGH: "HIGH";
                CRITICAL: "CRITICAL";
            }>;
            recoverable: z.ZodBoolean;
            details: z.ZodOptional<z.ZodUnknown>;
        }, z.core.$strip>>;
        timestamp: z.ZodNumber;
    }, z.core.$strict>;
    readonly SettingsGetRequest: z.ZodObject<{
        key: z.ZodString;
    }, z.core.$strict>;
    readonly SettingsGetResponse: z.ZodObject<{
        success: z.ZodBoolean;
        value: z.ZodOptional<z.ZodUnknown>;
        error: z.ZodOptional<z.ZodObject<{
            code: z.ZodString;
            message: z.ZodString;
            category: z.ZodEnum<{
                GAME: "GAME";
                AUDIO: "AUDIO";
                PHYSICS: "PHYSICS";
                IPC: "IPC";
                OSZ: "OSZ";
                SYSTEM: "SYSTEM";
            }>;
            severity: z.ZodEnum<{
                LOW: "LOW";
                MEDIUM: "MEDIUM";
                HIGH: "HIGH";
                CRITICAL: "CRITICAL";
            }>;
            recoverable: z.ZodBoolean;
            details: z.ZodOptional<z.ZodUnknown>;
        }, z.core.$strip>>;
        timestamp: z.ZodNumber;
    }, z.core.$strict>;
    readonly SettingsSetRequest: z.ZodObject<{
        key: z.ZodString;
        value: z.ZodUnknown;
    }, z.core.$strict>;
    readonly SettingsSetResponse: z.ZodObject<{
        success: z.ZodBoolean;
        oldValue: z.ZodOptional<z.ZodUnknown>;
        newValue: z.ZodOptional<z.ZodUnknown>;
        error: z.ZodOptional<z.ZodObject<{
            code: z.ZodString;
            message: z.ZodString;
            category: z.ZodEnum<{
                GAME: "GAME";
                AUDIO: "AUDIO";
                PHYSICS: "PHYSICS";
                IPC: "IPC";
                OSZ: "OSZ";
                SYSTEM: "SYSTEM";
            }>;
            severity: z.ZodEnum<{
                LOW: "LOW";
                MEDIUM: "MEDIUM";
                HIGH: "HIGH";
                CRITICAL: "CRITICAL";
            }>;
            recoverable: z.ZodBoolean;
            details: z.ZodOptional<z.ZodUnknown>;
        }, z.core.$strip>>;
        timestamp: z.ZodNumber;
    }, z.core.$strict>;
    readonly SettingsResetResponse: z.ZodObject<{
        success: z.ZodBoolean;
        defaultSettings: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        error: z.ZodOptional<z.ZodObject<{
            code: z.ZodString;
            message: z.ZodString;
            category: z.ZodEnum<{
                GAME: "GAME";
                AUDIO: "AUDIO";
                PHYSICS: "PHYSICS";
                IPC: "IPC";
                OSZ: "OSZ";
                SYSTEM: "SYSTEM";
            }>;
            severity: z.ZodEnum<{
                LOW: "LOW";
                MEDIUM: "MEDIUM";
                HIGH: "HIGH";
                CRITICAL: "CRITICAL";
            }>;
            recoverable: z.ZodBoolean;
            details: z.ZodOptional<z.ZodUnknown>;
        }, z.core.$strip>>;
        timestamp: z.ZodNumber;
    }, z.core.$strict>;
    readonly SettingsExportResponse: z.ZodObject<{
        success: z.ZodBoolean;
        exportPath: z.ZodOptional<z.ZodString>;
        error: z.ZodOptional<z.ZodObject<{
            code: z.ZodString;
            message: z.ZodString;
            category: z.ZodEnum<{
                GAME: "GAME";
                AUDIO: "AUDIO";
                PHYSICS: "PHYSICS";
                IPC: "IPC";
                OSZ: "OSZ";
                SYSTEM: "SYSTEM";
            }>;
            severity: z.ZodEnum<{
                LOW: "LOW";
                MEDIUM: "MEDIUM";
                HIGH: "HIGH";
                CRITICAL: "CRITICAL";
            }>;
            recoverable: z.ZodBoolean;
            details: z.ZodOptional<z.ZodUnknown>;
        }, z.core.$strip>>;
        timestamp: z.ZodNumber;
    }, z.core.$strict>;
    readonly SettingsImportResponse: z.ZodObject<{
        success: z.ZodBoolean;
        importedSettings: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        error: z.ZodOptional<z.ZodObject<{
            code: z.ZodString;
            message: z.ZodString;
            category: z.ZodEnum<{
                GAME: "GAME";
                AUDIO: "AUDIO";
                PHYSICS: "PHYSICS";
                IPC: "IPC";
                OSZ: "OSZ";
                SYSTEM: "SYSTEM";
            }>;
            severity: z.ZodEnum<{
                LOW: "LOW";
                MEDIUM: "MEDIUM";
                HIGH: "HIGH";
                CRITICAL: "CRITICAL";
            }>;
            recoverable: z.ZodBoolean;
            details: z.ZodOptional<z.ZodUnknown>;
        }, z.core.$strip>>;
        timestamp: z.ZodNumber;
    }, z.core.$strict>;
    readonly FileDialogOptions: z.ZodObject<{
        title: z.ZodOptional<z.ZodString>;
        defaultPath: z.ZodOptional<z.ZodString>;
        filters: z.ZodOptional<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            extensions: z.ZodArray<z.ZodString>;
        }, z.core.$strip>>>;
        properties: z.ZodOptional<z.ZodArray<z.ZodEnum<{
            openFile: "openFile";
            openDirectory: "openDirectory";
            multiSelections: "multiSelections";
        }>>>;
    }, z.core.$strict>;
    readonly SaveDialogOptions: z.ZodObject<{
        title: z.ZodOptional<z.ZodString>;
        defaultPath: z.ZodOptional<z.ZodString>;
        filters: z.ZodOptional<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            extensions: z.ZodArray<z.ZodString>;
        }, z.core.$strip>>>;
    }, z.core.$strict>;
    readonly FileDialogResponse: z.ZodObject<{
        success: z.ZodBoolean;
        filePaths: z.ZodDefault<z.ZodArray<z.ZodString>>;
        canceled: z.ZodBoolean;
        error: z.ZodOptional<z.ZodObject<{
            code: z.ZodString;
            message: z.ZodString;
            category: z.ZodEnum<{
                GAME: "GAME";
                AUDIO: "AUDIO";
                PHYSICS: "PHYSICS";
                IPC: "IPC";
                OSZ: "OSZ";
                SYSTEM: "SYSTEM";
            }>;
            severity: z.ZodEnum<{
                LOW: "LOW";
                MEDIUM: "MEDIUM";
                HIGH: "HIGH";
                CRITICAL: "CRITICAL";
            }>;
            recoverable: z.ZodBoolean;
            details: z.ZodOptional<z.ZodUnknown>;
        }, z.core.$strip>>;
        timestamp: z.ZodNumber;
    }, z.core.$strict>;
    readonly OpenPathRequest: z.ZodObject<{
        path: z.ZodString;
    }, z.core.$strict>;
    readonly OpenPathResponse: z.ZodObject<{
        success: z.ZodBoolean;
        opened: z.ZodBoolean;
        error: z.ZodOptional<z.ZodObject<{
            code: z.ZodString;
            message: z.ZodString;
            category: z.ZodEnum<{
                GAME: "GAME";
                AUDIO: "AUDIO";
                PHYSICS: "PHYSICS";
                IPC: "IPC";
                OSZ: "OSZ";
                SYSTEM: "SYSTEM";
            }>;
            severity: z.ZodEnum<{
                LOW: "LOW";
                MEDIUM: "MEDIUM";
                HIGH: "HIGH";
                CRITICAL: "CRITICAL";
            }>;
            recoverable: z.ZodBoolean;
            details: z.ZodOptional<z.ZodUnknown>;
        }, z.core.$strip>>;
        timestamp: z.ZodNumber;
    }, z.core.$strict>;
    readonly ShowInFolderRequest: z.ZodObject<{
        path: z.ZodString;
    }, z.core.$strict>;
    readonly ShowInFolderResponse: z.ZodObject<{
        success: z.ZodBoolean;
        shown: z.ZodBoolean;
        error: z.ZodOptional<z.ZodObject<{
            code: z.ZodString;
            message: z.ZodString;
            category: z.ZodEnum<{
                GAME: "GAME";
                AUDIO: "AUDIO";
                PHYSICS: "PHYSICS";
                IPC: "IPC";
                OSZ: "OSZ";
                SYSTEM: "SYSTEM";
            }>;
            severity: z.ZodEnum<{
                LOW: "LOW";
                MEDIUM: "MEDIUM";
                HIGH: "HIGH";
                CRITICAL: "CRITICAL";
            }>;
            recoverable: z.ZodBoolean;
            details: z.ZodOptional<z.ZodUnknown>;
        }, z.core.$strip>>;
        timestamp: z.ZodNumber;
    }, z.core.$strict>;
    readonly ReadFileRequest: z.ZodObject<{
        path: z.ZodString;
    }, z.core.$strict>;
    readonly ReadFileResponse: z.ZodObject<{
        success: z.ZodBoolean;
        data: z.ZodOptional<z.ZodCustom<Buffer<ArrayBufferLike>, Buffer<ArrayBufferLike>>>;
        encoding: z.ZodOptional<z.ZodString>;
        error: z.ZodOptional<z.ZodObject<{
            code: z.ZodString;
            message: z.ZodString;
            category: z.ZodEnum<{
                GAME: "GAME";
                AUDIO: "AUDIO";
                PHYSICS: "PHYSICS";
                IPC: "IPC";
                OSZ: "OSZ";
                SYSTEM: "SYSTEM";
            }>;
            severity: z.ZodEnum<{
                LOW: "LOW";
                MEDIUM: "MEDIUM";
                HIGH: "HIGH";
                CRITICAL: "CRITICAL";
            }>;
            recoverable: z.ZodBoolean;
            details: z.ZodOptional<z.ZodUnknown>;
        }, z.core.$strip>>;
        timestamp: z.ZodNumber;
    }, z.core.$strict>;
    readonly WriteFileRequest: z.ZodObject<{
        path: z.ZodString;
        data: z.ZodUnion<readonly [z.ZodCustom<Buffer<ArrayBufferLike>, Buffer<ArrayBufferLike>>, z.ZodString]>;
    }, z.core.$strict>;
    readonly WriteFileResponse: z.ZodObject<{
        success: z.ZodBoolean;
        bytesWritten: z.ZodOptional<z.ZodNumber>;
        error: z.ZodOptional<z.ZodObject<{
            code: z.ZodString;
            message: z.ZodString;
            category: z.ZodEnum<{
                GAME: "GAME";
                AUDIO: "AUDIO";
                PHYSICS: "PHYSICS";
                IPC: "IPC";
                OSZ: "OSZ";
                SYSTEM: "SYSTEM";
            }>;
            severity: z.ZodEnum<{
                LOW: "LOW";
                MEDIUM: "MEDIUM";
                HIGH: "HIGH";
                CRITICAL: "CRITICAL";
            }>;
            recoverable: z.ZodBoolean;
            details: z.ZodOptional<z.ZodUnknown>;
        }, z.core.$strip>>;
        timestamp: z.ZodNumber;
    }, z.core.$strict>;
    readonly DeleteFileRequest: z.ZodObject<{
        path: z.ZodString;
    }, z.core.$strict>;
    readonly DeleteFileResponse: z.ZodObject<{
        success: z.ZodBoolean;
        deleted: z.ZodBoolean;
        error: z.ZodOptional<z.ZodObject<{
            code: z.ZodString;
            message: z.ZodString;
            category: z.ZodEnum<{
                GAME: "GAME";
                AUDIO: "AUDIO";
                PHYSICS: "PHYSICS";
                IPC: "IPC";
                OSZ: "OSZ";
                SYSTEM: "SYSTEM";
            }>;
            severity: z.ZodEnum<{
                LOW: "LOW";
                MEDIUM: "MEDIUM";
                HIGH: "HIGH";
                CRITICAL: "CRITICAL";
            }>;
            recoverable: z.ZodBoolean;
            details: z.ZodOptional<z.ZodUnknown>;
        }, z.core.$strip>>;
        timestamp: z.ZodNumber;
    }, z.core.$strict>;
    readonly KnifeResultEvent: z.ZodObject<{
        knifeId: z.ZodString;
        result: z.ZodEnum<{
            miss: "miss";
            hit: "hit";
            collision: "collision";
        }>;
        timingError: z.ZodNumber;
        accuracy: z.ZodNumber;
        score: z.ZodNumber;
        combo: z.ZodNumber;
    }, z.core.$strict>;
    readonly ScoreUpdateEvent: z.ZodObject<{
        sessionId: z.core.$ZodBranded<z.ZodString, "SessionId">;
        totalScore: z.ZodNumber;
        accuracy: z.ZodNumber;
        combo: z.ZodNumber;
        maxCombo: z.ZodNumber;
    }, z.core.$strict>;
    readonly ImportProgressEvent: z.ZodObject<{
        progress: z.ZodNumber;
        currentFile: z.ZodString;
        totalFiles: z.ZodNumber;
        processedFiles: z.ZodNumber;
    }, z.core.$strict>;
    readonly LibraryChangeEvent: z.ZodObject<{
        action: z.ZodEnum<{
            added: "added";
            removed: "removed";
            updated: "updated";
        }>;
        chartId: z.core.$ZodBranded<z.ZodString, "ChartId">;
        metadata: z.ZodOptional<z.ZodObject<{
            id: z.core.$ZodBranded<z.ZodString, "ChartId">;
            title: z.ZodString;
            artist: z.ZodString;
            creator: z.ZodString;
            source: z.ZodOptional<z.ZodString>;
            tags: z.ZodDefault<z.ZodArray<z.ZodString>>;
            bpm: z.ZodNumber;
            duration: z.ZodNumber;
            gameMode: z.ZodDefault<z.ZodEnum<{
                osu: "osu";
                taiko: "taiko";
                fruits: "fruits";
                mania: "mania";
            }>>;
            difficulties: z.ZodArray<z.ZodObject<{
                version: z.ZodString;
                starRating: z.ZodDefault<z.ZodNumber>;
                overallDifficulty: z.ZodNumber;
                approachRate: z.ZodNumber;
                circleSize: z.ZodNumber;
                hpDrainRate: z.ZodNumber;
                maxCombo: z.ZodDefault<z.ZodNumber>;
                objectCount: z.ZodDefault<z.ZodNumber>;
            }, z.core.$strip>>;
            backgroundImage: z.ZodOptional<z.ZodString>;
            previewTime: z.ZodOptional<z.ZodNumber>;
            audioFilename: z.ZodString;
            createdAt: z.ZodDefault<z.ZodDate>;
            updatedAt: z.ZodDefault<z.ZodDate>;
        }, z.core.$strip>>;
    }, z.core.$strict>;
    readonly SettingsChangeEvent: z.ZodObject<{
        key: z.ZodString;
        oldValue: z.ZodUnknown;
        newValue: z.ZodUnknown;
        source: z.ZodEnum<{
            reset: "reset";
            user: "user";
            import: "import";
        }>;
    }, z.core.$strict>;
    readonly SettingsResetEvent: z.ZodObject<{
        resetSettings: z.ZodRecord<z.ZodString, z.ZodUnknown>;
        previousSettings: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    }, z.core.$strict>;
    readonly GameModifiers: z.ZodObject<{
        noFail: z.ZodDefault<z.ZodBoolean>;
        easy: z.ZodDefault<z.ZodBoolean>;
        hardRock: z.ZodDefault<z.ZodBoolean>;
        doubleTime: z.ZodDefault<z.ZodBoolean>;
        halfTime: z.ZodDefault<z.ZodBoolean>;
        hidden: z.ZodDefault<z.ZodBoolean>;
        flashlight: z.ZodDefault<z.ZodBoolean>;
        autoplay: z.ZodDefault<z.ZodBoolean>;
        relax: z.ZodDefault<z.ZodBoolean>;
        speedMultiplier: z.ZodDefault<z.ZodNumber>;
    }, z.core.$strict>;
};
export type ValidatedGameStartRequest = z.infer<typeof GameStartRequestSchema>;
export type ValidatedGameStartResponse = z.infer<typeof GameStartResponseSchema>;
export type ValidatedOszImportRequest = z.infer<typeof OszImportRequestSchema>;
export type ValidatedOszImportResponse = z.infer<typeof OszImportResponseSchema>;
export type ValidatedKnifeThrowRequest = z.infer<typeof KnifeThrowRequestSchema>;
export type ValidatedKnifeResultEvent = z.infer<typeof KnifeResultEventSchema>;
export type ValidatedGameModifiers = z.infer<typeof GameModifiersSchema>;
//# sourceMappingURL=ipc.schema.d.ts.map