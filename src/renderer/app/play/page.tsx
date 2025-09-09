/**
 * Play Page - Game Selection with Real Data
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Target, Music, Clock, ArrowLeft } from 'lucide-react';
import { useSongs } from '@/hooks/useSongs';
import { useGameState } from '@/hooks/useGameState';
import Link from 'next/link';

interface GameMode {
    id: string;
    name: string;
    description: string;
    icon: React.ElementType;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    color: string;
}

const gameModes: GameMode[] = [
    {
        id: 'osu',
        name: 'osu! 모드',
        description: '어프로치 서클과 함께하는 클래식 서클 탭핑 게임플레이',
        icon: Target,
        difficulty: 'Medium',
        color: 'from-blue-500 to-cyan-500'
    },
    {
        id: 'pin',
        name: '핀 모드',
        description: '칼던지기 스타일 게임플레이 - 회전하는 타겟에 핀을 던지세요',
        icon: Target,
        difficulty: 'Easy',
        color: 'from-purple-500 to-pink-500'
    }
];

export default function PlayPage() {
    const { songs, loading } = useSongs();
    const { startGame } = useGameState();
    const [selectedMode, setSelectedMode] = useState<string | null>(null);
    const [selectedSong, setSelectedSong] = useState<any>(null);

    const handleModeSelect = (modeId: string) => {
        setSelectedMode(modeId);
    };

    const handleSongSelect = (song: any) => {
        setSelectedSong(song);
    };

    const startSelectedGame = async () => {
        if (selectedMode && selectedSong) {
            const success = await startGame(selectedSong, selectedMode as 'osu' | 'pin');
            if (success) {
                window.location.href = selectedMode === 'pin' ? '/pin' : '/game';
            }
        }
    };

    const formatDuration = (ms: number) => {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="min-h-full bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 p-6 pt-20">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/">
                        <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            돌아가기
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">플레이 모드</h1>
                        <p className="text-slate-400 text-lg">게임 모드를 선택하고 플레이를 시작하세요</p>
                    </div>
                </div>

                {/* Game Mode Selection */}
                <div className="mb-8">
                    <h2 className="text-2xl font-semibold text-white mb-4">게임 모드 선택</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {gameModes.map((mode) => {
                            const Icon = mode.icon;
                            return (
                                <Card
                                    key={mode.id}
                                    className={`cursor-pointer transition-all duration-300 hover:scale-105 ${selectedMode === mode.id
                                            ? 'bg-slate-700 border-purple-500 shadow-lg shadow-purple-500/25'
                                            : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                                        }`}
                                    onClick={() => handleModeSelect(mode.id)}
                                >
                                    <CardHeader>
                                        <div className="flex items-center gap-4">
                                            <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${mode.color} flex items-center justify-center`}>
                                                <Icon className="w-8 h-8 text-white" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-white text-xl">{mode.name}</CardTitle>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${mode.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                                                            mode.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                                                'bg-red-500/20 text-red-400'
                                                        }`}>
                                                        {mode.difficulty}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <CardDescription className="text-slate-300 text-base">
                                            {mode.description}
                                        </CardDescription>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>

                {/* Song Selection */}
                {selectedMode && (
                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <Music className="w-5 h-5" />
                                곡 선택
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="text-center py-8">
                                    <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                    <p className="text-slate-400">곡을 불러오는 중...</p>
                                </div>
                            ) : songs.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="text-slate-400 mb-4">
                                        <Music className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                        아직 사용 가능한 곡이 없습니다
                                    </div>
                                    <p className="text-slate-500 mb-6">
                                        라이브러리 섹션에서 .osz 파일을 가져와서 플레이를 시작하세요
                                    </p>
                                    <Button
                                        variant="outline"
                                        className="border-slate-600 text-slate-300 hover:bg-slate-700"
                                        onClick={() => window.location.href = '/select'}
                                    >
                                        라이브러리로 가기
                                    </Button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {songs.slice(0, 8).map((song) => (
                                        <Card
                                            key={song.id}
                                            className={`cursor-pointer transition-all duration-300 hover:scale-105 ${selectedSong?.id === song.id
                                                    ? 'bg-slate-700 border-purple-500 shadow-lg shadow-purple-500/25'
                                                    : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                                                }`}
                                            onClick={() => handleSongSelect(song)}
                                        >
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-white text-lg truncate">{song.title}</CardTitle>
                                                <CardDescription className="text-slate-400 truncate">{song.artist}</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="flex items-center justify-between text-sm text-slate-400">
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="w-4 h-4" />
                                                        {formatDuration(song.duration)}
                                                    </div>
                                                    <div className="text-slate-500">
                                                        {song.bpm} BPM
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}

                            {selectedSong && (
                                <div className="mt-6 pt-6 border-t border-slate-600">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-lg font-semibold text-white">{selectedSong.title}</h4>
                                            <p className="text-slate-400">{selectedSong.artist}</p>
                                        </div>
                                        <Button
                                            onClick={startSelectedGame}
                                            className="bg-purple-500 hover:bg-purple-600 text-white px-8"
                                        >
                                            <Play className="w-4 h-4 mr-2" />
                                            게임 시작
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
