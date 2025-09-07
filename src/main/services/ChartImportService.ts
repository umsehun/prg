// src/main/services/ChartImportService.ts
import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import * as path from 'path';
import { app } from 'electron';
import JSZip from 'jszip';
import AdmZip from 'adm-zip';
import { BeatmapDecoder } from 'osu-parsers';
import { pathService } from './PathService';
import { logger } from '../../shared/logger';
import type { OszChart, PinChart, Note } from '../../shared/types';

export interface OszDifficulty {
  name: string;
  version: string;
  overallDifficulty: number;
  approachRate: number;
  circleSize: number;
  hpDrainRate: number;
  noteCount: number;
  filePath: string;
}

interface ExtractionResult {
  totalFiles: number;
  successCount: number;
  errorCount: number;
  extractedFiles: string[];
  errors: Array<{ filename: string; error: string }>;
}

export class ChartImportService {
  private importingCharts: Set<string> = new Set();
  private static instance: ChartImportService;
  private chartsPath: string;
  private libraryPath: string;
  private lockfilePath: string;

  private constructor() {
    const userDataPath = '/Users/user/Library/Application Support/prg';
    this.chartsPath = path.join(userDataPath, 'charts');
    this.libraryPath = path.join(userDataPath, 'library.json');
    this.lockfilePath = path.join(userDataPath, 'library.json.lock');
  }

  public static getInstance(): ChartImportService {
    if (!ChartImportService.instance) {
      ChartImportService.instance = new ChartImportService();
    }
    return ChartImportService.instance;
  }

  /**
   * UTF-8 인코딩 문제 해결을 위한 텍스트 디코딩 함수
   * BOM 처리 및 다양한 인코딩 지원
   */
  private decodeTextContent(buffer: Buffer): string {
    try {
      // BOM 제거 처리
      let content = buffer.toString('utf8');
      if (content.charCodeAt(0) === 0xFEFF) {
        content = content.slice(1);
      }
      return content;
    } catch (error) {
      logger.warn('[ChartImportService] UTF-8 decoding failed, trying latin1:', error);
      // Fallback to latin1 encoding
      return buffer.toString('latin1');
    }
  }

