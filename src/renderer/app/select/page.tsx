"use client"

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FilterBar } from '@/components/ui/filter-bar'
import { SongCard, type Song } from '@/components/ui/song-card'
import { PageTransition } from '@/components/ui/page-transition'
import { AnimatedButton } from '@/components/ui/animated-button'
import { ArrowLeft, Search, Play, Star, Heart } from 'lucide-react'
import Link from 'next/link'
import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'

// Extended mock data
const mockSongs: Song[] = [
    {
        id: "1",
        title: "Lost One's Weeping",
        artist: "Neru",
        difficulty: "Hard",
        duration: "3:45",
        bpm: 145,
        rating: 4.8,
        plays: 1234,
        isFavorite: true,
    },
    {
        id: "2",
        title: "Bad Apple!!",
        artist: "Alstroemeria Records",
        difficulty: "Expert",
        duration: "3:40",
        bpm: 138,
        rating: 4.9,
        plays: 2567,
        isFavorite: false,
    },
    {
        id: "3",
        title: "Get Jinxed",
        artist: "Riot Games",
        difficulty: "Normal",
        duration: "3:12",
        bpm: 175,
        rating: 4.7,
        plays: 856,
        isFavorite: true,
    },
    {
        id: "4",
        title: "POP/STARS",
        artist: "K/DA",
        difficulty: "Hard",
        duration: "3:18",
        bpm: 170,
        rating: 4.6,
        plays: 1890,
        isFavorite: false,
    },
    {
        id: "5",
        title: "Tetorisu",
        artist: "Unknown Artist",
        difficulty: "Easy",
        duration: "2:45",
        bpm: 120,
        rating: 4.2,
        plays: 567,
        isFavorite: false,
    },
    {
        id: "6",
        title: "HOYO-MiX",
        artist: "miHoYo",
        difficulty: "Expert",
        duration: "4:20",
        bpm: 160,
        rating: 4.8,
        plays: 987,
        isFavorite: true,
    },
]

export default function SelectPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedSong, setSelectedSong] = useState<Song | null>(null)
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
    const [sortBy, setSortBy] = useState('title')
    const [filterBy, setFilterBy] = useState('all')
    const [songs, setSongs] = useState(mockSongs)

    // Filter and sort songs
    const filteredAndSortedSongs = useMemo(() => {
        let filtered = songs.filter(song => {
            const matchesSearch = song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                song.artist.toLowerCase().includes(searchQuery.toLowerCase())
            const matchesFilter = filterBy === 'all' || song.difficulty.toLowerCase() === filterBy.toLowerCase()
            return matchesSearch && matchesFilter
        })

        return filtered.sort((a, b) => {
            switch (sortBy) {
                case 'title':
                    return a.title.localeCompare(b.title)
                case 'artist':
                    return a.artist.localeCompare(b.artist)
                case 'difficulty':
                    const diffOrder = ['Easy', 'Normal', 'Hard', 'Expert']
                    return diffOrder.indexOf(a.difficulty) - diffOrder.indexOf(b.difficulty)
                case 'rating':
                    return b.rating - a.rating
                case 'plays':
                    return b.plays - a.plays
                case 'recent':
                    // Mock recent order - in real app would be based on last played time
                    return 0
                default:
                    return 0
            }
        })
    }, [songs, searchQuery, filterBy, sortBy])

    const handleToggleFavorite = (song: Song) => {
        setSongs(prev => prev.map(s =>
            s.id === song.id ? { ...s, isFavorite: !s.isFavorite } : s
        ))
    }

    const handlePlaySong = (song: Song) => {
        // Navigate to game page with song
        window.location.href = `/game?song=${song.id}`
    }

    return (
        <PageTransition className="flex h-full flex-col">
            {/* Header */}
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="flex items-center justify-between border-b bg-background/95 p-4 backdrop-blur-sm"
            >
                <div className="flex items-center space-x-4">
                    <AnimatedButton variant="ghost" size="icon" asChild hoverScale={1.1}>
                        <Link href="/">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </AnimatedButton>
                    <div>
                        <h1 className="text-2xl font-bold">Song Selection</h1>
                        <p className="text-sm text-muted-foreground">
                            {filteredAndSortedSongs.length} songs available
                        </p>
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search songs..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-64 pl-10"
                        />
                    </div>
                </div>
            </motion.div>

            {/* Filter Bar */}
            <div className="p-4 border-b">
                <FilterBar
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                    sortBy={sortBy}
                    onSortChange={setSortBy}
                    filterBy={filterBy}
                    onFilterChange={setFilterBy}
                />
            </div>

            {/* Content */}
            <div className="flex flex-1 overflow-hidden">
                {/* Song List */}
                <div className="flex-1 overflow-y-auto p-4">
                    {viewMode === 'list' ? (
                        <div className="space-y-3">
                            {filteredAndSortedSongs.map((song) => (
                                <SongCard
                                    key={song.id}
                                    song={song}
                                    isSelected={selectedSong?.id === song.id}
                                    viewMode={viewMode}
                                    onSelect={setSelectedSong}
                                    onPlay={handlePlaySong}
                                    onToggleFavorite={handleToggleFavorite}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {filteredAndSortedSongs.map((song) => (
                                <SongCard
                                    key={song.id}
                                    song={song}
                                    isSelected={selectedSong?.id === song.id}
                                    viewMode={viewMode}
                                    onSelect={setSelectedSong}
                                    onPlay={handlePlaySong}
                                    onToggleFavorite={handleToggleFavorite}
                                />
                            ))}
                        </div>
                    )}

                    {filteredAndSortedSongs.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-64 text-center">
                            <Search className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No songs found</h3>
                            <p className="text-muted-foreground">
                                Try adjusting your search or filter criteria
                            </p>
                        </div>
                    )}
                </div>

                {/* Song Info Panel */}
                {selectedSong && (
                    <div className="w-80 border-l bg-muted/30 p-6">
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-xl font-bold">{selectedSong.title}</h2>
                                <p className="text-muted-foreground">{selectedSong.artist}</p>
                            </div>

                            {/* Cover Art */}
                            <div className="aspect-square rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                                {selectedSong.coverArt ? (
                                    <img
                                        src={selectedSong.coverArt}
                                        alt={selectedSong.title}
                                        className="h-full w-full object-cover rounded-lg"
                                    />
                                ) : (
                                    <Play className="h-12 w-12 text-primary" />
                                )}
                            </div>

                            {/* Metadata */}
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Duration</span>
                                    <span className="text-sm font-medium">{selectedSong.duration}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">BPM</span>
                                    <span className="text-sm font-medium">{selectedSong.bpm}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Difficulty</span>
                                    <span className="text-sm font-medium">{selectedSong.difficulty}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Plays</span>
                                    <span className="text-sm font-medium">{selectedSong.plays.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Rating</span>
                                    <div className="flex items-center space-x-1">
                                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                        <span className="text-sm font-medium">{selectedSong.rating}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="space-y-3">
                                <Button
                                    variant="game"
                                    size="lg"
                                    className="w-full"
                                    onClick={() => handlePlaySong(selectedSong)}
                                >
                                    <Play className="mr-2 h-4 w-4" />
                                    Play
                                </Button>
                                <div className="grid grid-cols-2 gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleToggleFavorite(selectedSong)}
                                    >
                                        <Heart className={`mr-2 h-4 w-4 ${selectedSong.isFavorite ? 'fill-current text-red-500' : ''}`} />
                                        {selectedSong.isFavorite ? 'Unfavorite' : 'Favorite'}
                                    </Button>
                                    <Button variant="outline" size="sm">
                                        Preview
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </PageTransition>
    )
}
