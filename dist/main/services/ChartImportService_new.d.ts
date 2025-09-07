import type { OszChart, PinChart } from '../../shared/types';
export interface OszDifficulty {
    name: string;
    version: string;
    overallDifficulty: number;
    approachRate: number;
    circleSize: number;
    hpDrainRate: number;
    noteCount: number;
    filePath: string;
}
declare class ChartImportService {
    private importingCharts;
    /**
     * Import an OSZ file and extract it to the charts directory
     */
    importOszFile(oszPath: string): Promise<OszChart | null>;
    /**
     * Convert OSZ difficulty to PinChart
     */
    convertDifficultyToPinChart(oszChart: OszChart, difficultyIndex?: number): Promise<PinChart>;
    private parseBeatmapFile;
    private parseDifficulty;
}
export declare const chartImportService: ChartImportService;
export {};
//# sourceMappingURL=ChartImportService_new.d.ts.map