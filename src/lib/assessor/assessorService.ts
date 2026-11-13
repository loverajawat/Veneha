import fs from 'fs';
import path from 'path';
import { ASSESSOR_CONFIG } from './config';
import { EvaluationDoc } from './types';
import { EVALUATION_RESPONSE_SCHEMA } from './schema';
import { buildSystemInstruction, buildUserMessage } from './promptBuilder';
import { validateEvaluationDoc } from './validator';
import { getApiKey } from '../gemini';
import { MissingApiKeyError } from '../transcriber/errors';

export interface EvaluateOptions {
  pictureId: string;
  confirmedStoryText: string;
  boxAndHeading?: string | null;
  studentConcern?: string | null;
  customKey?: string | null;
}

const stimulusImageCache = new Map<string, { base64: string; mimeType: string }>();

/**
 * Loads the stimulus picture server-side by pictureId from public/pictures.
 * Never trusts image bytes or URLs sent directly from the client.
 */
export function loadServerStimulusImage(pictureId: string): { base64: string; mimeType: string } | null {
  if (stimulusImageCache.has(pictureId)) {
    return stimulusImageCache.get(pictureId)!;
  }

  const picturesDir = path.join(process.cwd(), 'public', 'pictures');
  if (!fs.existsSync(picturesDir)) return null;

  const validExtensions = ['.jpg', '.jpeg', '.png', '.webp'];

  // 1. Direct pictureId check
  for (const ext of validExtensions) {
    const fullPath = path.join(picturesDir, `${pictureId}${ext}`);
    if (fs.existsSync(fullPath)) {
      const buf = fs.readFileSync(fullPath);
      const res = {
        base64: buf.toString('base64'),
        mimeType: ext === '.png' ? 'image/png' : 'image/jpeg',
      };
      stimulusImageCache.set(pictureId, res);
      return res;
    }
  }

  // 2. Match ppdt_stimulus_XX patterns (e.g. ppdt-01 -> ppdt_stimulus_01.jpg)
  const numMatch = pictureId.match(/\d+/);
  if (numMatch) {
    const num = numMatch[0].padStart(2, '0');
    for (const ext of validExtensions) {
      const stimulusPath = path.join(picturesDir, `ppdt_stimulus_${num}${ext}`);
      if (fs.existsSync(stimulusPath)) {
        const buf = fs.readFileSync(stimulusPath);
        const res = {
          base64: buf.toString('base64'),
          mimeType: ext === '.png' ? 'image/png' : 'image/jpeg',
        };
        stimulusImageCache.set(pictureId, res);
        return res;
      }
    }
  }

  // 3. Fallback to picture_01 or first available
  const files = fs.readdirSync(picturesDir).filter((f) => /\.(jpe?g|png|webp)$/i.test(f));
  if (files.length > 0) {
    const fallbackPath = path.join(picturesDir, files[0]);
    const buf = fs.readFileSync(fallbackPath);
    const res = {
      base64: buf.toString('base64'),
      mimeType: fallbackPath.endsWith('.png') ? 'image/png' : 'image/jpeg',
    };
    stimulusImageCache.set(pictureId, res);
    return res;
  }

  return null;
}

/**
 * Extracts the last text part from a Gemini candidate response (handling thinking models).
 */
function extractResponseText(result: any): string | null {
  const candidate = result?.candidates?.[0];
  const contentParts = candidate?.content?.parts;
  if (!Array.isArray(contentParts) || contentParts.length === 0) return null;

  for (let p = contentParts.length - 1; p >= 0; p--) {
    if (contentParts[p]?.text) {
      return contentParts[p].text;
    }
  }
  return null;
}

/**
 * Evaluates candidate story using the owner's fixed prompt, Schema v2 responseSchema,
 * strict validation, and single corrective retry on incompleteness.
 */
