const fs = require('fs');
const path = require('path');

const osuPath = path.join(__dirname, '../public/assets/bad-apple/bad-apple.osu');
console.log('Reading file:', osuPath);
console.log('File exists:', fs.existsSync(osuPath));

const content = fs.readFileSync(osuPath, 'utf8');
console.log('File size:', content.length, 'chars');

const lines = content.split(/\r?\n/);
console.log('Total lines:', lines.length);

let inHit = false;
let inMetadata = false;
let inGeneral = false;
const notes = [];
let title = null;
let artist = null;
let audioFilename = null;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  
  if (line.startsWith('[') && line.endsWith(']')) {
    inHit = (line === '[HitObjects]');
    inMetadata = (line === '[Metadata]');
    inGeneral = (line === '[General]');
    if (inHit) console.log('Found HitObjects section at line', i + 1);
    if (inMetadata) console.log('Found Metadata section at line', i + 1);
    if (inGeneral) console.log('Found General section at line', i + 1);
    continue;
  }
  
  if (inGeneral && line.includes('AudioFilename')) {
    audioFilename = line.split(':')[1]?.trim();
    console.log('Audio filename:', audioFilename);
  }
  
  if (inMetadata) {
    if (line.startsWith('Title:')) title = line.split(':')[1]?.trim();
    if (line.startsWith('Artist:')) artist = line.split(':')[1]?.trim();
  }
  
  if (inHit && line && !line.startsWith('//')) {
    const parts = line.split(',');
    if (parts.length >= 3) {
      const t = Number(parts[2]);
      if (!isNaN(t)) {
        notes.push({ time: t });
        if (notes.length <= 3) console.log('Note', notes.length + ':', t, 'from:', line.substring(0, 30) + '...');
      }
    }
  }
}

console.log('=== RESULTS ===');
console.log('Title:', title);
console.log('Artist:', artist);
console.log('Audio:', audioFilename);
console.log('Total notes found:', notes.length);
if (notes.length > 0) {
  console.log('First note time:', notes[0].time);
  console.log('Last note time:', notes[notes.length - 1].time);
}
