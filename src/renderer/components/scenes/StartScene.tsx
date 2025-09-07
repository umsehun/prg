// src/renderer/components/scenes/StartScene.tsx
'use client';

import React from 'react';
import { GameScene } from '../../../shared/types';
import StartSceneBackground from '../ui/StartSceneBackground';
import StartSceneHeader from '../ui/StartSceneHeader';

interface MenuItem {
  label: string;
  scene: GameScene;
}

const menuItems: MenuItem[] = [
  { label: 'Start Game', scene: 'Select' },
  { label: '.osz Import', scene: 'OszImport' },
  { label: 'Settings', scene: 'Settings' },
];

interface StartSceneProps {
  onNavigate: (scene: GameScene) => void;
}

const StartScene: React.FC<StartSceneProps> = ({ onNavigate }) => {

  return (
    <div className="min-h-screen bg-theme-bg text-theme-text-light flex flex-col items-center justify-center p-8 overflow-hidden relative">
      <StartSceneBackground />

      <div className="relative z-10 flex flex-col items-center justify-center">
        <StartSceneHeader />

        <div className="space-y-6">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => onNavigate(item.scene)}
              className="group relative px-12 py-4 bg-theme-primary text-theme-text-light rounded-lg hover:bg-theme-primary/80 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StartScene;
