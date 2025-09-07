// Test script to check OSZ file parsing results
const path = require('path');
const fs = require('fs').promises;
const AdmZip = require('adm-zip');

async function testOszParsing() {
    const oszFiles = [
        'public/assets/ahoy/ahoy.osz',
        'public/assets/bad-apple/badapple.osz',
        'public/assets/Batsubyou/bot.osz'
    ];

    for (const oszPath of oszFiles) {
        try {
            console.log(`\n=== Testing ${oszPath} ===`);

            const fullPath = path.join(process.cwd(), oszPath);
            const exists = await fs.access(fullPath).then(() => true).catch(() => false);

            if (!exists) {
                console.log(`❌ File not found: ${fullPath}`);
                continue;
            }

            const zip = new AdmZip(fullPath);
            const entries = zip.getEntries();

            // Find .osu files
            const osuFiles = entries.filter(entry =>
                !entry.isDirectory &&
                path.extname(entry.entryName).toLowerCase() === '.osu'
            );

            console.log(`📁 OSZ contains ${entries.length} files total`);
            console.log(`🎵 Found ${osuFiles.length} .osu files`);

            for (const osuFile of osuFiles.slice(0, 2)) { // Check first 2 .osu files
                try {
                    const content = osuFile.getData().toString('utf8');
                    const lines = content.split('\n');

                    console.log(`\n  📄 ${osuFile.entryName}:`);

                    // Find mode line
                    const modeLine = lines.find(line => line.startsWith('Mode:'));
                    if (modeLine) {
                        const mode = parseInt(modeLine.split(':')[1].trim());
                        console.log(`    Mode: ${mode} (${getModeString(mode)})`);
                    } else {
                        console.log(`    Mode: Not specified (defaults to 0 - osu!)`);
                    }

                    // Find some basic info
                    const titleLine = lines.find(line => line.startsWith('Title:'));
                    if (titleLine) {
                        console.log(`    Title: ${titleLine.split(':')[1].trim()}`);
                    }

                    const artistLine = lines.find(line => line.startsWith('Artist:'));
                    if (artistLine) {
                        console.log(`    Artist: ${artistLine.split(':')[1].trim()}`);
                    }

                    const versionLine = lines.find(line => line.startsWith('Version:'));
                    if (versionLine) {
                        console.log(`    Version: ${versionLine.split(':')[1].trim()}`);
                    }

                } catch (err) {
                    console.log(`    ❌ Error parsing ${osuFile.entryName}: ${err.message}`);
                }
            }

        } catch (error) {
            console.log(`❌ Error processing ${oszPath}: ${error.message}`);
        }
    }
}

function getModeString(mode) {
    const modes = {
        0: 'osu! (standard)',
        1: 'Taiko',
        2: 'Catch the Beat',
        3: 'osu!mania'
    };
    return modes[mode] || 'Unknown';
}

testOszParsing().catch(console.error);
