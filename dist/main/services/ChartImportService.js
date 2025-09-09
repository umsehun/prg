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
        this.pathService = new PathService_1.PathService();
        this.parser = new OszParser_1.OszParser();
    }
    async getChartList() {
        const assetsPath = this.pathService.getAssetsPath();
        const files = await fs_1.promises.readdir(assetsPath);
        const oszFiles = files.filter(file => file.endsWith('.osz'));
        const chartPromises = oszFiles.map(async (file) => {
            const filePath = path_1.default.join(assetsPath, file);
            try {
                const chartInfo = await this.parser.parseOszFile(filePath, path_1.default.join(assetsPath, path_1.default.basename(file, '.osz')));
                return chartInfo;
            }
            catch (error) {
                console.error(`Failed to parse ${file}:`, error);
                return null;
            }
        });
        const charts = await Promise.all(chartPromises);
        return charts.filter((chart) => chart !== null);
    }
}
exports.ChartImportService = ChartImportService;
