// src/renderer/components/scenes/GameScene.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import useGameStore from '../../store/gameStore';
import PinGameView from '../game/PinGameView';
import OsuGameView from '../game/OsuGameView';
import { PreGameLobby } from '../ui/PreGameLobby';
import { PauseMenu } from '../ui/PauseMenu';
import VideoController from '../ui/VideoController';
import { audioService } from '../../lib/AudioService';
import { PinChart } from '../../../shared/types';

interface GameSceneProps {
  selectedChart: PinChart;
  onBack: () => void;
}

const GameScene: React.FC<GameSceneProps> = ({ selectedChart, onBack }) => {
  const { score, combo, judgment, isPaused, updateGame, togglePause, reset } = useGameStore();

  const [pinChart, setPinChart] = useState<PinChart | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [videoPath, setVideoPath] = useState<string | null>(null);
  const [backgroundUrl, setBackgroundUrl] = useState<string | null>(null);

  const handleStartGame = async () => {
    if (!pinChart || isLoading) {
      console.warn('Pin chart or audio not loaded yet. Cannot start game.');
      return;
    }
    console.log('Starting pin game...');
    setGameStarted(true);

    try {
      // Initialize the game controller with the chart using handshake
      const gameStartResult = await (window as any).electron.startGame(pinChart);
      
      if (!gameStartResult.success) {
        console.error('Failed to start game in main process:', gameStartResult.error);
        alert(`Failed to start game: ${gameStartResult.error}`);
        setGameStarted(false);
        return;
      }

      // Start audio playback only after successful game initialization
      audioService.play();
    } catch (error) {
      console.error('Error during game start:', error);
      alert(`Failed to start game: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setGameStarted(false);
    }
  };

  const handlePinPress = () => {
    if (!gameStarted || isPaused) {
      return;
    }

    // Send the renderer master time (seconds) to Main for judgment
    const nowSec = audioService.getCurrentTime();
    (window as any).electron.handlePinPress(nowSec);
  };

  // Load assets
  useEffect(() => {
    const loadGameAssets = async () => {
      if (!selectedChart) {
        console.error('No chart selected, returning to select screen.');
        onBack();
        return;
      }

      try {
        setIsLoading(true);
        
        // --- START: ADD CRITICAL CHART DATA VALIDATION ---
        console.log('[Renderer] Loading PinChart:', selectedChart);
        if (!selectedChart || !selectedChart.notes || selectedChart.notes.length === 0) {
          console.error('[Renderer] CRITICAL: Chart data is missing or notes are empty!');
          alert('Chart data is invalid. Returning to selection.');
          onBack();
          return;
        }
        console.log('[Renderer] Chart validation passed - notes count:', selectedChart.notes.length);
        // --- END: ADD CRITICAL CHART DATA VALIDATION ---
        
        setPinChart(selectedChart);

        // Load main audio track
        if (selectedChart.audioFilename) {
          await audioService.loadAudio(selectedChart.audioFilename);
          console.log(`[GameScene] Main audio loaded: ${selectedChart.audioFilename}`);
        }

        // --- [수정] 안전한 히트 사운드 로딩 로직 ---

        // 개별 애셋을 안전하게 로드하는 헬퍼 함수
        const loadSoundSafely = async (soundKey: string, fileName: string) => {
          try {
            const assetUri = `${selectedChart.folderPath}/${fileName}`;
            console.log(`[HITSOUND DEBUG] Attempting to load sound: ${assetUri} as '${soundKey}'`);
            console.log(`[HITSOUND DEBUG] selectedChart.folderPath: ${selectedChart.folderPath}`);
            
            // Use selectedChart directly instead of waiting for pinChart state
            if (selectedChart && selectedChart.folderPath) {
              await audioService.loadHitsound(soundKey, assetUri);
              console.log(`[HITSOUND DEBUG] Successfully loaded sound: ${assetUri} as '${soundKey}'`);
            } else {
              console.error(`[HITSOUND DEBUG] Cannot load sound - missing selectedChart or folderPath`);
              console.error(`[HITSOUND DEBUG] selectedChart:`, selectedChart);
            }
          } catch (e) {
            // 개별 사운드 로딩에 실패하더라도, 전체 프로세스를 중단시키지 않고 경고만 남깁니다.
            console.error(`[HITSOUND DEBUG] FAILED to load sound asset: ${fileName}`, e);
          }
        };

        // 로드하려는 사운드 목록 - 모두 optional이므로 실패해도 게임 진행
        console.log(`[HITSOUND DEBUG] Starting hitsound loading - all optional`);
        await loadSoundSafely('normal-hitnormal', 'normal-hitnormal.wav');
        await loadSoundSafely('combobreak', 'combobreak.wav');
        await loadSoundSafely('normal-hitwhistle', 'normal-hitwhistle.wav');
        console.log(`[HITSOUND DEBUG] Hitsound loading completed - game can proceed without them`);

        // --- 수정 끝 ---

        // Set background path if available
        // Set video or background
        if (selectedChart.videoPath) {
          setVideoPath(selectedChart.videoPath);
          setBackgroundUrl(null); // Ensure static bg is cleared
        } else if (selectedChart.backgroundPath) {
          setVideoPath(null); // Ensure video is cleared
          // Load the background image as a blob URL to use in styles
          try {
            const imageBuffer = await (window as any).electron.loadAsset(selectedChart.backgroundPath);
            const blob = new Blob([imageBuffer], { type: 'image/jpeg' }); // Adjust type if needed
            const url = URL.createObjectURL(blob);
            setBackgroundUrl(url);
          } catch (bgError) {
            console.error('Failed to load background image:', bgError);
            setBackgroundUrl(null);
          }
        } else {
          // No video or background
          setVideoPath(null);
          setBackgroundUrl(null);
        }

        setIsLoading(false);
        console.log(`[GameScene] Asset loading completed successfully`);
      } catch (error: unknown) {
        console.error('Failed to load game assets:', error);
        setIsLoading(false);
        
        // Show user-friendly error
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        alert(`Failed to load game assets: ${errorMessage}\n\nReturning to song selection.`);
        
        // Return to select scene
        onBack();
      }
    };

    loadGameAssets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChart]);

  // Set up game update listener
  useEffect(() => {
    const removeOnGameUpdate = (window as any).electron.onGameUpdate((gameUpdate: any) => {
      // The game state is updated via IPC from the main process.
      updateGame(gameUpdate);
    });

    // This effect should only run once on mount to set up the listener.
    return () => {
      removeOnGameUpdate();
      audioService.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!gameStarted || isPaused) return;

      if (event.code === 'Space') {
        event.preventDefault();
        handlePinPress();
      }
    };

    if (gameStarted && !isPaused) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameStarted, isPaused]);

  // Pause/unpause controls
  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Escape') {
        event.preventDefault();
        togglePause();
      }
    };

    if (gameStarted) {
      window.addEventListener('keydown', handleGlobalKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [gameStarted, togglePause]);

  const handleRestart = () => {
    reset();
    togglePause();
    handleStartGame();
  };

  const handleBackToMenu = () => {
    reset();
    togglePause();
    onBack();
  };

  // Render different states
  if (!gameStarted) {
    return (
      <div>
        <div className="absolute top-0 left-0 bg-orange-500 text-white p-4 z-50 text-lg font-bold">
          PRE-GAME STATE - gameStarted: {gameStarted ? 'YES' : 'NO'}
        </div>
        <PreGameLobby
          chart={pinChart}
          isLoading={isLoading}
          onStartGame={handleStartGame}
          onBackToMenu={onBack}
        />
      </div>
    );
  }

  if (isPaused) {
    return (
      <PauseMenu
        onResume={togglePause}
        onRestart={handleRestart}
        onBackToMenu={handleBackToMenu}
      />
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Background: Video > Static Image > Fallback */}
      {videoPath ? (
        <VideoController key={videoPath} videoPath={videoPath} />
      ) : backgroundUrl ? (
        <div
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${backgroundUrl})` }}
        />
      ) : (
        <div className="absolute inset-0 z-0 bg-gray-900" />
      )}

      {/* MEGA DEBUG OVERLAY FOR GAMESCENE - ALWAYS VISIBLE */}
      <div 
        className="fixed top-0 right-0 bg-blue-600 text-white p-6 z-50"
        style={{ 
          fontSize: '20px', 
          fontWeight: 'bold',
          boxShadow: '0 0 50px rgba(0, 0, 255, 1)',
          zIndex: 99998,
          minWidth: '400px'
        }}
      >
        🎮 GAMESCENE STATUS:<br/>
        pinChart: {pinChart ? 'EXISTS' : 'NULL'}<br/>
        gameMode: {pinChart?.gameMode || 'NONE'}<br/>
        gameStarted: {gameStarted ? 'YES' : 'NO'}<br/>
        isPaused: {isPaused ? 'YES' : 'NO'}<br/>
        Chart Title: {pinChart?.title || 'N/A'}
      </div>

      {/* Game View */}
      <div className="absolute top-20 left-4 bg-green-500 text-white p-4 z-50 text-lg font-bold">
        GameScene Debug:
        <br />pinChart: {pinChart ? 'EXISTS' : 'NULL'}
        <br />gameMode: {pinChart?.gameMode || 'NONE'}
        <br />gameStarted: {gameStarted ? 'YES' : 'NO'}
      </div>
      
      {/* ALWAYS TRY TO RENDER PINGAMEVIEW FOR DEBUGGING */}
      {(() => {
        console.log('[GameScene] About to render game view. pinChart:', !!pinChart, 'gameMode:', pinChart?.gameMode);
        return null;
      })()}
      
      {pinChart && (
        (() => {
          console.log('[GameScene] FORCE RENDERING PinGameView - Original gameMode:', pinChart.gameMode, '-> FORCING PIN MODE');
          // FORCE PIN GAME MODE FOR DEBUGGING - Always render PinGameView regardless of gameMode
          const forcedPinChart = { ...pinChart, gameMode: 'pin' as const };
          return (
            <div className="absolute inset-0 bg-blue-500/20">
              <div className="absolute top-0 left-0 bg-purple-500 text-white p-4 z-50 text-lg font-bold">
                🎯 RENDERING PinGameView! (FORCED MODE - Original: {pinChart.gameMode})
              </div>
              <PinGameView
                chart={forcedPinChart}
                onPinThrow={handlePinPress}
                score={score}
                combo={combo}
                judgment={judgment}
                noteSpeed={500}
              />
            </div>
          );
        })()
      )}
      
      {/* FORCE RENDER PINGAMEVIEW ALWAYS FOR DEBUGGING - REMOVE LATER */}
      <div 
        className="fixed bottom-0 left-0 w-full bg-orange-500 text-white p-4 z-50"
        style={{ fontSize: '16px', zIndex: 99997 }}
      >
        🔍 DEBUG: pinChart={pinChart ? 'YES' : 'NO'} | gameMode={pinChart?.gameMode || 'N/A'} | 
        Chart Details: {pinChart ? `${pinChart.title} - ${pinChart.notes?.length} notes` : 'No chart'}
      </div>
      
      {/* Debug info overlay */}
      <div className="absolute top-4 right-4 bg-black/50 text-white p-2 text-sm z-50">
        <div>Chart: {pinChart?.title || 'None'}</div>
        <div>Notes: {pinChart?.notes?.length || 0}</div>
        <div>Game Started: {gameStarted ? 'Yes' : 'No'}</div>
        <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
        <div>Audio Time: {audioService.getCurrentTime().toFixed(2)}s</div>
      </div>
    </div>
  );
};

export default GameScene;