export async function evaluatePPDTStory(options: EvaluateOptions): Promise<EvaluationDoc> {
  const { pictureId, confirmedStoryText, boxAndHeading, studentConcern, customKey } = options;

  const apiKey = getApiKey(customKey);
  if (!apiKey) {
    throw new MissingApiKeyError('No Gemini API key configured for assessment.');
  }

  // 1. Build messages
  const systemInstruction = buildSystemInstruction();
  const userMessage = buildUserMessage({
    storyText: confirmedStoryText,
    boxAndHeading,
    studentConcern,
  });

  // 2. Load stimulus picture server-side
  const pictureData = loadServerStimulusImage(pictureId);

  const modelsToTry = [
    ASSESSOR_CONFIG.ASSESSMENT_MODEL,
    ...(ASSESSOR_CONFIG.FALLBACK_MODELS || []),
  ].filter((v, i, a) => a.indexOf(v) === i);

  let activeModelUsed = modelsToTry[0];

  const userParts: any[] = [];
  if (pictureData) {
    userParts.push({
      inline_data: {
        mime_type: pictureData.mimeType,
        data: pictureData.base64,
      },
    });
  }
  userParts.push({ text: userMessage });

  const initialPayload: any = {
    systemInstruction: {
      parts: [{ text: systemInstruction }],
    },
    contents: [
      {
        role: 'user',
        parts: userParts,
      },
    ],
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: EVALUATION_RESPONSE_SCHEMA,
      maxOutputTokens: ASSESSOR_CONFIG.ASSESSMENT_MAX_OUTPUT_TOKENS,
    },
  };

  const callModel = async (payload: any): Promise<any> => {
    let lastError: any = null;

    for (const currentModel of modelsToTry) {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent?key=${apiKey}`;
      const controller = new AbortController();
      const timeoutMs = 60000; // 60s per model attempt
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      try {
        console.log(`[Assessor] Evaluating with model: ${currentModel}...`);
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errText = await response.text();
          console.warn(`[Assessor] Model ${currentModel} returned ${response.status}. Trying next fallback...`);
          lastError = new Error(`Gemini Assessor API error (${response.status}): ${errText}`);
          continue;
        }

        const result = await response.json();
        const rawText = extractResponseText(result);
        if (!rawText) {
          console.warn(`[Assessor] Model ${currentModel} returned empty text. Trying next fallback...`);
          lastError = new Error('Assessor returned an empty response.');
          continue;
        }

        const cleaned = rawText.replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim();
        const parsed = JSON.parse(cleaned);
        activeModelUsed = currentModel;
        return parsed;
      } catch (err: any) {
        clearTimeout(timeoutId);
        console.warn(`[Assessor] Model ${currentModel} attempt error: ${err.message}. Trying next fallback...`);
        lastError = err;
      }
    }

    throw lastError || new Error('All candidate evaluation models failed to respond.');
  };

  // Pass 1: Initial evaluation call
  let rawJson = await callModel(initialPayload);
  let validation = validateEvaluationDoc(rawJson, confirmedStoryText, activeModelUsed, studentConcern);

  // If pass 1 succeeded, return valid doc immediately
  if (validation.isValid && validation.doc) {
    return validation.doc;
  }

  // Pass 2: Single corrective retry if validation found gaps
  console.warn('Evaluation Pass 1 validation failed, initiating single corrective retry. Errors:', validation.errors);

  const correctivePrompt = `Your previous evaluation response had the following omissions or completeness errors:
${validation.errors.map((e) => `- ${e}`).join('\n')}

Please regenerate the complete, unified PPDT evaluation strictly addressing every point above:
- Every required label in Picture Perception (4 labels), Story Quality (9 labels), and Changes (6 labels) must be present.
- Every item's text must be a full, substantive explanation of at least one full sentence. Do NOT answer "None" or "N/A".
- All six scores must be present in half-points (0.0 to 10.0), and must NOT all equal 5.0.
- Provide full discussion entry strategy, 2-3 entry phrases, stance, and 3-5 ordered speaking points.
Return only valid JSON conforming strictly to the response schema.`;

  const correctivePayload: any = {
    systemInstruction: {
      parts: [{ text: systemInstruction }],
    },
    contents: [
      {
        role: 'user',
        parts: userParts,
      },
      {
        role: 'model',
        parts: [{ text: JSON.stringify(rawJson) }],
      },
      {
        role: 'user',
        parts: [{ text: correctivePrompt }],
      },
    ],
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: EVALUATION_RESPONSE_SCHEMA,
      maxOutputTokens: ASSESSOR_CONFIG.ASSESSMENT_MAX_OUTPUT_TOKENS,
    },
  };

  try {
    const retryJson = await callModel(correctivePayload);
    const retryValidation = validateEvaluationDoc(retryJson, confirmedStoryText, activeModelUsed, studentConcern);

    if (retryValidation.isValid && retryValidation.doc) {
      return retryValidation.doc;
    }

    // Still invalid after retry: Fail honestly without saving a partial or defaulted record
    console.error('Corrective retry also failed completeness validation. Errors:', retryValidation.errors);
    throw new Error(
      `AI evaluation was incomplete (${retryValidation.errors.slice(0, 2).join('; ')}). Please retry.`
    );
  } catch (retryErr: any) {
    console.error('Corrective retry error:', retryErr.message);
    throw retryErr;
  }
}
