/**
 * DirectoryOszExtractor - 새로운 아키텍처
 * OSZ 파일을 디렉토리로 압축해제하고 .osu 파일을 게임용으로 수정
 */
export interface ChartMetadata {
    id: string;
    title: string;
    artist: string;
    creator: string;
    bpm: number;
    duration: number;
    osuFiles: string[];
    audioFile?: string | null;
    backgroundFile?: string | null;
    videoFile?: string | null;
    filePath: string;
}
export declare class DirectoryOszExtractor {
    private decoder;
    private mediaConverter;
    constructor();
    /**
     * OSZ 파일을 디렉토리로 압축해제하고 게임용으로 수정
     */
    extractOsz(oszPath: string, outputDir: string): Promise<ChartMetadata>;
    /**
     * ZIP 파일을 디렉토리로 압축해제
     */
    private extractZipToDirectory;
    /**
     * .osu 파일들을 찾아서 게임용으로 수정 (x,y 제거)
     */
    private modifyOsuFiles;
    /**
     * .osu 파일의 [HitObjects] 섹션에서 x,y 좌표 제거
     * 예: 256,192,1000,1,0 → 1000,1,0
     */
    private modifyOsuFile;
    /**
     * 미디어 파일들 변환 (MP3, MP4)
     */
    private convertMediaFiles;
    /**
     * 첫 번째 .osu 파일에서 메타데이터 추출
     */
    private extractMetadata;
    private calculateBPM;
    private calculateDuration;
    private findBackgroundFile;
}
//# sourceMappingURL=DirectoryOszExtractor.d.ts.map