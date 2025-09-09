/**
 * Simplified Settings Manager - Basic settings for UI development
 */
interface SimpleSettings {
    audio: {
        masterVolume: number;
        musicVolume: number;
        effectVolume: number;
        enableFeedback: boolean;
    };
    game: {
        scrollSpeed: number;
        noteSize: number;
        enableParticles: boolean;
        showFps: boolean;
    };
    display: {
        fullscreen: boolean;
        vsync: boolean;
        targetFps: number;
    };
    controls: {
        keyBindings: {
            lane1: string;
            lane2: string;
            lane3: string;
            lane4: string;
        };
    };
}
export declare class SimpleSettingsManager {
    private settings;
    private settingsPath;
    private saveTimeout;
    constructor(settingsPath?: string);
    initialize(): Promise<void>;
    private load;
    save(): Promise<void>;
    getSettings(): SimpleSettings;
    updateSetting(key: string, value: any): Promise<void>;
    resetToDefaults(): Promise<void>;
    private getDefaultSettings;
    cleanup(): void;
}
export {};
//# sourceMappingURL=simple-settings-manager.d.ts.map