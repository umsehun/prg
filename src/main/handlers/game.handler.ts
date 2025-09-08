/**
 * Game-related IPC handlers
 * Type-safe game handlers with comprehensive validation
 */

import { ipcMain, BrowserWindow } from 'electron';
import { z } from 'zod';
import { logger } from '../../shared/globals/logger';

/**
 * Game state interfaces
 */
interface GameChartData {
    readonly id: string;
    readonly title: string;
    readonly artist: string;
    readonly difficulty: string;
    readonly audioPath: string;
    readonly backgroundPath?: string;
    readonly bpm: number;
    readonly duration: number;
}

interface GameState {
    readonly isPlaying: boolean;
    readonly currentChart?: GameChartData;
    readonly startTime?: number;
    readonly score: number;
    readonly combo: number;
    readonly health: number;
    readonly accuracy: number;
}

/**
 * Validation schemas
 */
const GameChartDataSchema = z.object({
    id: z.string().min(1),
    title: z.string().min(1),
    artist: z.string().min(1),
    difficulty: z.string().min(1),
    audioPath: z.string().min(1),
    backgroundPath: z.string().optional().or(z.undefined()),
    bpm: z.number().positive(),
    duration: z.number().positive(),
});

const GameStartParamsSchema = z.object({
    chartData: GameChartDataSchema,
    gameMode: z.enum(['osu', 'taiko', 'fruits', 'mania']),
    mods: z.array(z.string()).optional(),
});

const KnifeThrowDataSchema = z.object({
    timestamp: z.number().nonnegative(),
    angle: z.number().min(0).max(360),
    force: z.number().min(0).max(1),
    position: z.object({
        x: z.number(),
        y: z.number(),
    }),
});

const ScoreDataSchema = z.object({
    chartId: z.string().min(1),
    score: z.number().nonnegative(),
    accuracy: z.number().min(0).max(100),
    maxCombo: z.number().nonnegative(),
    hitCounts: z.object({
        perfect: z.number().nonnegative(),
        great: z.number().nonnegative(),
        good: z.number().nonnegative(),
        miss: z.number().nonnegative(),
    }),
    mods: z.array(z.string()),
    timestamp: z.number().nonnegative(),
});

/**
 * Response interfaces
 */
interface GameResponse {
    readonly success: boolean;
    readonly message?: string;
    readonly error?: string;
}

interface GameStartResponse extends GameResponse {
    readonly gameState?: GameState;
}

interface GameStateResponse extends GameResponse {
    readonly gameState?: GameState;
}

interface ScoreSubmissionResponse extends GameResponse {
    readonly scoreId?: string;
    readonly ranking?: number;
}

/**
 * Game state manager
 */
class GameStateManager {
    private state: GameState = {
        isPlaying: false,
        score: 0,
        combo: 0,
        health: 100,
        accuracy: 100,
    };

    public getState(): GameState {
        return { ...this.state };
    }

    public startGame(chartData: GameChartData): void {
        this.state = {
            isPlaying: true,
            currentChart: chartData,
            startTime: Date.now(),
            score: 0,
            combo: 0,
            health: 100,
            accuracy: 100,
        };
    }

    public stopGame(): void {
        this.state = {
            isPlaying: false,
            score: this.state.score,
            combo: this.state.combo,
            health: this.state.health,
            accuracy: this.state.accuracy,
        };
    }

    public updateScore(score: number, combo: number, health: number, accuracy: number): void {
        this.state = {
            ...this.state,
            score,
            combo,
            health,
            accuracy,
        };
    }

    public isGameActive(): boolean {
        return this.state.isPlaying;
    }
}

const gameStateManager = new GameStateManager();

/**
 * Helper function to validate parameters
 */
function validateParams<T>(
    schema: z.ZodSchema<T>,
    params: unknown,
    operation: string
): { success: true; data: T } | { success: false; error: string } {
    try {
        const validated = schema.parse(params);
        return { success: true, data: validated };
    } catch (error) {
        const message = error instanceof z.ZodError
            ? `Invalid parameters for ${operation}: ${error.issues.map(e => e.message).join(', ')}`
            : `Parameter validation failed for ${operation}`;

        logger.error('game', 'Parameter validation failed', { operation, error });
        return { success: false, error: message };
    }
}

