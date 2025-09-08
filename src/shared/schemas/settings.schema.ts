/**
 * Zod schemas for game settings and user preferences
 * Type-safe validation for all configuration options
 */

import { z } from 'zod';

/**
 * Basic validation utilities
 */
const NonEmptyString = z.string().min(1).trim();
const BoundedNumber = (min: number, max: number) => z.number().min(min).max(max);
const Percentage = BoundedNumber(0, 100);

/**
 * Audio settings validation
 */
export const AudioSettingsSchema = z.object({
    masterVolume: Percentage.default(100),
    musicVolume: Percentage.default(100),
    effectVolume: Percentage.default(100),
    audioOffset: BoundedNumber(-500, 500).default(0), // milliseconds
    audioDevice: z.object({
        inputDeviceId: z.string().optional(),
        outputDeviceId: z.string().optional(),
        sampleRate: z.union([
            z.literal(44100),
            z.literal(48000),
            z.literal(88200),
            z.literal(96000)
        ]).default(44100),
        bufferSize: z.union([
            z.literal(128),
            z.literal(256),
            z.literal(512),
            z.literal(1024),
            z.literal(2048),
            z.literal(4096)
        ]).default(512),
        exclusiveMode: z.boolean().default(false),
    }).default(() => ({
        sampleRate: 44100 as const,
        bufferSize: 512 as const,
        exclusiveMode: false,
    })),
}).strict();

/**
 * Visual settings validation
 */
export const VisualSettingsSchema = z.object({
    backgroundDim: Percentage.default(30),
    showApproachCircles: z.boolean().default(true),
    showHitLighting: z.boolean().default(true),
    showComboFire: z.boolean().default(true),
    showComboBreak: z.boolean().default(true),
    showScoreOverlay: z.boolean().default(true),
    showHealthBar: z.boolean().default(true),
    showProgressBar: z.boolean().default(true),
    showKeyOverlay: z.boolean().default(false),
    alwaysShowKeyOverlay: z.boolean().default(false),
    showInterface: z.boolean().default(true),
    cursorSize: BoundedNumber(0.5, 2.0).default(1.0),
    cursorTrail: z.boolean().default(true),
    cursorRipples: z.boolean().default(false),
    hitErrorBar: z.boolean().default(true),
    progressBarType: z.enum(['none', 'pie', 'topRight', 'bottomRight']).default('bottomRight'),
    scoreDisplayType: z.enum(['none', 'accuracy', 'score', 'both']).default('both'),
    comboBurst: z.boolean().default(true),
    hitLighting: z.boolean().default(true),
}).strict();

/**
 * Input settings validation
 */
export const InputSettingsSchema = z.object({
    keyBindings: z.record(z.string(), z.string()).default(() => ({
        'throw': 'Space',
        'pause': 'Escape',
        'restart': 'Backquote',
        'skip': 'Tab',
        'volumeUp': 'ArrowUp',
        'volumeDown': 'ArrowDown',
    })),
    mouseDisableWheel: z.boolean().default(false),
    mouseDisableButtons: z.boolean().default(false),
    rawInput: z.boolean().default(false),
    mouseSensitivity: BoundedNumber(0.1, 6.0).default(1.0),
    tabletSupport: z.boolean().default(false),
    wiimoteSupport: z.boolean().default(false),
    confineMouseCursor: z.boolean().default(false),
}).strict();

/**
 * Gameplay settings validation
 */
export const GameplaySettingsSchema = z.object({
    backgroundVideo: z.boolean().default(true),
    storyboard: z.boolean().default(true),
    comboBursts: z.boolean().default(true),
    hitSounds: z.boolean().default(true),
    ignoreBeatmapHitSounds: z.boolean().default(false),
    ignoreBeatmapSkin: z.boolean().default(false),
    disableWheelInGameplay: z.boolean().default(true),
    disableClicksInGameplay: z.boolean().default(false),
    bossModeOnBreaks: z.boolean().default(false),
    automaticCursorSize: z.boolean().default(false),
    saveFailedReplays: z.boolean().default(true),
    floatingComments: z.boolean().default(true),
    showInterfaceDuringRelax: z.boolean().default(false),
}).strict();