  /**
   * 파일명 안전화 함수 - 모든 특수문자 처리
   */
  private sanitizeFilename(input: string): string {
    return input
      .replace(/[<>:"\/\\|?*]/g, '') // Windows 금지 문자
      .replace(/[^\w\s-]/g, '') // 알파벳, 숫자, 공백, 하이픈만 허용
      .replace(/\s+/g, '-') // 공백을 하이픈으로 변경
      .substring(0, 50); // 길이 제한
  }

  /**
   * 지원되는 모든 미디어 파일 타입 정의
   */
  private getSupportedExtensions(): { [category: string]: string[] } {
    return {
      audio: ['.mp3', '.wav', '.ogg', '.flac', '.m4a', '.aac'],
      video: ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv'],
      image: ['.jpg', '.jpeg', '.png', '.bmp', '.gif', '.tiff', '.webp'],
      chart: ['.osu', '.osb'],
      other: ['.txt', '.ini', '.cfg', '.json']
    };
  }

  /**
   * 개별 파일 추출로 완전한 변환 보장
   * AdmZip.extractAllTo() 대신 사용하여 안정성 향상
   */
  private async extractAllFilesIndividually(
    zip: AdmZip,
    entries: AdmZip.IZipEntry[],
    extractPath: string
  ): Promise<ExtractionResult> {
    const result: ExtractionResult = {
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
        logger.info(`[ChartImportService] Extracting: ${entryName} (${fileExt || 'no extension'})`);

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

        logger.info(`[ChartImportService] ✓ ${entryName} (${stats.size} bytes)`);

      } catch (error) {
        result.errorCount++;
        const errorMsg = error instanceof Error ? error.message : String(error);
        result.errors.push({ filename: entry.entryName, error: errorMsg });
        logger.error(`[ChartImportService] ✗ Failed to extract ${entry.entryName}: ${errorMsg}`);
      }
    }

    return result;
  }

  /**
   * 비디오 파일 자동 감지 개선
   */
  private findVideoFile(extractedFiles: string[], specifiedVideo?: string): string | undefined {
    const supportedExts = this.getSupportedExtensions();
    const videoExts = supportedExts.video || [];

    // 1. 명시된 비디오 파일 우선 검색
    if (specifiedVideo) {
      const found = extractedFiles.find(f =>
        f.toLowerCase() === specifiedVideo.toLowerCase()
      );
      if (found) {
        logger.info(`[ChartImportService] Found specified video: ${found}`);
        return found;
      }
      logger.warn(`[ChartImportService] Specified video "${specifiedVideo}" not found`);
    }

    // 2. 확장자 기반 검색
    const videoFile = extractedFiles.find(file =>
      videoExts.includes(path.extname(file).toLowerCase())
    );

    if (videoFile) {
      logger.info(`[ChartImportService] Found video by extension: ${videoFile}`);
    }

    return videoFile;
  }

  /**
   * .osz 파일을 임포트하고 압축 해제하여 차트 라이브러리에 추가
   * 모든 파일 타입을 하나도 빠짐없이 완전 변환 지원
   */
  public async importOszFile(filePath: string): Promise<OszChart | null> {
    // First, parse metadata to check if the chart already exists
    const zipForCheck = new AdmZip(filePath);
    const osuFileForCheck = zipForCheck.getEntries().find(entry => entry.entryName.endsWith('.osu'));
    if (!osuFileForCheck) {
      throw new Error('No .osu files found in the archive for pre-check');
    }

    // UTF-8 인코딩 문제 해결: Buffer 기반 처리
    const firstOsuBuffer = osuFileForCheck.getData();
    const firstOsuContentForCheck = this.decodeTextContent(firstOsuBuffer);
    const decoderForCheck = new BeatmapDecoder();
    const beatmapForCheck = decoderForCheck.decodeFromString(firstOsuContentForCheck);

    const library = await this.getLibrary();
    const existingChart = library.find(c =>
      c.title === beatmapForCheck.metadata.title &&
      c.artist === beatmapForCheck.metadata.artist
    );

    // Lock to prevent duplicate imports
    if (this.importingCharts.has(filePath)) {
      logger.info(`[ChartImportService] Import for ${filePath} is already in progress. Skipping.`);
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
        } catch (error) {
          logger.warn(`[ChartImportService] Chart "${existingChart.title}" folder missing. Re-importing...`);
          await this.removeFromLibrary(existingChart.id, false);
        }
      }

      // Ensure charts directory exists
      await fs.mkdir(this.chartsPath, { recursive: true });

      const zip = new AdmZip(filePath);
      const entries = zip.getEntries();

      // Extract chart metadata from .osu files
      const osuFiles = entries.filter(entry => entry.entryName.endsWith('.osu'));

      if (osuFiles.length === 0) {
        throw new Error('No .osu files found in the archive');
      }

      // Parse first .osu file for metadata with proper encoding
      const firstOsuBuffer = osuFiles[0]!.getData();
      const firstOsuContent = this.decodeTextContent(firstOsuBuffer);

      const decoder = new BeatmapDecoder();
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

      logger.info(`[ChartImportService] Successfully extracted ${extractionResults.totalFiles} files (${extractionResults.successCount} success, ${extractionResults.errorCount} errors)`);

      // Verify critical files exist
      const extractedFiles = await fs.readdir(extractPath);
      if (extractedFiles.length === 0) {
        throw new Error('Extraction verification failed - directory is empty');
      }

      // Process difficulties with proper encoding
      const difficulties: OszDifficulty[] = [];
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
      let specifiedVideoFile: string | undefined;
      try {
        // Events 섹션에서 비디오 정보 추출
        const eventsString = JSON.stringify(beatmap.events || {});
        const videoMatch = eventsString.match(/([^,\s"']+\.(mp4|avi|flv|mov|webm|mkv))/i);
        if (videoMatch) {
          specifiedVideoFile = videoMatch[1];
        }
      } catch (error) {
        logger.warn('[ChartImportService] Failed to parse video from events:', error);
      }

      const videoFile = this.findVideoFile(extractedFiles, specifiedVideoFile);
      const finalVideoUri = videoFile ? `media://${chartId}/${videoFile}` : undefined;

      // 오디오 파일 검증
      const audioFilename = beatmap.general.audioFilename;
      const audioExists = extractedFiles.includes(audioFilename);
      if (!audioExists) {
        logger.warn(`[ChartImportService] Audio file "${audioFilename}" not found in extracted files!`);
      }

      // 배경 이미지 검증
      const backgroundFilename = beatmap.events?.backgroundPath;
      const backgroundExists = backgroundFilename ? extractedFiles.includes(backgroundFilename) : false;
      if (backgroundFilename && !backgroundExists) {
        logger.warn(`[ChartImportService] Background image "${backgroundFilename}" not found in extracted files!`);
      }

      const oszChart: OszChart = {
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
      logger.info(`[ChartImportService] 🎵 Import completed: "${oszChart.title}" by ${oszChart.artist}`);
      logger.info(`[ChartImportService] 📊 Files: ${extractionResults.successCount}/${extractionResults.totalFiles} extracted successfully`);
      logger.info(`[ChartImportService] 🎮 Difficulties: ${difficulties.length}`);
      logger.info(`[ChartImportService] 🎬 Video: ${finalVideoUri ? '✓' : '✗'}`);

      return oszChart;

    } catch (error) {
      logger.error(`[ChartImportService] Failed to import OSZ file:`, error);
      return null;
    } finally {
      // Release the lock
      this.importingCharts.delete(filePath);
    }
  }

  /**
   * Convert OSZ difficulty to PinChart
   */
  public async convertDifficultyToPinChart(oszChart: OszChart, difficultyIndex: number): Promise<PinChart> {
    if (!oszChart.difficulties[difficultyIndex]) {
      throw new Error('Difficulty not found');
    }

    const difficulty = oszChart.difficulties[difficultyIndex];
    if (!difficulty.filePath) {
      throw new Error('Difficulty file path is missing');
    }

    // URI-encoded paths must be decoded before resolving to a file system path.
    const decodedPath = decodeURIComponent(difficulty.filePath);
    const parsed = await this.parseDifficulty(pathService.resolve(decodedPath));

    const pinChart: PinChart = {
      folderPath: pathService.getAssetUrl(oszChart.folderPath),
      id: `${oszChart.id}-${difficultyIndex}`,
      title: oszChart.title,
      artist: oszChart.artist,
      creator: oszChart.creator,
      audioFilename: pathService.getAssetUrl(oszChart.audioFilename),
      backgroundPath: oszChart.backgroundFilename ? pathService.getAssetUrl(oszChart.backgroundFilename) : undefined,
      videoPath: oszChart.videoPath ? pathService.getAssetUrl(oszChart.videoPath) : undefined,
      bpm: parsed.bpm,
      notes: parsed.notes.map((n: { startTime: number }) => ({
        time: n.startTime,
        type: 'pin' as const,
        isHit: false
      })),
      gameMode: (parsed.mode === 0) ? 'osu' : 'pin',
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
  public async getLibrary(): Promise<OszChart[]> {
    try {
      const data = await fs.readFile(this.libraryPath, 'utf8');
      return JSON.parse(data) as OszChart[];
    } catch {
      return [];
    }
  }

  /**
   * Lock management for library operations
   */
  private async _acquireLock(timeout = 5000): Promise<void> {
    const startTime = Date.now();
    while (fsSync.existsSync(this.lockfilePath)) {
      if (Date.now() - startTime > timeout) {
        throw new Error('Failed to acquire lock on library.json');
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    await fs.writeFile(this.lockfilePath, '');
  }

  private async _releaseLock(): Promise<void> {
    try {
      await fs.unlink(this.lockfilePath);
    } catch (error) {
      // Ignore if lockfile doesn't exist
    }
  }

  /**
   * Add chart to library
   */
  private async addToLibrary(chart: OszChart): Promise<void> {
    await this._acquireLock();
    try {
      const library = await this.getLibrary();

      // Remove existing chart with same ID
      const existingIndex = library.findIndex(c => c.id === chart.id);
      if (existingIndex >= 0) {
        library[existingIndex] = chart;
      } else {
        library.push(chart);
      }

      await fs.writeFile(this.libraryPath, JSON.stringify(library, null, 2));
    } finally {
      await this._releaseLock();
    }
  }

  /**
   * Remove chart from library
   */
  public async removeFromLibrary(chartId: string, removeFolder = true): Promise<boolean> {
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
        } catch (error) {
          logger.warn(`Failed to remove chart folder: ${chartPath}`, error);
        }
      }

      return true;
    } catch (error) {
      logger.error('Failed to remove chart from library:', error);
      return false;
    } finally {
      await this._releaseLock();
    }
  }

  /**
   * Parse .osu difficulty file with proper UTF-8 handling
   */
  public async parseDifficulty(filePath: string): Promise<{ bpm: number | undefined; notes: { startTime: number }[], mode: number }> {
    // Decode URL-encoded path before reading file
    const decodedFilePath = decodeURIComponent(filePath);

    logger.info(`[ChartImportService] Parsing difficulty file: "${decodedFilePath}"`);

    try {
      const buffer = await fs.readFile(decodedFilePath);
      const osuContent = this.decodeTextContent(buffer);
      const decoder = new BeatmapDecoder();
      const beatmap = decoder.decodeFromString(osuContent);

      // Find the most common BPM
      const timingPoints = beatmap.controlPoints.timingPoints || [];
      const bpmModes = timingPoints.map((tp: { bpm: number }) => tp.bpm);
      const bpm = bpmModes.length > 0 ?
        bpmModes.sort((a: number, b: number) =>
          bpmModes.filter((v: number) => v === a).length -
          bpmModes.filter((v: number) => v === b).length
        ).pop() : undefined;

      return {
        bpm,
        notes: beatmap.hitObjects.map((ho: { startTime: number }) => ({ startTime: ho.startTime })),
        mode: beatmap.mode
      };
    } catch (error) {
      logger.error(`[ChartImportService] FAILED to parse difficulty file: "${decodedFilePath}"`, error);
      throw error;
    }
  }

  /**
   * Utility methods for compatibility
   */
  public async getLibrarySync(): Promise<OszChart[]> {
    return this.getLibrary();
  }

  public getChartById(chartId: string): OszChart | undefined {
    try {
      const libraryContent = fsSync.readFileSync(this.libraryPath, 'utf-8');
      const library: OszChart[] = JSON.parse(libraryContent);
      return library.find(chart => chart.id === chartId);
    } catch {
      return undefined;
    }
  }

  /**
   * Development utility methods
   */
  public async clearChartsDirectoryAndLibrary(): Promise<void> {
    try {
      logger.warn('[ChartImportService] Clearing charts directory and resetting library (dev mode).');
      await fs.rm(this.chartsPath, { recursive: true, force: true });
      await fs.mkdir(this.chartsPath, { recursive: true });
      await fs.writeFile(this.libraryPath, JSON.stringify([], null, 2));
    } catch (err) {
      logger.error('[ChartImportService] Failed to clear charts directory:', err);
      throw err;
    }
  }

  public async normalizeLibrary(): Promise<void> {
    try {
      const library = await this.getLibrary();
      if (library.length === 0) return;

      const groups = new Map<string, OszChart[]>();
      for (const item of library) {
        const key = `${item.artist}__${item.title}`;
        const list = groups.get(key) ?? [];
        list.push(item);
        groups.set(key, list);
      }

      let changed = false;
      const toKeepIds = new Set<string>();
      const toRemoveIds: string[] = [];

      for (const items of groups.values()) {
        if (!items || items.length <= 1) {
          if (items?.[0]) toKeepIds.add(items[0].id);
          continue;
        }

        // Check folder existence
        const withExistence = await Promise.all(items.map(async it => {
          try {
            const realPath = it.folderPath.replace('media://', '');
            const fullPath = path.join(this.chartsPath, realPath);
            await fs.access(fullPath);
            return { it, exists: true };
          } catch {
            return { it, exists: false };
          }
        }));

        const existing = withExistence.filter(x => x.exists).map(x => x.it);
        const candidates = existing.length > 0 ? existing : items;

        // Choose newest by timestamp in id
        const parseTs = (id: string) => {
          const m = id.match(/-(\d{10,})$/);
          return m ? Number(m[1]) : 0;
        };

        let winner = candidates[0]!;
        for (const c of candidates) {
          if (parseTs(c.id) > parseTs(winner.id)) winner = c;
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
        logger.info(`[ChartImportService] normalizeLibrary: removed ${toRemoveIds.length} duplicate entries.`);
      }

      if (!changed) {
        logger.info('[ChartImportService] normalizeLibrary: no duplicates found.');
      }
    } catch (err) {
      logger.warn('[ChartImportService] normalizeLibrary failed:', err);
    }
  }

  /**
   * Legacy import method - keeping for compatibility  
   */
  public async importOszFile_legacy(oszPath: string): Promise<void> {
    logger.info('[ChartImportService] Using legacy import method');
    const result = await this.importOszFile(oszPath);
    if (!result) {
      throw new Error('Legacy import failed');
    }
  }

  /**
   * Legacy metadata parsing - keeping for compatibility
   */
  private parseOsuMetadata(osuContent: string): any {
    const lines = osuContent.split('\n');
    const metadata: any = {};

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

  private countNotes(osuContent: string): number {
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
