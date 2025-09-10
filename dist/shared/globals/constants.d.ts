/**
 * Global constants for PRG project
 */
/**
 * Application metadata
 */
export declare const APP_CONFIG: {
    readonly NAME: "PRG";
    readonly VERSION: "1.0.0";
    readonly DESCRIPTION: "osu! + Knife Hit hybrid rhythm game";
    readonly AUTHOR: "PRG Team";
    readonly WINDOW: {
        readonly MIN_WIDTH: 800;
        readonly MIN_HEIGHT: 600;
        readonly DEFAULT_WIDTH: 1280;
        readonly DEFAULT_HEIGHT: 800;
    };
    readonly DEV_SERVER_PORT: 5173;
};
/**
 * Game constants
 */
export declare const GAME_CONFIG: {
    readonly PHYSICS: {
        readonly GRAVITY: 0;
        readonly KNIFE_VELOCITY: 400;
        readonly TARGET_MIN_RADIUS: 50;
        readonly TARGET_MAX_RADIUS: 150;
        readonly MIN_ROTATION_SPEED: 15;
        readonly MAX_ROTATION_SPEED: 90;
        readonly COLLISION_TOLERANCE: 5;
    };
    readonly TIMING: {
        readonly TARGET_FPS: 60;
        readonly PHYSICS_TIMESTEP: 16.67;
        readonly AUDIO_BUFFER_SIZE: 512;
        readonly MAX_TIMING_ERROR: 400;
        readonly PRELOAD_TIME: 2000;
    };
    readonly SCORING: {
        readonly KOOL_SCORE: 300;
        readonly COOL_SCORE: 100;
        readonly GOOD_SCORE: 50;
        readonly MISS_SCORE: 0;
        readonly COMBO_MULTIPLIER: 1.5;
        readonly MAX_COMBO_BONUS: 10;
    };
    readonly VISUAL: {
        readonly APPROACH_CIRCLE_ALPHA: 0.8;
        readonly HIT_PARTICLE_COUNT: 10;
        readonly JUDGMENT_DISPLAY_TIME: 1000;
        readonly BACKGROUND_DIM_DEFAULT: 0.5;
        readonly UI_ANIMATION_DURATION: 300;
    };
};
/**
 * Audio constants
 */
export declare const AUDIO_CONFIG: {
    readonly SAMPLE_RATE: 44100;
    readonly BUFFER_SIZE: 512;
    readonly LATENCY_HINT: AudioContextLatencyCategory;
    readonly DEFAULT_MASTER_VOLUME: 1;
    readonly DEFAULT_MUSIC_VOLUME: 0.8;
    readonly DEFAULT_EFFECT_VOLUME: 1;
    readonly SUPPORTED_FORMATS: readonly ["mp3", "wav", "ogg", "m4a"];
    readonly AUDIO_OFFSET_RANGE: readonly [-500, 500];
    readonly PRECISION_DIGITS: 3;
};
/**
 * File system constants
 */
export declare const FILE_CONFIG: {
    readonly OSZ_EXTENSIONS: readonly [".osz"];
    readonly AUDIO_EXTENSIONS: readonly [".mp3", ".wav", ".ogg", ".m4a"];
    readonly IMAGE_EXTENSIONS: readonly [".jpg", ".jpeg", ".png", ".webp"];
    readonly MAX_OSZ_SIZE: number;
    readonly MAX_AUDIO_SIZE: number;
    readonly MAX_IMAGE_SIZE: number;
    readonly MAX_VIDEO_SIZE: number;
    readonly MAX_HITSOUND_SIZE: number;
    readonly MAX_STORYBOARD_SIZE: number;
    readonly MAX_UNCOMPRESSED_SIZE: number;
    readonly MAX_ENTRIES_PER_OSZ: 1000;
    readonly MAX_CHARTS_IN_LIBRARY: 10000;
    readonly CHARTS_DIR: "charts";
    readonly CACHE_DIR: "cache";
    readonly LOGS_DIR: "logs";
    readonly SETTINGS_FILE: "settings.json";
    readonly BEATMAP_PATTERN: RegExp;
    readonly AUDIO_PATTERN: RegExp;
    readonly IMAGE_PATTERN: RegExp;
};
/**
 * UI constants
 */
