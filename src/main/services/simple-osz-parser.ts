/**
 * Simplified OSZ Parser - Stable version for reliable extraction
 * Focuses on core functionality with enhanced error handling
 */

import AdmZip from 'adm-zip';
import { existsSync } from 'fs';
import { extname, basename } from 'path';
import { logger } from '../../shared/globals/logger';

export interface SimpleOSZContent {
    id: string;
    title: string;
    artist: string;
    creator: string;
    audioFilename: string;
    backgroundImage?: string | undefined;
    bpm: number;
    duration: number;
    difficulties: string[];
}

export class SimpleOSZParser {
    /**
     * Parse OSZ file with basic functionality
     */
    static async parseOSZFile(filePath: string): Promise<SimpleOSZContent | null> {
        logger.info('osz', `🎵 Parsing OSZ file: ${basename(filePath)}`);

        try {
            // Check if file exists
            if (!existsSync(filePath)) {
                logger.error('osz', `❌ File not found: ${filePath}`);
                return null;
            }

            // Check file extension
            if (extname(filePath).toLowerCase() !== '.osz') {
                logger.error('osz', `❌ Invalid file extension: ${extname(filePath)}`);
                return null;
            }

            // Read and extract ZIP file
            logger.info('osz', '📦 Extracting ZIP archive...');
            const zip = new AdmZip(filePath);
            const entries = zip.getEntries();

            if (entries.length === 0) {
                logger.error('osz', '❌ Empty ZIP archive');
                return null;
            }

            logger.info('osz', `📁 Found ${entries.length} files in archive`);

            // Find .osu files (beatmap files)
            const beatmapFiles = entries.filter(entry =>
                entry.entryName.endsWith('.osu') && !entry.isDirectory
            );

            if (beatmapFiles.length === 0) {
                logger.error('osz', '❌ No beatmap (.osu) files found');
                return null;
            }

            logger.info('osz', `🎼 Found ${beatmapFiles.length} beatmap files`);

            // Parse the first beatmap file for metadata
            const primaryBeatmap = beatmapFiles[0];
            if (!primaryBeatmap) {
                logger.error('osz', '❌ No primary beatmap found');
                return null;
            }

            const beatmapContent = primaryBeatmap.getData().toString('utf8');

            logger.info('osz', `📝 Parsing primary beatmap: ${primaryBeatmap.entryName}`);

            // Extract metadata from beatmap content
            const metadata = this.extractBeatmapMetadata(beatmapContent);
            if (!metadata) {
                logger.error('osz', '❌ Failed to extract beatmap metadata');
                return null;
            }

            // Find audio file
            const audioFiles = entries.filter(entry =>
                this.isAudioFile(entry.entryName) && !entry.isDirectory
            );

            let audioFilename = metadata.audioFilename;
            if (audioFiles.length > 0 && !audioFilename && audioFiles[0]) {
                audioFilename = audioFiles[0].entryName;
                logger.info('osz', `🎵 Auto-detected audio file: ${audioFilename}`);
            }

            // Find background image
            const imageFiles = entries.filter(entry =>
                this.isImageFile(entry.entryName) && !entry.isDirectory
            );

            let backgroundImage: string | undefined;
            if (imageFiles.length > 0 && imageFiles[0]) {
                backgroundImage = imageFiles[0].entryName;
                logger.info('osz', `🖼️ Found background image: ${backgroundImage}`);
            }

            // Generate unique ID
            const id = this.generateId(metadata.title, metadata.artist);

            const result: SimpleOSZContent = {
                id,
                title: metadata.title,
                artist: metadata.artist,
                creator: metadata.creator,
                audioFilename: audioFilename || '',
                backgroundImage,
                bpm: metadata.bpm,
                duration: metadata.duration || 120000, // Default 2 minutes
                difficulties: beatmapFiles.map(f => basename(f.entryName, '.osu'))
            };

            logger.info('osz', `✅ Successfully parsed OSZ: ${result.title} by ${result.artist}`);
            return result;

        } catch (error) {
            logger.error('osz', '💥 OSZ parsing failed:', error);
            return null;
        }
    }

