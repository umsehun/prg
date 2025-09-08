"use client"

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { KeyBinding } from '@/components/ui/key-binding'
import { ThemeSelector } from '@/components/ui/theme-selector'
import { ArrowLeft, Volume2, Monitor, Gamepad2, Palette, Keyboard } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export default function SettingsPage() {
    const [audioSettings, setAudioSettings] = useState({
        masterVolume: [75],
        musicVolume: [80],
        effectVolume: [70],
        enableAudioFeedback: true,
    })

    const [gameSettings, setGameSettings] = useState({
        scrollSpeed: [50],
        noteSize: [100],
        enableParticles: true,
        showFps: false,
    })

    const [displaySettings, setDisplaySettings] = useState({
        fullscreen: false,
        vsync: true,
        targetFps: [60],
    })

    const [keyBindings, setKeyBindings] = useState({
        lane1: 'd',
        lane2: 'f',
        lane3: 'j',
        lane4: 'k',
        pause: 'escape',
        restart: 'r',
    })

    const handleKeyBindingChange = (key: string, newValue: string) => {
        setKeyBindings(prev => ({ ...prev, [key]: newValue }))
    }

    return (
        <div className="flex h-full flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b bg-background/95 p-4 backdrop-blur-sm">
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Settings</h1>
                        <p className="text-sm text-muted-foreground">
                            Configure your game preferences
                        </p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                <div className="mx-auto max-w-4xl space-y-8">
                    {/* Audio Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Volume2 className="h-5 w-5" />
                                <span>Audio</span>
                            </CardTitle>
                            <CardDescription>
                                Configure audio and sound settings
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium">Master Volume</label>
                                    <span className="text-sm text-muted-foreground">
                                        {audioSettings.masterVolume[0]}%
                                    </span>
                                </div>
                                <Slider
                                    value={audioSettings.masterVolume}
                                    onValueChange={(value) =>
                                        setAudioSettings(prev => ({ ...prev, masterVolume: value }))
                                    }
                                    max={100}
                                    step={1}
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium">Music Volume</label>
                                    <span className="text-sm text-muted-foreground">
                                        {audioSettings.musicVolume[0]}%
                                    </span>
                                </div>
                                <Slider
                                    value={audioSettings.musicVolume}
                                    onValueChange={(value) =>
                                        setAudioSettings(prev => ({ ...prev, musicVolume: value }))
                                    }
                                    max={100}
                                    step={1}
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium">Effect Volume</label>
                                    <span className="text-sm text-muted-foreground">
                                        {audioSettings.effectVolume[0]}%
                                    </span>
                                </div>
                                <Slider
                                    value={audioSettings.effectVolume}
                                    onValueChange={(value) =>
                                        setAudioSettings(prev => ({ ...prev, effectVolume: value }))
                                    }
                                    max={100}
                                    step={1}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <label className="text-sm font-medium">Audio Feedback</label>
                                    <p className="text-xs text-muted-foreground">
                                        Play sound effects for hits
                                    </p>
                                </div>
                                <Switch
                                    checked={audioSettings.enableAudioFeedback}
                                    onCheckedChange={(checked) =>
                                        setAudioSettings(prev => ({ ...prev, enableAudioFeedback: checked }))
                                    }
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Key Bindings */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Keyboard className="h-5 w-5" />
                                <span>Key Bindings</span>
                            </CardTitle>
                            <CardDescription>
                                Customize your control keys
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <KeyBinding
                                    label="Lane 1"
                                    currentKey={keyBindings.lane1}
                                    onKeyChange={(key) => handleKeyBindingChange('lane1', key)}
                                />
                                <KeyBinding
                                    label="Lane 2"
                                    currentKey={keyBindings.lane2}
                                    onKeyChange={(key) => handleKeyBindingChange('lane2', key)}
                                />
                                <KeyBinding
                                    label="Lane 3"
                                    currentKey={keyBindings.lane3}
                                    onKeyChange={(key) => handleKeyBindingChange('lane3', key)}
                                />
                                <KeyBinding
                                    label="Lane 4"
                                    currentKey={keyBindings.lane4}
                                    onKeyChange={(key) => handleKeyBindingChange('lane4', key)}
                                />
                                <KeyBinding
                                    label="Pause"
                                    currentKey={keyBindings.pause}
                                    onKeyChange={(key) => handleKeyBindingChange('pause', key)}
                                />
                                <KeyBinding
                                    label="Restart"
                                    currentKey={keyBindings.restart}
                                    onKeyChange={(key) => handleKeyBindingChange('restart', key)}
                                />
                            </div>
                            <div className="flex justify-end">
                                <Button variant="outline" size="sm">
                                    Reset to Default
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Game Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Gamepad2 className="h-5 w-5" />
                                <span>Gameplay</span>
                            </CardTitle>
                            <CardDescription>
                                Customize your gameplay experience
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium">Scroll Speed</label>
                                    <span className="text-sm text-muted-foreground">
                                        {gameSettings.scrollSpeed[0]}%
                                    </span>
                                </div>
                                <Slider
                                    value={gameSettings.scrollSpeed}
                                    onValueChange={(value) =>
                                        setGameSettings(prev => ({ ...prev, scrollSpeed: value }))
                                    }
                                    min={10}
                                    max={200}
                                    step={5}
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium">Note Size</label>
                                    <span className="text-sm text-muted-foreground">
                                        {gameSettings.noteSize[0]}%
                                    </span>
                                </div>
                                <Slider
                                    value={gameSettings.noteSize}
                                    onValueChange={(value) =>
                                        setGameSettings(prev => ({ ...prev, noteSize: value }))
                                    }
                                    min={50}
                                    max={150}
                                    step={5}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <label className="text-sm font-medium">Particle Effects</label>
                                    <p className="text-xs text-muted-foreground">
                                        Show particle effects for hits
                                    </p>
                                </div>
                                <Switch
                                    checked={gameSettings.enableParticles}
                                    onCheckedChange={(checked) =>
                                        setGameSettings(prev => ({ ...prev, enableParticles: checked }))
                                    }
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <label className="text-sm font-medium">Show FPS</label>
                                    <p className="text-xs text-muted-foreground">
                                        Display frame rate counter
                                    </p>
                                </div>
                                <Switch
                                    checked={gameSettings.showFps}
                                    onCheckedChange={(checked) =>
                                        setGameSettings(prev => ({ ...prev, showFps: checked }))
                                    }
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Theme Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Palette className="h-5 w-5" />
                                <span>Appearance</span>
                            </CardTitle>
                            <CardDescription>
                                Customize the look and feel
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ThemeSelector />
                        </CardContent>
                    </Card>

                    {/* Display Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Monitor className="h-5 w-5" />
                                <span>Display</span>
                            </CardTitle>
                            <CardDescription>
                                Configure display and performance settings
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <label className="text-sm font-medium">Fullscreen</label>
                                    <p className="text-xs text-muted-foreground">
                                        Run game in fullscreen mode
                                    </p>
                                </div>
                                <Switch
                                    checked={displaySettings.fullscreen}
                                    onCheckedChange={(checked) =>
                                        setDisplaySettings(prev => ({ ...prev, fullscreen: checked }))
                                    }
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <label className="text-sm font-medium">V-Sync</label>
                                    <p className="text-xs text-muted-foreground">
                                        Synchronize frame rate with display
                                    </p>
                                </div>
                                <Switch
                                    checked={displaySettings.vsync}
                                    onCheckedChange={(checked) =>
                                        setDisplaySettings(prev => ({ ...prev, vsync: checked }))
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium">Target FPS</label>
                                    <span className="text-sm text-muted-foreground">
                                        {displaySettings.targetFps[0]}
                                    </span>
                                </div>
                                <Slider
                                    value={displaySettings.targetFps}
                                    onValueChange={(value) =>
                                        setDisplaySettings(prev => ({ ...prev, targetFps: value }))
                                    }
                                    min={30}
                                    max={240}
                                    step={30}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex justify-end space-x-4">
                        <Button variant="outline">
                            Reset All Settings
                        </Button>
                        <Button variant="default">
                            Save Settings
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
