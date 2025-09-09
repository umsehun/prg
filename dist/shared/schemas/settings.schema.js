"use strict";
/**
 * Zod schemas for game settings and user preferences
 * Type-safe validation for all configuration options
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsSchemas = exports.SettingsValidationResultSchema = exports.SettingsPatchSchema = exports.SettingsExportSchema = exports.SettingsImportSchema = exports.UserSettingsSchema = exports.AccessibilitySettingsSchema = exports.DebugSettingsSchema = exports.DirectorySettingsSchema = exports.UserProfileSchema = exports.NetworkSettingsSchema = exports.PerformanceSettingsSchema = exports.SkinSettingsSchema = exports.GameplaySettingsSchema = exports.InputSettingsSchema = exports.VisualSettingsSchema = exports.AudioSettingsSchema = void 0;
const zod_1 = require("zod");
/**
 * Basic validation utilities
 */
const NonEmptyString = zod_1.z.string().min(1).trim();
const BoundedNumber = (min, max) => zod_1.z.number().min(min).max(max);
const Percentage = BoundedNumber(0, 100);
/**
 * Audio settings validation
 */
exports.AudioSettingsSchema = zod_1.z.object({
    masterVolume: Percentage.default(100),
    musicVolume: Percentage.default(100),
    effectVolume: Percentage.default(100),
    audioOffset: BoundedNumber(-500, 500).default(0), // milliseconds
    audioDevice: zod_1.z.object({
        inputDeviceId: zod_1.z.string().optional(),
        outputDeviceId: zod_1.z.string().optional(),
        sampleRate: zod_1.z.union([
            zod_1.z.literal(44100),
            zod_1.z.literal(48000),
            zod_1.z.literal(88200),
            zod_1.z.literal(96000)
        ]).default(44100),
        bufferSize: zod_1.z.union([
            zod_1.z.literal(128),
            zod_1.z.literal(256),
            zod_1.z.literal(512),
            zod_1.z.literal(1024),
            zod_1.z.literal(2048),
            zod_1.z.literal(4096)
        ]).default(512),
        exclusiveMode: zod_1.z.boolean().default(false),
    }).default(() => ({
        sampleRate: 44100,
        bufferSize: 512,
        exclusiveMode: false,
    })),
}).strict();
/**
 * Visual settings validation
 */
exports.VisualSettingsSchema = zod_1.z.object({
    backgroundDim: Percentage.default(30),
    showApproachCircles: zod_1.z.boolean().default(true),
    showHitLighting: zod_1.z.boolean().default(true),
    showComboFire: zod_1.z.boolean().default(true),
    showComboBreak: zod_1.z.boolean().default(true),
    showScoreOverlay: zod_1.z.boolean().default(true),
    showHealthBar: zod_1.z.boolean().default(true),
    showProgressBar: zod_1.z.boolean().default(true),
    showKeyOverlay: zod_1.z.boolean().default(false),
    alwaysShowKeyOverlay: zod_1.z.boolean().default(false),
    showInterface: zod_1.z.boolean().default(true),
    cursorSize: BoundedNumber(0.5, 2.0).default(1.0),
    cursorTrail: zod_1.z.boolean().default(true),
    cursorRipples: zod_1.z.boolean().default(false),
    hitErrorBar: zod_1.z.boolean().default(true),
    progressBarType: zod_1.z.enum(['none', 'pie', 'topRight', 'bottomRight']).default('bottomRight'),
    scoreDisplayType: zod_1.z.enum(['none', 'accuracy', 'score', 'both']).default('both'),
    comboBurst: zod_1.z.boolean().default(true),
    hitLighting: zod_1.z.boolean().default(true),
}).strict();
/**
 * Input settings validation
 */
exports.InputSettingsSchema = zod_1.z.object({
    keyBindings: zod_1.z.record(zod_1.z.string(), zod_1.z.string()).default(() => ({
        'throw': 'Space',
        'pause': 'Escape',
        'restart': 'Backquote',
        'skip': 'Tab',
        'volumeUp': 'ArrowUp',
        'volumeDown': 'ArrowDown',
    })),
    mouseDisableWheel: zod_1.z.boolean().default(false),
    mouseDisableButtons: zod_1.z.boolean().default(false),
    rawInput: zod_1.z.boolean().default(false),
    mouseSensitivity: BoundedNumber(0.1, 6.0).default(1.0),
    tabletSupport: zod_1.z.boolean().default(false),
    wiimoteSupport: zod_1.z.boolean().default(false),
    confineMouseCursor: zod_1.z.boolean().default(false),
}).strict();
/**
 * Gameplay settings validation
 */
