// src/renderer/components/ui/SceneHeader.tsx
'use client';

import React from 'react';

interface SceneHeaderProps {
  title: string;
  subtitle: string;
}

const SceneHeader: React.FC<SceneHeaderProps> = ({ title, subtitle }) => (
  <div className="text-center mb-16">
    <h1 className="text-7xl font-black bg-gradient-to-r from-theme-primary via-theme-secondary to-theme-accent bg-clip-text text-transparent mb-6">
      {title}
    </h1>
    <p className="text-2xl text-theme-text-light/80 font-medium">
      {subtitle}
    </p>
  </div>
);

export default SceneHeader;
