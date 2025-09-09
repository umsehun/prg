"use strict";
/**
 * Database Service - Prisma-based database operations
 * ✅ CRITICAL FIX: Implements actual database storage replacing TODO comments
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseService = exports.prisma = void 0;
const client_1 = require("@prisma/client");
const logger_1 = require("../../shared/globals/logger");
// Global Prisma instance to prevent multiple connections
const globalForPrisma = globalThis;
exports.prisma = globalForPrisma.prisma || new client_1.PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});
if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = exports.prisma;
}
/**
 * Database Service Class
 */
class DatabaseService {
    // Expose prisma instance for direct queries when needed
    static get prisma() {
        return exports.prisma;
    }
    /**
     * Create or update a chart in the database
     */
    static async saveChart(chartData) {
        try {
            logger_1.logger.info('db', 'Saving chart to database:', { chartId: chartData.id });
            const chart = await exports.prisma.chart.upsert({
                where: { id: chartData.id },
                update: {
                    title: chartData.title,
                    artist: chartData.artist,
                    difficulty: chartData.difficulty,
                    bpm: chartData.bpm,
                    duration: chartData.duration,
                    audioPath: chartData.audioPath,
                    backgroundPath: chartData.backgroundPath,
                    chartData: chartData.chartData,
                    hash: chartData.hash,
                    updatedAt: new Date(),
                },
                create: {
                    id: chartData.id,
                    title: chartData.title,
                    artist: chartData.artist,
                    difficulty: chartData.difficulty,
                    bpm: chartData.bpm,
                    duration: chartData.duration,
                    audioPath: chartData.audioPath,
                    backgroundPath: chartData.backgroundPath,
                    chartData: chartData.chartData,
                    hash: chartData.hash,
                },
            });
            logger_1.logger.info('db', 'Chart saved successfully:', { chartId: chart.id });
            return chart;
        }
        catch (error) {
            logger_1.logger.error('db', 'Failed to save chart:', error);
            throw error;
        }
    }
    /**
     * Submit a score to the database
     */
    static async submitScore(scoreData) {
        try {
            logger_1.logger.info('db', 'Submitting score to database:', {
                userId: scoreData.userId,
                chartId: scoreData.chartId,
                score: scoreData.score
            });
            const score = await exports.prisma.score.create({
                data: {
                    userId: scoreData.userId,
                    chartId: scoreData.chartId,
                    score: scoreData.score,
                    accuracy: scoreData.accuracy,
                    maxCombo: scoreData.maxCombo,
                    perfectHits: scoreData.perfectHits,
                    greatHits: scoreData.greatHits,
                    goodHits: scoreData.goodHits,
                    missHits: scoreData.missHits,
                    mods: JSON.stringify(scoreData.mods || []),
                    playedAt: new Date(),
                },
                include: {
                    chart: true,
                    user: true,
                },
            });
            logger_1.logger.info('db', 'Score submitted successfully:', { scoreId: score.id });
            return score;
        }
        catch (error) {
            logger_1.logger.error('db', 'Failed to submit score:', error);
            throw error;
        }
    }
    /**
     * Get or create a user
     */
    static async getOrCreateUser(userData) {
        try {
            const user = await exports.prisma.user.upsert({
                where: { username: userData.username },
                update: {
                    displayName: userData.displayName,
                    email: userData.email,
                },
                create: {
                    username: userData.username,
                    displayName: userData.displayName || userData.username,
                    email: userData.email,
                },
            });
            return user;
        }
        catch (error) {
            logger_1.logger.error('db', 'Failed to get or create user:', error);
            throw error;
        }
    }
    /**
     * Get user statistics
     */
    static async getUserStats(userId) {
        try {
            const stats = await exports.prisma.score.aggregate({
                where: { userId },
                _count: { id: true },
                _avg: { accuracy: true, score: true },
                _max: { score: true, maxCombo: true },
                _sum: { perfectHits: true, greatHits: true, goodHits: true, missHits: true },
            });
            const recentScores = await exports.prisma.score.findMany({
                where: { userId },
                orderBy: { playedAt: 'desc' },
                take: 10,
                include: { chart: true },
            });
            return {
                totalPlays: stats._count.id,
                averageAccuracy: stats._avg.accuracy || 0,
                averageScore: stats._avg.score || 0,
                bestScore: stats._max.score || 0,
                bestCombo: stats._max.maxCombo || 0,
                totalHits: {
                    perfect: stats._sum.perfectHits || 0,
                    great: stats._sum.greatHits || 0,
                    good: stats._sum.goodHits || 0,
                    miss: stats._sum.missHits || 0,
                },
                recentScores,
            };
        }
        catch (error) {
            logger_1.logger.error('db', 'Failed to get user stats:', error);
            throw error;
        }
    }
    /**
     * Get all charts from database
     */
    static async getAllCharts() {
        try {
            const charts = await exports.prisma.chart.findMany({
                orderBy: [
                    { createdAt: 'desc' },
                    { title: 'asc' },
                ],
                include: {
                    _count: {
                        select: { scores: true },
                    },
                },
            });
            return charts;
        }
        catch (error) {
            logger_1.logger.error('db', 'Failed to get charts:', error);
            throw error;
        }
    }
    /**
     * Get chart by ID
     */
    static async getChartById(chartId) {
        try {
            const chart = await exports.prisma.chart.findUnique({
                where: { id: chartId },
                include: {
                    scores: {
                        orderBy: { score: 'desc' },
                        take: 10,
                        include: { user: true },
                    },
                },
            });
            return chart;
        }
        catch (error) {
            logger_1.logger.error('db', 'Failed to get chart:', error);
            throw error;
        }
    }
    /**
     * Get application settings
     */
    static async getSettings() {
        try {
            const settings = await exports.prisma.settings.findUnique({
                where: { id: 'default' },
            });
            if (!settings) {
                // Create default settings
                const defaultSettings = {
                    id: 'default',
                    data: JSON.stringify({
                        audio: { masterVolume: 1.0, musicVolume: 0.8, effectVolume: 0.6 },
                        game: { scrollSpeed: 1.0, noteSize: 1.0, backgroundDim: 0.3, showFPS: false },
                        display: { fullscreen: false, vsync: true, targetFPS: 60 },
                    }),
                };
                return await exports.prisma.settings.create({ data: defaultSettings });
            }
            return settings;
        }
        catch (error) {
            logger_1.logger.error('db', 'Failed to get settings:', error);
            throw error;
        }
    }
    /**
     * Update application settings
     */
    static async updateSettings(settingsData) {
        try {
            const settings = await exports.prisma.settings.upsert({
                where: { id: 'default' },
                update: {
                    data: JSON.stringify(settingsData),
                    updatedAt: new Date(),
                },
                create: {
                    id: 'default',
                    data: JSON.stringify(settingsData),
                },
            });
            return settings;
        }
        catch (error) {
            logger_1.logger.error('db', 'Failed to update settings:', error);
            throw error;
        }
    }
    /**
     * Initialize database connection
     */
    static async connect() {
        try {
            await exports.prisma.$connect();
            logger_1.logger.info('db', 'Connected to database successfully');
        }
        catch (error) {
            logger_1.logger.error('db', 'Failed to connect to database:', error);
            throw error;
        }
    }
    /**
     * Disconnect from database
     */
    static async disconnect() {
        try {
            await exports.prisma.$disconnect();
            logger_1.logger.info('db', 'Disconnected from database');
        }
        catch (error) {
            logger_1.logger.error('db', 'Error disconnecting from database:', error);
        }
    }
}
exports.DatabaseService = DatabaseService;
