/**
 * Preload script - secure bridge between main and renderer processes
 * Exposes limited APIs to the renderer with full TypeScript support
 */
interface ThrowData {
    timestamp: number;
    angle: number;
    force: number;
    position: {
        x: number;
        y: number;
    };
}
interface ChartData {
    id: string;
    title: string;
    artist: string;
    difficulty: string;
    audioPath: string;
    backgroundPath?: string;
    bpm: number;
    duration: number;
}
interface KnifeResult {
    success: boolean;
    judgment?: 'KOOL' | 'COOL' | 'GOOD' | 'MISS';
    score?: number;
    combo?: number;
}
interface Settings {
    [key: string]: any;
}
interface MessageBoxOptions {
    type?: 'info' | 'warning' | 'error' | 'question';
    title?: string;
    message: string;
    buttons?: string[];
}
declare const gameApi: {
    start: (params: {
        chartData: ChartData;
        gameMode: string;
        mods?: string[];
    }) => Promise<{
        success: boolean;
        message?: string;
        error?: string;
    }>;
    stop: () => Promise<void>;
    throwKnife: (throwData: ThrowData) => void;
    pause: () => Promise<void>;
    resume: () => Promise<void>;
    onKnifeResult: (callback: (result: KnifeResult) => void) => (() => void);
    onKnifeThrowProcessed: (callback: (data: any) => void) => (() => void);
};
declare const chartsApi: {
    getLibrary: () => Promise<ChartData[]>;
    getChart: (chartId: string) => Promise<ChartData | null>;
    import: (filePath: string) => Promise<boolean>;
    remove: (chartId: string) => Promise<boolean>;
    getAudio: (chartId: string) => Promise<ArrayBuffer | null>;
    getBackground: (chartId: string) => Promise<ArrayBuffer | null>;
};
declare const settingsApi: {
    getAll: () => Promise<Settings>;
    set: (key: string, value: any) => Promise<void>;
    reset: () => Promise<void>;
    onChange: (callback: (settings: Settings) => void) => (() => void);
};
declare const systemApi: {
    getVersion: () => Promise<string>;
    openExternal: (url: string) => Promise<void>;
    showMessageBox: (options: MessageBoxOptions) => Promise<number>;
    platform: NodeJS.Platform;
    isDev: boolean;
};
export interface ElectronAPI {
    game: typeof gameApi;
    charts: typeof chartsApi;
    settings: typeof settingsApi;
    system: typeof systemApi;
}
export {};
//# sourceMappingURL=index.d.ts.map