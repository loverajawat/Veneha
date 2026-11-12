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

const SYSTEM_PROMPT = `You are a specialized PPDT handwriting transcription engine. You are not a writer, editor or assistant.
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
4. Crossed-out or scribbled-over words were deleted by the student: leave them out completely.
   A word written above the line or in the margin with a mark showing where it belongs goes in
   that position. If the position is unclear, put it where it fits and mark it [?word?].
5. Keep line breaks only where they clearly start a new paragraph. Otherwise join lines
   into continuous text.
6. PPDT CHARACTER BOX & HEADING SEPARATION:
   PPDT sheets typically have a small character box on the top-right / right side (or top) containing:
   - Characters marked with Age, Gender, and Mood (e.g. M 22 +, F 24 0, dots, circles).
   - An Action or Title line (e.g. 'Action: Saving Village Crops from Storm').
   CRITICAL REQUIREMENT:
   - Put all character box notations, numbers, symbols, and Action/Title lines into "box_and_heading".
   - Completely IGNORE and EXCLUDE the character box and Action/Title from "story_text".
   - "story_text" must contain ONLY the candidate's actual narrative story lines. Never leak any box characters, age/sex/mood, or title into "story_text".
7. If a photo has no readable handwriting, return empty story_text and set readability to
   "unreadable". Never produce an example or sample story.
8. Ignore ruled lines, margins and printed labels such as Date, Page No., or Chest No.

You must respond strictly with valid JSON conforming to the following JSON schema:
{
  "pages": [
    {
      "page": number, // 1-based page index
      "readability": "good" | "fair" | "poor" | "unreadable",
      "box_and_heading": string, // text from any box or title, or empty string
      "story_text": string, // verbatim story text for this page (strictly excluding the box)
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

/**
 * Ensures strict separation between the PPDT character box and the story text.
 * Strips any leaked box notations (e.g. [box: M / 0 / 22], Action:, Title:) from story_text
 * and consolidates them into box_and_heading.
 */
function cleanAndSeparateBox(rawStory: string, rawBox: string): { cleanStory: string; cleanBox: string } {
  let story = (rawStory || '').trim();
  let box = (rawBox || '').trim();

  const boxPatterns = [
    /^\s*\[box:?[^\]]+\]\s*(?:Action:[^\n]+)?/i,
    /^\s*(?:Perception\s+Box|Character\s+Box|Box)\s*:\s*[^\n]+/i,
    /^\s*Action\s*:\s*[^\n]+/i,
    /^\s*Title\s*:\s*[^\n]+/i,
    /^\s*(?:[MF]\s*[/,]\s*\d{1,2}\s*[/,]\s*[+\-0PN])(?:\s+Action:[^\n]+)?/i,
  ];

  for (const pattern of boxPatterns) {
    const match = story.match(pattern);
    if (match && match[0]) {
      const extracted = match[0].trim();
      story = story.replace(match[0], '').trim();
      if (!box) {
        box = extracted;
      } else if (!box.toLowerCase().includes(extracted.toLowerCase())) {
        box = `${box}  ${extracted}`.trim();
      }
    }
  }

  // Strip leading 'Story:' or 'My Story:' labels from story text
  story = story.replace(/^(?:Story|My\s+Story)\s*:\s*/i, '').trim();

  return { cleanStory: story, cleanBox: box };
}

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

    const modelsToTry = [
      TRANSCRIBER_CONFIG.MODEL_NAME,
      ...(TRANSCRIBER_CONFIG.FALLBACK_MODELS || []),
    ].filter((v, i, a) => a.indexOf(v) === i);

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
        maxOutputTokens: 4096,
      },
    };

    let rawJson: string | null = null;
    let lastError: any = null;

    // Try primary model and gracefully fail over to fallbacks if Google experiences high demand (503)
    for (const model of modelsToTry) {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      try {
        console.log(`[GeminiTranscriber] Calling model ${model}...`);
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errText = await response.text();
          console.warn(`[GeminiTranscriber] Model ${model} returned ${response.status}. Attempting fallback...`);
          lastError = mapToTranscriptionError({
            status: response.status,
            message: `Gemini API error (${response.status}): ${errText}`,
          });
          continue;
        }

        const data = await response.json();
        const candidate = data.candidates?.[0];

        // Newer Gemini models may include thinking parts before the content part.
        // Find the last text part, which contains the actual JSON response.
        const contentParts = candidate?.content?.parts;
        if (Array.isArray(contentParts) && contentParts.length > 0) {
          for (let p = contentParts.length - 1; p >= 0; p--) {
            if (contentParts[p]?.text) {
              rawJson = contentParts[p].text;
              break;
            }
          }
        }

        if (rawJson) {
          console.log(`[GeminiTranscriber] Model ${model} succeeded.`);
          break;
        }
      } catch (err: any) {
        console.warn(`[GeminiTranscriber] Model ${model} error: ${err.message}. Attempting fallback...`);
        lastError = err;
      }
    }

    if (!rawJson) {
      throw lastError || new TranscriptionError({
        code: 'PARSE_ERROR',
        userMessage: 'Transcription service returned an empty response. Please retry.',
        devMessage: 'All candidate models failed or returned empty candidates.',
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

      // Enforce strict separation between character box and story text
      const { cleanStory, cleanBox } = cleanAndSeparateBox(pageData.story_text, pageData.box_and_heading);
      pageData.story_text = cleanStory;
      pageData.box_and_heading = cleanBox;

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

