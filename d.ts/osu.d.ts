/**
 * osu!-specific type definitions
 * Beatmap parsing, game modes, timing, and scoring
 */

declare global {
  /**
   * osu! Game modes
   */
  type GameMode = 'osu' | 'taiko' | 'fruits' | 'mania';

  /**
   * osu! Hit judgments
   */
  type Judgment = 'KOOL' | 'COOL' | 'GOOD' | 'MISS';

  /**
   * Beatmap file structure
   */
  interface OsuBeatmap {
    readonly general: BeatmapGeneral;
    readonly editor: BeatmapEditor;
    readonly metadata: BeatmapMetadata;
    readonly difficulty: BeatmapDifficulty;
    readonly events: BeatmapEvents;
    readonly timingPoints: ReadonlyArray<TimingPoint>;
    readonly colours: BeatmapColours;
    readonly hitObjects: ReadonlyArray<HitObject>;
  }

  /**
   * Beatmap sections
   */
  interface BeatmapGeneral {
    readonly audioFilename: string;
    readonly audioLeadIn: Milliseconds;
    readonly previewTime: Milliseconds;
    readonly countdown: 0 | 1 | 2 | 3;
    readonly sampleSet: 'Normal' | 'Soft' | 'Drum';
    readonly stackLeniency: number;
    readonly mode: 0 | 1 | 2 | 3; // osu, taiko, fruits, mania
    readonly letterboxInBreaks: boolean;
    readonly widescreenStoryboard: boolean;
  }

  interface BeatmapEditor {
    readonly bookmarks: ReadonlyArray<Milliseconds>;
    readonly distanceSpacing: number;
    readonly beatDivisor: number;
    readonly gridSize: number;
    readonly timelineZoom: number;
  }

  interface BeatmapMetadata {
    readonly title: string;
    readonly titleUnicode: string;
    readonly artist: string;
    readonly artistUnicode: string;
    readonly creator: string;
    readonly version: string;
    readonly source: string;
    readonly tags: ReadonlyArray<string>;
    readonly beatmapID: number;
    readonly beatmapSetID: number;
  }

  interface BeatmapDifficulty {
    readonly hpDrainRate: number; // 0-10
    readonly circleSize: number; // 0-10
    readonly overallDifficulty: number; // 0-10
    readonly approachRate: number; // 0-10
    readonly sliderMultiplier: number;
    readonly sliderTickRate: number;
  }

  interface BeatmapEvents {
    readonly backgroundPath?: string;
    readonly videoPath?: string;
    readonly breaks: ReadonlyArray<BreakPeriod>;
    readonly storyboard?: StoryboardEvents;
  }

  interface BeatmapColours {
    readonly combo: ReadonlyArray<RGBColor>;
    readonly sliderTrackOverride?: RGBColor;
    readonly sliderBorder?: RGBColor;
  }

  /**
   * Timing system
   */
  interface TimingPoint {
    readonly time: Milliseconds;
    readonly beatLength: number;
    readonly meter: number;
    readonly sampleSet: 0 | 1 | 2 | 3;
    readonly sampleIndex: number;
    readonly volume: number; // 0-100
    readonly uninherited: boolean;
    readonly effects: TimingPointEffects;
  }

  interface TimingPointEffects {
    readonly kiaiTime: boolean;
    readonly omitFirstBarLine: boolean;
  }

  /**
   * Hit objects
   */
  interface HitObject {
    readonly x: number; // 0-512
    readonly y: number; // 0-384
    readonly time: Milliseconds;
    readonly type: HitObjectType;
    readonly hitSound: HitSound;
    readonly endTime?: Milliseconds; // For sliders and spinners
    readonly additions?: HitSampleAdditions;
  }

  interface HitObjectType {
    readonly circle: boolean;
    readonly slider: boolean;
    readonly newCombo: boolean;
    readonly spinner: boolean;
    readonly colourSkip: number; // 0-3
    readonly hold: boolean; // mania only
  }

  interface HitSound {
    readonly normal: boolean;
    readonly whistle: boolean;
    readonly finish: boolean;
    readonly clap: boolean;
  }

  interface HitSampleAdditions {
    readonly sampleSet: 0 | 1 | 2 | 3;
    readonly additionSet: 0 | 1 | 2 | 3;
    readonly customIndex: number;
    readonly volume: number; // 0-100
    readonly filename?: string;
  }

  /**
   * Slider-specific types
   */
  interface SliderData {
    readonly curveType: 'L' | 'P' | 'B' | 'C';
    readonly curvePoints: ReadonlyArray<Point2D>;
    readonly slides: number;
    readonly length: number;
    readonly edgeSounds: ReadonlyArray<HitSound>;
    readonly edgeSets: ReadonlyArray<HitSampleAdditions>;
  }

  /**
   * Chart metadata for the game
   */
  interface ChartMetadata {
    readonly id: ChartId;
    readonly title: string;
    readonly artist: string;
    readonly creator: string;
    readonly source?: string;
    readonly tags: ReadonlyArray<string>;
    readonly bpm: BPM;
    readonly duration: Seconds;
    readonly gameMode: GameMode;
    readonly difficulties: ReadonlyArray<DifficultyMetadata>;
    readonly backgroundImage?: string;
    readonly previewTime?: Milliseconds;
    readonly audioFilename: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
  }

  interface DifficultyMetadata {
    readonly version: string;
    readonly starRating: number;
    readonly overallDifficulty: number;
    readonly approachRate: number;
    readonly circleSize: number;
    readonly hpDrainRate: number;
    readonly maxCombo: number;
    readonly objectCount: number;
  }

  /**
   * Gameplay data
   */
  interface ChartPlayData {
    readonly metadata: ChartMetadata;
    readonly difficulty: DifficultyData;
    readonly audioBuffer: ArrayBuffer;
    readonly backgroundImage?: ArrayBuffer;
    readonly hitObjects: ReadonlyArray<PlayableHitObject>;
    readonly timingPoints: ReadonlyArray<TimingPoint>;
    readonly judgmentWindows: JudgmentWindows;
  }

  interface DifficultyData {
    readonly version: string;
    readonly overallDifficulty: number;
    readonly approachRate: number;
    readonly circleSize: number;
    readonly hpDrainRate: number;
    readonly sliderMultiplier: number;
    readonly sliderTickRate: number;
    readonly stackLeniency: number;
  }

  interface PlayableHitObject {
    readonly id: string;
    readonly time: Milliseconds;
    readonly endTime?: Milliseconds;
    readonly position: Point2D;
    readonly type: 'circle' | 'slider' | 'spinner';
    readonly newCombo: boolean;
    readonly comboNumber: number;
    readonly hitSound: HitSound;
    readonly sliderData?: SliderData;
  }

  /**
   * Judgment and scoring
   */
  interface JudgmentWindows {
    readonly KOOL: Milliseconds;
    readonly COOL: Milliseconds;
    readonly GOOD: Milliseconds;
    readonly MISS: Milliseconds;
  }

  interface JudgmentResult {
    readonly judgment: Judgment;
    readonly timingError: Milliseconds;
    readonly accuracy: number; // 0-100
    readonly score: number;
    readonly combo: number;
    readonly isComboBreak: boolean;
    readonly timestamp: Milliseconds;
  }

  interface GameScore {
    readonly sessionId: SessionId;
    readonly chartId: ChartId;
    readonly difficulty: string;
    readonly totalScore: number;
    readonly accuracy: number; // 0-100
    readonly maxCombo: number;
    readonly judgmentCounts: Record<Judgment, number>;
    readonly grade: ScoreGrade;
    readonly modifiers: GameModifiers;
    readonly playTime: Milliseconds;
    readonly completedAt: Date;
    readonly performanceMetrics: PerformanceMetrics;
  }

  type ScoreGrade = 'SS' | 'S' | 'A' | 'B' | 'C' | 'D' | 'F';

  /**
   * Game modifiers
   */
  interface GameModifiers {
    readonly noFail: boolean;
    readonly easy: boolean;
    readonly hardRock: boolean;
    readonly doubleTime: boolean;
    readonly halfTime: boolean;
    readonly hidden: boolean;
    readonly flashlight: boolean;
    readonly autoplay: boolean;
    readonly relax: boolean;
    readonly speedMultiplier: number; // 0.5 - 2.0
  }

  /**
   * Performance tracking
   */
  interface PerformanceMetrics {
    readonly averageTimingError: Milliseconds;
    readonly timingStandardDeviation: Milliseconds;
    readonly unstableRate: number; // osu! UR metric
    readonly hitErrorHistory: ReadonlyArray<Milliseconds>;
    readonly accuracy300: number; // Perfect hits percentage
    readonly accuracy100: number; // Good hits percentage
    readonly accuracy50: number; // OK hits percentage
    readonly accuracyMiss: number; // Miss percentage
  }

  /**
   * Game settings and configuration
   */
  interface GameSettings {
    readonly masterVolume: number; // 0-100
    readonly musicVolume: number; // 0-100
    readonly effectVolume: number; // 0-100
    readonly audioOffset: Milliseconds; // -500 to 500
    readonly visualSettings: {
      readonly backgroundDim: number; // 0-100
      readonly showApproachCircles: boolean;
      readonly showHitLighting: boolean;
      readonly showComboFire: boolean;
      readonly cursorSize: number; // 0.5 - 2.0
      readonly cursorTrail: boolean;
    };
    readonly inputSettings: {
      readonly keyBindings: Record<string, string>;
      readonly mouseDisableWheel: boolean;
      readonly mouseDisableButtons: boolean;
      readonly rawInput: boolean;
      readonly mouseSensitivity: number; // 0.1 - 6.0
    };
    readonly gameplaySettings: {
      readonly progressBarType: 'none' | 'pie' | 'topRight' | 'bottomRight';
      readonly scoreDisplayType: 'none' | 'accuracy' | 'score' | 'both';
      readonly keyOverlay: boolean;
      readonly alwaysShowKeyOverlay: boolean;
      readonly showInterface: boolean;
    };
  }

  /**
   * User settings (extends game settings)
   */
  interface UserSettings extends GameSettings {
    readonly profile: {
      readonly username: string;
      readonly avatar?: string;
      readonly country: string;
      readonly timezone: string;
    };
    readonly advanced: {
      readonly frameLimit: 'unlimited' | 'vsync' | number;
      readonly compatibilityMode: boolean;
      readonly reduceDroppedFrames: boolean;
      readonly detectPerformanceIssues: boolean;
    };
    readonly folders: {
      readonly chartLibrary: string;
      readonly cache: string;
      readonly logs: string;
      readonly recordings: string;
    };
  }

  /**
   * Color types
   */
  interface RGBColor {
    readonly r: number; // 0-255
    readonly g: number; // 0-255
    readonly b: number; // 0-255
  }

  interface HSVColor {
    readonly h: number; // 0-360
    readonly s: number; // 0-100
    readonly v: number; // 0-100
  }

  /**
   * Audio types
   */
  interface AudioFormat {
    readonly sampleRate: number;
    readonly channels: number;
    readonly bitDepth: number;
    readonly codec: 'mp3' | 'wav' | 'ogg' | 'm4a';
    readonly duration: Seconds;
    readonly bitrate?: number;
  }

  /**
   * Misc types
   */
  interface BreakPeriod {
    readonly startTime: Milliseconds;
    readonly endTime: Milliseconds;
  }

  interface StoryboardEvents {
    // Placeholder for future storyboard support
    readonly sprites: ReadonlyArray<unknown>;
    readonly animations: ReadonlyArray<unknown>;
  }
}

export {};
