import { 
  EvaluationDoc, 
  Item, 
  OlqItemV2, 
  DiscussionKeyPointV2, 
  REQUIRED_LABELS, 
  AssessmentMeta,
  PpdtAssessment 
} from './types';
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

const REJECTED_WORDS = new Set(['none', 'n/a', 'nil', 'na', 'not applicable', 'none noted', 'none found']);

/**
 * Validates whether an item text is a substantial explanation (at least ~8 words, not empty or "None").
 */
function isSubstantialExplanation(text: string | null | undefined): boolean {
  if (!text) return false;
  const trimmed = text.trim();
  if (REJECTED_WORDS.has(trimmed.toLowerCase())) return false;
  const words = trimmed.split(/\s+/).filter(Boolean);
  return words.length >= 6; // Allow reasonable leeway (at least 6-8 words)
}

/**
 * Normalizes label matching so minor capitalization/punctuation differences match.
 */
function findItemByLabel(items: Item[] | undefined, targetLabel: string): Item | undefined {
  if (!Array.isArray(items)) return undefined;
  const normTarget = normalizeText(targetLabel);
  return items.find((item) => normalizeText(item.label) === normTarget);
}

export interface ValidationResult {
  isValid: boolean;
  doc?: EvaluationDoc;
  errors: string[];
}

/**
 * Strictly validates an assessment output according to Section 6 completeness rules.
 * Does NOT silently replace missing content with defaults.
 */
