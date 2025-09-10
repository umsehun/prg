/**
 * DirectoryOszExtractor - 새로운 아키텍처
 * OSZ 파일을 디렉토리로 압축해제하고 .osu 파일을 게임용으로 수정
 */

import { promises as fs } from 'fs';
import { join, extname, basename } from 'path';
import JSZip from 'jszip';
import { BeatmapDecoder } from 'osu-parsers';
import type { Beatmap } from 'osu-classes';
import { logger } from '../../shared/globals/logger';
import { MediaConverter } from '../services/MediaConverter';

export interface ChartMetadata {
    id: string;
    title: string;
    artist: string;
    creator: string;
    bpm: number;
    duration: number;
    osuFiles: string[];       // 수정된 .osu 파일 목록
    audioFile?: string | null;        // 변환된 오디오 파일
    backgroundFile?: string | null;  // 배경 이미지
    videoFile?: string | null;       // 변환된 비디오 파일
    filePath: string;         // 디렉토리 경로
}

export class DirectoryOszExtractor {
    private decoder: BeatmapDecoder;
    private mediaConverter: MediaConverter;

    constructor() {
        this.decoder = new BeatmapDecoder();
        this.mediaConverter = MediaConverter.getInstance();
    }

    /**
     * OSZ 파일을 디렉토리로 압축해제하고 게임용으로 수정
     */
    async extractOsz(oszPath: string, outputDir: string): Promise<ChartMetadata> {
        const oszName = basename(oszPath, '.osz');
        const chartDir = join(outputDir, oszName);
        
        logger.info('directory-extractor', `🎵 Extracting OSZ to directory: ${oszName}`);
        
        // 1. 디렉토리 생성
        await fs.mkdir(chartDir, { recursive: true });
        
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
        
        logger.info('directory-extractor', `✅ Successfully extracted: ${metadata.title} by ${metadata.artist}`);
        
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
    private async extractZipToDirectory(zipPath: string, outputDir: string): Promise<void> {
        const data = await fs.readFile(zipPath);
        const zip = await JSZip.loadAsync(data);
        
        const files = Object.keys(zip.files);
        for (const filename of files) {
            const file = zip.files[filename];
            if (!file || file.dir) continue; // 디렉토리는 스킵
            
            const content = await file.async('nodebuffer');
            const outputPath = join(outputDir, filename);
            
            // 하위 디렉토리가 있다면 생성
            const dir = join(outputPath, '..');
            await fs.mkdir(dir, { recursive: true });
            
            await fs.writeFile(outputPath, content);
            logger.debug('directory-extractor', `📄 Extracted file: ${filename}`);
        }
    }

    /**
     * .osu 파일들을 찾아서 게임용으로 수정 (x,y 제거)
     */
    private async modifyOsuFiles(chartDir: string): Promise<string[]> {
        const files = await fs.readdir(chartDir);
        const osuFiles = files.filter(file => file.endsWith('.osu'));
        
        logger.info('directory-extractor', `🔧 Modifying ${osuFiles.length} .osu files`);
        
        for (const osuFile of osuFiles) {
            const filePath = join(chartDir, osuFile);
            await this.modifyOsuFile(filePath);
        }
        
        return osuFiles;
    }

    /**
     * .osu 파일의 [HitObjects] 섹션에서 x,y 좌표 제거
     * 예: 256,192,1000,1,0 → 1000,1,0
     */
    private async modifyOsuFile(filePath: string): Promise<void> {
        const content = await fs.readFile(filePath, 'utf-8');
        const lines = content.split('\n');
        
        let inHitObjects = false;
        const modifiedLines: string[] = [];
        
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
                } else {
                    modifiedLines.push(line);
                }
            } else {
                modifiedLines.push(line);
            }
        }
        
        await fs.writeFile(filePath, modifiedLines.join('\n'), 'utf-8');
        logger.debug('directory-extractor', `✂️ Modified .osu file: ${basename(filePath)}`);
    }

    /**
     * 미디어 파일들 변환 (MP3, MP4)
     */
    private async convertMediaFiles(chartDir: string): Promise<{ audioFile: string | null; videoFile: string | null }> {
        const files = await fs.readdir(chartDir);
        let audioFile: string | null = null;
        let videoFile: string | null = null;
        
        for (const file of files) {
            const filePath = join(chartDir, file);
            const ext = extname(file).toLowerCase();
            
            // 오디오 파일 변환
            if (['.ogg', '.wav', '.flac'].includes(ext)) {
                logger.info('directory-extractor', `🎵 Converting audio: ${file}`);
                await this.mediaConverter.ensureMp3(filePath, chartDir);
                audioFile = file.replace(ext, '.mp3');
            }
            // 이미 MP3인 경우
            else if (ext === '.mp3') {
                audioFile = file;
            }
            
            // 비디오 파일 변환  
            if (['.avi', '.flv', '.wmv', '.mov'].includes(ext)) {
                logger.info('directory-extractor', `🎬 Converting video: ${file}`);
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
    private async extractMetadata(chartDir: string, osuFile: string): Promise<Omit<ChartMetadata, 'id' | 'osuFiles' | 'audioFile' | 'videoFile' | 'filePath'>> {
        const osuPath = join(chartDir, osuFile);
        const content = await fs.readFile(osuPath, 'utf-8');
        
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
        } catch (error) {
            logger.warn('directory-extractor', `Failed to parse .osu file: ${error}`);
            return {
                title: 'Unknown Title',
                artist: 'Unknown Artist',
                creator: 'Unknown Creator', 
                bpm: 120,
                duration: 180000
            };
        }
    }

    private calculateBPM(beatmap: Beatmap): number {
        const timingPoints = beatmap.controlPoints.timingPoints;
        if (timingPoints.length === 0) return 120;
        
        // 첫 번째 타이밍 포인트에서 BPM 계산
        const firstTiming = timingPoints[0];
        if (!firstTiming) return 120;
        return Math.round(60000 / firstTiming.beatLength);
    }

    private calculateDuration(beatmap: Beatmap): number {
        if (beatmap.hitObjects.length === 0) return 180000;
        
        const lastObject = beatmap.hitObjects[beatmap.hitObjects.length - 1];
        if (!lastObject) return 180000;
        return lastObject.startTime + 5000; // 5초 여유
    }

    private findBackgroundFile(beatmap: Beatmap): string | undefined {
        // Events에서 배경 이미지 찾기 (간단한 방법 사용)
        try {
            const eventsString = beatmap.events.toString();
            const match = eventsString.match(/["']([^"']*\.(jpg|png))["']/i);
            if (match) return match[1];
        } catch (error) {
            logger.debug('directory-extractor', `Failed to parse events: ${error}`);
        }
        return undefined;
    }
}
