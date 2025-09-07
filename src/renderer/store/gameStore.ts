// src/renderer/store/gameStore.ts
/**
 * @file Zustand store for managing the global game state.
 */
import { create } from 'zustand';
import { GameScene, Judgment, JudgmentCounts, ChartMetadata, GameUpdateArgs } from '../../shared/types';

// Defines the state structure of the game
export interface GameState {
  score: number;
  combo: number;
  maxCombo: number;
  judgment: Judgment | null;
  judgments: JudgmentCounts;
  currentScene: GameScene;
  isPaused: boolean;
  charts: ChartMetadata[];
  selectedChartId: string | null;
  gameMode: string;
}

// Defines the actions available to modify the state
export interface GameActions {
  updateGame: (data: GameUpdateArgs) => void;
  setCurrentScene: (scene: GameScene) => void;
  togglePause: () => void;
  setSelectedChart: (chartId: string) => void;
  setGameMode: (mode: string) => void;
  loadCharts: () => Promise<void>;
  reset: () => void;
}

// Combines state and actions into a single type for the store
export type GameStore = GameState & GameActions;

const initialState: GameState = {
  score: 0,
  combo: 0,
  maxCombo: 0,
  judgment: null,
  judgments: { KOOL: 0, COOL: 0, GOOD: 0, MISS: 0 },
  currentScene: 'Start' as GameScene,
  isPaused: false,
  charts: [],
  selectedChartId: null,
  gameMode: 'pin',
};

const useGameStore = create<GameStore>()((set, get) => ({
  ...initialState,

  updateGame: (data: GameUpdateArgs) => {
    const { combo, judgment } = data;
    const state = get();

    const newJudgments = { ...state.judgments };
    if (judgment && judgment in newJudgments) {
      newJudgments[judgment]++;
    }

    set((state) => ({
      ...data,
      maxCombo: Math.max(state.maxCombo, combo ?? state.combo),
      judgments: newJudgments,
    }));
  },

  setCurrentScene: (scene: GameScene) => set({ currentScene: scene }),

  togglePause: () => set((state) => ({ isPaused: !state.isPaused })),

  setSelectedChart: (chartId: string) => set({ selectedChartId: chartId }),

  setGameMode: (mode: string) => set({ gameMode: mode }),

  loadCharts: async () => {
    if (get().charts.length > 0) return;
    const charts = await window.electron.discoverCharts();
    set({
      charts,
      selectedChartId: charts[0]?.id ?? null,
    });
  },

  reset: () => set(initialState),
}));

export default useGameStore;