exports.GameplaySettingsSchema = zod_1.z.object({
    backgroundVideo: zod_1.z.boolean().default(true),
    storyboard: zod_1.z.boolean().default(true),
    comboBursts: zod_1.z.boolean().default(true),
    hitSounds: zod_1.z.boolean().default(true),
    ignoreBeatmapHitSounds: zod_1.z.boolean().default(false),
    ignoreBeatmapSkin: zod_1.z.boolean().default(false),
    disableWheelInGameplay: zod_1.z.boolean().default(true),
    disableClicksInGameplay: zod_1.z.boolean().default(false),
    bossModeOnBreaks: zod_1.z.boolean().default(false),
    automaticCursorSize: zod_1.z.boolean().default(false),
    saveFailedReplays: zod_1.z.boolean().default(true),
    floatingComments: zod_1.z.boolean().default(true),
    showInterfaceDuringRelax: zod_1.z.boolean().default(false),
}).strict();
/**
 * Skin settings validation
 */
exports.SkinSettingsSchema = zod_1.z.object({
    currentSkin: NonEmptyString.default('Default'),
    ignoreAllBeatmapSkins: zod_1.z.boolean().default(false),
    skinSampleVolume: Percentage.default(100),
    useDefaultSkinCursor: zod_1.z.boolean().default(false),
    cursorExpand: zod_1.z.boolean().default(true),
    cursorCenterOnSelection: zod_1.z.boolean().default(true),
    alwaysUseDefaultCursor: zod_1.z.boolean().default(false),
}).strict();
/**
 * Performance settings validation
 */
exports.PerformanceSettingsSchema = zod_1.z.object({
    frameLimit: zod_1.z.union([
        zod_1.z.literal('unlimited'),
        zod_1.z.literal('vsync'),
        zod_1.z.number().int().min(60).max(1000)
    ]).default('unlimited'),
    compatibilityMode: zod_1.z.boolean().default(false),
    reduceDroppedFrames: zod_1.z.boolean().default(true),
    detectPerformanceIssues: zod_1.z.boolean().default(true),
    lowLatencyAudio: zod_1.z.boolean().default(false),
    threadedOptimization: zod_1.z.boolean().default(true),
    showFPSCounter: zod_1.z.boolean().default(false),
    enableGarbageCollection: zod_1.z.boolean().default(true),
    memoryOptimization: zod_1.z.boolean().default(true),
}).strict();
/**
 * Network settings validation
 */
exports.NetworkSettingsSchema = zod_1.z.object({
    automaticDownloads: zod_1.z.boolean().default(true),
    noVideoDownloads: zod_1.z.boolean().default(false),
    preferMirrorServer: zod_1.z.boolean().default(false),
    enableMultiplayer: zod_1.z.boolean().default(true),
    spectatorMode: zod_1.z.boolean().default(true),
    autoJoinIRC: zod_1.z.boolean().default(false),
    enableNotifications: zod_1.z.boolean().default(true),
    proxySettings: zod_1.z.object({
        enabled: zod_1.z.boolean().default(false),
        host: zod_1.z.string().default(''),
        port: zod_1.z.number().int().min(1).max(65535).default(8080),
        username: zod_1.z.string().default(''),
        password: zod_1.z.string().default(''),
    }).default(() => ({
        enabled: false,
        host: '',
        port: 8080,
        username: '',
        password: '',
    })),
}).strict();
/**
 * User profile validation
 */
exports.UserProfileSchema = zod_1.z.object({
    username: NonEmptyString.default('Player'),
    avatar: zod_1.z.string().optional(),
    country: zod_1.z.string().length(2).default('XX'), // ISO 3166-1 alpha-2
    timezone: zod_1.z.string().default(Intl.DateTimeFormat().resolvedOptions().timeZone),
    language: zod_1.z.string().default('en'),
    preferredGameMode: zod_1.z.enum(['osu', 'taiko', 'fruits', 'mania']).default('osu'),
    showOnlineStatus: zod_1.z.boolean().default(true),
    allowFriendRequests: zod_1.z.boolean().default(true),
    allowPrivateMessages: zod_1.z.boolean().default(true),
    filterOffensiveWords: zod_1.z.boolean().default(true),
}).strict();
/**
 * Directory settings validation
 */
exports.DirectorySettingsSchema = zod_1.z.object({
    chartLibrary: NonEmptyString.default('charts'),
    cache: NonEmptyString.default('cache'),
    logs: NonEmptyString.default('logs'),
    recordings: NonEmptyString.default('recordings'),
    replays: NonEmptyString.default('replays'),
    screenshots: NonEmptyString.default('screenshots'),
    skins: NonEmptyString.default('skins'),
    themes: NonEmptyString.default('themes'),
    temporary: NonEmptyString.default('temp'),
}).strict();
/**
 * Debug settings validation (for development)
 */
