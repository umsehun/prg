const fs = require('fs');
const path = require('path');
const assetDir = path.resolve(process.cwd(), 'public/assets/bad-apple');
const smPath = path.join(assetDir, 'Bad Apple!! feat. nomico.sm');
const outputPath = path.join(assetDir, 'bad-apple.json');

if (!fs.existsSync(smPath)) {
  console.error(`SM file not found at: ${smPath}`);
  process.exit(1);
}

const smContent = fs.readFileSync(smPath, 'utf-8');

function parseSm(content) {
  const data = { NOTES: [] };
  const lines = content.split(';');

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('#NOTES')) {
      const parts = trimmedLine.split(':');
      if (parts.length < 6) continue;

      const measures = parts.slice(5).join(':').trim();
      const notesData = {
        type: parts[1].trim(),
        difficulty: parts[2].trim(),
        level: parseInt(parts[3].trim(), 10),
        measures: measures.split(',').map(m => m.trim()).flatMap(m => m.split('\n')).map(l => l.trim()).filter(l => l.length > 0)
      };
      data.NOTES.push(notesData);
      continue;
    }

    const match = /^#([A-Z0-9]+):([^;]*)/.exec(trimmedLine);
    if (match) {
      data[match[1]] = match[2].trim();
    }
  }

  return data;
}

try {
  const smData = parseSm(smContent);

  const bpmsArray = (smData.BPMS || '').split(',').filter(s => s.includes('='));

  const jsonData = {
    title: smData.TITLE || '',
    artist: smData.ARTIST || '',
    banner: smData.BANNER || '',
    background: smData.BACKGROUND || '',
    cdtitle: smData.CDTITLE || '',
    music: smData.MUSIC || '',
    offset: parseFloat(smData.OFFSET || '0'),
    sampleStart: parseFloat(smData.SAMPLESTART || '0'),
    sampleLength: parseFloat(smData.SAMPLELENGTH || '10'),
    displayBPM: smData.DISPLAYBPM || '',
    bpms: bpmsArray.map((bpmEntry) => {
      const [beat, bpm] = bpmEntry.split('=');
      return { beat: parseFloat(beat), bpm: parseFloat(bpm) };
    }),
    notes: smData.NOTES,
  };

  fs.writeFileSync(outputPath, JSON.stringify(jsonData, null, 2));
  console.log(`✅ Chart successfully converted to JSON at: ${outputPath}`);
} catch (error) {
  console.error('Failed to parse SM file:', error);
  process.exit(1);
}

