/**
 * OSZ file processing IPC handlers
 * Type-safe handlers with Zod validation and comprehensive error handling
 */

import { ipcMain, dialog, BrowserWindow } from 'electron';
import { z } from 'zod';
import { SimplifiedOSZParser, type OSZContent } from '../services/osz-parser';
import { ChartImportService } from '../services/ChartImportService';
import { logger } from '../../shared/globals/logger';
import { ResultHandler } from '../../shared/utils/error-handling';
import type { Result } from '../../shared/globals/types.d';

/**
 * Typed OSZ handler responses
 */
interface OSZImportResponse {
    readonly success: boolean;
    readonly chart: {
        readonly id: string;
        readonly title: string;
        readonly artist: string;
        readonly creator: string;
        readonly difficulties: readonly string[];
        readonly backgroundImage?: string;
        readonly previewTime?: number;
        readonly duration: number;
        readonly bpm: number;
    } | undefined;
    readonly error?: string;
}

interface OSZLibraryResponse {
    readonly success: boolean;
    readonly charts?: readonly OSZImportResponse['chart'][];
    readonly error?: string;
}

interface OSZRemoveResponse {
    readonly success: boolean;
    readonly message?: string;
    readonly error?: string;
}

interface OSZAudioResponse {
    readonly success: boolean;
    readonly audioData?: ArrayBuffer;
    readonly error?: string;
}

/**
 * Chart library storage interface
 */
class ChartLibrary {
    private charts = new Map<string, OSZContent>();

    public addChart(content: OSZContent): void {
        this.charts.set(content.metadata.id, content);
    }

    public getChart(id: string): OSZContent | undefined {
        return this.charts.get(id);
    }

    public removeChart(id: string): boolean {
        return this.charts.delete(id);
    }

    public getAllCharts(): OSZContent[] {
        return Array.from(this.charts.values());
    }

    public getChartMetadata(): OSZImportResponse['chart'][] {
        return Array.from(this.charts.values()).map(content => ({
            id: content.metadata.id,
            title: content.metadata.title,
            artist: content.metadata.artist,
            creator: content.metadata.creator,
            difficulties: content.metadata.difficulties.map((d: { version: string }) => d.version),
            ...(content.metadata.backgroundImage && { backgroundImage: content.metadata.backgroundImage }),
            ...(content.metadata.previewTime && { previewTime: content.metadata.previewTime }),
            duration: content.metadata.duration,
            bpm: content.metadata.bpm,
        }));
    }
}

const chartLibrary = new ChartLibrary();
const chartImportService = new ChartImportService();

/**
 * Validation schemas for IPC parameters
 */
const OSZImportParamsSchema = z.object({
    filePath: z.string().optional(),
}).optional();

const OSZRemoveParamsSchema = z.object({
    chartId: z.string().min(1),
});

const OSZAudioParamsSchema = z.object({
    chartId: z.string().min(1),
});

/**
 * Helper function to validate IPC parameters
 */
function validateParams<T>(
    schema: z.ZodSchema<T>,
    params: unknown,
    operation: string
): Result<T> {
    try {
        const validated = schema.parse(params);
        return ResultHandler.success(validated);
    } catch (error) {
        const message = error instanceof z.ZodError
            ? `Invalid parameters for ${operation}: ${error.issues.map(e => e.message).join(', ')}`
            : `Parameter validation failed for ${operation}`;

        logger.ipc('error', 'Parameter validation failed', { operation, error });
        return ResultHandler.error(message);
    }
}

/**
 * Convert OSZ content to chart metadata
 */
function convertToChartMetadata(content: OSZContent): OSZImportResponse['chart'] {
    return {
        id: content.metadata.id,
        title: content.metadata.title,
        artist: content.metadata.artist,
        creator: content.metadata.creator,
        difficulties: content.metadata.difficulties.map((d: { version: string }) => d.version),
        ...(content.metadata.backgroundImage && { backgroundImage: content.metadata.backgroundImage }),
        ...(content.metadata.previewTime && { previewTime: content.metadata.previewTime }),
        duration: content.metadata.duration,
        bpm: content.metadata.bpm,
    };
}

