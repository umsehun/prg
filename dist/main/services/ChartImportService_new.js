"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chartImportService = void 0;
// src/main/services/ChartImportService.ts
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const adm_zip_1 = __importDefault(require("adm-zip"));
const osu_parsers_1 = require("osu-parsers");
const PathService_1 = require("./PathService");
const logger_1 = require("../../shared/logger");
class ChartImportService {
    constructor() {
        Object.defineProperty(this, "importingCharts", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Set()
        });
    }
    /**
     * Import an OSZ file and extract it to the charts directory
     */
    async importOszFile(oszPath) {
        try {
            // Prevent duplicate imports
            if (this.importingCharts.has(oszPath)) {
                logger_1.logger.warn(`[ChartImportService] Already importing: ${oszPath}`);
                return null;
            }
            this.importingCharts.add(oszPath);
            const zip = new adm_zip_1.default(oszPath);
            const entries = zip.getEntries();
            // Generate chart ID from filename
            const chartId = path.basename(oszPath, '.osz').replace(/[^a-zA-Z0-9-_]/g, '_');
            const chartFolder = path.join(PathService_1.pathService.getUserDataPath(), 'charts', chartId);
            // Create chart folder
            await fs.mkdir(chartFolder, { recursive: true });
            // Extract all files
            zip.extractAllTo(chartFolder, true);
            // Find .osu files
            const osuFiles = entries.filter(entry => !entry.isDirectory && entry.entryName.endsWith('.osu'));
            if (osuFiles.length === 0) {
                logger_1.logger.error(`[ChartImportService] No .osu files found in ${oszPath}`);
                return null;
            }
            // Parse the first .osu file for metadata
            const firstOsuFile = path.join(chartFolder, osuFiles[0].entryName);
            const beatmap = await this.parseBeatmapFile(firstOsuFile);
            // Create difficulties array
            const difficulties = [];
            for (const osuFile of osuFiles) {
                const filePath = path.join(chartFolder, osuFile.entryName);
                try {
                    const diffBeatmap = await this.parseBeatmapFile(filePath);
                    difficulties.push({
                        name: diffBeatmap.metadata.version || 'Unknown',
                        version: diffBeatmap.metadata.version || 'Unknown',
                        overallDifficulty: diffBeatmap.difficulty?.overallDifficulty || 5,
                        approachRate: diffBeatmap.difficulty?.approachRate || 5,
                        circleSize: diffBeatmap.difficulty?.circleSize || 5,
                        hpDrainRate: diffBeatmap.difficulty?.hpDrainRate || 5,
                        noteCount: diffBeatmap.hitObjects?.length || 0,
                        filePath: filePath
                    });
                }
                catch (error) {
                    logger_1.logger.warn(`[ChartImportService] Failed to parse difficulty ${osuFile.entryName}:`, error);
                }
            }
            const oszChart = {
                id: chartId,
                title: beatmap.metadata.title || 'Unknown Title',
                artist: beatmap.metadata.artist || 'Unknown Artist',
                creator: beatmap.metadata.creator || 'Unknown Creator',
                audioFilename: beatmap.general.audioFilename || '',
                backgroundFilename: beatmap.events?.backgroundPath,
                difficulties,
                folderPath: chartFolder,
                mode: beatmap.mode || 0
            };
            return oszChart;
        }
        catch (error) {
            logger_1.logger.error(`[ChartImportService] Failed to import OSZ file:`, error);
            return null;
        }
        finally {
            this.importingCharts.delete(oszPath);
        }
    }
    /**
     * Convert OSZ difficulty to PinChart
     */
    async convertDifficultyToPinChart(oszChart, difficultyIndex) {
        const difficulty = difficultyIndex !== undefined
            ? oszChart.difficulties[difficultyIndex]
            : oszChart.difficulties[0];
        if (!difficulty || !difficulty.filePath) {
            throw new Error('Difficulty not found or missing file path');
        }
        const parsed = await this.parseDifficulty(difficulty.filePath);
        const pinChart = {
            folderPath: PathService_1.pathService.getAssetUrl(oszChart.folderPath),
            id: `${oszChart.id}-${difficultyIndex || 0}`,
            title: oszChart.title,
            artist: oszChart.artist,
            creator: oszChart.creator,
            audioFilename: PathService_1.pathService.getAssetUrl(oszChart.audioFilename ?
                path.join(oszChart.folderPath, oszChart.audioFilename) : ''),
            backgroundPath: oszChart.backgroundFilename ?
                PathService_1.pathService.getAssetUrl(path.join(oszChart.folderPath, oszChart.backgroundFilename)) : undefined,
            videoPath: oszChart.videoPath ?
                PathService_1.pathService.getAssetUrl(oszChart.videoPath) : undefined,
            bpm: parsed.bpm,
            notes: parsed.notes,
            gameMode: 'pin',
            metadata: {
                version: difficulty.version,
                overallDifficulty: difficulty.overallDifficulty,
                approachRate: difficulty.approachRate,
                circleSize: difficulty.circleSize,
                hpDrainRate: difficulty.hpDrainRate,
                noteCount: difficulty.noteCount
            }
        };
        return pinChart;
    }
    async parseBeatmapFile(filePath) {
        const content = await fs.readFile(filePath, 'utf-8');
        const decoder = new osu_parsers_1.BeatmapDecoder();
        return decoder.decodeFromString(content);
    }
    async parseDifficulty(filePath) {
        try {
            const beatmap = await this.parseBeatmapFile(filePath);
            // Extract BPM
            const bpmModes = beatmap.controlPoints?.timingPoints || [];
            const bpm = bpmModes.length > 0 ?
                (bpmModes.length > 1 ?
                    bpmModes.reduce((a, b) => a.beatLength < b.beatLength ? a : b).beatLength :
                    bpmModes[0].beatLength) : 120;
            // Convert hit objects to notes
            const notes = beatmap.hitObjects?.map((ho) => ({
                time: ho.startTime,
                type: 'pin',
                isHit: false
            })) || [];
            return {
                bpm,
                notes,
                mode: beatmap.mode || 0
            };
        }
        catch (error) {
            logger_1.logger.error(`[ChartImportService] Failed to parse difficulty ${filePath}:`, error);
            throw error;
        }
    }
}
exports.chartImportService = new ChartImportService();
