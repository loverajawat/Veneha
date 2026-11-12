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

async function testSimple(modelName) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
  const start = Date.now();
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: 'Hello, respond with 1 word.' }] }]
    })
  });
  const data = await res.json();
  const duration = Date.now() - start;
  if (data.error) {
    console.log(`[${modelName}] Error (${res.status}): ${data.error.message.substring(0, 100)}`);
  } else {
    console.log(`[${modelName}] SUCCESS (${duration}ms):`, data.candidates?.[0]?.content?.parts?.[0]?.text?.trim());
  }
}

async function run() {
  const candidates = [
    'gemini-flash-latest',
    'gemini-flash-lite-latest',
    'gemini-3.5-flash',
    'gemini-3.5-flash-lite',
    'gemini-3.8-flash',
    'gemini-3.1-flash-lite',
  ];
  for (const m of candidates) {
    await testSimple(m);
  }
}
run();

