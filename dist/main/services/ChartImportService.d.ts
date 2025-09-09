import type { SongData } from '../../shared/d.ts/ipc';
export declare class ChartImportService {
    private pathService;
    private parser;
    private mediaConverter;
    constructor();
    /**
     * Load charts from library.json file (real OSZ data)
     */
    loadLibraryJson(): Promise<SongData[]>;
    /**
     * Get the public/assets directory path
     */
    private getPublicAssetsPath;
    /**
     * Scan public/assets for .osz files and auto-parse them
     * First tries to load from library.json, then falls back to OSZ parsing
     */
    autoScanAndParseOszFiles(): Promise<SongData[]>;
    /**
     * Parse a single OSZ file to the charts directory
     */
    private parseOszToCharts;
    /**
     * Convert audio and video files to supported formats
     */
    private convertMediaFiles;
    /**
     * Load existing chart data from parsed directory
     */
    private loadExistingChart;
    /**
     * Check if file exists
     */
    private fileExists;
    /**
     * Get all parsed charts from the charts directory
     */
    getChartList(): Promise<SongData[]>;
}
//# sourceMappingURL=ChartImportService.d.ts.map