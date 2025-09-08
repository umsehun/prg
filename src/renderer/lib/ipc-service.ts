/**
 * IPC Service - Frontend service for communicating with Electron main process
 * Provides type-safe APIs for renderer to interact with backend
 */

interface ChartData {
    id: string
    title: string
    artist: string
    difficulty: string
    duration: number
    bpm: number
    notes: any[]
    audio?: string
    background?: string
}

interface GameSession {
    sessionId: string
    chartId: string
    startTime: number
    score: number
    accuracy: number
    combo: number
}

interface Settings {
    audio: {
        masterVolume: number
        musicVolume: number
        effectVolume: number
        enableFeedback: boolean
    }
    game: {
        scrollSpeed: number
        noteSize: number
        enableParticles: boolean
        showFps: boolean
    }
    display: {
        fullscreen: boolean
        vsync: boolean
        targetFps: number
    }
    controls: {
        keyBindings: {
            lane1: string
            lane2: string
            lane3: string
            lane4: string
        }
    }
}

declare global {
    interface Window {
        electronAPI: {
            // Game API
            game: {
                start: (chartId: string) => Promise<GameSession>
                stop: () => Promise<void>
                pause: () => Promise<void>
                resume: () => Promise<void>
                throwKnife: (data: { id: string; time: number; lane: number }) => void
                onKnifeResult: (callback: (result: any) => void) => () => void
            }

            // OSZ/Chart API
            charts: {
                getLibrary: () => Promise<ChartData[]>
                getChart: (chartId: string) => Promise<ChartData>
                import: (filePath?: string) => Promise<{ success: boolean; error?: string }>
                remove: (chartId: string) => Promise<void>
                getAudio: (chartId: string) => Promise<string>
                getBackground: (chartId: string) => Promise<string>
            }

            // Settings API
            settings: {
                getAll: () => Promise<Settings>
                set: (key: string, value: any) => Promise<void>
                reset: () => Promise<void>
                onChange: (callback: (settings: Settings) => void) => () => void
            }

            // System API
            system: {
                getVersion: () => Promise<string>
                openExternal: (url: string) => Promise<void>
                showMessageBox: (options: any) => Promise<any>
            }
        }
    }
}

class IPCService {
    private static instance: IPCService

    public static getInstance(): IPCService {
        if (!IPCService.instance) {
            IPCService.instance = new IPCService()
        }
        return IPCService.instance
    }

    private get api() {
        if (!window.electronAPI) {
            throw new Error('Electron API not available. Make sure this is running in Electron.')
        }
        return window.electronAPI
    }

    // Game methods
    async startGame(chartId: string): Promise<GameSession> {
        return this.api.game.start(chartId)
    }

    async stopGame(): Promise<void> {
        return this.api.game.stop()
    }

    async pauseGame(): Promise<void> {
        return this.api.game.pause()
    }

    async resumeGame(): Promise<void> {
        return this.api.game.resume()
    }

    throwKnife(data: { id: string; time: number; lane: number }): void {
        this.api.game.throwKnife(data)
    }

    onKnifeResult(callback: (result: any) => void): () => void {
        return this.api.game.onKnifeResult(callback)
    }

    // Chart methods
    async getChartLibrary(): Promise<ChartData[]> {
        return this.api.charts.getLibrary()
    }

    async getChart(chartId: string): Promise<ChartData> {
        return this.api.charts.getChart(chartId)
    }

    async importChart(filePath?: string): Promise<{ success: boolean; error?: string }> {
        return this.api.charts.import(filePath)
    }

    async removeChart(chartId: string): Promise<void> {
        return this.api.charts.remove(chartId)
    }

    async getChartAudio(chartId: string): Promise<string> {
        return this.api.charts.getAudio(chartId)
    }

    async getChartBackground(chartId: string): Promise<string> {
        return this.api.charts.getBackground(chartId)
    }

    // Settings methods
    async getSettings(): Promise<Settings> {
        return this.api.settings.getAll()
    }

    async setSetting(key: string, value: any): Promise<void> {
        return this.api.settings.set(key, value)
    }

    async resetSettings(): Promise<void> {
        return this.api.settings.reset()
    }

    onSettingsChange(callback: (settings: Settings) => void): () => void {
        return this.api.settings.onChange(callback)
    }

    // System methods
    async getVersion(): Promise<string> {
        return this.api.system.getVersion()
    }

    async openExternal(url: string): Promise<void> {
        return this.api.system.openExternal(url)
    }

    async showMessageBox(options: any): Promise<any> {
        return this.api.system.showMessageBox(options)
    }
}

export const ipcService = IPCService.getInstance()
export type { ChartData, GameSession, Settings }
