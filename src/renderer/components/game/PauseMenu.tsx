// src/renderer/components/game/PauseMenu.tsx
'use client';

import React from 'react';

interface PauseMenuProps {
  onResume: () => void;
  onRestart: () => void;
  onMenu: () => void;
}

const PauseMenu: React.FC<PauseMenuProps> = ({ onResume, onRestart, onMenu }) => {
  return (
    <div className="absolute inset-0 bg-black/50 backdrop-blur-md flex flex-col items-center justify-center z-50">
      <div className="text-center">
        <h1 className="text-8xl font-black text-white/90 mb-12 animate-pulse">PAUSED</h1>
        <div className="flex flex-col space-y-6">
          <button
            onClick={onResume}
            className="px-12 py-4 text-3xl font-semibold text-theme-primary bg-theme-primary/20 rounded-lg shadow-lg hover:bg-theme-primary/30 transition-all duration-300 transform hover:scale-105"
          >
            Resume
          </button>
          <button
            onClick={onRestart}
            className="px-12 py-4 text-2xl font-semibold text-theme-text-light bg-theme-text-light/10 rounded-lg shadow-lg hover:bg-theme-text-light/20 transition-all duration-300 transform hover:scale-105"
          >
            Retry
          </button>
          <button
            onClick={onMenu}
            className="px-12 py-4 text-2xl font-semibold text-theme-text-light bg-theme-text-light/10 rounded-lg shadow-lg hover:bg-theme-text-light/20 transition-all duration-300 transform hover:scale-105"
          >
            Back to Menu
          </button>
        </div>
      </div>
    </div>
  );
};

export default PauseMenu;
