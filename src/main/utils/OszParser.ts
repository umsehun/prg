/**
 * OszParser - Parses OSZ files (osu! beatmaps) for the Pin Rhythm Game
 */

import { promises as fs } from 'fs';
import { join, extname, basename } from 'path';
import * as yauzl from 'yauzl';
import { logger } from '../../shared/globals/logger';
import type { SongData, NoteData } from '../../shared/d.ts/ipc';

export class OszParser {

    /**
     * Extract and parse an OSZ file
     */
    public async parseOszFile(oszPath: string, outputDir: string): Promise<SongData | null> {
        try {
            logger.debug('osz-parser', `Parsing OSZ file: ${oszPath}`);

            // Create output directory
            await fs.mkdir(outputDir, { recursive: true });

            return new Promise((resolve, reject) => {
                yauzl.open(oszPath, { lazyEntries: true }, (err, zipfile) => {
                    if (err) {
                        logger.error('osz-parser', `Failed to open OSZ: ${err}`);
                        reject(err);
                        return;
                    }

                    if (!zipfile) {
                        reject(new Error('Failed to open zipfile'));
                        return;
                    }

                    let songData: Partial<SongData> = {
                        id: this.generateId(oszPath),
                        filePath: outputDir,
                        notes: []
                    };

                    let osuFileContent = '';
                    const extractedFiles: string[] = [];

                    zipfile.readEntry();

                    zipfile.on('entry', (entry) => {
                        const fileName = entry.fileName;

                        // Skip directories
                        if (fileName.endsWith('/')) {
                            zipfile.readEntry();
                            return;
                        }

                        const outputPath = join(outputDir, basename(fileName));

                        zipfile.openReadStream(entry, (streamErr, readStream) => {
                            if (streamErr) {
                                logger.error('osz-parser', `Error reading ${fileName}: ${streamErr}`);
                                zipfile.readEntry();
                                return;
                            }

                            if (!readStream) {
                                zipfile.readEntry();
                                return;
                            }

                            // Handle .osu files (beatmap data)
                            if (fileName.endsWith('.osu')) {
                                let content = '';
                                readStream.on('data', (chunk) => {
                                    content += chunk.toString('utf8');
                                });
                                readStream.on('end', () => {
                                    osuFileContent = content;
                                    extractedFiles.push(fileName);
                                    zipfile.readEntry();
                                });
                            } else {
                                // Extract other files (audio, images)
                                const writeStream = require('fs').createWriteStream(outputPath);
                                readStream.pipe(writeStream);
                                writeStream.on('close', () => {
                                    extractedFiles.push(fileName);

                                    // Detect file types
                                    const ext = extname(fileName).toLowerCase();
                                    if (['.mp3', '.ogg', '.wav'].includes(ext)) {
                                        songData.audioFile = outputPath;
                                    } else if (['.jpg', '.jpeg', '.png', '.bmp'].includes(ext) && !songData.backgroundImage) {
                                        songData.backgroundImage = outputPath;
                                    }

                                    zipfile.readEntry();
                                });
                            }
                        });
                    });

                    zipfile.on('end', async () => {
                        try {
                            if (osuFileContent) {
                                const parsedData = this.parseOsuContent(osuFileContent);
                                songData = { ...songData, ...parsedData };
                            }

                            // Validate required fields
                            if (!songData.title || !songData.artist) {
                                logger.warn('osz-parser', 'Missing required song metadata');
                                resolve(null);
                                return;
                            }

                            const finalSongData: SongData = {
                                id: songData.id!,
                                title: songData.title,
                                artist: songData.artist,
                                audioFile: songData.audioFile || '',
                                backgroundImage: songData.backgroundImage || '',
                                difficulty: songData.difficulty || { easy: 1, normal: 3, hard: 5, expert: 7 },
                                bpm: songData.bpm || 120,
                                duration: songData.duration || 180,
                                filePath: outputDir,
                                notes: songData.notes || []
                            };

                            logger.info('osz-parser', `Successfully parsed: ${finalSongData.title} by ${finalSongData.artist}`);
                            resolve(finalSongData);
                        } catch (parseError) {
                            logger.error('osz-parser', `Error finalizing song data: ${parseError}`);
                            resolve(null);
                        }
                    });

                    zipfile.on('error', (zipErr) => {
                        logger.error('osz-parser', `ZIP file error: ${zipErr}`);
                        reject(zipErr);
                    });
                });
            });
        } catch (error) {
            logger.error('osz-parser', `OSZ parsing failed: ${error}`);
            return null;
        }
    }

