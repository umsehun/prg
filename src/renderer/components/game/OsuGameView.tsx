'use client';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { audioService } from '../../lib/AudioService';
import { preemptFromAR, approachScale, hitAlpha, windowsFromOD } from '../../lib/gameUtils';
import ApproachCircle from './ApproachCircle';
import { PinChart, Note, Judgment } from '../../../shared/types';
import HitErrorBar from './HitErrorBar';
import JudgmentText from './JudgmentText';
import HitParticles from './HitParticles';
import useGameStore from '../../store/gameStore';

interface OsuGameViewProps {
  chart: PinChart;
}

const HIT_CIRCLE_RADIUS = 48; // px

const JUDGMENT_COLORS: Record<Judgment, string> = {
  KOOL: '#00ffff',
  COOL: '#88ff88',
  GOOD: '#ffcc22',
  MISS: '#ff6666',
};

const OsuGameView: React.FC<OsuGameViewProps> = ({ chart }) => {
  const { score, combo, judgment, isPaused, updateGame, togglePause, reset } = useGameStore();
    const [hitErrors, setHitErrors] = useState<number[]>([]);
    const [judgments, setJudgments] = useState<Array<{ id: string; judgment: Judgment; hitError: number; x: number; y: number }>>([]);
  const [particles, setParticles] = useState<Array<{ id: string; x: number; y: number; color: string }>>([]);
  const [visibleNotes, setVisibleNotes] = useState<Note[]>([]);
  const timeMsRef = useRef<number>(0);

  const AR = chart.metadata?.approachRate ?? 5;
  const preempt = preemptFromAR(AR);
  const OD = chart.metadata?.overallDifficulty ?? 5;
  const { w300 } = windowsFromOD(OD);

  useEffect(() => {
    const removeOnGameUpdate = (window as any).electron.onGameUpdate((gameUpdate: any) => {
      if (gameUpdate.judgment && gameUpdate.hitError !== undefined) {
        const noteIndex = chart.notes.findIndex(n => n.time === gameUpdate.noteTime * 1000) % 8;
        const angle = (noteIndex / 8) * 360;
        const pos = getPositionOnCircle(angle, 150);

        const newId = `${Date.now()}`;
        const judgmentColor = JUDGMENT_COLORS[gameUpdate.judgment as Judgment] || '#ffffff';

        setJudgments(prev => [...prev, {
          id: newId,
          judgment: gameUpdate.judgment,
          hitError: gameUpdate.hitError,
          x: pos.x,
          y: pos.y,
        }]);

        if (gameUpdate.judgment !== 'MISS') {
          setParticles(prev => [...prev, { id: newId, x: pos.x, y: pos.y, color: judgmentColor }]);
          // Try to play hitsound, but don't fail if it's not loaded
          try {
            audioService.playHitsound('normal-hitnormal');
          } catch (e) {
            // Silently ignore hitsound errors to prevent game disruption
          }
        }
      }

      if (gameUpdate.hitError !== undefined) {
        setHitErrors(prev => [...prev.slice(-19), gameUpdate.hitError]); // Keep last 20 errors
      }
      updateGame(gameUpdate);
    });

    return () => {
      removeOnGameUpdate();
    };
  }, [updateGame, chart.notes]);

  const getPositionOnCircle = (angle: number, radius: number) => {
    const rad = (angle - 90) * (Math.PI / 180);
    return {
      x: Math.cos(rad) * radius,
      y: Math.sin(rad) * radius,
    };
  };

  useEffect(() => {
    let rafId: number;
    const loop = () => {
      const now = audioService.getCurrentTime() * 1000;
      timeMsRef.current = now;

      const newVisible = chart.notes.filter((note) => {
        const hitTime = note.time * 1000;
        const spawnTime = hitTime - preempt;
        return now >= spawnTime && now <= hitTime + 250; // hide shortly after hit time
      });
      setVisibleNotes(newVisible);

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [chart.notes, preempt]);

  const handleHit = useCallback(() => {
    if (isPaused) return;
    (window as any).electron.handlePinPress(audioService.getCurrentTime());
  }, [isPaused]);

  return (
    <div className="absolute inset-0 cursor-pointer" onClick={handleHit}>
            {particles.map((p) => (
        <div key={p.id} style={{ position: 'absolute', left: '50%', top: '50%', transform: `translate(calc(-50% + ${p.x}px), calc(-50% + ${p.y}px))` }}>
          <HitParticles
            color={p.color}
            onAnimationEnd={() => setParticles(prev => prev.filter(particle => particle.id !== p.id))}
          />
        </div>
      ))}

      {judgments.map((j) => (
        <div key={j.id} style={{ position: 'absolute', left: '50%', top: '50%', transform: `translate(calc(-50% + ${j.x}px), calc(-50% + ${j.y}px))` }}>
          <JudgmentText
            judgment={j.judgment}
            hitError={j.hitError}
            onAnimationEnd={() => setJudgments(prev => prev.filter(p => p.id !== j.id))}
            id={j.id}
          />
        </div>
      ))}

      <HitErrorBar hitErrors={hitErrors} maxErrorMs={w300} />

      {visibleNotes.map((note) => {
        const hitTime = note.time * 1000;
        const spawnTime = hitTime - preempt;
        const now = timeMsRef.current;

        const scale = approachScale(now, hitTime, preempt, 2.0);
        const alpha = hitAlpha(now, spawnTime, preempt);

        // TODO: position by note.x, note.y when available. For now, center.
        return (
          <div
            key={note.time}
            className="absolute left-1/2 top-1/2"
            style={{ transform: 'translate(-50%, -50%)' }}
          >
            {/* Inner hit circle */}
            <div
              className="absolute rounded-full bg-blue-500/50 border-2 border-white shadow"
              style={{
                width: `${HIT_CIRCLE_RADIUS * 2}px`,
                height: `${HIT_CIRCLE_RADIUS * 2}px`,
                opacity: alpha,
                boxShadow: '0 0 24px rgba(59,130,246,0.45)',
              }}
            />

            {/* Approach ring */}
            <ApproachCircle radius={HIT_CIRCLE_RADIUS} scale={scale} opacity={alpha} />
          </div>
        );
      })}
    </div>
  );
};

export default OsuGameView;
