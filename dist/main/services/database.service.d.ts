/**
 * Database Service - Prisma-based database operations
 * ✅ CRITICAL FIX: Implements actual database storage replacing TODO comments
 */
import { PrismaClient } from '@prisma/client';
export declare const prisma: PrismaClient<import(".prisma/client").Prisma.PrismaClientOptions, never, import("@prisma/client/runtime/library").DefaultArgs>;
/**
 * Database Service Class
 */
export declare class DatabaseService {
    static get prisma(): PrismaClient<import(".prisma/client").Prisma.PrismaClientOptions, never, import("@prisma/client/runtime/library").DefaultArgs>;
    /**
     * Create or update a chart in the database
     */
    static saveChart(chartData: {
        id: string;
        title: string;
        artist: string;
        difficulty: string;
        bpm: number;
        duration: number;
        audioPath: string;
        backgroundPath?: string;
        chartData: string;
        hash: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        hash: string;
        title: string;
        artist: string;
        difficulty: string;
        bpm: number;
        duration: number;
        audioPath: string;
        backgroundPath: string | null;
        chartData: string;
    }>;
    /**
     * Submit a score to the database
     */
    static submitScore(scoreData: {
        userId: string;
        chartId: string;
        score: number;
        accuracy: number;
        maxCombo: number;
        perfectHits: number;
        greatHits: number;
        goodHits: number;
        missHits: number;
        mods?: string[];
    }): Promise<{
        user: {
            id: string;
            username: string;
            displayName: string | null;
            email: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
        chart: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            hash: string;
            title: string;
            artist: string;
            difficulty: string;
            bpm: number;
            duration: number;
            audioPath: string;
            backgroundPath: string | null;
            chartData: string;
        };
    } & {
        id: string;
        score: number;
        accuracy: number;
        maxCombo: number;
        perfectHits: number;
        greatHits: number;
        goodHits: number;
        missHits: number;
        mods: string;
        playedAt: Date;
        userId: string;
        chartId: string;
    }>;
    /**
     * Get or create a user
     */
    static getOrCreateUser(userData: {
        username: string;
        displayName?: string;
        email?: string;
    }): Promise<{
        id: string;
        username: string;
        displayName: string | null;
        email: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    /**
     * Get user statistics
     */
    static getUserStats(userId: string): Promise<{
        totalPlays: number;
        averageAccuracy: number;
        averageScore: number;
        bestScore: number;
        bestCombo: number;
        totalHits: {
            perfect: number;
            great: number;
            good: number;
            miss: number;
        };
        recentScores: ({
            chart: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                hash: string;
                title: string;
                artist: string;
                difficulty: string;
                bpm: number;
                duration: number;
                audioPath: string;
                backgroundPath: string | null;
                chartData: string;
            };
        } & {
            id: string;
            score: number;
            accuracy: number;
            maxCombo: number;
            perfectHits: number;
            greatHits: number;
            goodHits: number;
            missHits: number;
            mods: string;
            playedAt: Date;
            userId: string;
            chartId: string;
        })[];
    }>;
    /**
     * Get all charts from database
     */
    static getAllCharts(): Promise<({
        _count: {
            scores: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        hash: string;
        title: string;
        artist: string;
        difficulty: string;
        bpm: number;
        duration: number;
        audioPath: string;
        backgroundPath: string | null;
        chartData: string;
    })[]>;
    /**
     * Get chart by ID
     */
    static getChartById(chartId: string): Promise<({
        scores: ({
            user: {
                id: string;
                username: string;
                displayName: string | null;
                email: string | null;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: string;
            score: number;
            accuracy: number;
            maxCombo: number;
            perfectHits: number;
            greatHits: number;
            goodHits: number;
            missHits: number;
            mods: string;
            playedAt: Date;
            userId: string;
            chartId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        hash: string;
        title: string;
        artist: string;
        difficulty: string;
        bpm: number;
        duration: number;
        audioPath: string;
        backgroundPath: string | null;
        chartData: string;
    }) | null>;
    /**
     * Get application settings
     */
    static getSettings(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        data: string;
    }>;
    /**
     * Update application settings
     */
    static updateSettings(settingsData: Record<string, any>): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        data: string;
    }>;
    /**
     * Initialize database connection
     */
    static connect(): Promise<void>;
    /**
     * Disconnect from database
     */
    static disconnect(): Promise<void>;
}
//# sourceMappingURL=database.service.d.ts.map