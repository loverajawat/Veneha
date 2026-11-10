import { TRANSCRIBER_CONFIG } from './config';
import { 
  PageImageInput, 
  PageTranscriptionResult, 
  TranscriptionResult, 
  StructuredTranscriptionResponse, 
  Transcriber 
} from './types';
import { 
  MissingApiKeyError, 
  UnreadableImageError, 
  TranscriptionError, 
  mapToTranscriptionError 
} from './errors';
import { getApiKey } from '../gemini';

const SYSTEM_PROMPT = `You are a handwriting transcription tool. You are not a writer, editor or assistant.
Your only job is to copy exactly what a student wrote by hand in the attached photo(s)
into typed text.

Rules:
1. Copy the student's words exactly: same words, same order, same names, ages, numbers and
   spelling. Do not correct spelling, grammar or punctuation. Do not improve, shorten,
   summarise, translate or rewrite anything.
2. Never invent, add or complete text. Do not finish unfinished sentences. Do not connect
   pages or fill in anything that is not written. Transcribe each page separately.
3. If a word is hard to read, give your best reading as [?word?]. If it cannot be read at
   all, write [illegible]. Never guess silently.
4. Crossed-out or scribbled-over words were deleted by the student: leave them out. A word
   written above the line or in the margin with a mark showing where it belongs goes in
   that position. If the position is unclear, put it where it fits and mark it [?word?].
5. Keep line breaks only where they clearly start a new paragraph. Otherwise join lines
   into continuous text.
6. Put any title, heading or small box (for example number of characters, age, sex, mood)
   in box_and_heading, not in story_text.
7. If a photo has no readable handwriting, return empty story_text and set readability to
   "unreadable". Never produce an example or sample story.
8. Ignore ruled lines, margins and printed labels such as Date or Page No.

You must respond strictly with valid JSON conforming to the following JSON schema:
{
  "pages": [
    {
      "page": number, // 1-based page index
      "readability": "good" | "fair" | "poor" | "unreadable",
      "box_and_heading": string, // text from any box or title, or empty string
      "story_text": string, // verbatim story text for this page
      "unclear_count": number, // count of [?word?] and [illegible] tokens on this page
      "notes": string // short note, for example 'two words struck out'
    }
  ]
}`;

const FORBIDDEN_FAKE_PATTERNS = [
  /rohan/i,
  /rewari/i,
  /cold-storage/i,
  /rural solar/i,
];

const PLACEHOLDER_PATTERNS = [
  /here is the transcription/i,
  /as an ai handwriting transcription tool/i,
  /your only job is to copy/i,
  /verbatim story text for this page/i,
];

export class GeminiTranscriber implements Transcriber {
  name = 'gemini';

