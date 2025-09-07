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
exports.ChartImportService = void 0;
// src/main/services/ChartImportService.ts
const fs = __importStar(require("fs/promises"));
const fsSync = __importStar(require("fs"));
const path = __importStar(require("path"));
const electron_1 = require("electron");
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
        Object.defineProperty(this, "chartsPath", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "libraryPath", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "lockfilePath", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        const userDataPath = electron_1.app.getPath('userData');
        this.chartsPath = path.join(userDataPath, 'charts');
        this.libraryPath = path.join(userDataPath, 'library.json');
        this.lockfilePath = path.join(userDataPath, 'library.json.lock');
    }
    /**
     * Remove ALL contents under charts directory and reset library to empty array.
     * Intended for development cleanup only.
     */
    async clearChartsDirectoryAndLibrary() {
        try {
            console.warn('[ChartImportService] Clearing charts directory and resetting library (dev mode).');
            // Remove charts folder entirely
            await fs.rm(this.chartsPath, { recursive: true, force: true });
            // Recreate folder
            await fs.mkdir(this.chartsPath, { recursive: true });
            // Reset library.json
            await fs.writeFile(this.libraryPath, JSON.stringify([], null, 2));
        }
        catch (err) {
            console.error('[ChartImportService] Failed to clear charts directory:', err);
            throw err;
        }
    }
    /**
     * Normalize the library by removing duplicate charts with the same title+artist.
     * Preference order for keeping an entry:
     * 1) Entry whose folder exists on disk
     * 2) Newest by timestamp suffix in id (if parsable)
     * All other duplicates are removed from library (folders remain untouched).
     */
    async normalizeLibrary() {
        try {
            const library = await this.getLibrary();
            if (library.length === 0)
                return;
            // Group by title+artist key (explicit type to avoid possibly undefined index typing)
            const groups = new Map();
            for (const item of library) {
                const key = `${item.artist}__${item.title}`;
                const list = groups.get(key) ?? [];
                list.push(item);
                groups.set(key, list);
            }
            let changed = false;
            const toKeepIds = new Set();
            const toRemoveIds = [];
            for (const items of groups.values()) {
                if (!items || items.length === 0) {
                    continue;
                }
                if (items.length === 1) {
                    toKeepIds.add(items[0].id);
                    continue;
                }
                // Check folder existence
                const withExistence = await Promise.all(items.map(async (it) => {
                    try {
                        await fs.access(it.folderPath);
                        return { it, exists: true };
                    }
                    catch {
                        return { it, exists: false };
                    }
                }));
                // Prefer existing folder
                const existing = withExistence.filter(x => x.exists).map(x => x.it);
                const candidates = existing.length > 0 ? existing : items;
                if (candidates.length === 0) {
                    // Should not happen, but guard to satisfy TS
                    continue;
                }
                // Choose newest by timestamp segment in id if present (last hyphen-separated number)
                const parseTs = (id) => {
                    const m = id.match(/-(\d{10,})$/);
                    return m ? Number(m[1]) : 0;
                };
                let winner = candidates[0];
                for (const c of candidates) {
                    if (parseTs(c.id) > parseTs(winner.id))
                        winner = c;
                }
                // Mark winner to keep, others to remove
                toKeepIds.add(winner.id);
                for (const it of items) {
                    if (it.id !== winner.id) {
                        toRemoveIds.push(it.id);
                    }
                }
            }
            if (toRemoveIds.length > 0) {
                const newLibrary = library.filter(it => toKeepIds.has(it.id));
                await fs.writeFile(this.libraryPath, JSON.stringify(newLibrary, null, 2));
                changed = true;
                console.log(`[ChartImportService] normalizeLibrary: removed ${toRemoveIds.length} duplicate entries.`);
            }
            if (!changed) {
                console.log('[ChartImportService] normalizeLibrary: no duplicates found.');
            }
        }
        catch (err) {
            console.warn('[ChartImportService] normalizeLibrary failed:', err);
        }
    }
    static getInstance() {
        if (!ChartImportService.instance) {
            ChartImportService.instance = new ChartImportService();
        }
        return ChartImportService.instance;
    }
    /**
     * .osz 파일을 임포트하고 압축 해제하여 차트 라이브러리에 추가
     */
    async importOszFile(filePath) {
        // First, parse metadata to check if the chart already exists
        const zipForCheck = new adm_zip_1.default(filePath);
        const osuFileForCheck = zipForCheck.getEntries().find(entry => entry.entryName.endsWith('.osu'));
        if (!osuFileForCheck) {
            throw new Error('No .osu files found in the archive for pre-check');
        }
        const firstOsuContentForCheck = osuFileForCheck.getData().toString('utf8');
        const decoderForCheck = new osu_parsers_1.BeatmapDecoder();
        const beatmapForCheck = decoderForCheck.decodeFromString(firstOsuContentForCheck);
        const library = await this.getLibrary();
        const existingChart = library.find(c => c.title === beatmapForCheck.metadata.title &&
            c.artist === beatmapForCheck.metadata.artist);
        // Lock to prevent duplicate imports
        if (this.importingCharts.has(filePath)) {
            console.log(`[ChartImportService] Import for ${filePath} is already in progress. Skipping.`);
            return null;
        }
        this.importingCharts.add(filePath);
        try {
            if (existingChart) {
                try {
                    await fs.access(existingChart.folderPath);
                    return existingChart;
                }
                catch (error) {
                    console.warn(`[ChartImportService] Chart "${existingChart.title}" folder missing. Re-importing...`);
                    await this.removeFromLibrary(existingChart.id, false);
                }
            }
            // Ensure charts directory exists
            await fs.mkdir(this.chartsPath, { recursive: true });
            const zip = new adm_zip_1.default(filePath);
            const entries = zip.getEntries();
            // Extract chart metadata from .osu files
            const osuFiles = entries.filter(entry => entry.entryName.endsWith('.osu'));
            if (osuFiles.length === 0) {
                throw new Error('No .osu files found in the archive');
            }
            // Parse first .osu file for metadata
            const firstOsuContent = osuFiles[0].getData().toString('utf8');
            const decoder = new osu_parsers_1.BeatmapDecoder();
            const beatmap = decoder.decodeFromString(firstOsuContent);
            if (!beatmap || !beatmap.metadata) {
                throw new Error('Invalid beatmap metadata');
            }
            // .osu 파일에 명시된 비디오 파일명 가져오기 (events 섹션에서 Video 이벤트 찾기)
            let specifiedVideoFile;
            if (beatmap.events && beatmap.events.backgroundPath) {
                // osu-parsers에서 비디오 정보를 다르게 저장할 수 있으므로 여러 방법으로 시도
                const eventsString = JSON.stringify(beatmap.events);
                const videoMatch = eventsString.match(/Video.*?([^,\s"]+\.(mp4|avi|flv|mov|webm))/i);
                if (videoMatch) {
                    specifiedVideoFile = videoMatch[1];
                }
            }
            logger_1.logger.info(`[ChartImportService] Chart specifies video: "${specifiedVideoFile}"`);
            const safeArtist = beatmap.metadata.artist.replace(/[^a-zA-Z0-9\s-]/g, '');
            const safeTitle = beatmap.metadata.title.replace(/[^a-zA-Z0-9\s-]/g, '');
            // Remove Date.now() to create deterministic IDs - same chart always gets same ID
            const chartId = `${safeArtist}-${safeTitle}`.replace(/\s+/g, '-');
            const extractPath = path.join(this.chartsPath, chartId);
            const chartUriPath = `media://${chartId}`;
            // Create extraction directory
            await fs.mkdir(extractPath, { recursive: true });
            // Use adm-zip's built-in extraction which is more robust.
            try {
                zip.extractAllTo(extractPath, /*overwrite*/ true);
            }
            catch (extractError) {
                console.error(`[ChartImportService] Error during adm-zip extraction:`, extractError);
                throw extractError; // Re-throw the error to be caught by the outer try-catch
            }
            // Verify extraction
            const extractedFiles = await fs.readdir(extractPath);
            if (extractedFiles.length === 0) {
                throw new Error('Extraction failed - no files found');
            }
            // Process difficulties
            const difficulties = [];
            for (const osuFile of osuFiles) {
                const content = osuFile.getData().toString('utf8');
                const parsed = decoder.decodeFromString(content);
                difficulties.push({
                    name: parsed.metadata.version,
                    version: parsed.metadata.version,
                    overallDifficulty: parsed.difficulty.overallDifficulty,
                    approachRate: parsed.difficulty.approachRate,
                    circleSize: parsed.difficulty.circleSize,
                    hpDrainRate: parsed.difficulty.drainRate,
                    filePath: `media://${chartId}/${osuFile.entryName}`,
                    noteCount: parsed.hitObjects.length
                });
            }
            // 정확한 비디오 파일 찾기 - .osu 파일에 명시된 것을 우선 사용
            let videoFile;
            // 1. 먼저 .osu 파일에 명시된 비디오가 있는지 찾기
            if (specifiedVideoFile) {
                videoFile = extractedFiles.find(f => f === specifiedVideoFile);
                if (videoFile) {
                    logger_1.logger.info(`[ChartImportService] Using specified video file: ${videoFile}`);
                }
                else {
                    logger_1.logger.warn(`[ChartImportService] Specified video "${specifiedVideoFile}" not found in archive!`);
                }
            }
            // 2. 명시된 비디오가 없거나 찾지 못했다면 추측 방식 사용 (Fallback)
            if (!videoFile) {
                const videoExtensions = ['.mp4', '.avi', '.flv', '.mov', '.webm'];
                videoFile = extractedFiles.find(file => videoExtensions.includes(path.extname(file).toLowerCase()));
                if (videoFile) {
                    logger_1.logger.info(`[ChartImportService] Found video file by extension: ${videoFile}`);
                }
            }
            // 3. Handle video files (conversion disabled for now)
            let finalVideoUri = undefined;
            if (videoFile) {
                const originalVideoPath = path.join(extractPath, videoFile);
                // TODO: Re-enable video conversion when VideoConverter is implemented
                // const mp4VideoPath = await VideoConverter.ensureMp4(originalVideoPath);
                // For now, use the original video file directly
                const relativeVideoPath = path.relative(extractPath, originalVideoPath);
                finalVideoUri = `media://${chartId}/${relativeVideoPath}`;
                logger_1.logger.info(`[ChartImportService] Video ready for use: ${finalVideoUri}`);
            }
            const oszChart = {
                id: chartId,
                title: beatmap.metadata.title,
                artist: beatmap.metadata.artist,
                creator: beatmap.metadata.creator,
                audioFilename: `media://${chartId}/${beatmap.general.audioFilename}`,
                backgroundFilename: beatmap.events?.backgroundPath ? `media://${chartId}/${beatmap.events.backgroundPath}` : undefined,
                difficulties,
                folderPath: chartUriPath, // Now a URI
                videoPath: finalVideoUri,
                mode: beatmap.mode, // 0: osu!, 1: Taiko, 2: Catch, 3: Mania
            };
            // Add to library
            await this.addToLibrary(oszChart);
            return oszChart;
        }
        catch (error) {
            console.error(`[ChartImportService] Failed to import OSZ file:`, error);
            return null; // Return null on failure
        }
        finally {
            // Release the lock
            this.importingCharts.delete(filePath);
        }
    }
    /**
     * Convert OSZ difficulty to PinChart
     */
    async convertDifficultyToPinChart(oszChart, difficultyIndex) {
        if (!oszChart.difficulties[difficultyIndex]) {
            throw new Error('Difficulty not found');
        }
        const difficulty = oszChart.difficulties[difficultyIndex];
        if (!difficulty.filePath) {
            throw new Error('Difficulty file path is missing');
        }
        // URI-encoded paths must be decoded before resolving to a file system path.
        const decodedPath = decodeURIComponent(difficulty.filePath);
        const parsed = await this.parseDifficulty(PathService_1.pathService.resolve(decodedPath));
        const pinChart = {
            folderPath: PathService_1.pathService.getAssetUrl(oszChart.folderPath), // Convert to file:// URL
            id: `${oszChart.id}-${difficultyIndex}`,
            title: oszChart.title,
            artist: oszChart.artist,
            creator: oszChart.creator,
            audioFilename: PathService_1.pathService.getAssetUrl(oszChart.audioFilename), // Convert to file:// URL
            backgroundPath: oszChart.backgroundFilename ? PathService_1.pathService.getAssetUrl(oszChart.backgroundFilename) : undefined,
            videoPath: oszChart.videoPath ? PathService_1.pathService.getAssetUrl(oszChart.videoPath) : undefined,
            bpm: parsed.bpm,
            notes: parsed.notes.map((n) => ({
                time: n.startTime,
                type: 'pin',
                isHit: false
            })),
            gameMode: (parsed.mode === 0) ? 'osu' : 'pin', // Convert numeric mode to string
            metadata: {
                version: difficulty.version,
                overallDifficulty: difficulty.overallDifficulty,
                approachRate: difficulty.approachRate,
                circleSize: difficulty.circleSize,
                hpDrainRate: difficulty.hpDrainRate,
                noteCount: difficulty.noteCount,
            },
        };
        return pinChart;
    }
    /**
     * Get chart library
     */
    async getLibrary() {
        try {
            const data = await fs.readFile(this.libraryPath, 'utf8');
            return JSON.parse(data);
        }
        catch {
            return [];
        }
    }
    /**
     * Add chart to library
     */
    async _acquireLock(timeout = 5000) {
        const startTime = Date.now();
        while (fsSync.existsSync(this.lockfilePath)) {
            if (Date.now() - startTime > timeout) {
                throw new Error('Failed to acquire lock on library.json');
            }
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        await fs.writeFile(this.lockfilePath, '');
    }
    async _releaseLock() {
        try {
            await fs.unlink(this.lockfilePath);
        }
        catch (error) {
            // Ignore if lockfile doesn't exist
        }
    }
    async addToLibrary(chart) {
        await this._acquireLock();
        try {
            const library = await this.getLibrary();
            // Remove existing chart with same ID
            const existingIndex = library.findIndex(c => c.id === chart.id);
            if (existingIndex >= 0) {
                library[existingIndex] = chart;
            }
            else {
                library.push(chart);
            }
            await fs.writeFile(this.libraryPath, JSON.stringify(library, null, 2));
        }
        finally {
            await this._releaseLock();
        }
    }
    /**
     * Legacy import method - keeping for compatibility
     */
    async importOszFile_legacy(oszPath) {
        try {
            // 차트 폴더 생성
            await fs.mkdir(this.chartsPath, { recursive: true });
            // .osz 파일 압축 해제
            const zip = new adm_zip_1.default(oszPath);
            const entries = zip.getEntries();
            // 고유 ID 생성 (파일명 기반)
            const chartId = path.basename(oszPath, '.osz').replace(/[^a-zA-Z0-9]/g, '_');
            const chartFolder = path.join(this.chartsPath, chartId);
            // 차트 폴더 생성
            await fs.mkdir(chartFolder, { recursive: true });
            // 압축 해제
            zip.extractAllTo(chartFolder, true);
            // .osu 파일들 찾기
            const osuFiles = entries.filter(entry => entry.entryName.endsWith('.osu'));
            if (osuFiles.length === 0) {
                throw new Error('No .osu files found in the archive');
            }
            // 첫 번째 .osu 파일에서 메타데이터 추출
            const firstOsuPath = path.join(chartFolder, osuFiles[0].entryName);
            const firstOsuContent = await fs.readFile(firstOsuPath, 'utf-8');
            // 메타데이터 파싱
            const metadata = this.parseOsuMetadata(firstOsuContent);
            // 난이도별 정보 수집
            const difficulties = [];
            for (const osuFile of osuFiles) {
                const osuPath = path.join(chartFolder, osuFile.entryName);
                const osuContent = await fs.readFile(osuPath, 'utf-8');
                const difficultyMetadata = this.parseOsuMetadata(osuContent);
                difficulties.push({
                    name: difficultyMetadata.version,
                    filePath: osuPath,
                    noteCount: this.countNotes(osuContent),
                });
            }
            // 라이브러리에 추가
            const oszChart = {
                id: chartId,
                title: metadata.title,
                artist: metadata.artist,
                creator: metadata.creator,
                audioFilename: metadata.audioFilename,
                backgroundFilename: metadata.backgroundFilename,
                difficulties: difficulties.map(d => ({
                    name: d.name,
                    version: d.name,
                    overallDifficulty: 5,
                    approachRate: 5,
                    circleSize: 5,
                    hpDrainRate: 5,
                    filePath: d.filePath,
                    noteCount: d.noteCount
                })),
                folderPath: chartFolder,
                mode: 0, // Default to osu! mode for legacy imports
            };
            await this.addToLibrary(oszChart);
            console.log(`Successfully imported chart: ${metadata.title} by ${metadata.artist}`);
        }
        catch (error) {
            console.error('Failed to import OSZ file:', error);
            throw error;
        }
    }
    /**
     * 기존 차트 라이브러리 로드
     */
    async getLibrarySync() {
        try {
            const libraryContent = await fs.readFile(this.libraryPath, 'utf-8');
            return JSON.parse(libraryContent);
        }
        catch (error) {
            return [];
        }
    }
    /**
     * 차트 ID로 차트 찾기
     */
    getChartById(chartId) {
        // This should be async but keeping sync for compatibility
        try {
            const libraryContent = fsSync.readFileSync(this.libraryPath, 'utf-8');
            const library = JSON.parse(libraryContent);
            return library.find(chart => chart.id === chartId);
        }
        catch {
            return undefined;
        }
    }
    /**
     * .osu 파일 파싱하여 난이도 정보 추출
     */
    async parseDifficulty(filePath) {
        // Decode URL-encoded path before reading file
        const decodedFilePath = decodeURIComponent(filePath);
        // --- START: CRITICAL DEBUGGING LOG ---
        console.log(`[Final Check] Attempting to open file at: "${decodedFilePath}"`);
        console.log(`[Final Check] Original path was: "${filePath}"`);
        // --- END: CRITICAL DEBUGGING LOG ---
        try {
            const osuContent = await fs.readFile(decodedFilePath, 'utf-8');
            const decoder = new osu_parsers_1.BeatmapDecoder();
            const beatmap = decoder.decodeFromString(osuContent);
            // Find the most common BPM
            const bpmModes = beatmap.controlPoints.timingPoints.map((tp) => tp.bpm);
            const bpm = bpmModes.length > 0 ? bpmModes.sort((a, b) => bpmModes.filter((v) => v === a).length - bpmModes.filter((v) => v === b).length).pop() : undefined;
            return {
                bpm,
                notes: beatmap.hitObjects.map(ho => ({ startTime: ho.startTime })),
                mode: beatmap.mode
            };
        }
        catch (error) {
            // --- START: CRITICAL DEBUGGING LOG ---
            console.error(`[Final Check] FAILED to open file. Error:`, error);
            console.error(`[Final Check] Failed path was: "${decodedFilePath}"`);
            // --- END: CRITICAL DEBUGGING LOG ---
            throw error;
        }
    }
    async removeFromLibrary(chartId, removeFolder = true) {
        await this._acquireLock();
        try {
            const library = await this.getLibrary();
            const initialLength = library.length;
            const filteredLibrary = library.filter(chart => chart.id !== chartId);
            if (filteredLibrary.length === initialLength) {
                return false; // Chart not found
            }
            await fs.writeFile(this.libraryPath, JSON.stringify(filteredLibrary, null, 2));
            if (removeFolder) {
                // Also remove the chart folder
                const chartPath = path.join(this.chartsPath, chartId);
                try {
                    await fs.rm(chartPath, { recursive: true, force: true });
                }
                catch (error) {
                    console.warn(`Failed to remove chart folder: ${chartPath}`, error);
                }
            }
            return true;
        }
        catch (error) {
            console.error('Failed to remove chart from library:', error);
            return false;
        }
        finally {
            await this._releaseLock();
        }
    }
    /**
     * .osu 파일에서 메타데이터 추출
     */
    parseOsuMetadata(osuContent) {
        const lines = osuContent.split('\n');
        const metadata = {};
        let currentSection = '';
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
                currentSection = trimmed.slice(1, -1);
                continue;
            }
            if (currentSection === 'Metadata') {
                const [key, value] = trimmed.split(':').map(s => s.trim());
                if (key && value) {
                    metadata[key] = value;
                }
            }
            if (currentSection === 'General') {
                const [key, value] = trimmed.split(':').map(s => s.trim());
                if (key && value) {
                    metadata[key] = value;
                }
            }
        }
        return {
            title: metadata.Title || 'Unknown',
            artist: metadata.Artist || 'Unknown',
            creator: metadata.Creator || 'Unknown',
            version: metadata.Version || 'Unknown',
            audioFilename: metadata.AudioFilename || '',
            backgroundFilename: metadata.BackgroundFilename || undefined,
        };
    }
    /**
     * .osu 파일에서 노트 개수 세기
     */
    countNotes(osuContent) {
        const lines = osuContent.split('\n');
        let inHitObjects = false;
        let noteCount = 0;
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed === '[HitObjects]') {
                inHitObjects = true;
                continue;
            }
            if (inHitObjects && trimmed.startsWith('[')) {
                break;
            }
            if (inHitObjects && trimmed && !trimmed.startsWith('//')) {
                noteCount++;
            }
        }
        return noteCount;
    }
}
exports.ChartImportService = ChartImportService;
