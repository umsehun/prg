/**
 * Video converter service - currently disabled
 * TODO: Re-implement when fluent-ffmpeg type issues are resolved
 */
export declare class VideoConverter {
    /**
     * Convert a video file to MP4 format
     * Currently disabled - using original video files directly
     */
    static convertToMp4(inputPath: string, outputPath: string): Promise<boolean>;
    /**
     * Check if video needs conversion (always false for now)
     */
    static needsConversion(videoPath: string): boolean;
    /**
     * Get MP4 path for a video file
     */
    static getMp4Path(videoPath: string): string;
    /**
     * Ensure MP4 version exists (currently returns original path)
     */
    static ensureMp4(videoPath: string): Promise<string | null>;
}
//# sourceMappingURL=VideoConverter.d.ts.map