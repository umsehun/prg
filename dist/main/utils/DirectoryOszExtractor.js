"use strict";
/**
 * DirectoryOszExtractor - 새로운 아키텍처
 * OSZ 파일을 디렉토리로 압축해제하고 .osu 파일을 게임용으로 수정
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DirectoryOszExtractor = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const jszip_1 = __importDefault(require("jszip"));
const osu_parsers_1 = require("osu-parsers");
const logger_1 = require("../../shared/globals/logger");
const MediaConverter_1 = require("../services/MediaConverter");
class DirectoryOszExtractor {
    constructor() {
        Object.defineProperty(this, "decoder", {
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
        this.decoder = new osu_parsers_1.BeatmapDecoder();
        this.mediaConverter = MediaConverter_1.MediaConverter.getInstance();
    }
    /**
     * OSZ 파일을 디렉토리로 압축해제하고 게임용으로 수정
     */
    async extractOsz(oszPath, outputDir) {
        const oszName = (0, path_1.basename)(oszPath, '.osz');
        const chartDir = (0, path_1.join)(outputDir, oszName);
        logger_1.logger.info('directory-extractor', `🎵 Extracting OSZ to directory: ${oszName}`);
        // 1. 디렉토리 생성
        await fs_1.promises.mkdir(chartDir, { recursive: true });
        // 2. OSZ 압축해제
        await this.extractZipToDirectory(oszPath, chartDir);
        // 3. .osu 파일들 수정
        const osuFiles = await this.modifyOsuFiles(chartDir);
        // 4. 미디어 파일 변환
        const { audioFile, videoFile } = await this.convertMediaFiles(chartDir);
        // 5. 메타데이터 추출 (첫 번째 .osu 파일 사용)
        if (osuFiles.length === 0) {
            throw new Error('No .osu files found in OSZ');
        }
        const firstOsuFile = osuFiles[0];
        if (!firstOsuFile) {
            throw new Error('No valid .osu file found');
        }
        const metadata = await this.extractMetadata(chartDir, firstOsuFile);
        logger_1.logger.info('directory-extractor', `✅ Successfully extracted: ${metadata.title} by ${metadata.artist}`);
        return {
            id: oszName,
            ...metadata,
            osuFiles,
            audioFile: audioFile || null,
            videoFile: videoFile || null,
            filePath: chartDir
        };
    }
    /**
     * ZIP 파일을 디렉토리로 압축해제
     */
    async extractZipToDirectory(zipPath, outputDir) {
        const data = await fs_1.promises.readFile(zipPath);
        const zip = await jszip_1.default.loadAsync(data);
        const files = Object.keys(zip.files);
        for (const filename of files) {
            const file = zip.files[filename];
            if (!file || file.dir)
                continue; // 디렉토리는 스킵
            const content = await file.async('nodebuffer');
            const outputPath = (0, path_1.join)(outputDir, filename);
            // 하위 디렉토리가 있다면 생성
            const dir = (0, path_1.join)(outputPath, '..');
            await fs_1.promises.mkdir(dir, { recursive: true });
            await fs_1.promises.writeFile(outputPath, content);
            logger_1.logger.debug('directory-extractor', `📄 Extracted file: ${filename}`);
        }
    }
    /**
     * .osu 파일들을 찾아서 게임용으로 수정 (x,y 제거)
     */
    async modifyOsuFiles(chartDir) {
        const files = await fs_1.promises.readdir(chartDir);
        const osuFiles = files.filter(file => file.endsWith('.osu'));
        logger_1.logger.info('directory-extractor', `🔧 Modifying ${osuFiles.length} .osu files`);
        for (const osuFile of osuFiles) {
            const filePath = (0, path_1.join)(chartDir, osuFile);
            await this.modifyOsuFile(filePath);
        }
        return osuFiles;
    }
    /**
     * .osu 파일의 [HitObjects] 섹션에서 x,y 좌표 제거
     * 예: 256,192,1000,1,0 → 1000,1,0
     */
    async modifyOsuFile(filePath) {
        const content = await fs_1.promises.readFile(filePath, 'utf-8');
        const lines = content.split('\n');
        let inHitObjects = false;
        const modifiedLines = [];
        for (const line of lines) {
            const trimmed = line.trim();
            // [HitObjects] 섹션 시작
            if (trimmed === '[HitObjects]') {
                inHitObjects = true;
                modifiedLines.push(line);
                continue;
            }
            // 다른 섹션 시작 (HitObjects 종료)
            if (trimmed.startsWith('[') && trimmed !== '[HitObjects]') {
                inHitObjects = false;
            }
            // HitObjects 섹션 내에서 좌표 제거
            if (inHitObjects && trimmed && !trimmed.startsWith('//')) {
                const parts = trimmed.split(',');
                if (parts.length >= 5) {
                    // x,y 제거하고 time부터 시작
                    // 원본: x,y,time,type,hitSound,...
                    // 수정: time,type,hitSound,...
                    const modifiedParts = parts.slice(2); // x,y 제거
                    modifiedLines.push(modifiedParts.join(','));
                }
                else {
                    modifiedLines.push(line);
                }
            }
            else {
                modifiedLines.push(line);
            }
        }
        await fs_1.promises.writeFile(filePath, modifiedLines.join('\n'), 'utf-8');
        logger_1.logger.debug('directory-extractor', `✂️ Modified .osu file: ${(0, path_1.basename)(filePath)}`);
    }
    /**
     * 미디어 파일들 변환 (MP3, MP4)
     */
    async convertMediaFiles(chartDir) {
        const files = await fs_1.promises.readdir(chartDir);
        let audioFile = null;
        let videoFile = null;
        for (const file of files) {
            const filePath = (0, path_1.join)(chartDir, file);
            const ext = (0, path_1.extname)(file).toLowerCase();
            // 오디오 파일 변환
            if (['.ogg', '.wav', '.flac'].includes(ext)) {
                logger_1.logger.info('directory-extractor', `🎵 Converting audio: ${file}`);
                await this.mediaConverter.ensureMp3(filePath, chartDir);
                audioFile = file.replace(ext, '.mp3');
            }
            // 이미 MP3인 경우
            else if (ext === '.mp3') {
                audioFile = file;
            }
            // 비디오 파일 변환  
            if (['.avi', '.flv', '.wmv', '.mov'].includes(ext)) {
                logger_1.logger.info('directory-extractor', `🎬 Converting video: ${file}`);
                await this.mediaConverter.ensureMp4(filePath, chartDir);
                videoFile = file.replace(ext, '.mp4');
            }
            // 이미 MP4인 경우
            else if (ext === '.mp4') {
                videoFile = file;
            }
        }
        return {
            audioFile: audioFile || null,
            videoFile: videoFile || null
        };
    }
    /**
     * 첫 번째 .osu 파일에서 메타데이터 추출
     */
    async extractMetadata(chartDir, osuFile) {
        const osuPath = (0, path_1.join)(chartDir, osuFile);
        const content = await fs_1.promises.readFile(osuPath, 'utf-8');
        try {
            const beatmap = this.decoder.decodeFromString(content);
            return {
                title: beatmap.metadata.title || 'Unknown Title',
                artist: beatmap.metadata.artist || 'Unknown Artist',
                creator: beatmap.metadata.creator || 'Unknown Creator',
                bpm: this.calculateBPM(beatmap),
                duration: this.calculateDuration(beatmap),
                backgroundFile: this.findBackgroundFile(beatmap) || null
            };
        }
        catch (error) {
            logger_1.logger.warn('directory-extractor', `Failed to parse .osu file: ${error}`);
            return {
                title: 'Unknown Title',
                artist: 'Unknown Artist',
                creator: 'Unknown Creator',
                bpm: 120,
                duration: 180000
            };
        }
    }
    calculateBPM(beatmap) {
        const timingPoints = beatmap.controlPoints.timingPoints;
        if (timingPoints.length === 0)
            return 120;
        // 첫 번째 타이밍 포인트에서 BPM 계산
        const firstTiming = timingPoints[0];
        if (!firstTiming)
            return 120;
        return Math.round(60000 / firstTiming.beatLength);
    }
    calculateDuration(beatmap) {
        if (beatmap.hitObjects.length === 0)
            return 180000;
        const lastObject = beatmap.hitObjects[beatmap.hitObjects.length - 1];
        if (!lastObject)
            return 180000;
        return lastObject.startTime + 5000; // 5초 여유
    }
    findBackgroundFile(beatmap) {
        // Events에서 배경 이미지 찾기 (간단한 방법 사용)
        try {
            const eventsString = beatmap.events.toString();
            const match = eventsString.match(/["']([^"']*\.(jpg|png))["']/i);
            if (match)
                return match[1];
        }
        catch (error) {
            logger_1.logger.debug('directory-extractor', `Failed to parse events: ${error}`);
        }
        return undefined;
    }
}
exports.DirectoryOszExtractor = DirectoryOszExtractor;
