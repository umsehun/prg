"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerIpcHandlers = registerIpcHandlers;
// src/main/core/ipcHandlers.ts
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const GameController_1 = require("../game/GameController");
const chart_discovery_1 = require("../services/chart-discovery");
const SettingsManager_1 = __importDefault(require("./SettingsManager"));
const logger_1 = require("../../shared/logger");
const ChartImportService_1 = require("../services/ChartImportService");
const PathService_1 = require("../services/PathService");
/**
 * Type guard to check if a string is a valid key of the Settings interface.
 * @param key The key to check.
 * @returns True if the key is a valid settings key, false otherwise.
 */
function isValidSettingsKey(key) {
    return ['noteSpeed'].includes(key);
}
/**
 * Registers all IPC event handlers for the application.
 */
function registerIpcHandlers() {
    // Game-related events with handshake
    electron_1.ipcMain.handle('startGame', async (_, chart) => {
        const result = GameController_1.GameController.startGame(chart);
        if (!result.success) {
            logger_1.logger.error('[IPC] Failed to start game:', result.error);
        }
        return result;
    });
    electron_1.ipcMain.handle('stopGame', async () => {
        const result = GameController_1.GameController.stopGame();
        if (!result.success) {
            logger_1.logger.error('[IPC] Failed to stop game:', result.error);
        }
        return result;
    });
    electron_1.ipcMain.on('handle-pin-press', (_, currentTimeSec) => {
        GameController_1.GameController.getInstance()?.handlePinPress(currentTimeSec);
    });
    // Chart import
    electron_1.ipcMain.handle('discover-charts', async () => {
        return await (0, chart_discovery_1.discoverCharts)();
    });
    electron_1.ipcMain.handle('load-pin-chart', async (_, chartPath) => {
        try {
            console.log(`[PinChartLoader] Loading chart: ${chartPath}`);
            let filePath;
            // Handle custom protocol URIs (like media://)
            if (chartPath.includes('://')) {
                filePath = PathService_1.pathService.resolve(chartPath);
            }
            else {
                // Legacy handling for relative paths
                const sanitizedPath = chartPath.replace(/\.\./g, '');
                let basePath;
                if (electron_1.app.isPackaged) {
                    basePath = process.resourcesPath;
                }
                else {
                    // app.getAppPath() returns /Users/user/prg/dist/main, we need to go up to project root
                    basePath = path_1.default.join(electron_1.app.getAppPath(), '..', '..');
                }
                filePath = path_1.default.join(basePath, 'public', sanitizedPath);
            }
            console.log(`[PinChartLoader] Full path: ${filePath}`);
            // Check if this is a .osu file that needs to be parsed from OSZ chart
            if (filePath.endsWith('.osu')) {
                // This is a .osu file from an OSZ chart, we need to find the corresponding OSZ chart
                // and convert it to PinChart using ChartImportService
                // Extract chart ID from the media:// URI (e.g., "media://Wolpis-Carter-Batsubyou/file.osu" -> "Wolpis-Carter-Batsubyou")
                if (chartPath.startsWith('media://')) {
                    const chartId = chartPath.split('/')[2]; // Get the chart ID part
                    const importService = ChartImportService_1.ChartImportService.getInstance();
                    const library = await importService.getLibrary();
                    // Find the OSZ chart by ID
                    const oszChart = library.find(chart => chart.id === chartId);
                    if (!oszChart) {
                        throw new Error(`OSZ chart not found for id: ${chartId}`);
                    }
                    // Find the difficulty index for this specific .osu file
                    const osuFileName = path_1.default.basename(filePath);
                    const difficultyIndex = oszChart.difficulties.findIndex(diff => {
                        if (!diff.filePath)
                            return false;
                        const diffFileName = path_1.default.basename(PathService_1.pathService.resolve(diff.filePath));
                        return diffFileName === osuFileName;
                    });
                    if (difficultyIndex === -1) {
                        throw new Error(`Difficulty not found for file: ${osuFileName}`);
                    }
                    console.log(`[PinChartLoader] Converting OSZ chart ${chartId}, difficulty ${difficultyIndex}`);
                    const pinChart = await importService.convertDifficultyToPinChart(oszChart, difficultyIndex);
                    console.log(`[PinChartLoader] Successfully converted OSZ chart: ${chartPath}`);
                    return pinChart;
                }
                else {
                    throw new Error(`Cannot parse .osu file without proper media:// URI: ${chartPath}`);
                }
            }
            else {
                // This is a legacy JSON chart file
                const data = await promises_1.default.readFile(filePath, 'utf-8');
                const pinChart = {
                    id: `${chartPath}-${path_1.default.basename(filePath)}`, // Create a unique ID for this specific difficulty
                    ...JSON.parse(data),
                };
                console.log(`[PinChartLoader] Successfully loaded JSON chart: ${chartPath}`);
                return pinChart;
            }
        }
        catch (error) {
            console.error(`[PinChartLoader] Failed to load pin chart at ${chartPath}:`, error);
            return null;
        }
    });
    // File dialog
    electron_1.ipcMain.handle('show-open-dialog', async (_, options) => {
        const { dialog } = require('electron');
        return await dialog.showOpenDialog(options);
    });
    // .osz file import (moved to OSZ Import handlers section below)
    electron_1.ipcMain.handle('get-chart-library', async () => {
        return await ChartImportService_1.ChartImportService.getInstance().getLibrary();
    });
    // convert-difficulty-to-chart handler removed - duplicate functionality with convert-difficulty-to-pin-chart
    electron_1.ipcMain.handle('remove-chart-from-library', async (_, chartId) => {
        return await ChartImportService_1.ChartImportService.getInstance().removeFromLibrary(chartId);
    });
    // OSZ 차트를 PinChart로 변환하는 새 IPC 핸들러
    electron_1.ipcMain.handle('convert-osz-to-pin-chart', async (_, chartMetadata, difficultyIndex) => {
        try {
            const importService = ChartImportService_1.ChartImportService.getInstance();
            const library = await importService.getLibrary();
            console.log(`[Debug] Looking for chart with ID: ${chartMetadata.id}`);
            console.log(`[Debug] Available chart IDs:`, library.map(c => c.id));
            // chartMetadata.id로 OSZ 차트 찾기 (정확한 매칭)
            const oszChart = library.find(chart => chart.id === chartMetadata.id);
            if (!oszChart) {
                throw new Error(`OSZ chart not found for id: ${chartMetadata.id}. Available IDs: ${library.map(c => c.id).join(', ')}`);
            }
            // 사용 가능한 난이도 중 첫 번째 유효한 것 선택
            console.log(`[Debug] Chart has ${oszChart.difficulties.length} difficulties`);
            let pinChart = null;
            // Use specified difficulty index or try all difficulties
            if (difficultyIndex !== undefined && difficultyIndex >= 0 && difficultyIndex < oszChart.difficulties.length) {
                console.log(`[Debug] Converting specified difficulty ${difficultyIndex}: ${oszChart.difficulties[difficultyIndex]?.name || 'Unnamed'}`);
                try {
                    pinChart = await importService.convertDifficultyToPinChart(oszChart, difficultyIndex);
                    console.log(`[Debug] Successfully converted specified difficulty ${difficultyIndex}`);
                }
                catch (error) {
                    console.error(`[Debug] Failed to convert specified difficulty ${difficultyIndex}:`, error);
                    throw error; // Don't fallback if user specifically selected a difficulty
                }
            }
            else {
                // Try converting all difficulties until one succeeds (fallback behavior)
                for (let i = 0; i < oszChart.difficulties.length; i++) {
                    console.log(`[Debug] Attempting to convert difficulty ${i}/${oszChart.difficulties.length - 1}: ${oszChart.difficulties[i]?.name || 'Unnamed'}`);
                    try {
                        pinChart = await importService.convertDifficultyToPinChart(oszChart, i);
                        console.log(`[Debug] Successfully converted difficulty ${i}`);
                        break; // Success! Exit the loop
                    }
                    catch (error) {
                        console.error(`[Debug] Failed to convert difficulty ${i}:`, error);
                        // Continue to next difficulty
                    }
                }
            }
            if (!pinChart) {
                throw new Error(`Failed to convert any difficulty.`);
            }
            // GameScene에서 비디오를 로드할 수 있도록 videoPath를 PinChart에 포함시킵니다.
            if (chartMetadata.videoPath) {
                pinChart.videoPath = chartMetadata.videoPath;
            }
            return pinChart;
        }
        catch (error) {
            console.error('Failed to convert OSZ to PinChart:', error);
            throw error;
        }
    });
    // Asset loading handlers
    electron_1.ipcMain.handle('load-asset', async (_, assetUri) => {
        try {
            const fullPath = PathService_1.pathService.resolve(assetUri);
            const data = await promises_1.default.readFile(fullPath);
            console.log(`[AssetLoader] Successfully loaded asset: ${assetUri} -> ${fullPath}`);
            return data;
        }
        catch (error) {
            console.error(`[AssetLoader] Asset not found: ${assetUri}`, error);
            throw new Error(`Asset not found: ${assetUri}`);
        }
    });
    electron_1.ipcMain.handle('asset-exists', async (_, assetUri) => {
        try {
            const fullPath = PathService_1.pathService.resolve(assetUri);
            await promises_1.default.access(fullPath);
            return true;
        }
        catch {
            return false;
        }
    });
    // OSZ Import handlers (get-chart-library handler removed - duplicate of line 78)
    electron_1.ipcMain.handle('select-osz-file', async () => {
        const { dialog } = require('electron');
        const result = await dialog.showOpenDialog({
            title: 'Select .osz file',
            filters: [
                { name: 'osu! Beatmap', extensions: ['osz'] }
            ],
            properties: ['openFile']
        });
        if (result.canceled || result.filePaths.length === 0) {
            return null;
        }
        return result.filePaths[0];
    });
    electron_1.ipcMain.handle('import-osz-file', async (_, filePath) => {
        try {
            return await ChartImportService_1.ChartImportService.getInstance().importOszFile(filePath);
        }
        catch (error) {
            console.error('Failed to import OSZ file:', error);
            throw error;
        }
    });
    electron_1.ipcMain.handle('convert-difficulty-to-pin-chart', async (_, oszChart, difficultyIndex) => {
        try {
            return await ChartImportService_1.ChartImportService.getInstance().convertDifficultyToPinChart(oszChart, difficultyIndex);
        }
        catch (error) {
            console.error('Failed to convert difficulty to pin chart:', error);
            throw error;
        }
    });
    // Settings-related events
    electron_1.ipcMain.handle('getSetting', async (_, key) => {
        if (!isValidSettingsKey(key)) {
            throw new Error(`Invalid settings key received: ${key}`);
        }
        return SettingsManager_1.default.get(key);
    });
    electron_1.ipcMain.on('setSetting', (_, key, value) => {
        if (!isValidSettingsKey(key)) {
            console.error(`Invalid settings key received: ${key}`);
            return;
        }
        // A simple type check for the value. This could be more robust.
        if (key === 'noteSpeed' && typeof value !== 'number') {
            console.error(`Invalid value type for ${key}: expected number, got ${typeof value}`);
            return;
        }
        // The key is now guaranteed to be keyof Settings, and value has been checked.
        void SettingsManager_1.default.set(key, value);
    });
    // Chart auto-import handler
    electron_1.ipcMain.handle('import-all-osz-files', async (_, assetsPath) => {
        try {
            // Use default public/assets path if not provided
            const defaultAssetsPath = path_1.default.join(electron_1.app.getAppPath(), '..', '..', 'public', 'assets');
            const targetPath = assetsPath || defaultAssetsPath;
            console.log(`[IPC] Starting batch OSZ import from: ${targetPath}`);
            const chartImportService = ChartImportService_1.ChartImportService.getInstance();
            const result = await chartImportService.importAllFromDirectory(targetPath);
            console.log(`[IPC] Batch import completed: ${result.imported} imported, ${result.skipped} skipped`);
            return result;
        }
        catch (error) {
            console.error('[IPC] Failed to import OSZ files:', error);
            throw error;
        }
    });
}
