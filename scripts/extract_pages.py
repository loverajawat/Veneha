import fitz
import json
import urllib.request
import os

with open('.env.local', 'r', encoding='utf-8') as f:
    env = f.read()

apiKey = ''
for line in env.split('\n'):
    if line.startswith('GEMINI_API_KEY=') or line.startswith('GOOGLE_API_KEY='):
        apiKey = line.split('=', 1)[1].strip().strip('\'"')

print('API Key length:', len(apiKey))

doc = fitz.open('C:/Users/HP/.gemini/antigravity/brain/843e3650-5f40-4911-991f-1f036a6f9b77/.user_uploaded/media_1794201696628_931247b4.pdf')

def extract_page_range(start_idx, end_idx, out_name):
    print(f'Extracting pages {start_idx+1} to {end_idx}...')
    parts = [{
        'text': 'Transcribe all text on these pages verbatim into markdown. Do not summarize or skip anything. Pay special attention to code blocks, TypeScript types, schemas, and prompts. Output every character as written.'
    }]
    
    for idx in range(start_idx, end_idx):
        p = doc[idx]
        pix = p.get_pixmap(dpi=150)
        img_bytes = pix.tobytes('jpeg')
        import base64
        b64 = base64.b64encode(img_bytes).decode('ascii')
        parts.append({'text': f'--- PAGE {idx+1} ---'})
        parts.append({'inline_data': {'mime_type': 'image/jpeg', 'data': b64}})
        
    endpoint = f'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key={apiKey}'
    payload = {
        'contents': [{'parts': parts}],
        'generationConfig': {'maxOutputTokens': 8192}
    }
    
    req = urllib.request.Request(
        endpoint,
        data=json.dumps(payload).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    
    with urllib.request.urlopen(req) as response:
        res = json.loads(response.read().decode('utf-8'))
        text = res['candidates'][0]['content']['parts'][0]['text']
        with open(out_name, 'w', encoding='utf-8') as out_f:
            out_f.write(text)
        print(f'Wrote {out_name}, length {len(text)}')

# Extract Appendix A (pages 14 to 17)
extract_page_range(13, 17, 'C:/Users/HP/.gemini/antigravity/brain/843e3650-5f40-4911-991f-1f036a6f9b77/appendix_a.md')

# Extract Schema & Rules (pages 6 to 9)
extract_page_range(5, 9, 'C:/Users/HP/.gemini/antigravity/brain/843e3650-5f40-4911-991f-1f036a6f9b77/schema_and_rules.md')

# Extract Steps 1-5 (pages 1 to 6)
extract_page_range(0, 5, 'C:/Users/HP/.gemini/antigravity/brain/843e3650-5f40-4911-991f-1f036a6f9b77/steps_1_to_5.md')

# Extract Steps 7-11 (pages 9 to 13)
extract_page_range(8, 13, 'C:/Users/HP/.gemini/antigravity/brain/843e3650-5f40-4911-991f-1f036a6f9b77/steps_7_to_11.md')
