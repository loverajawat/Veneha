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

async function testFastModel(modelName) {
  const imgBase64 = fs.readFileSync('eval/transcription/samples/sample_01.jpg').toString('base64');
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
  const prompt = `Transcribe the handwritten story text from this image verbatim.
Do NOT include the character box on the right / top.
Output only the story text.`;
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
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const duration = Date.now() - start;
  console.log(`[${modelName}] Status: ${res.status}, Time: ${duration}ms`);
  const data = await res.json();
  if (data.error) {
    console.error(`[${modelName}] Error:`, data.error.message);
  } else {
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log(`[${modelName}] Output:\n${text}`);
  }
}

async function run() {
  await testFastModel('gemini-2.5-flash');
}
run();

