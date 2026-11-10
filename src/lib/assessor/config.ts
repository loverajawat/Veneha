/**
 * Configuration for the PPDT Assessment Engine.
 */
export const ASSESSOR_CONFIG = {
  // Model name: Flash-class or Pro-class
  ASSESSMENT_MODEL: process.env.ASSESSMENT_MODEL || 'gemini-2.5-flash',
  
  // High reasoning / thinking where supported
  REASONING_EFFORT: (process.env.ASSESSMENT_REASONING || 'high') as 'low' | 'medium' | 'high',
  
  // Output token limit - must be large enough to prevent cutoffs
  ASSESSMENT_MAX_OUTPUT_TOKENS: 6000,
  
  // Timeout in milliseconds (deep assessment with quotes & 12 OLQs needs ~90s)
  ASSESSMENT_TIMEOUT_MS: 90000,
  
  // Minimum story words to evaluate
  MIN_STORY_WORDS: 25,
  
  // Observation and writing fixed standards
  OBSERVATION_TIME: '30 seconds',
  WRITING_TIME: '4 minutes',
} as const;

