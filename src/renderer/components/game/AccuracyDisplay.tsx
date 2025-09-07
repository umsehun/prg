// src/renderer/components/game/AccuracyDisplay.tsx
'use client';

import React from 'react';
import { useSpring, animated } from 'react-spring';

interface AccuracyDisplayProps {
  accuracy: number;
}

const AccuracyDisplay: React.FC<AccuracyDisplayProps> = ({ accuracy }) => {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;

  const { val } = useSpring({
    from: { val: 0 },
    to: { val: accuracy },
    config: { duration: 1000 },
  });

  const { strokeDashoffset } = useSpring({
    from: { strokeDashoffset: circumference },
    to: { strokeDashoffset: circumference - (accuracy / 100) * circumference },
    config: { duration: 1000 },
  });

  return (
    <div className="flex flex-col items-center">
      <p className="text-2xl font-semibold text-theme-text-light/80 mb-4">Accuracy</p>
      <div className="relative w-40 h-40">
        <svg className="w-full h-full" viewBox="0 0 140 140">
          <circle
            cx="70"
            cy="70"
            r={radius}
            strokeWidth="10"
            className="stroke-current text-theme-text-dark/30"
            fill="transparent"
          />
          <animated.circle
            cx="70"
            cy="70"
            r={radius}
            strokeWidth="10"
            className="stroke-current text-theme-accent transform -rotate-90 origin-center"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <animated.p className="text-4xl font-bold text-theme-text-light">
            {val.to((v) => `${v.toFixed(2)}%`)}
          </animated.p>
        </div>
      </div>
    </div>
  );
};

export default AccuracyDisplay;
