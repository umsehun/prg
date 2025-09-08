// Debug script to test chart discovery
const fs = require('fs');
const path = require('path');

// Mock app.getPath('userData')
const userDataPath = path.join(require('os').homedir(), 'Library', 'Application Support', 'prg');
const libraryPath = path.join(userDataPath, 'library.json');

console.log('🔍 Debug Chart Discovery');
console.log('📁 Library path:', libraryPath);

try {
    const data = fs.readFileSync(libraryPath, 'utf8');
    const library = JSON.parse(data);

    console.log('📊 Library file stats:');
    console.log('   Total charts:', library.length);
    console.log('   Chart IDs:');

    library.forEach((chart, index) => {
        console.log(`   ${index + 1}. ${chart.id}`);
        console.log(`      Title: ${chart.title}`);
        console.log(`      Artist: ${chart.artist}`);
        console.log(`      Difficulties: ${chart.difficulties.length}`);
        console.log('');
    });

    // Test the conversion logic
    console.log('🔄 Converting to ChartMetadata format...');
    const chartMetadata = library.map(chart => ({
        id: chart.id,
        title: chart.title,
        artist: chart.artist,
        musicPath: chart.audioFilename,
        chartPath: chart.difficulties[0]?.filePath || '',
        bannerPath: chart.backgroundFilename,
        videoPath: chart.videoPath,
        gameMode: 'pin',
        oszMetadata: {
            creator: chart.creator,
            audioFilename: chart.audioFilename,
            backgroundFilename: chart.backgroundFilename,
            difficulties: chart.difficulties,
            folderPath: chart.folderPath,
            mode: chart.mode
        }
    }));

    console.log('✅ Converted chartMetadata count:', chartMetadata.length);
    console.log('');

    chartMetadata.forEach((meta, index) => {
        console.log(`${index + 1}. ${meta.id}`);
    });

} catch (error) {
    console.error('❌ Error:', error.message);
}
