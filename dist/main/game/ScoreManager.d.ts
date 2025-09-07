declare class ScoreManager {
    private static instance;
    private score;
    private combo;
    private constructor();
    static getInstance(): ScoreManager;
    addScore(basePoints: number): void;
    incrementCombo(): void;
    resetCombo(): void;
    reset(): void;
    getScore(): number;
    getCombo(): number;
}
declare const _default: ScoreManager;
export default _default;
//# sourceMappingURL=ScoreManager.d.ts.map