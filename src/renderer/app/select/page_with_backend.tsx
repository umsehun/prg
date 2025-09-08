"use client"

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FilterBar } from '@/components/ui/filter-bar'
import { SongCard, type Song } from '@/components/ui/song-card'
import { PageTransition } from '@/components/ui/page-transition'
import { AnimatedButton } from '@/components/ui/animated-button'
import { LoadingSpinner } from '@/components/ui/loading-animations'
import { useCharts } from '@/hooks/useCharts'
import { ArrowLeft, Search, Play, Star, Heart, RefreshCw, Upload, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'

export default function SelectPage() {
    // State
    const [searchQuery, setSearchQuery] = useState('')
    const [filterBy, setFilterBy] = useState<'all' | 'easy' | 'normal' | 'hard' | 'expert' | 'favorites'>('all')
    const [sortBy, setSortBy] = useState<'title' | 'artist' | 'difficulty' | 'bpm' | 'rating' | 'recent'>('title')
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [selectedSong, setSelectedSong] = useState<Song | null>(null)

    // Use actual chart data from backend
    const { charts, loading, error, refreshCharts, importChart } = useCharts()

    // Convert ChartData to Song format for compatibility
    const songs: Song[] = useMemo(() => {
        return charts.map(chart => ({
            id: chart.id,
            title: chart.title,
            artist: chart.artist,
            difficulty: chart.difficulty,
            duration: `${Math.floor(chart.duration / 60)}:${(chart.duration % 60).toString().padStart(2, '0')}`,
            bpm: chart.bpm,
            rating: 4.5, // Default rating - could be added to backend later
            plays: 0, // Default plays - could be tracked in backend
            isFavorite: false, // Could be stored in settings
        }))
    }, [charts])

    // Filter and sort logic
    const filteredAndSortedSongs = useMemo(() => {
        let filtered = songs.filter(song => {
            const matchesSearch = song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                song.artist.toLowerCase().includes(searchQuery.toLowerCase())

            const matchesFilter = filterBy === 'all' ||
                filterBy === 'favorites' ? song.isFavorite :
                song.difficulty.toLowerCase() === filterBy

            return matchesSearch && matchesFilter
        })

        return filtered.sort((a, b) => {
            switch (sortBy) {
                case 'title': return a.title.localeCompare(b.title)
                case 'artist': return a.artist.localeCompare(b.artist)
                case 'difficulty': return a.difficulty.localeCompare(b.difficulty)
                case 'bpm': return b.bpm - a.bpm
                case 'rating': return b.rating - a.rating
                case 'recent': return b.plays - a.plays
                default: return 0
            }
        })
    }, [songs, searchQuery, filterBy, sortBy])

    const handleImportSong = async () => {
        try {
            const result = await importChart()
            if (!result.success) {
                console.error('Import failed:', result.error)
                // Could show a toast notification here
            }
        } catch (err) {
            console.error('Import error:', err)
        }
    }

    const handleToggleFavorite = (song: Song) => {
        // This would need to be persisted to backend/settings
        console.log('Toggle favorite:', song.id)
    }

    const handlePlaySong = (song: Song) => {
        window.location.href = `/game?song=${song.id}`
    }

    if (loading) {
        return (
            <PageTransition className="flex h-full items-center justify-center">
                <div className="text-center space-y-4">
                    <LoadingSpinner size="lg" className="mx-auto text-blue-600" />
                    <p className="text-slate-600 dark:text-slate-400">Loading song library...</p>
                </div>
            </PageTransition>
        )
    }

    if (error) {
        return (
            <PageTransition className="flex h-full items-center justify-center">
                <div className="text-center space-y-4 max-w-md">
                    <AlertCircle className="h-12 w-12 mx-auto text-red-500" />
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                        Failed to Load Songs
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400">{error}</p>
                    <div className="flex space-x-4 justify-center">
                        <AnimatedButton onClick={refreshCharts} className="flex items-center">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Retry
                        </AnimatedButton>
                        <AnimatedButton variant="outline" asChild>
                            <Link href="/">Back to Menu</Link>
                        </AnimatedButton>
                    </div>
                </div>
            </PageTransition>
        )
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
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search songs..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-64 pl-10"
                        />
                    </div>

                    {/* Import Button */}
                    <AnimatedButton
                        onClick={handleImportSong}
                        className="flex items-center bg-green-600 hover:bg-green-700 text-white"
                    >
                        <Upload className="mr-2 h-4 w-4" />
                        Import OSZ
                    </AnimatedButton>

                    {/* Refresh Button */}
                    <AnimatedButton
                        variant="outline"
                        onClick={refreshCharts}
                        className="flex items-center"
                    >
                        <RefreshCw className="h-4 w-4" />
                    </AnimatedButton>
                </div>
            </motion.div>

            {/* Filter Bar */}
            <motion.div
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                <FilterBar
                    filterBy={filterBy}
                    sortBy={sortBy}
                    viewMode={viewMode}
                    onFilterChange={(filter) => setFilterBy(filter as typeof filterBy)}
                    onSortChange={(sort) => setSortBy(sort as typeof sortBy)}
                    onViewModeChange={setViewMode}
                />
            </motion.div>

            {/* Main Content */}
            <div className="flex flex-1 overflow-hidden">
                {/* Song List */}
                <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex-1 overflow-y-auto p-4"
                >
                    {filteredAndSortedSongs.length === 0 ? (
                        <div className="flex h-full items-center justify-center">
                            <div className="text-center space-y-4">
                                <div className="text-4xl">🎵</div>
                                <div>
                                    <h3 className="text-lg font-semibold text-muted-foreground">No songs found</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {searchQuery || filterBy !== 'all'
                                            ? 'Try adjusting your search or filters'
                                            : 'Import some .osz files to get started'
                                        }
                                    </p>
                                </div>
                                {!searchQuery && filterBy === 'all' && (
                                    <AnimatedButton
                                        onClick={handleImportSong}
                                        className="bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                        <Upload className="mr-2 h-4 w-4" />
                                        Import Your First Song
                                    </AnimatedButton>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className={viewMode === 'grid'
                            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                            : 'space-y-2'
                        }>
                            {filteredAndSortedSongs.map((song, index) => (
                                <motion.div
                                    key={song.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 + index * 0.05 }}
                                >
                                    <SongCard
                                        song={song}
                                        viewMode={viewMode}
                                        isSelected={selectedSong?.id === song.id}
                                        onSelect={setSelectedSong}
                                        onPlay={handlePlaySong}
                                        onToggleFavorite={handleToggleFavorite}
                                    />
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Song Details Panel */}
                {selectedSong && (
                    <motion.div
                        initial={{ x: 300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 100 }}
                        className="w-80 border-l bg-card/50 backdrop-blur-sm p-6"
                    >
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-2xl font-bold">{selectedSong.title}</h2>
                                <p className="text-lg text-muted-foreground">{selectedSong.artist}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <div className="text-muted-foreground">Difficulty</div>
                                    <div className="font-medium">{selectedSong.difficulty}</div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground">Duration</div>
                                    <div className="font-medium">{selectedSong.duration}</div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground">BPM</div>
                                    <div className="font-medium">{selectedSong.bpm}</div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground">Rating</div>
                                    <div className="flex items-center">
                                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                                        <span className="font-medium">{selectedSong.rating}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <AnimatedButton
                                    size="lg"
                                    onClick={() => handlePlaySong(selectedSong)}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    <Play className="mr-2 h-4 w-4" />
                                    Play Song
                                </AnimatedButton>

                                <div className="flex space-x-2">
                                    <AnimatedButton
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleToggleFavorite(selectedSong)}
                                        className="flex-1"
                                    >
                                        <Heart className={`mr-2 h-4 w-4 ${selectedSong.isFavorite ? 'fill-current text-red-500' : ''}`} />
                                        {selectedSong.isFavorite ? 'Unfavorite' : 'Favorite'}
                                    </AnimatedButton>
                                    <AnimatedButton variant="outline" size="sm">
                                        Preview
                                    </AnimatedButton>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </PageTransition>
    )
}
