#!/usr/bin/env node
/*
  scripts/osu-to-json.js
  Converts an .osu beatmap into a simplified JSON for the Pin Game.
  Uses `osu-parsers` library for proper .osu file parsing.

  Usage:
    node scripts/osu-to-json.js --in path/to/file.osu --out public/assets/<song>/pin-chart.json [--title "Bad Apple!!"] [--artist "Masayoshi Minoshima ft. nomico"] [--bpm 138]

  Output JSON shape:
    {
      "title": string,
      "artist": string,
      "bpm": number | null,
      "audioFilename": string,
      "notes": [{ "time": number }...]
    }
*/
const fs = require('fs');
const path = require('path');

function readArgs() {
  const args = process.argv.slice(2);
  const out = {};
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--in') out.in = args[++i];
    else if (a === '--out') out.out = args[++i];
    else if (a === '--title') out.title = args[++i];
    else if (a === '--artist') out.artist = args[++i];
    else if (a === '--bpm') out.bpm = Number(args[++i]);
  }
  if (!out.in || !out.out) {
    console.error('Usage: node scripts/osu-to-json.js --in <file.osu> --out <output.json> [--title <title>] [--artist <artist>] [--bpm <bpm>]');
    process.exit(1);
  }
  return out;
}

async function parseWithOsuParsers(filePath) {
  try {
    const { BeatmapDecoder } = require('osu-parsers');
    const decoder = new BeatmapDecoder();
    // Asynchronously parse the beatmap from the file path
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
    process.exit(1);
  }
}

(async function main() {
  const args = readArgs();
  const inPath = path.resolve(process.cwd(), args.in);
  const outPath = path.resolve(process.cwd(), args.out);

  if (!fs.existsSync(inPath)) {
    console.error(`Input .osu not found: ${inPath}`);
    process.exit(1);
  }

  const parsed = await parseWithOsuParsers(inPath);

  const result = {
    title: args.title || parsed.title || 'Unknown Title',
    artist: args.artist || parsed.artist || 'Unknown Artist',
    audioFilename: parsed.audioFilename,
    bpm: Number.isFinite(args.bpm) ? args.bpm : parsed.bpm,
    notes: parsed.notes.sort((a, b) => a.time - b.time),
  };

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(result, null, 2));

  console.log(`✅ Wrote JSON: ${outPath}`);
  console.log(`   title="${result.title}" artist="${result.artist}" audioFilename="${result.audioFilename}"`);
  console.log(`   bpm=${result.bpm} notes=${result.notes.length}`);
  console.log(`   첫 번째 노트: time=${result.notes[0]?.time}`);
  console.log(`   마지막 노트: time=${result.notes[result.notes.length-1]?.time}`);
})();
