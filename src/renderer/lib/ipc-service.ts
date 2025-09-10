/**
 * IPC Service - Frontend service for communicating with Electron main process
 * Provides type-safe APIs for renderer to interact with backend
 */

interface ChartData {
    id: string
    title: string
    artist: string
    difficulty: string
    audioPath: string
    backgroundPath?: string
    duration: number
    bpm: number
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

class IPCService {
    private static instance: IPCService

    public static getInstance(): IPCService {
        if (!IPCService.instance) {
            IPCService.instance = new IPCService()
        }
        return IPCService.instance
    }

    private get api() {
        if (!(window as any).electronAPI) {
            throw new Error('Electron API not available. Make sure this is running in Electron.')
        }
        return (window as any).electronAPI
    }

    // Game methods - Updated for new runtime .osu loading API
    async getDifficulties(chartId: string): Promise<{
        success: boolean;
        difficulties?: Array<{
            name: string;
            filename: string;
            starRating: number;
            difficultyName: string;
        }>;
        error?: string;
    }> {
        return await this.api.game.getDifficulties(chartId);
    }

    async startGame(params: { chartId: string; difficulty?: string; gameMode: string; mods?: string[] }): Promise<GameSession> {
        const result = await this.api.game.start(params); // ✅ Updated: Use new API params
        if (!result.success) {
            throw new Error(result.error || 'Failed to start game');
        }
        // Mock GameSession for now - this should come from the backend
        return {
            sessionId: 'mock-session-' + Date.now(),
            chartId: params.chartId,
            startTime: Date.now(),
            score: 0,
            accuracy: 1.0,
            combo: 0
        };
    }

    async stopGame(): Promise<void> {
        const result = await this.api.game.stop()
        if (!result.success) {
            throw new Error(result.error || 'Failed to stop game')
        }
    }

    async pauseGame(): Promise<void> {
        const result = await this.api.game.pause()
        if (!result.success) {
            throw new Error(result.error || 'Failed to pause game')
        }
    }

    async resumeGame(): Promise<void> {
        const result = await this.api.game.resume()
        if (!result.success) {
            throw new Error(result.error || 'Failed to resume game')
        }
    }

    throwKnife(data: { id: string; time: number; lane: number }): void {
        this.api.game.throwKnife({ id: data.id, time: data.time })
    }

    onKnifeResult(callback: (result: any) => void): () => void {
        return this.api.game.onKnifeResult(callback)
    }

    // Chart methods (using osz API)
    async getChartLibrary(): Promise<ChartData[]> {
        const result = await this.api.osz.getLibrary()
        if (!result.success) {
            throw new Error(result.error || 'Failed to load chart library')
        }
        return result.charts || []
    }

    async getChart(chartId: string): Promise<ChartData> {
        // For now, get from library and find by ID
        const library = await this.getChartLibrary()
        const chart = library.find(c => c.id === chartId)
        if (!chart) {
            throw new Error(`Chart ${chartId} not found`)
        }
        return chart
    }

    async importChart(filePath?: string): Promise<{ success: boolean; error?: string }> {
        const result = await this.api.osz.import(filePath)
        return {
            success: result.success,
            error: result.error
        }
    }

    async removeChart(chartId: string): Promise<void> {
        const result = await this.api.osz.removeChart(chartId)
        if (!result.success) {
            throw new Error(result.error || 'Failed to remove chart')
        }
    }

    async getChartAudio(chartId: string): Promise<string> {
        const result = await this.api.osz.getAudio(chartId)
        if (!result.success) {
            throw new Error(result.error || 'Failed to get audio')
        }
        // Convert ArrayBuffer to URL if needed
        return 'mock-audio-url'
    }

    async getChartBackground(chartId: string): Promise<string> {
        // Mock implementation for now
        return 'mock-background-url'
    }

    // Settings methods
    async getSettings(): Promise<Settings> {
        const result = await this.api.settings.getAll()
        if (!result.success) {
            throw new Error(result.error || 'Failed to load settings')
        }

        // Return default settings if none exist
        return result.settings || {
            audio: {
                masterVolume: 1.0,
                musicVolume: 0.8,
                effectVolume: 0.6,
                enableFeedback: true
            },
            game: {
                scrollSpeed: 1.0,
                noteSize: 1.0,
                enableParticles: true,
                showFps: false
            },
            display: {
                fullscreen: false,
                vsync: true,
                targetFps: 60
            },
            controls: {
                keyBindings: {
                    lane1: 'D',
                    lane2: 'F',
                    lane3: 'J',
                    lane4: 'K'
                }
            }
        }
    }

    async setSetting(key: string, value: any): Promise<void> {
        const result = await this.api.settings.set(key, value)
        if (!result.success) {
            throw new Error(result.error || 'Failed to update setting')
        }
    }

    async resetSettings(): Promise<void> {
        const result = await this.api.settings.reset()
        if (!result.success) {
            throw new Error(result.error || 'Failed to reset settings')
        }
    }

    onSettingsChange(callback: (settings: Settings) => void): () => void {
        return this.api.settings.onChange((change: any) => {
            // For now, just trigger a reload - in production this would be more sophisticated
            this.getSettings().then(callback).catch(console.error)
        })
    }

    // System methods
    async getVersion(): Promise<string> {
        return this.api.system.version || '0.1.0'
    }

    async openExternal(url: string): Promise<void> {
        // Mock implementation - would need to add to backend
        window.open(url, '_blank')
    }

    async showMessageBox(options: any): Promise<any> {
        // Mock implementation - would use alert for now
        return { response: 0 }
    }
}

export const ipcService = IPCService.getInstance()
export type { ChartData, GameSession, Settings }
