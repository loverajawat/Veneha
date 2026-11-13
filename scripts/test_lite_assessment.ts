import fs from 'fs';
import path from 'path';
import { ASSESSOR_CONFIG } from '../src/lib/assessor/config';
import { evaluatePPDTStory } from '../src/lib/assessor/assessorService';

// Load .env.local
if (fs.existsSync('.env.local')) {
  const env = fs.readFileSync('.env.local', 'utf8');
  for (const line of env.split('\n')) {
    const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (m && m[1]) {
      process.env[m[1]] = m[2]?.replace(/^['"]|['"]$/g, '').trim();
    }
  }
}

// Override model to gemini-3.1-flash-lite
process.env.ASSESSMENT_MODEL = 'gemini-3.1-flash-lite';
(ASSESSOR_CONFIG as any).ASSESSMENT_MODEL = 'gemini-3.1-flash-lite';

async function testLiteAssessment() {
  console.log('Testing assessment evaluation with gemini-3.1-flash-lite...');
  const start = Date.now();
  try {
    const res = await evaluatePPDTStory({
      pictureId: 'ppdt-01',
      confirmedStoryText: 'Vikram a 23 yeold agriculture student was returning to his village from his family fields when a sudden, severe windstorm struck the area. Realizing the intensity of the gale, Vikram immediately thought of the freshly harvested wheat stored under temporary tarpaulin sheds at the village Community Centre, which were highly vulnerable to such winds. Pushing quickly against heavy gusts, Vikram made his way to centre. He saw the tarpulins violently flapping and threating to tear away. He immediately called out to three local youths who were running for shelter. Together they tied the tarpaulins securely with ropes and anchored them with sandbags.',
      boxAndHeading: 'M 0 22 Action: Saving Village Crops from Storm'
    });
    console.log(`Success in ${Date.now() - start}ms!`);
    console.log('Overall score:', (res as any).scores?.overall ?? (res as any).final_assessment?.overall_score);
    console.log('Verdict:', (res as any).suitability?.verdict ?? (res as any).ppdt_suitability?.verdict);
  } catch (err: any) {
    console.error(`Failed after ${Date.now() - start}ms:`, err?.message || err);
  }
}

testLiteAssessment();
