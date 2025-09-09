/**
 * Home Page - Pin Rhythm Game Welcome Screen
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Target,
    Play,
    Music,
    Settings,
    Download,
    Zap,
    RotateCw,
    Medal
} from 'lucide-react';

export default function HomePage() {
    const [stats, setStats] = useState({
        songsImported: 0,
        totalPlays: 0,
        highScore: 0,
        accuracy: 0
    });

    useEffect(() => {
        // TODO: Load stats from backend
        setStats({
            songsImported: 12,
            totalPlays: 45,
            highScore: 125800,
            accuracy: 87.5
        });
    }, []);

    const quickActions = [
        {
            title: '게임 시작',
            description: '핀 모드로 리듬 게임을 즐기세요',
            icon: Play,
            color: 'from-purple-500 to-pink-500',
            href: '/play'
        },
        {
            title: '곡 라이브러리',
            description: '.osz 파일과 비트맵을 관리하세요',
            icon: Music,
            color: 'from-blue-500 to-cyan-500',
            href: '/select'
        },
        {
            title: '설정',
            description: '리듬 게임 경험을 커스터마이즈하세요',
            icon: Settings,
            color: 'from-green-500 to-teal-500',
            href: '/settings'
        }
    ];

    return (
        <div className="min-h-full bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Hero Section */}
                <div className="text-center mb-12">
                    <div className="flex justify-center mb-6">
                        <div className="relative">
                            <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/25">
                                <Target className="w-12 h-12 text-white" />
                            </div>
                            <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                                <Zap className="w-4 h-4 text-slate-900" />
                            </div>
                        </div>
                    </div>

                    <h1 className="text-6xl font-bold text-white mb-4">
                        Pin Rhythm
                    </h1>
                    <p className="text-2xl text-slate-300 mb-6 max-w-3xl mx-auto">
                        osu! 비트맵을 완전히 새로운 방식으로 경험하세요
                    </p>
                    <p className="text-lg text-slate-400 mb-8">
                        회전하는 타겟에 핀을 던지고, 리듬을 따라가며, 타이밍을 마스터하세요
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            size="lg"
                            className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-4 text-lg h-auto"
                        >
                            <Target className="w-6 h-6 mr-2" />
                            핀 모드 체험
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="border-slate-600 text-slate-300 hover:bg-slate-700 px-8 py-4 text-lg h-auto"
                        >
                            <Download className="w-6 h-6 mr-2" />
                            .osz 파일 가져오기
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardContent className="pt-4">
                            <div className="text-center">
                                <Music className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                                <div className="text-2xl font-bold text-white">{stats.songsImported}</div>
                                <div className="text-slate-400 text-sm">곡 수</div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardContent className="pt-4">
                            <div className="text-center">
                                <Play className="w-8 h-8 text-green-400 mx-auto mb-2" />
                                <div className="text-2xl font-bold text-white">{stats.totalPlays}</div>
                                <div className="text-slate-400 text-sm">플레이 횟수</div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardContent className="pt-4">
                            <div className="text-center">
                                <Medal className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                                <div className="text-2xl font-bold text-white">{stats.highScore.toLocaleString()}</div>
                                <div className="text-slate-400 text-sm">최고 점수</div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardContent className="pt-4">
                            <div className="text-center">
                                <Target className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                                <div className="text-2xl font-bold text-white">{stats.accuracy}%</div>
                                <div className="text-slate-400 text-sm">정확도</div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {quickActions.map((action, index) => {
                        const Icon = action.icon;
                        return (
                            <Card
                                key={index}
                                className="bg-slate-800/50 border-slate-700 hover:bg-slate-800 transition-all duration-300 cursor-pointer hover:scale-105"
                            >
                                <CardHeader>
                                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-4`}>
                                        <Icon className="w-8 h-8 text-white" />
                                    </div>
                                    <CardTitle className="text-white text-xl">{action.title}</CardTitle>
                                    <CardDescription className="text-slate-300">
                                        {action.description}
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        );
                    })}
                </div>

                {/* Features Section */}
                <Card className="bg-slate-800/30 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-white text-2xl text-center">
                            왜 Pin Rhythm인가?
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Target className="w-8 h-8 text-purple-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-2">osu! 호환</h3>
                                <p className="text-slate-400">
                                    기존 .osz 비트맵을 새로운 게임플레이 스타일로 즐기세요
                                </p>
                            </div>

                            <div className="text-center">
                                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <RotateCw className="w-8 h-8 text-blue-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-2">핀 모드</h3>
                                <p className="text-slate-400">
                                    나이프 히트에서 영감받은 게임플레이와 리듬 게임의 정밀함이 만나다
                                </p>
                            </div>

                            <div className="text-center">
                                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Zap className="w-8 h-8 text-green-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-2">쉬운 학습</h3>
                                <p className="text-slate-400">
                                    복잡한 움직임보다 타이밍에 집중하는 직관적인 컨트롤
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
