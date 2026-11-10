import { Transcriber } from './types';
import { GeminiTranscriber } from './geminiTranscriber';

export * from './config';
export * from './types';
export * from './errors';
export * from './metrics';
export * from './geminiTranscriber';

export function getTranscriber(): Transcriber {
  const engine = (process.env.TRANSCRIBER || 'gemini').toLowerCase();
  switch (engine) {
    case 'gemini':
    default:
      return new GeminiTranscriber();
  }
}

