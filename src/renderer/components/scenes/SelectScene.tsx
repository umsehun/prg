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
    <div className="min-h-screen bg-theme-bg flex flex-col items-center justify-center p-8 text-theme-text-light">
      <AnimatedSceneBackground />

      <div className="w-full max-w-6xl h-[70vh] bg-black/30 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/10 flex p-8 z-10">
        {/* Song List */}
        <div className="w-1/3 pr-6 border-r border-white/10 overflow-y-auto">
          <h2 className="text-3xl font-black mb-6 text-theme-accent">SELECT MUSIC</h2>
          <div className="space-y-2">
            {charts.map((chart) => (
              <button
                key={chart.id}
                onClick={() => setSelectedChart(chart.id)}
                className={`w-full text-left p-4 rounded-lg transition-all duration-200 ${
                  selectedChartId === chart.id
                    ? 'bg-theme-primary/30 border-l-4 border-theme-primary'
                    : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                <p className="font-bold text-lg">{chart.title}</p>
                <p className="text-sm text-white/60">{chart.artist}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Song Details */}
        <div className="w-2/3 pl-8 flex flex-col justify-between">
          {selectedChart ? (
            <div className="flex-grow flex flex-col items-center justify-center text-center">
              <div className="relative w-full max-w-lg h-48 rounded-lg shadow-lg mb-8 border-2 border-white/20 overflow-hidden">
                <BannerImage 
                  bannerPath={selectedChart.bannerPath || ''}
                  title={selectedChart.title}
                />
              </div>
              <h1 className="text-5xl font-extrabold tracking-tight">{selectedChart.title}</h1>
              <p className="text-2xl text-white/70 mt-2">{selectedChart.artist}</p>
              
              {/* Difficulty Selection UI */}
              {(() => {
                console.log('[UI DEBUG] availableDifficulties.length:', availableDifficulties.length);
                return null;
              })()}
              {availableDifficulties.length > 1 && (
                <div className="mt-8 w-full max-w-md">
                  <h3 className="text-xl font-bold mb-4 text-theme-accent">Select Difficulty</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {availableDifficulties.map((difficulty, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedDifficultyIndex(index)}
                        className={`px-4 py-2 rounded-lg text-left transition-all ${
                          selectedDifficultyIndex === index
                            ? 'bg-theme-accent text-black font-bold'
                            : 'bg-white/10 hover:bg-white/20 text-white'
                        }`}
                      >
                        {difficulty}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {/* Debug info */}
              {availableDifficulties.length <= 1 && (
                <div className="mt-4 text-sm text-white/50">
                  Debug: {availableDifficulties.length} difficulties available
                </div>
              )}
            </div>
          ) : (
            <div className="flex-grow flex items-center justify-center">
              <p className="text-2xl">Select a song</p>
            </div>
          )}

          
          <div className="flex justify-between items-center">
            <button
            onClick={onBack}
            className="px-6 py-3 bg-theme-secondary text-white rounded-lg hover:bg-theme-secondary/80 transition-colors"
          >
            Back to Menu
          </button>
            <button
              onClick={handleStartGame}
              disabled={!selectedChart}
              className="px-12 py-4 text-2xl font-bold bg-theme-accent rounded-lg hover:bg-opacity-80 transition-all disabled:bg-gray-600 disabled:cursor-not-allowed transform hover:scale-105"
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
