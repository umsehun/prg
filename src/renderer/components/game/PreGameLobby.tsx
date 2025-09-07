'use client';

import React from 'react';

interface PreGameLobbyProps {
  onStartGame: () => void;
  onBack: () => void;
  isLoading: boolean;
}

const PreGameLobby: React.FC<PreGameLobbyProps> = ({ onStartGame, onBack, isLoading }) => {
  return (
    <div className="min-h-screen bg-theme-bg-secondary flex items-center justify-center p-8 relative overflow-hidden">
      {/* Grid Background */}
      <div
        className="absolute inset-0 bg-[length:50px_50px] bg-repeat animate-grid-pan"
        style={{
          backgroundImage:
            'linear-gradient(to right, var(--theme-primary, #00e5ff) 1px, transparent 1px), linear-gradient(to bottom, var(--theme-primary, #00e5ff) 1px, transparent 1px)',
          opacity: 0.1,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-theme-bg-secondary" />
      <div className="max-w-2xl w-full">
        {/* Game Title */}
        <div className="relative text-center mb-12">
          <h1 className="text-6xl font-black bg-gradient-to-r from-theme-primary via-theme-secondary to-theme-accent bg-clip-text text-transparent mb-4 animate-flicker">
            PIN GAME
          </h1>
          <p className="text-xl text-theme-text-light/80 font-medium">
            Single Lane Rhythm Challenge
          </p>
        </div>

        {/* Game Info Card */}
        <div className="relative bg-theme-bg/80 backdrop-blur-2xl rounded-3xl p-8 border-2 border-theme-primary/30 shadow-2xl shadow-theme-secondary/10 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-theme-text-light mb-4">How to Play</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-theme-primary to-theme-secondary rounded-lg flex items-center justify-center">
                    <span className="text-theme-text-light font-bold text-sm">S</span>
                  </div>
                  <span className="text-theme-text-light/80">Press &apos;S&apos; key to hit notes</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-theme-secondary to-theme-accent rounded-lg flex items-center justify-center">
                    <span className="text-theme-text-light font-bold text-xs">ESC</span>
                  </div>
                  <span className="text-theme-text-light/80">Press &apos;ESC&apos; to quit game</span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-theme-text-light mb-4">Track Info</h3>
              <div className="space-y-2">
                <p className="text-theme-text-light/80"><span className="text-theme-primary font-semibold">Song:</span> Bad Apple!!</p>
                <p className="text-theme-text-light/80"><span className="text-theme-primary font-semibold">Artist:</span> Alstroemeria Records</p>
                <p className="text-theme-text-light/80"><span className="text-theme-primary font-semibold">BPM:</span> 138</p>
              </div>
            </div>
          </div>
        </div>

        {/* Start Button */}
        <div className="text-center">
          <button
            onClick={onStartGame}
            disabled={isLoading}
            className="group relative px-12 py-4 bg-gradient-to-r from-theme-primary via-theme-secondary to-theme-accent rounded-2xl font-bold text-theme-text-light text-xl shadow-lg shadow-theme-accent/30 hover:shadow-glow-accent transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-theme-primary/80 via-theme-secondary/80 to-theme-accent/80 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative z-10">
              {isLoading ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-theme-text-light/30 border-t-theme-text-light rounded-full animate-spin" />
                  Loading...
                </div>
              ) : (
                'START GAME'
              )}
            </span>
          </button>
        </div>

        {/* Back Button */}
        <div className="text-center mt-6">
          <button
            onClick={onBack}
            className="px-8 py-3 bg-theme-text-dark/30 hover:bg-theme-text-dark/50 rounded-xl text-theme-text-light/80 hover:text-theme-text-light transition-all duration-200 font-medium"
          >
            Back to Menu
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreGameLobby;
