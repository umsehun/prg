/**
 * ScoreBoard - Dedicated Score and Stats Display Component
 * Single Responsibility: Display score, combo, accuracy, and hit statistics
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, Target, TrendingUp, Award } from 'lucide-react';
import type { GameStats } from './HitJudgment';

interface ScoreBoardProps {
    stats: GameStats;
    currentSong?: {
        title: string;
        artist: string;
        bpm: number;
        duration: number;
    };
    gameInfo?: {
        rotationSpeed: number;
        pinCount: number;
        difficulty: string;
    };
}

export function ScoreBoard({ stats, currentSong, gameInfo }: ScoreBoardProps) {
    // Format large numbers with commas
    const formatScore = (score: number): string => {
        return score.toLocaleString();
    };

    // Get combo display with color
    const getComboDisplay = () => {
        if (stats.combo >= 50) return { text: `${stats.combo}x`, color: 'text-purple-400', bg: 'bg-purple-900/30' };
        if (stats.combo >= 20) return { text: `${stats.combo}x`, color: 'text-yellow-400', bg: 'bg-yellow-900/30' };
        if (stats.combo >= 10) return { text: `${stats.combo}x`, color: 'text-blue-400', bg: 'bg-blue-900/30' };
        return { text: `${stats.combo}x`, color: 'text-white', bg: 'bg-slate-700/30' };
    };

    // Get accuracy color
    const getAccuracyColor = () => {
        if (stats.accuracy >= 95) return 'text-green-400';
        if (stats.accuracy >= 85) return 'text-yellow-400';
        if (stats.accuracy >= 70) return 'text-orange-400';
        return 'text-red-400';
    };

    // Calculate grade
    const getGrade = () => {
        if (stats.accuracy >= 95) return { grade: 'S', color: 'text-yellow-300' };
        if (stats.accuracy >= 90) return { grade: 'A', color: 'text-green-400' };
        if (stats.accuracy >= 80) return { grade: 'B', color: 'text-blue-400' };
        if (stats.accuracy >= 70) return { grade: 'C', color: 'text-purple-400' };
        return { grade: 'D', color: 'text-red-400' };
    };

    const combo = getComboDisplay();
    const grade = getGrade();

    return (
        <div className="space-y-4">
            {/* Score Card */}
            <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-purple-300 flex items-center">
                        <Star className="w-5 h-5 mr-2" />
                        점수
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-white mb-2">
                        {formatScore(stats.score)}
                    </div>
                    <div className={`text-lg font-bold ${combo.color} ${combo.bg} px-2 py-1 rounded-md inline-block`}>
                        콤보: {combo.text}
                    </div>
                </CardContent>
            </Card>

            {/* Accuracy & Grade */}
            <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-purple-300 flex items-center">
                        <Award className="w-5 h-5 mr-2" />
                        정확도
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between mb-2">
                        <span className={`text-2xl font-bold ${getAccuracyColor()}`}>
                            {stats.accuracy}%
                        </span>
                        <span className={`text-4xl font-bold ${grade.color}`}>
                            {grade.grade}
                        </span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                        <div
                            className={`h-2 rounded-full transition-all duration-300 ${stats.accuracy >= 95 ? 'bg-green-500' :
                                    stats.accuracy >= 85 ? 'bg-yellow-500' :
                                        stats.accuracy >= 70 ? 'bg-orange-500' : 'bg-red-500'
                                }`}
                            style={{ width: `${stats.accuracy}%` }}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Hit Statistics */}
            <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-purple-300 flex items-center">
                        <Target className="w-5 h-5 mr-2" />
                        판정
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-green-400 font-medium">PERFECT</span>
                        <span className="text-white font-bold">{stats.hits.perfect}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-yellow-400 font-medium">GOOD</span>
                        <span className="text-white font-bold">{stats.hits.good}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-red-400 font-medium">MISS</span>
                        <span className="text-white font-bold">{stats.hits.miss}</span>
                    </div>
                    <div className="border-t border-slate-600 pt-2 mt-2">
                        <div className="flex justify-between items-center font-bold">
                            <span className="text-purple-300">총 히트</span>
                            <span className="text-white">
                                {stats.hits.perfect + stats.hits.good + stats.hits.miss}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Game Info */}
            {(currentSong || gameInfo) && (
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg text-purple-300 flex items-center">
                            <TrendingUp className="w-5 h-5 mr-2" />
                            게임 정보
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        {currentSong && (
                            <>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">BPM</span>
                                    <span className="text-white">{currentSong.bpm}</span>
                                </div>
                            </>
                        )}
                        {gameInfo && (
                            <>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">회전 속도</span>
                                    <span className="text-white">{gameInfo.rotationSpeed.toFixed(1)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">핀 개수</span>
                                    <span className="text-white">{gameInfo.pinCount}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">난이도</span>
                                    <span className="text-white">{gameInfo.difficulty}</span>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

export type { ScoreBoardProps };
