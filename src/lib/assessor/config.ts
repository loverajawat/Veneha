/**
 * Configuration for the PPDT Assessment Engine.
 */
export const ASSESSOR_CONFIG = {
  // Fast, responsive Flash model with high global availability (< 1s latency)
  ASSESSMENT_MODEL: process.env.ASSESSMENT_MODEL || 'gemini-flash-lite-latest',
  
  // Resilient fallback models when Google experiences high-demand spikes
  FALLBACK_MODELS: ['gemini-flash-lite-latest', 'gemini-3.5-flash-lite'],

  // High reasoning / thinking where supported
  REASONING_EFFORT: (process.env.ASSESSMENT_REASONING || 'high') as 'low' | 'medium' | 'high',
  
  // Output token limit
  ASSESSMENT_MAX_OUTPUT_TOKENS: 8192,
  
  // Timeout in milliseconds (120s buffer for deep evaluation + single corrective pass)
  ASSESSMENT_TIMEOUT_MS: 120000,
  
  // Minimum story words to evaluate
  MIN_STORY_WORDS: 25,
  
  // Observation and writing fixed standards
  OBSERVATION_TIME: '30 seconds',
  WRITING_TIME: '4 minutes',
} as const;

