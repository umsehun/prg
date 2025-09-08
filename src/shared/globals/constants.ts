/**
 * Global constants for PRG project
 */

/**
 * Application metadata
 */
export const APP_CONFIG = {
    NAME: 'PRG',
    VERSION: '1.0.0',
    DESCRIPTION: 'osu! + Knife Hit hybrid rhythm game',
    AUTHOR: 'PRG Team',

    // Window settings
    WINDOW: {
        MIN_WIDTH: 800,
        MIN_HEIGHT: 600,
        DEFAULT_WIDTH: 1280,
        DEFAULT_HEIGHT: 800
    },

    // Development
    DEV_SERVER_PORT: 5173
} as const;

/**
 * Game constants
 */
export const GAME_CONFIG = {
    // Physics
    PHYSICS: {
        GRAVITY: 0,
        KNIFE_VELOCITY: 400,
        TARGET_MIN_RADIUS: 50,
        TARGET_MAX_RADIUS: 150,
        MIN_ROTATION_SPEED: 15,
        MAX_ROTATION_SPEED: 90,
        COLLISION_TOLERANCE: 5
    },

    // Timing
    TIMING: {
        TARGET_FPS: 60,
        PHYSICS_TIMESTEP: 16.67, // ~60fps
        AUDIO_BUFFER_SIZE: 512,
        MAX_TIMING_ERROR: 400, // ms
        PRELOAD_TIME: 2000 // ms
    },

    // Scoring
    SCORING: {
        KOOL_SCORE: 300,
        COOL_SCORE: 100,
        GOOD_SCORE: 50,
        MISS_SCORE: 0,
        COMBO_MULTIPLIER: 1.5,
        MAX_COMBO_BONUS: 10
    },

    // Visual
    VISUAL: {
        APPROACH_CIRCLE_ALPHA: 0.8,
        HIT_PARTICLE_COUNT: 10,
        JUDGMENT_DISPLAY_TIME: 1000,
        BACKGROUND_DIM_DEFAULT: 0.5,
        UI_ANIMATION_DURATION: 300
    }
} as const;

/**
 * Audio constants
 */
export const AUDIO_CONFIG = {
    SAMPLE_RATE: 44100,
    BUFFER_SIZE: 512,
    LATENCY_HINT: 'interactive' as AudioContextLatencyCategory,

    // Volume levels (0.0 - 1.0)
    DEFAULT_MASTER_VOLUME: 1.0,
    DEFAULT_MUSIC_VOLUME: 0.8,
    DEFAULT_EFFECT_VOLUME: 1.0,

    // File formats
    SUPPORTED_FORMATS: ['mp3', 'wav', 'ogg', 'm4a'] as const,

    // Timing
    AUDIO_OFFSET_RANGE: [-500, 500], // ms
    PRECISION_DIGITS: 3
} as const;

/**
 * File system constants
 */
export const FILE_CONFIG = {
    // Supported file types
    OSZ_EXTENSIONS: ['.osz'] as const,
    AUDIO_EXTENSIONS: ['.mp3', '.wav', '.ogg', '.m4a'] as const,
    IMAGE_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp'] as const,

    // Size limits (bytes)
    MAX_OSZ_SIZE: 100 * 1024 * 1024, // 100MB
    MAX_AUDIO_SIZE: 50 * 1024 * 1024, // 50MB
    MAX_IMAGE_SIZE: 10 * 1024 * 1024, // 10MB
    MAX_VIDEO_SIZE: 200 * 1024 * 1024, // 200MB
    MAX_HITSOUND_SIZE: 5 * 1024 * 1024, // 5MB per hitsound
    MAX_STORYBOARD_SIZE: 1 * 1024 * 1024, // 1MB per storyboard file
    MAX_UNCOMPRESSED_SIZE: 500 * 1024 * 1024, // 500MB total uncompressed
    
    // Archive limits
    MAX_ENTRIES_PER_OSZ: 1000, // Maximum files in one OSZ
    MAX_CHARTS_IN_LIBRARY: 10000, // Maximum charts in library

    // Directories
    CHARTS_DIR: 'charts',
    CACHE_DIR: 'cache',
    LOGS_DIR: 'logs',
    SETTINGS_FILE: 'settings.json',

    // Patterns
    BEATMAP_PATTERN: /\.osu$/,
    AUDIO_PATTERN: /\.(mp3|wav|ogg|m4a)$/i,
    IMAGE_PATTERN: /\.(jpg|jpeg|png|webp)$/i
} as const;

