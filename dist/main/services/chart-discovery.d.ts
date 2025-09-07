import type { OszChart } from '../../shared/types';
interface ChartMatch {
    chart: OszChart;
    similarity: number;
    matchType: 'exact' | 'fuzzy';
}
/**
 * 차트 발견 및 매칭 서비스
 * 하드코딩된 fuzzyMatch 로직을 동적 문자열 유사도 기반으로 대체
 */
export declare class ChartDiscoveryService {
    private static instance;
    private libraryPath;
    private constructor();
    static getInstance(): ChartDiscoveryService;
    /**
     * 라이브러리 로드
     */
    private loadLibrary;
    /**
     * 정확한 매치 검색 (title + artist)
     */
    findExactMatch(title: string, artist: string): Promise<OszChart | null>;
    /**
     * 퍼지 매치 검색 (동적 문자열 유사도 기반)
     */
    findFuzzyMatches(title: string, artist: string, threshold?: number, maxResults?: number): Promise<ChartMatch[]>;
    /**
     * 통합 검색 (정확한 매치 우선, 없으면 퍼지 매치)
     */
    searchChart(title: string, artist: string, fuzzyThreshold?: number): Promise<{
        exact?: OszChart;
        fuzzy: ChartMatch[];
    }>;
    /**
     * 차트 ID로 검색
     */
    findChartById(chartId: string): Promise<OszChart | null>;
    /**
     * 키워드로 차트 검색 (제목, 아티스트, 크리에이터에서 검색)
     */
    searchByKeyword(keyword: string, threshold?: number, maxResults?: number): Promise<ChartMatch[]>;
    /**
     * 차트 통계 정보
     */
    getChartStats(): Promise<{
        totalCharts: number;
        uniqueArtists: number;
        uniqueCreators: number;
        totalDifficulties: number;
    }>;
    /**
     * 라이브러리 유효성 검사
     */
    validateLibrary(): Promise<{
        valid: OszChart[];
        invalid: Array<{
            chart: OszChart;
            reason: string;
        }>;
    }>;
}
export declare function fuzzyMatch(title: string, artist: string): Promise<OszChart | null>;
export declare const chartDiscoveryService: ChartDiscoveryService;
/**
 * 레거시 함수: ChartMetadata[] 형식으로 차트 목록 반환
 * 기존 코드 호환성을 위해 유지
 */
export declare function discoverCharts(): Promise<any[]>;
export {};
//# sourceMappingURL=chart-discovery.d.ts.map