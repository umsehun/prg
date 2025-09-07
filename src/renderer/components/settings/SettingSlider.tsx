'use client';

import React from 'react';

interface SettingSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const SettingSlider: React.FC<SettingSliderProps> = ({ label, value, min, max, step, onChange }) => {
  return (
    <div className="setting-item">
      <label htmlFor={label} className="text-2xl font-semibold mb-4 flex justify-between items-center">
        <span>{label}</span>
        <span className="text-3xl font-bold text-theme-secondary bg-theme-bg/50 px-4 py-1 rounded-lg">{value}</span>
      </label>
      <input
        type="range"
        id={label}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
        className="w-full h-3 bg-theme-text-light/10 rounded-full appearance-none cursor-pointer range-lg accent-theme-accent focus:outline-none focus:ring-2 focus:ring-theme-secondary focus:ring-opacity-50 transition-all duration-300"
      />
    </div>
  );
};

export default SettingSlider;
