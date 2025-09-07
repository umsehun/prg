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
exports.chartDiscoveryService = exports.ChartDiscoveryService = void 0;
exports.fuzzyMatch = fuzzyMatch;
exports.discoverCharts = discoverCharts;
// src/main/services/chart-discovery.ts
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const electron_1 = require("electron");
const logger_1 = require("../../shared/logger");
/**
 * 문자열 유사도 계산을 위한 Levenshtein Distance 기반 알고리즘
 */
class StringSimilarity {
    /**
     * 두 문자열 간의 Levenshtein Distance 계산
     */
    static levenshteinDistance(str1, str2) {
        const matrix = [];
        const m = str1.length;
        const n = str2.length;
        // 행렬 초기화
        for (let i = 0; i <= m; i++) {
            matrix[i] = [];
            matrix[i][0] = i;
        }
        for (let j = 0; j <= n; j++) {
            matrix[0][j] = j;
        }
        // 동적 계획법으로 거리 계산
        for (let i = 1; i <= m; i++) {
            for (let j = 1; j <= n; j++) {
                const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
                matrix[i][j] = Math.min(matrix[i - 1][j] + 1, // 삭제
                matrix[i][j - 1] + 1, // 삽입
                matrix[i - 1][j - 1] + cost // 치환
                );
            }
        }
        return matrix[m][n];
    }
    /**
     * 두 문자열의 유사도를 0~1 사이의 값으로 반환
     * 1에 가까울수록 유사함
     */
    static similarity(str1, str2) {
        if (!str1 || !str2)
            return 0;
        const distance = this.levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
        const maxLength = Math.max(str1.length, str2.length);
        if (maxLength === 0)
            return 1;
        return 1 - (distance / maxLength);
    }
    /**
     * Jaro-Winkler 유사도 계산 (더 정확한 매칭을 위해)
     */
    static jaroWinklerSimilarity(str1, str2) {
        if (!str1 || !str2)
            return 0;
        if (str1 === str2)
            return 1;
        const s1 = str1.toLowerCase();
        const s2 = str2.toLowerCase();
        const matchDistance = Math.floor(Math.max(s1.length, s2.length) / 2) - 1;
        const s1Matches = new Array(s1.length).fill(false);
        const s2Matches = new Array(s2.length).fill(false);
        let matches = 0;
        let transpositions = 0;
        // 매치 찾기
        for (let i = 0; i < s1.length; i++) {
            const start = Math.max(0, i - matchDistance);
            const end = Math.min(i + matchDistance + 1, s2.length);
            for (let j = start; j < end; j++) {
                if (s2Matches[j] || s1[i] !== s2[j])
                    continue;
                s1Matches[i] = true;
                s2Matches[j] = true;
                matches++;
                break;
            }
        }
        if (matches === 0)
            return 0;
        // 전치 계산
        let k = 0;
        for (let i = 0; i < s1.length; i++) {
            if (!s1Matches[i])
                continue;
            while (!s2Matches[k])
                k++;
            if (s1[i] !== s2[k])
                transpositions++;
            k++;
        }
        const jaro = (matches / s1.length + matches / s2.length + (matches - transpositions / 2) / matches) / 3;
        // Winkler 보정
        let prefixLength = 0;
        for (let i = 0; i < Math.min(s1.length, s2.length) && s1[i] === s2[i]; i++) {
            prefixLength++;
        }
        const winkler = jaro + (prefixLength * 0.1 * (1 - jaro));
        return winkler;
    }
    /**
     * 복합 유사도 점수 계산 (Levenshtein + Jaro-Winkler 조합)
     */
    static combinedSimilarity(str1, str2) {
        const levenshtein = this.similarity(str1, str2);
        const jaroWinkler = this.jaroWinklerSimilarity(str1, str2);
        // 가중 평균 (Jaro-Winkler에 더 높은 가중치)
        return (levenshtein * 0.3 + jaroWinkler * 0.7);
    }
}
/**
 * 차트 발견 및 매칭 서비스
 * 하드코딩된 fuzzyMatch 로직을 동적 문자열 유사도 기반으로 대체
 */
