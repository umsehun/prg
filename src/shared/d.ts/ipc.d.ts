/**
 * IPC Communication Types
 */

export interface SongData {
  id: string;
  title: string;
  artist: string;
  audioFile: string;
  backgroundImage?: string;
  difficulty: {
    easy?: number;
    normal?: number;
    hard?: number;
    expert?: number;
  };
  bpm: number;
  duration: number;
  filePath: string;
  notes: NoteData[];
}

export interface NoteData {
  time: number;
  type: 'tap' | 'hold' | 'slider';
  position?: { x: number; y: number };
  duration?: number;
}

export interface GameSettings {
  volume: {
    master: number;
    music: number;
    effects: number;
  };
  graphics: {
    resolution: string;
    fullscreen: boolean;
    vsync: boolean;
  };
  gameplay: {
    noteSpeed: number;
    backgroundDim: number;
    showFPS: boolean;
  };
}

export interface ScoreData {
  songId: string;
  score: number;
  accuracy: number;
  combo: number;
  rank: 'SS' | 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
  timestamp: number;
}

// Electron IPC API Interface
export interface ElectronAPI {
  // OSZ Management
  osz: {
    importFile: (filePath: string) => Promise<SongData>;
    getLibrary: () => Promise<SongData[]>;
    parseOsz: (filePath: string) => Promise<SongData>;
    getAudioPath: (songId: string) => Promise<string>;
  };
  
  // Game Management  
  game: {
    start: (songId: string, mode: 'osu' | 'pin') => Promise<boolean>;
    stop: () => Promise<void>;
    pause: () => Promise<void>;
    resume: () => Promise<void>;
    submitScore: (scoreData: ScoreData) => Promise<boolean>;
  };
  
  // Settings
  settings: {
    get: () => Promise<GameSettings>;
    set: (settings: Partial<GameSettings>) => Promise<boolean>;
    reset: () => Promise<GameSettings>;
  };
  
  // System
  system: {
    minimize: () => void;
    maximize: () => void;
    toggleMaximize: () => void;
    close: () => void;
    getPlatform: () => Promise<string>;
  };
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
