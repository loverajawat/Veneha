import { validateEvaluationDoc, readAnyEvaluation } from '../src/lib/assessor/validator';

console.log('Running test: validator-strictness.test.ts...');

const sampleStory = 'Vikram, a 23-year-old agriculture student from Rewari village, was returning from his family fields when a sudden severe storm threatened the standing wheat crop. Realizing the danger to the unharvested produce, he immediately alerted the village elders and mobilized a group of 15 youth from the local Panchayat. Under his guidance, they arranged tarpaulins from the cooperative store, dug temporary drainage channels around the low-lying fields to prevent waterlogging, and safely shifted the harvested bundles to the community shed. Due to their timely initiative and coordinated team effort, over eighty percent of the harvest was saved, and the village council commended Vikram\'s leadership and presence of mind.';

// Test 1: Reject identical 5.0 sub-scores
{
  const badScoresJson = {
    schema_version: 2,
    scores: {
      overall: 5.0,
      picture_perception: 5.0,
      story: 5.0,
      realism: 5.0,
      protagonist_action: 5.0,
      narration_suitability: 5.0,
    },
    picture_perception: [],
    story_quality: [],
    olq: [],
    realism: [],
    suitability: { verdict: 'Average', explanation: 'Fine', narration: 'Fine' },
    changes: [],
    verdict: 'Some verdict.',
    improved_story: { included: false },
    discussion: {},
  };

  const res = validateEvaluationDoc(badScoresJson, sampleStory, 'test-model');
  if (res.isValid) {
    throw new Error('Test 1 failed: Expected rejection of all-5.0 default scores, but validator accepted it.');
  }
  const has5Error = res.errors.some((e) => e.includes('All five sub-scores are exactly 5.0'));
  if (!has5Error) {
    throw new Error('Test 1 failed: Did not find specific error for 5.0 default scores.');
  }
  console.log('✓ Test 1: Default 5.0 sub-scores correctly rejected.');
}

// Test 2: Reject "None" and "N/A" placeholders
{
  const placeholderJson = {
    schema_version: 2,
    scores: {
      overall: 7.0,
      picture_perception: 7.0,
      story: 7.5,
      realism: 6.5,
      protagonist_action: 7.0,
      narration_suitability: 7.0,
    },
    picture_perception: [
      { label: 'Identified correctly', text: 'None' },
      { label: 'Ignored elements', text: 'N/A' },
      { label: 'Logical interpretation', text: 'Valid logical explanation that makes complete sense.' },
      { label: 'Unnecessarily imagined details', text: 'None' },
    ],
    story_quality: [],
    olq: [],
    realism: [],
    suitability: { verdict: 'Strong', explanation: 'Good story', narration: 'Good narration' },
    changes: [],
    verdict: 'A complete assessor verdict that evaluates the candidate objectively across all areas.',
    improved_story: { included: false },
    discussion: {},
  };

  const res = validateEvaluationDoc(placeholderJson, sampleStory, 'test-model');
  if (res.isValid) {
    throw new Error('Test 2 failed: Expected rejection of "None" and "N/A" placeholders.');
  }
  console.log('✓ Test 2: Placeholder strings ("None", "N/A") correctly rejected.');
}

// Test 3: Reject contradicting overall score
{
  const contradictJson = {
    schema_version: 2,
    scores: {
      overall: 9.0, // High overall score
      picture_perception: 4.0,
      story: 4.5,
      realism: 3.5,
      protagonist_action: 4.0,
      narration_suitability: 4.0, // Sub-scores average ~4.0
    },
    picture_perception: [],
    story_quality: [],
    olq: [],
    realism: [],
    suitability: { verdict: 'Weak', explanation: 'Low performance', narration: 'Hard to narrate' },
    changes: [],
    verdict: 'A full verdict.',
    improved_story: { included: false },
    discussion: {},
  };

  const res = validateEvaluationDoc(contradictJson, sampleStory, 'test-model');
  if (res.isValid) {
    throw new Error('Test 3 failed: Contradicting overall score should be rejected.');
  }
  const hasContradict = res.errors.some((e) => e.includes('contradicts sub-score average'));
  if (!hasContradict) {
    throw new Error('Test 3 failed: Missing contradiction error message.');
  }
  console.log('✓ Test 3: Contradicting overall vs sub-scores correctly rejected.');
}

// Test 4: Legacy Schema Adapter
{
  const oldAttempt = {
    final_assessment: {
      overall_score: 7.5,
      picture_perception: 8.0,
      story: 7.0,
      realism: 7.0,
      protagonist_action: 7.5,
      narration_suitability: 7.5,
      verdict: 'Solid story with good action.',
    },
    picture_perception: {
      identified_correctly: 'Identified farm and rain clouds.',
      ignored_elements: '',
      logical_interpretation: 'Logical farm setting.',
      unnecessarily_imagined: '',
    },
    ppdt_suitability: {
      verdict: 'Strong',
      explanation: 'Clear and action oriented.',
      narration_assessment: 'Easy to narrate.',
    },
  };

  const doc = readAnyEvaluation(oldAttempt, sampleStory);
  if (doc.schema_version !== 2) throw new Error('Legacy adapter should output schema_version 2');
  if (!doc.isLegacy) throw new Error('Legacy adapter should mark isLegacy: true');
  if (doc.scores.overall !== 7.5) throw new Error('Legacy overall score not preserved');
  if (doc.picture_perception.length !== 4) throw new Error('Legacy perception items count mismatch');
  console.log('✓ Test 4: Legacy Schema v1 properly adapted to Schema v2 with isLegacy flag.');
}

console.log('PASS: All strict validator tests passed successfully!');

