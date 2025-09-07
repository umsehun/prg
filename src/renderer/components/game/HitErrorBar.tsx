// src/renderer/components/game/HitErrorBar.tsx
'use client';

import React from 'react';

interface HitErrorBarProps {
  hitErrors: number[]; // Array of recent hit errors in milliseconds (-ve for early, +ve for late)
  maxErrorMs: number; // The window for KOOL judgment, defines the bar's scale
}

const HitErrorBar: React.FC<HitErrorBarProps> = ({ hitErrors, maxErrorMs }) => {
  // Calculate the average error for the center line
  const avgError = hitErrors.length > 0
    ? hitErrors.reduce((a, b) => a + b, 0) / hitErrors.length
    : 0;

  const centerLinePosition = `${50 + (avgError / maxErrorMs) * 50}%`;

  return (
    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-72 h-4 bg-transparent flex items-center justify-center pointer-events-none">
      {/* Bar Background */}
      <div className="w-full h-1 bg-black/30 rounded-full overflow-hidden">
        {/* Ticks for KOOL, COOL, GOOD ranges */}
        <div className="absolute w-full h-full flex justify-between items-center">
          <div className="w-[3px] h-[3px] bg-cyan-400 rounded-full" />
          <div className="w-[3px] h-[3px] bg-green-400 rounded-full" />
          <div className="w-[3px] h-[3px] bg-yellow-400 rounded-full" />
        </div>
      </div>

      {/* Individual Hit Markers */}
      <div className="absolute w-full h-full">
        {hitErrors.map((error, i) => {
          const position = `${50 + (error / maxErrorMs) * 50}%`;
          return (
            <div
              key={i}
              className="absolute top-1/2 -translate-y-1/2 w-1 h-3 bg-white/80 rounded-full shadow-lg transition-all duration-300 ease-out"
              style={{ left: position, opacity: 1 - (hitErrors.length - 1 - i) * 0.1 }}
            />
          );
        })}
      </div>

      {/* Center Line (Perfect Hit) */}
      <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-cyan-300 shadow-lg" />

      {/* Average Hit Line */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-yellow-300 transition-all duration-200 ease-in-out"
        style={{ left: centerLinePosition }}
      />
    </div>
  );
};

export default HitErrorBar;
