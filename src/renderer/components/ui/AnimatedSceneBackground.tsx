// src/renderer/components/ui/AnimatedSceneBackground.tsx
'use client';

import React from 'react';

const AnimatedSceneBackground: React.FC = () => (
  <div className="absolute inset-0 overflow-hidden">
    <div className="absolute -top-40 -right-40 w-80 h-80 bg-theme-secondary/10 rounded-full blur-3xl animate-pulse" />
    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-theme-primary/10 rounded-full blur-3xl animate-pulse delay-1000" />
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-theme-accent/5 rounded-full blur-3xl animate-pulse delay-500" />
  </div>
);

export default AnimatedSceneBackground;
