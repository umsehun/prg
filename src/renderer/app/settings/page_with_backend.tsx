"use client"

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { PageTransition } from '@/components/ui/page-transition'
import { LoadingSpinner } from '@/components/ui/loading-animations'
import { useSettings } from '@/hooks/useSettings'
import { ArrowLeft, Volume2, Monitor, Gamepad2, Keyboard, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function SettingsPage() {
    const { settings, loading, error, updateSetting, resetSettings } = useSettings()

    if (loading) {
        return (
            <PageTransition className="flex h-full items-center justify-center">
                <div className="text-center space-y-4">
                    <LoadingSpinner size="lg" className="mx-auto text-blue-600" />
                    <p className="text-slate-600 dark:text-slate-400">Loading settings...</p>
                </div>
            </PageTransition>
        )
    }

    if (error || !settings) {
        return (
            <PageTransition className="flex h-full items-center justify-center">
                <div className="text-center space-y-4 max-w-md">
                    <AlertCircle className="h-12 w-12 mx-auto text-red-500" />
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                        Failed to Load Settings
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400">
                        {error || 'Settings could not be loaded'}
                    </p>
                    <Button variant="outline" asChild>
                        <Link href="/">Back to Menu</Link>
                    </Button>
                </div>
            </PageTransition>
        )
    }

    return (
        <PageTransition className="flex h-full flex-col">
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
                                        {Math.round(settings.audio.masterVolume * 100)}%
                                    </span>
                                </div>
                                <Slider
                                    value={[settings.audio.masterVolume * 100]}
                                    onValueChange={([value]) => value !== undefined && updateSetting('audio.masterVolume', value / 100)}
                                    max={100}
                                    step={1}
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium">Music Volume</label>
                                    <span className="text-sm text-muted-foreground">
                                        {Math.round(settings.audio.musicVolume * 100)}%
                                    </span>
                                </div>
                                <Slider
                                    value={[settings.audio.musicVolume * 100]}
                                    onValueChange={([value]) => value !== undefined && updateSetting('audio.musicVolume', value / 100)}
                                    max={100}
                                    step={1}
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium">Effect Volume</label>
                                    <span className="text-sm text-muted-foreground">
                                        {Math.round(settings.audio.effectVolume * 100)}%
                                    </span>
                                </div>
                                <Slider
                                    value={[settings.audio.effectVolume * 100]}
                                    onValueChange={([value]) => value !== undefined && updateSetting('audio.effectVolume', value / 100)}
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
                                    checked={settings.audio.enableFeedback}
                                    onCheckedChange={(checked) => updateSetting('audio.enableFeedback', checked)}
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
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {Object.entries(settings.controls.keyBindings).map(([lane, key]) => (
                                    <div key={lane} className="space-y-2">
                                        <label className="text-sm font-medium capitalize">
                                            {lane.replace('lane', 'Lane ')}
                                        </label>
                                        <div className="flex items-center justify-center h-12 w-full rounded-lg border-2 border-muted bg-muted/20 font-mono text-lg font-bold">
                                            {key}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    updateSetting('controls.keyBindings', {
                                        lane1: 'D',
                                        lane2: 'F',
                                        lane3: 'J',
                                        lane4: 'K'
                                    })
                                }}
                            >
                                Reset to Default (DFJK)
                            </Button>
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
                                        {Math.round(settings.game.scrollSpeed * 100)}%
                                    </span>
                                </div>
                                <Slider
                                    value={[settings.game.scrollSpeed * 100]}
                                    onValueChange={([value]) => value !== undefined && updateSetting('game.scrollSpeed', value / 100)}
                                    min={10}
                                    max={200}
                                    step={5}
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium">Note Size</label>
                                    <span className="text-sm text-muted-foreground">
                                        {Math.round(settings.game.noteSize * 100)}%
                                    </span>
                                </div>
                                <Slider
                                    value={[settings.game.noteSize * 100]}
                                    onValueChange={([value]) => value !== undefined && updateSetting('game.noteSize', value / 100)}
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
                                    checked={settings.game.enableParticles}
                                    onCheckedChange={(checked) => updateSetting('game.enableParticles', checked)}
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
                                    checked={settings.game.showFps}
                                    onCheckedChange={(checked) => updateSetting('game.showFps', checked)}
                                />
                            </div>
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
                                    checked={settings.display.fullscreen}
                                    onCheckedChange={(checked) => updateSetting('display.fullscreen', checked)}
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
                                    checked={settings.display.vsync}
                                    onCheckedChange={(checked) => updateSetting('display.vsync', checked)}
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium">Target FPS</label>
                                    <span className="text-sm text-muted-foreground">
                                        {settings.display.targetFps}
                                    </span>
                                </div>
                                <Slider
                                    value={[settings.display.targetFps]}
                                    onValueChange={([value]) => updateSetting('display.targetFps', value)}
                                    min={30}
                                    max={240}
                                    step={30}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex justify-end space-x-4">
                        <Button
                            variant="outline"
                            onClick={() => resetSettings().catch(console.error)}
                        >
                            Reset to Defaults
                        </Button>
                        <Button variant="default">
                            Save Settings
                        </Button>
                    </div>
                </div>
            </div>
        </PageTransition>
    )
}
