'use client';

import React from 'react';

interface GameModeDetail {
  label: string;
  value: string;
}

interface DisabledGameModeCardProps {
  title: string;
  icon: string;
  description: string;
  details: GameModeDetail[];
}

const DisabledGameModeCard: React.FC<DisabledGameModeCardProps> = ({ title, icon, description, details }) => {
  return (
    <div className="group relative opacity-60">
      <div className="absolute inset-0 bg-gradient-to-r from-theme-secondary to-theme-accent rounded-3xl blur opacity-10" />
      <div className="relative bg-theme-bg/50 backdrop-blur-xl rounded-3xl p-8 border border-theme-text-dark/30">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-theme-secondary to-theme-accent rounded-2xl mx-auto mb-6 flex items-center justify-center opacity-50">
            <span className="text-2xl font-bold text-theme-text-light">{icon}</span>
          </div>
          <h3 className="text-3xl font-bold text-theme-text-dark mb-4">{title}</h3>
          <p className="text-theme-text-dark/80 mb-6 leading-relaxed">{description}</p>
          <div className="space-y-2 mb-6">
            {details.map((detail) => (
              <div key={detail.label} className="flex justify-between text-sm">
                <span className="text-theme-text-dark/80">{detail.label}:</span>
                <span className="text-theme-text-dark/80 font-semibold">{detail.value}</span>
              </div>
            ))}
          </div>
          <div className="w-full py-4 bg-theme-text-dark/20 rounded-xl font-bold text-theme-text-dark text-lg cursor-not-allowed">
            Coming Soon
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisabledGameModeCard;
