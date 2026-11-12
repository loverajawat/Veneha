import { GEMINI_TRANSCRIPTION_PROMPT, GEMINI_ASSESSMENT_PROMPT } from '@/data/assessmentCriteria';
import { MissingApiKeyError, mapToTranscriptionError } from './transcriber/errors';
import { TRANSCRIBER_CONFIG } from './transcriber/config';

export function getApiKey(customKey?: string | null): string | undefined {
  return customKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
}

export interface StoryPageImage {
  base64: string;
  mimeType: string;
}

/**
 * Transcribes handwritten story image(s) using Gemini multimodal API.
 * Supports a single image or an ordered array of 1 to 4 pages.
 * Never returns simulated/mock stories. Throws MissingApiKeyError if no key is present.
 */
export async function transcribeHandwrittenStory(
  pagesInput: StoryPageImage[] | string,
  mimeTypeOrCustomKey?: string | null,
  customKeyParam?: string | null
): Promise<string> {
  let pages: StoryPageImage[];
  let customKey: string | null | undefined;

  if (typeof pagesInput === 'string') {
    pages = [{ base64: pagesInput, mimeType: mimeTypeOrCustomKey || 'image/jpeg' }];
    customKey = customKeyParam;
  } else {
    pages = pagesInput;
    customKey = mimeTypeOrCustomKey;
  }

  const apiKey = getApiKey(customKey);

  if (!apiKey) {
    throw new MissingApiKeyError();
  }

  const model = TRANSCRIBER_CONFIG.MODEL_NAME;
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  let prompt = GEMINI_TRANSCRIPTION_PROMPT;
  if (pages.length > 1) {
    prompt += `\n\nThe images are consecutive pages of one handwritten story, given in order from page 1. Read each page separately. Return a single transcript with the pages joined in order, with one blank line between pages. Do not repeat text, do not reorder it, and do not add or invent anything. If a word is hard to read, mark it as [?word?]. If a word cannot be read at all, write [illegible].`;
  }

  const parts: any[] = [{ text: prompt }];
  for (const page of pages) {
    parts.push({
      inline_data: {
        mime_type: page.mimeType,
        data: page.base64,
      },
    });
  }

  const payload = {
    contents: [
      {
        parts,
      },
    ],
    generationConfig: {
      maxOutputTokens: 16000,
    },
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw mapToTranscriptionError({
        status: response.status,
        message: `Gemini API error (${response.status}): ${errorText}`,
      });
    }

    const result = await response.json();
    // Newer Gemini models (3.x+) may have thinking parts before content — pick the last text part
    const contentParts = result.candidates?.[0]?.content?.parts;
    let text: string | undefined;
    if (Array.isArray(contentParts)) {
      for (let p = contentParts.length - 1; p >= 0; p--) {
        if (contentParts[p]?.text) {
          text = contentParts[p].text;
          break;
        }
      }
    }
    if (!text) {
      throw mapToTranscriptionError({
        message: 'Gemini returned an empty response for transcription.',
      });
    }

    return text.trim();
  } catch (err: any) {
    throw mapToTranscriptionError(err);
  }
}

/**
 * Strips uncertain markers [?word?] to the inner word, e.g. "[?harvester?]" -> "harvester".
 */
export function stripUncertainMarkers(text: string): string {
  return text.replace(/\[\?([^\?]+)\?\]/g, '$1');
}

/**
 * Verifies that a quote snippet exists in the confirmed story text.
 * Performs normalized case-insensitive check and punctuation tolerance.
 */
export function verifyQuoteInTranscript(quote: string, confirmedTranscript: string): boolean {
  if (!quote || !confirmedTranscript) return false;
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
  const normQuote = normalize(quote);
  const normTranscript = normalize(confirmedTranscript);
  if (!normQuote || normQuote.length < 3) return true;
  return normTranscript.includes(normQuote);
}

/**
 * Evaluates the candidate's story against the stimulus image and assessor criteria.
 * Enforces strict guards:
 * 1. Blocks if [illegible] remains.
 * 2. Strips [?word?] markers to inner words before sending to Gemini.
 * 3. Never returns fake or simulated assessment. Throws MissingApiKeyError if no key.
 * 4. Filters out any generated OLQ or 4D evidence quotes that do not exist in the candidate's confirmed story.
 */
export async function assessPPDTStory(
  confirmedTranscript: string,
  stimulusImageBase64?: string | null,
  stimulusMimeType?: string | null,
  customKey?: string | null
): Promise<any> {
  if (confirmedTranscript.includes('[illegible]')) {
    throw new Error('Please resolve or remove all [illegible] markers before assessment.');
  }

  const apiKey = getApiKey(customKey);
  if (!apiKey) {
    throw new MissingApiKeyError('No Gemini API key is configured. Assessment requires a valid GEMINI_API_KEY.');
  }

  // Clean the transcript for evaluation by stripping [?...?] markers
  const cleanedStory = stripUncertainMarkers(confirmedTranscript);

  const model = TRANSCRIBER_CONFIG.MODEL_NAME;
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const parts: any[] = [
    {
      text: `${GEMINI_ASSESSMENT_PROMPT}\n\nCandidate's Transcribed Story to Assess:\n"""\n${cleanedStory}\n"""`,
    },
  ];

  if (stimulusImageBase64 && stimulusMimeType) {
    parts.push({
      inline_data: {
        mime_type: stimulusMimeType,
        data: stimulusImageBase64,
      },
    });
  }

  const payload = {
    contents: [{ parts }],
    generationConfig: {
      responseMimeType: 'application/json',
      maxOutputTokens: 16000,
    },
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw mapToTranscriptionError({
      status: response.status,
      message: `Gemini Assessment API error (${response.status}): ${errorText}`,
    });
  }

  const result = await response.json();
  // Pick the last text part (thinking models put thought parts first)
  const assessParts = result.candidates?.[0]?.content?.parts;
  let rawJson: string | undefined;
  if (Array.isArray(assessParts)) {
    for (let p = assessParts.length - 1; p >= 0; p--) {
      if (assessParts[p]?.text) {
        rawJson = assessParts[p].text;
        break;
      }
    }
  }
  if (!rawJson) {
    throw new Error('Gemini returned an empty assessment response.');
  }

  let parsed: any;
  try {
    parsed = JSON.parse(rawJson);
  } catch (err) {
    const cleaned = rawJson.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    parsed = JSON.parse(cleaned);
  }

  // Post-processing guard: Verify quotes in candidate's story
  if (Array.isArray(parsed.olqsDemonstrated)) {
    parsed.olqsDemonstrated = parsed.olqsDemonstrated.filter((olq: any) => {
      if (!olq.verbatimQuote) return true;
      const verified = verifyQuoteInTranscript(olq.verbatimQuote, confirmedTranscript);
      if (!verified) {
        console.warn(`Filtered out unverified quote in assessment: "${olq.verbatimQuote}"`);
      }
      return verified;
    });
  }

  return parsed;
}
