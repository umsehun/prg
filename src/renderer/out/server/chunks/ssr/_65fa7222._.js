module.exports = [
"[project]/src/renderer/lib/ipc-service.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * IPC Service - Frontend service for communicating with Electron main process
 * Provides type-safe APIs for renderer to interact with backend
 */ __turbopack_context__.s([
    "ipcService",
    ()=>ipcService
]);
class IPCService {
    static instance;
    static getInstance() {
        if (!IPCService.instance) {
            IPCService.instance = new IPCService();
        }
        return IPCService.instance;
    }
    get api() {
        if (!window.electronAPI) {
            throw new Error('Electron API not available. Make sure this is running in Electron.');
        }
        return window.electronAPI;
    }
    // Game methods - Updated for new runtime .osu loading API
    async getDifficulties(chartId) {
        return await this.api.game.getDifficulties(chartId);
    }
    async startGame(params) {
        console.log('🔌 IPC: Calling game.start with params:', params);
        const result = await this.api.game.start(params); // ✅ Updated: Use new API params
        console.log('🔌 IPC: game.start result:', result);
        if (!result.success) {
            console.error('🔌 IPC: Game start failed:', result.error);
            throw new Error(result.error || 'Failed to start game');
        }
        console.log('🔌 IPC: Game start successful, returning mock session');
        // Mock GameSession for now - this should come from the backend
        return {
            sessionId: 'mock-session-' + Date.now(),
            chartId: params.chartId,
            startTime: Date.now(),
            score: 0,
            accuracy: 1.0,
            combo: 0
        };
    }
    async stopGame() {
        const result = await this.api.game.stop();
        if (!result.success) {
            throw new Error(result.error || 'Failed to stop game');
        }
    }
    async pauseGame() {
        const result = await this.api.game.pause();
        if (!result.success) {
            throw new Error(result.error || 'Failed to pause game');
        }
    }
    async resumeGame() {
        const result = await this.api.game.resume();
        if (!result.success) {
            throw new Error(result.error || 'Failed to resume game');
        }
    }
    throwKnife(data) {
        this.api.game.throwKnife({
            id: data.id,
            time: data.time
        });
    }
    onKnifeResult(callback) {
        return this.api.game.onKnifeResult(callback);
    }
    // Chart methods (using osz API)
    async getChartLibrary() {
        const result = await this.api.osz.getLibrary();
        if (!result.success) {
            throw new Error(result.error || 'Failed to load chart library');
        }
        return result.charts || [];
    }
    async getChart(chartId) {
        // For now, get from library and find by ID
        const library = await this.getChartLibrary();
        const chart = library.find((c)=>c.id === chartId);
        if (!chart) {
            throw new Error(`Chart ${chartId} not found`);
        }
        return chart;
    }
    async importChart(filePath) {
        const result = await this.api.osz.import(filePath);
        return {
            success: result.success,
            error: result.error
        };
    }
    async removeChart(chartId) {
        const result = await this.api.osz.removeChart(chartId);
        if (!result.success) {
            throw new Error(result.error || 'Failed to remove chart');
        }
    }
    async getChartAudio(chartId) {
        const result = await this.api.osz.getAudio(chartId);
        if (!result.success) {
            throw new Error(result.error || 'Failed to get audio');
        }
        // Convert ArrayBuffer to URL if needed
        return 'mock-audio-url';
    }
    async getChartBackground(chartId) {
        // Mock implementation for now
        return 'mock-background-url';
    }
    // Settings methods
    async getSettings() {
        const result = await this.api.settings.getAll();
        if (!result.success) {
            throw new Error(result.error || 'Failed to load settings');
        }
        // Return default settings if none exist
        return result.settings || {
            audio: {
                masterVolume: 1.0,
                musicVolume: 0.8,
                effectVolume: 0.6,
                enableFeedback: true
            },
            game: {
                scrollSpeed: 1.0,
                noteSize: 1.0,
                enableParticles: true,
                showFps: false
            },
            display: {
                fullscreen: false,
                vsync: true,
                targetFps: 60
            },
            controls: {
                keyBindings: {
                    lane1: 'D',
                    lane2: 'F',
                    lane3: 'J',
                    lane4: 'K'
                }
            }
        };
    }
    async setSetting(key, value) {
        const result = await this.api.settings.set(key, value);
        if (!result.success) {
            throw new Error(result.error || 'Failed to update setting');
        }
    }
    async resetSettings() {
        const result = await this.api.settings.reset();
        if (!result.success) {
            throw new Error(result.error || 'Failed to reset settings');
        }
    }
    onSettingsChange(callback) {
        return this.api.settings.onChange((change)=>{
            // For now, just trigger a reload - in production this would be more sophisticated
            this.getSettings().then(callback).catch(console.error);
        });
    }
    // System methods
    async getVersion() {
        return this.api.system.version || '0.1.0';
    }
    async openExternal(url) {
        // Mock implementation - would need to add to backend
        window.open(url, '_blank');
    }
    async showMessageBox(options) {
        // Mock implementation - would use alert for now
        return {
            response: 0
        };
    }
}
const ipcService = IPCService.getInstance();
}),
"[project]/src/renderer/hooks/useGameState.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * useGameState Hook - Manages game state and controls
 * ✅ UNIFIED: Uses consistent ipc-service pattern throughout
 */ __turbopack_context__.s([
    "useGameState",
    ()=>useGameState
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$renderer$2f$lib$2f$ipc$2d$service$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/renderer/lib/ipc-service.ts [app-ssr] (ecmascript)");
'use client';
;
;
function useGameState() {
    // Initialize currentSong from localStorage
    const [currentSong, setCurrentSong] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>{
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        return null;
    });
    const [gameMode, setGameMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('osu');
    // Initialize gameState from localStorage to survive hot reloads
    const [gameState, setGameState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>{
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        return 'idle';
    });
    // Debug: Track gameState changes and save to localStorage
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        console.log('🎮 DEBUG: gameState changed to:', gameState);
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
    }, [
        gameState
    ]);
    // Save currentSong to localStorage
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
    }, [
        currentSong
    ]);
    const [stats, setStats] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        score: 0,
        combo: 0,
        accuracy: 100,
        hits: {
            perfect: 0,
            great: 0,
            good: 0,
            miss: 0
        }
    });
    const gameStartTime = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(0);
    const isPlaying = gameState === 'playing';
    const startGame = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async (song, mode = 'pin')=>{
        try {
            setGameState('loading');
            // ✅ CRITICAL FIX: Always stop any existing game first
            try {
                await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$renderer$2f$lib$2f$ipc$2d$service$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ipcService"].stopGame();
                console.log('🛑 Stopped existing game session');
            } catch (stopError) {
                console.log('ℹ️ No existing game to stop:', stopError);
            }
            // ✅ NEW API: Use chartId and difficulty instead of full chartData
            console.log('🎮 Starting pin game with song:', song.title, '(ID:', song.id, ')');
            const gameStartParams = {
                chartId: song.id,
                difficulty: 'Normal',
                gameMode: 'osu',
                mods: []
            };
            console.log('🎮 Starting game with new API params:', gameStartParams);
            // ✅ Start new game session
            const gameSession = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$renderer$2f$lib$2f$ipc$2d$service$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ipcService"].startGame(gameStartParams);
            console.log('🎮 Pin game session started:', gameSession);
            console.log('🎮 Setting currentSong and gameState to playing');
            setCurrentSong(song);
            setGameMode('pin'); // Always set to pin mode
            setGameState('playing');
            console.log('🎮 GameState should now be "playing"');
            // Double check after state set
            setTimeout(()=>{
                console.log('🎮 TIMEOUT CHECK: gameState after 100ms should be "playing"');
            }, 100);
            gameStartTime.current = Date.now();
            resetStats();
            return true;
        } catch (error) {
            console.error('❌ Game start failed:', error);
            setGameState('idle');
            return false;
        }
    }, []);
    const stopGame = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        try {
            // Only try to stop if game is actually running
            if (gameState === 'playing' || gameState === 'paused') {
                await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$renderer$2f$lib$2f$ipc$2d$service$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ipcService"].stopGame();
            } else {
                console.log('🛑 No game running, skipping stop command');
            }
            setGameState('idle');
            setCurrentSong(null);
            // Clear localStorage
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
        } catch (error) {
            console.log('ℹ️ Stop game error (may be expected):', error);
            // Always reset state even if stop fails
            setGameState('idle');
            setCurrentSong(null);
            // Clear localStorage
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
        }
    }, [
        gameState
    ]);
    const pauseGame = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        try {
            // ✅ Use ipcService for consistency
            if ("undefined" !== 'undefined' && window.electronAPI?.game?.pause) //TURBOPACK unreachable
            ;
        } catch (error) {
            console.error('❌ Failed to pause game:', error);
        }
    }, []);
    const resumeGame = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        try {
            // ✅ Use ipcService for consistency
            if ("undefined" !== 'undefined' && window.electronAPI?.game?.resume) //TURBOPACK unreachable
            ;
        } catch (error) {
            console.error('❌ Failed to resume game:', error);
        }
    }, []);
    const updateStats = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((newStats)=>{
        setStats((prev)=>({
                ...prev,
                ...newStats
            }));
    }, []);
    const submitScore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        if (!currentSong) return false;
        try {
            const scoreData = {
                songId: currentSong.id,
                score: stats.score,
                accuracy: stats.accuracy,
                combo: stats.combo,
                rank: calculateRank(stats.accuracy),
                timestamp: Date.now()
            };
            // ✅ TODO: Implement actual score submission via ipcService
            console.log('📊 Score submission (TODO):', scoreData);
            return true;
        } catch (error) {
            console.error('❌ Failed to submit score:', error);
            return false;
        }
    }, [
        currentSong,
        stats
    ]);
    const resetStats = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        setStats({
            score: 0,
            combo: 0,
            accuracy: 100,
            hits: {
                perfect: 0,
                great: 0,
                good: 0,
                miss: 0
            }
        });
    }, []);
    return {
        // State
        currentSong,
        gameMode,
        gameState,
        stats,
        isPlaying,
        // Controls
        startGame,
        stopGame,
        pauseGame,
        resumeGame,
        // Score management
        updateStats,
        submitScore,
        resetStats
    };
}
// Helper function to calculate rank based on accuracy
function calculateRank(accuracy) {
    if (accuracy >= 97) return 'SS';
    if (accuracy >= 90) return 'S';
    if (accuracy >= 80) return 'A';
    if (accuracy >= 70) return 'B';
    if (accuracy >= 60) return 'C';
    if (accuracy >= 50) return 'D';
    return 'F';
}
}),
"[project]/src/renderer/app/pin/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * OSU-style Rhythm Game Page
 * Full-screen game with approach circles and hit circles
 */ __turbopack_context__.s([
    "default",
    ()=>OsuGamePage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/styled-jsx/style.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$renderer$2f$hooks$2f$useGameState$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/renderer/hooks/useGameState.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
// Simple OSU Canvas Component
function OsuGameCanvas({ hitObjects, currentTime, onHit }) {
    const canvasRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Draw function
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Filter visible hit objects
        const visibleObjects = hitObjects.filter((obj)=>{
            const timeDiff = obj.time - currentTime;
            return timeDiff <= 600 && timeDiff >= -200;
        });
        // Draw hit objects
        visibleObjects.forEach((obj)=>{
            const timeDiff = obj.time - currentTime;
            // Calculate approach circle scale (4 -> 1)
            const approachScale = Math.max(1, 4 - 3 * Math.max(0, (600 - timeDiff) / 600));
            // Calculate opacity
            let opacity = 1;
            if (timeDiff > 200) {
                opacity = Math.max(0, (600 - timeDiff) / 400);
            } else if (timeDiff < -50) {
                opacity = Math.max(0, (50 + timeDiff) / 150);
            }
            ctx.globalAlpha = opacity;
            // Draw approach circle (shrinking)
            if (timeDiff > 0 && approachScale > 1) {
                ctx.beginPath();
                ctx.arc(obj.x, obj.y, obj.radius * approachScale, 0, 2 * Math.PI);
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 3;
                ctx.stroke();
            }
            // Draw hit circle (fixed size)
            ctx.beginPath();
            ctx.arc(obj.x, obj.y, obj.radius, 0, 2 * Math.PI);
            ctx.fillStyle = obj.color;
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 3;
            ctx.stroke();
            // Draw number
            ctx.fillStyle = '#ffffff';
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(obj.number.toString(), obj.x, obj.y);
        });
        ctx.globalAlpha = 1;
    }, [
        hitObjects,
        currentTime
    ]);
    // Handle click
    const handleClick = (e)=>{
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        // Find hit objects near click
        hitObjects.forEach((obj)=>{
            const distance = Math.sqrt(Math.pow(x - obj.x, 2) + Math.pow(y - obj.y, 2));
            if (distance <= obj.radius + 20) {
                const timeDiff = Math.abs(obj.time - currentTime);
                onHit(obj.id, Math.max(0, 300 - timeDiff));
            }
        });
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("canvas", {
        ref: canvasRef,
        width: 1280,
        height: 720,
        className: "cursor-pointer",
        style: {
            background: '#000'
        },
        onClick: handleClick
    }, void 0, false, {
        fileName: "[project]/src/renderer/app/pin/page.tsx",
        lineNumber: 127,
        columnNumber: 9
    }, this);
}
// Hit judgment display
function HitJudgment({ hitResult, onClear }) {
    const [visible, setVisible] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (hitResult) {
            setVisible(true);
            const timer = setTimeout(()=>{
                setVisible(false);
                onClear();
            }, 1000);
            return ()=>clearTimeout(timer);
        }
    }, [
        hitResult,
        onClear
    ]);
    if (!visible || !hitResult) return null;
    const getJudgmentColor = (judgment)=>{
        switch(judgment){
            case 'PERFECT':
                return '#00ff88';
            case 'GREAT':
                return '#88ff00';
            case 'GOOD':
                return '#ffff00';
            case 'MISS':
                return '#ff0000';
            default:
                return '#ffffff';
        }
    };
    const getJudgmentText = (judgment)=>{
        switch(judgment){
            case 'PERFECT':
                return '300';
            case 'GREAT':
                return '100';
            case 'GOOD':
                return '50';
            case 'MISS':
                return 'MISS';
            default:
                return '';
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed pointer-events-none z-50",
        style: {
            left: `${hitResult.x}px`,
            top: `${hitResult.y}px`,
            transform: 'translate(-50%, -50%)',
            color: getJudgmentColor(hitResult.judgment),
            fontSize: '2rem',
            fontWeight: 'bold',
            textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
            animation: 'hitFade 1s ease-out forwards'
        },
        children: getJudgmentText(hitResult.judgment)
    }, void 0, false, {
        fileName: "[project]/src/renderer/app/pin/page.tsx",
        lineNumber: 182,
        columnNumber: 9
    }, this);
}
function OsuGamePage() {
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const { currentSong, gameState, stats, pauseGame, resumeGame, stopGame, updateStats } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$renderer$2f$hooks$2f$useGameState$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useGameState"])();
    // Audio/Video refs
    const audioRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const videoRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Game state
    const [currentTime, setCurrentTime] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [hitObjects, setHitObjects] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [hitResult, setHitResult] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    // ESC key handling
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const handleKeyPress = (e)=>{
            if (e.key === 'Escape') {
                e.preventDefault();
                if (gameState === 'playing') {
                    pauseGame();
                } else if (gameState === 'paused') {
                    resumeGame();
                }
            } else if (e.key.toLowerCase() === 's' && !e.repeat) {
                // S key hit detection
                const sortedObjects = [
                    ...hitObjects
                ].sort((a, b)=>Math.abs(a.time - currentTime) - Math.abs(b.time - currentTime));
                if (sortedObjects.length > 0) {
                    const closest = sortedObjects[0];
                    const timeDiff = Math.abs(closest.time - currentTime);
                    if (timeDiff <= 150) {
                        handleHit(closest.id, Math.max(0, 300 - timeDiff));
                    }
                }
            }
        };
        window.addEventListener('keydown', handleKeyPress);
        return ()=>window.removeEventListener('keydown', handleKeyPress);
    }, [
        gameState,
        pauseGame,
        resumeGame,
        hitObjects,
        currentTime
    ]);
    // Generate demo hit objects
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (currentSong && gameState === 'playing') {
            const colors = [
                '#ff6b6b',
                '#4ecdc4',
                '#45b7d1',
                '#f9ca24',
                '#f0932b'
            ];
            const demoObjects = [];
            for(let i = 0; i < 20; i++){
                demoObjects.push({
                    id: `hit_${i}`,
                    x: 200 + i % 4 * 200,
                    y: 150 + Math.floor(i / 4) * 120,
                    time: 2000 + i * 1000,
                    radius: 50,
                    number: i + 1,
                    color: colors[i % colors.length]
                });
            }
            setHitObjects(demoObjects);
        }
    }, [
        currentSong,
        gameState
    ]);
    // Media loading and playback
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (currentSong && gameState === 'playing') {
            // Load and play audio
            if (audioRef.current && currentSong.audioFile) {
                audioRef.current.src = `file://${currentSong.audioFile}`;
                audioRef.current.play().catch(console.error);
            }
            // Load and play video if available (check if property exists)
            if (videoRef.current && currentSong.videoFile) {
                videoRef.current.src = `file://${currentSong.videoFile}`;
                videoRef.current.play().catch(console.error);
            }
        }
    }, [
        currentSong,
        gameState
    ]);
    // Update current time
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (gameState === 'playing') {
            const interval = setInterval(()=>{
                if (audioRef.current && !audioRef.current.paused) {
                    setCurrentTime(audioRef.current.currentTime * 1000);
                }
            }, 16);
            return ()=>clearInterval(interval);
        }
    }, [
        gameState
    ]);
    // Hit handling
    const handleHit = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((hitObjectId, accuracy)=>{
        const hitObject = hitObjects.find((obj)=>obj.id === hitObjectId);
        if (!hitObject) return;
        const timeDiff = currentTime - hitObject.time;
        const absTimeDiff = Math.abs(timeDiff);
        let judgment;
        if (absTimeDiff <= 50) judgment = 'PERFECT';
        else if (absTimeDiff <= 100) judgment = 'GREAT';
        else if (absTimeDiff <= 150) judgment = 'GOOD';
        else judgment = 'MISS';
        const baseScore = {
            'PERFECT': 300,
            'GREAT': 100,
            'GOOD': 50,
            'MISS': 0
        };
        const score = baseScore[judgment];
        // Show hit result
        setHitResult({
            id: hitObjectId,
            judgment,
            accuracy,
            timestamp: currentTime,
            x: hitObject.x,
            y: hitObject.y
        });
        // Update stats
        const newCombo = judgment === 'MISS' ? 0 : stats.combo + 1;
        updateStats({
            score: stats.score + score,
            combo: newCombo,
            hits: {
                ...stats.hits,
                [judgment.toLowerCase()]: stats.hits[judgment.toLowerCase()] + 1
            }
        });
        // Remove hit object
        setHitObjects((prev)=>prev.filter((obj)=>obj.id !== hitObjectId));
        console.log(`🎯 ${judgment}: ${timeDiff}ms | Score: ${score}`);
    }, [
        hitObjects,
        currentTime,
        stats,
        updateStats
    ]);
    if (gameState === 'idle' || !currentSong) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "min-h-screen bg-black flex items-center justify-center",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "text-2xl font-bold text-white mb-4",
                        children: "곡을 선택해주세요"
                    }, void 0, false, {
                        fileName: "[project]/src/renderer/app/pin/page.tsx",
                        lineNumber: 352,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>router.push('/select'),
                        className: "px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700",
                        children: "곡 선택하기"
                    }, void 0, false, {
                        fileName: "[project]/src/renderer/app/pin/page.tsx",
                        lineNumber: 353,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/renderer/app/pin/page.tsx",
                lineNumber: 351,
                columnNumber: 17
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/renderer/app/pin/page.tsx",
            lineNumber: 350,
            columnNumber: 13
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "jsx-709fb4d728faba4" + " " + "min-h-screen bg-black relative overflow-hidden",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("video", {
                ref: videoRef,
                muted: true,
                playsInline: true,
                className: "jsx-709fb4d728faba4" + " " + "absolute inset-0 w-full h-full object-cover opacity-30"
            }, void 0, false, {
                fileName: "[project]/src/renderer/app/pin/page.tsx",
                lineNumber: 367,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("audio", {
                ref: audioRef,
                className: "jsx-709fb4d728faba4"
            }, void 0, false, {
                fileName: "[project]/src/renderer/app/pin/page.tsx",
                lineNumber: 375,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "jsx-709fb4d728faba4" + " " + "absolute top-4 left-1/2 transform -translate-x-1/2 z-10",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "jsx-709fb4d728faba4" + " " + "flex items-center gap-8 text-white text-xl font-bold",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "jsx-709fb4d728faba4",
                            children: [
                                "Score: ",
                                stats.score.toLocaleString()
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/renderer/app/pin/page.tsx",
                            lineNumber: 380,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "jsx-709fb4d728faba4",
                            children: [
                                "Combo: ",
                                stats.combo,
                                "x"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/renderer/app/pin/page.tsx",
                            lineNumber: 381,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "jsx-709fb4d728faba4" + " " + "text-sm opacity-80",
                            children: currentSong.title
                        }, void 0, false, {
                            fileName: "[project]/src/renderer/app/pin/page.tsx",
                            lineNumber: 382,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/renderer/app/pin/page.tsx",
                    lineNumber: 379,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/renderer/app/pin/page.tsx",
                lineNumber: 378,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "jsx-709fb4d728faba4" + " " + "flex items-center justify-center min-h-screen",
                children: gameState === 'playing' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(OsuGameCanvas, {
                    hitObjects: hitObjects,
                    currentTime: currentTime,
                    onHit: handleHit
                }, void 0, false, {
                    fileName: "[project]/src/renderer/app/pin/page.tsx",
                    lineNumber: 389,
                    columnNumber: 21
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "jsx-709fb4d728faba4" + " " + "text-center",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                            className: "jsx-709fb4d728faba4" + " " + "text-2xl font-bold text-white mb-4",
                            children: gameState === 'paused' ? '일시정지' : '게임 대기'
                        }, void 0, false, {
                            fileName: "[project]/src/renderer/app/pin/page.tsx",
                            lineNumber: 396,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "jsx-709fb4d728faba4" + " " + "text-slate-300 mb-4",
                            children: gameState === 'paused' ? 'ESC를 눌러 재개' : '게임을 시작해주세요'
                        }, void 0, false, {
                            fileName: "[project]/src/renderer/app/pin/page.tsx",
                            lineNumber: 399,
                            columnNumber: 25
                        }, this),
                        gameState === 'paused' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "jsx-709fb4d728faba4" + " " + "flex gap-4 justify-center",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: resumeGame,
                                    className: "jsx-709fb4d728faba4" + " " + "px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700",
                                    children: "재개"
                                }, void 0, false, {
                                    fileName: "[project]/src/renderer/app/pin/page.tsx",
                                    lineNumber: 404,
                                    columnNumber: 33
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: stopGame,
                                    className: "jsx-709fb4d728faba4" + " " + "px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700",
                                    children: "정지"
                                }, void 0, false, {
                                    fileName: "[project]/src/renderer/app/pin/page.tsx",
                                    lineNumber: 410,
                                    columnNumber: 33
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/renderer/app/pin/page.tsx",
                            lineNumber: 403,
                            columnNumber: 29
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/renderer/app/pin/page.tsx",
                    lineNumber: 395,
                    columnNumber: 21
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/renderer/app/pin/page.tsx",
                lineNumber: 387,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(HitJudgment, {
                hitResult: hitResult,
                onClear: ()=>setHitResult(null)
            }, void 0, false, {
                fileName: "[project]/src/renderer/app/pin/page.tsx",
                lineNumber: 423,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                id: "709fb4d728faba4",
                children: "@keyframes hitFade{0%{opacity:1;transform:translate(-50%,-50%)scale(1.5)}70%{opacity:1;transform:translate(-50%,-50%)scale(1)}to{opacity:0;transform:translate(-50%,-50%)scale(.8)}}"
            }, void 0, false, void 0, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/renderer/app/pin/page.tsx",
        lineNumber: 365,
        columnNumber: 9
    }, this);
}
}),
"[project]/node_modules/next/dist/compiled/client-only/index.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {

}),
"[project]/node_modules/styled-jsx/dist/index/index.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {

__turbopack_context__.r("[project]/node_modules/next/dist/compiled/client-only/index.js [app-ssr] (ecmascript)");
var React = __turbopack_context__.r("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
function _interopDefaultLegacy(e) {
    return e && typeof e === 'object' && 'default' in e ? e : {
        'default': e
    };
}
var React__default = /*#__PURE__*/ _interopDefaultLegacy(React);
/*
Based on Glamor's sheet
https://github.com/threepointone/glamor/blob/667b480d31b3721a905021b26e1290ce92ca2879/src/sheet.js
*/ function _defineProperties(target, props) {
    for(var i = 0; i < props.length; i++){
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
    }
}
function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
}
var isProd = typeof process !== "undefined" && process.env && ("TURBOPACK compile-time value", "development") === "production";
var isString = function(o) {
    return Object.prototype.toString.call(o) === "[object String]";
};
var StyleSheet = /*#__PURE__*/ function() {
    function StyleSheet(param) {
        var ref = param === void 0 ? {} : param, _name = ref.name, name = _name === void 0 ? "stylesheet" : _name, _optimizeForSpeed = ref.optimizeForSpeed, optimizeForSpeed = _optimizeForSpeed === void 0 ? isProd : _optimizeForSpeed;
        invariant$1(isString(name), "`name` must be a string");
        this._name = name;
        this._deletedRulePlaceholder = "#" + name + "-deleted-rule____{}";
        invariant$1(typeof optimizeForSpeed === "boolean", "`optimizeForSpeed` must be a boolean");
        this._optimizeForSpeed = optimizeForSpeed;
        this._serverSheet = undefined;
        this._tags = [];
        this._injected = false;
        this._rulesCount = 0;
        var node = "undefined" !== "undefined" && document.querySelector('meta[property="csp-nonce"]');
        this._nonce = ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : null;
    }
    var _proto = StyleSheet.prototype;
    _proto.setOptimizeForSpeed = function setOptimizeForSpeed(bool) {
        invariant$1(typeof bool === "boolean", "`setOptimizeForSpeed` accepts a boolean");
        invariant$1(this._rulesCount === 0, "optimizeForSpeed cannot be when rules have already been inserted");
        this.flush();
        this._optimizeForSpeed = bool;
        this.inject();
    };
    _proto.isOptimizeForSpeed = function isOptimizeForSpeed() {
        return this._optimizeForSpeed;
    };
    _proto.inject = function inject() {
        var _this = this;
        invariant$1(!this._injected, "sheet already injected");
        this._injected = true;
        if ("undefined" !== "undefined" && this._optimizeForSpeed) //TURBOPACK unreachable
        ;
        this._serverSheet = {
            cssRules: [],
            insertRule: function(rule, index) {
                if (typeof index === "number") {
                    _this._serverSheet.cssRules[index] = {
                        cssText: rule
                    };
                } else {
                    _this._serverSheet.cssRules.push({
                        cssText: rule
                    });
                }
                return index;
            },
            deleteRule: function(index) {
                _this._serverSheet.cssRules[index] = null;
            }
        };
    };
    _proto.getSheetForTag = function getSheetForTag(tag) {
        if (tag.sheet) {
            return tag.sheet;
        }
        // this weirdness brought to you by firefox
        for(var i = 0; i < document.styleSheets.length; i++){
            if (document.styleSheets[i].ownerNode === tag) {
                return document.styleSheets[i];
            }
        }
    };
    _proto.getSheet = function getSheet() {
        return this.getSheetForTag(this._tags[this._tags.length - 1]);
    };
    _proto.insertRule = function insertRule(rule, index) {
        invariant$1(isString(rule), "`insertRule` accepts only strings");
        if ("TURBOPACK compile-time truthy", 1) {
            if (typeof index !== "number") {
                index = this._serverSheet.cssRules.length;
            }
            this._serverSheet.insertRule(rule, index);
            return this._rulesCount++;
        }
        //TURBOPACK unreachable
        ;
        var sheet;
        var insertionPoint;
    };
    _proto.replaceRule = function replaceRule(index, rule) {
        if (this._optimizeForSpeed || "undefined" === "undefined") {
            var sheet = ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : this._serverSheet;
            if (!rule.trim()) {
                rule = this._deletedRulePlaceholder;
            }
            if (!sheet.cssRules[index]) {
                // @TBD Should we throw an error?
                return index;
            }
            sheet.deleteRule(index);
            try {
                sheet.insertRule(rule, index);
            } catch (error) {
                if ("TURBOPACK compile-time truthy", 1) {
                    console.warn("StyleSheet: illegal rule: \n\n" + rule + "\n\nSee https://stackoverflow.com/q/20007992 for more info");
                }
                // In order to preserve the indices we insert a deleteRulePlaceholder
                sheet.insertRule(this._deletedRulePlaceholder, index);
            }
        } else //TURBOPACK unreachable
        {
            var tag;
        }
        return index;
    };
    _proto.deleteRule = function deleteRule(index) {
        if ("TURBOPACK compile-time truthy", 1) {
            this._serverSheet.deleteRule(index);
            return;
        }
        //TURBOPACK unreachable
        ;
        var tag;
    };
    _proto.flush = function flush() {
        this._injected = false;
        this._rulesCount = 0;
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        else {
            // simpler on server
            this._serverSheet.cssRules = [];
        }
    };
    _proto.cssRules = function cssRules() {
        var _this = this;
        if ("TURBOPACK compile-time truthy", 1) {
            return this._serverSheet.cssRules;
        }
        //TURBOPACK unreachable
        ;
    };
    _proto.makeStyleTag = function makeStyleTag(name, cssString, relativeToTag) {
        if (cssString) {
            invariant$1(isString(cssString), "makeStyleTag accepts only strings as second parameter");
        }
        var tag = document.createElement("style");
        if (this._nonce) tag.setAttribute("nonce", this._nonce);
        tag.type = "text/css";
        tag.setAttribute("data-" + name, "");
        if (cssString) {
            tag.appendChild(document.createTextNode(cssString));
        }
        var head = document.head || document.getElementsByTagName("head")[0];
        if (relativeToTag) {
            head.insertBefore(tag, relativeToTag);
        } else {
            head.appendChild(tag);
        }
        return tag;
    };
    _createClass(StyleSheet, [
        {
            key: "length",
            get: function get() {
                return this._rulesCount;
            }
        }
    ]);
    return StyleSheet;
}();
function invariant$1(condition, message) {
    if (!condition) {
        throw new Error("StyleSheet: " + message + ".");
    }
}
function hash(str) {
    var _$hash = 5381, i = str.length;
    while(i){
        _$hash = _$hash * 33 ^ str.charCodeAt(--i);
    }
    /* JavaScript does bitwise operations (like XOR, above) on 32-bit signed
   * integers. Since we want the results to be always positive, convert the
   * signed int to an unsigned by doing an unsigned bitshift. */ return _$hash >>> 0;
}
var stringHash = hash;
var sanitize = function(rule) {
    return rule.replace(/\/style/gi, "\\/style");
};
var cache = {};
/**
 * computeId
 *
 * Compute and memoize a jsx id from a basedId and optionally props.
 */ function computeId(baseId, props) {
    if (!props) {
        return "jsx-" + baseId;
    }
    var propsToString = String(props);
    var key = baseId + propsToString;
    if (!cache[key]) {
        cache[key] = "jsx-" + stringHash(baseId + "-" + propsToString);
    }
    return cache[key];
}
/**
 * computeSelector
 *
 * Compute and memoize dynamic selectors.
 */ function computeSelector(id, css) {
    var selectoPlaceholderRegexp = /__jsx-style-dynamic-selector/g;
    // Sanitize SSR-ed CSS.
    // Client side code doesn't need to be sanitized since we use
    // document.createTextNode (dev) and the CSSOM api sheet.insertRule (prod).
    if ("TURBOPACK compile-time truthy", 1) {
        css = sanitize(css);
    }
    var idcss = id + css;
    if (!cache[idcss]) {
        cache[idcss] = css.replace(selectoPlaceholderRegexp, id);
    }
    return cache[idcss];
}
function mapRulesToStyle(cssRules, options) {
    if (options === void 0) options = {};
    return cssRules.map(function(args) {
        var id = args[0];
        var css = args[1];
        return /*#__PURE__*/ React__default["default"].createElement("style", {
            id: "__" + id,
            // Avoid warnings upon render with a key
            key: "__" + id,
            nonce: options.nonce ? options.nonce : undefined,
            dangerouslySetInnerHTML: {
                __html: css
            }
        });
    });
}
var StyleSheetRegistry = /*#__PURE__*/ function() {
    function StyleSheetRegistry(param) {
        var ref = param === void 0 ? {} : param, _styleSheet = ref.styleSheet, styleSheet = _styleSheet === void 0 ? null : _styleSheet, _optimizeForSpeed = ref.optimizeForSpeed, optimizeForSpeed = _optimizeForSpeed === void 0 ? false : _optimizeForSpeed;
        this._sheet = styleSheet || new StyleSheet({
            name: "styled-jsx",
            optimizeForSpeed: optimizeForSpeed
        });
        this._sheet.inject();
        if (styleSheet && typeof optimizeForSpeed === "boolean") {
            this._sheet.setOptimizeForSpeed(optimizeForSpeed);
            this._optimizeForSpeed = this._sheet.isOptimizeForSpeed();
        }
        this._fromServer = undefined;
        this._indices = {};
        this._instancesCounts = {};
    }
    var _proto = StyleSheetRegistry.prototype;
    _proto.add = function add(props) {
        var _this = this;
        if (undefined === this._optimizeForSpeed) {
            this._optimizeForSpeed = Array.isArray(props.children);
            this._sheet.setOptimizeForSpeed(this._optimizeForSpeed);
            this._optimizeForSpeed = this._sheet.isOptimizeForSpeed();
        }
        if ("undefined" !== "undefined" && !this._fromServer) //TURBOPACK unreachable
        ;
        var ref = this.getIdAndRules(props), styleId = ref.styleId, rules = ref.rules;
        // Deduping: just increase the instances count.
        if (styleId in this._instancesCounts) {
            this._instancesCounts[styleId] += 1;
            return;
        }
        var indices = rules.map(function(rule) {
            return _this._sheet.insertRule(rule);
        }) // Filter out invalid rules
        .filter(function(index) {
            return index !== -1;
        });
        this._indices[styleId] = indices;
        this._instancesCounts[styleId] = 1;
    };
    _proto.remove = function remove(props) {
        var _this = this;
        var styleId = this.getIdAndRules(props).styleId;
        invariant(styleId in this._instancesCounts, "styleId: `" + styleId + "` not found");
        this._instancesCounts[styleId] -= 1;
        if (this._instancesCounts[styleId] < 1) {
            var tagFromServer = this._fromServer && this._fromServer[styleId];
            if (tagFromServer) {
                tagFromServer.parentNode.removeChild(tagFromServer);
                delete this._fromServer[styleId];
            } else {
                this._indices[styleId].forEach(function(index) {
                    return _this._sheet.deleteRule(index);
                });
                delete this._indices[styleId];
            }
            delete this._instancesCounts[styleId];
        }
    };
    _proto.update = function update(props, nextProps) {
        this.add(nextProps);
        this.remove(props);
    };
    _proto.flush = function flush() {
        this._sheet.flush();
        this._sheet.inject();
        this._fromServer = undefined;
        this._indices = {};
        this._instancesCounts = {};
    };
    _proto.cssRules = function cssRules() {
        var _this = this;
        var fromServer = this._fromServer ? Object.keys(this._fromServer).map(function(styleId) {
            return [
                styleId,
                _this._fromServer[styleId]
            ];
        }) : [];
        var cssRules = this._sheet.cssRules();
        return fromServer.concat(Object.keys(this._indices).map(function(styleId) {
            return [
                styleId,
                _this._indices[styleId].map(function(index) {
                    return cssRules[index].cssText;
                }).join(_this._optimizeForSpeed ? "" : "\n")
            ];
        }) // filter out empty rules
        .filter(function(rule) {
            return Boolean(rule[1]);
        }));
    };
    _proto.styles = function styles(options) {
        return mapRulesToStyle(this.cssRules(), options);
    };
    _proto.getIdAndRules = function getIdAndRules(props) {
        var css = props.children, dynamic = props.dynamic, id = props.id;
        if (dynamic) {
            var styleId = computeId(id, dynamic);
            return {
                styleId: styleId,
                rules: Array.isArray(css) ? css.map(function(rule) {
                    return computeSelector(styleId, rule);
                }) : [
                    computeSelector(styleId, css)
                ]
            };
        }
        return {
            styleId: computeId(id),
            rules: Array.isArray(css) ? css : [
                css
            ]
        };
    };
    /**
   * selectFromServer
   *
   * Collects style tags from the document with id __jsx-XXX
   */ _proto.selectFromServer = function selectFromServer() {
        var elements = Array.prototype.slice.call(document.querySelectorAll('[id^="__jsx-"]'));
        return elements.reduce(function(acc, element) {
            var id = element.id.slice(2);
            acc[id] = element;
            return acc;
        }, {});
    };
    return StyleSheetRegistry;
}();
function invariant(condition, message) {
    if (!condition) {
        throw new Error("StyleSheetRegistry: " + message + ".");
    }
}
var StyleSheetContext = /*#__PURE__*/ React.createContext(null);
StyleSheetContext.displayName = "StyleSheetContext";
function createStyleRegistry() {
    return new StyleSheetRegistry();
}
function StyleRegistry(param) {
    var configuredRegistry = param.registry, children = param.children;
    var rootRegistry = React.useContext(StyleSheetContext);
    var ref = React.useState(function() {
        return rootRegistry || configuredRegistry || createStyleRegistry();
    }), registry = ref[0];
    return /*#__PURE__*/ React__default["default"].createElement(StyleSheetContext.Provider, {
        value: registry
    }, children);
}
function useStyleRegistry() {
    return React.useContext(StyleSheetContext);
}
// Opt-into the new `useInsertionEffect` API in React 18, fallback to `useLayoutEffect`.
// https://github.com/reactwg/react-18/discussions/110
var useInsertionEffect = React__default["default"].useInsertionEffect || React__default["default"].useLayoutEffect;
var defaultRegistry = ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : undefined;
function JSXStyle(props) {
    var registry = defaultRegistry ? defaultRegistry : useStyleRegistry();
    // If `registry` does not exist, we do nothing here.
    if (!registry) {
        return null;
    }
    if ("TURBOPACK compile-time truthy", 1) {
        registry.add(props);
        return null;
    }
    //TURBOPACK unreachable
    ;
}
JSXStyle.dynamic = function(info) {
    return info.map(function(tagInfo) {
        var baseId = tagInfo[0];
        var props = tagInfo[1];
        return computeId(baseId, props);
    }).join(" ");
};
exports.StyleRegistry = StyleRegistry;
exports.createStyleRegistry = createStyleRegistry;
exports.style = JSXStyle;
exports.useStyleRegistry = useStyleRegistry;
}),
"[project]/node_modules/styled-jsx/style.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {

module.exports = __turbopack_context__.r("[project]/node_modules/styled-jsx/dist/index/index.js [app-ssr] (ecmascript)").style;
}),
];

//# sourceMappingURL=_65fa7222._.js.map