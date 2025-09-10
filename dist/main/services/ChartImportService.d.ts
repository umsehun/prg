import type { SongData } from '../../shared/d.ts/ipc';
export declare class ChartImportService {
    private pathService;
    private extractor;
    private osuParser;
    constructor();
    /**
     * Auto-scan OSZ files and return loaded charts
     */
    autoScanOszFiles(): Promise<SongData[]>;
    /**
     * Auto-scan OSZ files and parse them (main method)
     */
    autoScanAndParseOszFiles(): Promise<SongData[]>;
    private loadLibraryJson;
    private parseOszToCharts;
    private convertMetadataToSongData;
    private saveLibraryJson;
    private loadExistingChart;
    private getPublicAssetsPath;
    /**
     * Get list of parsed charts (compatibility method)
     */
    getChartList(): Promise<SongData[]>;
    /**
     * Load chart data with notes for game play
     */
    loadChartForPlay(chartId: string, difficulty?: string): Promise<{
        chartData: SongData;
        notes: Array<{
            time: number;
            type: 'tap' | 'hold' | 'slider';
            position?: {
                x: number;
                y: number;
            };
            duration?: number;
        }>;
        difficulties: Array<{
            name: string;
            filename: string;
            starRating: number;
            difficultyName: string;
        }>;
        audioVideoFiles: {
            audioFile: string | null;
            videoFile: string | null;
            backgroundFile: string | null;
        };
    } | null>;
}
//# sourceMappingURL=ChartImportService.d.ts.map