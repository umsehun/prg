// src/main/services/RuntimeOsuParser.ts
import { promises as fs } from 'fs';
import path from 'path';
import { BeatmapDecoder } from 'osu-parsers';
import type { Beatmap } from 'osu-classes';
import { logger } from '../../shared/globals/logger';

export interface RuntimeNote {
    time: number;
    type: 'tap' | 'hold' | 'slider';
    position?: { x: number; y: number };
    duration?: number;
}

export interface DifficultyInfo {
    name: string;
    filename: string;
    starRating: number;
    difficultyName: string;
}

export interface AudioVideoFiles {
    audioFile: string | null;
    videoFile: string | null;
    backgroundFile: string | null;
}

/**
 * Runtime .osu file parser for loading chart data during game
 */
export class RuntimeOsuParser {

    /**
     * Get available difficulties for a chart directory
     */
    public async getDifficulties(chartDirPath: string): Promise<DifficultyInfo[]> {
        try {
            const files = await fs.readdir(chartDirPath);
            const osuFiles = files.filter(file => file.endsWith('.osu'));
            const difficulties: DifficultyInfo[] = [];

            for (const osuFile of osuFiles) {
                const osuPath = path.join(chartDirPath, osuFile);
                const beatmap = await this.parseBeatmapMetadata(osuPath);

                if (beatmap) {
                    difficulties.push({
                        name: beatmap.metadata.version || path.basename(osuFile, '.osu'),
                        filename: osuFile,
                        starRating: beatmap.difficulty.overallDifficulty || 5,
                        difficultyName: beatmap.metadata.version || 'Normal'
                    });
                }
            }

            // Sort by difficulty (star rating)
            return difficulties.sort((a, b) => a.starRating - b.starRating);

        } catch (error) {
            logger.error('runtime-osu-parser', `Failed to get difficulties for ${chartDirPath}: ${error}`);
            return [];
        }
    }

    /**
     * Parse notes from specific .osu file
     */
    public async parseNotesFromOsu(chartDirPath: string, osuFilename: string): Promise<RuntimeNote[]> {
        try {
            const osuPath = path.join(chartDirPath, osuFilename);
            const beatmap = await this.parseBeatmap(osuPath);

            if (!beatmap) {
                logger.error('runtime-osu-parser', `Failed to parse beatmap: ${osuPath}`);
                return [];
            }

            const notes: RuntimeNote[] = [];

            // Convert hit objects to notes
            for (const hitObject of beatmap.hitObjects) {
                const note: RuntimeNote = {
                    time: hitObject.startTime,
                    type: this.getHitObjectType(hitObject),
                    position: {
                        x: hitObject.startPosition.x,
                        y: hitObject.startPosition.y
                    }
                };

                // For hold notes (sliders), check if it has duration
                if ('endTime' in hitObject && typeof hitObject.endTime === 'number' && hitObject.endTime > hitObject.startTime) {
                    note.duration = hitObject.endTime - hitObject.startTime;
                }

                notes.push(note);
            }

            // Sort by time
            notes.sort((a, b) => a.time - b.time);

            logger.info('runtime-osu-parser', `Parsed ${notes.length} notes from ${osuFilename}`);
            return notes;

        } catch (error) {
            logger.error('runtime-osu-parser', `Failed to parse notes from ${osuFilename}: ${error}`);
            return [];
        }
    }

    /**
     * Get chart info including available difficulties
     */
    public async getChartInfo(chartDirPath: string, preferredDifficulty?: string): Promise<{
        difficulties: DifficultyInfo[];
        selectedDifficulty: DifficultyInfo | null;
        notes: RuntimeNote[];
        audioVideoFiles: AudioVideoFiles;
    }> {
        const difficulties = await this.getDifficulties(chartDirPath);

        if (difficulties.length === 0) {
            return {
                difficulties: [],
                selectedDifficulty: null,
                notes: [],
                audioVideoFiles: { audioFile: null, videoFile: null, backgroundFile: null }
            };
        }

        // Select difficulty
        let selectedDifficulty: DifficultyInfo | null = difficulties[0] || null; // Default to first (easiest)

        if (preferredDifficulty && selectedDifficulty) {
            const found = difficulties.find(d =>
                d.name.toLowerCase().includes(preferredDifficulty.toLowerCase()) ||
                d.difficultyName.toLowerCase().includes(preferredDifficulty.toLowerCase())
            );
            if (found) selectedDifficulty = found;
        }

        // Parse notes for selected difficulty
        const notes = selectedDifficulty
            ? await this.parseNotesFromOsu(chartDirPath, selectedDifficulty.filename)
            : [];

        // Get audio/video files
        const audioVideoFiles = await this.getAudioVideoFiles(chartDirPath, selectedDifficulty?.filename);

        return {
            difficulties,
            selectedDifficulty,
            notes,
            audioVideoFiles
        };
    }

