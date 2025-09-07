// src/renderer/components/game/PinGameView.tsx - 정리된 버전
'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useKnifePhysics } from '../../hooks/useKnifePhysics';
import ApproachCircle from './ApproachCircle';
import JudgmentDisplay from './JudgmentDisplay';
import { Note, Judgment, PinChart } from '../../../shared/types';
import { audioService } from '../../lib/AudioService';

interface PinGameViewProps {
  chart: PinChart;
  onPinThrow: (judgment: Judgment) => void;
  score: number;
  combo: number;
  judgment: Judgment | null;
  noteSpeed: number;
}

interface ApproachCircleData {
  id: string;
  noteTime: number;
  startTime: number;
  scale: number;
}

const PinGameView: React.FC<PinGameViewProps> = ({
  chart,
  onPinThrow,
  score,
  combo,
  judgment,
  noteSpeed
}) => {
  // Game state
  const [approachCircles, setApproachCircles] = useState<ApproachCircleData[]>([]);
  const [isThrowingKnife, setIsThrowingKnife] = useState(false);
  const timeMsRef = useRef(0);

  // Physics system
  const {
    knives,
    throwKnife: physicsThrowKnife,
    getKnivesPositions,
    setHitCallback,
    setActiveNotes,
    setJudgmentWindows
  } = useKnifePhysics({
    targetRadius: 80,
    velocity: 400,
    rotationSpeed: 540,
    isGameActive: true
  });

  // Constants for approach circles
  const APPROACH_TIME = 2000; // ms for circle to shrink
  const TARGET_RADIUS = 80;

  // Update game time
  useEffect(() => {
    const interval = setInterval(() => {
      timeMsRef.current = audioService.getCurrentTime() * 1000;
    }, 16);
    return () => clearInterval(interval);
  }, []);

  // Initialize physics system with chart notes
  useEffect(() => {
    if (chart?.notes) {
      console.log('[PinGameView] Setting active notes for physics:', chart.notes.length);
      // Convert chart notes to physics format (time in milliseconds)
      const physicsNotes = chart.notes.map(note => ({
        time: note.time * 1000 // Convert to milliseconds
      }));
      setActiveNotes(physicsNotes);

      // Calculate dynamic judgment windows based on chart difficulty
      const OD = chart.metadata?.overallDifficulty ?? 5;

      // Calculate OD-based windows (using osu! standard formula)
      const w300 = 80 - 6 * OD; // KOOL window
      const w100 = 140 - 8 * OD; // COOL window  
      const w50 = 200 - 10 * OD; // GOOD window
      const wMiss = Math.max(w50 + 40, w100 + 20); // MISS window

      const judgmentWindows = {
        KOOL: Math.max(w300, 15), // minimum 15ms
        COOL: Math.max(w100, 50), // minimum 50ms
        GOOD: Math.max(w50, 100), // minimum 100ms
        MISS: Math.max(wMiss, 150) // minimum 150ms
      };

      console.log('[PinGameView] Setting judgment windows:', judgmentWindows);

      // Send judgment windows to physics worker
      setJudgmentWindows(judgmentWindows);
    }
  }, [chart, setActiveNotes, setJudgmentWindows]);

  // Handle physics hit callback
  useEffect(() => {
    const handleHit = (hitData: any) => {
      console.log('[PinGameView] Physics hit:', hitData);
      // hitData now contains: { hitTime, timingError, judgment, noteId, accuracy }
      if (hitData.judgment) {
        onPinThrow(hitData.judgment);
      }
    };

    setHitCallback(handleHit);
  }, [setHitCallback, onPinThrow]);

  // Generate approach circles for upcoming notes
  useEffect(() => {
    if (!chart?.notes) return;

    const interval = setInterval(() => {
      const currentTime = timeMsRef.current;

      // Find notes that should have approach circles
      const upcomingNotes = chart.notes.filter(note => {
        const noteTimeMs = note.time * 1000;
        const timeUntilNote = noteTimeMs - currentTime;
        return timeUntilNote > 0 && timeUntilNote <= APPROACH_TIME;
      });

      // Create approach circles for new notes
      const newCircles: ApproachCircleData[] = upcomingNotes.map(note => {
        const noteTimeMs = note.time * 1000;
        const timeUntilNote = noteTimeMs - currentTime;
        const scale = Math.max(0.1, timeUntilNote / APPROACH_TIME);

        return {
          id: `circle-${note.time}`,
          noteTime: noteTimeMs,
          startTime: currentTime - (APPROACH_TIME - timeUntilNote),
          scale
        };
      });

      setApproachCircles(newCircles);
    }, 100);

    return () => clearInterval(interval);
  }, [chart, APPROACH_TIME]);

  // Handle knife throwing
  const handleThrowKnife = useCallback(() => {
    if (isThrowingKnife) return;

    console.log('[PinGameView] Throwing knife at time:', timeMsRef.current);
    setIsThrowingKnife(true);
    physicsThrowKnife();

    // Reset throwing state
    setTimeout(() => setIsThrowingKnife(false), 150);
  }, [isThrowingKnife, physicsThrowKnife]);

  // Keyboard input
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'KeyS' && !isThrowingKnife) {
        handleThrowKnife();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleThrowKnife, isThrowingKnife]);

  // Get knife positions for rendering
  const knifePositions = getKnivesPositions();

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center bg-gray-900">
      {/* Game area - centered container */}
      <div className="relative flex items-center justify-center" style={{ width: '100vw', height: '100vh' }}>

        {/* Target container - absolute positioned center */}
        <div
          className="absolute flex items-center justify-center"
          style={{
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: `${TARGET_RADIUS * 2}px`,
            height: `${TARGET_RADIUS * 2}px`
          }}
        >
          {/* Rotating target */}
          <div
            className="w-full h-full rounded-full border-4 border-white flex items-center justify-center"
            style={{
              animation: 'spin 5s linear infinite'
            }}
          >
            <div className="text-white text-lg font-bold">TARGET</div>
          </div>
        </div>

        {/* Approach circles - same positioning as target */}
        {approachCircles.map(circle => (
          <ApproachCircle
            key={circle.id}
            radius={TARGET_RADIUS}
            scale={circle.scale}
            opacity={Math.max(0.3, circle.scale)}
          />
        ))}

        {/* Knives - positioned relative to center */}
        {knifePositions.map(({ knife, position }) => (
          <div
            key={knife.id}
            className="absolute w-4 h-16 bg-gray-300"
            style={{
              left: '50%',
              top: '50%',
              transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px) rotate(${position.rotation}deg)`,
              transformOrigin: 'center center'
            }}
          />
        ))}
      </div>

      {/* UI Elements */}
      <div className="absolute top-4 left-4 text-white text-lg">
        <div>Score: {score}</div>
        <div>Combo: {combo}</div>
        <div>Knives: {knives.length}</div>
      </div>

      {/* Judgment Display */}
      <JudgmentDisplay judgment={judgment} />

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 text-white text-sm">
        Press S to throw knife
      </div>

      {/* Simple debug info */}
      <div className="absolute top-4 right-4 bg-black/50 text-white p-2 text-sm rounded">
        <div>Chart: {chart?.title}</div>
        <div>Notes: {chart?.notes?.length || 0}</div>
        <div>Time: {(timeMsRef.current / 1000).toFixed(1)}s</div>
        <div>Circles: {approachCircles.length}</div>
      </div>

      {/* CSS for spinning animation */}
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default PinGameView;
