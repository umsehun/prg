// src/renderer/components/ui/SceneNavigation.tsx
'use client';

import React from 'react';
import useGameStore from '@/store/gameStore';
import { GameScene } from '../../../shared/types';

interface NavButtonProps {
  scene: GameScene;
  icon: string;
  label: string;
}

const NavButton: React.FC<NavButtonProps> = ({ scene, icon, label }) => {
  const setCurrentScene = useGameStore((state) => state.setCurrentScene);
  return (
    <button
      onClick={() => setCurrentScene(scene)}
      className="px-8 py-4 bg-theme-text-dark/30 hover:bg-theme-text-dark/50 rounded-xl text-theme-text-light/80 hover:text-theme-text-light transition-all duration-200 font-medium flex items-center gap-3"
    >
      <span className="text-xl">{icon}</span>
      {label}
    </button>
  );
};

const SceneNavigation: React.FC = () => (
  <div className="flex justify-center gap-6">
    <NavButton scene="Settings" icon="⚙️" label="Settings" />
    <NavButton scene="Start" icon="🏠" label="Back to Home" />
  </div>
);

export default SceneNavigation;