/**
 * UI constants
 */
export const UI_CONFIG = {
    // Colors (Tailwind-compatible)
    COLORS: {
        PRIMARY: '#3B82F6',
        SECONDARY: '#8B5CF6',
        SUCCESS: '#10B981',
        WARNING: '#F59E0B',
        ERROR: '#EF4444',
        KOOL: '#10B981',
        COOL: '#3B82F6',
        GOOD: '#F59E0B',
        MISS: '#EF4444'
    },

    // Z-indices
    Z_INDEX: {
        BACKGROUND: 0,
        GAME_OBJECTS: 10,
        UI_OVERLAY: 100,
        MODAL: 1000,
        TOOLTIP: 2000,
        NOTIFICATION: 3000
    },

    // Breakpoints
    BREAKPOINTS: {
        SM: 640,
        MD: 768,
        LG: 1024,
        XL: 1280,
        '2XL': 1536
    },

    // Animations
    ANIMATION: {
        DURATION: {
            FAST: 150,
            NORMAL: 300,
            SLOW: 500
        },
        EASING: {
            DEFAULT: 'ease',
            IN: 'ease-in',
            OUT: 'ease-out',
            IN_OUT: 'ease-in-out'
        }
    }
} as const;

/**
 * Error codes
 */
export const ERROR_CODES = {
    // Game errors
    GAME_NOT_INITIALIZED: 'GAME_001',
    GAME_ALREADY_RUNNING: 'GAME_002',
    INVALID_CHART_DATA: 'GAME_003',
    PHYSICS_ENGINE_ERROR: 'GAME_004',

    // Audio errors
    AUDIO_CONTEXT_FAILED: 'AUDIO_001',
    AUDIO_DECODE_FAILED: 'AUDIO_002',
    AUDIO_PLAYBACK_FAILED: 'AUDIO_003',
    UNSUPPORTED_AUDIO_FORMAT: 'AUDIO_004',

    // File errors
    FILE_NOT_FOUND: 'FILE_001',
    FILE_TOO_LARGE: 'FILE_002',
    INVALID_FILE_FORMAT: 'FILE_003',
    FILE_PARSE_ERROR: 'FILE_004',

    // IPC errors
    IPC_HANDLER_NOT_FOUND: 'IPC_001',
    IPC_INVALID_PARAMS: 'IPC_002',
    IPC_TIMEOUT: 'IPC_003',

    // System errors
    INSUFFICIENT_MEMORY: 'SYS_001',
    UNSUPPORTED_PLATFORM: 'SYS_002',
    PERMISSION_DENIED: 'SYS_003'
} as const;

/**
 * Performance thresholds
 */
export const PERFORMANCE = {
    FPS: {
        EXCELLENT: 58,
        GOOD: 45,
        POOR: 30,
        CRITICAL: 15
    },

    MEMORY: {
        WARNING_THRESHOLD: 512 * 1024 * 1024, // 512MB
        CRITICAL_THRESHOLD: 1024 * 1024 * 1024 // 1GB
    },

    LATENCY: {
        EXCELLENT: 20, // ms
        GOOD: 50,
        POOR: 100,
        CRITICAL: 200
    }
} as const;

/**
 * Development constants
 */
export const DEV_CONFIG = {
    // Debug flags
    DEBUG: {
        PHYSICS: false,
        AUDIO: false,
        IPC: false,
        PERFORMANCE: true
    },

    // Test data
    MOCK_CHART: {
        id: 'mock-001',
        title: 'Test Chart',
        artist: 'Test Artist',
        bpm: 120,
        duration: 180
    }
} as const;

// Type helpers for constants
export type GameConfigKey = keyof typeof GAME_CONFIG;
export type AudioConfigKey = keyof typeof AUDIO_CONFIG;
export type UIColor = keyof typeof UI_CONFIG.COLORS;
export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];
