const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8');
let apiKey = '';
for (const line of env.split('\n')) {
  const m = line.match(/^\s*(?:GEMINI_API_KEY|GOOGLE_API_KEY)\s*=\s*(.*)?\s*$/);
  if (m) apiKey = m[1].replace(/^['"]|['"]$/g, '').trim();
}

async function main() {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
  const data = await res.json();
  if (data.models) {
    console.log(data.models.map(m => m.name.replace('models/', '')));
  } else {
    console.log(data);
  }
}

main();

