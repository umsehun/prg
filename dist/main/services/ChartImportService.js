"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChartImportService = void 0;
// src/main/services/ChartImportService.ts
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const PathService_1 = require("./PathService");
const DirectoryOszExtractor_1 = require("../utils/DirectoryOszExtractor");
const RuntimeOsuParser_1 = require("./RuntimeOsuParser");
const logger_1 = require("../../shared/globals/logger");
class ChartImportService {
    constructor() {
        Object.defineProperty(this, "pathService", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "extractor", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "osuParser", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.pathService = new PathService_1.PathService();
        this.extractor = new DirectoryOszExtractor_1.DirectoryOszExtractor();
        this.osuParser = new RuntimeOsuParser_1.RuntimeOsuParser();
    }
    /**
     * Auto-scan OSZ files and return loaded charts
     */
    async autoScanOszFiles() {
        return this.autoScanAndParseOszFiles();
    }
    /**
     * Auto-scan OSZ files and parse them (main method)
     */
    async autoScanAndParseOszFiles() {
        try {
            // First, try to load from library.json (pre-parsed data)
            const libraryCharts = await this.loadLibraryJson();
            if (libraryCharts.length > 0) {
                logger_1.logger.info('chart-import', `Using ${libraryCharts.length} charts from library.json`);
                return libraryCharts;
            }
            // Fallback to OSZ parsing
            logger_1.logger.info('chart-import', 'No library.json found, parsing OSZ files');
            const publicAssetsPath = this.getPublicAssetsPath();
            const chartsPath = this.pathService.getChartsPath();
            // Ensure charts directory exists
            await fs_1.promises.mkdir(chartsPath, { recursive: true });
            // Scan for OSZ files
            const items = await fs_1.promises.readdir(publicAssetsPath, { withFileTypes: true });
            const parsedCharts = [];
            for (const item of items) {
                if (item.isFile() && item.name.endsWith('.osz')) {
                    const oszPath = path_1.default.join(publicAssetsPath, item.name);
                    const chart = await this.parseOszToCharts(oszPath, chartsPath);
                    if (chart)
                        parsedCharts.push(chart);
                }
                else if (item.isDirectory()) {
                    const dirItems = await fs_1.promises.readdir(path_1.default.join(publicAssetsPath, item.name));
                    const oszFile = dirItems.find(file => file.endsWith('.osz'));
                    if (oszFile) {
                        const oszPath = path_1.default.join(publicAssetsPath, item.name, oszFile);
                        const chart = await this.parseOszToCharts(oszPath, chartsPath);
                        if (chart)
                            parsedCharts.push(chart);
                    }
                }
            }
            // Save library.json after successful parsing
            if (parsedCharts.length > 0) {
                await this.saveLibraryJson(parsedCharts);
            }
            return parsedCharts;
        }
        catch (error) {
            logger_1.logger.error('chart-import', `Failed to scan OSZ files: ${error}`);
            return [];
        }
    }
    async loadLibraryJson() {
        try {
            const libraryPath = this.pathService.getLibraryPath();
            const data = await fs_1.promises.readFile(libraryPath, 'utf-8');
            const libraryData = JSON.parse(data);
            return libraryData.map((chart) => ({
                id: chart.id || `unknown-${Date.now()}`,
                title: chart.title || 'Unknown Title',
                artist: chart.artist || 'Unknown Artist',
                audioFile: chart.audioFile || '',
                backgroundImage: chart.backgroundFile || '',
                difficulty: { easy: 1, normal: 3, hard: 5, expert: 7 },
                bpm: chart.bpm || 120,
                duration: chart.duration || 180000,
                filePath: chart.filePath || '',
                notes: [] // Notes will be loaded from .osu files at runtime
            }));
        }
        catch {
            return [];
        }
    }
    async parseOszToCharts(oszPath, chartsPath) {
        try {
            const fileName = path_1.default.basename(oszPath, '.osz');
            // Check if already exists
            const outputDir = path_1.default.join(chartsPath, fileName);
            try {
                await fs_1.promises.access(outputDir);
                logger_1.logger.debug('chart-import', `Chart already exists: ${fileName}`);
                return await this.loadExistingChart(outputDir);
            }
            catch {
                // Chart doesn't exist, extract it
            }
            // Extract OSZ using DirectoryOszExtractor
            const metadata = await this.extractor.extractOsz(oszPath, chartsPath);
            return this.convertMetadataToSongData(metadata);
        }
        catch (error) {
            logger_1.logger.error('chart-import', `Failed to parse OSZ: ${error}`);
            return null;
        }
    }
    convertMetadataToSongData(metadata) {
        return {
            id: metadata.id,
            title: metadata.title,
            artist: metadata.artist,
            audioFile: metadata.audioFile || '',
            backgroundImage: metadata.backgroundFile || '',
            difficulty: { easy: 3, normal: 5, hard: 7, expert: 9 },
            bpm: metadata.bpm,
            duration: metadata.duration,
            filePath: metadata.filePath,
            notes: [] // Notes will be loaded from .osu files at runtime
        };
    }
    async saveLibraryJson(charts) {
        try {
            const libraryPath = path_1.default.join(this.pathService.getAppDataPath(), 'library.json');
            const libraryData = charts.map(chart => ({
                id: chart.id,
                title: chart.title,
                artist: chart.artist,
                audioFile: chart.audioFile,
                backgroundFile: chart.backgroundImage,
                bpm: chart.bpm,
                duration: chart.duration,
                filePath: chart.filePath
            }));
            await fs_1.promises.writeFile(libraryPath, JSON.stringify(libraryData, null, 2), 'utf-8');
            logger_1.logger.info('chart-import', `Library saved: ${libraryPath}`);
        }
        catch (error) {
            logger_1.logger.error('chart-import', `Failed to save library: ${error}`);
        }
    }
    async loadExistingChart(chartDir) {
        try {
            const files = await fs_1.promises.readdir(chartDir);
            const osuFiles = files.filter(f => f.endsWith('.osu'));
            if (osuFiles.length === 0)
                return null;
            const chartName = path_1.default.basename(chartDir);
            const audioFile = files.find(f => f.endsWith('.mp3')) || '';
            const backgroundFile = files.find(f => f.match(/\.(jpg|jpeg|png)$/i)) || '';
            return {
                id: chartName,
                title: chartName,
                artist: 'Unknown Artist',
                audioFile,
                backgroundImage: backgroundFile,
                difficulty: { easy: 3, normal: 5, hard: 7, expert: 9 },
                bpm: 120,
                duration: 180000,
                filePath: chartDir,
                notes: []
            };
        }
        catch {
            return null;
        }
    }
    getPublicAssetsPath() {
        const isDev = process.env.NODE_ENV === 'development';
        if (isDev) {
            return path_1.default.join(process.cwd(), 'public', 'assets');
        }
        else {
            return path_1.default.join(process.resourcesPath, 'public', 'assets');
        }
    }
    /**
     * Get list of parsed charts (compatibility method)
     */
    async getChartList() {
        return this.autoScanOszFiles();
    }
    /**
     * Load chart data with notes for game play
     */
    async loadChartForPlay(chartId, difficulty) {
        try {
            // Find chart in library
            const charts = await this.loadLibraryJson();
            const chart = charts.find(c => c.id === chartId);
            if (!chart || !chart.filePath) {
                logger_1.logger.error('chart-import', `Chart not found: ${chartId}`);
                return null;
            }
            // Get chart info with difficulties and notes
            const chartInfo = await this.osuParser.getChartInfo(chart.filePath, difficulty);
            if (!chartInfo.selectedDifficulty) {
                logger_1.logger.error('chart-import', `No difficulty found for chart: ${chartId}`);
                return null;
            }
            logger_1.logger.info('chart-import', `Loaded chart for play: ${chartId} - ${chartInfo.selectedDifficulty.difficultyName} (${chartInfo.notes.length} notes)`);
            return {
                chartData: chart,
                notes: chartInfo.notes,
                difficulties: chartInfo.difficulties,
                audioVideoFiles: chartInfo.audioVideoFiles
            };
        }
        catch (error) {
            logger_1.logger.error('chart-import', `Failed to load chart for play: ${chartId} - ${error}`);
            return null;
        }
    }
}
exports.ChartImportService = ChartImportService;
