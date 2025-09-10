/**
 * Zod schemas for game settings and user preferences
 * Type-safe validation for all configuration options
 */
import { z } from 'zod';
/**
 * Audio settings validation
 */
export declare const AudioSettingsSchema: z.ZodObject<{
    masterVolume: z.ZodDefault<z.ZodNumber>;
    musicVolume: z.ZodDefault<z.ZodNumber>;
    effectVolume: z.ZodDefault<z.ZodNumber>;
    audioOffset: z.ZodDefault<z.ZodNumber>;
    audioDevice: z.ZodDefault<z.ZodObject<{
        inputDeviceId: z.ZodOptional<z.ZodString>;
        outputDeviceId: z.ZodOptional<z.ZodString>;
        sampleRate: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<44100>, z.ZodLiteral<48000>, z.ZodLiteral<88200>, z.ZodLiteral<96000>]>>;
        bufferSize: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<128>, z.ZodLiteral<256>, z.ZodLiteral<512>, z.ZodLiteral<1024>, z.ZodLiteral<2048>, z.ZodLiteral<4096>]>>;
        exclusiveMode: z.ZodDefault<z.ZodBoolean>;
    }, z.core.$strip>>;
}, z.core.$strict>;
/**
 * Visual settings validation
 */
export declare const VisualSettingsSchema: z.ZodObject<{
    backgroundDim: z.ZodDefault<z.ZodNumber>;
    showApproachCircles: z.ZodDefault<z.ZodBoolean>;
    showHitLighting: z.ZodDefault<z.ZodBoolean>;
    showComboFire: z.ZodDefault<z.ZodBoolean>;
    showComboBreak: z.ZodDefault<z.ZodBoolean>;
    showScoreOverlay: z.ZodDefault<z.ZodBoolean>;
    showHealthBar: z.ZodDefault<z.ZodBoolean>;
    showProgressBar: z.ZodDefault<z.ZodBoolean>;
    showKeyOverlay: z.ZodDefault<z.ZodBoolean>;
    alwaysShowKeyOverlay: z.ZodDefault<z.ZodBoolean>;
    showInterface: z.ZodDefault<z.ZodBoolean>;
    cursorSize: z.ZodDefault<z.ZodNumber>;
    cursorTrail: z.ZodDefault<z.ZodBoolean>;
    cursorRipples: z.ZodDefault<z.ZodBoolean>;
    hitErrorBar: z.ZodDefault<z.ZodBoolean>;
    progressBarType: z.ZodDefault<z.ZodEnum<{
        none: "none";
        pie: "pie";
        topRight: "topRight";
        bottomRight: "bottomRight";
    }>>;
    scoreDisplayType: z.ZodDefault<z.ZodEnum<{
        score: "score";
        accuracy: "accuracy";
        none: "none";
        both: "both";
    }>>;
    comboBurst: z.ZodDefault<z.ZodBoolean>;
    hitLighting: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strict>;
/**
 * Input settings validation
 */
export declare const InputSettingsSchema: z.ZodObject<{
    keyBindings: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodString>>;
    mouseDisableWheel: z.ZodDefault<z.ZodBoolean>;
    mouseDisableButtons: z.ZodDefault<z.ZodBoolean>;
    rawInput: z.ZodDefault<z.ZodBoolean>;
    mouseSensitivity: z.ZodDefault<z.ZodNumber>;
    tabletSupport: z.ZodDefault<z.ZodBoolean>;
    wiimoteSupport: z.ZodDefault<z.ZodBoolean>;
    confineMouseCursor: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strict>;
/**
 * Gameplay settings validation
 */
export declare const GameplaySettingsSchema: z.ZodObject<{
    backgroundVideo: z.ZodDefault<z.ZodBoolean>;
    storyboard: z.ZodDefault<z.ZodBoolean>;
    comboBursts: z.ZodDefault<z.ZodBoolean>;
    hitSounds: z.ZodDefault<z.ZodBoolean>;
    ignoreBeatmapHitSounds: z.ZodDefault<z.ZodBoolean>;
    ignoreBeatmapSkin: z.ZodDefault<z.ZodBoolean>;
    disableWheelInGameplay: z.ZodDefault<z.ZodBoolean>;
    disableClicksInGameplay: z.ZodDefault<z.ZodBoolean>;
    bossModeOnBreaks: z.ZodDefault<z.ZodBoolean>;
    automaticCursorSize: z.ZodDefault<z.ZodBoolean>;
    saveFailedReplays: z.ZodDefault<z.ZodBoolean>;
    floatingComments: z.ZodDefault<z.ZodBoolean>;
    showInterfaceDuringRelax: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strict>;
/**
 * Skin settings validation
 */
export declare const SkinSettingsSchema: z.ZodObject<{
    currentSkin: z.ZodDefault<z.ZodString>;
    ignoreAllBeatmapSkins: z.ZodDefault<z.ZodBoolean>;
    skinSampleVolume: z.ZodDefault<z.ZodNumber>;
    useDefaultSkinCursor: z.ZodDefault<z.ZodBoolean>;
    cursorExpand: z.ZodDefault<z.ZodBoolean>;
    cursorCenterOnSelection: z.ZodDefault<z.ZodBoolean>;
    alwaysUseDefaultCursor: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strict>;
/**
 * Performance settings validation
 */
export declare const PerformanceSettingsSchema: z.ZodObject<{
    frameLimit: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<"unlimited">, z.ZodLiteral<"vsync">, z.ZodNumber]>>;
    compatibilityMode: z.ZodDefault<z.ZodBoolean>;
    reduceDroppedFrames: z.ZodDefault<z.ZodBoolean>;
    detectPerformanceIssues: z.ZodDefault<z.ZodBoolean>;
    lowLatencyAudio: z.ZodDefault<z.ZodBoolean>;
    threadedOptimization: z.ZodDefault<z.ZodBoolean>;
    showFPSCounter: z.ZodDefault<z.ZodBoolean>;
    enableGarbageCollection: z.ZodDefault<z.ZodBoolean>;
    memoryOptimization: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strict>;
/**
 * Network settings validation
 */
export declare const NetworkSettingsSchema: z.ZodObject<{
    automaticDownloads: z.ZodDefault<z.ZodBoolean>;
    noVideoDownloads: z.ZodDefault<z.ZodBoolean>;
    preferMirrorServer: z.ZodDefault<z.ZodBoolean>;
    enableMultiplayer: z.ZodDefault<z.ZodBoolean>;
    spectatorMode: z.ZodDefault<z.ZodBoolean>;
    autoJoinIRC: z.ZodDefault<z.ZodBoolean>;
    enableNotifications: z.ZodDefault<z.ZodBoolean>;
    proxySettings: z.ZodDefault<z.ZodObject<{
        enabled: z.ZodDefault<z.ZodBoolean>;
        host: z.ZodDefault<z.ZodString>;
        port: z.ZodDefault<z.ZodNumber>;
        username: z.ZodDefault<z.ZodString>;
        password: z.ZodDefault<z.ZodString>;
    }, z.core.$strip>>;
}, z.core.$strict>;
/**
 * User profile validation
 */
export declare const UserProfileSchema: z.ZodObject<{
    username: z.ZodDefault<z.ZodString>;
    avatar: z.ZodOptional<z.ZodString>;
    country: z.ZodDefault<z.ZodString>;
    timezone: z.ZodDefault<z.ZodString>;
    language: z.ZodDefault<z.ZodString>;
    preferredGameMode: z.ZodDefault<z.ZodEnum<{
        osu: "osu";
        taiko: "taiko";
        fruits: "fruits";
        mania: "mania";
    }>>;
    showOnlineStatus: z.ZodDefault<z.ZodBoolean>;
    allowFriendRequests: z.ZodDefault<z.ZodBoolean>;
    allowPrivateMessages: z.ZodDefault<z.ZodBoolean>;
    filterOffensiveWords: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strict>;
/**
 * Directory settings validation
 */
export declare const DirectorySettingsSchema: z.ZodObject<{
    chartLibrary: z.ZodDefault<z.ZodString>;
    cache: z.ZodDefault<z.ZodString>;
    logs: z.ZodDefault<z.ZodString>;
    recordings: z.ZodDefault<z.ZodString>;
    replays: z.ZodDefault<z.ZodString>;
    screenshots: z.ZodDefault<z.ZodString>;
    skins: z.ZodDefault<z.ZodString>;
    themes: z.ZodDefault<z.ZodString>;
    temporary: z.ZodDefault<z.ZodString>;
}, z.core.$strict>;
/**
 * Debug settings validation (for development)
 */
export declare const DebugSettingsSchema: z.ZodObject<{
    enableDebugMode: z.ZodDefault<z.ZodBoolean>;
    showDebugInfo: z.ZodDefault<z.ZodBoolean>;
    logLevel: z.ZodDefault<z.ZodEnum<{
        debug: "debug";
        info: "info";
        warn: "warn";
        error: "error";
    }>>;
    enablePerformanceLogging: z.ZodDefault<z.ZodBoolean>;
    verboseLogging: z.ZodDefault<z.ZodBoolean>;
    saveDebugLogs: z.ZodDefault<z.ZodBoolean>;
    enableHotReload: z.ZodDefault<z.ZodBoolean>;
    showPhysicsDebug: z.ZodDefault<z.ZodBoolean>;
    showAudioDebug: z.ZodDefault<z.ZodBoolean>;
    enableExperimentalFeatures: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strict>;
/**
 * Accessibility settings validation
 */
export declare const AccessibilitySettingsSchema: z.ZodObject<{
    enableHighContrast: z.ZodDefault<z.ZodBoolean>;
    enableColorBlindSupport: z.ZodDefault<z.ZodBoolean>;
    colorBlindType: z.ZodDefault<z.ZodEnum<{
        none: "none";
        protanopia: "protanopia";
        deuteranopia: "deuteranopia";
        tritanopia: "tritanopia";
    }>>;
    enableScreenReader: z.ZodDefault<z.ZodBoolean>;
    enableKeyboardNavigation: z.ZodDefault<z.ZodBoolean>;
    reducedMotion: z.ZodDefault<z.ZodBoolean>;
    largerCursor: z.ZodDefault<z.ZodBoolean>;
    enableSoundCues: z.ZodDefault<z.ZodBoolean>;
    enableHapticFeedback: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strict>;
/**
 * Complete user settings schema
 */
export declare const UserSettingsSchema: z.ZodObject<{
    profile: z.ZodObject<{
        username: z.ZodDefault<z.ZodString>;
        avatar: z.ZodOptional<z.ZodString>;
        country: z.ZodDefault<z.ZodString>;
        timezone: z.ZodDefault<z.ZodString>;
        language: z.ZodDefault<z.ZodString>;
        preferredGameMode: z.ZodDefault<z.ZodEnum<{
            osu: "osu";
            taiko: "taiko";
            fruits: "fruits";
            mania: "mania";
        }>>;
        showOnlineStatus: z.ZodDefault<z.ZodBoolean>;
        allowFriendRequests: z.ZodDefault<z.ZodBoolean>;
        allowPrivateMessages: z.ZodDefault<z.ZodBoolean>;
        filterOffensiveWords: z.ZodDefault<z.ZodBoolean>;
    }, z.core.$strict>;
    audio: z.ZodObject<{
        masterVolume: z.ZodDefault<z.ZodNumber>;
        musicVolume: z.ZodDefault<z.ZodNumber>;
        effectVolume: z.ZodDefault<z.ZodNumber>;
        audioOffset: z.ZodDefault<z.ZodNumber>;
        audioDevice: z.ZodDefault<z.ZodObject<{
            inputDeviceId: z.ZodOptional<z.ZodString>;
            outputDeviceId: z.ZodOptional<z.ZodString>;
            sampleRate: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<44100>, z.ZodLiteral<48000>, z.ZodLiteral<88200>, z.ZodLiteral<96000>]>>;
            bufferSize: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<128>, z.ZodLiteral<256>, z.ZodLiteral<512>, z.ZodLiteral<1024>, z.ZodLiteral<2048>, z.ZodLiteral<4096>]>>;
            exclusiveMode: z.ZodDefault<z.ZodBoolean>;
        }, z.core.$strip>>;
    }, z.core.$strict>;
    visual: z.ZodObject<{
        backgroundDim: z.ZodDefault<z.ZodNumber>;
        showApproachCircles: z.ZodDefault<z.ZodBoolean>;
        showHitLighting: z.ZodDefault<z.ZodBoolean>;
        showComboFire: z.ZodDefault<z.ZodBoolean>;
        showComboBreak: z.ZodDefault<z.ZodBoolean>;
        showScoreOverlay: z.ZodDefault<z.ZodBoolean>;
        showHealthBar: z.ZodDefault<z.ZodBoolean>;
        showProgressBar: z.ZodDefault<z.ZodBoolean>;
        showKeyOverlay: z.ZodDefault<z.ZodBoolean>;
        alwaysShowKeyOverlay: z.ZodDefault<z.ZodBoolean>;
        showInterface: z.ZodDefault<z.ZodBoolean>;
        cursorSize: z.ZodDefault<z.ZodNumber>;
        cursorTrail: z.ZodDefault<z.ZodBoolean>;
        cursorRipples: z.ZodDefault<z.ZodBoolean>;
        hitErrorBar: z.ZodDefault<z.ZodBoolean>;
        progressBarType: z.ZodDefault<z.ZodEnum<{
            none: "none";
            pie: "pie";
            topRight: "topRight";
            bottomRight: "bottomRight";
        }>>;
        scoreDisplayType: z.ZodDefault<z.ZodEnum<{
            score: "score";
            accuracy: "accuracy";
            none: "none";
            both: "both";
        }>>;
        comboBurst: z.ZodDefault<z.ZodBoolean>;
        hitLighting: z.ZodDefault<z.ZodBoolean>;
    }, z.core.$strict>;
    input: z.ZodObject<{
        keyBindings: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodString>>;
        mouseDisableWheel: z.ZodDefault<z.ZodBoolean>;
        mouseDisableButtons: z.ZodDefault<z.ZodBoolean>;
        rawInput: z.ZodDefault<z.ZodBoolean>;
        mouseSensitivity: z.ZodDefault<z.ZodNumber>;
        tabletSupport: z.ZodDefault<z.ZodBoolean>;
        wiimoteSupport: z.ZodDefault<z.ZodBoolean>;
        confineMouseCursor: z.ZodDefault<z.ZodBoolean>;
    }, z.core.$strict>;
    gameplay: z.ZodObject<{
        backgroundVideo: z.ZodDefault<z.ZodBoolean>;
        storyboard: z.ZodDefault<z.ZodBoolean>;
        comboBursts: z.ZodDefault<z.ZodBoolean>;
        hitSounds: z.ZodDefault<z.ZodBoolean>;
        ignoreBeatmapHitSounds: z.ZodDefault<z.ZodBoolean>;
        ignoreBeatmapSkin: z.ZodDefault<z.ZodBoolean>;
        disableWheelInGameplay: z.ZodDefault<z.ZodBoolean>;
        disableClicksInGameplay: z.ZodDefault<z.ZodBoolean>;
        bossModeOnBreaks: z.ZodDefault<z.ZodBoolean>;
        automaticCursorSize: z.ZodDefault<z.ZodBoolean>;
        saveFailedReplays: z.ZodDefault<z.ZodBoolean>;
        floatingComments: z.ZodDefault<z.ZodBoolean>;
        showInterfaceDuringRelax: z.ZodDefault<z.ZodBoolean>;
    }, z.core.$strict>;
    skin: z.ZodObject<{
        currentSkin: z.ZodDefault<z.ZodString>;
        ignoreAllBeatmapSkins: z.ZodDefault<z.ZodBoolean>;
        skinSampleVolume: z.ZodDefault<z.ZodNumber>;
        useDefaultSkinCursor: z.ZodDefault<z.ZodBoolean>;
        cursorExpand: z.ZodDefault<z.ZodBoolean>;
        cursorCenterOnSelection: z.ZodDefault<z.ZodBoolean>;
        alwaysUseDefaultCursor: z.ZodDefault<z.ZodBoolean>;
    }, z.core.$strict>;
    performance: z.ZodObject<{
        frameLimit: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<"unlimited">, z.ZodLiteral<"vsync">, z.ZodNumber]>>;
        compatibilityMode: z.ZodDefault<z.ZodBoolean>;
        reduceDroppedFrames: z.ZodDefault<z.ZodBoolean>;
        detectPerformanceIssues: z.ZodDefault<z.ZodBoolean>;
        lowLatencyAudio: z.ZodDefault<z.ZodBoolean>;
        threadedOptimization: z.ZodDefault<z.ZodBoolean>;
        showFPSCounter: z.ZodDefault<z.ZodBoolean>;
        enableGarbageCollection: z.ZodDefault<z.ZodBoolean>;
        memoryOptimization: z.ZodDefault<z.ZodBoolean>;
    }, z.core.$strict>;
    network: z.ZodObject<{
        automaticDownloads: z.ZodDefault<z.ZodBoolean>;
        noVideoDownloads: z.ZodDefault<z.ZodBoolean>;
        preferMirrorServer: z.ZodDefault<z.ZodBoolean>;
        enableMultiplayer: z.ZodDefault<z.ZodBoolean>;
        spectatorMode: z.ZodDefault<z.ZodBoolean>;
        autoJoinIRC: z.ZodDefault<z.ZodBoolean>;
        enableNotifications: z.ZodDefault<z.ZodBoolean>;
        proxySettings: z.ZodDefault<z.ZodObject<{
            enabled: z.ZodDefault<z.ZodBoolean>;
            host: z.ZodDefault<z.ZodString>;
            port: z.ZodDefault<z.ZodNumber>;
            username: z.ZodDefault<z.ZodString>;
            password: z.ZodDefault<z.ZodString>;
        }, z.core.$strip>>;
    }, z.core.$strict>;
    directories: z.ZodObject<{
        chartLibrary: z.ZodDefault<z.ZodString>;
        cache: z.ZodDefault<z.ZodString>;
        logs: z.ZodDefault<z.ZodString>;
        recordings: z.ZodDefault<z.ZodString>;
        replays: z.ZodDefault<z.ZodString>;
        screenshots: z.ZodDefault<z.ZodString>;
        skins: z.ZodDefault<z.ZodString>;
        themes: z.ZodDefault<z.ZodString>;
        temporary: z.ZodDefault<z.ZodString>;
    }, z.core.$strict>;
    debug: z.ZodObject<{
        enableDebugMode: z.ZodDefault<z.ZodBoolean>;
        showDebugInfo: z.ZodDefault<z.ZodBoolean>;
        logLevel: z.ZodDefault<z.ZodEnum<{
            debug: "debug";
            info: "info";
            warn: "warn";
            error: "error";
        }>>;
        enablePerformanceLogging: z.ZodDefault<z.ZodBoolean>;
        verboseLogging: z.ZodDefault<z.ZodBoolean>;
        saveDebugLogs: z.ZodDefault<z.ZodBoolean>;
        enableHotReload: z.ZodDefault<z.ZodBoolean>;
        showPhysicsDebug: z.ZodDefault<z.ZodBoolean>;
        showAudioDebug: z.ZodDefault<z.ZodBoolean>;
        enableExperimentalFeatures: z.ZodDefault<z.ZodBoolean>;
    }, z.core.$strict>;
    accessibility: z.ZodObject<{
        enableHighContrast: z.ZodDefault<z.ZodBoolean>;
        enableColorBlindSupport: z.ZodDefault<z.ZodBoolean>;
        colorBlindType: z.ZodDefault<z.ZodEnum<{
            none: "none";
            protanopia: "protanopia";
            deuteranopia: "deuteranopia";
            tritanopia: "tritanopia";
        }>>;
        enableScreenReader: z.ZodDefault<z.ZodBoolean>;
        enableKeyboardNavigation: z.ZodDefault<z.ZodBoolean>;
        reducedMotion: z.ZodDefault<z.ZodBoolean>;
        largerCursor: z.ZodDefault<z.ZodBoolean>;
        enableSoundCues: z.ZodDefault<z.ZodBoolean>;
        enableHapticFeedback: z.ZodDefault<z.ZodBoolean>;
    }, z.core.$strict>;
    version: z.ZodDefault<z.ZodString>;
    lastModified: z.ZodDefault<z.ZodDate>;
    migrationVersion: z.ZodDefault<z.ZodNumber>;
}, z.core.$strict>;
/**
 * Settings validation for specific operations
 */
export declare const SettingsImportSchema: z.ZodObject<{
    filePath: z.ZodString;
    mergeStrategy: z.ZodDefault<z.ZodEnum<{
        replace: "replace";
        merge: "merge";
        selective: "selective";
    }>>;
    backupCurrent: z.ZodDefault<z.ZodBoolean>;
    validateBeforeImport: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strict>;
export declare const SettingsExportSchema: z.ZodObject<{
    filePath: z.ZodOptional<z.ZodString>;
    includeProfile: z.ZodDefault<z.ZodBoolean>;
    includeSettings: z.ZodDefault<z.ZodBoolean>;
    includeKeybindings: z.ZodDefault<z.ZodBoolean>;
    includeDirectories: z.ZodDefault<z.ZodBoolean>;
    format: z.ZodDefault<z.ZodEnum<{
        json: "json";
        yaml: "yaml";
        ini: "ini";
    }>>;
    encrypt: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strict>;
/**
 * Settings patch schema for partial updates
 */
export declare const SettingsPatchSchema: z.ZodObject<{
    path: z.ZodString;
    value: z.ZodUnknown;
    operation: z.ZodDefault<z.ZodEnum<{
        set: "set";
        delete: "delete";
        merge: "merge";
    }>>;
}, z.core.$strict>;
/**
 * Settings validation result
 */
export declare const SettingsValidationResultSchema: z.ZodObject<{
    isValid: z.ZodBoolean;
    errors: z.ZodDefault<z.ZodArray<z.ZodObject<{
        path: z.ZodString;
        message: z.ZodString;
        code: z.ZodString;
        severity: z.ZodEnum<{
            info: "info";
            error: "error";
            warning: "warning";
        }>;
    }, z.core.$strip>>>;
    migrations: z.ZodDefault<z.ZodArray<z.ZodObject<{
        from: z.ZodString;
        to: z.ZodString;
        description: z.ZodString;
        applied: z.ZodBoolean;
    }, z.core.$strip>>>;
    warnings: z.ZodDefault<z.ZodArray<z.ZodString>>;
}, z.core.$strict>;
/**
 * Export all settings schemas
 */
export declare const SettingsSchemas: {
    readonly UserSettings: z.ZodObject<{
        profile: z.ZodObject<{
            username: z.ZodDefault<z.ZodString>;
            avatar: z.ZodOptional<z.ZodString>;
            country: z.ZodDefault<z.ZodString>;
            timezone: z.ZodDefault<z.ZodString>;
            language: z.ZodDefault<z.ZodString>;
            preferredGameMode: z.ZodDefault<z.ZodEnum<{
                osu: "osu";
                taiko: "taiko";
                fruits: "fruits";
                mania: "mania";
            }>>;
            showOnlineStatus: z.ZodDefault<z.ZodBoolean>;
            allowFriendRequests: z.ZodDefault<z.ZodBoolean>;
            allowPrivateMessages: z.ZodDefault<z.ZodBoolean>;
            filterOffensiveWords: z.ZodDefault<z.ZodBoolean>;
        }, z.core.$strict>;
        audio: z.ZodObject<{
            masterVolume: z.ZodDefault<z.ZodNumber>;
            musicVolume: z.ZodDefault<z.ZodNumber>;
            effectVolume: z.ZodDefault<z.ZodNumber>;
            audioOffset: z.ZodDefault<z.ZodNumber>;
            audioDevice: z.ZodDefault<z.ZodObject<{
                inputDeviceId: z.ZodOptional<z.ZodString>;
                outputDeviceId: z.ZodOptional<z.ZodString>;
                sampleRate: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<44100>, z.ZodLiteral<48000>, z.ZodLiteral<88200>, z.ZodLiteral<96000>]>>;
                bufferSize: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<128>, z.ZodLiteral<256>, z.ZodLiteral<512>, z.ZodLiteral<1024>, z.ZodLiteral<2048>, z.ZodLiteral<4096>]>>;
                exclusiveMode: z.ZodDefault<z.ZodBoolean>;
            }, z.core.$strip>>;
        }, z.core.$strict>;
        visual: z.ZodObject<{
            backgroundDim: z.ZodDefault<z.ZodNumber>;
            showApproachCircles: z.ZodDefault<z.ZodBoolean>;
            showHitLighting: z.ZodDefault<z.ZodBoolean>;
            showComboFire: z.ZodDefault<z.ZodBoolean>;
            showComboBreak: z.ZodDefault<z.ZodBoolean>;
            showScoreOverlay: z.ZodDefault<z.ZodBoolean>;
            showHealthBar: z.ZodDefault<z.ZodBoolean>;
            showProgressBar: z.ZodDefault<z.ZodBoolean>;
            showKeyOverlay: z.ZodDefault<z.ZodBoolean>;
            alwaysShowKeyOverlay: z.ZodDefault<z.ZodBoolean>;
            showInterface: z.ZodDefault<z.ZodBoolean>;
            cursorSize: z.ZodDefault<z.ZodNumber>;
            cursorTrail: z.ZodDefault<z.ZodBoolean>;
            cursorRipples: z.ZodDefault<z.ZodBoolean>;
            hitErrorBar: z.ZodDefault<z.ZodBoolean>;
            progressBarType: z.ZodDefault<z.ZodEnum<{
                none: "none";
                pie: "pie";
                topRight: "topRight";
                bottomRight: "bottomRight";
            }>>;
            scoreDisplayType: z.ZodDefault<z.ZodEnum<{
                score: "score";
                accuracy: "accuracy";
                none: "none";
                both: "both";
            }>>;
            comboBurst: z.ZodDefault<z.ZodBoolean>;
            hitLighting: z.ZodDefault<z.ZodBoolean>;
        }, z.core.$strict>;
        input: z.ZodObject<{
            keyBindings: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodString>>;
            mouseDisableWheel: z.ZodDefault<z.ZodBoolean>;
            mouseDisableButtons: z.ZodDefault<z.ZodBoolean>;
            rawInput: z.ZodDefault<z.ZodBoolean>;
            mouseSensitivity: z.ZodDefault<z.ZodNumber>;
            tabletSupport: z.ZodDefault<z.ZodBoolean>;
            wiimoteSupport: z.ZodDefault<z.ZodBoolean>;
            confineMouseCursor: z.ZodDefault<z.ZodBoolean>;
        }, z.core.$strict>;
        gameplay: z.ZodObject<{
            backgroundVideo: z.ZodDefault<z.ZodBoolean>;
            storyboard: z.ZodDefault<z.ZodBoolean>;
            comboBursts: z.ZodDefault<z.ZodBoolean>;
            hitSounds: z.ZodDefault<z.ZodBoolean>;
            ignoreBeatmapHitSounds: z.ZodDefault<z.ZodBoolean>;
            ignoreBeatmapSkin: z.ZodDefault<z.ZodBoolean>;
            disableWheelInGameplay: z.ZodDefault<z.ZodBoolean>;
            disableClicksInGameplay: z.ZodDefault<z.ZodBoolean>;
            bossModeOnBreaks: z.ZodDefault<z.ZodBoolean>;
            automaticCursorSize: z.ZodDefault<z.ZodBoolean>;
            saveFailedReplays: z.ZodDefault<z.ZodBoolean>;
            floatingComments: z.ZodDefault<z.ZodBoolean>;
            showInterfaceDuringRelax: z.ZodDefault<z.ZodBoolean>;
        }, z.core.$strict>;
        skin: z.ZodObject<{
            currentSkin: z.ZodDefault<z.ZodString>;
            ignoreAllBeatmapSkins: z.ZodDefault<z.ZodBoolean>;
            skinSampleVolume: z.ZodDefault<z.ZodNumber>;
            useDefaultSkinCursor: z.ZodDefault<z.ZodBoolean>;
            cursorExpand: z.ZodDefault<z.ZodBoolean>;
            cursorCenterOnSelection: z.ZodDefault<z.ZodBoolean>;
            alwaysUseDefaultCursor: z.ZodDefault<z.ZodBoolean>;
        }, z.core.$strict>;
        performance: z.ZodObject<{
            frameLimit: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<"unlimited">, z.ZodLiteral<"vsync">, z.ZodNumber]>>;
            compatibilityMode: z.ZodDefault<z.ZodBoolean>;
            reduceDroppedFrames: z.ZodDefault<z.ZodBoolean>;
            detectPerformanceIssues: z.ZodDefault<z.ZodBoolean>;
            lowLatencyAudio: z.ZodDefault<z.ZodBoolean>;
            threadedOptimization: z.ZodDefault<z.ZodBoolean>;
            showFPSCounter: z.ZodDefault<z.ZodBoolean>;
            enableGarbageCollection: z.ZodDefault<z.ZodBoolean>;
            memoryOptimization: z.ZodDefault<z.ZodBoolean>;
        }, z.core.$strict>;
        network: z.ZodObject<{
            automaticDownloads: z.ZodDefault<z.ZodBoolean>;
            noVideoDownloads: z.ZodDefault<z.ZodBoolean>;
            preferMirrorServer: z.ZodDefault<z.ZodBoolean>;
            enableMultiplayer: z.ZodDefault<z.ZodBoolean>;
            spectatorMode: z.ZodDefault<z.ZodBoolean>;
            autoJoinIRC: z.ZodDefault<z.ZodBoolean>;
            enableNotifications: z.ZodDefault<z.ZodBoolean>;
            proxySettings: z.ZodDefault<z.ZodObject<{
                enabled: z.ZodDefault<z.ZodBoolean>;
                host: z.ZodDefault<z.ZodString>;
                port: z.ZodDefault<z.ZodNumber>;
                username: z.ZodDefault<z.ZodString>;
                password: z.ZodDefault<z.ZodString>;
            }, z.core.$strip>>;
        }, z.core.$strict>;
        directories: z.ZodObject<{
            chartLibrary: z.ZodDefault<z.ZodString>;
            cache: z.ZodDefault<z.ZodString>;
            logs: z.ZodDefault<z.ZodString>;
            recordings: z.ZodDefault<z.ZodString>;
            replays: z.ZodDefault<z.ZodString>;
            screenshots: z.ZodDefault<z.ZodString>;
            skins: z.ZodDefault<z.ZodString>;
            themes: z.ZodDefault<z.ZodString>;
            temporary: z.ZodDefault<z.ZodString>;
        }, z.core.$strict>;
        debug: z.ZodObject<{
            enableDebugMode: z.ZodDefault<z.ZodBoolean>;
            showDebugInfo: z.ZodDefault<z.ZodBoolean>;
            logLevel: z.ZodDefault<z.ZodEnum<{
                debug: "debug";
                info: "info";
                warn: "warn";
                error: "error";
            }>>;
            enablePerformanceLogging: z.ZodDefault<z.ZodBoolean>;
            verboseLogging: z.ZodDefault<z.ZodBoolean>;
            saveDebugLogs: z.ZodDefault<z.ZodBoolean>;
            enableHotReload: z.ZodDefault<z.ZodBoolean>;
            showPhysicsDebug: z.ZodDefault<z.ZodBoolean>;
            showAudioDebug: z.ZodDefault<z.ZodBoolean>;
            enableExperimentalFeatures: z.ZodDefault<z.ZodBoolean>;
        }, z.core.$strict>;
        accessibility: z.ZodObject<{
            enableHighContrast: z.ZodDefault<z.ZodBoolean>;
            enableColorBlindSupport: z.ZodDefault<z.ZodBoolean>;
            colorBlindType: z.ZodDefault<z.ZodEnum<{
                none: "none";
                protanopia: "protanopia";
                deuteranopia: "deuteranopia";
                tritanopia: "tritanopia";
            }>>;
            enableScreenReader: z.ZodDefault<z.ZodBoolean>;
            enableKeyboardNavigation: z.ZodDefault<z.ZodBoolean>;
            reducedMotion: z.ZodDefault<z.ZodBoolean>;
            largerCursor: z.ZodDefault<z.ZodBoolean>;
            enableSoundCues: z.ZodDefault<z.ZodBoolean>;
            enableHapticFeedback: z.ZodDefault<z.ZodBoolean>;
        }, z.core.$strict>;
        version: z.ZodDefault<z.ZodString>;
        lastModified: z.ZodDefault<z.ZodDate>;
        migrationVersion: z.ZodDefault<z.ZodNumber>;
    }, z.core.$strict>;
    readonly Profile: z.ZodObject<{
        username: z.ZodDefault<z.ZodString>;
        avatar: z.ZodOptional<z.ZodString>;
        country: z.ZodDefault<z.ZodString>;
        timezone: z.ZodDefault<z.ZodString>;
        language: z.ZodDefault<z.ZodString>;
        preferredGameMode: z.ZodDefault<z.ZodEnum<{
            osu: "osu";
            taiko: "taiko";
            fruits: "fruits";
            mania: "mania";
        }>>;
        showOnlineStatus: z.ZodDefault<z.ZodBoolean>;
        allowFriendRequests: z.ZodDefault<z.ZodBoolean>;
        allowPrivateMessages: z.ZodDefault<z.ZodBoolean>;
        filterOffensiveWords: z.ZodDefault<z.ZodBoolean>;
    }, z.core.$strict>;
    readonly Audio: z.ZodObject<{
        masterVolume: z.ZodDefault<z.ZodNumber>;
        musicVolume: z.ZodDefault<z.ZodNumber>;
        effectVolume: z.ZodDefault<z.ZodNumber>;
        audioOffset: z.ZodDefault<z.ZodNumber>;
        audioDevice: z.ZodDefault<z.ZodObject<{
            inputDeviceId: z.ZodOptional<z.ZodString>;
            outputDeviceId: z.ZodOptional<z.ZodString>;
            sampleRate: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<44100>, z.ZodLiteral<48000>, z.ZodLiteral<88200>, z.ZodLiteral<96000>]>>;
            bufferSize: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<128>, z.ZodLiteral<256>, z.ZodLiteral<512>, z.ZodLiteral<1024>, z.ZodLiteral<2048>, z.ZodLiteral<4096>]>>;
            exclusiveMode: z.ZodDefault<z.ZodBoolean>;
        }, z.core.$strip>>;
    }, z.core.$strict>;
    readonly Visual: z.ZodObject<{
        backgroundDim: z.ZodDefault<z.ZodNumber>;
        showApproachCircles: z.ZodDefault<z.ZodBoolean>;
        showHitLighting: z.ZodDefault<z.ZodBoolean>;
        showComboFire: z.ZodDefault<z.ZodBoolean>;
        showComboBreak: z.ZodDefault<z.ZodBoolean>;
        showScoreOverlay: z.ZodDefault<z.ZodBoolean>;
        showHealthBar: z.ZodDefault<z.ZodBoolean>;
        showProgressBar: z.ZodDefault<z.ZodBoolean>;
        showKeyOverlay: z.ZodDefault<z.ZodBoolean>;
        alwaysShowKeyOverlay: z.ZodDefault<z.ZodBoolean>;
        showInterface: z.ZodDefault<z.ZodBoolean>;
        cursorSize: z.ZodDefault<z.ZodNumber>;
        cursorTrail: z.ZodDefault<z.ZodBoolean>;
        cursorRipples: z.ZodDefault<z.ZodBoolean>;
        hitErrorBar: z.ZodDefault<z.ZodBoolean>;
        progressBarType: z.ZodDefault<z.ZodEnum<{
            none: "none";
            pie: "pie";
            topRight: "topRight";
            bottomRight: "bottomRight";
        }>>;
        scoreDisplayType: z.ZodDefault<z.ZodEnum<{
            score: "score";
            accuracy: "accuracy";
            none: "none";
            both: "both";
        }>>;
        comboBurst: z.ZodDefault<z.ZodBoolean>;
        hitLighting: z.ZodDefault<z.ZodBoolean>;
    }, z.core.$strict>;
    readonly Input: z.ZodObject<{
        keyBindings: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodString>>;
        mouseDisableWheel: z.ZodDefault<z.ZodBoolean>;
        mouseDisableButtons: z.ZodDefault<z.ZodBoolean>;
        rawInput: z.ZodDefault<z.ZodBoolean>;
        mouseSensitivity: z.ZodDefault<z.ZodNumber>;
        tabletSupport: z.ZodDefault<z.ZodBoolean>;
        wiimoteSupport: z.ZodDefault<z.ZodBoolean>;
        confineMouseCursor: z.ZodDefault<z.ZodBoolean>;
    }, z.core.$strict>;
    readonly Gameplay: z.ZodObject<{
        backgroundVideo: z.ZodDefault<z.ZodBoolean>;
        storyboard: z.ZodDefault<z.ZodBoolean>;
        comboBursts: z.ZodDefault<z.ZodBoolean>;
        hitSounds: z.ZodDefault<z.ZodBoolean>;
        ignoreBeatmapHitSounds: z.ZodDefault<z.ZodBoolean>;
        ignoreBeatmapSkin: z.ZodDefault<z.ZodBoolean>;
        disableWheelInGameplay: z.ZodDefault<z.ZodBoolean>;
        disableClicksInGameplay: z.ZodDefault<z.ZodBoolean>;
        bossModeOnBreaks: z.ZodDefault<z.ZodBoolean>;
        automaticCursorSize: z.ZodDefault<z.ZodBoolean>;
        saveFailedReplays: z.ZodDefault<z.ZodBoolean>;
        floatingComments: z.ZodDefault<z.ZodBoolean>;
        showInterfaceDuringRelax: z.ZodDefault<z.ZodBoolean>;
    }, z.core.$strict>;
    readonly Skin: z.ZodObject<{
        currentSkin: z.ZodDefault<z.ZodString>;
        ignoreAllBeatmapSkins: z.ZodDefault<z.ZodBoolean>;
        skinSampleVolume: z.ZodDefault<z.ZodNumber>;
        useDefaultSkinCursor: z.ZodDefault<z.ZodBoolean>;
        cursorExpand: z.ZodDefault<z.ZodBoolean>;
        cursorCenterOnSelection: z.ZodDefault<z.ZodBoolean>;
        alwaysUseDefaultCursor: z.ZodDefault<z.ZodBoolean>;
    }, z.core.$strict>;
    readonly Performance: z.ZodObject<{
        frameLimit: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<"unlimited">, z.ZodLiteral<"vsync">, z.ZodNumber]>>;
        compatibilityMode: z.ZodDefault<z.ZodBoolean>;
        reduceDroppedFrames: z.ZodDefault<z.ZodBoolean>;
        detectPerformanceIssues: z.ZodDefault<z.ZodBoolean>;
        lowLatencyAudio: z.ZodDefault<z.ZodBoolean>;
        threadedOptimization: z.ZodDefault<z.ZodBoolean>;
        showFPSCounter: z.ZodDefault<z.ZodBoolean>;
        enableGarbageCollection: z.ZodDefault<z.ZodBoolean>;
        memoryOptimization: z.ZodDefault<z.ZodBoolean>;
    }, z.core.$strict>;
    readonly Network: z.ZodObject<{
        automaticDownloads: z.ZodDefault<z.ZodBoolean>;
        noVideoDownloads: z.ZodDefault<z.ZodBoolean>;
        preferMirrorServer: z.ZodDefault<z.ZodBoolean>;
        enableMultiplayer: z.ZodDefault<z.ZodBoolean>;
        spectatorMode: z.ZodDefault<z.ZodBoolean>;
        autoJoinIRC: z.ZodDefault<z.ZodBoolean>;
        enableNotifications: z.ZodDefault<z.ZodBoolean>;
        proxySettings: z.ZodDefault<z.ZodObject<{
            enabled: z.ZodDefault<z.ZodBoolean>;
            host: z.ZodDefault<z.ZodString>;
            port: z.ZodDefault<z.ZodNumber>;
            username: z.ZodDefault<z.ZodString>;
            password: z.ZodDefault<z.ZodString>;
        }, z.core.$strip>>;
    }, z.core.$strict>;
    readonly Directories: z.ZodObject<{
        chartLibrary: z.ZodDefault<z.ZodString>;
        cache: z.ZodDefault<z.ZodString>;
        logs: z.ZodDefault<z.ZodString>;
        recordings: z.ZodDefault<z.ZodString>;
        replays: z.ZodDefault<z.ZodString>;
        screenshots: z.ZodDefault<z.ZodString>;
        skins: z.ZodDefault<z.ZodString>;
        themes: z.ZodDefault<z.ZodString>;
        temporary: z.ZodDefault<z.ZodString>;
    }, z.core.$strict>;
    readonly Debug: z.ZodObject<{
        enableDebugMode: z.ZodDefault<z.ZodBoolean>;
        showDebugInfo: z.ZodDefault<z.ZodBoolean>;
        logLevel: z.ZodDefault<z.ZodEnum<{
            debug: "debug";
            info: "info";
            warn: "warn";
            error: "error";
        }>>;
        enablePerformanceLogging: z.ZodDefault<z.ZodBoolean>;
        verboseLogging: z.ZodDefault<z.ZodBoolean>;
        saveDebugLogs: z.ZodDefault<z.ZodBoolean>;
        enableHotReload: z.ZodDefault<z.ZodBoolean>;
        showPhysicsDebug: z.ZodDefault<z.ZodBoolean>;
        showAudioDebug: z.ZodDefault<z.ZodBoolean>;
        enableExperimentalFeatures: z.ZodDefault<z.ZodBoolean>;
    }, z.core.$strict>;
    readonly Accessibility: z.ZodObject<{
        enableHighContrast: z.ZodDefault<z.ZodBoolean>;
        enableColorBlindSupport: z.ZodDefault<z.ZodBoolean>;
        colorBlindType: z.ZodDefault<z.ZodEnum<{
            none: "none";
            protanopia: "protanopia";
            deuteranopia: "deuteranopia";
            tritanopia: "tritanopia";
        }>>;
        enableScreenReader: z.ZodDefault<z.ZodBoolean>;
        enableKeyboardNavigation: z.ZodDefault<z.ZodBoolean>;
        reducedMotion: z.ZodDefault<z.ZodBoolean>;
        largerCursor: z.ZodDefault<z.ZodBoolean>;
        enableSoundCues: z.ZodDefault<z.ZodBoolean>;
        enableHapticFeedback: z.ZodDefault<z.ZodBoolean>;
    }, z.core.$strict>;
    readonly Import: z.ZodObject<{
        filePath: z.ZodString;
        mergeStrategy: z.ZodDefault<z.ZodEnum<{
            replace: "replace";
            merge: "merge";
            selective: "selective";
        }>>;
        backupCurrent: z.ZodDefault<z.ZodBoolean>;
        validateBeforeImport: z.ZodDefault<z.ZodBoolean>;
    }, z.core.$strict>;
    readonly Export: z.ZodObject<{
        filePath: z.ZodOptional<z.ZodString>;
        includeProfile: z.ZodDefault<z.ZodBoolean>;
        includeSettings: z.ZodDefault<z.ZodBoolean>;
        includeKeybindings: z.ZodDefault<z.ZodBoolean>;
        includeDirectories: z.ZodDefault<z.ZodBoolean>;
        format: z.ZodDefault<z.ZodEnum<{
            json: "json";
            yaml: "yaml";
            ini: "ini";
        }>>;
        encrypt: z.ZodDefault<z.ZodBoolean>;
    }, z.core.$strict>;
    readonly Patch: z.ZodObject<{
        path: z.ZodString;
        value: z.ZodUnknown;
        operation: z.ZodDefault<z.ZodEnum<{
            set: "set";
            delete: "delete";
            merge: "merge";
        }>>;
    }, z.core.$strict>;
    readonly ValidationResult: z.ZodObject<{
        isValid: z.ZodBoolean;
        errors: z.ZodDefault<z.ZodArray<z.ZodObject<{
            path: z.ZodString;
            message: z.ZodString;
            code: z.ZodString;
            severity: z.ZodEnum<{
                info: "info";
                error: "error";
                warning: "warning";
            }>;
        }, z.core.$strip>>>;
        migrations: z.ZodDefault<z.ZodArray<z.ZodObject<{
            from: z.ZodString;
            to: z.ZodString;
            description: z.ZodString;
            applied: z.ZodBoolean;
        }, z.core.$strip>>>;
        warnings: z.ZodDefault<z.ZodArray<z.ZodString>>;
    }, z.core.$strict>;
};
export type ValidatedUserSettings = z.infer<typeof UserSettingsSchema>;
export type ValidatedAudioSettings = z.infer<typeof AudioSettingsSchema>;
export type ValidatedVisualSettings = z.infer<typeof VisualSettingsSchema>;
export type ValidatedInputSettings = z.infer<typeof InputSettingsSchema>;
export type ValidatedGameplaySettings = z.infer<typeof GameplaySettingsSchema>;
export type ValidatedSettingsImport = z.infer<typeof SettingsImportSchema>;
export type ValidatedSettingsExport = z.infer<typeof SettingsExportSchema>;
export type ValidatedSettingsPatch = z.infer<typeof SettingsPatchSchema>;
export type ValidatedSettingsValidationResult = z.infer<typeof SettingsValidationResultSchema>;
//# sourceMappingURL=settings.schema.d.ts.map