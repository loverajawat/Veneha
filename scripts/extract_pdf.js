const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8');
let apiKey = '';
for (const line of env.split('\n')) {
  const m = line.match(/^\s*(?:GEMINI_API_KEY|GOOGLE_API_KEY)\s*=\s*(.*)?\s*$/);
  if (m) apiKey = m[1].replace(/^['"]|['"]$/g, '').trim();
}

console.log('API key found, length:', apiKey.length);

async function extract() {
  const pdfBuffer = fs.readFileSync('C:/Users/HP/.gemini/antigravity/brain/843e3650-5f40-4911-991f-1f036a6f9b77/.user_uploaded/media_1794201696628_931247b4.pdf');
  const base64Data = pdfBuffer.toString('base64');
  console.log('PDF Base64 size (KB):', Math.round(base64Data.length / 1024));

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;

  const payload = {
    contents: [
      {
        parts: [
          {
            text: `You are an expert document OCR engine. Transcribe every single page of the attached PDF document into complete markdown.
Do NOT summarize. Do NOT skip anything.
Ensure all code blocks, type definitions, schemas, prompt templates, and especially Appendix A (the owner's fixed prompt on pages 14-17) and Section 6 (the TypeScript schema on pages 7-8) are reproduced VERBATIM with 100% exact wording.`
          },
          {
            inline_data: {
              mime_type: 'application/pdf',
              data: base64Data
            }
          }
        ]
      }
    ],
    generationConfig: {
      maxOutputTokens: 8192
    }
  };

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('Gemini error:', res.status, err);
    return;
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    console.error('Empty response from Gemini:', JSON.stringify(data));
    return;
  }

  fs.writeFileSync('C:/Users/HP/.gemini/antigravity/brain/843e3650-5f40-4911-991f-1f036a6f9b77/full_pdf_extracted.md', text, 'utf8');
  console.log('Successfully extracted full PDF, character count:', text.length);
}

extract().catch(e => console.error(e));