    /**
     * Parse beatmap metadata only (faster than full parse)
     */
    private async parseBeatmapMetadata(osuPath: string): Promise<Beatmap | null> {
        try {
            const content = await fs.readFile(osuPath, 'utf-8');
            const decoder = new BeatmapDecoder();
            const beatmap = decoder.decodeFromString(content);
            return beatmap;
        } catch (error) {
            logger.debug('runtime-osu-parser', `Failed to parse beatmap metadata: ${osuPath}`);
            return null;
        }
    }

    /**
     * Parse full beatmap with hit objects
     */
    private async parseBeatmap(osuPath: string): Promise<Beatmap | null> {
        try {
            const content = await fs.readFile(osuPath, 'utf-8');
            const decoder = new BeatmapDecoder();
            const beatmap = decoder.decodeFromString(content);
            return beatmap;
        } catch (error) {
            logger.debug('runtime-osu-parser', `Failed to parse beatmap: ${osuPath}`);
            return null;
        }
    }

    /**
     * Determine hit object type for our game
     */
    private getHitObjectType(hitObject: any): 'tap' | 'hold' | 'slider' {
        // Simple mapping - you can make this more sophisticated
        if ('endTime' in hitObject && typeof hitObject.endTime === 'number' && hitObject.endTime > hitObject.startTime + 100) {
            return 'hold';
        }
        if ('type' in hitObject && hitObject.type && hitObject.type.toString().includes('slider')) {
            return 'slider';
        }
        return 'tap';
    }

    /**
     * Get audio and video files from chart directory
     */
    public async getAudioVideoFiles(chartDirPath: string, osuFilename?: string): Promise<AudioVideoFiles> {
        try {
            const files = await fs.readdir(chartDirPath);
            let audioFile: string | null = null;
            let videoFile: string | null = null;
            let backgroundFile: string | null = null;

            // If we have an osu file, try to read the AudioFilename from it
            if (osuFilename) {
                const audioFromOsu = await this.getAudioFilenameFromOsu(chartDirPath, osuFilename);
                if (audioFromOsu && files.includes(audioFromOsu)) {
                    audioFile = path.join(chartDirPath, audioFromOsu);
                }
            }

            // Fallback: search for common audio file patterns
            if (!audioFile) {
                const audioExtensions = ['.mp3', '.ogg', '.wav', '.m4a'];
                const commonAudioNames = ['audio', 'song', 'music'];

                for (const file of files) {
                    const ext = path.extname(file).toLowerCase();
                    const baseName = path.basename(file, ext).toLowerCase();

                    if (audioExtensions.includes(ext)) {
                        // Prioritize common names
                        if (commonAudioNames.includes(baseName)) {
                            audioFile = path.join(chartDirPath, file);
                            break;
                        }
                        // Otherwise use the first audio file we find
                        if (!audioFile) {
                            audioFile = path.join(chartDirPath, file);
                        }
                    }
                }
            }

            // Find video file
            const videoExtensions = ['.mp4', '.avi', '.mkv', '.webm'];
            for (const file of files) {
                const ext = path.extname(file).toLowerCase();
                if (videoExtensions.includes(ext)) {
                    videoFile = path.join(chartDirPath, file);
                    break; // Use first video file found
                }
            }

            // Find background image
            const imageExtensions = ['.jpg', '.jpeg', '.png', '.bmp'];
            for (const file of files) {
                const ext = path.extname(file).toLowerCase();
                const baseName = path.basename(file, ext).toLowerCase();
                if (imageExtensions.includes(ext)) {
                    // Prefer files with "bg", "background" in name
                    if (baseName.includes('bg') || baseName.includes('background')) {
                        backgroundFile = path.join(chartDirPath, file);
                        break;
                    }
                    // Otherwise use first image
                    if (!backgroundFile) {
                        backgroundFile = path.join(chartDirPath, file);
                    }
                }
            }

            logger.info('runtime-osu-parser', `Found media files in ${path.basename(chartDirPath)}:`, {
                audio: audioFile ? path.basename(audioFile) : null,
                video: videoFile ? path.basename(videoFile) : null,
                background: backgroundFile ? path.basename(backgroundFile) : null
            });

            return { audioFile, videoFile, backgroundFile };

        } catch (error) {
            logger.error('runtime-osu-parser', `Failed to get media files for ${chartDirPath}: ${error}`);
            return { audioFile: null, videoFile: null, backgroundFile: null };
        }
    }

    /**
     * Extract AudioFilename from .osu file
     */
    private async getAudioFilenameFromOsu(chartDirPath: string, osuFilename: string): Promise<string | null> {
        try {
            const osuPath = path.join(chartDirPath, osuFilename);
            const content = await fs.readFile(osuPath, 'utf-8');

            // Find AudioFilename line
            const lines = content.split('\n');
            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed.startsWith('AudioFilename:')) {
                    const filename = trimmed.substring('AudioFilename:'.length).trim();
                    return filename;
                }
            }

            return null;
        } catch (error) {
            logger.debug('runtime-osu-parser', `Failed to read AudioFilename from ${osuFilename}: ${error}`);
            return null;
        }
    }
}
