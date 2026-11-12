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

async function testThinkingBudget(budget) {
  const imgBase64 = fs.readFileSync('eval/transcription/samples/sample_01.jpg').toString('base64');
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`;
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
      maxOutputTokens: 2048,
    }
  };
  if (budget !== undefined) {
    body.generationConfig.thinkingConfig = { thinkingBudget: budget };
  }

  const start = Date.now();
  console.log(`Sending call with thinkingBudget=${budget}...`);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const duration = Date.now() - start;
    const data = await res.json();
    if (data.error) {
      console.log(`Error (${duration}ms):`, data.error.message);
    } else {
      console.log(`Success in ${duration}ms!`);
      const candidate = data.candidates?.[0];
      console.log('Parts count:', candidate?.content?.parts?.length);
      console.log('Snippet:', candidate?.content?.parts?.[candidate.content.parts.length - 1]?.text?.substring(0, 100));
    }
  } catch (e) {
    console.error(`Exception (${Date.now() - start}ms):`, e.message);
  }
}

async function run() {
  await testThinkingBudget(0);
}
run();

