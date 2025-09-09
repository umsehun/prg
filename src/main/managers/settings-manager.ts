/**
 * Simplified Settings Manager - Basic settings for UI development
 */

import { promises as fs } from 'fs';
import { join } from 'path';
import { logger } from '../../shared/globals/logger';

interface SimpleSettings {
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

export class SettingsManager {
    private settings: SimpleSettings
    private settingsPath: string
    private saveTimeout: NodeJS.Timeout | null = null

    constructor(settingsPath?: string) {
        this.settingsPath = settingsPath || join(process.cwd(), 'settings.json')
        this.settings = this.getDefaultSettings()
    }

    public async initialize(): Promise<void> {
        try {
            await this.load()
            logger.info('settings', 'Simple settings manager initialized')
        } catch (error) {
            logger.error('settings', 'Failed to initialize settings', error)
            this.settings = this.getDefaultSettings()
            await this.save()
        }
    }

    private async load(): Promise<void> {
        try {
            const data = await fs.readFile(this.settingsPath, 'utf-8')
            const parsed = JSON.parse(data)
            this.settings = { ...this.getDefaultSettings(), ...parsed }
        } catch (error) {
            if ((error as any).code === 'ENOENT') {
                logger.info('settings', 'No settings file found, using defaults')
            } else {
                logger.warn('settings', 'Failed to load settings', error)
            }
            this.settings = this.getDefaultSettings()
        }
    }

    public async save(): Promise<void> {
        if (this.saveTimeout) {
            clearTimeout(this.saveTimeout)
        }

        this.saveTimeout = setTimeout(async () => {
            try {
                const data = JSON.stringify(this.settings, null, 2)
                await fs.writeFile(this.settingsPath, data, 'utf-8')
                logger.debug('settings', 'Settings saved')
            } catch (error) {
                logger.error('settings', 'Failed to save settings', error)
            }
        }, 500)
    }

    public getSettings(): SimpleSettings {
        return { ...this.settings }
    }

    public async updateSetting(key: string, value: any): Promise<void> {
        const keys = key.split('.')
        let current: any = this.settings

        for (let i = 0; i < keys.length - 1; i++) {
            const keyName = keys[i]
            if (keyName && !current[keyName]) {
                current[keyName] = {}
            }
            if (keyName) {
                current = current[keyName]
            }
        }

        const lastKey = keys[keys.length - 1]
        if (lastKey) {
            current[lastKey] = value
        }

        await this.save()

        logger.debug('settings', `Updated ${key} = ${value}`)
    }

    public async resetToDefaults(): Promise<void> {
        this.settings = this.getDefaultSettings()
        await this.save()
        logger.info('settings', 'Settings reset to defaults')
    }

    private getDefaultSettings(): SimpleSettings {
        return {
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

    public cleanup(): void {
        if (this.saveTimeout) {
            clearTimeout(this.saveTimeout)
            this.saveTimeout = null
        }
    }
}