exports.DebugSettingsSchema = zod_1.z.object({
    enableDebugMode: zod_1.z.boolean().default(false),
    showDebugInfo: zod_1.z.boolean().default(false),
    logLevel: zod_1.z.enum(['debug', 'info', 'warn', 'error']).default('info'),
    enablePerformanceLogging: zod_1.z.boolean().default(false),
    verboseLogging: zod_1.z.boolean().default(false),
    saveDebugLogs: zod_1.z.boolean().default(false),
    enableHotReload: zod_1.z.boolean().default(false),
    showPhysicsDebug: zod_1.z.boolean().default(false),
    showAudioDebug: zod_1.z.boolean().default(false),
    enableExperimentalFeatures: zod_1.z.boolean().default(false),
}).strict();
/**
 * Accessibility settings validation
 */
exports.AccessibilitySettingsSchema = zod_1.z.object({
    enableHighContrast: zod_1.z.boolean().default(false),
    enableColorBlindSupport: zod_1.z.boolean().default(false),
    colorBlindType: zod_1.z.enum(['none', 'protanopia', 'deuteranopia', 'tritanopia']).default('none'),
    enableScreenReader: zod_1.z.boolean().default(false),
    enableKeyboardNavigation: zod_1.z.boolean().default(false),
    reducedMotion: zod_1.z.boolean().default(false),
    largerCursor: zod_1.z.boolean().default(false),
    enableSoundCues: zod_1.z.boolean().default(false),
    enableHapticFeedback: zod_1.z.boolean().default(false),
}).strict();
/**
 * Complete user settings schema
 */
exports.UserSettingsSchema = zod_1.z.object({
    profile: exports.UserProfileSchema,
    audio: exports.AudioSettingsSchema,
    visual: exports.VisualSettingsSchema,
    input: exports.InputSettingsSchema,
    gameplay: exports.GameplaySettingsSchema,
    skin: exports.SkinSettingsSchema,
    performance: exports.PerformanceSettingsSchema,
    network: exports.NetworkSettingsSchema,
    directories: exports.DirectorySettingsSchema,
    debug: exports.DebugSettingsSchema,
    accessibility: exports.AccessibilitySettingsSchema,
    // Metadata
    version: zod_1.z.string().default('1.0.0'),
    lastModified: zod_1.z.date().default(() => new Date()),
    migrationVersion: zod_1.z.number().int().default(1),
}).strict();
/**
 * Settings validation for specific operations
 */
exports.SettingsImportSchema = zod_1.z.object({
    filePath: NonEmptyString,
    mergeStrategy: zod_1.z.enum(['replace', 'merge', 'selective']).default('merge'),
    backupCurrent: zod_1.z.boolean().default(true),
    validateBeforeImport: zod_1.z.boolean().default(true),
}).strict();
exports.SettingsExportSchema = zod_1.z.object({
    filePath: NonEmptyString.optional(),
    includeProfile: zod_1.z.boolean().default(true),
    includeSettings: zod_1.z.boolean().default(true),
    includeKeybindings: zod_1.z.boolean().default(true),
    includeDirectories: zod_1.z.boolean().default(false),
    format: zod_1.z.enum(['json', 'yaml', 'ini']).default('json'),
    encrypt: zod_1.z.boolean().default(false),
}).strict();
/**
 * Settings patch schema for partial updates
 */
exports.SettingsPatchSchema = zod_1.z.object({
    path: NonEmptyString, // e.g., "audio.masterVolume" or "visual.backgroundDim"
    value: zod_1.z.unknown(),
    operation: zod_1.z.enum(['set', 'merge', 'delete']).default('set'),
}).strict();
/**
 * Settings validation result
 */
exports.SettingsValidationResultSchema = zod_1.z.object({
    isValid: zod_1.z.boolean(),
    errors: zod_1.z.array(zod_1.z.object({
        path: zod_1.z.string(),
        message: zod_1.z.string(),
        code: zod_1.z.string(),
        severity: zod_1.z.enum(['error', 'warning', 'info']),
    })).default([]),
    migrations: zod_1.z.array(zod_1.z.object({
        from: zod_1.z.string(),
        to: zod_1.z.string(),
        description: zod_1.z.string(),
        applied: zod_1.z.boolean(),
    })).default([]),
    warnings: zod_1.z.array(zod_1.z.string()).default([]),
}).strict();
/**
 * Export all settings schemas
 */
exports.SettingsSchemas = {
    // Core settings
    UserSettings: exports.UserSettingsSchema,
    Profile: exports.UserProfileSchema,
    Audio: exports.AudioSettingsSchema,
    Visual: exports.VisualSettingsSchema,
    Input: exports.InputSettingsSchema,
    Gameplay: exports.GameplaySettingsSchema,
    Skin: exports.SkinSettingsSchema,
    Performance: exports.PerformanceSettingsSchema,
    Network: exports.NetworkSettingsSchema,
    Directories: exports.DirectorySettingsSchema,
    Debug: exports.DebugSettingsSchema,
    Accessibility: exports.AccessibilitySettingsSchema,
    // Operations
    Import: exports.SettingsImportSchema,
    Export: exports.SettingsExportSchema,
    Patch: exports.SettingsPatchSchema,
    ValidationResult: exports.SettingsValidationResultSchema,
};
