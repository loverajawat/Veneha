import fs from 'fs';
import path from 'path';
import { ASSESSOR_CONFIG } from './config';
import { PpdtAssessment } from './types';
import { buildSystemInstruction, buildUserMessage } from './promptBuilder';
import { validateAndHardenAssessment } from './validator';
import { getApiKey } from '../gemini';
import { MissingApiKeyError } from '../transcriber/errors';

export interface EvaluateOptions {
  pictureId: string;
  confirmedStoryText: string;
  boxAndHeading?: string | null;
  studentConcern?: string | null;
  customKey?: string | null;
}

/**
 * Loads the stimulus picture server-side by pictureId from public/pictures.
 * Never trusts image bytes or URLs sent directly from the client.
 */
export function loadServerStimulusImage(pictureId: string): { base64: string; mimeType: string } | null {
  const picturesDir = path.join(process.cwd(), 'public', 'pictures');
  if (!fs.existsSync(picturesDir)) return null;

  const validExtensions = ['.jpg', '.jpeg', '.png', '.webp'];

  // 1. Direct pictureId check
  for (const ext of validExtensions) {
    const fullPath = path.join(picturesDir, `${pictureId}${ext}`);
    if (fs.existsSync(fullPath)) {
      const buf = fs.readFileSync(fullPath);
      return {
        base64: buf.toString('base64'),
        mimeType: ext === '.png' ? 'image/png' : 'image/jpeg',
      };
    }
  }

  // 2. Fallback to picture_01 or first available
  const files = fs.readdirSync(picturesDir).filter((f) => /\.(jpe?g|png|webp)$/i.test(f));
  if (files.length > 0) {
    const fallbackPath = path.join(picturesDir, files[0]);
    const buf = fs.readFileSync(fallbackPath);
    return {
      base64: buf.toString('base64'),
      mimeType: fallbackPath.endsWith('.png') ? 'image/png' : 'image/jpeg',
    };
  }

  return null;
}

/**
 * Evaluates candidate story using the owner's fixed prompt and output wrapper.
 */
export async function evaluatePPDTStory(options: EvaluateOptions): Promise<PpdtAssessment> {
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

  const model = ASSESSOR_CONFIG.ASSESSMENT_MODEL;
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

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

  const payload: any = {
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
      maxOutputTokens: ASSESSOR_CONFIG.ASSESSMENT_MAX_OUTPUT_TOKENS,
    },
  };

  let attempts = 0;
  let rawJson: any = null;
  let lastError: any = null;

  while (attempts < 2) {
    attempts++;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), ASSESSOR_CONFIG.ASSESSMENT_TIMEOUT_MS);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Gemini Assessor API error (${response.status}): ${errText}`);
      }

      const result = await response.json();
      const textOutput = result.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!textOutput) {
        throw new Error('Assessor returned an empty response.');
      }

      const cleaned = textOutput.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
      rawJson = JSON.parse(cleaned);
      break;
    } catch (err: any) {
      lastError = err;
      if (attempts >= 2) break;
      await new Promise((r) => setTimeout(r, 1200));
    }
  }

  if (!rawJson) {
    throw lastError || new Error('Failed to obtain assessment from AI model.');
  }

  // 3. Validate, enforce honesty rules, and verify quotes
  return validateAndHardenAssessment(rawJson, confirmedStoryText, model, studentConcern);
}