export declare const UI_CONFIG: {
    readonly COLORS: {
        readonly PRIMARY: "#3B82F6";
        readonly SECONDARY: "#8B5CF6";
        readonly SUCCESS: "#10B981";
        readonly WARNING: "#F59E0B";
        readonly ERROR: "#EF4444";
        readonly KOOL: "#10B981";
        readonly COOL: "#3B82F6";
        readonly GOOD: "#F59E0B";
        readonly MISS: "#EF4444";
    };
    readonly Z_INDEX: {
        readonly BACKGROUND: 0;
        readonly GAME_OBJECTS: 10;
        readonly UI_OVERLAY: 100;
        readonly MODAL: 1000;
        readonly TOOLTIP: 2000;
        readonly NOTIFICATION: 3000;
    };
    readonly BREAKPOINTS: {
        readonly SM: 640;
        readonly MD: 768;
        readonly LG: 1024;
        readonly XL: 1280;
        readonly '2XL': 1536;
    };
    readonly ANIMATION: {
        readonly DURATION: {
            readonly FAST: 150;
            readonly NORMAL: 300;
            readonly SLOW: 500;
        };
        readonly EASING: {
            readonly DEFAULT: "ease";
            readonly IN: "ease-in";
            readonly OUT: "ease-out";
            readonly IN_OUT: "ease-in-out";
        };
    };
};
/**
 * Error codes
 */
export declare const ERROR_CODES: {
    readonly GAME_NOT_INITIALIZED: "GAME_001";
    readonly GAME_ALREADY_RUNNING: "GAME_002";
    readonly INVALID_CHART_DATA: "GAME_003";
    readonly PHYSICS_ENGINE_ERROR: "GAME_004";
    readonly AUDIO_CONTEXT_FAILED: "AUDIO_001";
    readonly AUDIO_DECODE_FAILED: "AUDIO_002";
    readonly AUDIO_PLAYBACK_FAILED: "AUDIO_003";
    readonly UNSUPPORTED_AUDIO_FORMAT: "AUDIO_004";
    readonly FILE_NOT_FOUND: "FILE_001";
    readonly FILE_TOO_LARGE: "FILE_002";
    readonly INVALID_FILE_FORMAT: "FILE_003";
    readonly FILE_PARSE_ERROR: "FILE_004";
    readonly IPC_HANDLER_NOT_FOUND: "IPC_001";
    readonly IPC_INVALID_PARAMS: "IPC_002";
    readonly IPC_TIMEOUT: "IPC_003";
    readonly INSUFFICIENT_MEMORY: "SYS_001";
    readonly UNSUPPORTED_PLATFORM: "SYS_002";
    readonly PERMISSION_DENIED: "SYS_003";
};
/**
 * Performance thresholds
 */
export declare const PERFORMANCE: {
    readonly FPS: {
        readonly EXCELLENT: 58;
        readonly GOOD: 45;
        readonly POOR: 30;
        readonly CRITICAL: 15;
    };
    readonly MEMORY: {
        readonly WARNING_THRESHOLD: number;
        readonly CRITICAL_THRESHOLD: number;
    };
    readonly LATENCY: {
        readonly EXCELLENT: 20;
        readonly GOOD: 50;
        readonly POOR: 100;
        readonly CRITICAL: 200;
    };
};
/**
 * Development constants
 */
export declare const DEV_CONFIG: {
    readonly DEBUG: {
        readonly PHYSICS: false;
        readonly AUDIO: false;
        readonly IPC: false;
        readonly PERFORMANCE: true;
    };
    readonly MOCK_CHART: {
        readonly id: "mock-001";
        readonly title: "Test Chart";
        readonly artist: "Test Artist";
        readonly bpm: 120;
        readonly duration: 180;
    };
};
export type GameConfigKey = keyof typeof GAME_CONFIG;
export type AudioConfigKey = keyof typeof AUDIO_CONFIG;
export type UIColor = keyof typeof UI_CONFIG.COLORS;
export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];
//# sourceMappingURL=constants.d.ts.map