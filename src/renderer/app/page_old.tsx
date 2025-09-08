"use client"

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Play, Settings, Music, Trophy } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
    return (
        <div className="flex-1 overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10" />

            {/* Content */}
            <div className="relative z-10 flex h-full flex-col items-center justify-center p-8">
                {/* Logo & Title */}
                <div className="mb-12 text-center">
                    <h1 className="mb-4 text-6xl font-bold tracking-tight">
                        <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                            PRG
                        </span>
                    </h1>
                    <p className="text-xl text-muted-foreground">
                        Precision Rhythm Game
                    </p>
                </div>

                {/* Main Menu Cards */}
                <div className="grid w-full max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Play Card */}
                    <Link href="/select">
                        <Card className="group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-game">
                            <CardHeader className="text-center">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20">
                                    <Play className="h-8 w-8 text-primary" />
                                </div>
                                <CardTitle className="text-2xl">Play</CardTitle>
                                <CardDescription>
                                    Start playing rhythm games
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </Link>

                    {/* Songs Card */}
                    <Link href="/select">
                        <Card className="group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-game">
                            <CardHeader className="text-center">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary/10 group-hover:bg-secondary/20">
                                    <Music className="h-8 w-8 text-secondary" />
                                </div>
                                <CardTitle className="text-2xl">Songs</CardTitle>
                                <CardDescription>
                                    Browse your music library
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </Link>

                    {/* Settings Card */}
                    <Link href="/settings">
                        <Card className="group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-medium">
                            <CardHeader className="text-center">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted group-hover:bg-muted/80">
                                    <Settings className="h-8 w-8 text-foreground" />
                                </div>
                                <CardTitle className="text-2xl">Settings</CardTitle>
                                <CardDescription>
                                    Configure your game
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </Link>

                    {/* Profile Card */}
                    <Card className="group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-medium">
                        <CardHeader className="text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted group-hover:bg-muted/80">
                                <Trophy className="h-8 w-8 text-foreground" />
                            </div>
                            <CardTitle className="text-2xl">Profile</CardTitle>
                            <CardDescription>
                                View your statistics
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </div>

                {/* Quick Actions */}
                <div className="mt-12 flex space-x-4">
                    <Button variant="game" size="lg" asChild>
                        <Link href="/select">
                            Quick Play
                        </Link>
                    </Button>
                    <Button variant="outline" size="lg" asChild>
                        <Link href="/settings">
                            Settings
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}
