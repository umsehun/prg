/**
 * @file Manages audio playback using the Web Audio API for precise timing.
 */

export class AudioService {
  private static instance: AudioService;
  private audioContext: AudioContext | null = null;
  private currentSource: AudioBufferSourceNode | null = null;
  private currentBuffer: AudioBuffer | null = null;
  private startTime: number = 0;
  private pauseTime: number = 0;
  private isPlaying: boolean = false;
  private isPaused: boolean = false;
  private volume: number = 1.0;
  private gainNode: GainNode | null = null;

  // Multi-channel audio support
  private hitsoundSources: Map<string, AudioBufferSourceNode> = new Map();
  private hitsoundBuffers: Map<string, AudioBuffer> = new Map();
  private hitsoundGainNode: GainNode | null = null;
  private endedListeners: Set<() => void> = new Set();

  private constructor() {
    if (typeof window !== 'undefined') {
      this.audioContext = new window.AudioContext();
      this.setupGainNodes();
    }
  }

  public static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService();
    }
    return AudioService.instance;
  }

  /**
   * Converts incoming data from IPC into a usable ArrayBuffer.
   * This handles cases where the ArrayBuffer is serialized during transit.
   * @param data The data received from the main process.
   * @returns A valid ArrayBuffer.
   */
  private _toArrayBuffer(data: any): ArrayBuffer {
    if (data instanceof ArrayBuffer) {
      return data;
    }
    // Electron's IPC can serialize Buffers into Uint8Arrays
    if (data instanceof Uint8Array) {
      // If it's a view of a larger buffer, we might need to copy
      // Build a Uint8Array view for the requested range
      const view = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
      // If the underlying buffer is already a plain ArrayBuffer and the view covers the whole buffer, return it directly
      if (view.byteOffset === 0 && view.byteLength === view.buffer.byteLength && view.buffer instanceof ArrayBuffer) {
        return view.buffer as ArrayBuffer;
      }
      // Otherwise create a copy via slice() which returns a new Uint8Array backed by an ArrayBuffer
      return view.slice().buffer;
    }
    // Handle the { type: 'Buffer', data: [...] } serialization format
    if (data && data.type === 'Buffer' && Array.isArray(data.data)) {
      return new Uint8Array(data.data).buffer;
    }
    throw new Error(`Received invalid data type for audio asset: ${typeof data}`);
  }

  private setupGainNodes(): void {
    if (!this.audioContext) return;

    this.gainNode = this.audioContext.createGain();
    this.gainNode.connect(this.audioContext.destination);

    this.hitsoundGainNode = this.audioContext.createGain();
    this.hitsoundGainNode.connect(this.audioContext.destination);
  }

  /**
   * Load audio from asset path using Electron IPC
   */
  public async loadAudio(audioPath: string): Promise<void> {
    if (!this.audioContext) {
      throw new Error('AudioContext not initialized');
    }

    try {
      const rawData = await (window as any).electron.loadAsset(audioPath);
      const arrayBuffer = this._toArrayBuffer(rawData);
      this.currentBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
    } catch (error) {
      console.error('Failed to load audio:', error);
      throw error;
    }
  }

  /**
   * Load hitsound from asset path
   */
  public async loadHitsound(soundName: string, audioPath: string): Promise<void> {
    if (this.hitsoundBuffers.has(soundName) || !audioPath) {
      return;
    }
    try {
      console.log(`[AudioService] Loading hitsound '${soundName}' from: ${audioPath}`);

      // Use fetch API directly with file:// URL - no more IPC needed!
      const response = await fetch(audioPath);
      if (!response.ok) {
        throw new Error(`Failed to fetch audio: ${response.status} ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = await this.audioContext!.decodeAudioData(arrayBuffer);
      this.hitsoundBuffers.set(soundName, buffer);
      console.log(`[AudioService] Successfully loaded hitsound '${soundName}'`);
    } catch (error) {
      console.error(`[AudioService] FAILED to load hitsound ${soundName} from ${audioPath}:`, error);
      throw error;
    }
  }

  /**
   * Play the loaded audio
   */
  public play(startOffset: number = 0): void {
    if (!this.audioContext || !this.currentBuffer || !this.gainNode) {
      console.warn('Cannot play: AudioContext, buffer, or gain node not available');
      return;
    }

    this.stop(); // Stop any currently playing audio

    this.currentSource = this.audioContext.createBufferSource();
    this.currentSource.buffer = this.currentBuffer;
    this.currentSource.connect(this.gainNode);

    this.startTime = this.audioContext.currentTime;
    this.pauseTime = 0;
    this.isPlaying = true;
    this.isPaused = false;

    // Add ended listener
    this.currentSource.onended = () => {
      this.isPlaying = false;
      this.isPaused = false;
      this.endedListeners.forEach(listener => listener());
    };

    this.currentSource.start(0, startOffset);
  }

  /**
   * Pause the audio
   */
  public pause(): void {
    if (this.currentSource && this.isPlaying && !this.isPaused) {
      this.currentSource.stop();
      this.pauseTime = this.getCurrentTime();
      this.isPlaying = false;
      this.isPaused = true;
    }
  }

  /**
   * Resume the paused audio
   */
  public resume(): void {
    if (this.isPaused && this.pauseTime > 0) {
      this.play(this.pauseTime);
    }
  }

  /**
   * Stop the audio
   */
  public stop(): void {
    if (this.currentSource) {
      this.currentSource.stop();
      this.currentSource = null;
    }
    this.isPlaying = false;
    this.isPaused = false;
    this.startTime = 0;
    this.pauseTime = 0;
  }

  /**
   * Play a hitsound
   */
  public playHitsound(soundName: string, volume: number = 1.0): void {
    if (!this.audioContext || !this.hitsoundGainNode) return;

    const buffer = this.hitsoundBuffers.get(soundName);
    if (!buffer) {
      console.warn(`Hitsound not found: ${soundName}`);
      return;
    }

    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();

    source.buffer = buffer;
    gainNode.gain.value = volume;

    source.connect(gainNode);
    gainNode.connect(this.hitsoundGainNode);

    source.start();

    // Clean up after playback
    source.onended = () => {
      source.disconnect();
      gainNode.disconnect();
    };
  }

  /**
   * Get current playback time in seconds
   */
  public getCurrentTime(): number {
    if (!this.audioContext) return 0;

    if (this.isPaused) {
      return this.pauseTime;
    }

    if (this.isPlaying && this.startTime > 0) {
      return this.audioContext.currentTime - this.startTime;
    }

    return 0;
  }

  /**
   * Get total duration of loaded audio
   */
  public getDuration(): number {
    return this.currentBuffer ? this.currentBuffer.duration : 0;
  }

  /**
   * Set volume (0.0 to 1.0)
   */
  public setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.gainNode) {
      this.gainNode.gain.value = this.volume;
    }
  }

  /**
   * Set hitsound volume (0.0 to 1.0)
   */
  public setHitsoundVolume(volume: number): void {
    if (this.hitsoundGainNode) {
      this.hitsoundGainNode.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  /**
   * Check if audio is currently playing
   */
  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  /**
   * Check if audio is paused
   */
  public getIsPaused(): boolean {
    return this.isPaused;
  }

  /**
   * Add listener for when audio ends
   */
  public onEnded(callback: () => void): () => void {
    this.endedListeners.add(callback);
    return () => this.endedListeners.delete(callback);
  }

  /**
   * Seek to specific time
   */
  public seekTo(time: number): void {
    if (this.isPlaying) {
      this.play(time);
    } else {
      this.pauseTime = time;
    }
  }
}

// Export singleton instance
export const audioService = AudioService.getInstance();
