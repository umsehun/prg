/**
 * Additional type definitions for OSZ processing
 */

// Audio format type
export interface AudioFormat {
  readonly sampleRate: number;
  readonly channels: number;
  readonly bitDepth: 16 | 24 | 32;
  readonly codec: 'mp3' | 'wav' | 'ogg' | 'm4a';
  readonly duration: Seconds;
  readonly bitrate?: number;
}

// Chart metadata type
export interface ChartMetadata {
  readonly id: ChartId;
  readonly title: string;
  readonly artist: string;
  readonly creator: string;
  readonly source?: string;
  readonly tags: readonly string[];
  readonly bpm: BPM;
  readonly duration: Seconds;
  readonly gameMode: GameMode;
  readonly difficulties: readonly DifficultyMetadata[];
  readonly backgroundImage?: string;
  readonly previewTime?: Milliseconds;
  readonly audioFilename: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface DifficultyMetadata {
  readonly version: string;
  readonly starRating: number;
  readonly overallDifficulty: number;
  readonly approachRate: number;
  readonly circleSize: number;
  readonly hpDrainRate: number;
  readonly maxCombo: number;
  readonly objectCount: number;
}

// Branded types for type safety
export type ChartId = string & { readonly _brand: 'ChartId' };
export type BPM = number & { readonly _brand: 'BPM' };
export type Seconds = number & { readonly _brand: 'Seconds' };
export type Milliseconds = number & { readonly _brand: 'Milliseconds' };

export type GameMode = 'osu' | 'taiko' | 'fruits' | 'mania';

// Node.js error type with code property
export interface NodeError extends Error {
  code?: string;
}