class ChartDiscoveryService {
    constructor() {
        Object.defineProperty(this, "libraryPath", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        const userDataPath = electron_1.app.getPath('userData');
        this.libraryPath = path.join(userDataPath, 'library.json');
    }
    static getInstance() {
        if (!ChartDiscoveryService.instance) {
            ChartDiscoveryService.instance = new ChartDiscoveryService();
        }
        return ChartDiscoveryService.instance;
    }
    /**
     * 라이브러리 로드
     */
    async loadLibrary() {
        try {
            const data = await fs.readFile(this.libraryPath, 'utf8');
            return JSON.parse(data);
        }
        catch {
            return [];
        }
    }
    /**
     * 정확한 매치 검색 (title + artist)
     */
    async findExactMatch(title, artist) {
        const library = await this.loadLibrary();
        const exactMatch = library.find(chart => chart.title.toLowerCase() === title.toLowerCase() &&
            chart.artist.toLowerCase() === artist.toLowerCase());
        if (exactMatch) {
            logger_1.logger.info(`[ChartDiscovery] Exact match found: "${title}" by ${artist}`);
        }
        return exactMatch || null;
    }
    /**
     * 퍼지 매치 검색 (동적 문자열 유사도 기반)
     */
    async findFuzzyMatches(title, artist, threshold = 0.7, maxResults = 5) {
        const library = await this.loadLibrary();
        const matches = [];
        for (const chart of library) {
            // 제목 유사도 계산
            const titleSimilarity = StringSimilarity.combinedSimilarity(title, chart.title);
            // 아티스트 유사도 계산
            const artistSimilarity = StringSimilarity.combinedSimilarity(artist, chart.artist);
            // 복합 점수 계산 (제목 60%, 아티스트 40% 가중치)
            const combinedScore = titleSimilarity * 0.6 + artistSimilarity * 0.4;
            // 임계값 이상인 경우만 추가
            if (combinedScore >= threshold) {
                matches.push({
                    chart,
                    similarity: combinedScore,
                    matchType: combinedScore >= 0.95 ? 'exact' : 'fuzzy'
                });
            }
        }
        // 유사도 순으로 정렬하고 최대 결과 수만큼 반환
        matches.sort((a, b) => b.similarity - a.similarity);
        const results = matches.slice(0, maxResults);
        logger_1.logger.info(`[ChartDiscovery] Found ${results.length} fuzzy matches for "${title}" by ${artist} (threshold: ${threshold})`);
        if (results.length > 0) {
            const topMatch = results[0];
            if (topMatch) {
                logger_1.logger.info(`[ChartDiscovery] Top match: "${topMatch.chart.title}" by ${topMatch.chart.artist} (${(topMatch.similarity * 100).toFixed(1)}%)`);
            }
        }
        return results;
    }
    /**
     * 통합 검색 (정확한 매치 우선, 없으면 퍼지 매치)
     */
    async searchChart(title, artist, fuzzyThreshold = 0.7) {
        // 1. 정확한 매치 시도
        const exactMatch = await this.findExactMatch(title, artist);
        // 2. 정확한 매치가 없으면 퍼지 매치 시도
        const fuzzyMatches = exactMatch
            ? []
            : await this.findFuzzyMatches(title, artist, fuzzyThreshold);
        return {
            exact: exactMatch || undefined,
            fuzzy: fuzzyMatches
        };
    }
    /**
     * 차트 ID로 검색
     */
    async findChartById(chartId) {
        const library = await this.loadLibrary();
        const chart = library.find(c => c.id === chartId);
        if (chart) {
            logger_1.logger.info(`[ChartDiscovery] Found chart by ID: ${chartId}`);
        }
        return chart || null;
    }
    /**
     * 키워드로 차트 검색 (제목, 아티스트, 크리에이터에서 검색)
     */
    async searchByKeyword(keyword, threshold = 0.5, maxResults = 10) {
        const library = await this.loadLibrary();
        const matches = [];
        for (const chart of library) {
            // 각 필드에서 유사도 계산
            const titleSimilarity = StringSimilarity.combinedSimilarity(keyword, chart.title);
            const artistSimilarity = StringSimilarity.combinedSimilarity(keyword, chart.artist);
            const creatorSimilarity = StringSimilarity.combinedSimilarity(keyword, chart.creator);
            // 최고 점수 사용
            const maxSimilarity = Math.max(titleSimilarity, artistSimilarity, creatorSimilarity);
            if (maxSimilarity >= threshold) {
                matches.push({
                    chart,
                    similarity: maxSimilarity,
                    matchType: maxSimilarity >= 0.9 ? 'exact' : 'fuzzy'
                });
            }
        }
        // 유사도 순으로 정렬
        matches.sort((a, b) => b.similarity - a.similarity);
        const results = matches.slice(0, maxResults);
        logger_1.logger.info(`[ChartDiscovery] Keyword search "${keyword}" found ${results.length} results`);
        return results;
    }
    /**
     * 차트 통계 정보
     */
    async getChartStats() {
        const library = await this.loadLibrary();
        const uniqueArtists = new Set(library.map(c => c.artist.toLowerCase())).size;
        const uniqueCreators = new Set(library.map(c => c.creator.toLowerCase())).size;
        const totalDifficulties = library.reduce((sum, c) => sum + c.difficulties.length, 0);
        return {
            totalCharts: library.length,
            uniqueArtists,
            uniqueCreators,
            totalDifficulties
        };
    }
    /**
     * 라이브러리 유효성 검사
     */
    async validateLibrary() {
        const library = await this.loadLibrary();
        const valid = [];
        const invalid = [];
        for (const chart of library) {
            try {
                // 폴더 존재성 검사
                const folderPath = chart.folderPath.replace('media://', '');
                const fullPath = path.join(electron_1.app.getPath('userData'), 'charts', folderPath);
                await fs.access(fullPath);
                // 기본 파일들 존재성 검사
                const audioPath = path.join(fullPath, chart.audioFilename.replace(`media://${chart.id}/`, ''));
                await fs.access(audioPath);
                valid.push(chart);
            }
            catch (error) {
                const reason = error instanceof Error ? error.message : 'Unknown error';
                invalid.push({ chart, reason });
            }
        }
        logger_1.logger.info(`[ChartDiscovery] Library validation: ${valid.length} valid, ${invalid.length} invalid charts`);
        return { valid, invalid };
    }
}
exports.ChartDiscoveryService = ChartDiscoveryService;
// 레거시 함수 지원 (기존 코드 호환성을 위해)
async function fuzzyMatch(title, artist) {
    const service = ChartDiscoveryService.getInstance();
    const result = await service.searchChart(title, artist, 0.7);
    const firstFuzzyMatch = result.fuzzy[0];
    return result.exact || (firstFuzzyMatch ? firstFuzzyMatch.chart : null);
}
// 싱글톤 인스턴스 내보내기
exports.chartDiscoveryService = ChartDiscoveryService.getInstance();
/**
 * 레거시 함수: ChartMetadata[] 형식으로 차트 목록 반환
 * 기존 코드 호환성을 위해 유지
 */
async function discoverCharts() {
    const service = ChartDiscoveryService.getInstance();
    // Private 메서드 대신 public 메서드 사용
    try {
        const data = await fs.readFile(service['libraryPath'], 'utf8');
        const library = JSON.parse(data);
        // OszChart를 ChartMetadata 형식으로 변환
        const chartMetadata = library.map(chart => ({
            id: chart.id,
            title: chart.title,
            artist: chart.artist,
            musicPath: chart.audioFilename,
            chartPath: chart.difficulties[0]?.filePath || '',
            bannerPath: chart.backgroundFilename,
            videoPath: chart.videoPath,
            gameMode: 'pin',
            oszMetadata: {
                creator: chart.creator,
                audioFilename: chart.audioFilename,
                backgroundFilename: chart.backgroundFilename,
                difficulties: chart.difficulties,
                folderPath: chart.folderPath,
                mode: chart.mode
            }
        }));
        logger_1.logger.info(`[ChartDiscovery] discoverCharts() returned ${chartMetadata.length} charts`);
        return chartMetadata;
    }
    catch {
        logger_1.logger.warn('[ChartDiscovery] discoverCharts() - library file not found, returning empty array');
        return [];
    }
}
