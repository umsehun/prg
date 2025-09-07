// src/renderer/components/game/HitParticles.tsx
'use client';

import React from 'react';
import { useTrail, animated, SpringValue } from '@react-spring/web';

interface HitParticlesProps {
  onAnimationEnd: () => void;
  color: string;
}

const PARTICLE_COUNT = 8;

const HitParticles: React.FC<HitParticlesProps> = ({ onAnimationEnd, color }) => {
  const [trail] = useTrail(PARTICLE_COUNT, (i: number) => ({
    from: { opacity: 1, scale: 0, x: 0, y: 0 },
    to: { opacity: 0, scale: 1.5, x: (Math.random() - 0.5) * 150, y: (Math.random() - 0.5) * 150 },
    config: { mass: 1, tension: 400, friction: 30 },
    onRest: () => {
      if (i === PARTICLE_COUNT - 1) {
        onAnimationEnd();
      }
    },
  }));

  return (
    <div className="absolute w-1 h-1">
      {trail.map((style: any, index: number) => (
        <animated.div
          key={index}
          className="absolute rounded-full"
          style={{
            ...style,
            width: '8px',
            height: '8px',
            backgroundColor: color,
            boxShadow: `0 0 10px ${color}`,
          }}
        />
      ))}
    </div>
  );
};

export default HitParticles;
