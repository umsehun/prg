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
Object.defineProperty(exports, "__esModule", { value: true });
exports.discoverCharts = discoverCharts;
// src/main/services/chart-discovery.ts
const fs = __importStar(require("fs/promises"));
const util_1 = require("util");
const child_process_1 = require("child_process");
const path = __importStar(require("path"));
const electron_1 = require("electron");
const ChartImportService_1 = require("./ChartImportService");
const PathService_1 = require("./PathService");
let isDiscovering = false;
const execAsync = (0, util_1.promisify)(child_process_1.exec);
const isDevelopment = process.env.NODE_ENV === 'development';
const basePath = isDevelopment
    ? path.join(electron_1.app.getAppPath(), '..', '..')
    : process.resourcesPath;
const assetsPath = path.join(basePath, 'public', 'assets');
/**
 * Automatically converts .osu files to JSON when JSON files are missing
 */
async function autoConvertOsuFiles() {
    try {
        const scriptPath = path.join(process.cwd(), 'scripts', 'auto-convert-osu.js');
        console.log('🔄 Running auto-conversion for .osu files...');
        await execAsync(`node "${scriptPath}"`);
    }
    catch (error) {
        console.error('❌ 자동 변환 실패:', error);
    }
}
/**
 * assets 디렉토리를 스캔하여 .osz 파일을 직접 파싱해 차트를 발견합니다.
 * 각 폴더에서 .osz 파일을 찾아 파싱하여 정확한 메타데이터를 추출합니다.
 */
