// src/renderer/app/page.tsx
'use client';

import React, { useState } from 'react';
import useGameStore from '../store/gameStore';
import StartScene from '../components/scenes/StartScene';
import SelectScene from '../components/scenes/SelectScene';
import GameScene from '../components/scenes/GameScene';
import FinishScene from '../components/scenes/FinishScene';
import SettingsScene from '../components/scenes/SettingsScene';
import OszImportScene from '../components/scenes/OszImportScene';
import { GameScene as GameSceneType, PinChart } from '../../shared/types';

const SceneManager: React.FC = () => {
    const [currentScene, setCurrentScene] = useState<GameSceneType>('Start');
    const [selectedChart, setSelectedChart] = useState<PinChart | null>(null);

    const handleSceneChange = (scene: GameSceneType) => {
        setCurrentScene(scene);
    };

    const handleChartSelected = (chart: PinChart) => {
        setSelectedChart(chart);
        setCurrentScene('Game');
    };

    const renderScene = () => {
        switch (currentScene) {
            case 'Start':
                return <StartScene onNavigate={handleSceneChange} />;
            case 'Select':
                return <SelectScene onBack={() => handleSceneChange('Start')} onStartGame={handleChartSelected} />;
            case 'Game':
                return selectedChart ? <GameScene selectedChart={selectedChart} onBack={() => handleSceneChange('Select')} /> : <StartScene onNavigate={handleSceneChange} />;
            case 'Finish':
                return <FinishScene onBack={() => handleSceneChange('Start')} />;
            case 'Settings':
                return <SettingsScene onBack={() => handleSceneChange('Start')} />;
            case 'OszImport':
                return <OszImportScene onBack={() => handleSceneChange('Start')} onChartSelected={handleChartSelected} />;
            default:
                return <StartScene onNavigate={handleSceneChange} />;
        }
    };

    return <div>{renderScene()}</div>;
};

export default function HomePage() {
    return <SceneManager />;
}