"use strict";
/**
 * OSZ file processing IPC handlers
 * Type-safe handlers with Zod validation and comprehensive error handling
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupOszHandlers = setupOszHandlers;
const electron_1 = require("electron");
const zod_1 = require("zod");
const osz_parser_1 = require("../services/osz-parser");
const ChartImportService_1 = require("../services/ChartImportService");
const logger_1 = require("../../shared/globals/logger");
const error_handling_1 = require("../../shared/utils/error-handling");
const chartLibrary = new ChartLibrary();
const chartImportService = new ChartImportService_1.ChartImportService();
/**
 * Validation schemas for IPC parameters
 */
const OSZImportParamsSchema = zod_1.z.object({
    filePath: zod_1.z.string().optional(),
}).optional();
const OSZRemoveParamsSchema = zod_1.z.object({
    chartId: zod_1.z.string().min(1),
});
const OSZAudioParamsSchema = zod_1.z.object({
    chartId: zod_1.z.string().min(1),
});
/**
 * Helper function to validate IPC parameters
 */
function validateParams(schema, params, operation) {
    try {
        const validated = schema.parse(params);
        return error_handling_1.ResultHandler.success(validated);
    }
    catch (error) {
        const message = error instanceof zod_1.z.ZodError
            ? `Invalid parameters for ${operation}: ${error.issues.map(e => e.message).join(', ')}`
            : `Parameter validation failed for ${operation}`;
        logger_1.logger.ipc('error', 'Parameter validation failed', { operation, error });
        return error_handling_1.ResultHandler.error(message);
    }
}
/**
 * Convert OSZ content to chart metadata
 */
