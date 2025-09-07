// src/renderer/components/scenes/FinishScene.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useTransition, animated } from 'react-spring';
import useGameStore from '../../store/gameStore';
import { calculateAccuracy, getRank } from '../../lib/gameUtils';

import ScoreSummary from '../game/ScoreSummary';
import JudgmentDetails from '../game/JudgmentDetails';
import FinishActions from '../game/FinishActions';
import RankDisplay from '../game/RankDisplay';
import AccuracyDisplay from '../game/AccuracyDisplay';

interface FinishSceneProps {
  onBack: () => void;
}

const FinishScene: React.FC<FinishSceneProps> = ({ onBack }) => {
  const { score, maxCombo, judgments, reset, setCurrentScene } = useGameStore();

  const [accuracy, setAccuracy] = useState(0);
  const [rank, setRank] = useState('');

  useEffect(() => {
    const acc = calculateAccuracy(judgments);
    const rnk = getRank(acc);
    setAccuracy(acc);
    setRank(rnk);
  }, [judgments]);

  const handleRestart = () => {
    reset();
    setCurrentScene('Game');
  };

  const handleSelectMusic = () => {
    reset();
    setCurrentScene('Select');
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const resultItems: ((style: any) => React.ReactElement)[] = [
    (style) => <animated.div style={style}><ScoreSummary score={score} maxCombo={maxCombo} /></animated.div>,
    (style) => <animated.div style={style}><div className="w-full h-px bg-theme-text-dark/50" /></animated.div>,
    (style) => <animated.div style={style}><div className="flex justify-around items-center"><RankDisplay rank={rank} /><AccuracyDisplay accuracy={accuracy} /></div></animated.div>,
    (style) => <animated.div style={style}><div className="w-full h-px bg-theme-text-dark/50" /></animated.div>,
    (style) => <animated.div style={style}><JudgmentDetails judgments={judgments} /></animated.div>,
    (style) => <animated.div style={style}><div className="w-full h-px bg-theme-text-dark/50" /></animated.div>,
    (style) => <animated.div style={style}><FinishActions onRestart={handleRestart} onSelectMusic={handleSelectMusic} /></animated.div>,
  ];

  const transitions = useTransition(resultItems, {
    from: { opacity: 0, transform: 'translateY(20px)' },
    enter: { opacity: 1, transform: 'translateY(0px)' },
    trail: 200, // Staggered animation
  });

  return (
    <div className="min-h-screen bg-theme-bg flex items-center justify-center p-8">
      <div className="bg-theme-bg/70 backdrop-blur-xl rounded-3xl p-12 border border-theme-text-dark/50 shadow-2xl max-w-3xl w-full space-y-8">
        <button
          onClick={onBack}
          className="px-6 py-3 bg-theme-secondary text-white rounded-lg hover:bg-theme-secondary/80 transition-colors"
        >
          Back to Menu
        </button>
        <h1 className="text-6xl font-black text-center bg-clip-text text-transparent bg-gradient-to-b from-theme-accent to-theme-secondary animate-pulse">
          GAME CLEAR
        </h1>
        {transitions((style, item) => item(style))}
      </div>
    </div>
  );
};

export default FinishScene;
