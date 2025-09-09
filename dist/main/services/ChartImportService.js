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
const OszParser_1 = require("../utils/OszParser");
const MediaConverter_1 = require("./MediaConverter");
const logger_1 = require("../../shared/globals/logger");
class ChartImportService {
    constructor() {
        Object.defineProperty(this, "pathService", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "parser", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "mediaConverter", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.pathService = new PathService_1.PathService();
        this.parser = new OszParser_1.OszParser();
        this.mediaConverter = MediaConverter_1.MediaConverter.getInstance();
    }
    /**
     * Get the public/assets directory path
     */
    getPublicAssetsPath() {
        const isDev = process.env.NODE_ENV === 'development';
        if (isDev) {
            // Development: use project root public/assets
            return path_1.default.join(process.cwd(), 'public', 'assets');
        }
        else {
            // Production: use resources/app/public/assets
            return path_1.default.join(process.resourcesPath, 'app', 'public', 'assets');
        }
    }
    /**
     * Scan public/assets for .osz files and auto-parse them
     */
    async autoScanAndParseOszFiles() {
        try {
            const publicAssetsPath = this.getPublicAssetsPath();
            const chartsPath = this.pathService.getChartsPath();
            logger_1.logger.info('chart-import', `Scanning for OSZ files in: ${publicAssetsPath}`);
            // Ensure charts directory exists
            await fs_1.promises.mkdir(chartsPath, { recursive: true });
            // Check if public/assets exists
            try {
                await fs_1.promises.access(publicAssetsPath);
            }
            catch (error) {
                logger_1.logger.warn('chart-import', `Public assets path not found: ${publicAssetsPath}`);
                return [];
            }
            // Read all items in public/assets
            const items = await fs_1.promises.readdir(publicAssetsPath, { withFileTypes: true });
            const parsedCharts = [];
            for (const item of items) {
                const itemPath = path_1.default.join(publicAssetsPath, item.name);
                if (item.isFile() && item.name.endsWith('.osz')) {
                    // Direct .osz file
                    logger_1.logger.info('chart-import', `Found OSZ file: ${item.name}`);
                    const chart = await this.parseOszToCharts(itemPath, chartsPath);
                    if (chart)
                        parsedCharts.push(chart);
                }
                else if (item.isDirectory()) {
                    // Check if directory contains .osz file
                    const dirPath = itemPath;
                    const dirItems = await fs_1.promises.readdir(dirPath);
                    const oszFile = dirItems.find(file => file.endsWith('.osz'));
                    if (oszFile) {
                        logger_1.logger.info('chart-import', `Found OSZ file in directory: ${item.name}/${oszFile}`);
                        const oszPath = path_1.default.join(dirPath, oszFile);
                        const chart = await this.parseOszToCharts(oszPath, chartsPath);
                        if (chart)
                            parsedCharts.push(chart);
                    }
                }
            }
            logger_1.logger.info('chart-import', `Successfully parsed ${parsedCharts.length} OSZ files`);
            return parsedCharts;
        }
        catch (error) {
            logger_1.logger.error('chart-import', `Failed to auto-scan OSZ files: ${error}`);
            return [];
        }
    }
    /**
     * Parse a single OSZ file to the charts directory
     */
    async parseOszToCharts(oszPath, chartsPath) {
        try {
            const fileName = path_1.default.basename(oszPath, '.osz');
            const outputDir = path_1.default.join(chartsPath, fileName);
            // Check if already parsed
            try {
                await fs_1.promises.access(outputDir);
                logger_1.logger.debug('chart-import', `Chart already exists, skipping: ${fileName}`);
                // Try to load existing chart data
                return await this.loadExistingChart(outputDir);
            }
            catch {
                // Chart doesn't exist, parse it
            }
            logger_1.logger.info('chart-import', `Parsing OSZ file: ${fileName}`);
            const songData = await this.parser.parseOszFile(oszPath, outputDir);
            if (songData) {
                // Convert media files if needed
                await this.convertMediaFiles(outputDir, songData);
                logger_1.logger.info('chart-import', `Successfully parsed: ${songData.title} by ${songData.artist}`);
            }
            return songData;
        }
        catch (error) {
            logger_1.logger.error('chart-import', `Failed to parse OSZ file ${oszPath}: ${error}`);
            return null;
        }
    }
    /**
     * Convert audio and video files to supported formats
     */
    async convertMediaFiles(chartDir, songData) {
        try {
            // Convert audio file to MP3 if needed
            if (songData.audioFile) {
                const audioPath = path_1.default.resolve(chartDir, songData.audioFile);
                if (await this.fileExists(audioPath) && !audioPath.endsWith('.mp3')) {
                    logger_1.logger.info('chart-import', `Converting audio file: ${audioPath}`);
                    await this.mediaConverter.ensureMp3(audioPath, chartDir);
                }
            }
            // Convert background video to MP4 if needed (if exists)
            const possibleVideoFiles = [
                'background.avi', 'background.mov', 'background.wmv',
                'bg.avi', 'bg.mov', 'bg.wmv', 'video.avi', 'video.mov', 'video.wmv'
            ];
            for (const videoFile of possibleVideoFiles) {
                const videoPath = path_1.default.join(chartDir, videoFile);
                if (await this.fileExists(videoPath)) {
                    logger_1.logger.info('chart-import', `Converting video file: ${videoPath}`);
                    await this.mediaConverter.ensureMp4(videoPath, chartDir);
                    break;
                }
            }
        }
        catch (error) {
            logger_1.logger.error('chart-import', `Failed to convert media files: ${error}`);
        }
    }
    /**
     * Load existing chart data from parsed directory
     */
    async loadExistingChart(chartDir) {
        try {
            const chartDataPath = path_1.default.join(chartDir, 'chart.json');
            if (await this.fileExists(chartDataPath)) {
                const data = await fs_1.promises.readFile(chartDataPath, 'utf-8');
                return JSON.parse(data);
            }
        }
        catch (error) {
            logger_1.logger.debug('chart-import', `Could not load existing chart data: ${error}`);
        }
        return null;
    }
    /**
     * Check if file exists
     */
    async fileExists(filePath) {
        try {
            await fs_1.promises.access(filePath);
            return true;
        }
        catch {
            return false;
        }
    }
    /**
     * Get all parsed charts from the charts directory
     */
    async getChartList() {
        try {
            const chartsPath = this.pathService.getChartsPath();
            // Ensure charts directory exists
            await fs_1.promises.mkdir(chartsPath, { recursive: true });
            const chartDirs = await fs_1.promises.readdir(chartsPath, { withFileTypes: true });
            const charts = [];
            for (const dir of chartDirs) {
                if (dir.isDirectory()) {
                    const chartPath = path_1.default.join(chartsPath, dir.name);
                    const chart = await this.loadExistingChart(chartPath);
                    if (chart) {
                        charts.push(chart);
                    }
                }
            }
            return charts;
        }
        catch (error) {
            logger_1.logger.error('chart-import', `Failed to get chart list: ${error}`);
            return [];
        }
    }
}
exports.ChartImportService = ChartImportService;
