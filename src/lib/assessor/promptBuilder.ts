import { 
  GEMINI_ASSESSMENT_PROMPT, 
  APPLICATION_OUTPUT_WRAPPER,
  PPDT_PROMPT_VERSION,
  PPDT_PROMPT_HASH,
  PromptNotConfiguredError 
} from '@/data/ppdt-assessment-prompt';
import { ASSESSOR_CONFIG } from './config';

export interface BuildAssessmentRequestOptions {
  storyText: string;
  boxAndHeading?: string | null;
  studentConcern?: string | null;
  referenceNotes?: string | null;
}

export function buildSystemInstruction(): string {
  if (!GEMINI_ASSESSMENT_PROMPT || GEMINI_ASSESSMENT_PROMPT.trim().length < 50) {
    throw new PromptNotConfiguredError('Assessor prompt is empty or not configured in src/data/ppdt-assessment-prompt.ts.');
  }

  return `${GEMINI_ASSESSMENT_PROMPT.trim()}\n\n${APPLICATION_OUTPUT_WRAPPER.trim()}`;
}

export function buildUserMessage(options: BuildAssessmentRequestOptions): string {
  const { storyText, boxAndHeading, studentConcern, referenceNotes } = options;

  // Clean uncertain markers e.g. [?word?] -> word
  const cleanedStory = storyText.replace(/\[\?([^\?]+)\?\]/g, '$1').trim();
  const wordCount = cleanedStory.split(/\s+/).filter(Boolean).length;

  if (wordCount < ASSESSOR_CONFIG.MIN_STORY_WORDS) {
    throw new Error(`Your story is too short to assess (minimum ${ASSESSOR_CONFIG.MIN_STORY_WORDS} words required, found ${wordCount}).`);
  }

  if (cleanedStory.includes('[illegible]')) {
    throw new Error('Please resolve or remove all [illegible] markers before assessment.');
  }

  // Build story block
  const storyBlock = boxAndHeading && boxAndHeading.trim()
    ? `${boxAndHeading.trim()}\n\n${cleanedStory}`
    : cleanedStory;

  let msg = `PICTURE:\n[The picture is attached above]\n\nMY STORY:\n<candidate_story>\n${storyBlock}\n</candidate_story>\n\nOPTIONAL INFORMATION:\nObservation time: ${ASSESSOR_CONFIG.OBSERVATION_TIME}\nWriting time: ${ASSESSOR_CONFIG.WRITING_TIME}\nApproximate word count: ${wordCount}`;

  if (studentConcern && studentConcern.trim()) {
    msg += `\nAny specific concern I have: ${studentConcern.trim()}`;
  }

  if (referenceNotes && referenceNotes.trim()) {
    msg += `\nReference notes by the assessor (not shown to the candidate): ${referenceNotes.trim()}`;
  }

  msg += `\n\nEvaluate the picture and story using the instructions above. If any optional information is not provided, do not assume it; simply evaluate based on the available information.`;

  return msg;
}

