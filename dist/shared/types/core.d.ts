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
    version: string;
    audioFilename: string;
    audioLeadIn: number;
    backgroundFilename?: string;
    videoFilename?: string;
    bpm: number;
    notes: BeatmapNote[];
    difficulty: OsuDifficulty;
    folderPath: string;
    gameMode: 0 | 1 | 2 | 3;
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
    currentTime: number;
}
export interface KnifePhysics {
    id: string;
    x: number;
    y: number;
    velocity: number;
    angle: number;
    isStuck: boolean;
    stuckAngle?: number;
}
export interface GameConfig {
    knifeVelocity: number;
    targetRadius: number;
    targetRotationSpeed: number;
    judgmentWindows: Record<Judgment, number>;
    approachTime: number;
    canvasWidth: number;
    canvasHeight: number;
}
//# sourceMappingURL=core.d.ts.map