  async transcribe(
    pages: PageImageInput[],
    customKey?: string | null
  ): Promise<TranscriptionResult> {
    if (!pages || pages.length === 0) {
      throw new TranscriptionError({
        code: 'UNREADABLE_IMAGE',
        userMessage: 'No pages provided for transcription.',
      });
    }

    const apiKey = getApiKey(customKey);
    if (!apiKey) {
      throw new MissingApiKeyError();
    }

    const model = TRANSCRIBER_CONFIG.MODEL_NAME;
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const parts: any[] = [{ text: SYSTEM_PROMPT }];

    pages.forEach((page, index) => {
      parts.push({
        text: `--- Beginning of Page ${index + 1} Image (${pages.length} total pages) ---`
      });
      parts.push({
        inline_data: {
          mime_type: page.mimeType,
          data: page.base64,
        },
      });
    });

    const payload = {
      contents: [{ parts }],
      generationConfig: {
        responseMimeType: 'application/json',
        maxOutputTokens: 4000,
      },
    };

    // Execute call with 1 retry on parse or transient failure
    let rawJson: string | null = null;
    let attempts = 0;

    while (attempts < 2) {
      attempts++;
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errText = await response.text();
          throw mapToTranscriptionError({
            status: response.status,
            message: `Gemini API error (${response.status}): ${errText}`,
          });
        }

        const data = await response.json();
        rawJson = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!rawJson) {
          throw new TranscriptionError({
            code: 'PARSE_ERROR',
            userMessage: 'Transcription service returned an empty response. Please retry.',
            retryable: true,
          });
        }
        break; // Successfully got rawJson
      } catch (err: any) {
        if (attempts >= 2 || !err.retryable) {
          throw mapToTranscriptionError(err);
        }
        // Small backoff before retry
        await new Promise((resolve) => setTimeout(resolve, 800));
      }
    }

    if (!rawJson) {
      throw new TranscriptionError({
        code: 'PARSE_ERROR',
        userMessage: 'Failed to obtain transcription response from AI.',
        retryable: true,
      });
    }

    // Parse structured JSON
    let parsed: StructuredTranscriptionResponse;
    try {
      const cleaned = rawJson.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
      parsed = JSON.parse(cleaned);
    } catch (parseErr) {
      throw new TranscriptionError({
        code: 'PARSE_ERROR',
        userMessage: 'Failed to parse AI transcription response. Please retry.',
        devMessage: `Invalid JSON returned by Gemini: ${rawJson.substring(0, 200)}`,
        retryable: true,
      });
    }

    if (!parsed.pages || !Array.isArray(parsed.pages)) {
      throw new TranscriptionError({
        code: 'PARSE_ERROR',
        userMessage: 'Transcription structure was incomplete. Please retry.',
        retryable: true,
      });
    }

    // Validation rules (Section 6)
    // 1. Page count check
    if (parsed.pages.length !== pages.length) {
      console.warn(`Page count mismatch: sent ${pages.length}, returned ${parsed.pages.length}. Aligning output.`);
    }

    // 2. Validate content against fake patterns & placeholder text
    let totalUnclearCount = 0;
    const validatedPages: PageTranscriptionResult[] = [];

    for (let i = 0; i < pages.length; i++) {
      const pageData: PageTranscriptionResult = parsed.pages[i] || {
        page: i + 1,
        readability: 'fair',
        box_and_heading: '',
        story_text: '',
        unclear_count: 0,
        notes: '',
      };

      // Check for forbidden fake strings
      for (const pattern of FORBIDDEN_FAKE_PATTERNS) {
        if (pattern.test(pageData.story_text) || pattern.test(pageData.box_and_heading)) {
          throw new TranscriptionError({
            code: 'SERVER_ERROR',
            userMessage: 'Transcription contained unauthorized synthetic text. Operation halted.',
            devMessage: `Output triggered forbidden fake pattern: ${pattern}`,
            retryable: false,
          });
        }
      }

      // Check placeholder text
      for (const pattern of PLACEHOLDER_PATTERNS) {
        if (pattern.test(pageData.story_text)) {
          throw new TranscriptionError({
            code: 'PARSE_ERROR',
            userMessage: 'AI output contained placeholder text. Please retry.',
            devMessage: `Output contained prompt template echo: ${pattern}`,
            retryable: true,
          });
        }
      }

      // Check unreadable status
      if (pageData.readability === 'unreadable' && !pageData.story_text.trim()) {
        throw new UnreadableImageError(
          i + 1,
          `Page ${i + 1} was classified as unreadable with no decipherable handwriting.`
        );
      }

      totalUnclearCount += pageData.unclear_count || 0;
      validatedPages.push(pageData);
    }

    // 3. Build combined transcript in code (Section 6)
    const combinedStory = validatedPages
      .map((p) => p.story_text.trim())
      .filter(Boolean)
      .join('\n\n');

    const combinedBoxAndHeading = validatedPages
      .map((p) => p.box_and_heading.trim())
      .filter(Boolean)
      .join('\n');

    const fullTranscript = combinedBoxAndHeading
      ? `${combinedBoxAndHeading}\n\n${combinedStory}`
      : combinedStory;

    return {
      pages: validatedPages,
      box_and_heading: combinedBoxAndHeading,
      story_text: combinedStory,
      combined_transcript: fullTranscript,
      total_unclear_count: totalUnclearCount,
      isDemo: false,
    };
  }
}

