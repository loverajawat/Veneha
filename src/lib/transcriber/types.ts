/**
 * Types and interfaces for the Veneha Handwriting Transcription Engine.
 */

export type ReadabilityRating = 'good' | 'fair' | 'poor' | 'unreadable';

export interface PageImageInput {
  base64: string;
  mimeType: string;
  pageNumber?: number;
}

export interface PageTranscriptionResult {
  page: number;
  readability: ReadabilityRating;
  box_and_heading: string;
  story_text: string;
  unclear_count: number;
  notes: string;
}

export interface StructuredTranscriptionResponse {
  pages: PageTranscriptionResult[];
}

export interface TranscriptionResult {
  pages: PageTranscriptionResult[];
  box_and_heading: string;
  story_text: string;
  combined_transcript: string;
  total_unclear_count: number;
  isDemo?: boolean;
}

export interface Transcriber {
  name: string;
  transcribe(
    pages: PageImageInput[],
    customKey?: string | null
  ): Promise<TranscriptionResult>;
}