    /**
     * Extract metadata from beatmap content
     */
    private static extractBeatmapMetadata(content: string): {
        title: string;
        artist: string;
        creator: string;
        audioFilename: string;
        bpm: number;
        duration?: number;
    } | null {
        try {
            const lines = content.split('\n');
            let title = 'Unknown Title';
            let artist = 'Unknown Artist';
            let creator = 'Unknown Creator';
            let audioFilename = '';
            let bpm = 120;

            // Parse metadata sections
            let currentSection = '';
            for (const line of lines) {
                const trimmed = line.trim();

                // Check for section headers
                if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
                    currentSection = trimmed.toLowerCase();
                    continue;
                }

                // Parse metadata in [Metadata] section
                if (currentSection === '[metadata]') {
                    if (trimmed.startsWith('Title:')) {
                        title = trimmed.substring(6).trim();
                    } else if (trimmed.startsWith('Artist:')) {
                        artist = trimmed.substring(7).trim();
                    } else if (trimmed.startsWith('Creator:')) {
                        creator = trimmed.substring(8).trim();
                    }
                }

                // Parse general settings in [General] section
                if (currentSection === '[general]') {
                    if (trimmed.startsWith('AudioFilename:')) {
                        audioFilename = trimmed.substring(14).trim();
                    }
                }

                // Parse timing in [TimingPoints] section
                if (currentSection === '[timingpoints]' && trimmed.includes(',')) {
                    try {
                        const parts = trimmed.split(',');
                        if (parts.length >= 2 && parts[1]) {
                            const beatLength = parseFloat(parts[1]);
                            if (beatLength > 0) {
                                bpm = Math.round(60000 / beatLength);
                                break; // Use first timing point
                            }
                        }
                    } catch {
                        // Ignore timing point parsing errors
                    }
                }
            }

            return {
                title,
                artist,
                creator,
                audioFilename,
                bpm: Math.max(60, Math.min(300, bpm)) // Clamp BPM to reasonable range
            };

        } catch (error) {
            logger.error('osz', 'Failed to extract beatmap metadata:', error);
            return null;
        }
    }

    /**
     * Check if file is an audio file
     */
    private static isAudioFile(filename: string): boolean {
        const audioExts = ['.mp3', '.wav', '.ogg', '.m4a', '.flac'];
        return audioExts.includes(extname(filename).toLowerCase());
    }

    /**
     * Check if file is an image file
     */
    private static isImageFile(filename: string): boolean {
        const imageExts = ['.jpg', '.jpeg', '.png', '.bmp', '.gif'];
        return imageExts.includes(extname(filename).toLowerCase());
    }

    /**
     * Generate unique ID from title and artist
     */
    private static generateId(title: string, artist: string): string {
        const text = `${title}-${artist}`.toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
        return text + '-' + Date.now().toString(36);
    }

    /**
     * Extract specific file from OSZ
     */
    static extractFile(filePath: string, targetFilename: string): Buffer | null {
        try {
            if (!existsSync(filePath)) {
                return null;
            }

            const zip = new AdmZip(filePath);
            const entry = zip.getEntry(targetFilename);

            if (!entry || entry.isDirectory) {
                return null;
            }

            return entry.getData();

        } catch (error) {
            logger.error('osz', `Failed to extract file ${targetFilename}:`, error);
            return null;
        }
    }

    /**
     * List all files in OSZ
     */
    static listFiles(filePath: string): string[] {
        try {
            if (!existsSync(filePath)) {
                return [];
            }

            const zip = new AdmZip(filePath);
            return zip.getEntries()
                .filter(entry => !entry.isDirectory)
                .map(entry => entry.entryName);

        } catch (error) {
            logger.error('osz', 'Failed to list OSZ files:', error);
            return [];
        }
    }
}
