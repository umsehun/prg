"use client"

import { useState, useEffect, useCallback } from 'react'
import { ipcService, type ChartData } from '@/lib/ipc-service'

interface UseChartsReturn {
    charts: ChartData[]
    loading: boolean
    error: string | null
    refreshCharts: () => Promise<void>
    importChart: (filePath?: string) => Promise<{ success: boolean; error?: string }>
    removeChart: (chartId: string) => Promise<void>
}

export function useCharts(): UseChartsReturn {
    const [charts, setCharts] = useState<ChartData[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const refreshCharts = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)
            const chartLibrary = await ipcService.getChartLibrary()
            setCharts(chartLibrary)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load charts')
            console.error('Failed to load charts:', err)
        } finally {
            setLoading(false)
        }
    }, [])

    const importChart = useCallback(async (filePath?: string) => {
        try {
            const result = await ipcService.importChart(filePath)
            if (result.success) {
                await refreshCharts() // Refresh the library after successful import
            }
            return result
        } catch (err) {
            return {
                success: false,
                error: err instanceof Error ? err.message : 'Failed to import chart'
            }
        }
    }, [refreshCharts])

    const removeChart = useCallback(async (chartId: string) => {
        try {
            await ipcService.removeChart(chartId)
            await refreshCharts() // Refresh the library after removal
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to remove chart')
            throw err
        }
    }, [refreshCharts])

    // Load charts on mount
    useEffect(() => {
        refreshCharts()
    }, [refreshCharts])

    return {
        charts,
        loading,
        error,
        refreshCharts,
        importChart,
        removeChart,
    }
}

interface UseChartReturn {
    chart: ChartData | null
    loading: boolean
    error: string | null
    audioUrl: string | null
    backgroundUrl: string | null
}

export function useChart(chartId: string | null): UseChartReturn {
    const [chart, setChart] = useState<ChartData | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [audioUrl, setAudioUrl] = useState<string | null>(null)
    const [backgroundUrl, setBackgroundUrl] = useState<string | null>(null)

    useEffect(() => {
        if (!chartId) {
            setChart(null)
            setAudioUrl(null)
            setBackgroundUrl(null)
            return
        }

        const loadChart = async () => {
            try {
                setLoading(true)
                setError(null)

                const [chartData, audio, background] = await Promise.all([
                    ipcService.getChart(chartId),
                    ipcService.getChartAudio(chartId).catch(() => null),
                    ipcService.getChartBackground(chartId).catch(() => null),
                ])

                setChart(chartData)
                setAudioUrl(audio)
                setBackgroundUrl(background)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load chart')
                console.error('Failed to load chart:', err)
            } finally {
                setLoading(false)
            }
        }

        loadChart()
    }, [chartId])

    return {
        chart,
        loading,
        error,
        audioUrl,
        backgroundUrl,
    }
}
