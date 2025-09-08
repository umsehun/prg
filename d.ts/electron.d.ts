/**
 * Electron-specific type definitions
 * IPC communication, security, and Electron APIs
 */

declare global {
  /**
   * Electron preload script API exposed to renderer
   */
  interface Window {
    readonly electronAPI: ElectronAPI;
  }

  /**
   * Main Electron API interface
   */
  interface ElectronAPI {
    readonly system: {
      readonly platform: NodeJS.Platform;
      readonly version: string;
      readonly isDev: boolean;
      readonly dataPath: string;
    };

    readonly game: GameAPI;
    readonly osz: OszAPI;
    readonly settings: SettingsAPI;
    readonly files: FilesAPI;
  }

  /**
   * Game-related IPC API
   */
  interface GameAPI {
    start(request: GameStartRequest): Promise<GameStartResponse>;
    stop(): Promise<GameStopResponse>;
    pause(): Promise<GamePauseResponse>;
    resume(): Promise<GameResumeResponse>;
    throwKnife(request: KnifeThrowRequest): Promise<KnifeThrowResponse>;
    
    // Event listeners
    onGameEvent<T = unknown>(callback: EventHandler<GameEvent<T>>): Cleanup;
    onKnifeResult(callback: EventHandler<KnifeResultEvent>): Cleanup;
    onScoreUpdate(callback: EventHandler<ScoreUpdateEvent>): Cleanup;
  }

  /**
   * OSZ file handling API
   */
  interface OszAPI {
    import(filePath?: string): Promise<OszImportResponse>;
    getLibrary(): Promise<OszLibraryResponse>;
    removeChart(chartId: ChartId): Promise<OszRemoveResponse>;
    getAudioData(chartId: ChartId): Promise<AudioDataResponse>;
    getChartData(chartId: ChartId, difficulty?: string): Promise<ChartDataResponse>;
    
    // Event listeners
    onImportProgress(callback: EventHandler<ImportProgressEvent>): Cleanup;
    onLibraryChange(callback: EventHandler<LibraryChangeEvent>): Cleanup;
  }

  /**
   * Settings management API
   */
  interface SettingsAPI {
    getAll(): Promise<SettingsGetAllResponse>;
    get<K extends keyof UserSettings>(key: K): Promise<SettingsGetResponse<K>>;
    set<K extends keyof UserSettings>(key: K, value: UserSettings[K]): Promise<SettingsSetResponse>;
    reset(): Promise<SettingsResetResponse>;
    export(): Promise<SettingsExportResponse>;
    import(): Promise<SettingsImportResponse>;
    
    // Event listeners
    onChange<K extends keyof UserSettings>(callback: EventHandler<SettingsChangeEvent<K>>): Cleanup;
    onReset(callback: EventHandler<SettingsResetEvent>): Cleanup;
  }

  /**
   * File system API
   */
  interface FilesAPI {
    showOpenDialog(options: FileDialogOptions): Promise<FileDialogResponse>;
    showSaveDialog(options: SaveDialogOptions): Promise<FileDialogResponse>;
    openPath(path: string): Promise<OpenPathResponse>;
    showInFolder(path: string): Promise<ShowInFolderResponse>;
    
    // File operations
    readFile(path: string): Promise<ReadFileResponse>;
    writeFile(path: string, data: Buffer | string): Promise<WriteFileResponse>;
    deleteFile(path: string): Promise<DeleteFileResponse>;
  }

  /**
   * IPC Request/Response types
   */

  // Game API types
  interface GameStartRequest {
    readonly chartId: ChartId;
    readonly difficulty: string;
    readonly modifiers?: GameModifiers;
  }

  interface GameStartResponse extends BaseResult {
    readonly sessionId?: SessionId;
    readonly chartData?: ChartPlayData;
  }

  interface GameStopResponse extends BaseResult {
    readonly finalScore?: GameScore;
  }

  interface GamePauseResponse extends BaseResult {
    readonly isPaused: boolean;
    readonly pauseTime: Milliseconds;
  }

  interface GameResumeResponse extends BaseResult {
    readonly isPaused: boolean;
    readonly resumeTime: Milliseconds;
  }

  interface KnifeThrowRequest {
    readonly sessionId: SessionId;
    readonly throwTime: Milliseconds;
    readonly inputLatency?: Milliseconds;
  }

  interface KnifeThrowResponse extends BaseResult {
    readonly knifeId: string;
    readonly serverTime: Milliseconds;
  }

  // OSZ API types
  interface OszImportResponse extends BaseResult {
    readonly chartId?: ChartId;
    readonly metadata?: ChartMetadata;
    readonly importedFiles?: string[];
  }

  interface OszLibraryResponse extends BaseResult {
    readonly charts: ChartMetadata[];
    readonly totalCount: number;
  }

  interface OszRemoveResponse extends BaseResult {
    readonly removedFiles?: string[];
  }

  interface AudioDataResponse extends BaseResult {
    readonly audioData?: ArrayBuffer;
    readonly format?: AudioFormat;
  }

  interface ChartDataResponse extends BaseResult {
    readonly chartData?: ChartPlayData;
    readonly difficulty?: DifficultyData;
  }

  // Settings API types
  interface SettingsGetAllResponse extends BaseResult {
    readonly settings?: UserSettings;
  }

  interface SettingsGetResponse<K extends keyof UserSettings> extends BaseResult {
    readonly value?: UserSettings[K];
  }

  interface SettingsSetResponse extends BaseResult {
    readonly oldValue?: unknown;
    readonly newValue?: unknown;
  }

  interface SettingsResetResponse extends BaseResult {
    readonly defaultSettings?: UserSettings;
  }

  interface SettingsExportResponse extends BaseResult {
    readonly exportPath?: string;
  }

  interface SettingsImportResponse extends BaseResult {
    readonly importedSettings?: Partial<UserSettings>;
  }

  // File API types
  interface FileDialogOptions {
    readonly title?: string;
    readonly defaultPath?: string;
    readonly filters?: ReadonlyArray<{
      readonly name: string;
      readonly extensions: ReadonlyArray<string>;
    }>;
    readonly properties?: ReadonlyArray<'openFile' | 'openDirectory' | 'multiSelections'>;
  }

  interface SaveDialogOptions {
    readonly title?: string;
    readonly defaultPath?: string;
    readonly filters?: ReadonlyArray<{
      readonly name: string;
      readonly extensions: ReadonlyArray<string>;
    }>;
  }

  interface FileDialogResponse extends BaseResult {
    readonly filePaths?: ReadonlyArray<string>;
    readonly canceled: boolean;
  }

  interface OpenPathResponse extends BaseResult {
    readonly opened: boolean;
  }

  interface ShowInFolderResponse extends BaseResult {
    readonly shown: boolean;
  }

  interface ReadFileResponse extends BaseResult {
    readonly data?: Buffer;
    readonly encoding?: string;
  }

  interface WriteFileResponse extends BaseResult {
    readonly bytesWritten?: number;
  }

  interface DeleteFileResponse extends BaseResult {
    readonly deleted: boolean;
  }

  /**
   * Event types
   */
  interface KnifeResultEvent {
    readonly knifeId: string;
    readonly result: 'hit' | 'miss' | 'collision';
    readonly timingError: Milliseconds;
    readonly accuracy: number;
    readonly score: number;
    readonly combo: number;
  }

  interface ScoreUpdateEvent {
    readonly sessionId: SessionId;
    readonly totalScore: number;
    readonly accuracy: number;
    readonly combo: number;
    readonly maxCombo: number;
  }

  interface ImportProgressEvent {
    readonly progress: number; // 0-100
    readonly currentFile: string;
    readonly totalFiles: number;
    readonly processedFiles: number;
  }

  interface LibraryChangeEvent {
    readonly action: 'added' | 'removed' | 'updated';
    readonly chartId: ChartId;
    readonly metadata?: ChartMetadata;
  }

  interface SettingsChangeEvent<K extends keyof UserSettings> {
    readonly key: K;
    readonly oldValue: UserSettings[K];
    readonly newValue: UserSettings[K];
    readonly source: 'user' | 'import' | 'reset';
  }

  interface SettingsResetEvent {
    readonly resetSettings: UserSettings;
    readonly previousSettings: UserSettings;
  }
}

export {};
