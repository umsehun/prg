"use strict";
/**
 * Simplified OSZ Parser - Stable version for reliable extraction
 * Focuses on core functionality with enhanced error handling
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpleOSZParser = void 0;
const adm_zip_1 = __importDefault(require("adm-zip"));
const fs_1 = require("fs");
const path_1 = require("path");
const logger_1 = require("../../shared/globals/logger");
class SimpleOSZParser {
    /**
     * Parse OSZ file with basic functionality
     */
    static async parseOSZFile(filePath) {
        logger_1.logger.info('osz', `🎵 Parsing OSZ file: ${(0, path_1.basename)(filePath)}`);
        try {
            // Check if file exists
            if (!(0, fs_1.existsSync)(filePath)) {
                logger_1.logger.error('osz', `❌ File not found: ${filePath}`);
                return null;
            }
            // Check file extension
            if ((0, path_1.extname)(filePath).toLowerCase() !== '.osz') {
                logger_1.logger.error('osz', `❌ Invalid file extension: ${(0, path_1.extname)(filePath)}`);
                return null;
            }
            // Read and extract ZIP file
            logger_1.logger.info('osz', '📦 Extracting ZIP archive...');
            const zip = new adm_zip_1.default(filePath);
            const entries = zip.getEntries();
            if (entries.length === 0) {
                logger_1.logger.error('osz', '❌ Empty ZIP archive');
                return null;
            }
            logger_1.logger.info('osz', `📁 Found ${entries.length} files in archive`);
            // Find .osu files (beatmap files)
            const beatmapFiles = entries.filter(entry => entry.entryName.endsWith('.osu') && !entry.isDirectory);
            if (beatmapFiles.length === 0) {
                logger_1.logger.error('osz', '❌ No beatmap (.osu) files found');
                return null;
            }
            logger_1.logger.info('osz', `🎼 Found ${beatmapFiles.length} beatmap files`);
            // Parse the first beatmap file for metadata
            const primaryBeatmap = beatmapFiles[0];
            if (!primaryBeatmap) {
                logger_1.logger.error('osz', '❌ No primary beatmap found');
                return null;
            }
            const beatmapContent = primaryBeatmap.getData().toString('utf8');
            logger_1.logger.info('osz', `📝 Parsing primary beatmap: ${primaryBeatmap.entryName}`);
            // Extract metadata from beatmap content
            const metadata = this.extractBeatmapMetadata(beatmapContent);
            if (!metadata) {
                logger_1.logger.error('osz', '❌ Failed to extract beatmap metadata');
                return null;
            }
            // Find audio file
            const audioFiles = entries.filter(entry => this.isAudioFile(entry.entryName) && !entry.isDirectory);
            let audioFilename = metadata.audioFilename;
            if (audioFiles.length > 0 && !audioFilename && audioFiles[0]) {
                audioFilename = audioFiles[0].entryName;
                logger_1.logger.info('osz', `🎵 Auto-detected audio file: ${audioFilename}`);
            }
            // Find background image
            const imageFiles = entries.filter(entry => this.isImageFile(entry.entryName) && !entry.isDirectory);
            let backgroundImage;
            if (imageFiles.length > 0 && imageFiles[0]) {
                backgroundImage = imageFiles[0].entryName;
                logger_1.logger.info('osz', `🖼️ Found background image: ${backgroundImage}`);
            }
            // Generate unique ID
            const id = this.generateId(metadata.title, metadata.artist);
            const result = {
                id,
                title: metadata.title,
                artist: metadata.artist,
                creator: metadata.creator,
                audioFilename: audioFilename || '',
                backgroundImage,
                bpm: metadata.bpm,
                duration: metadata.duration || 120000, // Default 2 minutes
                difficulties: beatmapFiles.map(f => (0, path_1.basename)(f.entryName, '.osu'))
            };
            logger_1.logger.info('osz', `✅ Successfully parsed OSZ: ${result.title} by ${result.artist}`);
            return result;
        }
        catch (error) {
            logger_1.logger.error('osz', '💥 OSZ parsing failed:', error);
            return null;
        }
    }
    /**
     * Extract metadata from beatmap content
     */
    static extractBeatmapMetadata(content) {
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
                    }
                    else if (trimmed.startsWith('Artist:')) {
                        artist = trimmed.substring(7).trim();
                    }
                    else if (trimmed.startsWith('Creator:')) {
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
                    }
                    catch {
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
        }
        catch (error) {
            logger_1.logger.error('osz', 'Failed to extract beatmap metadata:', error);
            return null;
        }
    }
    /**
     * Check if file is an audio file
     */
    static isAudioFile(filename) {
        const audioExts = ['.mp3', '.wav', '.ogg', '.m4a', '.flac'];
        return audioExts.includes((0, path_1.extname)(filename).toLowerCase());
    }
    /**
     * Check if file is an image file
     */
    static isImageFile(filename) {
        const imageExts = ['.jpg', '.jpeg', '.png', '.bmp', '.gif'];
        return imageExts.includes((0, path_1.extname)(filename).toLowerCase());
    }
    /**
     * Generate unique ID from title and artist
     */
    static generateId(title, artist) {
        const text = `${title}-${artist}`.toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
        return text + '-' + Date.now().toString(36);
    }
    /**
     * Extract specific file from OSZ
     */
    static extractFile(filePath, targetFilename) {
        try {
            if (!(0, fs_1.existsSync)(filePath)) {
                return null;
            }
            const zip = new adm_zip_1.default(filePath);
            const entry = zip.getEntry(targetFilename);
            if (!entry || entry.isDirectory) {
                return null;
            }
            return entry.getData();
        }
        catch (error) {
            logger_1.logger.error('osz', `Failed to extract file ${targetFilename}:`, error);
            return null;
        }
    }
    /**
     * List all files in OSZ
     */
    static listFiles(filePath) {
        try {
            if (!(0, fs_1.existsSync)(filePath)) {
                return [];
            }
            const zip = new adm_zip_1.default(filePath);
            return zip.getEntries()
                .filter(entry => !entry.isDirectory)
                .map(entry => entry.entryName);
        }
        catch (error) {
            logger_1.logger.error('osz', 'Failed to list OSZ files:', error);
            return [];
        }
    }
}
exports.SimpleOSZParser = SimpleOSZParser;
