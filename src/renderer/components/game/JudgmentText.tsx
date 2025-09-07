// src/renderer/components/game/JudgmentText.tsx
'use client';

import React from 'react';
import { useSpring, animated } from '@react-spring/web';
import { Judgment } from '../../../shared/types';

interface JudgmentTextProps {
  judgment: Judgment;
  hitError: number; // ms, for early/late coloring
  onAnimationEnd: () => void;
  id: string;
}

const JUDGMENT_COLORS: Record<Judgment, string> = {
  KOOL: '#00ffff',
  COOL: '#88ff88',
  GOOD: '#ffcc22',
  MISS: '#ff6666',
};

// Early/Late colors for KOOL judgments
const EARLY_COLOR = '#88ccff'; // Light blue for early
const LATE_COLOR = '#ff8888'; // Light red for late

const JudgmentText: React.FC<JudgmentTextProps> = ({ judgment, hitError, onAnimationEnd }) => {
  const [props, api] = useSpring(() => ({
    from: { opacity: 0, transform: 'scale(0.8) translateY(20px)' },
    to: { opacity: 1, transform: 'scale(1) translateY(0px)' },
    config: { tension: 300, friction: 15 },
    onRest: () => {
      // After appearing, wait a bit then fade out
      setTimeout(() => {
        api.start({
          to: { opacity: 0, transform: 'scale(1) translateY(-30px)' },
          config: { tension: 300, friction: 20 },
          onRest: onAnimationEnd,
        });
      }, 400);
    },
  }));

  // KOOL judgment shows early/late color, others show standard color.
  const color = judgment === 'KOOL' && Math.abs(hitError) > 2 
    ? (hitError < 0 ? EARLY_COLOR : LATE_COLOR) 
    : JUDGMENT_COLORS[judgment];

  return (
    <animated.div
      style={props}
      className="absolute text-2xl font-bold uppercase pointer-events-none -translate-x-1/2 -translate-y-1/2"
    >
      <span style={{ color, textShadow: `0 0 8px ${color}` }}>
        {judgment}
      </span>
    </animated.div>
  );
};

export default JudgmentText;
