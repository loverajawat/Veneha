/**
 * Central transcription configuration for Veneha.
 * Keep all model, resolution, compression, and pass settings here.
 */

export const TRANSCRIBER_CONFIG = {
  // Multimodal Flash-class Gemini model
  MODEL_NAME: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  
  // Resolution setting for media input (if supported by SDK / endpoint)
  MEDIA_RESOLUTION: 'high' as const,
  
  // Image preparation settings for browser before upload
  MAX_LONG_EDGE_PX: 2000,
  JPEG_QUALITY: 0.85,
  
  // Number of independent transcription passes (1 = standard, 2 = comparative double-pass)
  TRANSCRIBE_PASSES: Number(process.env.TRANSCRIBE_PASSES || 1),
  
  // Maximum number of pages per story
  MAX_PAGES: 4,
  
  // Demo mode: strictly disabled by default; only allowed in development if explicitly enabled
  ALLOW_DEMO_MODE: process.env.NODE_ENV === 'development' && process.env.ALLOW_DEMO_MODE === 'true',
} as const;

