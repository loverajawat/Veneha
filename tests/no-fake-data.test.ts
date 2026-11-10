import fs from 'fs';
import path from 'path';

const FORBIDDEN_WORDS = [
  'Rohan',
  'Rewari',
  'Cold-Storage',
  'Rural Solar',
];

const SCAN_DIRS = ['src'];

function scanDirectory(dir: string, failures: string[]) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (
        entry.name === 'node_modules' ||
        entry.name === '.next' ||
        entry.name === '.git' ||
        entry.name === 'eval'
      ) {
        continue;
      }
      scanDirectory(fullPath, failures);
    } else if (
      entry.isFile() &&
      /\.(tsx?|jsx?|json|md)$/i.test(entry.name) &&
      !entry.name.includes('no-fake-data.test')
    ) {
      const content = fs.readFileSync(fullPath, 'utf8');
      for (const word of FORBIDDEN_WORDS) {
        // Exclude the regex patterns in geminiTranscriber that prevent these words from being generated
        if (
          fullPath.includes('geminiTranscriber.ts') &&
          (content.includes(`/${word.toLowerCase()}/i`) || content.includes(`FORBIDDEN_FAKE_PATTERNS`))
        ) {
          continue;
        }

        const lowerContent = content.toLowerCase();
        const lowerWord = word.toLowerCase();

        // Exact substring check
        if (lowerContent.includes(lowerWord)) {
          // If in comments or regex patterns in test files, skip
          const lines = content.split('\n');
          lines.forEach((line, idx) => {
            if (line.toLowerCase().includes(lowerWord) && !line.includes('FORBIDDEN') && !line.includes('//')) {
              failures.push(`${fullPath}:${idx + 1} - Found forbidden string "${word}": ${line.trim()}`);
            }
          });
        }
      }
    }
  }
}

function runTest() {
  console.log('Running test: no-fake-data.test.ts...');
  const failures: string[] = [];

  for (const dir of SCAN_DIRS) {
    if (fs.existsSync(dir)) {
      scanDirectory(dir, failures);
    }
  }

  if (failures.length > 0) {
    console.error('FAIL: Found forbidden fake strings in source files:');
    failures.forEach((f) => console.error(`  ${f}`));
    process.exit(1);
  } else {
    console.log('PASS: Clean! No simulated fake stories or strings found in src/.');
  }
}

runTest();

