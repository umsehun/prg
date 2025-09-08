// src/renderer/components/game/PinGameView.tsx - 정리된 버전
'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useKnifePhysics } from '../../hooks/useKnifePhysics';
import ApproachCircle from './ApproachCircle';
import AccuracyDisplay from './AccuracyDisplay';
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
  console.log('🚀 [PinGameView] UPDATED COMPONENT LOADED - NEW VERSION!', chart?.title);
  console.log('🎯 [PinGameView] Component mounted with chart:', chart?.title, 'notes:', chart?.notes?.length);

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
    setJudgmentWindows,
    updateGameTime
  } = useKnifePhysics({
    targetRadius: 80,
    velocity: 400,
    rotationSpeed: 540,
    isGameActive: true
  });

  // Constants for approach circles
  const APPROACH_TIME = 2000; // ms for circle to shrink
  const TARGET_RADIUS = 80;

  // Update game time and sync with physics worker
  useEffect(() => {
    const interval = setInterval(() => {
      const currentGameTime = audioService.getCurrentTime() * 1000;
      timeMsRef.current = currentGameTime;
      // Send current game time to physics worker for accurate judgment
      updateGameTime(currentGameTime);
    }, 16);
    return () => clearInterval(interval);
  }, [updateGameTime]);

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
    if (!chart?.notes) {
      console.log('[PinGameView] No chart or notes available for approach circles');
      return;
    }

    console.log('[PinGameView] Setting up approach circles for', chart.notes.length, 'notes');

    const interval = setInterval(() => {
      const currentTime = timeMsRef.current;

      // 🚨 CRITICAL DEBUG: Time unit validation
      if (chart?.notes && chart.notes.length > 0) {
        const firstNote = chart.notes[0];
        if (firstNote && Math.floor(currentTime / 1000) % 5 === 0) {
          console.log('🕐 TIME UNIT VALIDATION:');
          console.log(`  currentTime: ${currentTime}ms (from audioService)`);
          console.log(`  firstNote.time: ${firstNote.time} (from chart data)`);
          console.log(`  firstNote.time * 1000: ${firstNote.time * 1000}ms`);
        }
      }

      // Find notes that should have approach circles
      // 🔧 FIX: note.time is already in SECONDS, not milliseconds!
      const upcomingNotes = chart.notes.filter(note => {
        const noteTimeMs = note.time * 1000; // Convert seconds to milliseconds
        const timeUntilNote = noteTimeMs - currentTime;
        return timeUntilNote > 0 && timeUntilNote <= APPROACH_TIME;
      });

      // Create approach circles for new notes
      const newCircles: ApproachCircleData[] = upcomingNotes.map(note => {
        const noteTimeMs = note.time * 1000;
        const timeUntilNote = noteTimeMs - currentTime;
        // Scale should start large (2.0) and shrink to 1.0 as note approaches
        const scale = Math.max(1.0, Math.min(2.0, 1.0 + (timeUntilNote / APPROACH_TIME)));

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
    console.log('[PinGameView] Current knives before throw:', knives?.length || 0);
    setIsThrowingKnife(true);
    physicsThrowKnife();

    // Reset throwing state
    setTimeout(() => setIsThrowingKnife(false), 150);
  }, [isThrowingKnife, physicsThrowKnife, knives]);

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

  // Debug logging
  console.log('[PinGameView] Knives:', knives?.length || 0, 'KnifePositions:', knifePositions?.length || 0);
  if (knifePositions?.length > 0) {
    console.log('[PinGameView] First knife position:', knifePositions[0]);
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center" style={{ zIndex: 10 }}>
      {/* Game area - centered container */}
      <div className="relative flex items-center justify-center" style={{ width: '100vw', height: '100vh', zIndex: 10 }}>

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

        {/* Approach circles - temporarily disabled for debugging */}
        {/* {approachCircles.map(circle => (
          <ApproachCircle
            key={circle.id}
            radius={TARGET_RADIUS}
            scale={circle.scale}
            opacity={Math.max(0.3, circle.scale)}
          />
        ))} */}

        {/* Simple timing indicator circles */}
        {approachCircles.map(circle => (
          <div
            key={circle.id}
            className="absolute rounded-full border-4 pointer-events-none"
            style={{
              width: `${TARGET_RADIUS * 2 * circle.scale}px`,
              height: `${TARGET_RADIUS * 2 * circle.scale}px`,
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              borderColor: circle.scale > 1.6 ? '#ff4444' : circle.scale > 1.3 ? '#ff8844' : '#44ff44',
              opacity: Math.max(0.3, 1.0 - (circle.scale - 1.0)),
              boxShadow: `0 0 16px ${circle.scale > 1.6 ? '#ff4444' : circle.scale > 1.3 ? '#ff8844' : '#44ff44'}`,
            }}
          />
        ))}

        {/* Knives - positioned relative to center */}
        {knifePositions.map(({ knife, position }) => (
          <div
            key={knife.id}
            className="absolute"
            style={{
              left: '50%',
              top: '50%',
              transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px) rotate(${position.rotation}deg)`,
              transformOrigin: 'center center'
            }}
          >
            {/* Knife blade (triangular tip) */}
            <div
              className="absolute bg-gradient-to-r from-gray-300 to-gray-100"
              style={{
                width: '0',
                height: '0',
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderBottom: '20px solid #e5e7eb',
                top: '-20px',
                left: '-6px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}
            />
            {/* Knife handle */}
            <div
              className="bg-gradient-to-r from-amber-800 to-amber-600"
              style={{
                width: '12px',
                height: '40px',
                borderRadius: '2px',
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.2), 0 2px 4px rgba(0,0,0,0.3)',
                transform: 'translateX(-6px)'
              }}
            />
          </div>
        ))}
      </div>

      {/* UI Elements */}
      <div className="absolute top-4 left-4 text-white text-lg">
        <div className="bg-red-500 p-2 rounded mb-2">🚀 UPDATED VERSION!</div>
        <div className="bg-blue-500 p-1 rounded mb-1 text-sm">
          ⏰ Time: {(timeMsRef.current / 1000).toFixed(2)}s
        </div>
        <div className="bg-green-500 p-1 rounded mb-1 text-sm">
          🎵 Notes: {chart?.notes?.length || 0} | Circles: {approachCircles.length}
        </div>
        <div>Score: {score}</div>
        <div>Combo: {combo}</div>
        <div>Knives: {knives.length}</div>
      </div>

      {/* Judgment Display */}
      <JudgmentDisplay judgment={judgment} />

      {/* Accuracy Display */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
        <AccuracyDisplay accuracy={Math.min(100, Math.max(0, (score / Math.max(1, (score + combo * 10))) * 100))} />
      </div>

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
