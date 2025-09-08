/**
 * Core game types based on osu! beatmap structure
 */

export type Judgment = 'KOOL' | 'COOL' | 'GOOD' | 'MISS';

export interface OsuDifficulty {
    /** Overall Difficulty (0-10) - affects judgment windows */
    overallDifficulty: number;
    /** Approach Rate (0-10) - affects note visibility time */
    approachRate: number;
    /** Circle Size (0-10) - affects hit object size */
    circleSize: number;
    /** HP Drain Rate (0-10) - affects health drain */
    hpDrainRate: number;
}

export interface BeatmapNote {
    /** Time in milliseconds */
    time: number;
    /** Hit object type (circle, slider, spinner) */
    type: 'circle' | 'slider' | 'spinner';
    /** Position (not used in PRG mode) */
    x?: number;
    y?: number;
    /** Hitsound samples */
    hitsounds?: string[];
}

export interface BeatmapChart {
    id: string;
    title: string;
    artist: string;
    creator: string;
    version: string; // difficulty name (e.g., "Easy", "Insane")

    // Audio
    audioFilename: string;
    audioLeadIn: number;

    // Visual
    backgroundFilename?: string;
    videoFilename?: string;

    // Timing
    bpm: number;
    notes: BeatmapNote[];

    // Difficulty (from .osu file)
    difficulty: OsuDifficulty;

    // Metadata
    folderPath: string;
    gameMode: 0 | 1 | 2 | 3; // 0: osu!, 1: Taiko, 2: Catch, 3: Mania
}

export interface PrgGameState {
    score: number;
    combo: number;
    maxCombo: number;
    accuracy: number;
    judgments: Record<Judgment, number>;
    health: number;
    isPlaying: boolean;
    isPaused: boolean;
    currentTime: number; // in milliseconds
}

export interface KnifePhysics {
    id: string;
    x: number;
    y: number;
    velocity: number;
    angle: number;
    isStuck: boolean;
    stuckAngle?: number; // angle when stuck to target
}

export interface GameConfig {
    // Physics
    knifeVelocity: number;
    targetRadius: number;
    targetRotationSpeed: number; // degrees per second

    // Judgment windows (calculated from OD)
    judgmentWindows: Record<Judgment, number>;

    // Visual
    approachTime: number; // milliseconds (calculated from AR)
    canvasWidth: number;
    canvasHeight: number;
}
