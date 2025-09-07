'use client';

import React from 'react';

interface DisabledSettingSliderProps {
  label: string;
  value: number | string;
}

const DisabledSettingSlider: React.FC<DisabledSettingSliderProps> = ({ label, value }) => {
  return (
    <div className="opacity-50">
      <label className="text-2xl font-semibold mb-4 flex justify-between items-center">
        <span>{label}</span>
        <span className="text-3xl font-bold text-theme-secondary bg-theme-bg/50 px-4 py-1 rounded-lg">{value}</span>
      </label>
      <input type="range" disabled className="w-full h-3 bg-theme-text-light/10 rounded-full appearance-none cursor-not-allowed" />
      <p className="text-sm text-right mt-2">Coming Soon</p>
    </div>
  );
};

export default DisabledSettingSlider;
