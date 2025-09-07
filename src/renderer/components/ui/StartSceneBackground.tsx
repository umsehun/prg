// src/renderer/components/ui/StartSceneBackground.tsx
'use client';

import React from 'react';

const StartSceneBackground: React.FC = () => (
  <div className="absolute inset-0 overflow-hidden">
    <div className="absolute top-0 left-0 w-72 h-72 bg-theme-secondary rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
    <div className="absolute top-0 right-0 w-72 h-72 bg-theme-accent rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
    <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-theme-primary rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
  </div>
);

export default StartSceneBackground;
