/**
 * TypeScript definitions for the PPDT Assessor Response Schema (Schema Version 2).
 * Follows the owner's exact parameter specification and bullet-oriented structure.
 */

// Basic labelled item matching Gemini's bullet structure
export interface Item {
  label: string;
  text: string;
  quote?: string | null;
}

export type OlqBasis = 'present_in_story' | 'inferred' | 'not_demonstrated';

export interface OlqItemV2 extends Item {
  basis: OlqBasis;
}

export interface DiscussionKeyPointV2 {
  order: number;
  purpose: string;
  text: string;
}

export interface EvaluationScores {
  overall: number;                  // 0 to 10 in 0.5 steps
  picture_perception: number;       // 0 to 10 in 0.5 steps
  story: number;                    // 0 to 10 in 0.5 steps
  realism: number;                  // 0 to 10 in 0.5 steps
  protagonist_action: number;       // 0 to 10 in 0.5 steps
  narration_suitability: number;    // 0 to 10 in 0.5 steps
}

export interface AssessmentMeta {
  prompt_version: string;
  prompt_hash: string;
  model: string;
  created_at: string;
  story_word_count: number;
  student_concern?: string | null;
}

/**
 * Schema Version 2: One unified evaluation document.
 * Flexible list-of-items shape so content is never lost due to field rigidness.
 */
export interface EvaluationDoc {
  schema_version: 2;
  scores: EvaluationScores;
  picture_perception: Item[];       // 4 required labels
  story_quality: Item[];            // 9 required labels
  olq: OlqItemV2[];                  // 3 to 12 items, related OLQs may be grouped
  realism: Item[];                  // at least 3, extra items allowed (e.g. Minor flaw)
  suitability: {
    verdict: 'Strong' | 'Average' | 'Weak';
    explanation: string;
    narration: string;
  };
  changes: Item[];                  // 6 required labels
  verdict: string;                  // 3 to 5 sentences
  improved_story: {
    included: boolean;
    aim: string | null;
    story: string | null;
  };
  discussion: {
    entry_strategy: string;
    entry_timing: string;
    entry_phrases: string[];        // 2 to 3 quoted lines
    stance: 'support' | 'modify' | 'agree_with_other';
    stance_explanation: string;
    key_points: DiscussionKeyPointV2[]; // 3 to 5 ordered points
    details_to_avoid: string;
    connecting_with_others: string;
    weaknesses_handling: string;
  };
  assessment_meta?: AssessmentMeta;
  isLegacy?: boolean;               // True when adapted from an older schema version
}

/** Required label lists per owner's prompt for strict completeness checking */
export const REQUIRED_LABELS = {
  picture_perception: [
    'Identified correctly',
    'Ignored elements',
    'Logical interpretation',
    'Unnecessarily imagined details',
  ] as const,
  story_quality: [
    'Main character/protagonist',
    'Age, gender, and emotional state',
    'Premise/situation identified',
    'Actions taken by the protagonist',
    'Logical sequence of events',
    'Initiative and responsibility',
    'Practicality and realism',
    'Ending/resolution',
    'Action vs. description',
  ] as const,
  changes: [
    'What to remove or correct',
    'What to add',
    'Protagonist changes',
    'Make solution more practical',
    'How to make it concise',
    'Mistakes to avoid next time',
  ] as const,
} as const;

/* ==========================================================================
 * Legacy Schema Types (v1) - Kept for database & history reader backward compatibility
 * ========================================================================== */

export interface PicturePerceptionSectionLegacy {
  identified_correctly: string;
  ignored_elements: string;
  logical_interpretation: string;
  unnecessarily_imagined: string;
}

export interface StoryQualitySectionLegacy {
  protagonist: string;
  age_gender_emotional_state: string;
  premise_situation: string;
  actions_taken: string;
  logical_sequence: string;
  initiative_responsibility: string;
  practicality_realism: string;
  ending_resolution: string;
  action_vs_description: string;
  quotes: string[];
}

export interface OlqItemLegacy {
  olq: string;
  tendency: string;
  basis: 'present_in_story' | 'inferred' | 'not_demonstrated';
  quote: string | null;
  quote_verified?: boolean;
}

export interface RealismCheckItemLegacy {
  area: string;
  finding: string;
  problem_found: boolean;
  quote: string | null;
  quote_verified?: boolean;
}

export interface PpdtSuitabilitySectionLegacy {
  verdict: 'Strong' | 'Average' | 'Weak';
  explanation: string;
  too_complicated_to_narrate: boolean;
  narration_assessment: string;
}

export interface WhatToChangeSectionLegacy {
  remove: string;
  add: string;
  protagonist_changes: string;
  make_solution_practical: string;
  make_concise: string;
  mistakes_to_avoid: string;
}

export interface FinalAssessmentSectionLegacy {
  overall_score: number;
  picture_perception: number;
  story: number;
  realism: number;
  protagonist_action: number;
  narration_suitability: number;
  verdict: string;
}

export interface ImprovedStorySectionLegacy {
  included: boolean;
  aim: string | null;
  story: string | null;
}

export interface DiscussionKeyPointLegacy {
  order: number;
  point: string;
  priority: 'most_important' | 'important' | 'omit';
}

export interface DiscussionSectionLegacy {
  entry_strategy: string;
  entry_timing: string;
  entry_phrases: string[];
  stance: 'support' | 'modify' | 'agree_with_other';
  stance_explanation: string;
  key_points: DiscussionKeyPointLegacy[];
  details_to_avoid: string;
  connecting_with_other_stories: string;
  weaknesses_and_handling: string;
}

export interface PpdtAssessment {
  schema_version?: number;
  picture_perception: PicturePerceptionSectionLegacy;
  story_quality: StoryQualitySectionLegacy;
  olq_perspective: OlqItemLegacy[];
  realism_check: RealismCheckItemLegacy[];
  ppdt_suitability: PpdtSuitabilitySectionLegacy;
  what_to_change: WhatToChangeSectionLegacy;
  final_assessment: FinalAssessmentSectionLegacy;
  improved_story: ImprovedStorySectionLegacy;
  discussion: DiscussionSectionLegacy;
  assessment_meta?: AssessmentMeta;
}
