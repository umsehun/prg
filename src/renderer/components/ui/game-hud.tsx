import * as React from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ScoreDisplay } from "@/components/ui/score-display"
import { cn } from "@/lib/utils"
import { Pause, Volume2, Settings, Home } from "lucide-react"

interface GameHUDProps {
    songTitle: string
    songArtist: string
    currentTime: number
    totalTime: number
    score: number
    accuracy: number
    combo: number
    health: number
    isPaused?: boolean
    onPause: () => void
    onHome: () => void
    onSettings: () => void
    className?: string
}

export function GameHUD({
    songTitle,
    songArtist,
    currentTime,
    totalTime,
    score,
    accuracy,
    combo,
    health,
    isPaused = false,
    onPause,
    onHome,
    onSettings,
    className,
}: GameHUDProps) {
    const progress = (currentTime / totalTime) * 100
    const timeRemaining = totalTime - currentTime

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    return (
        <div className={cn("absolute inset-x-0 top-0 z-30 p-4", className)}>
            {/* Top Bar */}
            <div className="flex items-center justify-between mb-4">
                {/* Left: Song Info & Controls */}
                <div className="flex items-center space-x-4">
                    <div className="flex space-x-2">
                        <Button variant="ghost" size="icon" onClick={onPause}>
                            <Pause className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={onHome}>
                            <Home className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={onSettings}>
                            <Settings className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="bg-background/80 backdrop-blur-sm rounded-lg px-4 py-2">
                        <h2 className="font-semibold text-sm truncate max-w-48">{songTitle}</h2>
                        <p className="text-xs text-muted-foreground truncate max-w-48">{songArtist}</p>
                    </div>
                </div>

                {/* Center: Score Display */}
                <ScoreDisplay
                    score={score}
                    accuracy={accuracy}
                    combo={combo}
                    variant="compact"
                    className="bg-background/80"
                />

                {/* Right: Time Info */}
                <div className="bg-background/80 backdrop-blur-sm rounded-lg px-4 py-2 text-right">
                    <div className="text-sm font-mono">{formatTime(currentTime)}</div>
                    <div className="text-xs text-muted-foreground">
                        -{formatTime(timeRemaining)}
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-2">
                <Progress
                    value={progress}
                    variant="game"
                    size="sm"
                    className="h-1"
                />
            </div>

            {/* Health Bar */}
            <div className="flex items-center space-x-2">
                <span className="text-xs text-muted-foreground">HP</span>
                <Progress
                    value={health}
                    variant="health"
                    size="sm"
                    className="h-1 flex-1 max-w-32"
                />
                <span className="text-xs font-mono text-muted-foreground">
                    {Math.round(health)}%
                </span>
            </div>
        </div>
    )
}

export default GameHUD
