/**
 * Select Page - Song Library with Real Data
 */

'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Search, Play, Star, Heart, Music, Clock, Zap, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import { useSongs } from '@/hooks/useSongs';
import { useGameState } from '@/hooks/useGameState';

export default function SelectPage() {
    const { songs, loading, error, refreshLibrary } = useSongs();
    const { startGame } = useGameState();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

    // Filter songs based on search and difficulty
    const filteredSongs = useMemo(() => {
        return songs.filter(song => {
            const matchesSearch = song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                song.artist.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesDifficulty = selectedDifficulty === 'all' ||
                Object.keys(song.difficulty).some(diff =>
                    diff === selectedDifficulty && song.difficulty[diff as keyof typeof song.difficulty]
                );

            return matchesSearch && matchesDifficulty;
        });
    }, [songs, searchQuery, selectedDifficulty]);

    const handlePlaySong = async (songId: string, mode: 'osu' | 'pin' = 'pin') => {
        const song = songs.find(s => s.id === songId);
        if (song) {
            await startGame(song, mode);
            // Navigate to game page or pin page based on mode
            window.location.href = mode === 'pin' ? '/pin' : '/game';
        }
    };

    const formatDuration = (ms: number) => {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    if (loading) {
        return (
            <div className="min-h-full bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white text-lg">Loading Song Library...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-full bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 p-6">
                <div className="max-w-4xl mx-auto">
                    <Card className="bg-red-900/20 border-red-500">
                        <CardHeader>
                            <CardTitle className="text-red-400">Error Loading Songs</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-red-300 mb-4">{error}</p>
                            <Button onClick={refreshLibrary} variant="outline" className="border-red-500 text-red-300">
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Retry
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-full bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 p-6 pt-20">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link href="/">
                            <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-4xl font-bold text-white mb-2">곡 라이브러리</h1>
                            <p className="text-slate-400 text-lg">{songs.length}곡 사용 가능</p>
                        </div>
                    </div>

                    <Button onClick={refreshLibrary} variant="outline" className="border-purple-500 text-purple-300">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        새로고침
                    </Button>
                </div>

                {/* Search and Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <Input
                            placeholder="곡이나 아티스트 검색..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 bg-slate-800 border-slate-700 text-white placeholder-slate-400"
                        />
                    </div>

                    <div className="flex gap-2">
                        {['all', 'easy', 'normal', 'hard', 'expert'].map((difficulty) => (
                            <Button
                                key={difficulty}
                                variant={selectedDifficulty === difficulty ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setSelectedDifficulty(difficulty)}
                                className={selectedDifficulty === difficulty
                                    ? 'bg-purple-500 text-white'
                                    : 'text-slate-300 hover:text-white'
                                }
                            >
                                {difficulty === 'all' ? '전체' :
                                    difficulty === 'easy' ? '쉬움' :
                                        difficulty === 'normal' ? '보통' :
                                            difficulty === 'hard' ? '어려움' : '익스퍼트'}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Songs Grid */}
                {filteredSongs.length === 0 ? (
                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardContent className="text-center py-12">
                            <Music className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-white mb-2">곡을 찾을 수 없습니다</h3>
                            <p className="text-slate-400 mb-4">
                                {searchQuery ? '검색 조건에 맞는 곡이 없습니다.' : '라이브러리가 비어 있습니다.'}
                            </p>
                            <Button variant="outline" className="border-slate-600 text-slate-300">
                                .osz 파일 가져오기
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredSongs.map((song) => (
                            <Card
                                key={song.id}
                                className="bg-slate-800/50 border-slate-700 hover:bg-slate-700/50 transition-all duration-300 group"
                            >
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1 min-w-0">
                                            <CardTitle className="text-white text-lg truncate">{song.title}</CardTitle>
                                            <CardDescription className="text-slate-400 truncate">{song.artist}</CardDescription>
                                        </div>
                                        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-red-400">
                                            <Heart className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    {/* Song Info */}
                                    <div className="flex items-center justify-between text-sm text-slate-400">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4" />
                                            {formatDuration(song.duration)}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Zap className="w-4 h-4" />
                                            {song.bpm} BPM
                                        </div>
                                    </div>

                                    {/* Difficulties */}
                                    <div className="flex gap-1">
                                        {Object.entries(song.difficulty).map(([diff, stars]) =>
                                            stars ? (
                                                <div
                                                    key={diff}
                                                    className={`px-2 py-1 rounded text-xs font-medium ${diff === 'easy' ? 'bg-green-500/20 text-green-400' :
                                                            diff === 'normal' ? 'bg-blue-500/20 text-blue-400' :
                                                                diff === 'hard' ? 'bg-yellow-500/20 text-yellow-400' :
                                                                    'bg-red-500/20 text-red-400'
                                                        }`}
                                                >
                                                    {diff === 'easy' ? '쉬움' :
                                                        diff === 'normal' ? '보통' :
                                                            diff === 'hard' ? '어려움' :
                                                                diff === 'expert' ? '익스퍼트' : diff.charAt(0).toUpperCase() + diff.slice(1)} {String(stars)}★
                                                </div>
                                            ) : null
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2 pt-2">
                                        <Button
                                            size="sm"
                                            onClick={() => handlePlaySong(song.id, 'pin')}
                                            className="flex-1 bg-purple-500 hover:bg-purple-600 text-white"
                                        >
                                            <Play className="w-4 h-4 mr-2" />
                                            핀 모드
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handlePlaySong(song.id, 'osu')}
                                            className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                                        >
                                            osu! 모드
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
