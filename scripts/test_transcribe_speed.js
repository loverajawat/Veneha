const fs = require('fs');
const path = require('path');

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

async function testTranscriptionSpeed(modelName) {
  const samplePath = path.join(process.cwd(), 'eval/transcription/samples/sample_01.jpg');
  const imgBase64 = fs.readFileSync(samplePath).toString('base64');
  
  const systemPrompt = `You are a fast PPDT handwriting transcription engine.
Copy the handwritten text exactly as written.
CRITICAL FORMAT RULES:
1. SPATIAL BOX SEPARATION: PPDT sheets contain a small character box on the top-right / right side (with details like Age, Gender, Mood, e.g. M/22/+ or dots) and an Action/Title heading.
   - You MUST put all text/characters from the right-side box and the Action/Title into "box_and_heading".
   - You MUST completely exclude the character box and Action/Title from "story_text".
2. STORY TEXT: "story_text" must contain ONLY the candidate's actual narrative story lines.
3. Crossed-out or scribbled words must be ignored.
4. If words are hard to read, write [?word?] or [illegible]. Never invent text.

Respond ONLY with valid JSON in this exact structure:
{
  "readability": "good" | "fair" | "poor",
  "box_and_heading": "extracted box and title text",
  "story_text": "clean story text without any box details",
  "unclear_count": 0
}`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
  const body = {
    contents: [
      {
        parts: [
          { text: systemPrompt },
          { inline_data: { mime_type: 'image/jpeg', data: imgBase64 } },
          { text: "Transcribe this PPDT sheet now." }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.1,
      responseMimeType: "application/json",
      maxOutputTokens: 2048,
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
    console.log(`[${modelName}] Status: ${res.status}, Time: ${duration}ms`);
    const data = await res.json();
    if (data.error) {
      console.log(`[${modelName}] Error:`, data.error.message);
    } else {
      const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;
      const parsed = JSON.parse(raw);
      console.log(`[${modelName}] Box & Heading:`, parsed.box_and_heading);
      console.log(`[${modelName}] Story snippet (first 100 chars):`, parsed.story_text?.substring(0, 100));
      return duration;
    }
  } catch (err) {
    console.error(`[${modelName}] Exception:`, err.message);
  }
}

async function run() {
  console.log('Testing model speeds for transcription...');
  await testTranscriptionSpeed('gemini-3.5-flash');
  await testTranscriptionSpeed('gemini-3.5-flash-lite');
  await testTranscriptionSpeed('gemini-3.8-flash');
}
run();

