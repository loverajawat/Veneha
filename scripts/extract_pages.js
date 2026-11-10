const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8');
let apiKey = '';
for (const line of env.split('\n')) {
  const m = line.match(/^\s*(?:GEMINI_API_KEY|GOOGLE_API_KEY)\s*=\s*(.*)?\s*$/);
  if (m) apiKey = m[1].replace(/^['"]|['"]$/g, '').trim();
}

console.log('API key length:', apiKey.length);

async function extractRange(startPage, endPage, filename) {
  console.log(`Extracting pages ${startPage} to ${endPage}...`);
  // Render pages using python to images
  const { execSync } = require('child_process');
  execSync(`python -c "import fitz; doc=fitz.open('C:/Users/HP/.gemini/antigravity/brain/843e3650-5f40-4911-991f-1f036a6f9b77/.user_uploaded/media_1794201696628_931247b4.pdf'); [p.get_pixmap(dpi=150).save(f'scripts/temp_page_{i+1}.jpg') for i, p in enumerate(doc) if i+1 >= ${startPage} and i+1 <= ${endPage}]"`);

  const parts = [
    {
      text: 'Transcribe all text on these pages verbatim into markdown. Do not summarize or skip anything. Pay special attention to code blocks, TypeScript types, schemas, and prompts. Output every character as written.'
    }
  ];

  for (let i = startPage; i <= endPage; i++) {
    const imgBuf = fs.readFileSync(`scripts/temp_page_${i}.jpg`);
    parts.push({ text: `--- PAGE ${i} ---` });
    parts.push({
      inline_data: {
        mime_type: 'image/jpeg',
        data: imgBuf.toString('base64')
      }
    });
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;
  const payload = {
    contents: [{ parts }],
    generationConfig: { maxOutputTokens: 8192 }
  };

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const err = await res.text();
    console.error(`Error for pages ${startPage}-${endPage}:`, res.status, err);
    return;
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  fs.writeFileSync(`C:/Users/HP/.gemini/antigravity/brain/843e3650-5f40-4911-991f-1f036a6f9b77/${filename}`, text, 'utf8');
  console.log(`Saved ${filename}, length: ${text.length}`);
}

async function run() {
  await extractRange(14, 17, 'appendix_a.md');
  await extractRange(6, 9, 'schema_and_rules.md');
  await extractRange(1, 5, 'steps_1_to_5.md');
  await extractRange(10, 13, 'steps_7_to_11.md');
  console.log('All extractions complete!');
}

run().catch(console.error);

