// src/main/core/ipcHandlers.ts
import { ipcMain, app } from 'electron';
import path from 'path';
import fs from 'fs/promises';
import { GameController } from '../game/GameController';
import { Settings, PinChart } from '../../shared/types';
import { discoverCharts } from '../services/chart-discovery';
import SettingsManager from './SettingsManager';
import { logger } from '../../shared/logger';
import { ChartImportService } from '../services/ChartImportService';
import { pathService } from '../services/PathService';

/**
 * Type guard to check if a string is a valid key of the Settings interface.
 * @param key The key to check.
 * @returns True if the key is a valid settings key, false otherwise.
 */
function isValidSettingsKey(key: string): key is keyof Settings {
  return ['noteSpeed'].includes(key);
}

/**
 * Registers all IPC event handlers for the application.
 */
export function registerIpcHandlers(): void {
  // Game-related events with handshake
  ipcMain.handle('startGame', async (_, chart: PinChart) => {
    const result = GameController.startGame(chart);
    if (!result.success) {
      logger.error('[IPC] Failed to start game:', result.error);
    }
    return result;
  });

  ipcMain.handle('stopGame', async () => {
    const result = GameController.stopGame();
    if (!result.success) {
      logger.error('[IPC] Failed to stop game:', result.error);
    }
    return result;
  });

  ipcMain.on('handle-pin-press', (_, currentTimeSec?: number) => {
    GameController.getInstance()?.handlePinPress(currentTimeSec);
  });

  // Chart import

  ipcMain.handle('discover-charts', async () => {
    return await discoverCharts();
  });

  ipcMain.handle('load-pin-chart', async (_, chartPath: string) => {
    try {
      console.log(`[PinChartLoader] Loading chart: ${chartPath}`);

      let filePath: string;

      // Handle custom protocol URIs (like media://)
      if (chartPath.includes('://')) {
        filePath = pathService.resolve(chartPath);
      } else {
        // Legacy handling for relative paths
        const sanitizedPath = chartPath.replace(/\.\./g, '');
        let basePath: string;

        if (app.isPackaged) {
          basePath = process.resourcesPath;
        } else {
          // app.getAppPath() returns /Users/user/prg/dist/main, we need to go up to project root
          basePath = path.join(app.getAppPath(), '..', '..');
        }

        filePath = path.join(basePath, 'public', sanitizedPath);
      }

      console.log(`[PinChartLoader] Full path: ${filePath}`);

      // Check if this is a .osu file that needs to be parsed from OSZ chart
      if (filePath.endsWith('.osu')) {
        // This is a .osu file from an OSZ chart, we need to find the corresponding OSZ chart
        // and convert it to PinChart using ChartImportService

        // Extract chart ID from the media:// URI (e.g., "media://Wolpis-Carter-Batsubyou/file.osu" -> "Wolpis-Carter-Batsubyou")
        if (chartPath.startsWith('media://')) {
          const chartId = chartPath.split('/')[2]; // Get the chart ID part

          const importService = ChartImportService.getInstance();
          const library = await importService.getLibrary();

          // Find the OSZ chart by ID
          const oszChart = library.find(chart => chart.id === chartId);
          if (!oszChart) {
            throw new Error(`OSZ chart not found for id: ${chartId}`);
          }

          // Find the difficulty index for this specific .osu file
          const osuFileName = path.basename(filePath);
          const difficultyIndex = oszChart.difficulties.findIndex(diff => {
            if (!diff.filePath) return false;
            const diffFileName = path.basename(pathService.resolve(diff.filePath));
            return diffFileName === osuFileName;
          });

          if (difficultyIndex === -1) {
            throw new Error(`Difficulty not found for file: ${osuFileName}`);
          }

          console.log(`[PinChartLoader] Converting OSZ chart ${chartId}, difficulty ${difficultyIndex}`);
          const pinChart = await importService.convertDifficultyToPinChart(oszChart, difficultyIndex);
          console.log(`[PinChartLoader] Successfully converted OSZ chart: ${chartPath}`);
          return pinChart;
        } else {
          throw new Error(`Cannot parse .osu file without proper media:// URI: ${chartPath}`);
        }
      } else {
        // This is a legacy JSON chart file
        const data = await fs.readFile(filePath, 'utf-8');
        const pinChart: PinChart = {
          id: `${chartPath}-${path.basename(filePath)}`, // Create a unique ID for this specific difficulty
          ...JSON.parse(data),
        };
        console.log(`[PinChartLoader] Successfully loaded JSON chart: ${chartPath}`);
        return pinChart;
      }
    } catch (error) {
      console.error(`[PinChartLoader] Failed to load pin chart at ${chartPath}:`, error);
      return null;
    }
  });

  // File dialog
  ipcMain.handle('show-open-dialog', async (_, options: any) => {
    const { dialog } = require('electron');
    return await dialog.showOpenDialog(options);
  });

  // .osz file import (moved to OSZ Import handlers section below)

  ipcMain.handle('get-chart-library', async () => {
    return await ChartImportService.getInstance().getLibrary();
  });

  // convert-difficulty-to-chart handler removed - duplicate functionality with convert-difficulty-to-pin-chart

  ipcMain.handle('remove-chart-from-library', async (_, chartId: string) => {
    return await ChartImportService.getInstance().removeFromLibrary(chartId);
  });

  // OSZ 차트를 PinChart로 변환하는 새 IPC 핸들러
  ipcMain.handle('convert-osz-to-pin-chart', async (_, chartMetadata: any, difficultyIndex?: number) => {
    try {
      const importService = ChartImportService.getInstance();
      const library = await importService.getLibrary();

      console.log(`[Debug] Looking for chart with ID: ${chartMetadata.id}`);
      console.log(`[Debug] Available chart IDs:`, library.map(c => c.id));

      // chartMetadata.id로 OSZ 차트 찾기 (정확한 매칭)
      const oszChart = library.find(chart => chart.id === chartMetadata.id);

      if (!oszChart) {
        throw new Error(`OSZ chart not found for id: ${chartMetadata.id}. Available IDs: ${library.map(c => c.id).join(', ')}`);
      }

      // 사용 가능한 난이도 중 첫 번째 유효한 것 선택
      console.log(`[Debug] Chart has ${oszChart.difficulties.length} difficulties`);

      let pinChart = null;

      // Use specified difficulty index or try all difficulties
      if (difficultyIndex !== undefined && difficultyIndex >= 0 && difficultyIndex < oszChart.difficulties.length) {
        console.log(`[Debug] Converting specified difficulty ${difficultyIndex}: ${oszChart.difficulties[difficultyIndex]?.name || 'Unnamed'}`);
        try {
          pinChart = await importService.convertDifficultyToPinChart(oszChart, difficultyIndex);
          console.log(`[Debug] Successfully converted specified difficulty ${difficultyIndex}`);
        } catch (error) {
          console.error(`[Debug] Failed to convert specified difficulty ${difficultyIndex}:`, error);
          throw error; // Don't fallback if user specifically selected a difficulty
        }
      } else {
        // Try converting all difficulties until one succeeds (fallback behavior)
        for (let i = 0; i < oszChart.difficulties.length; i++) {
          console.log(`[Debug] Attempting to convert difficulty ${i}/${oszChart.difficulties.length - 1}: ${oszChart.difficulties[i]?.name || 'Unnamed'}`);
          try {
            pinChart = await importService.convertDifficultyToPinChart(oszChart, i);
            console.log(`[Debug] Successfully converted difficulty ${i}`);
            break; // Success! Exit the loop
          } catch (error) {
            console.error(`[Debug] Failed to convert difficulty ${i}:`, error);
            // Continue to next difficulty
          }
        }
      }

      if (!pinChart) {
        throw new Error(`Failed to convert any difficulty.`);
      }

      // GameScene에서 비디오를 로드할 수 있도록 videoPath를 PinChart에 포함시킵니다.
      if (chartMetadata.videoPath) {
        pinChart.videoPath = chartMetadata.videoPath;
      }

      return pinChart;
    } catch (error) {
      console.error('Failed to convert OSZ to PinChart:', error);
      throw error;
    }
  });

  // Asset loading handlers
  ipcMain.handle('load-asset', async (_, assetUri: string) => {
    try {
      const fullPath = pathService.resolve(assetUri);
      const data = await fs.readFile(fullPath);
      console.log(`[AssetLoader] Successfully loaded asset: ${assetUri} -> ${fullPath}`);
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.warn(`[AssetLoader] Asset not found, using fallback: ${assetUri}`, errorMessage);
      
      // Create a silent audio buffer for missing sound files
      if (assetUri.includes('.wav') || assetUri.includes('.mp3') || assetUri.includes('.ogg')) {
        // Return a minimal WAV header for silent audio (44 bytes + minimal data)
        const silentWav = Buffer.from([
          0x52, 0x49, 0x46, 0x46, // "RIFF"
          0x24, 0x00, 0x00, 0x00, // File size - 8
          0x57, 0x41, 0x56, 0x45, // "WAVE"
          0x66, 0x6D, 0x74, 0x20, // "fmt "
          0x10, 0x00, 0x00, 0x00, // Subchunk1Size
          0x01, 0x00,             // AudioFormat (PCM)
          0x01, 0x00,             // NumChannels (1)
          0x44, 0xAC, 0x00, 0x00, // SampleRate (44100)
          0x44, 0xAC, 0x00, 0x00, // ByteRate
          0x01, 0x00,             // BlockAlign
          0x08, 0x00,             // BitsPerSample (8)
          0x64, 0x61, 0x74, 0x61, // "data"
          0x00, 0x00, 0x00, 0x00  // Subchunk2Size (0 = silence)
        ]);
        console.log(`[AssetLoader] Returning silent audio buffer for: ${assetUri}`);
        return silentWav;
      }
      
      // For other file types, still throw error
      throw new Error(`Asset not found: ${assetUri}`);
    }
  });

  ipcMain.handle('asset-exists', async (_, assetUri: string) => {
    try {
      const fullPath = pathService.resolve(assetUri);
      await fs.access(fullPath);
      return true;
    } catch {
      return false;
    }
  });

  // OSZ Import handlers (get-chart-library handler removed - duplicate of line 78)

  ipcMain.handle('select-osz-file', async () => {
    const { dialog } = require('electron');
    const result = await dialog.showOpenDialog({
      title: 'Select .osz file',
      filters: [
        { name: 'osu! Beatmap', extensions: ['osz'] }
      ],
      properties: ['openFile']
    });

    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }

    return result.filePaths[0];
  });

  ipcMain.handle('import-osz-file', async (_, filePath: string) => {
    try {
      return await ChartImportService.getInstance().importOszFile(filePath);
    } catch (error) {
      console.error('Failed to import OSZ file:', error);
      throw error;
    }
  });

  ipcMain.handle('convert-difficulty-to-pin-chart', async (_, oszChart: any, difficultyIndex: number) => {
    try {
      return await ChartImportService.getInstance().convertDifficultyToPinChart(oszChart, difficultyIndex);
    } catch (error) {
      console.error('Failed to convert difficulty to pin chart:', error);
      throw error;
    }
  });

  // Settings-related events
  ipcMain.handle('getSetting', async (_, key: string) => {
    if (!isValidSettingsKey(key)) {
      throw new Error(`Invalid settings key received: ${key}`);
    }
    return SettingsManager.get(key);
  });

  ipcMain.on('setSetting', (_, key: string, value: unknown) => {
    if (!isValidSettingsKey(key)) {
      console.error(`Invalid settings key received: ${key}`);
      return;
    }
    // A simple type check for the value. This could be more robust.
    if (key === 'noteSpeed' && typeof value !== 'number') {
      console.error(`Invalid value type for ${key}: expected number, got ${typeof value}`);
      return;
    }

    // The key is now guaranteed to be keyof Settings, and value has been checked.
    void SettingsManager.set(key, value as Settings[keyof Settings]);
  });

  // Chart auto-import handler
  ipcMain.handle('import-all-osz-files', async (_, assetsPath?: string) => {
    try {
      // Use default public/assets path if not provided
      const defaultAssetsPath = path.join(app.getAppPath(), '..', '..', 'public', 'assets');
      const targetPath = assetsPath || defaultAssetsPath;

      console.log(`[IPC] Starting batch OSZ import from: ${targetPath}`);

      const chartImportService = ChartImportService.getInstance();
      const result = await chartImportService.importAllFromDirectory(targetPath);

      console.log(`[IPC] Batch import completed: ${result.imported} imported, ${result.skipped} skipped`);

      return result;
    } catch (error) {
      console.error('[IPC] Failed to import OSZ files:', error);
      throw error;
    }
  });
}