function convertToChartMetadata(content) {
    return {
        id: content.metadata.id,
        title: content.metadata.title,
        artist: content.metadata.artist,
        creator: content.metadata.creator,
        difficulties: content.metadata.difficulties.map((d) => d.version),
        ...(content.metadata.backgroundImage && { backgroundImage: content.metadata.backgroundImage }),
        ...(content.metadata.previewTime && { previewTime: content.metadata.previewTime }),
        duration: content.metadata.duration,
        bpm: content.metadata.bpm,
    };
}
function setupOszHandlers(mainWindow) {
    logger_1.logger.ipc('info', 'Setting up OSZ handlers');
    /**
     * Parse OSZ file handler (Simple version)
     */
    electron_1.ipcMain.handle('osz:parse', async (_event, filePath) => {
        const operationId = `osz-parse-${Date.now()}`;
        logger_1.logger.ipc('info', 'OSZ parse requested (simple)', { operationId, filePath });
        try {
            if (!filePath) {
                return { success: false, error: 'File path is required' };
            }
            // Use ChartImportService for consistent parsing
            const chartService = new ChartImportService_1.ChartImportService();
            const charts = await chartService.autoScanOszFiles();
            if (charts.length === 0) {
                return { success: false, error: 'No charts found' };
            }
            const chart = charts[0]; // Return first chart for now
            logger_1.logger.ipc('info', 'OSZ parsed successfully (simple)', {
                operationId,
                title: chart?.title || 'Unknown',
                artist: chart?.artist || 'Unknown'
            });
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
            logger_1.logger.ipc('error', 'OSZ parse failed (simple)', {
                operationId,
                error: error instanceof Error ? error.message : String(error)
            });
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown parsing error'
            };
        }
    });
    /**
     * Get audio path handler
     */
    electron_1.ipcMain.handle('osz:get-audio-path', async (_event, songId) => {
        const operationId = `osz-audio-path-${Date.now()}`;
        logger_1.logger.ipc('info', 'Audio path requested', { operationId, songId });
        try {
            // This is a simplified implementation
            // In a real app, you'd look up the chart and return the actual audio path
            return `/path/to/audio/${songId}.mp3`;
        }
        catch (error) {
            logger_1.logger.ipc('error', 'Failed to get audio path', { operationId, error });
            return '';
        }
    });
    /**
     * Import OSZ file handler
     */
    electron_1.ipcMain.handle('osz:import', async (_event, ...args) => {
        const operationId = `osz-import-${Date.now()}`;
        logger_1.logger.ipc('info', 'OSZ import requested', { operationId, args });
        try {
            // Validate parameters
            const paramsValidation = validateParams(OSZImportParamsSchema, args[0], 'osz:import');
            if (!paramsValidation.success) {
                return {
                    success: false,
                    chart: undefined,
                    error: paramsValidation.error || 'Parameter validation failed',
                };
            }
            const params = paramsValidation.data;
            let targetPath = params?.filePath;
            // Show file dialog if no path provided
            if (!targetPath) {
                logger_1.logger.ipc('debug', 'Showing file dialog for OSZ import', { operationId });
                const result = await electron_1.dialog.showOpenDialog(mainWindow, {
                    title: 'Select OSZ file',
                    filters: [
                        { name: 'OSZ Files', extensions: ['osz'] },
                        { name: 'All Files', extensions: ['*'] }
                    ],
                    properties: ['openFile']
                });
                if (result.canceled || result.filePaths.length === 0) {
                    logger_1.logger.ipc('info', 'OSZ import cancelled by user', { operationId });
                    return { success: false, chart: undefined, error: 'No file selected' };
                }
                targetPath = result.filePaths[0];
            }
            if (!targetPath) {
                return { success: false, chart: undefined, error: 'No file path provided' };
            }
            logger_1.logger.ipc('info', 'Processing OSZ file', { operationId, filePath: targetPath });
            // Parse OSZ file
            const parseResult = await osz_parser_1.SimplifiedOSZParser.parseOszFile(targetPath);
            if (!parseResult.success) {
                logger_1.logger.ipc('error', 'OSZ parsing failed', {
                    operationId,
                    filePath: targetPath,
                    error: parseResult.error
                });
                return {
                    success: false,
                    chart: undefined,
                    error: parseResult.error || 'Failed to parse OSZ file',
                };
            }
            const content = parseResult.data;
            if (!content) {
                return {
                    success: false,
                    chart: undefined,
                    error: 'No content received from parser',
                };
            }
            // Add to library
            chartLibrary.addChart(content);
            // Convert to response format
            const chartMetadata = convertToChartMetadata(content);
            logger_1.logger.ipc('info', 'OSZ import completed successfully', {
                operationId,
                chartId: content.metadata.id,
                title: content.metadata.title,
                artist: content.metadata.artist,
                difficulties: content.metadata.difficulties.length,
            });
            return {
                success: true,
                chart: chartMetadata,
            };
        }
        catch (error) {
            logger_1.logger.ipc('error', 'OSZ import failed with exception', {
                operationId,
                error: error instanceof Error ? error.message : String(error)
            });
            return {
                success: false,
                chart: undefined,
                error: error instanceof Error ? error.message : 'Unknown error during OSZ import',
            };
        }
    });
    /**
     * Get chart library handler - Auto-scan and parse OSZ files
     */
    electron_1.ipcMain.handle('osz:get-library', async (_event) => {
        const operationId = `osz-library-${Date.now()}`;
        logger_1.logger.ipc('info', 'Chart library requested', { operationId });
        try {
            // Auto-scan and parse OSZ files from public/assets or load from library.json
            logger_1.logger.ipc('info', 'Auto-scanning OSZ files...', { operationId });
            const charts = await chartImportService.autoScanAndParseOszFiles();
            // Convert to expected format using real difficulty data 
            const chartMetadata = charts.map((chart) => {
                // Extract real difficulty names from chart.difficulty object
                const realDifficulties = [];
                if (chart.difficulty) {
                    if (chart.difficulty.easy && chart.difficulty.easy > 0) {
                        realDifficulties.push(`Easy (${chart.difficulty.easy}⭐)`);
                    }
                    if (chart.difficulty.normal && chart.difficulty.normal > 0) {
                        realDifficulties.push(`Normal (${chart.difficulty.normal}⭐)`);
                    }
                    if (chart.difficulty.hard && chart.difficulty.hard > 0) {
                        realDifficulties.push(`Hard (${chart.difficulty.hard}⭐)`);
                    }
                    if (chart.difficulty.expert && chart.difficulty.expert > 0) {
                        realDifficulties.push(`Expert (${chart.difficulty.expert}⭐)`);
                    }
                }
                // Fallback to generic names if no real difficulties found
                const difficulties = realDifficulties.length > 0 ? realDifficulties : ['Easy', 'Normal', 'Hard'];
                const metadata = {
                    id: chart.id,
                    title: chart.title,
                    artist: chart.artist,
                    creator: chart.artist,
                    difficulties: difficulties,
                    duration: chart.duration,
                    bpm: chart.bpm
                };
                if (chart.backgroundImage) {
                    metadata.backgroundImage = chart.backgroundImage;
                }
                return metadata;
            });
            logger_1.logger.ipc('info', 'Chart library retrieved', {
                operationId,
                chartCount: chartMetadata.length
            });
            return {
                success: true,
                charts: chartMetadata,
            };
        }
        catch (error) {
            logger_1.logger.ipc('error', 'Failed to retrieve chart library', {
                operationId,
                error: error instanceof Error ? error.message : String(error)
            });
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to retrieve chart library',
            };
        }
    });
    /**
     * Remove chart handler
     */
    electron_1.ipcMain.handle('osz:remove-chart', async (_event, ...args) => {
        const operationId = `osz-remove-${Date.now()}`;
        logger_1.logger.ipc('info', 'Chart removal requested', { operationId, args });
        try {
            // Validate parameters
            const paramsValidation = validateParams(OSZRemoveParamsSchema, args[0], 'osz:remove-chart');
            if (!paramsValidation.success) {
                return {
                    success: false,
                    error: paramsValidation.error || 'Parameter validation failed',
                };
            }
            const params = paramsValidation.data;
            if (!params) {
                return {
                    success: false,
                    error: 'No parameters provided',
                };
            }
            const { chartId } = params;
            // Check if chart exists
            const chart = chartLibrary.getChart(chartId);
            if (!chart) {
                logger_1.logger.ipc('warn', 'Attempted to remove non-existent chart', { operationId, chartId });
                return {
                    success: false,
                    error: 'Chart not found',
                };
            }
            // Remove from library
            const removed = chartLibrary.removeChart(chartId);
            if (removed) {
                logger_1.logger.ipc('info', 'Chart removed successfully', {
                    operationId,
                    chartId,
                    title: chart.metadata.title
                });
                return {
                    success: true,
                    message: 'Chart removed successfully',
                };
            }
            else {
                logger_1.logger.ipc('error', 'Failed to remove chart from library', { operationId, chartId });
                return {
                    success: false,
                    error: 'Failed to remove chart from library',
                };
            }
        }
        catch (error) {
            logger_1.logger.ipc('error', 'Chart removal failed with exception', {
                operationId,
                error: error instanceof Error ? error.message : String(error)
            });
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error during chart removal',
            };
        }
    });
    /**
     * Get chart audio handler
     */
    electron_1.ipcMain.handle('osz:get-audio', async (_event, ...args) => {
        const operationId = `osz-audio-${Date.now()}`;
        logger_1.logger.ipc('info', 'Chart audio requested', { operationId, args });
        try {
            // Validate parameters
            const paramsValidation = validateParams(OSZAudioParamsSchema, args[0], 'osz:get-audio');
            if (!paramsValidation.success) {
                return {
                    success: false,
                    error: paramsValidation.error || 'Parameter validation failed',
                };
            }
            const params = paramsValidation.data;
            if (!params) {
                return {
                    success: false,
                    error: 'No parameters provided',
                };
            }
            const { chartId } = params;
            // Get chart from library
            const chart = chartLibrary.getChart(chartId);
            if (!chart) {
                logger_1.logger.ipc('warn', 'Attempted to get audio for non-existent chart', { operationId, chartId });
                return {
                    success: false,
                    error: 'Chart not found',
                };
            }
            // Return audio data as ArrayBuffer
            const audioBuffer = Buffer.from(chart.audioFile.data);
            const audioData = audioBuffer.buffer.slice(audioBuffer.byteOffset, audioBuffer.byteOffset + audioBuffer.byteLength);
            logger_1.logger.ipc('info', 'Chart audio retrieved successfully', {
                operationId,
                chartId,
                audioSize: audioData.byteLength,
                filename: chart.audioFile.filename
            });
            return {
                success: true,
                audioData,
            };
        }
        catch (error) {
            logger_1.logger.ipc('error', 'Audio retrieval failed with exception', {
                operationId,
                error: error instanceof Error ? error.message : String(error)
            });
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error during audio retrieval',
            };
        }
    });
    logger_1.logger.ipc('info', 'OSZ handlers setup completed');
}
