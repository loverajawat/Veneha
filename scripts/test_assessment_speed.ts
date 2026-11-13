import fs from 'fs';
import path from 'path';
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

async function testAssessment() {
  console.log('Testing full PPDT assessment evaluation with fallback...');
  const start = Date.now();
  try {
    const res = await evaluatePPDTStory({
      pictureId: 'ppdt-01',
      confirmedStoryText: 'Vikram a 23 yeold agriculture student was returning to his village from his family fields when a sudden, severe windstorm struck the area. Realizing the intensity of the gale, Vikram immediately thought of the freshly harvested wheat stored under temporary tarpaulin sheds at the village Community Centre, which were highly vulnerable to such winds. Pushing quickly against heavy gusts, Vikram made his way to centre. He saw the tarpulins violently flapping and threating to tear away. He immediately called out to three local youths who were running for shelter. Together they tied the tarpaulins securely with ropes and anchored them with sandbags.',
      boxAndHeading: 'M 0 22 Action: Saving Village Crops from Storm'
    });
    console.log(`\n🎉 Success in ${Date.now() - start}ms!`);
    console.log('Overall score:', (res as any).scores?.overall ?? (res as any).final_assessment?.overall_score);
    console.log('Verdict:', (res as any).suitability?.verdict ?? (res as any).ppdt_suitability?.verdict);
    console.log('Picture perception summary:', (res as any).picture_perception?.details_identified?.substring(0, 100));
  } catch (err: any) {
    console.error(`\n❌ Failed after ${Date.now() - start}ms:`, err?.message || err);
  }
}

testAssessment();
