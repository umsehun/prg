"use client"

import { Button } from '@/components/ui/button'
import { ScoreDisplay } from '@/components/ui/score-display'
import { JudgmentDisplay } from '@/components/ui/judgment-display'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, Pause, Volume2 } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

export default function GamePage() {
    const searchParams = useSearchParams()
    const songId = searchParams.get('song')

    // Game state
    const [isPlaying, setIsPlaying] = useState(false)
    const [isPaused, setIsPaused] = useState(false)
    const [score, setScore] = useState(0)
    const [accuracy, setAccuracy] = useState(1.0)
    const [combo, setCombo] = useState(0)
    const [progress, setProgress] = useState(0)
    const [showJudgment, setShowJudgment] = useState(false)
    const [currentJudgment, setCurrentJudgment] = useState<'perfect' | 'great' | 'good' | 'miss'>('perfect')

    // Mock song data
    const currentSong = {
        id: songId || '1',
        title: "Lost One's Weeping",
        artist: "Neru",
        duration: 225, // 3:45 in seconds
    }

    // Game simulation (for demo)
    useEffect(() => {
        if (!isPlaying || isPaused) return

        const interval = setInterval(() => {
            setProgress(prev => {
                const newProgress = prev + (100 / currentSong.duration) / 10 // Update every 100ms
                return newProgress >= 100 ? 100 : newProgress
            })

            // Simulate random hits for demo
            if (Math.random() < 0.1) { // 10% chance per update
                const judgments: Array<'perfect' | 'great' | 'good' | 'miss'> = ['perfect', 'great', 'good', 'miss']
                const judgment = judgments[Math.floor(Math.random() * judgments.length)]
                if (judgment) {
                    setCurrentJudgment(judgment)
                    setShowJudgment(true)

                    // Update score and combo
                    if (judgment !== 'miss') {
                        setCombo(prev => prev + 1)
                        setScore(prev => prev + (judgment === 'perfect' ? 300 : judgment === 'great' ? 100 : 50))
                    } else {
                        setCombo(0)
                    }

                    setTimeout(() => setShowJudgment(false), 800)
                }
            }
        }, 100)

        return () => clearInterval(interval)
    }, [isPlaying, isPaused, currentSong.duration])

    const handleStartGame = () => {
        setIsPlaying(true)
        setIsPaused(false)
    }

    const handlePauseGame = () => {
        setIsPaused(!isPaused)
    }

    if (!isPlaying) {
        return (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-background via-muted/50 to-background">
                <div className="text-center space-y-6">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">{currentSong.title}</h1>
                        <p className="text-xl text-muted-foreground">{currentSong.artist}</p>
                    </div>

                    <div className="space-y-4">
                        <Button variant="game" size="xl" onClick={handleStartGame}>
                            Start Game
                        </Button>
                        <div className="flex space-x-4">
                            <Button variant="outline" asChild>
                                <Link href="/select">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to Select
                                </Link>
                            </Button>
                            <Button variant="outline">
                                <Volume2 className="mr-2 h-4 w-4" />
                                Preview
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="relative h-full bg-gradient-to-b from-background to-muted/30 overflow-hidden">
            {/* Top HUD */}
            <div className="absolute top-0 left-0 right-0 z-20 p-4">
                <div className="flex items-center justify-between">
                    {/* Song Info */}
                    <div className="flex items-center space-x-4">
                        <Button variant="ghost" size="icon" onClick={handlePauseGame}>
                            <Pause className="h-4 w-4" />
                        </Button>
                        <div>
                            <h2 className="font-semibold">{currentSong.title}</h2>
                            <p className="text-sm text-muted-foreground">{currentSong.artist}</p>
                        </div>
                    </div>

                    {/* Score Display */}
                    <ScoreDisplay
                        score={score}
                        accuracy={accuracy}
                        combo={combo}
                        variant="compact"
                        className="bg-background/80"
                    />
                </div>
            </div>

            {/* Progress Bar */}
            <div className="absolute top-20 left-4 right-4 z-20">
                <Progress value={progress} variant="game" size="sm" />
            </div>

            {/* Game Area */}
            <div className="flex h-full items-center justify-center">
                <div className="text-center space-y-8">
                    {/* Note lanes will go here */}
                    <div className="grid grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((lane) => (
                            <div
                                key={lane}
                                className="h-96 w-20 rounded-lg border-2 border-muted bg-muted/20 backdrop-blur-sm"
                            >
                                <div className="h-full flex flex-col justify-end p-2">
                                    <div className="h-16 w-full rounded bg-primary/20 border border-primary/50" />
                                </div>
                            </div>
                        ))}
                    </div>

                    <p className="text-muted-foreground">
                        Game simulation running... Hit keys to play!
                    </p>
                </div>
            </div>

            {/* Judgment Display */}
            <JudgmentDisplay
                judgment={currentJudgment}
                show={showJudgment}
            />

            {/* Pause Overlay */}
            {isPaused && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                    <div className="text-center space-y-6">
                        <h2 className="text-3xl font-bold">Paused</h2>
                        <div className="space-y-4">
                            <Button variant="game" size="lg" onClick={handlePauseGame}>
                                Resume
                            </Button>
                            <div className="flex space-x-4">
                                <Button variant="outline" asChild>
                                    <Link href="/select">Back to Select</Link>
                                </Button>
                                <Button variant="outline">
                                    Restart
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
