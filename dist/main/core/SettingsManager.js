"use strict";
// Use dynamic import because electron-store v9+ is ESM-only and the Electron main build is CommonJS.
Object.defineProperty(exports, "__esModule", { value: true });
class SettingsManager {
    constructor() {
        Object.defineProperty(this, "storePromise", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.storePromise = (async () => {
            // Use eval('import(...)') to keep native dynamic import in CommonJS without TS downleveling to require()
            const mod = await (0, eval)('import("electron-store")');
            const Store = mod.default;
            const store = new Store({
                defaults: {
                    noteSpeed: 500,
                },
            });
            return store;
        })();
    }
    static getInstance() {
        if (!SettingsManager.instance) {
            SettingsManager.instance = new SettingsManager();
        }
        return SettingsManager.instance;
    }
    async get(key) {
        const store = await this.storePromise;
        return store.get(key);
    }
    async set(key, value) {
        const store = await this.storePromise;
        store.set(key, value);
    }
}
exports.default = SettingsManager.getInstance();
