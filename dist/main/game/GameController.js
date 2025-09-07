"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameController = void 0;
const timing_1 = require("../../shared/timing");
const NoteManager_1 = __importDefault(require("./NoteManager"));
const ScoreManager_1 = __importDefault(require("./ScoreManager"));
const ipcService_1 = require("../services/ipcService");
const SCORE_MAP = {
    KOOL: 1000,
    COOL: 500,
    GOOD: 200,
    MISS: 0,
};
// Dynamic windows computed per chart difficulty (seconds)
class GameController {
    constructor(chart) {
        Object.defineProperty(this, "chart", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "notes", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "startTime", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "isRunning", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "highResTimer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "windowsSec", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: { KOOL: 0.05, COOL: 0.1, GOOD: 0.2, MISS: 0.3 }
        });
        Object.defineProperty(this, "approachTimeSec", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 1.2
        });
        this.chart = chart;
        // Convert note times from milliseconds to seconds for internal logic
        this.notes = chart.notes.map(note => ({
            time: note.time / 1000,
            isHit: false,
            type: 'pin'
        }));
        this.startTime = 0; // Will be set precisely in start()
        // Compute dynamic judgment windows from OD
        const OD = this.chart.metadata?.overallDifficulty ?? 5;
        const { w300, w100, w50 } = (0, timing_1.windowsFromOD)(OD);
        this.windowsSec = {
            KOOL: w300 / 1000,
            COOL: w100 / 1000,
            GOOD: w50 / 1000,
            MISS: Math.max((w50 + 40) / 1000, (w100 + 20) / 1000), // small grace beyond 50
        };
        // Compute approach window from AR
        const AR = this.chart.metadata?.approachRate ?? 5;
        const preemptMs = (0, timing_1.preemptFromAR)(AR);
        this.approachTimeSec = preemptMs / 1000;
    }
    static startGame(chart) {
        try {
            if (GameController.instance) {
                GameController.instance.stop();
            }
            GameController.instance = new GameController(chart);
            GameController.instance.start();
            return { success: true };
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
    static stopGame() {
        try {
            if (GameController.instance) {
                GameController.instance.stop();
            }
            return { success: true };
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
    static getInstance() {
        return GameController.instance || null;
    }
    static isInitialized() {
        return !!GameController.instance;
    }
    stop() {
        this.isRunning = false;
        if (this.highResTimer) {
            clearTimeout(this.highResTimer);
            this.highResTimer = null;
        }
        ipcService_1.ipcService.send('stopMusic');
        console.log('Game Stopped');
    }
    tick() {
        if (!this.isRunning)
            return;
        const currentTime = (performance.now() - this.startTime) / 1000;
        console.log('[GameController] Tick - currentTime:', currentTime, 'notes:', this.notes.length);
        // Check for missed notes
        const missedNotes = this.notes.filter((note) => !note.isHit && currentTime > note.time + this.windowsSec.MISS);
        if (missedNotes.length > 0) {
            console.log('[GameController] Found missed notes:', missedNotes.length);
        }
        missedNotes.forEach((note) => {
            note.isHit = true; // Mark as handled
            console.log('[GameController] Processing MISS for note at time:', note.time);
            this.updateScore('MISS');
        });
    }
    startGameLoop() {
        // Custom high-resolution timer for Node.js backend
        const createHighResTimer = (callback, intervalMs) => {
            let expected = Date.now() + intervalMs;
            let timeout;
            const step = () => {
                const dt = Date.now() - expected;
                if (dt > intervalMs) {
                    // Missed a tick, skip
                }
                callback();
                expected += intervalMs;
                timeout = setTimeout(step, Math.max(0, intervalMs - dt));
            };
            const stop = () => clearTimeout(timeout);
            timeout = setTimeout(step, intervalMs);
            return { stop };
        };
        this.highResTimer = createHighResTimer(() => this.tick(), 16); // ~60fps
    }
    updateScore(judgment, hitErrorMs = 0, noteTime) {
        ScoreManager_1.default.addScore(SCORE_MAP[judgment]);
        if (judgment !== 'MISS') {
            ScoreManager_1.default.incrementCombo();
        }
        else {
            ScoreManager_1.default.resetCombo();
        }
        ipcService_1.ipcService.send('gameUpdate', {
            score: ScoreManager_1.default.getScore(),
            combo: ScoreManager_1.default.getCombo(),
            judgment,
            hitError: hitErrorMs,
            noteTime,
        });
    }
    start() {
        console.log('[GameController] Starting game with chart:', this.chart.title);
        console.log('[GameController] Chart notes count:', this.chart.notes.length);
        this.startTime = performance.now();
        this.isRunning = true;
        // Initialize notes in NoteManager - assuming it has a way to set notes
        ScoreManager_1.default.reset();
        this.startGameLoop();
        // Start music playback
        ipcService_1.ipcService.send('playMusic');
    }
    handlePinPress(currentTimeSec) {
        if (!this.isRunning)
            return;
        const currentTime = typeof currentTimeSec === 'number'
            ? currentTimeSec
            : (performance.now() - this.startTime) / 1000;
        // Filter notes that are within the approach window (AR-based preempt in seconds)
        const APPROACH_TIME = this.approachTimeSec; // seconds
        const activeNotes = this.notes.filter(note => {
            const timeToNote = note.time - currentTime;
            return !note.isHit && timeToNote >= -this.windowsSec.MISS && timeToNote <= APPROACH_TIME;
        });
        if (activeNotes.length === 0) {
            // No active notes - this is a miss
            this.updateScore('MISS');
            return;
        }
        // Find the closest note in time (osu! style - only consider notes that are close to hit time)
        const hitCandidates = activeNotes.filter(note => {
            const timeToNote = note.time - currentTime;
            return Math.abs(timeToNote) <= this.windowsSec.MISS;
        });
        if (hitCandidates.length === 0) {
            // No notes in hit window - this is a miss
            this.updateScore('MISS');
            return;
        }
        // Get the closest note to perfect timing
        const closestNote = hitCandidates.reduce((prev, curr) => {
            const prevDiff = Math.abs(prev.time - currentTime);
            const currDiff = Math.abs(curr.time - currentTime);
            return currDiff < prevDiff ? curr : prev;
        });
        const timeDiff = Math.abs(currentTime - closestNote.time);
        let judgment;
        // osu! style judgment windows (dynamic)
        if (timeDiff <= this.windowsSec.KOOL) {
            judgment = 'KOOL';
        }
        else if (timeDiff <= this.windowsSec.COOL) {
            judgment = 'COOL';
        }
        else if (timeDiff <= this.windowsSec.GOOD) {
            judgment = 'GOOD';
        }
        else {
            judgment = 'MISS';
        }
        // Mark note as hit if not a miss
        if (judgment !== 'MISS') {
            closestNote.isHit = true;
            NoteManager_1.default.updateNote(closestNote);
        }
        const hitError = (currentTime - closestNote.time) * 1000; // ms
        this.updateScore(judgment, hitError, closestNote.time);
    }
}
exports.GameController = GameController;
