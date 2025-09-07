export type Judgment = 'KOOL' | 'COOL' | 'GOOD' | 'MISS';
export type JudgmentCounts = Record<Judgment, number>;
export interface Note {
    time: number;
    type: 'pin';
    isHit: boolean;
    hitsounds?: string[];
}
export interface Bpm {
    beat: number;
    bpm: number;
}
export interface ChartNoteData {
    type: string;
    difficulty: string;
    level: number;
    measures: string[];
}
export interface Chart {
    title: string;
    artist: string;
    banner: string;
    background: string;
    cdtitle: string;
    music: string;
    offset: number;
    sampleStart: number;
    sampleLength: number;
    displayBPM: string;
    bpms: Bpm[];
    notes: ChartNoteData[];
}
export interface PinChart {
    folderPath?: string;
    id: string;
    title: string;
    artist: string;
    creator?: string;
    audioFilename: string;
    backgroundPath?: string;
    videoPath?: string;
    bpm?: number;
    notes: Note[];
    gameMode: 'osu' | 'pin';
    metadata?: {
        version: string;
        overallDifficulty: number;
        approachRate: number;
        circleSize: number;
        hpDrainRate: number;
        noteCount: number;
    };
}
export type GameScene = 'Start' | 'Select' | 'Game' | 'Finish' | 'Settings' | 'OszImport';
export interface ChartDifficulty {
    name: string;
    version: string;
    overallDifficulty: number;
    approachRate: number;
    circleSize: number;
    hpDrainRate: number;
    noteCount: number;
    filePath?: string;
}
export interface OszChart {
    id: string;
    title: string;
    artist: string;
    creator: string;
    audioFilename: string;
    backgroundFilename?: string;
    difficulties: ChartDifficulty[];
    folderPath: string;
    videoPath?: string;
    mode: number;
}
export interface ChartMetadata {
    id: string;
    title: string;
    artist: string;
    musicPath: string;
    chartPath: string;
    bannerPath?: string;
    videoPath?: string;
    gameMode: 'pin';
    oszMetadata?: {
        creator: string;
        audioFilename: string;
        backgroundFilename?: string;
        difficulties: Array<{
            name: string;
            version: string;
        }>;
    };
}
export interface Settings {
    noteSpeed: number;
}
export type GameUpdateArgs = {
    score?: number;
    combo?: number;
    judgment?: Judgment;
    hitError?: number;
    noteTime?: number;
};
export interface IpcApi {
    startGame: (chart: PinChart) => void;
    stopGame: () => void;
    handlePinPress: () => void;
    loadPinChart: (chartPath: string) => Promise<PinChart | null>;
    discoverCharts: () => Promise<ChartMetadata[]>;
    onGameUpdate: (callback: (args: GameUpdateArgs) => void) => () => void;
    onPlayMusic: (callback: (args: {
        musicPath: string;
    }) => void) => () => void;
    onStopMusic: (callback: () => void) => () => void;
    onNoteUpdate: (callback: (notes: Note[]) => void) => () => void;
    getSetting: <T extends keyof Settings>(key: T) => Promise<Settings[T]>;
    setSetting: <T extends keyof Settings>(key: T, value: Settings[T]) => void;
}
declare global {
    interface Window {
        electron: IpcApi;
    }
}
//# sourceMappingURL=types.d.ts.map