/**
 * TypeScript definitions for the PPDT Assessor Response Schema.
 * Follows the owner's exact parameter specification.
 */

export interface PicturePerceptionSection {
  identified_correctly: string;     // details identified correctly
  ignored_elements: string;         // important elements ignored
  logical_interpretation: string;  // is it logical and connected to the picture
  unnecessarily_imagined: string;   // imagined details not supported by the picture
}

export interface StoryQualitySection {
  protagonist: string;
  age_gender_emotional_state: string;
  premise_situation: string;
  actions_taken: string;
  logical_sequence: string;
  initiative_responsibility: string;
  practicality_realism: string;
  ending_resolution: string;
  action_vs_description: string;
  quotes: string[];                 // exact excerpts supporting the points above
}

export interface OlqItem {
  olq: string;                      // e.g. "Effective Intelligence"
  tendency: string;                 // what it may indicate to an assessor
  basis: 'present_in_story' | 'inferred' | 'not_demonstrated';
  quote: string | null;             // exact excerpt, or null when not demonstrated
  quote_verified?: boolean;         // validated by server
}

export interface RealismCheckItem {
  area: string;                     // e.g. "Unrealistic solutions", "Heroic/superhuman behaviour", etc.
  finding: string;
  problem_found: boolean;
  quote: string | null;
  quote_verified?: boolean;
}

export interface PpdtSuitabilitySection {
  verdict: 'Strong' | 'Average' | 'Weak';
  explanation: string;
  too_complicated_to_narrate: boolean;
  narration_assessment: string;     // can central idea be communicated clearly in narration
}

export interface WhatToChangeSection {
  remove: string;
  add: string;
  protagonist_changes: string;
  make_solution_practical: string;
  make_concise: string;
  mistakes_to_avoid: string;
}

export interface FinalAssessmentSection {
  overall_score: number;             // 0 to 10, steps of 0.5
  picture_perception: number;
  story: number;
  realism: number;
  protagonist_action: number;
  narration_suitability: number;
  verdict: string;                   // blunt assessor-style verdict, 3 to 5 sentences
}

export interface ImprovedStorySection {
  included: boolean;                 // only when it would genuinely help
  aim: string | null;                // one concise sentence, shown above the story
  story: string | null;
}

export interface DiscussionKeyPoint {
  order: number;
  point: string;
  priority: 'most_important' | 'important' | 'omit';
}

export interface DiscussionSection {
  entry_strategy: string;            // how to enter without interrupting
  entry_timing: string;              // at what point to try to enter
  entry_phrases: string[];           // 2 to 3 natural phrases
  stance: 'support' | 'modify' | 'agree_with_other';
  stance_explanation: string;
  key_points: DiscussionKeyPoint[];
  details_to_avoid: string;
  connecting_with_other_stories: string;
  weaknesses_and_handling: string;
}

export interface AssessmentMeta {
  prompt_version: string;
  prompt_hash: string;
  model: string;
  created_at: string;
  story_word_count: number;
  student_concern?: string | null;
}

export interface PpdtAssessment {
  picture_perception: PicturePerceptionSection;
  story_quality: StoryQualitySection;
  olq_perspective: OlqItem[];
  realism_check: RealismCheckItem[];
  ppdt_suitability: PpdtSuitabilitySection;
  what_to_change: WhatToChangeSection;
  final_assessment: FinalAssessmentSection;
  improved_story: ImprovedStorySection;
  discussion: DiscussionSection;
  assessment_meta?: AssessmentMeta;
}

