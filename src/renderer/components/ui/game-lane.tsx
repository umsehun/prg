import * as React from "react"
import { cn } from "@/lib/utils"

interface Note {
    id: string
    time: number
    lane: number
    type: 'normal' | 'hold' | 'special'
}

interface GameLaneProps {
    laneIndex: number
    notes: Note[]
    currentTime: number
    scrollSpeed: number
    isKeyPressed: boolean
    onNoteHit: (note: Note, timing: number) => void
    className?: string
}

export function GameLane({
    laneIndex,
    notes,
    currentTime,
    scrollSpeed,
    isKeyPressed,
    onNoteHit,
    className,
}: GameLaneProps) {
    const laneRef = React.useRef<HTMLDivElement>(null)
    const hitZoneRef = React.useRef<HTMLDivElement>(null)

    // Calculate note positions based on current time
    const visibleNotes = notes.filter(note => {
        const noteTime = note.time
        const timeUntilHit = noteTime - currentTime
        const maxViewTime = 2 // Show notes 2 seconds before they should be hit
        return timeUntilHit >= -0.5 && timeUntilHit <= maxViewTime
    })

    return (
        <div
            ref={laneRef}
            className={cn(
                "relative h-full w-20 rounded-lg border-2 bg-muted/20 backdrop-blur-sm overflow-hidden",
                isKeyPressed ? "border-primary bg-primary/10" : "border-muted",
                className
            )}
        >
            {/* Lane background with guidelines */}
            <div className="absolute inset-0 flex flex-col">
                {Array.from({ length: 20 }).map((_, i) => (
                    <div
                        key={i}
                        className="flex-1 border-b border-muted/20"
                    />
                ))}
            </div>

            {/* Hit Zone */}
            <div
                ref={hitZoneRef}
                className={cn(
                    "absolute bottom-4 left-1 right-1 h-16 rounded border-2 transition-all duration-75",
                    isKeyPressed
                        ? "border-primary bg-primary/20 scale-105"
                        : "border-primary/50 bg-primary/10"
                )}
            >
                <div className="absolute inset-0 rounded bg-gradient-to-t from-primary/30 to-transparent" />
            </div>

            {/* Notes */}
            {visibleNotes.map(note => {
                const timeUntilHit = note.time - currentTime
                const position = (2 - timeUntilHit) * scrollSpeed * 100 // Convert to percentage
                const bottomPosition = Math.max(0, Math.min(100, position))

                return (
                    <div
                        key={note.id}
                        className={cn(
                            "absolute left-1 right-1 h-4 rounded transition-all duration-75",
                            note.type === 'normal' && "bg-blue-500 border border-blue-400",
                            note.type === 'hold' && "bg-yellow-500 border border-yellow-400",
                            note.type === 'special' && "bg-purple-500 border border-purple-400",
                            "shadow-lg"
                        )}
                        style={{
                            bottom: `${bottomPosition}%`,
                        }}
                        onClick={() => onNoteHit(note, timeUntilHit)}
                    >
                        {/* Note glow effect */}
                        <div className="absolute inset-0 rounded bg-white/20" />

                        {/* Hold note trail */}
                        {note.type === 'hold' && (
                            <div className="absolute top-full left-1/2 w-1 h-8 bg-yellow-400 -translate-x-1/2 opacity-60" />
                        )}
                    </div>
                )
            })}

            {/* Lane number indicator */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 text-xs font-mono text-muted-foreground bg-background/60 rounded px-1">
                {laneIndex + 1}
            </div>
        </div>
    )
}

export default GameLane
