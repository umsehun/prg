/**
 * MediaConverter - Handles audio and video format conversions
 */
export declare class MediaConverter {
    private static instance;
    static getInstance(): MediaConverter;
    /**
     * Convert audio file to MP3 format
     */
    convertToMp3(inputPath: string, outputPath: string): Promise<boolean>;
    /**
     * Convert video file to MP4 format
     */
    convertToMp4(inputPath: string, outputPath: string): Promise<boolean>;
    /**
     * Check if file is a supported audio format
     */
    isSupportedAudioFormat(filePath: string): boolean;
    /**
     * Check if file is a supported video format
     */
    isSupportedVideoFormat(filePath: string): boolean;
    /**
     * Convert audio file to MP3 if needed
     */
    ensureMp3(inputPath: string, outputDir: string): Promise<string>;
    /**
     * Convert video file to MP4 if needed
     */
    ensureMp4(inputPath: string, outputDir: string): Promise<string>;
    /**
     * Get media file duration in seconds
     */
    getMediaDuration(filePath: string): Promise<number>;
    /**
     * Get audio file BPM (if available in metadata)
     */
    getAudioBPM(filePath: string): Promise<number | null>;
}
//# sourceMappingURL=MediaConverter.d.ts.map