    /**
     * Parse .osu file content
     */
    private parseOsuContent(content: string): Partial<SongData> {
        const lines = content.split('\n').map(line => line.trim());
        const data: Partial<SongData> = {
            notes: []
        };

        let currentSection = '';
        let timingPoints: Array<{ time: number; bpm: number }> = [];

        for (const line of lines) {
            if (line.startsWith('[') && line.endsWith(']')) {
                currentSection = line.slice(1, -1);
                continue;
            }

            if (line.includes(':')) {
                const [key, value] = line.split(':', 2).map(s => s.trim());

                switch (key) {
                    case 'Title':
                        if (value) data.title = value;
                        break;
                    case 'Artist':
                        if (value) data.artist = value;
                        break;
                    case 'AudioFilename':
                        // Audio file will be set during extraction
                        break;
                }
            }

            // Parse timing points for BPM
            if (currentSection === 'TimingPoints' && line.includes(',')) {
                const parts = line.split(',');
                if (parts.length >= 2 && parts[0] && parts[1]) {
                    const time = parseInt(parts[0]);
                    const beatLength = parseFloat(parts[1]);
                    if (beatLength > 0) {
                        const bpm = Math.round(60000 / beatLength);
                        timingPoints.push({ time, bpm });
                    }
                }
            }

            // Parse hit objects (notes)
            if (currentSection === 'HitObjects' && line.includes(',')) {
                const note = this.parseHitObject(line);
                if (note) {
                    data.notes!.push(note);
                }
            }
        }

        // Calculate average BPM
        if (timingPoints.length > 0) {
            data.bpm = Math.round(timingPoints.reduce((sum, tp) => sum + tp.bpm, 0) / timingPoints.length);
        }

        // Estimate difficulty based on note density
        const noteCount = data.notes?.length || 0;
        data.difficulty = this.calculateDifficulty(noteCount);

        // Estimate duration (rough calculation based on last note time)
        if (data.notes && data.notes.length > 0) {
            const lastNoteTime = Math.max(...data.notes.map(n => n.time));
            data.duration = Math.ceil(lastNoteTime / 1000) + 5; // Add 5 seconds buffer
        }

        return data;
    }

    /**
     * Parse a hit object line into note data
     */
    private parseHitObject(line: string): NoteData | null {
        const parts = line.split(',');
        if (parts.length < 4 || !parts[0] || !parts[2]) return null;

        // const x = parseInt(parts[0]); // x 좌표는 현재 사용하지 않음
        const time = parseInt(parts[2]);

        // Convert osu! coordinates to our game's lane system (4 lanes)
        // const lane = Math.floor((x / 512) * 4); // Unused for now

        return {
            time,
            type: 'tap' // Default to tap notes for now
        };
    }

    /**
     * Calculate difficulty levels based on note count and patterns
     */
    private calculateDifficulty(noteCount: number): SongData['difficulty'] {
        // Simple difficulty calculation based on note density
        const baseEasy = Math.max(1, Math.min(3, Math.floor(noteCount / 200)));
        const baseNormal = Math.max(2, Math.min(5, Math.floor(noteCount / 150)));
        const baseHard = Math.max(4, Math.min(7, Math.floor(noteCount / 100)));
        const baseExpert = Math.max(6, Math.min(10, Math.floor(noteCount / 80)));

        return {
            easy: baseEasy,
            normal: baseNormal,
            hard: baseHard,
            expert: baseExpert
        };
    }

    /**
     * Generate a unique ID for the song
     */
    private generateId(filePath: string): string {
        const fileName = basename(filePath, '.osz');
        const timestamp = Date.now();
        return `${fileName}-${timestamp}`.replace(/[^a-zA-Z0-9-]/g, '-');
    }

    /**
     * Validate if a file is a valid OSZ file
     */
    public async isValidOszFile(filePath: string): Promise<boolean> {
        try {
            const ext = extname(filePath).toLowerCase();
            if (ext !== '.osz') return false;

            const stats = await fs.stat(filePath);
            return stats.isFile() && stats.size > 0;
        } catch {
            return false;
        }
    }
}

export default OszParser;