export function setupGameHandlers(mainWindow: BrowserWindow): void {
    logger.info('game', 'Setting up game handlers');

    /**
     * Start game session
     */
    ipcMain.handle('game:start', async (_event, ...args): Promise<GameStartResponse> => {
        const operationId = `game-start-${Date.now()}`;
        logger.info('game', 'Game start requested', { operationId, args });

        try {
            // Validate parameters
            const validation = validateParams(GameStartParamsSchema, args[0], 'game:start');
            if (!validation.success) {
                return {
                    success: false,
                    error: validation.error,
                };
            }

            const { chartData, gameMode, mods } = validation.data;

            // Check if game is already running
            if (gameStateManager.isGameActive()) {
                logger.warn('game', 'Attempted to start game while already running', { operationId });
                return {
                    success: false,
                    error: 'Game is already running',
                };
            }

            logger.info('game', 'Starting game session', {
                operationId,
                chartTitle: chartData.title,
                gameMode,
                mods: mods || [],
            });

            // Start game state
            gameStateManager.startGame(chartData as GameChartData);

            // Get current state
            const gameState = gameStateManager.getState();

            logger.info('game', 'Game started successfully', { operationId });

            return {
                success: true,
                message: 'Game started successfully',
                gameState,
            };

        } catch (error) {
            logger.error('game', 'Game start failed with exception', {
                operationId,
                error: error instanceof Error ? error.message : String(error)
            });

            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error during game start',
            };
        }
    });

    /**
     * Stop game session
     */
    ipcMain.handle('game:stop', async (_event): Promise<GameResponse> => {
        const operationId = `game-stop-${Date.now()}`;
        logger.info('game', 'Game stop requested', { operationId });

        try {
            // Check if game is running
            if (!gameStateManager.isGameActive()) {
                logger.warn('game', 'Attempted to stop game when not running', { operationId });
                return {
                    success: false,
                    error: 'No game is currently running',
                };
            }

            logger.info('game', 'Stopping game session', { operationId });

            // Stop game state
            gameStateManager.stopGame();

            logger.info('game', 'Game stopped successfully', { operationId });

            return {
                success: true,
                message: 'Game stopped successfully',
            };

        } catch (error) {
            logger.error('game', 'Game stop failed with exception', {
                operationId,
                error: error instanceof Error ? error.message : String(error)
            });

            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error during game stop',
            };
        }
    });

    /**
     * Get current game state
     */
    ipcMain.handle('game:get-state', async (_event): Promise<GameStateResponse> => {
        try {
            const gameState = gameStateManager.getState();
            return {
                success: true,
                gameState,
            };
        } catch (error) {
            logger.error('game', 'Failed to get game state', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to retrieve game state',
            };
        }
    });

    /**
     * Handle knife throw input
     */
    ipcMain.on('game:knife-throw', (_event, ...args) => {
        try {
            // Validate knife throw data
            const validation = validateParams(KnifeThrowDataSchema, args[0], 'game:knife-throw');
            if (!validation.success) {
                logger.error('game', 'Invalid knife throw data', { error: validation.error });
                return;
            }

            const throwData = validation.data;

            // Check if game is active
            if (!gameStateManager.isGameActive()) {
                logger.warn('game', 'Knife throw received but no game is running');
                return;
            }

            logger.debug('game', 'Knife throw received', throwData);

            // Send to renderer for physics processing
            mainWindow.webContents.send('game:knife-throw-processed', {
                timestamp: throwData.timestamp,
                angle: throwData.angle,
                force: throwData.force,
                position: throwData.position,
            });

        } catch (error) {
            logger.error('game', 'Knife throw processing failed', error);
        }
    });

    /**
     * Update game score
     */
    ipcMain.on('game:score-update', (_event, score: number, combo: number, health: number, accuracy: number) => {
        try {
            if (!gameStateManager.isGameActive()) {
                return;
            }

            // Validate score data
            if (typeof score !== 'number' || score < 0 ||
                typeof combo !== 'number' || combo < 0 ||
                typeof health !== 'number' || health < 0 || health > 100 ||
                typeof accuracy !== 'number' || accuracy < 0 || accuracy > 100) {
                logger.error('game', 'Invalid score update data', { score, combo, health, accuracy });
                return;
            }

            gameStateManager.updateScore(score, combo, health, accuracy);

            // Broadcast updated state
            mainWindow.webContents.send('game:state-updated', gameStateManager.getState());

        } catch (error) {
            logger.error('game', 'Score update failed', error);
        }
    });

    /**
     * Submit game score
     */
    ipcMain.handle('game:submit-score', async (_event, ...args): Promise<ScoreSubmissionResponse> => {
        const operationId = `score-submit-${Date.now()}`;
        logger.info('game', 'Score submission requested', { operationId, args });

        try {
            // Validate score data
            const validation = validateParams(ScoreDataSchema, args[0], 'game:submit-score');
            if (!validation.success) {
                return {
                    success: false,
                    error: validation.error,
                };
            }

            const scoreData = validation.data;

            logger.info('game', 'Submitting score', {
                operationId,
                chartId: scoreData.chartId,
                score: scoreData.score,
                accuracy: scoreData.accuracy,
            });

            // TODO: Store score in database
            // For now, just generate a mock score ID
            const scoreId = `score-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

            logger.info('game', 'Score submitted successfully', { operationId, scoreId });

            return {
                success: true,
                message: 'Score submitted successfully',
                scoreId,
                ranking: Math.floor(Math.random() * 1000) + 1, // Mock ranking
            };

        } catch (error) {
            logger.error('game', 'Score submission failed with exception', {
                operationId,
                error: error instanceof Error ? error.message : String(error)
            });

            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error during score submission',
            };
        }
    });

    logger.info('game', 'Game handlers setup completed');
}
