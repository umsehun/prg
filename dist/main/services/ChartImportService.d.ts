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
export declare class ChartImportService {
    private importingCharts;
    private static instance;
    private chartsPath;
    private libraryPath;
    private lockfilePath;
    private constructor();
    /**
     * Remove ALL contents under charts directory and reset library to empty array.
     * Intended for development cleanup only.
     */
    clearChartsDirectoryAndLibrary(): Promise<void>;
    /**
     * Normalize the library by removing duplicate charts with the same title+artist.
     * Preference order for keeping an entry:
     * 1) Entry whose folder exists on disk
     * 2) Newest by timestamp suffix in id (if parsable)
     * All other duplicates are removed from library (folders remain untouched).
     */
    normalizeLibrary(): Promise<void>;
    static getInstance(): ChartImportService;
    /**
     * .osz 파일을 임포트하고 압축 해제하여 차트 라이브러리에 추가
     */
    importOszFile(filePath: string): Promise<OszChart | null>;
    /**
     * Convert OSZ difficulty to PinChart
     */
    convertDifficultyToPinChart(oszChart: OszChart, difficultyIndex: number): Promise<PinChart>;
    /**
     * Get chart library
     */
    getLibrary(): Promise<OszChart[]>;
    /**
     * Add chart to library
     */
    private _acquireLock;
    private _releaseLock;
    private addToLibrary;
    /**
     * Legacy import method - keeping for compatibility
     */
    importOszFile_legacy(oszPath: string): Promise<void>;
    /**
     * 기존 차트 라이브러리 로드
     */
    getLibrarySync(): Promise<OszChart[]>;
    /**
     * 차트 ID로 차트 찾기
     */
    getChartById(chartId: string): OszChart | undefined;
    /**
     * .osu 파일 파싱하여 난이도 정보 추출
     */
    parseDifficulty(filePath: string): Promise<{
        bpm: number | undefined;
        notes: {
            startTime: number;
        }[];
        mode: number;
    }>;
    removeFromLibrary(chartId: string, removeFolder?: boolean): Promise<boolean>;
    /**
     * .osu 파일에서 메타데이터 추출
     */
    private parseOsuMetadata;
    /**
     * .osu 파일에서 노트 개수 세기
     */
    private countNotes;
}
//# sourceMappingURL=ChartImportService.d.ts.map