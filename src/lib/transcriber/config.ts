/**
 * Central transcription configuration for Veneha.
 * Keep all model, resolution, compression, and pass settings here.
 */

export const TRANSCRIBER_CONFIG = {
  // Multimodal Flash-class Gemini model (fast lite tier with high reliability)
  MODEL_NAME: process.env.GEMINI_MODEL || 'gemini-flash-lite-latest',
  
  // Resilient fallback models when Google experiences high-demand spikes
  FALLBACK_MODELS: ['gemini-flash-lite-latest', 'gemini-3.5-flash-lite'],

  // Resolution setting for media input (if supported by SDK / endpoint)
  MEDIA_RESOLUTION: 'high' as const,
  
  // Image preparation settings for browser before upload (1400px @ 80% is optimal for handwriting OCR)
  MAX_LONG_EDGE_PX: 1400,
  JPEG_QUALITY: 0.80,
  
  // Number of independent transcription passes (1 = standard, 2 = comparative double-pass)
  TRANSCRIBE_PASSES: Number(process.env.TRANSCRIBE_PASSES || 1),
  
  // Maximum number of pages per story
  MAX_PAGES: 4,
  
  // Demo mode: strictly disabled by default; only allowed in development if explicitly enabled
  ALLOW_DEMO_MODE: process.env.NODE_ENV === 'development' && process.env.ALLOW_DEMO_MODE === 'true',
} as const;