export function validateEvaluationDoc(
  rawJson: any,
  storyText: string,
  modelName: string,
  studentConcern?: string | null
): ValidationResult {
  const errors: string[] = [];

  if (!rawJson || typeof rawJson !== 'object') {
    return { isValid: false, errors: ['Assessment output is not a JSON object.'] };
  }

  // 1. Scores validation
  const scoresRaw = rawJson.scores || rawJson.final_assessment?.scores || rawJson.final_assessment;
  if (!scoresRaw || typeof scoresRaw !== 'object') {
    errors.push('Missing scores object.');
  }

  const scores = {
    overall: roundToHalfStep(scoresRaw?.overall ?? scoresRaw?.overall_score),
    picture_perception: roundToHalfStep(scoresRaw?.picture_perception),
    story: roundToHalfStep(scoresRaw?.story),
    realism: roundToHalfStep(scoresRaw?.realism),
    protagonist_action: roundToHalfStep(scoresRaw?.protagonist_action),
    narration_suitability: roundToHalfStep(scoresRaw?.narration_suitability ?? scoresRaw?.ppdt_narration_suitability),
  };

  const subScores = [
    scores.picture_perception,
    scores.story,
    scores.realism,
    scores.protagonist_action,
    scores.narration_suitability,
  ];

  // Rule: Reject exact pattern of five sub-scores equal to 5.0 (default signature)
  const allFive = subScores.every((s) => s === 5.0);
  if (allFive) {
    errors.push('All five sub-scores are exactly 5.0, indicating default values.');
  }

  // Rule: Overall score must be within ~2.0 points of the sub-score average
  const subAvg = subScores.reduce((a, b) => a + b, 0) / 5;
  if (Math.abs(scores.overall - subAvg) > 2.2) {
    errors.push(`Overall score (${scores.overall}) contradicts sub-score average (${subAvg.toFixed(1)}).`);
  }

  // 2. Picture Perception items (4 required labels)
  const picItemsRaw: any[] = Array.isArray(rawJson.picture_perception) ? rawJson.picture_perception : [];
  const picture_perception: Item[] = [];

  for (const label of REQUIRED_LABELS.picture_perception) {
    const found = findItemByLabel(picItemsRaw, label);
    if (!found || !isSubstantialExplanation(found.text)) {
      errors.push(`Picture perception missing required substantive explanation for: "${label}".`);
    } else {
      const q = found.quote ? String(found.quote).trim() : null;
      picture_perception.push({
        label,
        text: String(found.text).trim(),
        quote: q && verifyQuote(q, storyText) ? q : null,
      });
    }
  }

  // 3. Story Quality items (9 required labels)
  const storyItemsRaw: any[] = Array.isArray(rawJson.story_quality) ? rawJson.story_quality : [];
  const story_quality: Item[] = [];

  for (const label of REQUIRED_LABELS.story_quality) {
    const found = findItemByLabel(storyItemsRaw, label);
    if (!found || !isSubstantialExplanation(found.text)) {
      errors.push(`Story quality missing required substantive explanation for: "${label}".`);
    } else {
      const q = found.quote ? String(found.quote).trim() : null;
      story_quality.push({
        label,
        text: String(found.text).trim(),
        quote: q && verifyQuote(q, storyText) ? q : null,
      });
    }
  }

  // 4. SSB / OLQ items (at least 3 items with valid basis)
  const olqRaw: any[] = Array.isArray(rawJson.olq) ? rawJson.olq : [];
  if (olqRaw.length < 3) {
    errors.push(`OLQ perspective has fewer than 3 items (found ${olqRaw.length}).`);
  }

  const olq: OlqItemV2[] = [];
  for (const item of olqRaw) {
    if (!item.label || !isSubstantialExplanation(item.text)) continue;
    const basis = (item.basis === 'present_in_story' || item.basis === 'inferred' || item.basis === 'not_demonstrated')
      ? item.basis
      : 'inferred';
    const q = item.quote ? String(item.quote).trim() : null;
    olq.push({
      label: String(item.label).trim(),
      text: String(item.text).trim(),
      basis,
      quote: q && verifyQuote(q, storyText) ? q : null,
    });
  }

  if (olq.length < 3) {
    errors.push('Insufficient valid, substantive OLQ assessments (minimum 3 required).');
  }

  // 5. Realism items (at least 3 items)
  const realismRaw: any[] = Array.isArray(rawJson.realism) ? rawJson.realism : [];
  const realism: Item[] = [];

  for (const item of realismRaw) {
    if (!item.label || !isSubstantialExplanation(item.text)) continue;
    const q = item.quote ? String(item.quote).trim() : null;
    realism.push({
      label: String(item.label).trim(),
      text: String(item.text).trim(),
      quote: q && verifyQuote(q, storyText) ? q : null,
    });
  }

  if (realism.length < 3) {
    errors.push(`Realism check has fewer than 3 items (found ${realism.length}).`);
  }

  // 6. Suitability
  const suitRaw = rawJson.suitability || rawJson.ppdt_suitability;
  const verdictRaw = suitRaw?.verdict || suitRaw?.classification;
  const verdict = (verdictRaw === 'Strong' || verdictRaw === 'Average' || verdictRaw === 'Weak')
    ? verdictRaw
    : null;

  if (!verdict) {
    errors.push('Suitability verdict must be Strong, Average, or Weak.');
  }

  const suitabilityExplanation = String(suitRaw?.explanation || '').trim();
  const suitabilityNarration = String(suitRaw?.narration || suitRaw?.narration_complexity || suitRaw?.narration_assessment || '').trim();

  if (!isSubstantialExplanation(suitabilityExplanation)) {
    errors.push('Suitability missing substantive explanation.');
  }
  if (!isSubstantialExplanation(suitabilityNarration)) {
    errors.push('Suitability missing narration feasibility assessment.');
  }

  // 7. What I Should Change items (6 required labels)
  const changesRaw: any[] = Array.isArray(rawJson.changes) ? rawJson.changes : [];
  const changes: Item[] = [];

  for (const label of REQUIRED_LABELS.changes) {
    const found = findItemByLabel(changesRaw, label);
    if (!found || !isSubstantialExplanation(found.text)) {
      errors.push(`What to change missing required substantive explanation for: "${label}".`);
    } else {
      changes.push({
        label,
        text: String(found.text).trim(),
      });
    }
  }

  // 8. Assessor Verdict
  const verdictText = String(rawJson.verdict || rawJson.final_assessment?.verdict || '').trim();
  if (verdictText.split(/\s+/).filter(Boolean).length < 15) {
    errors.push('Assessor verdict must be a complete 3 to 5 sentence assessment.');
  }

  // 9. Improved Story
  const impRaw = rawJson.improved_story || {};
  const isIncluded = Boolean(impRaw.included);
  const improved_story = {
    included: isIncluded,
    aim: isIncluded && impRaw.aim ? String(impRaw.aim).trim() : null,
    story: isIncluded && (impRaw.story || impRaw.text) ? String(impRaw.story || impRaw.text).trim() : null,
  };

  // 10. Discussion section
  const discRaw = rawJson.discussion || rawJson.ppdt_discussion || {};
  const entryStrategy = String(discRaw.entry_strategy?.how_to_enter || discRaw.entry_strategy || '').trim();
  const entryTiming = String(discRaw.entry_strategy?.when_to_enter || discRaw.entry_timing || '').trim();
  const entryPhrasesRaw: any[] = Array.isArray(discRaw.entry_phrases) 
    ? discRaw.entry_phrases 
    : Array.isArray(discRaw.entry_strategy?.entry_phrases) 
      ? discRaw.entry_strategy.entry_phrases 
      : [];
  const entryPhrases = entryPhrasesRaw.map(String).map((s) => s.trim()).filter(Boolean);

  const stanceRaw = discRaw.stance || 'modify';
  const stance = (stanceRaw === 'support' || stanceRaw === 'modify' || stanceRaw === 'agree_with_other')
    ? stanceRaw
    : 'modify';
  const stanceExplanation = String(discRaw.stance_explanation || discRaw.group_discussion_approach || '').trim();

  const keyPointsRaw: any[] = Array.isArray(discRaw.key_points)
    ? discRaw.key_points
    : Array.isArray(discRaw.key_discussion_points?.points)
      ? discRaw.key_discussion_points.points.map((p: any, idx: number) => ({ order: idx + 1, purpose: 'Discussion point', text: String(p) }))
      : [];

  const key_points: DiscussionKeyPointV2[] = keyPointsRaw.map((kp: any, idx: number) => ({
    order: typeof kp.order === 'number' ? kp.order : idx + 1,
    purpose: String(kp.purpose || 'Key point').trim(),
    text: String(kp.text || kp.point || '').trim(),
  })).filter((kp) => kp.text.length > 5);

  const detailsAvoid = String(discRaw.details_to_avoid || discRaw.key_discussion_points?.unnecessary_details_to_avoid || '').trim();
  const connectingOthers = String(discRaw.connecting_with_others || discRaw.connecting_with_other_stories || '').trim();
  const weaknessesHandling = String(discRaw.weaknesses_handling || discRaw.weaknesses_and_handling || '').trim();

  if (!isSubstantialExplanation(entryStrategy)) errors.push('Discussion entry strategy is missing or too short.');
  if (!isSubstantialExplanation(entryTiming)) errors.push('Discussion entry timing is missing or too short.');
  if (entryPhrases.length < 2) errors.push('Discussion must have at least 2 entry phrases.');
  if (key_points.length < 3) errors.push('Discussion must have at least 3 key speaking points.');
  if (!isSubstantialExplanation(detailsAvoid)) errors.push('Discussion details to avoid is missing or too short.');
  if (!isSubstantialExplanation(connectingOthers)) errors.push('Discussion connecting with others is missing or too short.');
  if (!isSubstantialExplanation(weaknessesHandling)) errors.push('Discussion weaknesses handling is missing or too short.');

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  const wordCount = storyText.split(/\s+/).filter(Boolean).length;
  const assessment_meta: AssessmentMeta = {
    prompt_version: PPDT_PROMPT_VERSION,
    prompt_hash: PPDT_PROMPT_HASH,
    model: modelName,
    created_at: new Date().toISOString(),
    story_word_count: wordCount,
    student_concern: studentConcern || null,
  };

  const doc: EvaluationDoc = {
    schema_version: 2,
    scores,
    picture_perception,
    story_quality,
    olq,
    realism,
    suitability: {
      verdict: verdict!,
      explanation: suitabilityExplanation,
      narration: suitabilityNarration,
    },
    changes,
    verdict: verdictText,
    improved_story,
    discussion: {
      entry_strategy: entryStrategy,
      entry_timing: entryTiming,
      entry_phrases: entryPhrases.slice(0, 3),
      stance,
      stance_explanation: stanceExplanation,
      key_points: key_points.slice(0, 5),
      details_to_avoid: detailsAvoid,
      connecting_with_others: connectingOthers,
      weaknesses_handling: weaknessesHandling,
    },
    assessment_meta,
  };

  return { isValid: true, doc, errors: [] };
}

