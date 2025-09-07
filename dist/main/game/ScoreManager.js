"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ScoreManager {
    constructor() {
        Object.defineProperty(this, "score", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "combo", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
    }
    static getInstance() {
        if (!ScoreManager.instance) {
            ScoreManager.instance = new ScoreManager();
        }
        return ScoreManager.instance;
    }
    addScore(basePoints) {
        if (basePoints > 0) {
            const comboBonus = 1 + Math.floor(this.combo / 10) * 0.1;
            this.score += Math.floor(basePoints * comboBonus);
        }
    }
    incrementCombo() {
        this.combo += 1;
    }
    resetCombo() {
        this.combo = 0;
    }
    reset() {
        this.score = 0;
        this.combo = 0;
    }
    getScore() {
        return this.score;
    }
    getCombo() {
        return this.combo;
    }
}
exports.default = ScoreManager.getInstance();
