'use client';

import React from 'react';

interface ScoreSummaryProps {
  score: number;
  maxCombo: number;
}

const getRank = (score: number) => {
  if (score > 950000) return { rank: 'S', color: 'text-theme-highlight' };
  if (score > 900000) return { rank: 'A', color: 'text-theme-primary' };
  if (score > 800000) return { rank: 'B', color: 'text-theme-primary/80' };
  if (score > 700000) return { rank: 'C', color: 'text-theme-text-dark' };
  return { rank: 'D', color: 'text-theme-accent' };
};

const ScoreSummary: React.FC<ScoreSummaryProps> = ({ score, maxCombo }) => {
  const { rank, color } = getRank(score);

  return (
    <div className="text-center">
      <p className="text-2xl text-theme-text-dark font-medium mb-2">FINAL SCORE</p>
      <p className="text-8xl font-black text-transparent bg-gradient-to-r from-theme-primary to-theme-secondary bg-clip-text mb-4">
        {score.toLocaleString()}
      </p>
      <div className="flex justify-center items-baseline gap-8 text-theme-text-light">
        <div className="text-center">
          <p className="text-lg text-theme-text-dark">RANK</p>
          <p className={`text-5xl font-bold ${color}`}>{rank}</p>
        </div>
        <div className="text-center">
          <p className="text-lg text-theme-text-dark">MAX COMBO</p>
          <p className="text-5xl font-bold">{maxCombo}</p>
        </div>
      </div>
    </div>
  );
};

export default ScoreSummary;