/**
 * Adapter: Reads an assessment from session storage or SQLite.
 * If already Schema v2, returns it directly.
 * If older Schema v1, maps available fields into EvaluationDoc format with `isLegacy: true`
 * and inserts clear notes for missing sections rather than inventing fake data.
 */
export function readAnyEvaluation(raw: any, storyText: string = ''): EvaluationDoc {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Invalid assessment record.');
  }

  // Already Schema Version 2
  if (raw.schema_version === 2 && raw.scores && Array.isArray(raw.picture_perception)) {
    return raw as EvaluationDoc;
  }

  // Convert older Schema v1 record
  const legacy = raw as PpdtAssessment;
  const scoresRaw = legacy.final_assessment || (legacy as any).scores || {};

  const scores = {
    overall: roundToHalfStep(scoresRaw.overall_score ?? (scoresRaw as any).overall, 5.0),
    picture_perception: roundToHalfStep(scoresRaw.picture_perception, 5.0),
    story: roundToHalfStep(scoresRaw.story, 5.0),
    realism: roundToHalfStep(scoresRaw.realism, 5.0),
    protagonist_action: roundToHalfStep(scoresRaw.protagonist_action, 5.0),
    narration_suitability: roundToHalfStep(scoresRaw.narration_suitability, 5.0),
  };

  const picLegacy = legacy.picture_perception || {};
  const picture_perception: Item[] = [
    { label: 'Identified correctly', text: picLegacy.identified_correctly || 'This older result has fewer details recorded.' },
    { label: 'Ignored elements', text: picLegacy.ignored_elements || 'This older result has fewer details recorded.' },
    { label: 'Logical interpretation', text: picLegacy.logical_interpretation || 'This older result has fewer details recorded.' },
    { label: 'Unnecessarily imagined details', text: picLegacy.unnecessarily_imagined || 'This older result has fewer details recorded.' },
  ];

  const sqLegacy = legacy.story_quality || {};
  const story_quality: Item[] = [
    { label: 'Main character/protagonist', text: sqLegacy.protagonist || 'This older result has fewer details recorded.' },
    { label: 'Age, gender, and emotional state', text: sqLegacy.age_gender_emotional_state || 'This older result has fewer details recorded.' },
    { label: 'Premise/situation identified', text: sqLegacy.premise_situation || 'This older result has fewer details recorded.' },
    { label: 'Actions taken by the protagonist', text: sqLegacy.actions_taken || 'This older result has fewer details recorded.' },
    { label: 'Logical sequence of events', text: sqLegacy.logical_sequence || 'This older result has fewer details recorded.' },
    { label: 'Initiative and responsibility', text: sqLegacy.initiative_responsibility || 'This older result has fewer details recorded.' },
    { label: 'Practicality and realism', text: sqLegacy.practicality_realism || 'This older result has fewer details recorded.' },
    { label: 'Ending/resolution', text: sqLegacy.ending_resolution || 'This older result has fewer details recorded.' },
    { label: 'Action vs. description', text: sqLegacy.action_vs_description || 'This older result has fewer details recorded.' },
  ];

  const olqLegacy: any[] = Array.isArray(legacy.olq_perspective) ? legacy.olq_perspective : [];
  const olq: OlqItemV2[] = olqLegacy.map((item) => ({
    label: item.olq || 'OLQ Assessment',
    text: item.tendency || 'Noted in earlier assessment.',
    basis: item.basis || 'inferred',
    quote: item.quote || null,
  }));

  const realismLegacy: any[] = Array.isArray(legacy.realism_check) ? legacy.realism_check : [];
  const realism: Item[] = realismLegacy.map((item) => ({
    label: item.area || 'Realism Parameter',
    text: item.finding || (item.problem_found ? 'Problem noted.' : 'No major problem noted.'),
    quote: item.quote || null,
  }));

  const suitLegacy = legacy.ppdt_suitability || {};
  const changesLegacy = legacy.what_to_change || {};
  const changes: Item[] = [
    { label: 'What to remove or correct', text: changesLegacy.remove || 'This older result has fewer details recorded.' },
    { label: 'What to add', text: changesLegacy.add || 'This older result has fewer details recorded.' },
    { label: 'Protagonist changes', text: changesLegacy.protagonist_changes || 'This older result has fewer details recorded.' },
    { label: 'Make solution more practical', text: changesLegacy.make_solution_practical || 'This older result has fewer details recorded.' },
    { label: 'How to make it concise', text: changesLegacy.make_concise || 'This older result has fewer details recorded.' },
    { label: 'Mistakes to avoid next time', text: changesLegacy.mistakes_to_avoid || 'This older result has fewer details recorded.' },
  ];

  const discLegacy = legacy.discussion || {};
  const keyPointsLegacy = Array.isArray(discLegacy.key_points) ? discLegacy.key_points : [];

  return {
    schema_version: 2,
    scores,
    picture_perception,
    story_quality,
    olq: olq.length > 0 ? olq : [{ label: 'SSB OLQ Overview', text: 'This older result has fewer details recorded.', basis: 'inferred' }],
    realism: realism.length > 0 ? realism : [{ label: 'Realism Overview', text: 'This older result has fewer details recorded.' }],
    suitability: {
      verdict: suitLegacy.verdict || 'Average',
      explanation: suitLegacy.explanation || 'Recorded from earlier assessment.',
      narration: suitLegacy.narration_assessment || 'Narration assessment not recorded in older format.',
    },
    changes,
    verdict: scoresRaw.verdict || 'Evaluation completed.',
    improved_story: {
      included: Boolean(legacy.improved_story?.included),
      aim: legacy.improved_story?.aim || null,
      story: legacy.improved_story?.story || null,
    },
    discussion: {
      entry_strategy: discLegacy.entry_strategy || 'This older result has fewer details recorded.',
      entry_timing: discLegacy.entry_timing || 'This older result has fewer details recorded.',
      entry_phrases: Array.isArray(discLegacy.entry_phrases) ? discLegacy.entry_phrases : [],
      stance: discLegacy.stance || 'modify',
      stance_explanation: discLegacy.stance_explanation || 'This older result has fewer details recorded.',
      key_points: keyPointsLegacy.map((kp, idx) => ({ order: idx + 1, purpose: 'Speaking point', text: kp.point || '' })),
      details_to_avoid: discLegacy.details_to_avoid || 'This older result has fewer details recorded.',
      connecting_with_others: discLegacy.connecting_with_other_stories || 'This older result has fewer details recorded.',
      weaknesses_handling: discLegacy.weaknesses_and_handling || 'This older result has fewer details recorded.',
    },
    assessment_meta: legacy.assessment_meta,
    isLegacy: true,
  };
}
