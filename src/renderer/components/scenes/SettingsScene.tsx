// src/renderer/components/scenes/SettingsScene.tsx
'use client';

import React, { useState, useEffect } from 'react';
import useGameStore from '../../store/gameStore';
import { Settings } from '../../../shared/types';
import SettingSlider from '../settings/SettingSlider';
import DisabledSettingSlider from '../settings/DisabledSettingSlider';

// Define the structure for each setting configuration
interface SettingConfig {
  id: keyof Settings;
  label: string;
  min?: number;
  max?: number;
  step?: number;
  enabled: boolean;
}

// Centralized settings configuration
const settingsConfig: SettingConfig[] = [
  {
    id: 'noteSpeed',
    label: 'Note Speed',
    min: 100,
    max: 1000,
    step: 50,
    enabled: true,
  },
  // Add future settings here, e.g.:
  // { id: 'masterVolume', label: 'Master Volume', min: 0, max: 100, step: 1, enabled: false },
];

interface SettingsSceneProps {
  onBack: () => void;
}

const SettingsScene: React.FC<SettingsSceneProps> = ({ onBack }) => {
  const setCurrentScene = useGameStore((state) => state.setCurrentScene);
  const [settings, setSettings] = useState<Partial<Settings>>({});

  // Fetch all settings on component mount
  useEffect(() => {
    const fetchAllSettings = async () => {
      const initialSettings: Partial<Settings> = {};
      for (const config of settingsConfig) {
        if (config.enabled) {
          initialSettings[config.id] = await window.electron.getSetting(config.id);
        }
      }
      setSettings(initialSettings);
    };
    fetchAllSettings();
  }, []);

  // Generic handler for all setting changes
  const handleSettingChange = (id: keyof Settings, value: number) => {
    const newSettings = { ...settings, [id]: value };
    setSettings(newSettings);
    window.electron.setSetting(id, value);
  };

  return (
    <div className="min-h-screen bg-theme-bg text-theme-text-light flex flex-col items-center justify-center p-8">
      <div className="absolute top-8 left-8">
        <button
          onClick={onBack}
          className="px-6 py-3 bg-theme-secondary text-white rounded-lg hover:bg-theme-secondary/80 transition-colors"
        >
          Back to Menu
        </button>
      </div>

      <div className="w-full max-w-2xl bg-theme-bg/70 backdrop-blur-xl rounded-2xl shadow-2xl p-10 border border-theme-text-dark/50">
        <h1 className="text-5xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-theme-secondary to-theme-accent animate-pulse">
          Settings
        </h1>

        <div className="space-y-10">
          {settingsConfig.map((config) =>
            config.enabled ? (
              <SettingSlider
                key={config.id}
                label={config.label}
                value={settings[config.id] ?? config.min ?? 0}
                min={config.min ?? 0}
                max={config.max ?? 100}
                step={config.step ?? 1}
                onChange={(e) => handleSettingChange(config.id, parseInt(e.target.value, 10))}
              />
            ) : (
              <DisabledSettingSlider key={config.id} label={config.label} value={100} />
            )
          )}
        </div>
      </div>

      <p className="mt-8 text-sm text-theme-text-dark">More settings will be available in future updates.</p>
    </div>
  );
};

export default SettingsScene;
