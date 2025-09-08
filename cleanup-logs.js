#!/usr/bin/env node
// 🧹 Console.log cleanup script

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Files to process
const sourceFiles = [
  'src/renderer/components/**/*.{ts,tsx}',
  'src/renderer/hooks/*.{ts,tsx}',
  'src/main/**/*.ts'
];

// Patterns to remove (keep error logging)
const removePatterns = [
  /console\.log\([^)]*\);?\s*$/gm,
  /^\s*console\.log\([^)]*\);\s*$/gm,
];

// Critical patterns to keep
const keepPatterns = [
  /console\.error/,
  /console\.warn/,
  /logger\./
];

function cleanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  const cleanedLines = lines.filter(line => {
    // Keep error/warn logs
    if (keepPatterns.some(pattern => pattern.test(line))) {
      return true;
    }
    
    // Remove debug console.log
    if (/console\.log/.test(line)) {
      console.log(`Removing from ${filePath}: ${line.trim()}`);
      return false;
    }
    
    return true;
  });
  
  fs.writeFileSync(filePath, cleanedLines.join('\n'));
}

// Process all files
sourceFiles.forEach(pattern => {
  const files = glob.sync(pattern);
  files.forEach(cleanFile);
});

console.log('✅ Console.log cleanup completed!');
