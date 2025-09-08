import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Play, Star, Clock, Heart, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"

interface Song {
    id: string
    title: string
    artist: string
    difficulty: string
    duration: string
    bpm: number
    rating: number
    plays: number
    isFavorite?: boolean
    coverArt?: string
}

interface SongCardProps {
    song: Song
    isSelected?: boolean
    viewMode: 'grid' | 'list'
    onSelect: (song: Song) => void
    onPlay: (song: Song) => void
    onToggleFavorite: (song: Song) => void
}

const difficultyColors = {
    Easy: 'bg-green-500',
    Normal: 'bg-blue-500',
    Hard: 'bg-orange-500',
    Expert: 'bg-red-500',
} as const

export function SongCard({
    song,
    isSelected = false,
    viewMode,
    onSelect,
    onPlay,
    onToggleFavorite,
}: SongCardProps) {
    if (viewMode === 'list') {
        return (
            <Card
                className={cn(
                    "cursor-pointer transition-all duration-200 hover:scale-[1.01] hover:shadow-md",
                    isSelected && "ring-2 ring-primary"
                )}
                onClick={() => onSelect(song)}
            >
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        {/* Song Info */}
                        <div className="flex items-center space-x-4 flex-1 min-w-0">
                            {/* Cover Art */}
                            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0">
                                {song.coverArt ? (
                                    <img
                                        src={song.coverArt}
                                        alt={song.title}
                                        className="h-full w-full object-cover rounded-lg"
                                    />
                                ) : (
                                    <Play className="h-5 w-5" />
                                )}
                            </div>

                            {/* Title & Artist */}
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold truncate">{song.title}</h3>
                                <p className="text-sm text-muted-foreground truncate">
                                    {song.artist}
                                </p>
                            </div>
                        </div>

                        {/* Metadata */}
                        <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-1">
                                <Clock className="h-4 w-4" />
                                <span>{song.duration}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                <span>{song.rating}</span>
                            </div>
                            <div className="text-xs">
                                {song.plays.toLocaleString()} plays
                            </div>
                            <div className={cn(
                                "rounded-full px-3 py-1 text-xs font-medium text-white",
                                difficultyColors[song.difficulty as keyof typeof difficultyColors] || 'bg-gray-500'
                            )}>
                                {song.difficulty}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2 ml-4">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onToggleFavorite(song)
                                }}
                                className="h-8 w-8"
                            >
                                <Heart
                                    className={cn(
                                        "h-4 w-4",
                                        song.isFavorite && "fill-red-500 text-red-500"
                                    )}
                                />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onPlay(song)
                                }}
                                className="h-8 w-8"
                            >
                                <Play className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    // Grid view
    return (
        <Card
            className={cn(
                "cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg",
                isSelected && "ring-2 ring-primary"
            )}
            onClick={() => onSelect(song)}
        >
            <CardContent className="p-4">
                {/* Cover Art */}
                <div className="aspect-square rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-4 relative group">
                    {song.coverArt ? (
                        <img
                            src={song.coverArt}
                            alt={song.title}
                            className="h-full w-full object-cover rounded-lg"
                        />
                    ) : (
                        <Play className="h-12 w-12 opacity-50" />
                    )}

                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                                e.stopPropagation()
                                onPlay(song)
                            }}
                            className="h-12 w-12 text-white hover:bg-white/20"
                        >
                            <Play className="h-6 w-6" />
                        </Button>
                    </div>

                    {/* Favorite button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                            e.stopPropagation()
                            onToggleFavorite(song)
                        }}
                        className="absolute top-2 right-2 h-8 w-8 bg-black/20 hover:bg-black/40"
                    >
                        <Heart
                            className={cn(
                                "h-4 w-4",
                                song.isFavorite ? "fill-red-500 text-red-500" : "text-white"
                            )}
                        />
                    </Button>
                </div>

                {/* Song Info */}
                <div className="space-y-2">
                    <div>
                        <h3 className="font-semibold truncate">{song.title}</h3>
                        <p className="text-sm text-muted-foreground truncate">
                            {song.artist}
                        </p>
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{song.duration}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3 text-yellow-500 fill-current" />
                            <span>{song.rating}</span>
                        </div>
                    </div>

                    {/* Difficulty */}
                    <div className={cn(
                        "rounded-full px-2 py-1 text-xs font-medium text-white text-center",
                        difficultyColors[song.difficulty as keyof typeof difficultyColors] || 'bg-gray-500'
                    )}>
                        {song.difficulty}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export type { Song }
