import { PpdtAssessment, AssessmentMeta } from './types';
import { PPDT_PROMPT_VERSION, PPDT_PROMPT_HASH } from '@/data/ppdt-assessment-prompt';

function normalizeText(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Checks if a candidate quote exists in the student's confirmed transcript.
 */
export function verifyQuote(quote: string | null | undefined, storyText: string): boolean {
  if (!quote || !quote.trim()) return false;
  const normQuote = normalizeText(quote);
  const normStory = normalizeText(storyText);
  if (!normQuote || normQuote.length < 3) return true;
  return normStory.includes(normQuote);
}

/**
 * Clamps and rounds a number to the nearest 0.5 step between 0 and 10.
 */
export function roundToHalfStep(val: any, fallback: number = 5.0): number {
  const num = typeof val === 'number' ? val : parseFloat(val);
  if (isNaN(num)) return fallback;
  const clamped = Math.max(0, Math.min(10, num));
  return Math.round(clamped * 2) / 2;
}

/**
 * Validates and hardens the model's raw JSON assessment output.
 */
export function validateAndHardenAssessment(
  rawJson: any,
  storyText: string,
  modelName: string,
  studentConcern?: string | null
): PpdtAssessment {
  if (!rawJson || typeof rawJson !== 'object') {
    throw new Error('Assessment output was not a valid JSON object.');
  }

  // 1. Validate & round scores
  const final = rawJson.final_assessment || {};
  const scores = {
    overall_score: roundToHalfStep(final.overall_score, 5.0),
    picture_perception: roundToHalfStep(final.picture_perception, 5.0),
    story: roundToHalfStep(final.story, 5.0),
    realism: roundToHalfStep(final.realism, 5.0),
    protagonist_action: roundToHalfStep(final.protagonist_action, 5.0),
    narration_suitability: roundToHalfStep(final.narration_suitability, 5.0),
    verdict: final.verdict || 'Evaluation completed.',
  };

  // 2. Sanity check: overall score vs sub-scores
  const subScoreAvg = (scores.picture_perception + scores.story + scores.realism + scores.protagonist_action + scores.narration_suitability) / 5;
  if (scores.overall_score >= 8.5 && subScoreAvg < 4.0) {
    throw new Error('Inconsistent score calculation detected. Sub-scores contradict overall score.');
  }

  // 3. Verify quotes in story_quality
  const storyQuality = rawJson.story_quality || {};
  let verifiedStoryQuotes: string[] = [];
  if (Array.isArray(storyQuality.quotes)) {
    verifiedStoryQuotes = storyQuality.quotes.filter((q: string) => verifyQuote(q, storyText));
  }

  // 4. Verify quotes in olq_perspective
  let olqs = Array.isArray(rawJson.olq_perspective) ? rawJson.olq_perspective : [];
  olqs = olqs.map((item: any) => {
    const quote = item.quote ? String(item.quote).trim() : null;
    const isVerified = quote ? verifyQuote(quote, storyText) : false;
    return {
      olq: String(item.olq || 'General OLQ'),
      tendency: String(item.tendency || ''),
      basis: (item.basis === 'present_in_story' || item.basis === 'inferred' || item.basis === 'not_demonstrated')
        ? item.basis
        : 'inferred',
      quote: isVerified ? quote : null,
      quote_verified: isVerified,
    };
  });

  // 5. Verify quotes in realism_check
  let realism = Array.isArray(rawJson.realism_check) ? rawJson.realism_check : [];
  realism = realism.map((item: any) => {
    const quote = item.quote ? String(item.quote).trim() : null;
    const isVerified = quote ? verifyQuote(quote, storyText) : false;
    return {
      area: String(item.area || 'Realism Parameter'),
      finding: String(item.finding || ''),
      problem_found: Boolean(item.problem_found),
      quote: isVerified ? quote : null,
      quote_verified: isVerified,
    };
  });

  // 6. Improved story rules
  const improved = rawJson.improved_story || {};
  const hasImprovedContent = Boolean(improved.aim?.trim() && improved.story?.trim());
  const improvedStorySection = {
    included: Boolean(improved.included && hasImprovedContent),
    aim: hasImprovedContent ? String(improved.aim).trim() : null,
    story: hasImprovedContent ? String(improved.story).trim() : null,
  };

  // 7. Suitability
  const suitability = rawJson.ppdt_suitability || {};
  const verdictRaw = String(suitability.verdict || 'Average');
  const verdict = (verdictRaw === 'Strong' || verdictRaw === 'Average' || verdictRaw === 'Weak')
    ? verdictRaw
    : 'Average';

  // 8. Word count
  const wordCount = storyText.split(/\s+/).filter(Boolean).length;

  const assessmentMeta: AssessmentMeta = {
    prompt_version: PPDT_PROMPT_VERSION,
    prompt_hash: PPDT_PROMPT_HASH,
    model: modelName,
    created_at: new Date().toISOString(),
    story_word_count: wordCount,
    student_concern: studentConcern || null,
  };

  return {
    picture_perception: {
      identified_correctly: String(rawJson.picture_perception?.identified_correctly || ''),
      ignored_elements: String(rawJson.picture_perception?.ignored_elements || ''),
      logical_interpretation: String(rawJson.picture_perception?.logical_interpretation || ''),
      unnecessarily_imagined: String(rawJson.picture_perception?.unnecessarily_imagined || ''),
    },
    story_quality: {
      protagonist: String(storyQuality.protagonist || ''),
      age_gender_emotional_state: String(storyQuality.age_gender_emotional_state || ''),
      premise_situation: String(storyQuality.premise_situation || ''),
      actions_taken: String(storyQuality.actions_taken || ''),
      logical_sequence: String(storyQuality.logical_sequence || ''),
      initiative_responsibility: String(storyQuality.initiative_responsibility || ''),
      practicality_realism: String(storyQuality.practicality_realism || ''),
      ending_resolution: String(storyQuality.ending_resolution || ''),
      action_vs_description: String(storyQuality.action_vs_description || ''),
      quotes: verifiedStoryQuotes,
    },
    olq_perspective: olqs,
    realism_check: realism,
    ppdt_suitability: {
      verdict,
      explanation: String(suitability.explanation || ''),
      too_complicated_to_narrate: Boolean(suitability.too_complicated_to_narrate),
      narration_assessment: String(suitability.narration_assessment || ''),
    },
    what_to_change: {
      remove: String(rawJson.what_to_change?.remove || ''),
      add: String(rawJson.what_to_change?.add || ''),
      protagonist_changes: String(rawJson.what_to_change?.protagonist_changes || ''),
      make_solution_practical: String(rawJson.what_to_change?.make_solution_practical || ''),
      make_concise: String(rawJson.what_to_change?.make_concise || ''),
      mistakes_to_avoid: String(rawJson.what_to_change?.mistakes_to_avoid || ''),
    },
    final_assessment: scores,
    improved_story: improvedStorySection,
    discussion: {
      entry_strategy: String(rawJson.discussion?.entry_strategy || ''),
      entry_timing: String(rawJson.discussion?.entry_timing || ''),
      entry_phrases: Array.isArray(rawJson.discussion?.entry_phrases)
        ? rawJson.discussion.entry_phrases.map(String)
        : [],
      stance: (rawJson.discussion?.stance === 'support' || rawJson.discussion?.stance === 'modify' || rawJson.discussion?.stance === 'agree_with_other')
        ? rawJson.discussion.stance
        : 'modify',
      stance_explanation: String(rawJson.discussion?.stance_explanation || ''),
      key_points: Array.isArray(rawJson.discussion?.key_points)
        ? rawJson.discussion.key_points.map((p: any, idx: number) => ({
            order: typeof p.order === 'number' ? p.order : idx + 1,
            point: String(p.point || ''),
            priority: (p.priority === 'most_important' || p.priority === 'important' || p.priority === 'omit')
              ? p.priority
              : 'important',
          }))
        : [],
      details_to_avoid: String(rawJson.discussion?.details_to_avoid || ''),
      connecting_with_other_stories: String(rawJson.discussion?.connecting_with_other_stories || ''),
      weaknesses_and_handling: String(rawJson.discussion?.weaknesses_and_handling || ''),
    },
    assessment_meta: assessmentMeta,
  };
}