export function setupOszHandlers(mainWindow: BrowserWindow): void {
    logger.ipc('info', 'Setting up OSZ handlers');

    /**
     * Import OSZ file handler
     */
    ipcMain.handle('osz:import', async (_event, ...args): Promise<OSZImportResponse> => {
        const operationId = `osz-import-${Date.now()}`;
        logger.ipc('info', 'OSZ import requested', { operationId, args });

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
                logger.ipc('debug', 'Showing file dialog for OSZ import', { operationId });

                const result = await dialog.showOpenDialog(mainWindow, {
                    title: 'Select OSZ file',
                    filters: [
                        { name: 'OSZ Files', extensions: ['osz'] },
                        { name: 'All Files', extensions: ['*'] }
                    ],
                    properties: ['openFile']
                });

                if (result.canceled || result.filePaths.length === 0) {
                    logger.ipc('info', 'OSZ import cancelled by user', { operationId });
                    return { success: false, chart: undefined, error: 'No file selected' };
                }

                targetPath = result.filePaths[0];
            }

            if (!targetPath) {
                return { success: false, chart: undefined, error: 'No file path provided' };
            }

            logger.ipc('info', 'Processing OSZ file', { operationId, filePath: targetPath });

            // Parse OSZ file
            const parseResult = await SimplifiedOSZParser.parseOszFile(targetPath);

            if (!parseResult.success) {
                logger.ipc('error', 'OSZ parsing failed', {
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

            logger.ipc('info', 'OSZ import completed successfully', {
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

        } catch (error) {
            logger.ipc('error', 'OSZ import failed with exception', {
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
    ipcMain.handle('osz:get-library', async (_event): Promise<OSZLibraryResponse> => {
        const operationId = `osz-library-${Date.now()}`;
        logger.ipc('info', 'Chart library requested', { operationId });

        try {
            // First, auto-scan and parse OSZ files from public/assets
            logger.ipc('info', 'Auto-scanning OSZ files...', { operationId });
            await chartImportService.autoScanAndParseOszFiles();

            // Then get the parsed charts
            const charts = await chartImportService.getChartList();

            // Convert to expected format  
            const chartMetadata = charts.map(chart => {
                const metadata: any = {
                    id: chart.id,
                    title: chart.title,
                    artist: chart.artist,
                    creator: chart.artist,
                    difficulties: ['Easy', 'Normal', 'Hard'] as const,
                    duration: chart.duration,
                    bpm: chart.bpm
                };

                if (chart.backgroundImage) {
                    metadata.backgroundImage = chart.backgroundImage;
                }

                return metadata;
            });

            logger.ipc('info', 'Chart library retrieved', {
                operationId,
                chartCount: chartMetadata.length
            });

            return {
                success: true,
                charts: chartMetadata,
            };

        } catch (error) {
            logger.ipc('error', 'Failed to retrieve chart library', {
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
    ipcMain.handle('osz:remove-chart', async (_event, ...args): Promise<OSZRemoveResponse> => {
        const operationId = `osz-remove-${Date.now()}`;
        logger.ipc('info', 'Chart removal requested', { operationId, args });

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
                logger.ipc('warn', 'Attempted to remove non-existent chart', { operationId, chartId });
                return {
                    success: false,
                    error: 'Chart not found',
                };
            }

            // Remove from library
            const removed = chartLibrary.removeChart(chartId);

            if (removed) {
                logger.ipc('info', 'Chart removed successfully', {
                    operationId,
                    chartId,
                    title: chart.metadata.title
                });

                return {
                    success: true,
                    message: 'Chart removed successfully',
                };
            } else {
                logger.ipc('error', 'Failed to remove chart from library', { operationId, chartId });
                return {
                    success: false,
                    error: 'Failed to remove chart from library',
                };
            }

        } catch (error) {
            logger.ipc('error', 'Chart removal failed with exception', {
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
    ipcMain.handle('osz:get-audio', async (_event, ...args): Promise<OSZAudioResponse> => {
        const operationId = `osz-audio-${Date.now()}`;
        logger.ipc('info', 'Chart audio requested', { operationId, args });

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
                logger.ipc('warn', 'Attempted to get audio for non-existent chart', { operationId, chartId });
                return {
                    success: false,
                    error: 'Chart not found',
                };
            }

            // Return audio data as ArrayBuffer
            const audioBuffer = Buffer.from(chart.audioFile.data);
            const audioData = audioBuffer.buffer.slice(
                audioBuffer.byteOffset,
                audioBuffer.byteOffset + audioBuffer.byteLength
            ) as ArrayBuffer;

            logger.ipc('info', 'Chart audio retrieved successfully', {
                operationId,
                chartId,
                audioSize: audioData.byteLength,
                filename: chart.audioFile.filename
            });

            return {
                success: true,
                audioData,
            };

        } catch (error) {
            logger.ipc('error', 'Audio retrieval failed with exception', {
                operationId,
                error: error instanceof Error ? error.message : String(error)
            });

            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error during audio retrieval',
            };
        }
    });

    logger.ipc('info', 'OSZ handlers setup completed');
}
