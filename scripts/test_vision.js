const fs = require('fs');

let apiKey = process.env.GOOGLE_VISION_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
if (!apiKey && fs.existsSync('.env.local')) {
  const env = fs.readFileSync('.env.local', 'utf8');
  for (const line of env.split('\n')) {
    const m = line.match(/^\s*(?:GOOGLE_VISION_API_KEY|GEMINI_API_KEY|GOOGLE_API_KEY)\s*=\s*(.*)?\s*$/);
    if (m && m[1]) {
      apiKey = m[1].replace(/^['"]|['"]$/g, '').trim();
      break;
    }
  }
}

console.log('Testing with API key prefix:', apiKey ? apiKey.substring(0, 10) + '...' : 'none');

async function testVision() {
  const imgBase64 = fs.readFileSync('eval/transcription/samples/sample_01.jpg').toString('base64');
  const url = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;
  const body = {
    requests: [
      {
        image: { content: imgBase64 },
        features: [{ type: 'DOCUMENT_TEXT_DETECTION' }]
      }
    ]
  };
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  console.log('HTTP Status:', res.status);
  const data = await res.json();
  if (data.error) {
    console.error('API Error:', JSON.stringify(data.error, null, 2));
  } else {
    const fullText = data.responses?.[0]?.fullTextAnnotation?.text;
    console.log('Full text detected:\n---');
    console.log(fullText);
    console.log('---\nBlocks count:', data.responses?.[0]?.fullTextAnnotation?.pages?.[0]?.blocks?.length);
  }
}

testVision().catch(err => console.error(err));

