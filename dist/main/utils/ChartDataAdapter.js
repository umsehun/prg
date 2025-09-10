"use strict";
/**
 * Chart Data Adapter - Enhanced Parser와 Game Handler 간 데이터 형식 변환
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChartDataAdapter = void 0;
const path_1 = require("path");
/**
 * CompleteChartData를 GameChartData로 변환
 */
class ChartDataAdapter {
    /**
     * Enhanced parser 데이터를 게임 핸들러 형식으로 변환
     */
    static convertToGameFormat(completeData) {
        // 선호 난이도 정보를 찾기
        const preferredDiff = completeData.difficulties.find(d => d.name === completeData.preferredDifficulty) || completeData.difficulties[0];
        // 오디오 파일 경로 생성
        const audioPath = (0, path_1.join)(completeData.filePath, completeData.audioFile);
        // 배경 이미지 경로 생성 (있는 경우)
        const backgroundPath = completeData.backgroundImage
            ? (0, path_1.join)(completeData.filePath, completeData.backgroundImage)
            : undefined;
        return {
            id: completeData.id,
            title: completeData.title,
            artist: completeData.artist,
            difficulty: preferredDiff?.name || 'Unknown',
            audioPath,
            backgroundPath: backgroundPath || undefined,
            bpm: preferredDiff?.bpm || completeData.bpm,
            duration: preferredDiff?.duration || completeData.duration,
            notes: completeData.notes || []
        };
    }
    /**
     * 난이도별 게임 데이터 생성
     */
    static convertDifficultyToGameFormat(completeData, difficultyName) {
        const difficultyInfo = completeData.difficulties.find(d => d.name === difficultyName);
        if (!difficultyInfo) {
            return null;
        }
        const audioPath = (0, path_1.join)(completeData.filePath, completeData.audioFile);
        const backgroundPath = completeData.backgroundImage
            ? (0, path_1.join)(completeData.filePath, completeData.backgroundImage)
            : undefined;
        return {
            id: `${completeData.id}_${difficultyName.replace(/[^a-zA-Z0-9]/g, '_')}`,
            title: completeData.title,
            artist: completeData.artist,
            difficulty: difficultyInfo.name,
            audioPath,
            backgroundPath: backgroundPath || undefined,
            bpm: difficultyInfo.bpm,
            duration: difficultyInfo.duration,
            notes: completeData.notes || []
        };
    }
    /**
     * 모든 난이도를 게임 형식으로 변환
     */
    static convertAllDifficulties(completeData) {
        return completeData.difficulties.map(diff => {
            const audioPath = (0, path_1.join)(completeData.filePath, completeData.audioFile);
            const backgroundPath = completeData.backgroundImage
                ? (0, path_1.join)(completeData.filePath, completeData.backgroundImage)
                : undefined;
            return {
                id: `${completeData.id}_${diff.name.replace(/[^a-zA-Z0-9]/g, '_')}`,
                title: completeData.title,
                artist: completeData.artist,
                difficulty: diff.name,
                audioPath,
                backgroundPath: backgroundPath || undefined,
                bpm: diff.bpm,
                duration: diff.duration,
                notes: completeData.notes || []
            };
        });
    }
}
exports.ChartDataAdapter = ChartDataAdapter;
