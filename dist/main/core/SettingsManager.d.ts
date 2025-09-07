export interface Settings {
    noteSpeed: number;
}
declare class SettingsManager {
    private static instance;
    private storePromise;
    private constructor();
    static getInstance(): SettingsManager;
    get<T extends keyof Settings>(key: T): Promise<Settings[T]>;
    set<T extends keyof Settings>(key: T, value: Settings[T]): Promise<void>;
}
declare const _default: SettingsManager;
export default _default;
//# sourceMappingURL=SettingsManager.d.ts.map