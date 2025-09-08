// src/renderer/components/game/JudgmentDisplay.tsx
'use client';

import React from 'react';
import { useTransition, animated } from '@react-spring/web';
import { Judgment } from '../../../shared/types';

interface JudgmentDisplayProps {
  judgment: Judgment | null;
}

const JUDGMENT_STYLES: Record<Judgment, { color: string; shadow: string }> = {
  KOOL: { color: '#00ffff', shadow: '0 0 20px #00ffff' },
  COOL: { color: '#0099ff', shadow: '0 0 15px #0099ff' },
  GOOD: { color: '#00ff00', shadow: '0 0 10px #00ff00' },
  MISS: { color: '#ff0000', shadow: '0 0 10px #ff0000' },
};

const JudgmentDisplay: React.FC<JudgmentDisplayProps> = ({ judgment }) => {
  const judgmentArray = judgment ? [judgment] : [];

  const transitions = useTransition(judgmentArray, {
    from: { opacity: 0, transform: 'scale(0.5) translateY(50px)' },
    enter: { opacity: 1, transform: 'scale(1) translateY(0px)' },
    leave: { opacity: 0, transform: 'scale(0.5) translateY(-50px)' },
    config: { tension: 280, friction: 20 },
    keys: (item: Judgment) => `${item}-${Date.now()}`,
  });

  return (
    <div className="absolute top-2/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
      {transitions((style, item) => (
        <animated.div
          style={style}
          className="text-7xl font-black uppercase tracking-widest"
        >
          <span style={{ color: JUDGMENT_STYLES[item].color, textShadow: JUDGMENT_STYLES[item].shadow }}>
            {item}
          </span>
        </animated.div>
      ))}
    </div>
  );
};

export default JudgmentDisplay;
