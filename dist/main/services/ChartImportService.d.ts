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
    static getInstance(): ChartImportService;
    /**
     * UTF-8 인코딩 문제 해결을 위한 텍스트 디코딩 함수
     * BOM 처리 및 다양한 인코딩 지원
     */
    private decodeTextContent;
    /**
     * 파일명 안전화 함수 - 모든 특수문자 처리
     */
    private sanitizeFilename;
    /**
     * 지원되는 모든 미디어 파일 타입 정의
     */
    private getSupportedExtensions;
    /**
     * 개별 파일 추출로 완전한 변환 보장
     * AdmZip.extractAllTo() 대신 사용하여 안정성 향상
     */
    private extractAllFilesIndividually;
    /**
     * 비디오 파일 자동 감지 개선
     */
    private findVideoFile;
    /**
     * .osz 파일을 임포트하고 압축 해제하여 차트 라이브러리에 추가
     * 모든 파일 타입을 하나도 빠짐없이 완전 변환 지원
     */
    importOszFile(filePath: string): Promise<OszChart | null>;
    /**
     * Convert OSZ difficulty to PinChart
     */
    convertDifficultyToPinChart(oszChart: OszChart, difficultyIndex: number): Promise<PinChart | null>;
    /**
     * Get chart library
     */
    getLibrary(): Promise<OszChart[]>;
    /**
     * Lock management for library operations
     */
    private _acquireLock;
    private _releaseLock;
    /**
     * Add chart to library
     */
    private addToLibrary;
    /**
     * Remove chart from library
     */
    removeFromLibrary(chartId: string, removeFolder?: boolean): Promise<boolean>;
    /**
     * Parse .osu difficulty file with proper UTF-8 handling
     */
    parseDifficulty(filePath: string): Promise<{
        bpm: number | undefined;
        notes: {
            startTime: number;
        }[];
        mode: number;
    }>;
    /**
     * Utility methods for compatibility
     */
    getLibrarySync(): Promise<OszChart[]>;
    getChartById(chartId: string): OszChart | undefined;
    /**
     * Development utility methods
     */
    clearChartsDirectoryAndLibrary(): Promise<void>;
    normalizeLibrary(): Promise<void>;
    /**
     * Legacy import method - keeping for compatibility
     */
    importOszFile_legacy(oszPath: string): Promise<void>;
    /**
     * Legacy metadata parsing - keeping for compatibility
     */
    private parseOsuMetadata;
    private countNotes;
    /**
     * Import all OSZ files from the public/assets directory
     * @param assetsPath - Path to the public/assets directory
     * @returns Promise<{ imported: number, skipped: number, errors: string[] }>
     */
    importAllFromDirectory(assetsPath: string): Promise<{
        imported: number;
        skipped: number;
        errors: string[];
    }>;
}
//# sourceMappingURL=ChartImportService.d.ts.map