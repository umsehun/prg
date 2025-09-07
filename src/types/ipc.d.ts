// src/types/ipc.d.ts
import { Chart, GameUpdateArgs, Note, Settings } from '../shared/types';

export interface IpcApi {
  // Game control
  startGame: (chart: Chart, gameMode: string) => void;
  stopGame: () => void;
  handleKeyPress: (column: number) => void;
  handlePinPress: (currentTimeSec?: number) => void;
  loadChart: (chartPath: string) => Promise<Chart | null>;

  // Event listeners
  onGameUpdate: (callback: (args: GameUpdateArgs) => void) => () => void;
  onNoteUpdate: (callback: (notes: Note[]) => void) => () => void;
  onPlayMusic: (callback: (args: { musicPath: string }) => void) => () => void;
  onStopMusic: (callback: () => void) => () => void;

  // Settings
  getSetting: <K extends keyof Settings>(key: K) => Promise<Settings[K]>;
  setSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;

  // Assets
  loadAsset: (assetPath: string) => Promise<ArrayBuffer>;
  assetExists: (assetPath: string) => Promise<boolean>;
}

declare global {
  interface Window {
    electron: IpcApi;
  }
}

