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
import { PinChart, Judgment } from '../../../shared/types';

interface GameSceneProps {
  selectedChart: PinChart;
  onBack: () => void;
}

const GameScene: React.FC<GameSceneProps> = ({
  selectedChart,
  onBack
}) => {
  console.log('[GameScene] Component rendered with chart:', selectedChart?.title, 'gameMode:', selectedChart?.gameMode);

  // Game store
  const {
    score,
    combo,
    judgment,
    updateGame,
    togglePause,
    reset,
    isPaused
  } = useGameStore();

  const [gameStarted, setGameStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPreGameLobby, setShowPreGameLobby] = useState(true);
  const [pinChart, setPinChart] = useState<PinChart | null>(null);
  const [videoPath, setVideoPath] = useState<string | null>(null);
  const [backgroundUrl, setBackgroundUrl] = useState<string | null>(null);

  const handlePinPress = (judgment?: Judgment) => {
    if (!gameStarted || isPaused) {
      return;
    }

    // If called from PinGameView with judgment, update game state
    if (judgment) {
      // Update game state with the judgment result
      console.log('[GameScene] Received judgment:', judgment);
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

  // Handle game start
  const handleStartGame = () => {
    console.log('[GameScene] Starting game with pinChart:', pinChart?.title, 'notes:', pinChart?.notes?.length);
    setGameStarted(true);
    setShowPreGameLobby(false);
    if (pinChart) {
      (window as any).electron.startGame(pinChart);

      // Start audio playback
      if (pinChart.audioFilename) {
        console.log('[GameScene] Starting audio playback:', pinChart.audioFilename);
        audioService.play();
      }
    } else {
      console.error('[GameScene] Cannot start game - no pinChart available');
    }
  };

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

      {/* Game view rendering based on chart gameMode */}
      {pinChart && (
        (() => {
          console.log('[GameScene] Rendering game view. GameMode:', pinChart.gameMode);
          if (pinChart.gameMode === 'pin') {
            console.log('[GameScene] Rendering PinGameView');
            return (
              <PinGameView
                chart={pinChart}
                onPinThrow={handlePinPress}
                score={score}
                combo={combo}
                judgment={judgment}
                noteSpeed={500}
              />
            );
          } else if (pinChart.gameMode === 'osu') {
            console.log('[GameScene] Rendering OsuGameView');
            return (
              <OsuGameView
                chart={pinChart}
              />
            );
          } else {
            console.log('[GameScene] Unsupported gameMode:', pinChart.gameMode);
            return (
              <div className="flex items-center justify-center h-full">
                <div className="text-white text-xl">
                  Unsupported game mode: {pinChart.gameMode}
                </div>
              </div>
            );
          }
        })()
      )}

      {/* Simple debug info overlay */}
      <div className="absolute top-4 right-4 bg-black/50 text-white p-2 text-sm z-50 rounded">
        <div>Chart: {pinChart?.title || 'None'}</div>
        <div>Mode: {pinChart?.gameMode || 'Unknown'}</div>
        <div>Notes: {pinChart?.notes?.length || 0}</div>
        <div>Status: {gameStarted ? 'Playing' : isLoading ? 'Loading' : 'Ready'}</div>
        <div>Audio: {audioService.getCurrentTime().toFixed(2)}s</div>
      </div>
    </div>
  );
};

export default GameScene;
