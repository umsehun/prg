// src/main/services/ChartImportService.ts
import { promises as fs } from 'fs';
import path from 'path';
import { PathService } from './PathService';
import { OszParser } from '../utils/OszParser';
import type { SongData } from '../../shared/d.ts/ipc';

export class ChartImportService {
    private pathService: PathService;
    private parser: OszParser;

    constructor() {
        this.pathService = new PathService();
        this.parser = new OszParser();
    }

    public async getChartList() {
        const assetsPath = this.pathService.getAssetsPath();
        const files = await fs.readdir(assetsPath);
        const oszFiles = files.filter(file => file.endsWith('.osz'));

        const chartPromises = oszFiles.map(async (file) => {
            const filePath = path.join(assetsPath, file);
            try {
                const chartInfo = await this.parser.parseOszFile(filePath, path.join(assetsPath, path.basename(file, '.osz')));
                return chartInfo;
            } catch (error) {
                console.error(`Failed to parse ${file}:`, error);
                return null;
            }
        });

        const charts = await Promise.all(chartPromises);
        return charts.filter((chart: SongData | null): chart is SongData => chart !== null);
    }
}
