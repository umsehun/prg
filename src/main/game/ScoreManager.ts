// src/main/game/ScoreManager.ts
import { Judgment } from '../../shared/types';

class ScoreManager {
    private static instance: ScoreManager;
    private score = 0;
    private combo = 0;

    private constructor() {}

    public static getInstance(): ScoreManager {
        if (!ScoreManager.instance) {
            ScoreManager.instance = new ScoreManager();
        }
        return ScoreManager.instance;
    }

    public addScore(basePoints: number) {
        if (basePoints > 0) {
            const comboBonus = 1 + Math.floor(this.combo / 10) * 0.1;
            this.score += Math.floor(basePoints * comboBonus);
        }
    }

    public incrementCombo() {
        this.combo += 1;
    }

    public resetCombo() {
        this.combo = 0;
    }

    public reset() {
        this.score = 0;
        this.combo = 0;
    }

    public getScore() {
        return this.score;
    }

    public getCombo() {
        return this.combo;
    }
}

export default ScoreManager.getInstance();
