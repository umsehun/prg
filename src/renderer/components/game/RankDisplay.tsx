// src/renderer/components/game/RankDisplay.tsx
'use client';

import React from 'react';

interface RankDisplayProps {
  rank: string;
}

const rankColorMap: { [key: string]: string } = {
  S: 'text-yellow-400',
  A: 'text-green-400',
  B: 'text-blue-400',
  C: 'text-purple-400',
  D: 'text-gray-500',
};

const RankDisplay: React.FC<RankDisplayProps> = ({ rank }) => {
  const color = rankColorMap[rank] || 'text-gray-500';

  return (
    <div className="flex flex-col items-center">
      <p className="text-2xl font-semibold text-theme-text-light/80 mb-2">Rank</p>
      <div
        className={`text-9xl font-black ${color} transform-gpu transition-all duration-500`}
        style={{ filter: `drop-shadow(0 0 20px ${color.replace('text-', 'bg-').split('-')[0]})` }}
      >
        {rank}
      </div>
    </div>
  );
};

export default RankDisplay;
