/**
 * Database Service - Prisma-based database operations
 * ✅ CRITICAL FIX: Implements actual database storage replacing TODO comments
 */
export declare const prisma: any;
/**
 * Database Service Class
 */
export declare class DatabaseService {
    static get prisma(): any;
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
    }): Promise<any>;
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
    }): Promise<any>;
    /**
     * Get or create a user
     */
    static getOrCreateUser(userData: {
        username: string;
        displayName?: string;
        email?: string;
    }): Promise<any>;
    /**
     * Get user statistics
     */
    static getUserStats(userId: string): Promise<{
        totalPlays: any;
        averageAccuracy: any;
        averageScore: any;
        bestScore: any;
        bestCombo: any;
        totalHits: {
            perfect: any;
            great: any;
            good: any;
            miss: any;
        };
        recentScores: any;
    }>;
    /**
     * Get all charts from database
     */
    static getAllCharts(): Promise<any>;
    /**
     * Get chart by ID
     */
    static getChartById(chartId: string): Promise<any>;
    /**
     * Get application settings
     */
    static getSettings(): Promise<any>;
    /**
     * Update application settings
     */
    static updateSettings(settingsData: Record<string, any>): Promise<any>;
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