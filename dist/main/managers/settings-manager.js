"use strict";
/**
 * Simplified Settings Manager - Basic settings for UI development
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsManager = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const logger_1 = require("../../shared/globals/logger");
class SettingsManager {
    constructor(settingsPath) {
        Object.defineProperty(this, "settings", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "settingsPath", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "saveTimeout", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        this.settingsPath = settingsPath || (0, path_1.join)(process.cwd(), 'settings.json');
        this.settings = this.getDefaultSettings();
    }
    async initialize() {
        try {
            await this.load();
            logger_1.logger.info('settings', 'Simple settings manager initialized');
        }
        catch (error) {
            logger_1.logger.error('settings', 'Failed to initialize settings', error);
            this.settings = this.getDefaultSettings();
            await this.save();
        }
    }
    async load() {
        try {
            const data = await fs_1.promises.readFile(this.settingsPath, 'utf-8');
            const parsed = JSON.parse(data);
            this.settings = { ...this.getDefaultSettings(), ...parsed };
        }
        catch (error) {
            if (error.code === 'ENOENT') {
                logger_1.logger.info('settings', 'No settings file found, using defaults');
            }
            else {
                logger_1.logger.warn('settings', 'Failed to load settings', error);
            }
            this.settings = this.getDefaultSettings();
        }
    }
    async save() {
        if (this.saveTimeout) {
            clearTimeout(this.saveTimeout);
        }
        this.saveTimeout = setTimeout(async () => {
            try {
                const data = JSON.stringify(this.settings, null, 2);
                await fs_1.promises.writeFile(this.settingsPath, data, 'utf-8');
                logger_1.logger.debug('settings', 'Settings saved');
            }
            catch (error) {
                logger_1.logger.error('settings', 'Failed to save settings', error);
            }
        }, 500);
    }
    getSettings() {
        return { ...this.settings };
    }
    async updateSetting(key, value) {
        const keys = key.split('.');
        let current = this.settings;
        for (let i = 0; i < keys.length - 1; i++) {
            const keyName = keys[i];
            if (keyName && !current[keyName]) {
                current[keyName] = {};
            }
            if (keyName) {
                current = current[keyName];
            }
        }
        const lastKey = keys[keys.length - 1];
        if (lastKey) {
            current[lastKey] = value;
        }
        await this.save();
        logger_1.logger.debug('settings', `Updated ${key} = ${value}`);
    }
    async resetToDefaults() {
        this.settings = this.getDefaultSettings();
        await this.save();
        logger_1.logger.info('settings', 'Settings reset to defaults');
    }
    getDefaultSettings() {
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
        };
    }
    cleanup() {
        if (this.saveTimeout) {
            clearTimeout(this.saveTimeout);
            this.saveTimeout = null;
        }
    }
}
exports.SettingsManager = SettingsManager;
