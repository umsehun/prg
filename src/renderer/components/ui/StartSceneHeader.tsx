// src/renderer/components/ui/StartSceneHeader.tsx
'use client';

import React from 'react';

const StartSceneHeader: React.FC = () => (
  <div className="text-center">
    <h1 className="text-8xl md:text-9xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-theme-secondary to-theme-accent animate-pulse">
      PRG
    </h1>
    <p className="text-xl md:text-2xl text-theme-text-light/80 mb-12 font-light">A RHYTHM GAME EXPERIENCE</p>
  </div>
);

export default StartSceneHeader;
