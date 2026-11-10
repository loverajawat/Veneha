import fitz
import json
import urllib.request
import base64
import sys

with open('.env.local', 'r', encoding='utf-8') as f:
    for line in f:
        line = line.strip()
        if line.startswith('GEMINI_API_KEY=') or line.startswith('GOOGLE_API_KEY='):
            apiKey = line.split('=', 1)[1].strip().strip('\'"')

doc = fitz.open('C:/Users/HP/.gemini/antigravity/brain/843e3650-5f40-4911-991f-1f036a6f9b77/.user_uploaded/media_1794201696628_931247b4.pdf')

def extract_one(page_num):
    p = doc[page_num - 1]
    pix = p.get_pixmap(dpi=120)
    b64 = base64.b64encode(pix.tobytes('jpeg', jpg_quality=85)).decode('ascii')

    payload = {
        'contents': [{'parts': [
            {'text': 'Transcribe all text on this page verbatim into plain text or markdown. Do not summarize or skip anything.'},
            {'inline_data': {'mime_type': 'image/jpeg', 'data': b64}}
        ]}],
        'generationConfig': {'maxOutputTokens': 4000}
    }

    req = urllib.request.Request(
        f'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key={apiKey}',
        data=json.dumps(payload).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )

    with urllib.request.urlopen(req, timeout=45) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        return data['candidates'][0]['content']['parts'][0]['text']

if __name__ == '__main__':
    page_num = int(sys.argv[1])
    text = extract_one(page_num)
    print(f'=== PAGE {page_num} ===\n' + text)
    with open(f'scripts/page_{page_num}.txt', 'w', encoding='utf-8') as f:
        f.write(text)

