"use client"

import { Button } from '@/components/ui/button'
import { ScoreDisplay } from '@/components/ui/score-display'
import { Progress } from '@/components/ui/progress'
import { JudgmentDisplay } from '@/components/ui/judgment-display'
import { ArrowLeft, Volume2, Pause } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function GamePage() {
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
      <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="text-center space-y-6">
          <div>
            <h1 className="text-4xl font-bold mb-2 text-slate-900 dark:text-slate-100">{currentSong.title}</h1>
            <p className="text-xl text-slate-600 dark:text-slate-400">{currentSong.artist}</p>
          </div>

          <div className="space-y-4">
            <Button 
              size="lg" 
              onClick={handleStartGame}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
            >
              Start Game
            </Button>
            <div className="flex space-x-4 justify-center">
              <Button variant="outline" asChild>
                <Link href="/select" className="flex items-center">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Select
                </Link>
              </Button>
              <Button variant="outline" className="flex items-center">
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
    <div className="relative h-full bg-gradient-to-b from-slate-900 to-slate-800 overflow-hidden">
      {/* Top HUD */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4">
        <div className="flex items-center justify-between">
          {/* Song Info */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={handlePauseGame}>
              <Pause className="h-4 w-4 text-white" />
            </Button>
            <div>
              <h2 className="font-semibold text-white">{currentSong.title}</h2>
              <p className="text-sm text-gray-300">{currentSong.artist}</p>
            </div>
          </div>

          {/* Score Display */}
          <ScoreDisplay
            score={score}
            accuracy={accuracy}
            combo={combo}
            variant="compact"
            className="bg-black/50 text-white"
          />
        </div>
      </div>

      {/* Progress Bar */}
      <div className="absolute top-20 left-4 right-4 z-20">
        <Progress value={progress} className="bg-white/20" />
      </div>

      {/* Game Area */}
      <div className="flex h-full items-center justify-center">
        <div className="text-center space-y-8">
          {/* Note lanes */}
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((lane) => (
              <div
                key={lane}
                className="h-96 w-20 rounded-lg border-2 border-white/30 bg-white/10 backdrop-blur-sm"
              >
                <div className="h-full flex flex-col justify-end p-2">
                  <div className="h-16 w-full rounded bg-blue-500/30 border border-blue-400/50" />
                </div>
              </div>
            ))}
          </div>

          <p className="text-gray-300">
            Game simulation running... Hit DFJK keys to play!
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
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="text-center space-y-6">
            <h2 className="text-3xl font-bold text-white">Paused</h2>
            <div className="space-y-4">
              <Button 
                size="lg" 
                onClick={handlePauseGame}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Resume
              </Button>
              <div className="flex space-x-4 justify-center">
                <Button variant="outline" asChild>
                  <Link href="/select" className="text-white border-white hover:bg-white hover:text-black">
                    Back to Select
                  </Link>
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setIsPlaying(false)
                    setProgress(0)
                    setScore(0)
                    setCombo(0)
                  }}
                  className="text-white border-white hover:bg-white hover:text-black"
                >
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
