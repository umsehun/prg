/**
 * Video converter service - converts all video formats to MP4 using ffmpeg
 */
export declare class VideoConverter {
    private static readonly SUPPORTED_VIDEO_FORMATS;
    /**
     * Check if ffmpeg is available on the system
     */
    static checkFfmpegAvailable(): Promise<boolean>;
    /**
     * Convert a video file to MP4 format using ffmpeg
     */
    static convertToMp4(inputPath: string, outputPath: string): Promise<boolean>;
    /**
     * Check if video format is supported for conversion
     */
    static isSupportedVideoFormat(filePath: string): boolean;
    /**
     * Check if video needs conversion
     */
    static needsConversion(videoPath: string): boolean;
    /**
     * Get MP4 path for a video file
     */
    static getMp4Path(videoPath: string): string;
    /**
     * Ensure MP4 version exists for all supported video formats
     */
    static ensureMp4(videoPath: string): Promise<string | null>;
}
//# sourceMappingURL=VideoConverter.d.ts.map