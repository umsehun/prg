declare class PathService {
    private static instance;
    private constructor();
    static getInstance(): PathService;
    /**
     * Resolves a custom protocol URI to an absolute file path.
     * @param uri The URI to resolve (e.g., 'user://charts/song/audio.mp3')
     * @returns The absolute file path.
     */
    resolve(uri: string): string;
    /**
     * Converts a custom protocol URI or path to a file:// URL for renderer use.
     * @param uri The URI to convert (e.g., 'media://chart-id/audio.mp3')
     * @returns A file:// URL that can be used directly in the renderer
     */
    getAssetUrl(uri: string): string;
}
export declare const pathService: PathService;
export {};
//# sourceMappingURL=PathService.d.ts.map