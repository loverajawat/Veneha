const fs = require('fs');

let apiKey = '';
if (fs.existsSync('.env.local')) {
  const env = fs.readFileSync('.env.local', 'utf8');
  for (const line of env.split('\n')) {
    const m = line.match(/^\s*(?:GEMINI_API_KEY|GOOGLE_API_KEY)\s*=\s*(.*)?\s*$/);
    if (m && m[1]) {
      apiKey = m[1].replace(/^['"]|['"]$/g, '').trim();
      break;
    }
  }
}

async function testModelAvailability(modelName) {
  const imgBase64 = fs.readFileSync('eval/transcription/samples/sample_01.jpg').toString('base64');
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
  const prompt = `Transcribe the handwritten text from this image. Output only the story.`;
  const body = {
    contents: [
      {
        parts: [
          { inline_data: { mime_type: 'image/jpeg', data: imgBase64 } },
          { text: prompt }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 1024,
    }
  };

  const start = Date.now();
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const duration = Date.now() - start;
    const data = await res.json();
    if (data.error) {
      console.log(`[${modelName}] FAILED (${duration}ms) Status: ${res.status}: ${data.error.message.substring(0, 100)}`);
      return false;
    } else {
      console.log(`[${modelName}] SUCCESS in ${duration}ms!`);
      return true;
    }
  } catch (e) {
    console.error(`[${modelName}] Exception: ${e.message}`);
    return false;
  }
}

async function run() {
  const models = [
    'gemini-3.5-flash-lite',
    'gemini-flash-latest',
    'gemini-flash-lite-latest',
    'gemini-3.8-flash',
    'gemini-3.1-flash-lite',
    'gemini-3.5-flash',
  ];
  for (const m of models) {
    await testModelAvailability(m);
  }
}
run();

