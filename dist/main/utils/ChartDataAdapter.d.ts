/**
 * Chart Data Adapter - Enhanced Parser와 Game Handler 간 데이터 형식 변환
 */
import type { CompleteChartData } from '../utils/EnhancedOszParser';
/**
 * Game Handler가 기대하는 데이터 형식
 */
export interface GameChartData {
    readonly id: string;
    readonly title: string;
    readonly artist: string;
    readonly difficulty: string;
    readonly audioPath: string;
    readonly backgroundPath?: string;
    readonly bpm: number;
    readonly duration: number;
    readonly notes: Array<{
        time: number;
        type: 'tap' | 'hold' | 'slider';
        position?: {
            x: number;
            y: number;
        };
        duration?: number;
    }>;
}
/**
 * CompleteChartData를 GameChartData로 변환
 */
export declare class ChartDataAdapter {
    /**
     * Enhanced parser 데이터를 게임 핸들러 형식으로 변환
     */
    static convertToGameFormat(completeData: CompleteChartData): GameChartData;
    /**
     * 난이도별 게임 데이터 생성
     */
    static convertDifficultyToGameFormat(completeData: CompleteChartData, difficultyName: string): GameChartData | null;
    /**
     * 모든 난이도를 게임 형식으로 변환
     */
    static convertAllDifficulties(completeData: CompleteChartData): GameChartData[];
}
//# sourceMappingURL=ChartDataAdapter.d.ts.map