/**
 * Skin settings validation
 */
export const SkinSettingsSchema = z.object({
    currentSkin: NonEmptyString.default('Default'),
    ignoreAllBeatmapSkins: z.boolean().default(false),
    skinSampleVolume: Percentage.default(100),
    useDefaultSkinCursor: z.boolean().default(false),
    cursorExpand: z.boolean().default(true),
    cursorCenterOnSelection: z.boolean().default(true),
    alwaysUseDefaultCursor: z.boolean().default(false),
}).strict();

/**
 * Performance settings validation
 */
export const PerformanceSettingsSchema = z.object({
    frameLimit: z.union([
        z.literal('unlimited'),
        z.literal('vsync'),
        z.number().int().min(60).max(1000)
    ]).default('unlimited'),
    compatibilityMode: z.boolean().default(false),
    reduceDroppedFrames: z.boolean().default(true),
    detectPerformanceIssues: z.boolean().default(true),
    lowLatencyAudio: z.boolean().default(false),
    threadedOptimization: z.boolean().default(true),
    showFPSCounter: z.boolean().default(false),
    enableGarbageCollection: z.boolean().default(true),
    memoryOptimization: z.boolean().default(true),
}).strict();

/**
 * Network settings validation
 */
export const NetworkSettingsSchema = z.object({
    automaticDownloads: z.boolean().default(true),
    noVideoDownloads: z.boolean().default(false),
    preferMirrorServer: z.boolean().default(false),
    enableMultiplayer: z.boolean().default(true),
    spectatorMode: z.boolean().default(true),
    autoJoinIRC: z.boolean().default(false),
    enableNotifications: z.boolean().default(true),
    proxySettings: z.object({
        enabled: z.boolean().default(false),
        host: z.string().default(''),
        port: z.number().int().min(1).max(65535).default(8080),
        username: z.string().default(''),
        password: z.string().default(''),
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
export const UserProfileSchema = z.object({
    username: NonEmptyString.default('Player'),
    avatar: z.string().optional(),
    country: z.string().length(2).default('XX'), // ISO 3166-1 alpha-2
    timezone: z.string().default(Intl.DateTimeFormat().resolvedOptions().timeZone),
    language: z.string().default('en'),
    preferredGameMode: z.enum(['osu', 'taiko', 'fruits', 'mania']).default('osu'),
    showOnlineStatus: z.boolean().default(true),
    allowFriendRequests: z.boolean().default(true),
    allowPrivateMessages: z.boolean().default(true),
    filterOffensiveWords: z.boolean().default(true),
}).strict();

/**
 * Directory settings validation
 */
export const DirectorySettingsSchema = z.object({
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
export const DebugSettingsSchema = z.object({
    enableDebugMode: z.boolean().default(false),
    showDebugInfo: z.boolean().default(false),
    logLevel: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
    enablePerformanceLogging: z.boolean().default(false),
    verboseLogging: z.boolean().default(false),
    saveDebugLogs: z.boolean().default(false),
    enableHotReload: z.boolean().default(false),
    showPhysicsDebug: z.boolean().default(false),
    showAudioDebug: z.boolean().default(false),
    enableExperimentalFeatures: z.boolean().default(false),
}).strict();

/**
 * Accessibility settings validation
 */
export const AccessibilitySettingsSchema = z.object({
    enableHighContrast: z.boolean().default(false),
    enableColorBlindSupport: z.boolean().default(false),
    colorBlindType: z.enum(['none', 'protanopia', 'deuteranopia', 'tritanopia']).default('none'),
    enableScreenReader: z.boolean().default(false),
    enableKeyboardNavigation: z.boolean().default(false),
    reducedMotion: z.boolean().default(false),
    largerCursor: z.boolean().default(false),
    enableSoundCues: z.boolean().default(false),
    enableHapticFeedback: z.boolean().default(false),
}).strict();

/**
 * Complete user settings schema
 */
export const UserSettingsSchema = z.object({
    profile: UserProfileSchema,
    audio: AudioSettingsSchema,
    visual: VisualSettingsSchema,
    input: InputSettingsSchema,
    gameplay: GameplaySettingsSchema,
    skin: SkinSettingsSchema,
    performance: PerformanceSettingsSchema,
    network: NetworkSettingsSchema,
    directories: DirectorySettingsSchema,
    debug: DebugSettingsSchema,
    accessibility: AccessibilitySettingsSchema,

    // Metadata
    version: z.string().default('1.0.0'),
    lastModified: z.date().default(() => new Date()),
    migrationVersion: z.number().int().default(1),
}).strict();

/**
 * Settings validation for specific operations
 */
export const SettingsImportSchema = z.object({
    filePath: NonEmptyString,
    mergeStrategy: z.enum(['replace', 'merge', 'selective']).default('merge'),
    backupCurrent: z.boolean().default(true),
    validateBeforeImport: z.boolean().default(true),
}).strict();

export const SettingsExportSchema = z.object({
    filePath: NonEmptyString.optional(),
    includeProfile: z.boolean().default(true),
    includeSettings: z.boolean().default(true),
    includeKeybindings: z.boolean().default(true),
    includeDirectories: z.boolean().default(false),
    format: z.enum(['json', 'yaml', 'ini']).default('json'),
    encrypt: z.boolean().default(false),
}).strict();

/**
 * Settings patch schema for partial updates
 */
export const SettingsPatchSchema = z.object({
    path: NonEmptyString, // e.g., "audio.masterVolume" or "visual.backgroundDim"
    value: z.unknown(),
    operation: z.enum(['set', 'merge', 'delete']).default('set'),
}).strict();

/**
 * Settings validation result
 */
export const SettingsValidationResultSchema = z.object({
    isValid: z.boolean(),
    errors: z.array(z.object({
        path: z.string(),
        message: z.string(),
        code: z.string(),
        severity: z.enum(['error', 'warning', 'info']),
    })).default([]),
    migrations: z.array(z.object({
        from: z.string(),
        to: z.string(),
        description: z.string(),
        applied: z.boolean(),
    })).default([]),
    warnings: z.array(z.string()).default([]),
}).strict();

/**
 * Export all settings schemas
 */
export const SettingsSchemas = {
    // Core settings
    UserSettings: UserSettingsSchema,
    Profile: UserProfileSchema,
    Audio: AudioSettingsSchema,
    Visual: VisualSettingsSchema,
    Input: InputSettingsSchema,
    Gameplay: GameplaySettingsSchema,
    Skin: SkinSettingsSchema,
    Performance: PerformanceSettingsSchema,
    Network: NetworkSettingsSchema,
    Directories: DirectorySettingsSchema,
    Debug: DebugSettingsSchema,
    Accessibility: AccessibilitySettingsSchema,

    // Operations
    Import: SettingsImportSchema,
    Export: SettingsExportSchema,
    Patch: SettingsPatchSchema,
    ValidationResult: SettingsValidationResultSchema,
} as const;

// Type exports for TypeScript
export type ValidatedUserSettings = z.infer<typeof UserSettingsSchema>;
export type ValidatedAudioSettings = z.infer<typeof AudioSettingsSchema>;
export type ValidatedVisualSettings = z.infer<typeof VisualSettingsSchema>;
export type ValidatedInputSettings = z.infer<typeof InputSettingsSchema>;
export type ValidatedGameplaySettings = z.infer<typeof GameplaySettingsSchema>;
export type ValidatedSettingsImport = z.infer<typeof SettingsImportSchema>;
export type ValidatedSettingsExport = z.infer<typeof SettingsExportSchema>;
export type ValidatedSettingsPatch = z.infer<typeof SettingsPatchSchema>;
export type ValidatedSettingsValidationResult = z.infer<typeof SettingsValidationResultSchema>;
