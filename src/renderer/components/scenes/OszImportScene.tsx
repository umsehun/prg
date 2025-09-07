// src/renderer/components/scenes/OszImportScene.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { PinChart } from '../../../shared/types';
// OszChart 타입 정의 (main 프로세스 타입을 직접 참조할 수 없으므로 복사)
interface OszChart {
  id: string;
  title: string;
  artist: string;
  creator: string;
  audioFilename: string;
  backgroundFilename?: string;
  difficulties: OszDifficulty[];
  folderPath: string;
}

interface OszDifficulty {
  name: string;
  version: string;
  overallDifficulty: number;
  approachRate: number;
  circleSize: number;
  hpDrainRate: number;
  filePath: string;
  noteCount: number;
}

interface OszImportSceneProps {
  onBack: () => void;
  onChartSelected: (chart: PinChart) => void;
}

const OszImportScene: React.FC<OszImportSceneProps> = ({ onBack, onChartSelected }) => {
  const [library, setLibrary] = useState<OszChart[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [importStatus, setImportStatus] = useState<string>('');

  // 라이브러리 로드
  useEffect(() => {
    loadLibrary();
  }, []);

  const loadLibrary = async () => {
    try {
      const charts = await (window as any).electron.getChartLibrary();
      setLibrary(charts as OszChart[]);
    } catch (error) {
      console.error('Failed to load chart library:', error);
    }
  };

  // .osz 파일 임포트
  const handleImportOsz = async () => {
    try {
      setIsLoading(true);
      setImportStatus('파일 선택 중...');

      // 파일 선택 다이얼로그 (Electron의 dialog API 사용)
      const filePath = await (window as any).electron.selectOszFile();

      if (!filePath) {
        setImportStatus('');
        setIsLoading(false);
        return;
      }

      setImportStatus('차트 임포트 중...');

      // .osz 파일 임포트
      await (window as any).electron.importOszFile(filePath);
      
      setImportStatus('임포트 완료!');
      setTimeout(() => setImportStatus(''), 2000);

      // 라이브러리 새로고침
      await loadLibrary();
    } catch (error) {
      console.error('Failed to import .osz file:', error);
      setImportStatus('임포트 실패: ' + (error as Error).message);
      setTimeout(() => setImportStatus(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  // 난이도 선택 및 게임 시작
  const handleDifficultySelect = async (chart: OszChart, difficultyIndex: number) => {
    try {
      setIsLoading(true);
      setImportStatus('차트 변환 중...');

      const pinChart = await (window as any).electron.convertDifficultyToPinChart(
        chart,
        difficultyIndex
      ) as PinChart;

      onChartSelected(pinChart);
    } catch (error) {
      console.error('Failed to convert difficulty:', error);
      setImportStatus('변환 실패: ' + (error as Error).message);
      setTimeout(() => setImportStatus(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  // 차트 삭제
  const handleRemoveChart = async (chartId: string) => {
    if (!confirm('이 차트를 삭제하시겠습니까?')) return;

    try {
      await (window as any).electron.invoke('remove-chart-from-library', chartId);
      await loadLibrary();
    } catch (error) {
      console.error('Failed to remove chart:', error);
    }
  };

  return (
    <div className="min-h-screen bg-theme-bg-primary text-white p-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-theme-primary mb-2">
            .osz 차트 라이브러리
          </h1>
          <p className="text-theme-text-secondary">
            osu! 비트맵(.osz) 파일을 임포트하여 플레이하세요
          </p>
        </div>
        <button
          onClick={onBack}
          className="px-6 py-3 bg-theme-secondary text-white rounded-lg hover:bg-theme-secondary/80 transition-colors"
        >
          뒤로가기
        </button>
      </div>

      {/* 임포트 버튼 및 상태 */}
      <div className="mb-8">
        <button
          onClick={handleImportOsz}
          disabled={isLoading}
          className="px-8 py-4 bg-theme-primary text-white rounded-lg hover:bg-theme-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? '처리 중...' : '.osz 파일 임포트'}
        </button>
        {importStatus && (
          <p className="mt-2 text-theme-accent">{importStatus}</p>
        )}
      </div>

      {/* 차트 라이브러리 */}
      <div className="grid gap-6">
        {library.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-theme-text-secondary text-lg">
              임포트된 차트가 없습니다.
            </p>
            <p className="text-theme-text-secondary mt-2">
              .osz 파일을 임포트하여 시작하세요.
            </p>
          </div>
        ) : (
          library.map((chart) => (
            <div
              key={chart.id}
              className="bg-theme-bg-secondary rounded-lg p-6 border border-theme-border"
            >
              {/* 차트 정보 */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-theme-primary">
                    {chart.title}
                  </h3>
                  <p className="text-theme-text-secondary">
                    by {chart.artist} • mapped by {chart.creator}
                  </p>
                </div>
                <button
                  onClick={() => handleRemoveChart(chart.id)}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
                >
                  삭제
                </button>
              </div>

              {/* 난이도 목록 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {chart.difficulties.map((difficulty, index) => (
                  <button
                    key={index}
                    onClick={() => handleDifficultySelect(chart, index)}
                    disabled={isLoading}
                    className="p-4 bg-theme-bg-primary rounded-lg border border-theme-border hover:border-theme-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left"
                  >
                    <div className="font-semibold text-theme-primary">
                      {difficulty.name}
                    </div>
                    <div className="text-sm text-theme-text-secondary mt-1">
                      OD: {difficulty.overallDifficulty.toFixed(1)} • 
                      AR: {difficulty.approachRate.toFixed(1)}
                    </div>
                    <div className="text-sm text-theme-text-secondary">
                      {difficulty.noteCount} 노트
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OszImportScene;
