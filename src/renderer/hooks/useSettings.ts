"use client"

import { useState, useEffect, useCallback } from 'react'
import { ipcService, type Settings } from '@/lib/ipc-service'

interface UseSettingsReturn {
    settings: Settings | null
    loading: boolean
    error: string | null
    updateSetting: (key: string, value: any) => Promise<void>
    resetSettings: () => Promise<void>
}

export function useSettings(): UseSettingsReturn {
    const [settings, setSettings] = useState<Settings | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const loadSettings = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)
            const currentSettings = await ipcService.getSettings()
            setSettings(currentSettings)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load settings')
            console.error('Failed to load settings:', err)
        } finally {
            setLoading(false)
        }
    }, [])

    const updateSetting = useCallback(async (key: string, value: any) => {
        try {
            await ipcService.setSetting(key, value)
            // Update local state
            setSettings(prev => {
                if (!prev) return prev
                const keys = key.split('.')
                const newSettings = { ...prev }
                let current: any = newSettings

                for (let i = 0; i < keys.length - 1; i++) {
                    const keyName = keys[i]
                    if (keyName && current && typeof current === 'object') {
                        current[keyName] = { ...current[keyName] }
                        current = current[keyName]
                    }
                }

                const lastKey = keys[keys.length - 1]
                if (lastKey && current && typeof current === 'object') {
                    current[lastKey] = value
                }

                return newSettings
            })
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update setting')
            throw err
        }
    }, [])

    const resetSettings = useCallback(async () => {
        try {
            await ipcService.resetSettings()
            await loadSettings() // Reload after reset
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to reset settings')
            throw err
        }
    }, [loadSettings])

    // Load settings on mount
    useEffect(() => {
        loadSettings()
    }, [loadSettings])

    // Listen for settings changes
    useEffect(() => {
        const unsubscribe = ipcService.onSettingsChange((newSettings) => {
            setSettings(newSettings)
        })

        return unsubscribe
    }, [])

    return {
        settings,
        loading,
        error,
        updateSetting,
        resetSettings,
    }
}

// Utility hook for specific setting values
export function useSetting<T>(key: string, defaultValue: T): [T, (value: T) => Promise<void>] {
    const { settings, updateSetting } = useSettings()

    const getValue = useCallback(() => {
        if (!settings) return defaultValue

        const keys = key.split('.')
        let current: any = settings

        for (const k of keys) {
            if (current && typeof current === 'object' && k in current) {
                current = current[k]
            } else {
                return defaultValue
            }
        }

        return current ?? defaultValue
    }, [settings, key, defaultValue])

    const setValue = useCallback(async (value: T) => {
        await updateSetting(key, value)
    }, [updateSetting, key])

    return [getValue(), setValue]
}
