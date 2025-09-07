'use client';

import React from 'react';

interface GameModeDetail {
  label: string;
  value: string;
}

interface GameModeCardProps {
  title: string;
  icon: string;
  description: string;
  details: GameModeDetail[];
  onSelect: () => void;
}

const GameModeCard: React.FC<GameModeCardProps> = ({ title, icon, description, details, onSelect }) => {
  return (
    <div className="group relative">
      <div className="absolute inset-0 bg-gradient-to-r from-theme-primary to-theme-secondary rounded-3xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-300" />
      <div className="relative bg-theme-bg/70 backdrop-blur-xl rounded-3xl p-8 border border-theme-text-dark/50 hover:border-theme-text-dark/70 transition-all duration-300 hover:scale-105">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-theme-primary to-theme-secondary rounded-2xl mx-auto mb-6 flex items-center justify-center">
            <span className="text-2xl font-bold text-theme-text-light">{icon}</span>
          </div>
          <h3 className="text-3xl font-bold text-theme-text-light mb-4">{title}</h3>
          <p className="text-theme-text-light/80 mb-6 leading-relaxed">{description}</p>
          <div className="space-y-2 mb-6">
            {details.map((detail) => (
              <div key={detail.label} className="flex justify-between text-sm">
                <span className="text-theme-text-dark">{detail.label}:</span>
                <span className="text-theme-primary font-semibold">{detail.value}</span>
              </div>
            ))}
          </div>
          <button
            onClick={onSelect}
            className="w-full py-4 bg-gradient-to-r from-theme-primary to-theme-secondary rounded-xl font-bold text-theme-text-light text-lg transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-glow-primary"
          >
            Play {title}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameModeCard;
