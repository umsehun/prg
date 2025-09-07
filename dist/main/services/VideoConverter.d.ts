export declare class VideoConverter {
    /**
     * Convert a video file to MP4 format
     * @param inputPath - Path to the input video file
     * @param outputPath - Path where the converted MP4 file should be saved
     * @returns Promise<boolean> - True if conversion successful, false otherwise
     */
    static convertToMp4(inputPath: string, outputPath: string): Promise<boolean>;
    /**
     * Check if a video file needs conversion to MP4
     * @param videoPath - Path to the video file
     * @returns boolean - True if conversion is needed
     */
    static needsConversion(videoPath: string): boolean;
    /**
     * Get the MP4 equivalent path for a video file
     * @param videoPath - Original video file path
     * @returns string - Path where the MP4 version should be stored
     */
    static getMp4Path(videoPath: string): string;
    /**
     * Convert video file to MP4 if needed, return the MP4 path
     * @param videoPath - Original video file path
     * @returns Promise<string | null> - Path to MP4 file or null if conversion failed
     */
    static ensureMp4(videoPath: string): Promise<string | null>;
}
//# sourceMappingURL=VideoConverter.d.ts.map