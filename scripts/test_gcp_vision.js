const fs = require('fs');
const path = require('path');
const vision = require('@google-cloud/vision');

async function testVisionOCR() {
  const keyPath = path.join(process.cwd(), 'gcp-vision-key.json');
  console.log('Using key file:', keyPath);
  
  const client = new vision.ImageAnnotatorClient({
    keyFilename: keyPath,
  });

  const samplePath = path.join(process.cwd(), 'eval/transcription/samples/sample_01.jpg');
  const imageBuffer = fs.readFileSync(samplePath);

  console.log('Sending sample_01.jpg to Google Cloud Vision API...');
  const start = Date.now();
  const [result] = await client.documentTextDetection(imageBuffer);
  const duration = Date.now() - start;

  console.log(`Cloud Vision responded in ${duration}ms!`);

  const fullTextAnnotation = result.fullTextAnnotation;
  if (!fullTextAnnotation) {
    console.log('No text detected.');
    return;
  }

  console.log('\n--- FULL DETECTED TEXT ---');
  console.log(fullTextAnnotation.text);
  console.log('--------------------------');

  // Inspect pages and blocks with bounding boxes
  const page = fullTextAnnotation.pages?.[0];
  console.log(`Page dimensions: width=${page?.width}, height=${page?.height}`);
  console.log(`Blocks count: ${page?.blocks?.length}`);

  if (page?.blocks) {
    for (let i = 0; i < page.blocks.length; i++) {
      const block = page.blocks[i];
      const vertices = block.boundingBox.vertices;
      // Get block text
      const blockText = block.paragraphs?.map(p => 
        p.words?.map(w => w.symbols?.map(s => s.text).join('')).join(' ')
      ).join('\n');
      console.log(`\nBlock #${i+1} at [x:${vertices[0]?.x}, y:${vertices[0]?.y}]:`);
      console.log(blockText);
    }
  }
}

testVisionOCR().catch(err => {
  console.error('Vision API Error:', err);
});

