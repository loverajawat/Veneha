import fs from 'fs';
import path from 'path';
import { GeminiTranscriber } from '../src/lib/transcriber/geminiTranscriber';

// Load environment
if (fs.existsSync('.env.local')) {
  const env = fs.readFileSync('.env.local', 'utf8');
  for (const line of env.split('\n')) {
    const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (m && m[1]) {
      process.env[m[1]] = m[2]?.replace(/^['"]|['"]$/g, '').trim();
    }
  }
}

async function verify() {
  console.log('Testing GeminiTranscriber with sample_01.jpg...');
  const transcriber = new GeminiTranscriber();
  const samplePath = path.join(process.cwd(), 'eval/transcription/samples/sample_01.jpg');
  const buffer = fs.readFileSync(samplePath);

  const start = Date.now();
  const result = await transcriber.transcribe([
    {
      base64: buffer.toString('base64'),
      mimeType: 'image/jpeg',
      pageNumber: 1,
    }
  ]);
  const duration = Date.now() - start;

  console.log(`\nTranscription completed in ${duration}ms!`);
  console.log('\n--- EXTRACTED BOX & HEADING (Should have character box + title) ---');
  console.log(result.box_and_heading || '(Empty)');
  console.log('\n--- CLEAN STORY TEXT (Should NOT have character box) ---');
  console.log(result.story_text);
  console.log('\n--- COMBINED TRANSCRIPT ---');
  console.log(result.combined_transcript);

  // Assertions
  const boxLeaksInStory = /\[box:/i.test(result.story_text) || /Action:/i.test(result.story_text);
  console.log('\n--- VERIFICATION RESULT ---');
  if (boxLeaksInStory) {
    console.error('❌ FAIL: Box or Action leaked into story_text!');
  } else {
    console.log('✅ PASS: Story text is completely clean and box is successfully separated!');
  }
}

verify().catch(err => {
  console.error('Error during verification:', err);
});

