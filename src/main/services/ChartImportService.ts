// src/main/services/ChartImportService.ts
import { promises as fs } from 'fs';
import path from 'path';
import { PathService } from './PathService';
import { DirectoryOszExtractor, ChartMetadata } from '../utils/DirectoryOszExtractor';
import { RuntimeOsuParser } from './RuntimeOsuParser';
import type { SongData } from '../../shared/d.ts/ipc';
import { logger } from '../../shared/globals/logger';

export class ChartImportService {
    private pathService: PathService;
    private extractor: DirectoryOszExtractor;
    private osuParser: RuntimeOsuParser;

    constructor() {
        this.pathService = new PathService();
        this.extractor = new DirectoryOszExtractor();
        this.osuParser = new RuntimeOsuParser();
    }

    /**
     * Auto-scan OSZ files and return loaded charts
     */
    public async autoScanOszFiles(): Promise<SongData[]> {
        return this.autoScanAndParseOszFiles();
    }

    /**
     * Auto-scan OSZ files and parse them (main method)
     */
    public async autoScanAndParseOszFiles(): Promise<SongData[]> {
        try {
            // First, try to load from library.json (pre-parsed data)
            const libraryCharts = await this.loadLibraryJson();
            if (libraryCharts.length > 0) {
                logger.info('chart-import', `Using ${libraryCharts.length} charts from library.json`);
                return libraryCharts;
            }

            // Fallback to OSZ parsing
            logger.info('chart-import', 'No library.json found, parsing OSZ files');

            const publicAssetsPath = this.getPublicAssetsPath();
            const chartsPath = this.pathService.getChartsPath();

            // Ensure charts directory exists
            await fs.mkdir(chartsPath, { recursive: true });

            // Scan for OSZ files
            const items = await fs.readdir(publicAssetsPath, { withFileTypes: true });
            const parsedCharts: SongData[] = [];

            for (const item of items) {
                if (item.isFile() && item.name.endsWith('.osz')) {
                    const oszPath = path.join(publicAssetsPath, item.name);
                    const chart = await this.parseOszToCharts(oszPath, chartsPath);
                    if (chart) parsedCharts.push(chart);
                } else if (item.isDirectory()) {
                    const dirItems = await fs.readdir(path.join(publicAssetsPath, item.name));
                    const oszFile = dirItems.find(file => file.endsWith('.osz'));
                    if (oszFile) {
                        const oszPath = path.join(publicAssetsPath, item.name, oszFile);
                        const chart = await this.parseOszToCharts(oszPath, chartsPath);
                        if (chart) parsedCharts.push(chart);
                    }
                }
            }

            // Save library.json after successful parsing
            if (parsedCharts.length > 0) {
                await this.saveLibraryJson(parsedCharts);
            }

            return parsedCharts;

        } catch (error) {
            logger.error('chart-import', `Failed to scan OSZ files: ${error}`);
            return [];
        }
    }

    private async loadLibraryJson(): Promise<SongData[]> {
        try {
            const libraryPath = this.pathService.getLibraryPath();
            const data = await fs.readFile(libraryPath, 'utf-8');
            const libraryData = JSON.parse(data);

            return libraryData.map((chart: any) => ({
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
        } catch {
            return [];
        }
    }

    private async parseOszToCharts(oszPath: string, chartsPath: string): Promise<SongData | null> {
        try {
            const fileName = path.basename(oszPath, '.osz');

            // Check if already exists
            const outputDir = path.join(chartsPath, fileName);
            try {
                await fs.access(outputDir);
                logger.debug('chart-import', `Chart already exists: ${fileName}`);
                return await this.loadExistingChart(outputDir);
            } catch {
                // Chart doesn't exist, extract it
            }

            // Extract OSZ using DirectoryOszExtractor
            const metadata = await this.extractor.extractOsz(oszPath, chartsPath);
            return this.convertMetadataToSongData(metadata);

        } catch (error) {
            logger.error('chart-import', `Failed to parse OSZ: ${error}`);
            return null;
        }
    }

    private convertMetadataToSongData(metadata: ChartMetadata): SongData {
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

    private async saveLibraryJson(charts: SongData[]): Promise<void> {
        try {
            const libraryPath = path.join(this.pathService.getAppDataPath(), 'library.json');

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

            await fs.writeFile(libraryPath, JSON.stringify(libraryData, null, 2), 'utf-8');
            logger.info('chart-import', `Library saved: ${libraryPath}`);

        } catch (error) {
            logger.error('chart-import', `Failed to save library: ${error}`);
        }
    }

    private async loadExistingChart(chartDir: string): Promise<SongData | null> {
        try {
            const files = await fs.readdir(chartDir);
            const osuFiles = files.filter(f => f.endsWith('.osu'));

            if (osuFiles.length === 0) return null;

            const chartName = path.basename(chartDir);
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
        } catch {
            return null;
        }
    }

    private getPublicAssetsPath(): string {
        const isDev = process.env.NODE_ENV === 'development';
        if (isDev) {
            return path.join(process.cwd(), 'public', 'assets');
        } else {
            return path.join(process.resourcesPath, 'public', 'assets');
        }
    }

    /**
     * Get list of parsed charts (compatibility method)
     */
    public async getChartList(): Promise<SongData[]> {
        return this.autoScanOszFiles();
    }

    /**
     * Load chart data with notes for game play
     */
    public async loadChartForPlay(chartId: string, difficulty?: string): Promise<{
        chartData: SongData;
        notes: Array<{
            time: number;
            type: 'tap' | 'hold' | 'slider';
            position?: { x: number; y: number };
            duration?: number;
        }>;
        difficulties: Array<{
            name: string;
            filename: string;
            starRating: number;
            difficultyName: string;
        }>;
        audioVideoFiles: {
            audioFile: string | null;
            videoFile: string | null;
            backgroundFile: string | null;
        };
    } | null> {
        try {
            // Find chart in library
            const charts = await this.loadLibraryJson();
            const chart = charts.find(c => c.id === chartId);

            if (!chart || !chart.filePath) {
                logger.error('chart-import', `Chart not found: ${chartId}`);
                return null;
            }

            // Get chart info with difficulties and notes
            const chartInfo = await this.osuParser.getChartInfo(chart.filePath, difficulty);

            if (!chartInfo.selectedDifficulty) {
                logger.error('chart-import', `No difficulty found for chart: ${chartId}`);
                return null;
            }

            logger.info('chart-import', `Loaded chart for play: ${chartId} - ${chartInfo.selectedDifficulty.difficultyName} (${chartInfo.notes.length} notes)`);

            return {
                chartData: chart,
                notes: chartInfo.notes,
                difficulties: chartInfo.difficulties,
                audioVideoFiles: chartInfo.audioVideoFiles
            };

        } catch (error) {
            logger.error('chart-import', `Failed to load chart for play: ${chartId} - ${error}`);
            return null;
        }
    }
}
