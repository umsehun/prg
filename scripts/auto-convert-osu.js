#!/usr/bin/env node
/*
  scripts/auto-convert-osu.js
  Automatically converts .osu files to JSON format when JSON files are missing.
  Scans the public/assets directory and converts any .osu files that don't have corresponding JSON files.
  
  Usage:
    node scripts/auto-convert-osu.js
*/

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ASSETS_DIR = path.resolve(process.cwd(), 'public/assets');

async function parseWithOsuParsers(filePath) {
  try {
    const { BeatmapDecoder } = require('osu-parsers');
    const decoder = new BeatmapDecoder();
    const beatmap = await decoder.decodeFromPath(filePath, false);

    const title = beatmap.metadata?.titleUnicode || beatmap.metadata?.title || null;
    const artist = beatmap.metadata?.artistUnicode || beatmap.metadata?.artist || null;
    const audioFilename = beatmap.general?.audioFilename || null;

    if (!audioFilename) {
      throw new Error('AudioFilename not found in .osu file.');
    }

    const notes = beatmap.hitObjects?.map(hitObject => ({
      time: hitObject.startTime,
    })).filter(note => !isNaN(note.time)) || [];

    if (notes.length === 0) {
      throw new Error('No hit objects found in the beatmap.');
    }

    let bpm = null;
    if (beatmap.controlPoints?.timingPoints?.length > 0) {
      const firstTimingPoint = beatmap.controlPoints.timingPoints[0];
      if (firstTimingPoint.beatLength > 0) {
        bpm = Math.round(60000 / firstTimingPoint.beatLength);
      }
    }

    return { title, artist, audioFilename, bpm, notes };
  } catch (error) {
    console.error(`❌ Failed to parse .osu file with osu-parsers: ${filePath}`);
    console.error(error.message);
    return null;
  }
}

function findOsuFiles(dir) {
  const osuFiles = [];
  
  if (!fs.existsSync(dir)) {
    console.log(`Assets directory not found: ${dir}`);
    return osuFiles;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      // Check if this subdirectory has .osu files
      const subEntries = fs.readdirSync(fullPath);
      const hasOsuFile = subEntries.some(file => file.endsWith('.osu'));
      const hasJsonFile = subEntries.some(file => file.endsWith('.json'));
      
      if (hasOsuFile && !hasJsonFile) {
        const osuFile = subEntries.find(file => file.endsWith('.osu'));
        osuFiles.push({
          osuPath: path.join(fullPath, osuFile),
          jsonPath: path.join(fullPath, 'pin-chart.json'),
          directory: entry.name
        });
      }
    }
  }
  
  return osuFiles;
}

async function convertOsuToJson(osuPath, jsonPath, directory) {
  console.log(`🔄 Converting ${directory}/${path.basename(osuPath)} to JSON...`);
  
  const parsed = await parseWithOsuParsers(osuPath);
  if (!parsed) {
    console.error(`❌ Failed to parse ${osuPath}`);
    return false;
  }

  const result = {
    title: parsed.title || directory,
    artist: parsed.artist || 'Unknown Artist',
    audioFilename: parsed.audioFilename,
    bpm: parsed.bpm,
    notes: parsed.notes.sort((a, b) => a.time - b.time),
  };

  try {
    fs.writeFileSync(jsonPath, JSON.stringify(result, null, 2));
    console.log(`✅ Created ${jsonPath}`);
    console.log(`   title="${result.title}" artist="${result.artist}" audioFilename="${result.audioFilename}"`);
    console.log(`   bpm=${result.bpm} notes=${result.notes.length}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to write JSON file: ${jsonPath}`);
    console.error(error.message);
    return false;
  }
}

async function main() {
  console.log('🔍 Scanning for .osu files that need conversion...');
  
  const osuFiles = findOsuFiles(ASSETS_DIR);
  
  if (osuFiles.length === 0) {
    console.log('✅ No .osu files need conversion. All directories have JSON files or no .osu files.');
    return;
  }

  console.log(`📁 Found ${osuFiles.length} .osu file(s) that need conversion:`);
  osuFiles.forEach(file => {
    console.log(`   - ${file.directory}/${path.basename(file.osuPath)}`);
  });

  let successCount = 0;
  for (const file of osuFiles) {
    const success = await convertOsuToJson(file.osuPath, file.jsonPath, file.directory);
    if (success) successCount++;
  }

  console.log(`\n🎉 Conversion complete! ${successCount}/${osuFiles.length} files converted successfully.`);
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Auto-conversion failed:', error);
    process.exit(1);
  });
}

module.exports = { findOsuFiles, convertOsuToJson };
