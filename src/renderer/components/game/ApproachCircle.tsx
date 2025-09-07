// src/renderer/components/game/ApproachCircle.tsx
'use client';
import React from 'react';

interface ApproachCircleProps {
  radius: number; // base hit circle radius (px)
  scale: number;  // 2.0 -> 1.0 shrink
  opacity: number; // 0..1
}

const ApproachCircle: React.FC<ApproachCircleProps> = ({ radius, scale, opacity }) => {
  const size = radius * 2 * scale;

  return (
    <div
      className="absolute rounded-full border-4 border-white/80 pointer-events-none"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        opacity,
        boxShadow: '0 0 16px rgba(255,255,255,0.35)'
      }}
    />
  );
};

export default ApproachCircle;
