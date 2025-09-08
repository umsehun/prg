/**
 * Audio system type definitions
 * Web Audio API, audio processing, and sound management
 */

declare global {
    /**
     * Audio engine configuration
     */
    interface AudioEngineConfig {
        readonly sampleRate: number;
        readonly bufferSize: 128 | 256 | 512 | 1024 | 2048 | 4096;
        readonly latencyHint: AudioContextLatencyCategory;
        readonly maxChannels: number;
        readonly enableSpatialAudio: boolean;
    }

    /**
     * Audio source types
     */
    type AudioSourceType = 'music' | 'hitsound' | 'ui' | 'voice' | 'ambient';

    /**
     * Audio processing nodes
     */
    interface AudioNodeChain {
        readonly source: AudioBufferSourceNode | MediaElementAudioSourceNode;
        readonly gain: GainNode;
        readonly lowpass?: BiquadFilterNode;
        readonly highpass?: BiquadFilterNode;
        readonly compressor?: DynamicsCompressorNode;
        readonly reverb?: ConvolverNode;
        readonly analyzer: AnalyserNode;
        readonly destination: AudioDestinationNode;
    }

    /**
     * Audio track representation
     */
    interface AudioTrack {
        readonly id: string;
        readonly name: string;
        readonly type: AudioSourceType;
        readonly buffer: AudioBuffer;
        readonly format: AudioFormat;
        readonly metadata: AudioMetadata;
        readonly waveform?: Float32Array;
        readonly peaks?: ReadonlyArray<number>;
    }

    interface AudioMetadata {
        readonly title?: string;
        readonly artist?: string;
        readonly album?: string;
        readonly year?: number;
        readonly genre?: string;
        readonly trackNumber?: number;
        readonly duration: Seconds;
        readonly bpm?: BPM;
        readonly key?: MusicalKey;
    }

    /**
     * Audio playback control
     */
    interface AudioPlaybackState {
        readonly isPlaying: boolean;
        readonly isPaused: boolean;
        readonly isLooping: boolean;
        readonly currentTime: Seconds;
        readonly duration: Seconds;
        readonly playbackRate: number; // 0.25 - 4.0
        readonly volume: number; // 0-1
        readonly pan: number; // -1 to 1
    }

    interface AudioPlaybackOptions {
        readonly startTime?: Seconds;
        readonly duration?: Seconds;
        readonly loop?: boolean;
        readonly fadeIn?: Milliseconds;
        readonly fadeOut?: Milliseconds;
        readonly volume?: number;
        readonly playbackRate?: number;
        readonly pan?: number;
    }

    /**
     * Audio effects and processing
     */
    interface AudioEffectConfig {
        readonly type: AudioEffectType;
        readonly enabled: boolean;
        readonly parameters: Record<string, number>;
        readonly presets?: Record<string, Record<string, number>>;
    }

    type AudioEffectType =
        | 'lowpass'
        | 'highpass'
        | 'bandpass'
        | 'reverb'
        | 'delay'
        | 'chorus'
        | 'distortion'
        | 'compressor'
        | 'equalizer'
        | 'limiter';

    /**
     * Audio visualization
     */
    interface AudioVisualizationData {
        readonly frequencyData: Uint8Array;
        readonly timeData: Uint8Array;
        readonly volume: number;
        readonly peak: number;
        readonly rms: number;
        readonly spectrum: ReadonlyArray<number>;
    }

    interface WaveformData {
        readonly samples: Float32Array;
        readonly peaks: ReadonlyArray<number>;
        readonly duration: Seconds;
        readonly sampleRate: number;
        readonly channels: number;
    }

    /**
     * Audio mixing and routing
     */
    interface AudioMixer {
        readonly channels: ReadonlyArray<AudioChannel>;
        readonly masterGain: GainNode;
        readonly masterCompressor: DynamicsCompressorNode;
        readonly masterLimiter: DynamicsCompressorNode;
        readonly outputAnalyzer: AnalyserNode;
    }

    interface AudioChannel {
        readonly id: string;
        readonly name: string;
        readonly type: AudioSourceType;
        readonly gain: GainNode;
        readonly mute: boolean;
        readonly solo: boolean;
        readonly volume: number; // 0-1
        readonly pan: number; // -1 to 1
        readonly effects: ReadonlyArray<AudioEffectConfig>;
        readonly sends: Record<string, number>; // Send levels to buses
    }

    /**
     * Audio timing and synchronization
     */
    interface AudioTimingInfo {
        readonly audioTime: number; // AudioContext.currentTime
        readonly performanceTime: number; // performance.now()
        readonly latency: Milliseconds;
        readonly drift: Milliseconds;
        readonly sampleAccurate: boolean;
    }

    interface AudioSyncPoint {
        readonly audioTime: number;
        readonly gameTime: Milliseconds;
        readonly beatTime: number; // Musical beats
        readonly confidence: number; // 0-1
    }

    /**
     * Audio loading and caching
     */
    interface AudioLoadRequest {
        readonly url: string;
        readonly type: AudioSourceType;
        readonly priority: 'low' | 'normal' | 'high' | 'critical';
        readonly preload: boolean;
        readonly cacheable: boolean;
    }

    interface AudioLoadResponse extends BaseResult {
        readonly track?: AudioTrack;
        readonly loadTime?: Milliseconds;
        readonly fromCache: boolean;
    }

    interface AudioCache {
        readonly maxSize: number; // bytes
        readonly currentSize: number; // bytes
        readonly hitRate: number; // 0-1
        readonly tracks: ReadonlyArray<{
            readonly id: string;
            readonly size: number;
            readonly lastAccess: Date;
            readonly accessCount: number;
        }>;
    }

    /**
     * Audio analysis and detection
     */
    interface BeatDetectionResult {
        readonly bpm: BPM;
        readonly confidence: number; // 0-1
        readonly beats: ReadonlyArray<Seconds>;
        readonly measures: ReadonlyArray<Seconds>;
        readonly timeSignature: [number, number]; // e.g., [4, 4]
    }

    interface PitchDetectionResult {
        readonly frequency: number; // Hz
        readonly note: MusicalNote;
        readonly octave: number;
        readonly cents: number; // -50 to 50
        readonly confidence: number; // 0-1
    }

    interface OnsetDetectionResult {
        readonly onsets: ReadonlyArray<Seconds>;
        readonly confidence: ReadonlyArray<number>;
        readonly spectralFlux: ReadonlyArray<number>;
    }

    /**
     * Musical theory types
     */
    type MusicalNote = 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F' | 'F#' | 'G' | 'G#' | 'A' | 'A#' | 'B';
    type MusicalKey = `${MusicalNote}${'major' | 'minor'}`;

    interface MusicalScale {
        readonly key: MusicalKey;
        readonly notes: ReadonlyArray<MusicalNote>;
        readonly intervals: ReadonlyArray<number>; // Semitones
    }

    /**
     * Audio streaming
     */
    interface AudioStreamConfig {
        readonly chunkSize: number; // bytes
        readonly bufferLength: Milliseconds;
        readonly prebufferLength: Milliseconds;
        readonly maxRetries: number;
        readonly retryDelay: Milliseconds;
    }

    interface AudioStreamState {
        readonly isStreaming: boolean;
        readonly bufferedLength: Milliseconds;
        readonly bufferHealth: number; // 0-1
        readonly bandwidth: number; // bytes/second
        readonly dropouts: number;
        readonly quality: 'low' | 'medium' | 'high' | 'lossless';
    }

    /**
     * Audio recording
     */
    interface AudioRecordingConfig {
        readonly sampleRate: number;
        readonly channels: number;
        readonly bitDepth: 16 | 24 | 32;
        readonly format: 'wav' | 'mp3' | 'ogg';
        readonly quality: number; // 0-100 for lossy formats
        readonly maxDuration?: Seconds;
    }

    interface AudioRecordingState {
        readonly isRecording: boolean;
        readonly duration: Seconds;
        readonly size: number; // bytes
        readonly levels: ReadonlyArray<number>; // Per channel
        readonly clipping: boolean;
    }

    /**
     * Audio device management
     */
    interface AudioDevice {
        readonly id: string;
        readonly name: string;
        readonly type: 'input' | 'output';
        readonly channels: number;
        readonly sampleRates: ReadonlyArray<number>;
        readonly bufferSizes: ReadonlyArray<number>;
        readonly latency: Milliseconds;
        readonly isDefault: boolean;
        readonly isAvailable: boolean;
    }

    interface AudioDeviceConfig {
        readonly inputDevice?: AudioDevice;
        readonly outputDevice?: AudioDevice;
        readonly sampleRate: number;
        readonly bufferSize: number;
        readonly exclusiveMode: boolean; // WASAPI exclusive on Windows
    }

    /**
     * Audio error types
     */
    interface AudioError {
        readonly code: AudioErrorCode;
        readonly message: string;
        readonly category: 'INITIALIZATION' | 'PLAYBACK' | 'RECORDING' | 'PROCESSING' | 'DEVICE';
        readonly severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
        readonly recoverable: boolean;
        readonly context?: {
            readonly deviceId?: string;
            readonly trackId?: string;
            readonly operation?: string;
        };
    }

    type AudioErrorCode =
        | 'CONTEXT_CREATION_FAILED'
        | 'DECODE_ERROR'
        | 'DEVICE_NOT_FOUND'
        | 'BUFFER_UNDERRUN'
        | 'BUFFER_OVERRUN'
        | 'SAMPLE_RATE_MISMATCH'
        | 'CHANNEL_COUNT_MISMATCH'
        | 'UNSUPPORTED_FORMAT'
        | 'PERMISSION_DENIED'
        | 'NETWORK_ERROR'
        | 'CORRUPTED_DATA'
        | 'TIMEOUT'
        | 'OUT_OF_MEMORY';

    /**
     * Audio performance monitoring
     */
    interface AudioPerformanceMetrics {
        readonly timestamp: Milliseconds;
        readonly cpuUsage: number; // 0-100
        readonly memoryUsage: number; // bytes
        readonly latency: Milliseconds;
        readonly glitches: number;
        readonly underruns: number;
        readonly overruns: number;
        readonly activeNodes: number;
        readonly processing: {
            readonly audioWorkletLatency: Milliseconds;
            readonly scriptProcessorLatency: Milliseconds;
            readonly webAudioLatency: Milliseconds;
        };
    }
}

export { };
