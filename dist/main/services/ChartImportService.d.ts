import type { SongData } from '../../shared/d.ts/ipc';
export declare class ChartImportService {
    private pathService;
    private extractor;
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
}
//# sourceMappingURL=ChartImportService.d.ts.map