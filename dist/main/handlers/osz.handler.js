"use strict";
/**
 * Simplified OSZ Handler - Only essential functionality
 * Uses ChartImportService for all OSZ operations
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.setup = setup;
const electron_1 = require("electron");
const ChartImportService_1 = require("../services/ChartImportService");
const logger_1 = require("../../shared/globals/logger");
/**
 * Setup simplified OSZ handlers
 */
function setup() {
    logger_1.logger.info('osz', 'Setting up simplified OSZ handlers');
    /**
     * Get OSZ library (auto-scan and return charts)
     */
    electron_1.ipcMain.handle('osz:get-library', async () => {
        const operationId = `osz-library-${Date.now()}`;
        logger_1.logger.info('osz', 'OSZ library requested', { operationId });
        try {
            const chartService = new ChartImportService_1.ChartImportService();
            const charts = await chartService.autoScanOszFiles();
            logger_1.logger.info('osz', 'OSZ library retrieved', {
                operationId,
                chartCount: charts.length
            });
            return {
                success: true,
                charts: charts.map(chart => ({
                    id: chart.id,
                    title: chart.title,
                    artist: chart.artist,
                    backgroundImage: chart.backgroundImage,
                    duration: chart.duration,
                    bpm: chart.bpm,
                    difficulty: chart.difficulty
                }))
            };
        }
        catch (error) {
            logger_1.logger.error('osz', 'Failed to get OSZ library', {
                operationId,
                error: error instanceof Error ? error.message : String(error)
            });
            return {
                success: false,
                error: 'Failed to load chart library'
            };
        }
    });
    /**
     * Parse single OSZ file (simplified)
     */
    electron_1.ipcMain.handle('osz:parse', async (_event, filePath) => {
        const operationId = `osz-parse-${Date.now()}`;
        logger_1.logger.info('osz', 'OSZ parse requested', { operationId, filePath });
        try {
            if (!filePath) {
                return { success: false, error: 'File path is required' };
            }
            const chartService = new ChartImportService_1.ChartImportService();
            const charts = await chartService.autoScanOszFiles();
            if (charts.length === 0) {
                return { success: false, error: 'No charts found' };
            }
            const chart = charts[0];
            return {
                success: true,
                chart: {
                    id: chart?.id || 'unknown',
                    title: chart?.title || 'Unknown',
                    artist: chart?.artist || 'Unknown',
                    creator: 'Unknown',
                    difficulties: ['Normal'],
                    backgroundImage: chart?.backgroundImage || '',
                    duration: chart?.duration || 0,
                    bpm: chart?.bpm || 120
                }
            };
        }
        catch (error) {
            logger_1.logger.error('osz', 'OSZ parse failed', {
                operationId,
                error: error instanceof Error ? error.message : String(error)
            });
            return {
                success: false,
                error: 'Failed to parse OSZ file'
            };
        }
    });
    logger_1.logger.info('osz', 'OSZ handlers setup completed');
}
