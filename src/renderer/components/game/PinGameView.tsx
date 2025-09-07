// src/renderer/components/game/PinGameView.tsx
'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import JudgmentDisplay from './JudgmentDisplay';
import { Note, Judgment, PinChart } from '../../../shared/types';
import { audioService } from '../../lib/AudioService';
import { useKnifePhysics } from '../../hooks/useKnifePhysics';

interface PinGameViewProps {
  chart: PinChart | null;
  onPinThrow: () => void;
  score: number;
  combo: number;
  judgment: Judgment | null;
  noteSpeed: number;
}

interface ApproachCircle {
  id: string;
  noteTime: number;
  startTime: number;
  uniqueKey: string;
  scale: number;
}

const PinGameView: React.FC<PinGameViewProps> = ({
  chart,
  onPinThrow,
  score,
  combo,
  judgment,
  noteSpeed,
}) => {
  const [isThrowingKnife, setIsThrowingKnife] = useState(false);
  const [approachCircles, setApproachCircles] = useState<ApproachCircle[]>([]);
  const timeMsRef = useRef<number>(0);
  const targetRef = useRef<HTMLDivElement>(null);

  // 접근 시간 계산 (노트 속도에 따라 조정) - useMemo로 안정화
  const APPROACH_TIME = useMemo(() => Math.max(400, 2000 - noteSpeed), [noteSpeed]);
  const TARGET_RADIUS = 128;

  // 물리 엔진 초기화
  const {
    knives,
    throwKnife: physicsThrowKnife,
    getKnivesPositions,
    resetKnives,
    stuckKnivesCount,
    setHitCallback
  } = useKnifePhysics({
    targetRadius: TARGET_RADIUS,
    velocity: 400,
    rotationSpeed: 540,
    isGameActive: true // Always active for now to debug
  });

  // 디버깅 로그 추가
  useEffect(() => {
    console.log('[PinGameView] Chart:', chart?.title);
    console.log('[PinGameView] Knives count:', knives.length);
    console.log('[PinGameView] Approach circles count:', approachCircles.length);
    console.log('[PinGameView] Current time:', timeMsRef.current);
    console.log('[PinGameView] Stuck knives count:', stuckKnivesCount);
    console.log('[PinGameView] Notes in chart:', chart?.notes?.length || 0);
    console.log('[PinGameView] Audio service time:', audioService.getCurrentTime());
  }, [chart, knives.length, approachCircles.length, stuckKnivesCount]);

  // 접근 원 생성 로직 디버깅
  useEffect(() => {
    if (!chart?.notes) return;

    const currentTimeMs = timeMsRef.current;
    const upcomingNotes = chart.notes.filter(note => {
      const noteStartTime = note.time * 1000 - APPROACH_TIME;
      const noteEndTime = note.time * 1000 + 1000; // 1초 여유
      return currentTimeMs >= noteStartTime && currentTimeMs <= noteEndTime;
    });

    console.log('[PinGameView] Current time:', currentTimeMs, 'Upcoming notes:', upcomingNotes.length);
    
    if (upcomingNotes.length > 0) {
      console.log('[PinGameView] First upcoming note:', upcomingNotes[0]);
    }
  }, [chart, timeMsRef.current]);

  // Set up internal timer for rendering, driven by the audio service
  useEffect(() => {
    let rafId: number;
    const tick = () => {
      timeMsRef.current = audioService.getCurrentTime() * 1000;
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  // Clean up approach circles
  useEffect(() => {
    const intervalId = setInterval(() => {
      const currentTime = audioService.getCurrentTime() * 1000;

      setApproachCircles(prevCircles => {
        const updatedCircles = prevCircles.map(circle => ({
          ...circle,
          scale: Math.max(0.1, 1 - (currentTime - circle.startTime) / APPROACH_TIME)
        })).filter(circle => currentTime - circle.startTime < APPROACH_TIME);

        // Only update if there's a meaningful change
        if (updatedCircles.length !== prevCircles.length ||
          updatedCircles.some((circle, i) => prevCircles[i] && Math.abs(circle.scale - prevCircles[i].scale) > 0.01)) {
          return updatedCircles;
        }
        return prevCircles;
      });
    }, 150);

    return () => clearInterval(intervalId);
  }, [APPROACH_TIME]);

  // Generate approach circles with interval-based updates
  useEffect(() => {
    if (!chart?.notes) {
      console.log('[PinGameView] No chart or notes available');
      return;
    }

    console.log('[PinGameView] Setting up approach circle generation for', chart.notes.length, 'notes');

    const intervalId = setInterval(() => {
      const currentTimeMs = timeMsRef.current;
      
      // FORCE CREATE APPROACH CIRCLES FOR DEBUGGING - Create circles for the first few notes regardless of timing
      const debugNotes = chart.notes.slice(0, 3);
      console.log('[PinGameView] FORCE DEBUG: Creating circles for first 3 notes at time:', currentTimeMs);
      
      const debugCircles = debugNotes.map((note: Note, index: number) => ({
        id: `debug-circle-${note.time}-${index}`,
        noteTime: note.time * 1000,
        startTime: currentTimeMs,
        uniqueKey: `debug-${note.time}-${currentTimeMs}-${index}`,
        scale: 1,
      }));

      setApproachCircles((prev) => {
        if (prev.length === 0) {
          console.log('[PinGameView] FORCE DEBUG: Adding', debugCircles.length, 'debug approach circles');
          return debugCircles;
        }
        return prev;
      });
      
      // Original logic for upcoming notes
      const upcomingNotes = chart.notes.filter((note: Note) => {
        const noteTimeMs = note.time * 1000;
        const isUpcoming = noteTimeMs > currentTimeMs && noteTimeMs <= currentTimeMs + APPROACH_TIME;
        return isUpcoming;
      });

      if (upcomingNotes.length > 0) {
        console.log('[PinGameView] Found', upcomingNotes.length, 'upcoming notes at time:', currentTimeMs);
      }

      const newCircles = upcomingNotes.map((note: Note) => ({
        id: `circle-${note.time}`,
        noteTime: note.time * 1000,
        startTime: currentTimeMs,
        uniqueKey: `${note.time}-${currentTimeMs}`,
        scale: 1,
      }));

      setApproachCircles((prev) => {
        const existingIds = new Set(prev.map((c: ApproachCircle) => c.id));
        const filteredNew = newCircles.filter((c: ApproachCircle) => !existingIds.has(c.id));
        
        if (filteredNew.length > 0) {
          console.log('[PinGameView] Adding', filteredNew.length, 'new approach circles');
          return [...prev, ...filteredNew];
        }
        return prev;
      });
    }, 100); // Check every 100ms for new notes

    return () => clearInterval(intervalId);
  }, [chart?.notes, APPROACH_TIME]);

  // GameController와 연동하여 판정 처리
  useEffect(() => {
    setHitCallback((hitTime: number) => {
      // 물리 엔진에서 칼이 목표물에 도달했을 때 GameController의 판정 로직 호출
      onPinThrow(); // 이미 onPinThrow가 GameController.handlePinPress를 호출함
    });
  }, [onPinThrow, setHitCallback]);

  // FORCE THROW KNIFE FOR DEBUGGING - Throw a knife every 2 seconds
  useEffect(() => {
    console.log('[PinGameView] Setting up auto knife throwing for debugging');
    const intervalId = setInterval(() => {
      console.log('[PinGameView] FORCE DEBUG: Throwing knife automatically');
      physicsThrowKnife();
    }, 2000);

    return () => clearInterval(intervalId);
  }, [physicsThrowKnife, onPinThrow]);

  const handleThrowKnife = useCallback(() => {
    if (isThrowingKnife) return;

    setIsThrowingKnife(true);
    physicsThrowKnife(); // 물리 엔진에서 칼 던지기 (판정은 칼이 도달할 때 자동 처리)
    
    setTimeout(() => setIsThrowingKnife(false), 150);
  }, [isThrowingKnife, physicsThrowKnife]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.code === 'KeyS' && !isThrowingKnife) {
      handleThrowKnife();
    }
  }, [isThrowingKnife, handleThrowKnife]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center">
      {/* UI Overlay */}
      <div className="absolute top-8 left-8 text-white z-20 bg-black/30 p-4 rounded-xl backdrop-blur-sm border border-white/10 shadow-lg">
        <div className="text-3xl font-bold tracking-tighter">Score: {score}</div>
        <div className="text-xl mt-1">Combo: {combo}</div>
      </div>

      {/* Game Area */}
      <div className="relative w-96 h-96 flex items-center justify-center">
        {/* Target Circle (Hit Circle) */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-64 h-64 bg-red-500/20 rounded-full border-4 border-red-500 shadow-lg"
            style={{ boxShadow: '0 0 30px rgba(239, 68, 68, 0.5)' }}
          />
        </div>

        {/* Approach Circles (osu! style) - FORCE VISIBLE FOR DEBUG */}
        {approachCircles.map(circle => {
          const nowMs = timeMsRef.current;
          const timeElapsed = nowMs - circle.startTime;
          const progress = Math.min(1, timeElapsed / APPROACH_TIME);

          // Start large and shrink to target size (ensure perfect circle)
          const maxSize = 400;
          const minSize = 256; // Target circle size
          const currentSize = maxSize - (progress * (maxSize - minSize));

          // Fade out as it approaches the target
          const opacity = Math.max(0.4, 1 - progress * 0.6);

          return (
            <div
              key={circle.uniqueKey}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <div
                className="rounded-full border-4 border-blue-400"
                style={{
                  width: `${currentSize}px`,
                  height: `${currentSize}px`,
                  opacity,
                  boxShadow: `0 0 20px rgba(96, 165, 250, ${opacity * 0.8})`,
                  transition: 'none',
                  aspectRatio: '1',
                  flexShrink: 0,
                }}
              />
            </div>
          );
        })}
        
        {/* FORCE RENDER TEST CIRCLE - ALWAYS VISIBLE - ENHANCED */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
          <div
            className="rounded-full border-8 border-yellow-400 animate-pulse"
            style={{
              width: '300px',
              height: '300px',
              opacity: 1.0,
              boxShadow: '0 0 50px rgba(255, 255, 0, 1.0), inset 0 0 30px rgba(255, 255, 0, 0.3)',
              backgroundColor: 'rgba(255, 255, 0, 0.4)',
              transform: 'scale(1.1)',
            }}
          >
            <div className="absolute inset-4 rounded-full border-4 border-red-500 bg-red-500/20" />
          </div>
        </div>
        
        {/* DEBUG TEXT OVERLAY */}
        <div className="absolute top-0 left-0 bg-red-500 text-white p-4 z-50 text-lg font-bold">
          PinGameView is rendering!
          <br />Circles: {approachCircles.length}
          <br />Knives: {knives.length}
          <br />Time: {timeMsRef.current.toFixed(0)}ms
        </div>

        {/* Rotating Pin (Knife Hit style) */}
        <div
          ref={targetRef}
          className="absolute inset-0 flex items-center justify-center z-10 animate-spin"
          style={{ animationDuration: '3s', animationTimingFunction: 'linear' }}
        >
          {/* Pin center */}
          <div className="w-8 h-8 bg-gray-600 rounded-full border-2 border-gray-400 shadow-lg" />
        </div>

        {/* Knives - 물리 엔진에서 관리 */}
        {getKnivesPositions().map(({ knife, position }) => (
          <div
            key={knife.id}
            className="absolute left-1/2 top-1/2 z-20"
            style={{
              // Center first, then move to (x,y), then rotate
              transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px) rotate(${position.rotation}deg)`,
            }}
          >
            <svg width="18" height="64" viewBox="0 0 18 64" fill="none">
              <path d="M9 2 L16 34 L2 34 Z" fill="#d1d5db" stroke="#e5e7eb" strokeWidth="1" />
              <rect x="3" y="34" width="12" height="4" rx="2" fill="#9ca3af" />
              <rect x="5.5" y="38" width="7" height="18" rx="2" fill="#92400e" />
              <circle cx="9" cy="58" r="4" fill="#78350f" />
            </svg>
          </div>
        ))}
        
        {/* FORCE RENDER TEST KNIFE - ALWAYS VISIBLE - ENHANCED */}
        <div
          className="absolute left-1/2 top-1/2 z-20 animate-bounce"
          style={{
            transform: `translate(-50%, -50%) translate(0px, 100px) rotate(0deg)`,
            filter: 'drop-shadow(0 0 10px rgba(255, 0, 0, 0.8))',
          }}
        >
          <svg width="24" height="80" viewBox="0 0 24 80" fill="none">
            <path d="M12 2 L20 40 L4 40 Z" fill="#ff0000" stroke="#ffffff" strokeWidth="2" />
            <rect x="4" y="40" width="16" height="6" rx="3" fill="#ff0000" stroke="#ffffff" strokeWidth="1" />
            <rect x="7" y="46" width="10" height="24" rx="3" fill="#cc0000" stroke="#ffffff" strokeWidth="1" />
            <circle cx="12" cy="72" r="6" fill="#990000" stroke="#ffffff" strokeWidth="1" />
          </svg>
        </div>

        {/* Combo Display */}
        {combo > 2 && (
          <div className="absolute -bottom-20 text-5xl font-black text-yellow-300 animate-pulse z-30">
            <span style={{ textShadow: '0 0 15px rgba(253, 224, 71, 0.8)' }}>
              {combo} COMBO!
            </span>
          </div>
        )}

        {/* Judgment Display */}
        <JudgmentDisplay judgment={judgment as Judgment | null} />
      </div>
    </div>
  );
};

export default PinGameView;
