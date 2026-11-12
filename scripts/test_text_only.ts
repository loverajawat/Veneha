import fs from 'fs';
import path from 'path';

let apiKey = '';
if (fs.existsSync('.env.local')) {
  const env = fs.readFileSync('.env.local', 'utf8');
  for (const line of env.split('\n')) {
    const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (m && m[1]) {
      process.env[m[1]] = m[2]?.replace(/^['"]|['"]$/g, '').trim();
      if (m[1] === 'GEMINI_API_KEY' || m[1] === 'GOOGLE_API_KEY') {
        apiKey = process.env[m[1]] || '';
      }
    }
  }
}

async function testTextOnly(modelName) {
  console.log(`Testing text-only call to ${modelName}...`);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
  const start = Date.now();
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: 'Evaluate this SSB PPDT story: Vikram, 23, saved the village crops from a sudden windstorm by tying down the tarpaulin with local youths. Give 2 strengths and 2 weaknesses in JSON format.' }]
        }
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        maxOutputTokens: 1024
      }
    })
  });
  const duration = Date.now() - start;
  const data = await res.json();
  if (data.error) {
    console.log(`[${modelName}] FAILED (${duration}ms) Status: ${res.status}: ${data.error.message}`);
  } else {
    console.log(`[${modelName}] SUCCESS in ${duration}ms! Result:`, data.candidates?.[0]?.content?.parts?.[0]?.text?.substring(0, 120));
  }
}

async function run() {
  await testTextOnly('gemini-3.1-flash-lite');
  await testTextOnly('gemini-3.5-flash-lite');
  await testTextOnly('gemini-3.5-flash');
}
run();