async function discoverCharts() {
    // 동시 실행 방지 잠금 메커니즘
    if (isDiscovering) {
        console.log('[ChartDiscovery] Discovery is already in progress. Skipping subsequent call.');
        return [];
    }
    isDiscovering = true;
    try {
        // Optional dev cleanup: wipe charts directory and reset library
        try {
            const svc = ChartImportService_1.ChartImportService.getInstance();
            if (process.env.CLEAR_CHARTS_ON_START === '1') {
                console.warn('[ChartDiscovery] CLEAR_CHARTS_ON_START=1 detected. Clearing charts and library...');
                await svc.clearChartsDirectoryAndLibrary();
            }
        }
        catch (e) {
            console.warn('[ChartDiscovery] dev cleanup failed (continuing):', e);
        }
        // Normalize library to remove duplicates before discovery
        try {
            const svc = ChartImportService_1.ChartImportService.getInstance();
            await svc.normalizeLibrary();
        }
        catch (e) {
            console.warn('[ChartDiscovery] normalizeLibrary failed (continuing):', e);
        }
        const discoveredCharts = [];
        const assetFolders = await fs.readdir(assetsPath, { withFileTypes: true });
        for (const folder of assetFolders) {
            if (!folder.isDirectory())
                continue;
            const chartDir = path.join(assetsPath, folder.name);
            const files = await fs.readdir(chartDir);
            // .osz 파일 찾기
            const oszFile = files.find(f => f.toLowerCase().endsWith('.osz'));
            if (oszFile) {
                try {
                    const oszPath = path.join(chartDir, oszFile);
                    // OSZ 파일을 ChartImportService를 통해 자동으로 임포트
                    const importService = ChartImportService_1.ChartImportService.getInstance();
                    const oszChart = await importService.importOszFile(oszPath);
                    // If the import was skipped (due to lock), try to find existing chart in library
                    if (!oszChart) {
                        // Try to find the chart in library by folder name pattern
                        const library = await importService.getLibrary();
                        const existingChart = library.find(c => {
                            const folderMatch = c.folderPath && c.folderPath.includes(folder.name);
                            const titleMatch = c.title.toLowerCase().includes(folder.name.toLowerCase());
                            const artistMatch = c.artist.toLowerCase().includes(folder.name.toLowerCase());
                            const reverseMatch = folder.name.toLowerCase().includes(c.title.toLowerCase()) ||
                                folder.name.toLowerCase().includes(c.artist.toLowerCase());
                            // Special fuzzy matching for common variations
                            const fuzzyMatch = ((folder.name.toLowerCase() === 'totorisu' && c.title.toLowerCase().includes('tetoris')) ||
                                (folder.name.toLowerCase() === 'bad-apple' && c.title.toLowerCase().includes('bad apple')) ||
                                (folder.name.toLowerCase() === 'hutuo' && c.title.toLowerCase().includes('any last words')) ||
                                (folder.name.toLowerCase() === 'jink' && c.title.toLowerCase().includes('jinxed')) ||
                                (folder.name.toLowerCase() === 'oiioii' && c.title.toLowerCase().includes('oiiaoiia')));
                            return folderMatch || titleMatch || artistMatch || reverseMatch || fuzzyMatch;
                        });
                        if (existingChart) {
                            // Check if this chart is already in discoveredCharts to avoid duplicates
                            const alreadyDiscovered = discoveredCharts.find(dc => dc.id === existingChart.id);
                            if (alreadyDiscovered) {
                                continue;
                            }
                            // Create discoveredChart from existing library entry
                            const resolvedChartPath = PathService_1.pathService.resolve(existingChart.folderPath);
                            const extractedFiles = await fs.readdir(resolvedChartPath);
                            const banner = extractedFiles.find(f => f.toLowerCase().endsWith('.png') || f.toLowerCase().endsWith('.jpg'));
                            const music = extractedFiles.find(f => f.toLowerCase().endsWith('.mp3') || f.toLowerCase().endsWith('.ogg'));
                            const videoExtensions = ['.mp4', '.avi', '.flv', '.mov', '.webm'];
                            const video = extractedFiles.find(f => videoExtensions.includes(path.extname(f).toLowerCase()));
                            if (music) {
                                const chartMetadata = {
                                    id: existingChart.id,
                                    title: existingChart.title,
                                    artist: existingChart.artist,
                                    bannerPath: banner ? `${existingChart.folderPath}/${banner}` : undefined,
                                    musicPath: `${existingChart.folderPath}/${music}`,
                                    chartPath: `asset://${folder.name}/${oszFile}`,
                                    gameMode: 'pin',
                                    videoPath: video ? `${existingChart.folderPath}/${video}` : undefined,
                                    oszMetadata: {
                                        creator: existingChart.creator,
                                        audioFilename: existingChart.audioFilename,
                                        backgroundFilename: existingChart.backgroundFilename || undefined,
                                        difficulties: existingChart.difficulties.map(diff => ({
                                            name: diff.name,
                                            version: diff.version
                                        }))
                                    }
                                };
                                discoveredCharts.push(chartMetadata);
                            }
                            else {
                                console.warn(`[ChartDiscovery] Music file missing in chart ${existingChart.title}. Skipping.`);
                            }
                        }
                        continue;
                    }
                    // Verify the chart exists in library with the same ID
                    const library = await importService.getLibrary();
                    const libraryChart = library.find(c => c.id === oszChart.id);
                    let actualChart;
                    if (!libraryChart) {
                        // Try to find by title+artist as fallback
                        const fallbackChart = library.find(c => c.title === oszChart.title && c.artist === oszChart.artist);
                        if (fallbackChart) {
                            actualChart = fallbackChart;
                        }
                        else {
                            console.error(`[ChartDiscovery] Chart not found in library: ${oszChart.title}. Skipping.`);
                            continue;
                        }
                    }
                    else {
                        actualChart = libraryChart;
                    }
                    // OSZ에서 압축 해제된 파일들에서 배너 이미지와 음악/비디오 파일 찾기
                    const resolvedChartPath = PathService_1.pathService.resolve(oszChart.folderPath);
                    const extractedFiles = await fs.readdir(resolvedChartPath);
                    const banner = extractedFiles.find(f => f.toLowerCase().endsWith('.png') || f.toLowerCase().endsWith('.jpg'));
                    const music = extractedFiles.find(f => f.toLowerCase().endsWith('.mp3') || f.toLowerCase().endsWith('.ogg'));
                    const videoExtensions = ['.mp4', '.avi', '.flv', '.mov', '.webm'];
                    const video = extractedFiles.find(f => videoExtensions.includes(path.extname(f).toLowerCase()));
                    if (music) {
                        const chartMetadata = {
                            id: actualChart.id, // Use the definitive ID from the imported/cached chart
                            title: oszChart.title,
                            artist: oszChart.artist,
                            bannerPath: banner ? `${oszChart.folderPath}/${banner}` : undefined, // 배너는 선택사항
                            musicPath: `${oszChart.folderPath}/${music}`, // 압축 해제된 폴더의 절대 경로
                            chartPath: `asset://${folder.name}/${oszFile}`, // OSZ 파일을 차트 경로로 사용
                            gameMode: 'pin',
                            videoPath: video ? `${oszChart.folderPath}/${video}` : undefined, // 한 번만 설정
                            oszMetadata: {
                                creator: oszChart.creator,
                                audioFilename: oszChart.audioFilename,
                                backgroundFilename: oszChart.backgroundFilename || undefined,
                                difficulties: oszChart.difficulties.map(diff => ({
                                    name: diff.name,
                                    version: diff.version
                                }))
                            }
                        };
                        discoveredCharts.push(chartMetadata);
                    }
                    else {
                        console.warn(`[ChartDiscovery] Music file missing in ${folder.name}. Skipping chart.`);
                    }
                }
                catch (error) {
                    console.error(`[ChartDiscovery] Error processing ${folder.name}/${oszFile}:`, error);
                    continue;
                }
            }
            else {
                // Fallback: pin-chart.json이 있는 기존 방식 지원
                const chartFile = files.find(f => f.toLowerCase() === 'pin-chart.json');
                const banner = files.find(f => f.toLowerCase().endsWith('.png') || f.toLowerCase().endsWith('.jpg'));
                const music = files.find(f => f.toLowerCase().endsWith('.mp3') || f.toLowerCase().endsWith('.ogg'));
                const videoExtensions = ['.mp4', '.avi', '.flv', '.mov', '.webm'];
                const video = files.find(f => videoExtensions.includes(path.extname(f).toLowerCase()));
                if (banner && music && chartFile) {
                    const chartJsonPath = path.join(chartDir, chartFile);
                    const chartData = JSON.parse(await fs.readFile(chartJsonPath, 'utf-8'));
                    const chartMetadata = {
                        id: folder.name,
                        title: chartData.title || 'Unknown Title',
                        artist: chartData.artist || 'Unknown Artist',
                        bannerPath: `asset://${folder.name}/${banner}`,
                        musicPath: `asset://${folder.name}/${music}`,
                        chartPath: `asset://${folder.name}/${chartFile}`,
                        gameMode: 'pin',
                    };
                    if (video) {
                        chartMetadata.videoPath = `asset://${folder.name}/${video}`;
                    }
                    discoveredCharts.push(chartMetadata);
                }
            }
        }
        console.log(`${discoveredCharts.length}개의 차트를 발견했습니다.`);
        return discoveredCharts;
    }
    catch (error) {
        console.error('❌ 차트 발견 실패:', error);
        return [];
    }
    finally {
        // 프로세스가 끝나면 반드시 잠금 해제
        isDiscovering = false;
    }
}
