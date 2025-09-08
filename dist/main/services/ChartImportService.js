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
const adm_zip_1 = __importDefault(require("adm-zip"));
const osu_parsers_1 = require("osu-parsers");
const PathService_1 = require("./PathService");
const VideoConverter_1 = require("./VideoConverter");
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
        const userDataPath = '/Users/user/Library/Application Support/prg';
        this.chartsPath = path.join(userDataPath, 'charts');
        this.libraryPath = path.join(userDataPath, 'library.json');
        this.lockfilePath = path.join(userDataPath, 'library.json.lock');
    }
    static getInstance() {
        if (!ChartImportService.instance) {
            ChartImportService.instance = new ChartImportService();
        }
        return ChartImportService.instance;
    }
    /**
     * UTF-8 인코딩 문제 해결을 위한 텍스트 디코딩 함수
     * BOM 처리 및 다양한 인코딩 지원
     */
    decodeTextContent(buffer) {
        try {
            // BOM 제거 처리
            let content = buffer.toString('utf8');
            if (content.charCodeAt(0) === 0xFEFF) {
                content = content.slice(1);
            }
            return content;
        }
        catch (error) {
            logger_1.logger.warn('[ChartImportService] UTF-8 decoding failed, trying latin1:', error);
            // Fallback to latin1 encoding
            return buffer.toString('latin1');
        }
    }
    /**
     * 파일명 안전화 함수 - 모든 특수문자 처리
     */
    sanitizeFilename(input) {
        return input
            .replace(/[<>:"\/\\|?*]/g, '') // Windows 금지 문자
            .replace(/[^\w\s-]/g, '') // 알파벳, 숫자, 공백, 하이픈만 허용
            .replace(/\s+/g, '-') // 공백을 하이픈으로 변경
            .substring(0, 50); // 길이 제한
    }
    /**
     * 지원되는 모든 미디어 파일 타입 정의
     */
    getSupportedExtensions() {
        return {
            audio: ['.mp3', '.wav', '.ogg', '.flac', '.m4a', '.aac'],
            video: ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv', '.m4v', '.3gp', '.ogv', '.divx'],
            image: ['.jpg', '.jpeg', '.png', '.bmp', '.gif', '.tiff', '.webp'],
            chart: ['.osu', '.osb'],
            other: ['.txt', '.ini', '.cfg', '.json']
        };
    }
    /**
     * 개별 파일 추출로 완전한 변환 보장
     * AdmZip.extractAllTo() 대신 사용하여 안정성 향상
     */
    async extractAllFilesIndividually(zip, entries, extractPath) {
        const result = {
            totalFiles: entries.length,
            successCount: 0,
            errorCount: 0,
            extractedFiles: [],
            errors: []
        };
        const supportedExts = this.getSupportedExtensions();
        const allSupportedExts = Object.values(supportedExts).flat();
        for (const entry of entries) {
            try {
                // 디렉토리는 건너뛰기
                if (entry.isDirectory) {
                    continue;
                }
                const entryName = entry.entryName;
                const fileExt = path.extname(entryName).toLowerCase();
                // 모든 파일 타입 추출 (확장자 필터링 제거)
                logger_1.logger.info(`[ChartImportService] Extracting: ${entryName} (${fileExt || 'no extension'})`);
                const targetPath = path.join(extractPath, entryName);
                const targetDir = path.dirname(targetPath);
                // 디렉토리 생성
                await fs.mkdir(targetDir, { recursive: true });
                // 파일 데이터 추출
                const fileData = entry.getData();
                if (!fileData || fileData.length === 0) {
                    throw new Error(`Empty file data for ${entryName}`);
                }
                // 파일 작성
                await fs.writeFile(targetPath, fileData);
                // 파일 크기 검증
                const stats = await fs.stat(targetPath);
                if (stats.size !== fileData.length) {
                    throw new Error(`Size mismatch: expected ${fileData.length}, got ${stats.size}`);
                }
                result.successCount++;
                result.extractedFiles.push(entryName);
                logger_1.logger.info(`[ChartImportService] ✓ ${entryName} (${stats.size} bytes)`);
            }
            catch (error) {
                result.errorCount++;
                const errorMsg = error instanceof Error ? error.message : String(error);
                result.errors.push({ filename: entry.entryName, error: errorMsg });
                logger_1.logger.error(`[ChartImportService] ✗ Failed to extract ${entry.entryName}: ${errorMsg}`);
            }
        }
        return result;
    }
    /**
     * 비디오 파일 자동 감지 개선
     */
    findVideoFile(extractedFiles, specifiedVideo) {
        const supportedExts = this.getSupportedExtensions();
        const videoExts = supportedExts.video || [];
        // 1. 명시된 비디오 파일 우선 검색
        if (specifiedVideo) {
            const found = extractedFiles.find(f => f.toLowerCase() === specifiedVideo.toLowerCase());
            if (found) {
                logger_1.logger.info(`[ChartImportService] Found specified video: ${found}`);
                return found;
            }
            logger_1.logger.warn(`[ChartImportService] Specified video "${specifiedVideo}" not found`);
        }
        // 2. 확장자 기반 검색
        const videoFile = extractedFiles.find(file => videoExts.includes(path.extname(file).toLowerCase()));
        if (videoFile) {
            logger_1.logger.info(`[ChartImportService] Found video by extension: ${videoFile}`);
        }
        return videoFile;
    }
    /**
     * .osz 파일을 임포트하고 압축 해제하여 차트 라이브러리에 추가
     * 모든 파일 타입을 하나도 빠짐없이 완전 변환 지원
     */
    async importOszFile(filePath) {
        // First, parse metadata to check if the chart already exists
        const zipForCheck = new adm_zip_1.default(filePath);
        const osuFileForCheck = zipForCheck.getEntries().find(entry => entry.entryName.endsWith('.osu'));
        if (!osuFileForCheck) {
            throw new Error('No .osu files found in the archive for pre-check');
        }
        // UTF-8 인코딩 문제 해결: Buffer 기반 처리
        const firstOsuBuffer = osuFileForCheck.getData();
        const firstOsuContentForCheck = this.decodeTextContent(firstOsuBuffer);
        const decoderForCheck = new osu_parsers_1.BeatmapDecoder();
        const beatmapForCheck = decoderForCheck.decodeFromString(firstOsuContentForCheck);
        const library = await this.getLibrary();
        const existingChart = library.find(c => c.title === beatmapForCheck.metadata.title &&
            c.artist === beatmapForCheck.metadata.artist);
        // Lock to prevent duplicate imports
        if (this.importingCharts.has(filePath)) {
            logger_1.logger.info(`[ChartImportService] Import for ${filePath} is already in progress. Skipping.`);
            return null;
        }
        this.importingCharts.add(filePath);
        try {
            if (existingChart) {
                try {
                    const realPath = existingChart.folderPath.replace('media://', '');
                    const fullPath = path.join(this.chartsPath, realPath);
                    await fs.access(fullPath);
                    return existingChart;
                }
                catch (error) {
                    logger_1.logger.warn(`[ChartImportService] Chart "${existingChart.title}" folder missing. Re-importing...`);
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
            // Parse first .osu file for metadata with proper encoding
            const firstOsuBuffer = osuFiles[0].getData();
            const firstOsuContent = this.decodeTextContent(firstOsuBuffer);
            const decoder = new osu_parsers_1.BeatmapDecoder();
            const beatmap = decoder.decodeFromString(firstOsuContent);
            if (!beatmap || !beatmap.metadata) {
                throw new Error('Invalid beatmap metadata');
            }
            // Create safe and deterministic chart ID
            const safeArtist = this.sanitizeFilename(beatmap.metadata.artist);
            const safeTitle = this.sanitizeFilename(beatmap.metadata.title);
            const chartId = `${safeArtist}-${safeTitle}`;
            const extractPath = path.join(this.chartsPath, chartId);
            const chartUriPath = `media://${chartId}`;
            // Create extraction directory
            await fs.mkdir(extractPath, { recursive: true });
            // 개별 파일 추출로 완전한 변환 보장
            const extractionResults = await this.extractAllFilesIndividually(zip, entries, extractPath);
            if (extractionResults.totalFiles === 0) {
                throw new Error('Extraction failed - no files were extracted');
            }
            logger_1.logger.info(`[ChartImportService] Successfully extracted ${extractionResults.totalFiles} files (${extractionResults.successCount} success, ${extractionResults.errorCount} errors)`);
            // Verify critical files exist
            const extractedFiles = await fs.readdir(extractPath);
            if (extractedFiles.length === 0) {
                throw new Error('Extraction verification failed - directory is empty');
            }
            // Process difficulties with proper encoding
            const difficulties = [];
            for (const osuFile of osuFiles) {
                const buffer = osuFile.getData();
                const content = this.decodeTextContent(buffer);
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
            // 비디오 파일 찾기 개선
            let specifiedVideoFile;
            try {
                // Events 섹션에서 비디오 정보 추출
                const eventsString = JSON.stringify(beatmap.events || {});
                const videoMatch = eventsString.match(/([^,\s"']+\.(mp4|avi|flv|mov|webm|mkv))/i);
                if (videoMatch) {
                    specifiedVideoFile = videoMatch[1];
                }
            }
            catch (error) {
                logger_1.logger.warn('[ChartImportService] Failed to parse video from events:', error);
            }
            const videoFile = this.findVideoFile(extractedFiles, specifiedVideoFile);
            let finalVideoUri;
            if (videoFile) {
                const videoPath = path.join(extractPath, videoFile);
                const videoExt = path.extname(videoFile).toLowerCase();
                if (VideoConverter_1.VideoConverter.isSupportedVideoFormat(videoFile)) {
                    // Try to convert video to MP4 if it's not already MP4
                    if (videoExt !== '.mp4') {
                        logger_1.logger.info(`[ChartImportService] Converting video ${videoExt} to MP4: ${videoFile}`);
                        const mp4Path = path.join(extractPath, path.parse(videoFile).name + '.mp4');
                        const convertSuccess = await VideoConverter_1.VideoConverter.convertToMp4(videoPath, mp4Path);
                        if (convertSuccess) {
                            // Use the converted MP4 file
                            const mp4Filename = path.parse(videoFile).name + '.mp4';
                            finalVideoUri = `media://${chartId}/${mp4Filename}`;
                            logger_1.logger.info(`[ChartImportService] ✓ Video converted to MP4: ${mp4Filename}`);
                        }
                        else {
                            // Fallback to original file if conversion failed
                            finalVideoUri = `media://${chartId}/${videoFile}`;
                            logger_1.logger.warn(`[ChartImportService] ⚠ Video conversion failed, using original: ${videoFile}`);
                        }
                    }
                    else {
                        // Already MP4, use as-is
                        finalVideoUri = `media://${chartId}/${videoFile}`;
                        logger_1.logger.info(`[ChartImportService] ✓ Video already in MP4 format: ${videoFile}`);
                    }
                }
                else {
                    logger_1.logger.warn(`[ChartImportService] ⚠ Unsupported video format: ${videoExt} for ${videoFile}`);
                    finalVideoUri = `media://${chartId}/${videoFile}`;
                }
            }
            // 오디오 파일 검증
            const audioFilename = beatmap.general.audioFilename;
            const audioExists = extractedFiles.includes(audioFilename);
            if (!audioExists) {
                logger_1.logger.warn(`[ChartImportService] Audio file "${audioFilename}" not found in extracted files!`);
            }
            // 배경 이미지 검증
            const backgroundFilename = beatmap.events?.backgroundPath;
            const backgroundExists = backgroundFilename ? extractedFiles.includes(backgroundFilename) : false;
            if (backgroundFilename && !backgroundExists) {
                logger_1.logger.warn(`[ChartImportService] Background image "${backgroundFilename}" not found in extracted files!`);
            }
            const oszChart = {
                id: chartId,
                title: beatmap.metadata.title,
                artist: beatmap.metadata.artist,
                creator: beatmap.metadata.creator,
                audioFilename: `media://${chartId}/${audioFilename}`,
                backgroundFilename: backgroundFilename ? `media://${chartId}/${backgroundFilename}` : undefined,
                difficulties,
                folderPath: chartUriPath,
                videoPath: finalVideoUri,
                mode: beatmap.mode,
            };
            // Add to library
            await this.addToLibrary(oszChart);
            // 로그 요약
            logger_1.logger.info(`[ChartImportService] 🎵 Import completed: "${oszChart.title}" by ${oszChart.artist}`);
            logger_1.logger.info(`[ChartImportService] 📊 Files: ${extractionResults.successCount}/${extractionResults.totalFiles} extracted successfully`);
            logger_1.logger.info(`[ChartImportService] 🎮 Difficulties: ${difficulties.length}`);
            logger_1.logger.info(`[ChartImportService] 🎬 Video: ${finalVideoUri ? '✓' : '✗'}`);
            return oszChart;
        }
        catch (error) {
            logger_1.logger.error(`[ChartImportService] Failed to import OSZ file:`, error);
            return null;
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
        logger_1.logger.info(`[ChartImportService] Parsing difficulty file: "${PathService_1.pathService.resolve(decodedPath)}"`);
        // 🎯 CRITICAL FIX: Only support osu! Standard (mode 0)
        if (parsed.mode !== 0) {
            logger_1.logger.warn(`[ChartImportService] Unsupported game mode (${parsed.mode}) for chart: ${oszChart.title}. Only osu! Standard (mode 0) is supported.`);
            return null; // Return null for unsupported modes
        }
        logger_1.logger.info(`[ChartImportService] Chart validated - osu! Standard mode detected`);
        const pinChart = {
            folderPath: PathService_1.pathService.getAssetUrl(oszChart.folderPath),
            id: `${oszChart.id}-${difficultyIndex}`,
            title: oszChart.title,
            artist: oszChart.artist,
            creator: oszChart.creator,
            audioFilename: PathService_1.pathService.getAssetUrl(oszChart.audioFilename),
            backgroundPath: oszChart.backgroundFilename ? PathService_1.pathService.getAssetUrl(oszChart.backgroundFilename) : undefined,
            videoPath: oszChart.videoPath ? PathService_1.pathService.getAssetUrl(oszChart.videoPath) : undefined,
            bpm: parsed.bpm,
            notes: parsed.notes.map((n) => ({
                time: n.startTime,
                type: 'pin',
                isHit: false
            })),
            gameMode: 'pin', // Always pin mode for supported charts
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
     * Lock management for library operations
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
    /**
     * Add chart to library
     */
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
     * Remove chart from library
     */
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
                    logger_1.logger.warn(`Failed to remove chart folder: ${chartPath}`, error);
                }
            }
            return true;
        }
        catch (error) {
            logger_1.logger.error('Failed to remove chart from library:', error);
            return false;
        }
        finally {
            await this._releaseLock();
        }
    }
    /**
     * Parse .osu difficulty file with proper UTF-8 handling
     */
    async parseDifficulty(filePath) {
        // Decode URL-encoded path before reading file
        const decodedFilePath = decodeURIComponent(filePath);
        logger_1.logger.info(`[ChartImportService] Parsing difficulty file: "${decodedFilePath}"`);
        try {
            const buffer = await fs.readFile(decodedFilePath);
            const osuContent = this.decodeTextContent(buffer);
            const decoder = new osu_parsers_1.BeatmapDecoder();
            const beatmap = decoder.decodeFromString(osuContent);
            // Find the most common BPM
            const timingPoints = beatmap.controlPoints.timingPoints || [];
            const bpmModes = timingPoints.map((tp) => tp.bpm);
            const bpm = bpmModes.length > 0 ?
                bpmModes.sort((a, b) => bpmModes.filter((v) => v === a).length -
                    bpmModes.filter((v) => v === b).length).pop() : undefined;
            return {
                bpm,
                notes: beatmap.hitObjects.map((ho) => ({ startTime: ho.startTime })),
                mode: beatmap.mode
            };
        }
        catch (error) {
            logger_1.logger.error(`[ChartImportService] FAILED to parse difficulty file: "${decodedFilePath}"`, error);
            throw error;
        }
    }
    /**
     * Utility methods for compatibility
     */
    async getLibrarySync() {
        return this.getLibrary();
    }
    getChartById(chartId) {
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
     * Development utility methods
     */
    async clearChartsDirectoryAndLibrary() {
        try {
            logger_1.logger.warn('[ChartImportService] Clearing charts directory and resetting library (dev mode).');
            await fs.rm(this.chartsPath, { recursive: true, force: true });
            await fs.mkdir(this.chartsPath, { recursive: true });
            await fs.writeFile(this.libraryPath, JSON.stringify([], null, 2));
        }
        catch (err) {
            logger_1.logger.error('[ChartImportService] Failed to clear charts directory:', err);
            throw err;
        }
    }
    async normalizeLibrary() {
        try {
            const library = await this.getLibrary();
            if (library.length === 0)
                return;
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
                if (!items || items.length <= 1) {
                    if (items?.[0])
                        toKeepIds.add(items[0].id);
                    continue;
                }
                // Check folder existence
                const withExistence = await Promise.all(items.map(async (it) => {
                    try {
                        const realPath = it.folderPath.replace('media://', '');
                        const fullPath = path.join(this.chartsPath, realPath);
                        await fs.access(fullPath);
                        return { it, exists: true };
                    }
                    catch {
                        return { it, exists: false };
                    }
                }));
                const existing = withExistence.filter(x => x.exists).map(x => x.it);
                const candidates = existing.length > 0 ? existing : items;
                // Choose newest by timestamp in id
                const parseTs = (id) => {
                    const m = id.match(/-(\d{10,})$/);
                    return m ? Number(m[1]) : 0;
                };
                let winner = candidates[0];
                for (const c of candidates) {
                    if (parseTs(c.id) > parseTs(winner.id))
                        winner = c;
                }
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
                logger_1.logger.info(`[ChartImportService] normalizeLibrary: removed ${toRemoveIds.length} duplicate entries.`);
            }
            if (!changed) {
                logger_1.logger.info('[ChartImportService] normalizeLibrary: no duplicates found.');
            }
        }
        catch (err) {
            logger_1.logger.warn('[ChartImportService] normalizeLibrary failed:', err);
        }
    }
    /**
     * Legacy import method - keeping for compatibility
     */
    async importOszFile_legacy(oszPath) {
        logger_1.logger.info('[ChartImportService] Using legacy import method');
        const result = await this.importOszFile(oszPath);
        if (!result) {
            throw new Error('Legacy import failed');
        }
    }
    /**
     * Legacy metadata parsing - keeping for compatibility
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
            if (currentSection === 'Metadata' || currentSection === 'General') {
                const colonIndex = trimmed.indexOf(':');
                if (colonIndex > 0) {
                    const key = trimmed.substring(0, colonIndex).trim();
                    const value = trimmed.substring(colonIndex + 1).trim();
                    if (key && value) {
                        metadata[key] = value;
                    }
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
    /**
     * Import all OSZ files from the public/assets directory
     * @param assetsPath - Path to the public/assets directory
     * @returns Promise<{ imported: number, skipped: number, errors: string[] }>
     */
    async importAllFromDirectory(assetsPath) {
        const result = {
            imported: 0,
            skipped: 0,
            errors: []
        };
        try {
            logger_1.logger.info(`[ChartImportService] Scanning directory: ${assetsPath}`);
            // Get all subdirectories
            const entries = await fs.readdir(assetsPath, { withFileTypes: true });
            const subdirs = entries.filter(entry => entry.isDirectory());
            // Load existing library to check for duplicates
            const existingCharts = await this.getLibrary();
            const existingIds = new Set(existingCharts.map((chart) => chart.id));
            for (const subdir of subdirs) {
                const subdirPath = path.join(assetsPath, subdir.name);
                try {
                    // Look for OSZ files in the subdirectory
                    const subdirEntries = await fs.readdir(subdirPath);
                    const oszFiles = subdirEntries.filter(file => file.toLowerCase().endsWith('.osz'));
                    if (oszFiles.length === 0) {
                        logger_1.logger.info(`[ChartImportService] No OSZ files found in ${subdir.name}`);
                        continue;
                    }
                    for (const oszFile of oszFiles) {
                        const oszPath = path.join(subdirPath, oszFile);
                        try {
                            logger_1.logger.info(`[ChartImportService] Processing ${oszFile}...`);
                            // Try to import the OSZ file
                            const importedChart = await this.importOszFile(oszPath);
                            if (importedChart && existingIds.has(importedChart.id)) {
                                logger_1.logger.info(`[ChartImportService] Skipped duplicate chart: ${importedChart.id}`);
                                result.skipped++;
                            }
                            else if (importedChart) {
                                logger_1.logger.info(`[ChartImportService] ✓ Imported ${importedChart.title} by ${importedChart.artist}`);
                                result.imported++;
                            }
                        }
                        catch (error) {
                            const errorMsg = error instanceof Error ? error.message : String(error);
                            logger_1.logger.error(`[ChartImportService] Failed to import ${oszFile}: ${errorMsg}`);
                            result.errors.push(`${oszFile}: ${errorMsg}`);
                        }
                    }
                }
                catch (error) {
                    const errorMsg = error instanceof Error ? error.message : String(error);
                    logger_1.logger.error(`[ChartImportService] Failed to scan directory ${subdir.name}: ${errorMsg}`);
                    result.errors.push(`Directory ${subdir.name}: ${errorMsg}`);
                }
            }
            logger_1.logger.info(`[ChartImportService] Batch import completed: ${result.imported} imported, ${result.skipped} skipped, ${result.errors.length} errors`);
        }
        catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            logger_1.logger.error(`[ChartImportService] Failed to scan assets directory: ${errorMsg}`);
            result.errors.push(`Directory scan failed: ${errorMsg}`);
        }
        return result;
    }
}
exports.ChartImportService = ChartImportService;
