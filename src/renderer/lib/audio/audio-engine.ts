/**
 * High-precision audio system using Web Audio API
 * Handles audio playback with minimal latency for rhythm games
 */

export class AudioEngine {
    private context: AudioContext | null = null;
    private audioBuffer: AudioBuffer | null = null;
    private sourceNode: AudioBufferSourceNode | null = null;
    private gainNode: GainNode | null = null;
    private startTime: number = 0;
    private pauseTime: number = 0;
    private isPlaying: boolean = false;
    private isPaused: boolean = false;

    constructor() {
        this.initializeAudioContext();
    }

    private async initializeAudioContext(): Promise<void> {
        try {
            // Create audio context with optimal settings
            this.context = new AudioContext({
                latencyHint: 'interactive', // Minimize latency
                sampleRate: 44100
            });

            // Create gain node for volume control
            this.gainNode = this.context.createGain();
            this.gainNode.connect(this.context.destination);

            // Resume context if suspended (required by browsers)
            if (this.context.state === 'suspended') {
                await this.context.resume();
            }
        } catch (error) {
            console.error('Failed to initialize Audio Context:', error);
        }
    }

    /**
     * Load audio file from URL or ArrayBuffer
     */
    async loadAudio(audioData: ArrayBuffer): Promise<boolean> {
        if (!this.context) {
            console.error('Audio context not initialized');
            return false;
        }

        try {
            // Decode audio data
            this.audioBuffer = await this.context.decodeAudioData(audioData);
            return true;
        } catch (error) {
            console.error('Failed to decode audio data:', error);
            return false;
        }
    }

    /**
     * Play audio from specific time offset
     */
    play(offset: number = 0): boolean {
        if (!this.context || !this.audioBuffer) {
            console.error('Audio not loaded or context not available');
            return false;
        }

        try {
            // Stop current playback if any
            this.stop();

            // Create new source node
            this.sourceNode = this.context.createBufferSource();
            this.sourceNode.buffer = this.audioBuffer;
            this.sourceNode.connect(this.gainNode!);

            // Start playback
            const when = this.context.currentTime;
            this.sourceNode.start(when, offset);

            this.startTime = when - offset;
            this.isPlaying = true;
            this.isPaused = false;
            this.pauseTime = 0;

            return true;
        } catch (error) {
            console.error('Failed to play audio:', error);
            return false;
        }
    }

    /**
     * Pause audio playback
     */
    pause(): boolean {
        if (!this.isPlaying || this.isPaused || !this.sourceNode) {
            return false;
        }

        try {
            this.pauseTime = this.getCurrentTime();
            this.sourceNode.stop();
            this.sourceNode = null;
            this.isPaused = true;
            this.isPlaying = false;
            return true;
        } catch (error) {
            console.error('Failed to pause audio:', error);
            return false;
        }
    }

    /**
     * Resume paused audio
     */
    resume(): boolean {
        if (!this.isPaused) {
            return false;
        }

        return this.play(this.pauseTime / 1000); // Convert to seconds
    }

    /**
     * Stop audio playback
     */
    stop(): void {
        if (this.sourceNode) {
            try {
                this.sourceNode.stop();
            } catch (error) {
                // Source might already be stopped
            }
            this.sourceNode = null;
        }

        this.isPlaying = false;
        this.isPaused = false;
        this.startTime = 0;
        this.pauseTime = 0;
    }

    /**
     * Get current playback time in milliseconds
     * This is the CRITICAL method for rhythm game timing
     */
    getCurrentTime(): number {
        if (!this.context) return 0;

        if (this.isPaused) {
            return this.pauseTime;
        }

        if (this.isPlaying && this.sourceNode) {
            // Use AudioContext.currentTime for precise timing
            const elapsed = this.context.currentTime - this.startTime;
            return elapsed * 1000; // Convert to milliseconds
        }

        return 0;
    }

    /**
     * Set playback volume (0.0 to 1.0)
     */
    setVolume(volume: number): void {
        if (this.gainNode) {
            this.gainNode.gain.value = Math.max(0, Math.min(1, volume));
        }
    }

    /**
     * Get audio duration in milliseconds
     */
    getDuration(): number {
        return this.audioBuffer ? this.audioBuffer.duration * 1000 : 0;
    }

    /**
     * Check if audio is currently playing
     */
    getIsPlaying(): boolean {
        return this.isPlaying;
    }

    /**
     * Check if audio is paused
     */
    getIsPaused(): boolean {
        return this.isPaused;
    }

    /**
     * Clean up resources
     */
    dispose(): void {
        this.stop();

        if (this.context) {
            this.context.close();
            this.context = null;
        }

        this.audioBuffer = null;
        this.gainNode = null;
    }
}

/**
 * Hitsound player for feedback sounds
 */
export class HitsoundPlayer {
    private context: AudioContext | null = null;
    private hitsounds: Map<string, AudioBuffer> = new Map();
    private gainNode: GainNode | null = null;

    constructor(audioContext?: AudioContext) {
        if (audioContext) {
            this.context = audioContext;
            this.setupGainNode();
        } else {
            this.initializeAudioContext();
        }
    }

    private async initializeAudioContext(): Promise<void> {
        try {
            this.context = new AudioContext({
                latencyHint: 'interactive',
                sampleRate: 44100
            });

            this.setupGainNode();

            if (this.context.state === 'suspended') {
                await this.context.resume();
            }
        } catch (error) {
            console.error('Failed to initialize hitsound audio context:', error);
        }
    }

    private setupGainNode(): void {
        if (this.context) {
            this.gainNode = this.context.createGain();
            this.gainNode.connect(this.context.destination);
        }
    }

    /**
     * Load hitsound from audio data
     */
    async loadHitsound(name: string, audioData: ArrayBuffer): Promise<boolean> {
        if (!this.context) return false;

        try {
            const buffer = await this.context.decodeAudioData(audioData);
            this.hitsounds.set(name, buffer);
            return true;
        } catch (error) {
            console.error(`Failed to load hitsound ${name}:`, error);
            return false;
        }
    }

    /**
     * Play hitsound immediately
     */
    play(name: string, volume: number = 1.0): void {
        if (!this.context || !this.gainNode) return;

        const buffer = this.hitsounds.get(name);
        if (!buffer) return;

        try {
            const source = this.context.createBufferSource();
            const gain = this.context.createGain();

            source.buffer = buffer;
            gain.gain.value = Math.max(0, Math.min(1, volume));

            source.connect(gain);
            gain.connect(this.gainNode);

            source.start();
        } catch (error) {
            console.error(`Failed to play hitsound ${name}:`, error);
        }
    }

    /**
     * Set hitsound volume
     */
    setVolume(volume: number): void {
        if (this.gainNode) {
            this.gainNode.gain.value = Math.max(0, Math.min(1, volume));
        }
    }

    /**
     * Clean up resources
     */
    dispose(): void {
        this.hitsounds.clear();

        if (this.context) {
            this.context.close();
            this.context = null;
        }

        this.gainNode = null;
    }
}
