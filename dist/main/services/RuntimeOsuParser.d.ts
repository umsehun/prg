export interface RuntimeNote {
    time: number;
    type: 'tap' | 'hold' | 'slider';
    position?: {
        x: number;
        y: number;
    };
    duration?: number;
}
export interface DifficultyInfo {
    name: string;
    filename: string;
    starRating: number;
    difficultyName: string;
}
export interface AudioVideoFiles {
    audioFile: string | null;
    videoFile: string | null;
    backgroundFile: string | null;
}
/**
 * Runtime .osu file parser for loading chart data during game
 */
export declare class RuntimeOsuParser {
    /**
     * Get available difficulties for a chart directory
     */
    getDifficulties(chartDirPath: string): Promise<DifficultyInfo[]>;
    /**
     * Parse notes from specific .osu file
     */
    parseNotesFromOsu(chartDirPath: string, osuFilename: string): Promise<RuntimeNote[]>;
    /**
     * Get chart info including available difficulties
     */
    getChartInfo(chartDirPath: string, preferredDifficulty?: string): Promise<{
        difficulties: DifficultyInfo[];
        selectedDifficulty: DifficultyInfo | null;
        notes: RuntimeNote[];
        audioVideoFiles: AudioVideoFiles;
    }>;
    /**
     * Parse beatmap metadata only (faster than full parse)
     */
    private parseBeatmapMetadata;
    /**
     * Parse full beatmap with hit objects
     */
    private parseBeatmap;
    /**
     * Determine hit object type for our game
     */
    private getHitObjectType;
    /**
     * Get audio and video files from chart directory
     */
    getAudioVideoFiles(chartDirPath: string, osuFilename?: string): Promise<AudioVideoFiles>;
    /**
     * Extract AudioFilename from .osu file
     */
    private getAudioFilenameFromOsu;
}
//# sourceMappingURL=RuntimeOsuParser.d.ts.map