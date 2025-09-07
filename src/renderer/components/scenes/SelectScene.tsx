// src/renderer/components/scenes/SelectScene.tsx
'use client';

import React, { useState, useEffect } from 'react';
import BannerImage from '@/components/ui/BannerImage';
import useGameStore from '../../store/gameStore';
import AnimatedSceneBackground from '../ui/AnimatedSceneBackground';

interface SelectSceneProps {
  onBack: () => void;
  onStartGame: (chart: any) => void;
}

const SelectScene: React.FC<SelectSceneProps> = ({ onBack, onStartGame }) => {
  const { charts, selectedChartId, setSelectedChart, setCurrentScene, loadCharts } = useGameStore();
  const [selectedDifficultyIndex, setSelectedDifficultyIndex] = useState<number>(0);
  const [availableDifficulties, setAvailableDifficulties] = useState<string[]>([]);

  useEffect(() => {
    loadCharts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount to prevent infinite re-renders

  const selectedChart = charts.find((c) => c.id === selectedChartId);

  // Load available difficulties when chart is selected
  useEffect(() => {
    console.log('[DIFFICULTY DEBUG] Selected chart:', selectedChart);
    console.log('[DIFFICULTY DEBUG] Chart path:', selectedChart?.chartPath);
    console.log('[DIFFICULTY DEBUG] Full chart object:', JSON.stringify(selectedChart, null, 2));

    if (selectedChart) {
      // Check if this chart has difficulties (for OSZ charts)
      const chartWithDifficulties = selectedChart as any;
      const difficulties = chartWithDifficulties.oszMetadata?.difficulties || chartWithDifficulties.difficulties;
      console.log('[DIFFICULTY DEBUG] Chart difficulties:', difficulties);

      if (difficulties && difficulties.length > 1) {
        const diffNames = difficulties.map((diff: any) => diff.name || `Difficulty ${diff.index + 1}`);
        console.log('[DIFFICULTY DEBUG] Setting difficulties:', diffNames);
        setAvailableDifficulties(diffNames);
        setSelectedDifficultyIndex(0);
      } else {
        console.log('[DIFFICULTY DEBUG] No multiple difficulties found, clearing array');
        setAvailableDifficulties([]);
        setSelectedDifficultyIndex(0);
      }
    } else {
      console.log('[DIFFICULTY DEBUG] No chart selected, clearing difficulties');
      setAvailableDifficulties([]);
      setSelectedDifficultyIndex(0);
    }
  }, [selectedChart]);

  const handleStartGame = async () => {
    if (selectedChart) {
      try {
        let pinChart;

        // OSZ 파일인지 확인 (chartPath가 .osz로 끝나는지)
        if (selectedChart.chartPath.endsWith('.osz')) {
          // OSZ 차트를 PinChart로 변환 (선택된 난이도 인덱스 전달)
          pinChart = await (window as any).electron.convertOszToPinChart(selectedChart, selectedDifficultyIndex);
        } else {
          // 기존 JSON 차트를 PinChart로 변환
          pinChart = await (window as any).electron.loadPinChart(selectedChart.chartPath);
        }

        if (pinChart) {
          onStartGame(pinChart);
        }
      } catch (error) {
        console.error('Failed to load chart:', error);
      }
    }
  };

  return (
    <div className="min-h-screen cyber-bg-animated flex flex-col items-center justify-center p-4 text-white">
      <AnimatedSceneBackground />

      <div className="w-full max-w-7xl h-[85vh] game-card flex p-6 z-10 gap-6">
        {/* Song List - Fixed Height with Proper Scrolling */}
        <div className="w-1/3 flex flex-col">
          <h2 className="text-3xl font-black mb-4 neon-glow-cyan" style={{ color: 'var(--neon-cyan)' }}>
            SELECT MUSIC
          </h2>
          <div className="flex-1 overflow-y-auto pr-2 space-y-2 max-h-[calc(85vh-120px)]">
            {charts.map((chart) => (
              <button
                key={chart.id}
                onClick={() => setSelectedChart(chart.id)}
                className={`w-full text-left p-4 rounded-lg transition-all duration-300 transform hover:scale-102 ${selectedChartId === chart.id
                  ? 'neon-glow-magenta border-2'
                  : 'bg-white/10 hover:bg-white/20 border border-transparent hover:border-cyan-400'
                  }`}
                style={{
                  backgroundColor: selectedChartId === chart.id ? 'rgba(255, 0, 255, 0.2)' : undefined,
                  borderColor: selectedChartId === chart.id ? 'var(--neon-magenta)' : undefined
                }}
              >
                <p className="font-bold text-lg truncate" style={{
                  color: selectedChartId === chart.id ? 'var(--neon-magenta)' : 'white'
                }}>{chart.title}</p>
                <p className="text-sm text-gray-400 truncate">{chart.artist}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Song Details - Improved Layout */}
        <div className="w-2/3 flex flex-col justify-between">
          {selectedChart ? (
            <div className="flex-grow flex flex-col items-center justify-center text-center px-4">
              <div className="relative w-full max-w-lg h-48 rounded-xl shadow-2xl mb-6 border-2 neon-glow-green overflow-hidden"
                style={{ borderColor: 'var(--neon-green)' }}>
                <BannerImage
                  bannerPath={selectedChart.bannerPath || ''}
                  title={selectedChart.title}
                />
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight mb-2 neon-glow-pulse"
                style={{ color: 'var(--neon-cyan)' }}>{selectedChart.title}</h1>
              <p className="text-xl text-gray-300 mb-6" style={{ color: 'var(--neon-yellow)' }}>{selectedChart.artist}</p>

              {/* Difficulty Selection UI - Fixed Overflow */}
              {availableDifficulties.length > 1 && (
                <div className="w-full max-w-md">
                  <h3 className="text-xl font-bold mb-4 neon-glow-green" style={{ color: 'var(--neon-green)' }}>
                    Select Difficulty
                  </h3>
                  <div className="max-h-32 overflow-y-auto space-y-2 p-2 rounded-lg bg-black/20">
                    {availableDifficulties.map((difficulty, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedDifficultyIndex(index)}
                        className={`w-full px-4 py-2 rounded-lg text-left transition-all duration-300 transform hover:scale-105 ${selectedDifficultyIndex === index
                          ? 'neon-glow-yellow font-bold'
                          : 'bg-white/10 hover:bg-white/20 text-white hover:neon-glow-cyan'
                          }`}
                        style={{
                          backgroundColor: selectedDifficultyIndex === index ? 'rgba(255, 255, 0, 0.2)' : undefined,
                          color: selectedDifficultyIndex === index ? 'var(--neon-yellow)' : undefined
                        }}
                      >
                        {difficulty}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-grow flex items-center justify-center">
              <p className="text-2xl text-gray-400">Select a song to begin</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between items-center mt-6">
            <button
              onClick={onBack}
              className="game-button"
              style={{ borderColor: 'var(--neon-red)', boxShadow: '0 0 10px var(--neon-red)' }}
            >
              ← Back to Menu
            </button>
            <button
              onClick={handleStartGame}
              disabled={!selectedChart}
              className={`px-12 py-4 text-2xl font-bold rounded-lg transition-all duration-300 transform ${selectedChart
                ? 'game-button hover:scale-105 neon-glow-pulse'
                : 'bg-gray-600 cursor-not-allowed text-gray-400'
                }`}
              style={selectedChart ? {
                borderColor: 'var(--neon-green)',
                boxShadow: '0 0 20px var(--neon-green)',
                color: 'var(--neon-green)'
              } : {}}
            >
              GAME START
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectScene;
