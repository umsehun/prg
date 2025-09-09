"use client"

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { ArrowLeft, Volume2, Monitor, Gamepad2, Keyboard, AlertCircle, RotateCcw } from 'lucide-react'
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

    const [keyBindings, setKeyBindings] = useState({
        lane1: 'D',
        lane2: 'F',
        lane3: 'J',
        lane4: 'K',
    })

    const [displaySettings, setDisplaySettings] = useState({
        fullscreen: false,
        vsync: true,
        targetFps: [60],
    })

    const resetSettings = () => {
        setAudioSettings({
            masterVolume: [75],
            musicVolume: [80],
            effectVolume: [70],
            enableAudioFeedback: true,
        })
        setGameSettings({
            scrollSpeed: [50],
            noteSize: [100],
            enableParticles: true,
            showFps: false,
        })
        setKeyBindings({
            lane1: 'D',
            lane2: 'F',
            lane3: 'J',
            lane4: 'K',
        })
        setDisplaySettings({
            fullscreen: false,
            vsync: true,
            targetFps: [60],
        })
    }

    return (
        <div className="min-h-full bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 p-6 pt-20">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-4">
                        <Button variant="ghost" size="icon" className="text-white hover:text-purple-300">
                            <Link href="/">
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-4xl font-bold text-white mb-2 font-gaming">설정</h1>
                            <p className="text-slate-400 text-lg">Pin Rhythm 게임 경험을 커스터마이즈하세요</p>
                        </div>
                    </div>
                    <Button 
                        onClick={resetSettings} 
                        variant="outline" 
                        className="border-slate-600 text-slate-300 hover:bg-red-900/30 hover:border-red-500 hover:text-red-300"
                    >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        초기화
                    </Button>
                </div>

                <div className="space-y-8">
                    {/* Audio Settings */}
                    <Card className="card-gaming">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2 text-white">
                                <Volume2 className="h-5 w-5 text-purple-400" />
                                <span>오디오 설정</span>
                            </CardTitle>
                            <CardDescription className="text-slate-300">
                                사운드 및 오디오 설정을 조정하세요
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-white">마스터 볼륨</label>
                                    <span className="text-sm text-slate-400">
                                        {audioSettings.masterVolume[0]}%
                                    </span>
                                </div>
                                <Slider
                                    value={audioSettings.masterVolume}
                                    onValueChange={(value) => setAudioSettings({...audioSettings, masterVolume: value})}
                                    max={100}
                                    step={1}
                                    className="slider-gaming"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-white">음악 볼륨</label>
                                    <span className="text-sm text-slate-400">
                                        {audioSettings.musicVolume[0]}%
                                    </span>
                                </div>
                                <Slider
                                    value={audioSettings.musicVolume}
                                    onValueChange={(value) => setAudioSettings({...audioSettings, musicVolume: value})}
                                    max={100}
                                    step={1}
                                    className="slider-gaming"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-white">효과음 볼륨</label>
                                    <span className="text-sm text-slate-400">
                                        {audioSettings.effectVolume[0]}%
                                    </span>
                                </div>
                                <Slider
                                    value={audioSettings.effectVolume}
                                    onValueChange={(value) => setAudioSettings({...audioSettings, effectVolume: value})}
                                    max={100}
                                    step={1}
                                    className="slider-gaming"
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <label className="text-sm font-medium text-white">오디오 피드백</label>
                                    <p className="text-xs text-slate-400">
                                        히트 시 사운드 이펙트 재생
                                    </p>
                                </div>
                                <Switch
                                    checked={audioSettings.enableAudioFeedback}
                                    onCheckedChange={(checked) => setAudioSettings({...audioSettings, enableAudioFeedback: checked})}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Key Bindings */}
                    <Card className="card-gaming">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2 text-white">
                                <Keyboard className="h-5 w-5 text-blue-400" />
                                <span>키 설정</span>
                            </CardTitle>
                            <CardDescription className="text-slate-300">
                                컨트롤 키를 커스터마이즈하세요
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {Object.entries(keyBindings).map(([lane, key]) => (
                                    <div key={lane} className="space-y-2">
                                        <label className="text-sm font-medium capitalize text-white">
                                            {lane === 'lane1' ? '1번 레인' :
                                             lane === 'lane2' ? '2번 레인' :
                                             lane === 'lane3' ? '3번 레인' : '4번 레인'}
                                        </label>
                                        <div className="flex items-center justify-center h-12 w-full rounded-lg border-2 border-purple-500/50 bg-purple-900/20 font-mono text-lg font-bold text-white shadow-glow-purple">
                                            {key}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setKeyBindings({
                                        lane1: 'D',
                                        lane2: 'F',
                                        lane3: 'J',
                                        lane4: 'K'
                                    })
                                }}
                                className="border-slate-600 text-slate-300 hover:bg-slate-700"
                            >
                                기본값으로 재설정 (DFJK)
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Game Settings */}
                    <Card className="card-gaming">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2 text-white">
                                <Gamepad2 className="h-5 w-5 text-green-400" />
                                <span>게임플레이</span>
                            </CardTitle>
                            <CardDescription className="text-slate-300">
                                게임플레이 경험을 커스터마이즈하세요
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-white">스크롤 속도</label>
                                    <span className="text-sm text-slate-400">
                                        {gameSettings.scrollSpeed[0]}%
                                    </span>
                                </div>
                                <Slider
                                    value={gameSettings.scrollSpeed}
                                    onValueChange={(value) => setGameSettings({...gameSettings, scrollSpeed: value})}
                                    min={10}
                                    max={200}
                                    step={5}
                                    className="slider-gaming"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-white">노트 크기</label>
                                    <span className="text-sm text-slate-400">
                                        {gameSettings.noteSize[0]}%
                                    </span>
                                </div>
                                <Slider
                                    value={gameSettings.noteSize}
                                    onValueChange={(value) => setGameSettings({...gameSettings, noteSize: value})}
                                    min={50}
                                    max={150}
                                    step={5}
                                    className="slider-gaming"
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <label className="text-sm font-medium text-white">파티클 효과</label>
                                    <p className="text-xs text-slate-400">
                                        히트 시 파티클 이펙트 표시
                                    </p>
                                </div>
                                <Switch
                                    checked={gameSettings.enableParticles}
                                    onCheckedChange={(checked) => setGameSettings({...gameSettings, enableParticles: checked})}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <label className="text-sm font-medium text-white">FPS 표시</label>
                                    <p className="text-xs text-slate-400">
                                        프레임율 카운터 표시
                                    </p>
                                </div>
                                <Switch
                                    checked={gameSettings.showFps}
                                    onCheckedChange={(checked) => setGameSettings({...gameSettings, showFps: checked})}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Display Settings */}
                    <Card className="card-gaming">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2 text-white">
                                <Monitor className="h-5 w-5 text-cyan-400" />
                                <span>디스플레이</span>
                            </CardTitle>
                            <CardDescription className="text-slate-300">
                                화면 및 성능 설정을 구성하세요
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <label className="text-sm font-medium text-white">전체화면</label>
                                    <p className="text-xs text-slate-400">
                                        전체화면 모드로 게임 실행
                                    </p>
                                </div>
                                <Switch
                                    checked={displaySettings.fullscreen}
                                    onCheckedChange={(checked) => setDisplaySettings({...displaySettings, fullscreen: checked})}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <label className="text-sm font-medium text-white">수직 동기화</label>
                                    <p className="text-xs text-slate-400">
                                        화면 깜빡임 방지
                                    </p>
                                </div>
                                <Switch
                                    checked={displaySettings.vsync}
                                    onCheckedChange={(checked) => setDisplaySettings({...displaySettings, vsync: checked})}
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-white">목표 FPS</label>
                                    <span className="text-sm text-slate-400">
                                        {displaySettings.targetFps[0]}
                                    </span>
                                </div>
                                <Slider
                                    value={displaySettings.targetFps}
                                    onValueChange={(value) => setDisplaySettings({...displaySettings, targetFps: value})}
                                    min={30}
                                    max={240}
                                    step={30}
                                    className="slider-gaming"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
