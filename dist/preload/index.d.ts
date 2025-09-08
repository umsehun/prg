/**
 * Preload script - secure bridge between main and renderer processes
 * Exposes limited, type-safe APIs to the renderer
 */
declare const gameApi: {
    start: (chartData: any) => Promise<any>;
    stop: () => Promise<any>;
    throwKnife: (throwData: {
        id: string;
        time: number;
    }) => void;
    pause: () => Promise<any>;
    resume: () => Promise<any>;
    onKnifeResult: (callback: (result: any) => void) => () => Electron.IpcRenderer;
};
declare const oszApi: {
    import: (filePath?: string) => Promise<any>;
    getLibrary: () => Promise<any>;
    removeChart: (chartId: string) => Promise<any>;
    getAudio: (chartId: string) => Promise<any>;
};
declare const settingsApi: {
    getAll: () => Promise<any>;
    get: (key: string) => Promise<any>;
    set: (key: string, value: any) => Promise<any>;
    reset: () => Promise<any>;
    export: () => Promise<any>;
    import: () => Promise<any>;
    onChange: (callback: (change: {
        key: string;
        value: any;
    }) => void) => () => Electron.IpcRenderer;
    onReset: (callback: (settings: any) => void) => () => Electron.IpcRenderer;
};
declare const systemApi: {
    platform: NodeJS.Platform;
    version: string;
    isDev: boolean;
};
export interface ElectronAPI {
    game: typeof gameApi;
    osz: typeof oszApi;
    settings: typeof settingsApi;
    system: typeof systemApi;
}
export {};
//# sourceMappingURL=index.d.ts.map