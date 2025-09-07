// Use dynamic import because electron-store v9+ is ESM-only and the Electron main build is CommonJS.

export interface Settings {
  noteSpeed: number;
}

// Minimal interface to avoid importing ESM types at compile-time
interface StoreLike<T> {
  get: (key: keyof T) => T[keyof T];
  set: (key: keyof T, value: T[keyof T]) => void;
}

class SettingsManager {
  private static instance: SettingsManager;
  private storePromise: Promise<StoreLike<Settings>>;

  private constructor() {
    this.storePromise = (async () => {
      // Use eval('import(...)') to keep native dynamic import in CommonJS without TS downleveling to require()
      const mod = await (0, eval)('import("electron-store")');
      const Store = (mod as any).default as new <U>(options: { defaults: U }) => StoreLike<U>;
      const store = new Store<Settings>({
        defaults: {
          noteSpeed: 500,
        },
      });
      return store;
    })();
  }

  public static getInstance(): SettingsManager {
    if (!SettingsManager.instance) {
      SettingsManager.instance = new SettingsManager();
    }
    return SettingsManager.instance;
  }

  public async get<T extends keyof Settings>(key: T): Promise<Settings[T]> {
    const store = await this.storePromise;
    return store.get(key) as Settings[T];
  }

  public async set<T extends keyof Settings>(key: T, value: Settings[T]): Promise<void> {
    const store = await this.storePromise;
    store.set(key, value);
  }
}

export default SettingsManager.getInstance();
