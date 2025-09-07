// src/renderer/types/ipc.d.ts
import type { PinChart, ChartMetadata, GameUpdateArgs } from '../../shared/types';

declare global {
  interface Window {
    electron: {
      // Generic invoke with typed return
      invoke<T = unknown>(channel: string, ...args: unknown[]): Promise<T>;

      // Game update stream from main -> renderer
      onGameUpdate(cb: (args: GameUpdateArgs) => void): () => void;

      // Input -> main judgment
      handlePinPress(currentTimeSec: number): void;

      // Initialize game with chart
      initializeGame(chart: PinChart): void;

      // Library discovery
      discoverCharts(): Promise<ChartMetadata[]>;

      // Settings access (loose typing to avoid importing main types)
      getSetting(key: string): Promise<number>;
      setSetting(key: string, value: number): void;
    };
  }
}

export {};
