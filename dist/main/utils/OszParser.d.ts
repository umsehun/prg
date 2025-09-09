/**
 * OszParser - Parses OSZ files (osu! beatmaps) for the Pin Rhythm Game
 */
import type { SongData } from '../../shared/d.ts/ipc';
export declare class OszParser {
    /**
     * Extract and parse an OSZ file
     */
    parseOszFile(oszPath: string, outputDir: string): Promise<SongData | null>;
    /**
     * Parse .osu file content
     */
    private parseOsuContent;
    /**
     * Parse a hit object line into note data
     */
    private parseHitObject;
    /**
     * Calculate difficulty levels based on note count and patterns
     */
    private calculateDifficulty;
    /**
     * Generate a unique ID for the song
     */
    private generateId;
    /**
     * Validate if a file is a valid OSZ file
     */
    isValidOszFile(filePath: string): Promise<boolean>;
}
export default OszParser;
//# sourceMappingURL=OszParser.d.ts.map