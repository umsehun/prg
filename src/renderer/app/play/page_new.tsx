/**
 * Play Page - Pin Mode Game Selection with Real Data
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Music, Clock, ArrowLeft } from 'lucide-react';
import { useSongs } from '@/hooks/useSongs';
import { useGameState } from '@/hooks/useGameState';
import Link from 'next/link';

export default function PlayPage() {
    const { songs, loading } = useSongs();
    const { startGame } = useGameState();
    const [selectedSong, setSelectedSong] = useState<any>(null);

    const handleSongSelect = (song: any) => {
        setSelectedSong(song);
    };

    const startPinGame = async () => {
        if (selectedSong) {
            const success = await startGame(selectedSong, 'pin');
            if (success) {
                window.location.href = '/pin';
            }
        }
    };

    const formatDuration = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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
                        <h1 className="text-4xl font-bold text-white mb-2">핀 모드</h1>
                        <p className="text-slate-400 text-lg">회전하는 타겟에 핀을 던지며 리듬을 즐기세요</p>
                    </div>
                </div>

                {/* Pin Mode Info */}
                <Card className="mb-8 bg-gradient-to-r from-purple-900/30 to-pink-900/30 border-purple-500/50">
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                <Target className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-white text-2xl">핀 모드</CardTitle>
                                <CardDescription className="text-purple-200 text-lg">
                                    회전하는 타겟에 핀을 던지며 리듬을 즐기는 게임플레이
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                {/* Song Selection */}
                <div className="mb-8">
                    <h2 className="text-2xl font-semibold text-white mb-4">곡 선택</h2>

                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
                            <p className="text-slate-400 mt-4">곡 목록을 불러오는 중...</p>
                        </div>
                    ) : songs.length === 0 ? (
                        <Card className="bg-slate-800/50 border-slate-700">
                            <CardContent className="py-12 text-center">
                                <Music className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-slate-300 mb-2">곡이 없습니다</h3>
                                <p className="text-slate-500 mb-6">
                                    .osz 파일을 가져와서 게임을 시작하세요
                                </p>
                                <Link href="/select">
                                    <Button className="bg-purple-500 hover:bg-purple-600">
                                        곡 라이브러리로 가기
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4">
                            {songs.map((song) => (
                                <Card
                                    key={song.id}
                                    className={`cursor-pointer transition-all duration-300 ${selectedSong?.id === song.id
                                        ? 'bg-purple-900/50 border-purple-500 shadow-lg shadow-purple-500/25'
                                        : 'bg-slate-800/50 border-slate-700 hover:border-purple-500/50 hover:bg-slate-700/50'
                                        }`}
                                    onClick={() => handleSongSelect(song)}
                                >
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <Music className="w-8 h-8 text-white" />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-xl font-semibold text-white mb-1 truncate">
                                                    {song.title}
                                                </h3>
                                                <p className="text-slate-400 mb-2 truncate">
                                                    {song.artist}
                                                </p>

                                                <div className="flex items-center gap-4 text-sm text-slate-500">
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="w-4 h-4" />
                                                        {formatDuration(song.duration)}
                                                    </div>
                                                    <div>
                                                        BPM: {song.bpm}
                                                    </div>
                                                    <div>
                                                        난이도: ★{song.difficulty.easy}
                                                    </div>
                                                </div>
                                            </div>

                                            {selectedSong?.id === song.id && (
                                                <div className="flex-shrink-0">
                                                    <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                                                        <div className="w-2 h-2 bg-white rounded-full"></div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                {/* Start Game Button */}
                {selectedSong && (
                    <div className="text-center">
                        <Button
                            size="lg"
                            className="bg-purple-500 hover:bg-purple-600 text-white px-12 py-4 text-lg"
                            onClick={startPinGame}
                        >
                            <Target className="w-6 h-6 mr-2" />
                            핀 모드 시작
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
