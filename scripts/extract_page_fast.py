import fitz
import json
import urllib.request
import base64
import os

with open('.env.local', 'r', encoding='utf-8') as f:
    env = f.read()

apiKey = ''
for line in env.split('\n'):
    line = line.strip()
    if line.startswith('GEMINI_API_KEY=') or line.startswith('GOOGLE_API_KEY='):
        apiKey = line.split('=', 1)[1].strip().strip('\'"')

print('API Key length:', len(apiKey))

doc = fitz.open('C:/Users/HP/.gemini/antigravity/brain/843e3650-5f40-4911-991f-1f036a6f9b77/.user_uploaded/media_1794201696628_931247b4.pdf')

def extract_pages(pages_list, outfile):
    print(f'Extracting pages {pages_list}...')
    parts = [{
        'text': 'Transcribe all text on these pages verbatim into markdown. Do not summarize or skip anything. Pay special attention to code blocks, TypeScript types, schemas, and prompts. Output every character as written.'
    }]
    
    for page_num in pages_list:
        p = doc[page_num - 1]
        # Render at 100 dpi
        pix = p.get_pixmap(dpi=100)
        img_bytes = pix.tobytes('jpeg', jpg_quality=80)
        b64 = base64.b64encode(img_bytes).decode('ascii')
        parts.append({'text': f'--- PAGE {page_num} ---'})
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
    
    with urllib.request.urlopen(req, timeout=90) as response:
        res = json.loads(response.read().decode('utf-8'))
        text = res['candidates'][0]['content']['parts'][0]['text']
        with open(outfile, 'w', encoding='utf-8') as out_f:
            out_f.write(text)
        print(f'Saved {outfile}, length {len(text)}')

# 1. Appendix A: pages 14, 15, 16, 17
extract_pages([14, 15, 16, 17], 'C:/Users/HP/.gemini/antigravity/brain/843e3650-5f40-4911-991f-1f036a6f9b77/appendix_a.md')

# 2. Schema and Output: pages 6, 7, 8, 9
extract_pages([6, 7, 8, 9], 'C:/Users/HP/.gemini/antigravity/brain/843e3650-5f40-4911-991f-1f036a6f9b77/schema_and_rules.md')

# 3. Steps 1 to 5: pages 1, 2, 3, 4, 5
extract_pages([1, 2, 3, 4, 5], 'C:/Users/HP/.gemini/antigravity/brain/843e3650-5f40-4911-991f-1f036a6f9b77/steps_1_to_5.md')

# 4. Steps 7 to 11 & Order of Work: pages 10, 11, 12, 13
extract_pages([10, 11, 12, 13], 'C:/Users/HP/.gemini/antigravity/brain/843e3650-5f40-4911-991f-1f036a6f9b77/steps_7_to_11.md')

