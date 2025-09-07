import { PinChart } from '../../shared/types';
export declare class GameController {
    private static instance;
    private chart;
    private notes;
    private startTime;
    private isRunning;
    private highResTimer;
    private windowsSec;
    private approachTimeSec;
    private constructor();
    static startGame(chart: PinChart): {
        success: boolean;
        error?: string;
    };
    static stopGame(): {
        success: boolean;
        error?: string;
    };
    static getInstance(): GameController | null;
    static isInitialized(): boolean;
    stop(): void;
    private tick;
    private startGameLoop;
    private updateScore;
    private start;
    handlePinPress(currentTimeSec?: number): void;
}
//# sourceMappingURL=GameController.d.ts.map