// src/renderer/components/ui/PreGameLobby.tsx
'use client';

import React from 'react';
import { PinChart } from '../../../shared/types';

interface PreGameLobbyProps {
  chart: PinChart | null;
  isLoading: boolean;
  onStartGame: () => void;
  onBackToMenu: () => void;
}

export const PreGameLobby: React.FC<PreGameLobbyProps> = ({
  chart,
  isLoading,
  onStartGame,
  onBackToMenu
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <div className="text-center space-y-8 p-8 bg-black/30 rounded-xl backdrop-blur-sm border border-white/10">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
          Ready to Play?
        </h1>
        
        {isLoading ? (
          <div className="space-y-4">
            <div className="animate-spin w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-lg text-gray-300">Loading chart and audio...</p>
          </div>
        ) : (
          <div className="space-y-6">
            <p className="text-lg text-gray-300">Chart loaded and ready!</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={onStartGame}
                className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-lg font-semibold text-white transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Start Game
              </button>
              <button
                onClick={onBackToMenu}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors"
              >
                Back to Menu
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
