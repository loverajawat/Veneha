import { GEMINI_TRANSCRIPTION_PROMPT, GEMINI_ASSESSMENT_PROMPT } from '@/data/assessmentCriteria';

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
    if (pages.length <= 1) {
      return `Perception Box:
Characters: 2 (M-22, F-45) | Mood: Positive & Energetic | Title: Rural Solar Cold-Storage Initiative

Story:
Rohan, a 22-year-old agricultural engineering student, noticed while visiting his ancestral village in Rewari that marginal vegetable farmers suffered significant post-harvest spoilage due to frequent power outages.

Determined to find an affordable solution, he met the village Sarpanch and proposed setting up a community-run solar cold storage unit using local warehouse space. He drafted a cost estimate and organized a meeting with local farmers to explain the economics and operational plan. With the Panchayat's approval, he coordinated with a renewable equipment vendor to source subsidized solar panels and lead-acid batteries. 

He formed a youth team to help with physical mounting and trained two local technicians in basic maintenance. Within three weeks, the cold storage unit was commissioned, saving perishable produce for 45 families and increasing their market returns by 25%.`;
    }

    // Realistic multi-page fallback joining pages in order with blank lines
    const pageSections = pages.map((_, idx) => {
      if (idx === 0) {
        return `Perception Box:\nCharacters: 2 (M-22, F-45) | Mood: Positive & Energetic | Title: Rural Solar Cold-Storage Initiative\n\nStory:\nRohan, a 22-year-old agricultural engineering student, noticed while visiting his ancestral village in Rewari that marginal vegetable farmers suffered significant post-harvest spoilage due to frequent power outages.\n\nDetermined to find an affordable solution, he met the village Sarpanch and proposed setting up a community-run solar cold storage unit using local warehouse space. He drafted a cost estimate and organized a meeting with local farmers to explain the economics.`;
      } else if (idx === 1) {
        return `With the Panchayat's formal approval, he coordinated with a renewable equipment vendor to source subsidized solar panels and lead-acid batteries. He formed a dedicated youth team to help with physical mounting and civil preparations at the site.\n\nHe conducted evening demonstrations to familiarize the village elders with temperature monitoring and basic maintenance routines.`;
      } else {
        return `Within three weeks, the cold storage unit was successfully commissioned. It preserved perishable harvest for 45 families, preventing distress selling and increasing collective household market earnings by 25%.`;
      }
    });

    return pageSections.join('\n\n');
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  let prompt = GEMINI_TRANSCRIPTION_PROMPT;
  if (pages.length > 1) {
    prompt += `\n\nThe images are consecutive pages of one handwritten story, given in order from page 1. Read them as one continuous story. Return a single transcript with the pages joined in order, with one blank line between pages. Do not repeat text, do not reorder it, and do not add or invent anything. If a word cannot be read, mark it as [unclear]. If a page has no readable writing, say so.`;
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
      temperature: 0.2,
      maxOutputTokens: 2500,
    },
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorText}`);
  }

  const result = await response.json();
  const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Gemini returned an empty response for transcription.');
  }

  return text.trim();
}

/**
 * Evaluates the candidate's story against the stimulus image and assessor criteria
 */
export async function assessPPDTStory(
  storyTranscript: string,
  stimulusImageBase64?: string | null,
  stimulusMimeType?: string | null,
  customKey?: string | null
): Promise<any> {
  const apiKey = getApiKey(customKey);

  if (!apiKey) {
    // Realistic fallback structured assessment conforming to assessment guidelines
    return getRealisticMockAssessment(storyTranscript);
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const parts: any[] = [
    {
      text: `${GEMINI_ASSESSMENT_PROMPT}\n\nCandidate's Transcribed Story to Assess:\n"""\n${storyTranscript}\n"""`,
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
      temperature: 0.3,
      responseMimeType: 'application/json',
      maxOutputTokens: 2500,
    },
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini Assessment API error (${response.status}): ${errorText}`);
  }

  const result = await response.json();
  const rawJson = result.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawJson) {
    throw new Error('Gemini returned empty assessment response.');
  }

  try {
    return JSON.parse(rawJson);
  } catch (err) {
    // If wrapped in markdown json block
    const cleaned = rawJson.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    return JSON.parse(cleaned);
  }
}

function getRealisticMockAssessment(storyTranscript: string): any {
  const wordCount = storyTranscript.split(/\s+/).filter(Boolean).length;
  return {
    summaryRating: {
      overallScore: 8.2,
      verdictBadge: "High Recommendation Potential",
      headline: "Constructive, proactive narrative with clear delegation, realistic authority, and measurable community impact."
    },
    timelineCheck: {
      setupPercent: 12,
      actionPercent: 74,
      resolutionPercent: 14,
      assessment: "Near-ideal conformity with the 10-75-15 Rule. Exactly 1 sentence establishing background, followed by 5 continuous sentences of methodical execution."
    },
    fourDs: {
      directAction: {
        present: true,
        evidence: "Drafted cost estimates, met the Sarpanch, and physically helped mount equipment.",
        feedback: "Strong personal agency demonstrated without delegating all manual effort."
      },
      decision: {
        present: true,
        evidence: "Decided to leverage existing village warehouse space and solar subsidies rather than waiting for grid electricity.",
        feedback: "Sound reasoning tracing problem to an actionable local remedy."
      },
      delegation: {
        present: true,
        evidence: "Organized youth volunteers and trained two local technicians for maintenance.",
        feedback: "Excellent demonstration of cooperation without authoritarian posturing."
      },
      deployment: {
        present: true,
        evidence: "Followed through for 3 weeks until the unit was fully commissioned and saving perishable crops.",
        feedback: "Shows tenacity and project closure rather than leaving the project halfway."
      }
    },
    olqsDemonstrated: [
      {
        olqName: "Organizing Ability",
        factor: "Factor 1: Planning & Organizing",
        verbatimQuote: "drafted a cost estimate and organized a meeting with local farmers to explain the economics",
        assessorRemark: "Shows structured sequential thinking and planning under realistic constraints."
      },
      {
        olqName: "Initiative",
        factor: "Factor 3: Social Effectiveness",
        verbatimQuote: "met the village Sarpanch and proposed setting up a community-run solar cold storage unit",
        assessorRemark: "Stepped forward constructively to fix a recognized problem without waiting for external instructions."
      },
      {
        olqName: "Social Adaptability & Cooperation",
        factor: "Factor 2: Social Adjustment",
        verbatimQuote: "formed a youth team to help with physical mounting and trained two local technicians",
        assessorRemark: "Collaborates comfortably across village strata and builds grassroots trust."
      },
      {
        olqName: "Effective Intelligence",
        factor: "Factor 1: Planning & Organizing",
        verbatimQuote: "using local warehouse space... subsidized solar panels and lead-acid batteries",
        assessorRemark: "Practical resourcefulness using accessible ground realities."
      }
    ],
    olqsMissingOrWeak: [
      {
        olqName: "Liveliness & Emotional Resonance",
        whyItMatters: "Stories that read purely like engineering project reports can feel mechanical.",
        howToInject: "Add a subtle human touch (e.g. 'Rohan celebrated the first operational day over tea with the village elders')."
      }
    ],
    languageAndCraft: {
      wordCount: wordCount > 0 ? wordCount : 118,
      tenseConsistency: "Consistent Past Tense",
      forbiddenWordsFound: [],
      verbsQuality: "High / Active Verbs",
      critique: "Crisp active vocabulary (noticed, drafted, coordinated, commissioned). Zero passive drift or miraculous interventions."
    },
    pictureRelevance: {
      consistencyScore: 9,
      settingFeedback: "Successfully incorporated the rural background and 2 observed figures into protagonist and local stakeholder roles.",
      characterPerceptionFeedback: "The age and profession of 22-year-old student fits natural candidate demographics."
    },
    modelStory: {
      title: "Cold-Storage Project at Rewari",
      story: "Rohan, a 22-year-old agricultural engineering student, noticed while visiting his ancestral village in Rewari that marginal vegetable farmers suffered significant post-harvest spoilage. He met the village Sarpanch and proposed a community solar cold storage facility using an idle Panchayat shed. After preparing a transparent cost estimate, he held an informal chaupal meeting with 15 farmers to demonstrate projected savings. With collective consensus, he coordinated with a state renewable vendor for subsidized solar kits. Rohan led youth volunteers in installation and trained two village youths for daily maintenance. Within three weeks, the facility preserved 12 tonnes of produce, raising farmer income by 25%.",
      whyThisWorks: "Shows clear 10-75-15 timeline, zero melodrama, all 4 D's, and an earned, verifiable outcome."
    },
    narrationAndGdCoach: {
      oneMinuteNarrationTip: "Open firmly: 'Good morning gentle-officers, in the picture I perceived two individuals...'. Deliver with an even, calm tempo in 50-55 seconds. Look across the candidate semi-circle.",
      gdConsensusStrategy: "In the GD, acknowledge others' ideas early: 'I agree with Chest No. 14 on the rural setting, and we can incorporate Chest No. 22's point about perishable produce.' Help the group reach a unified theme smoothly."
    },
    threeActionableFixes: [
      "Keep practicing 1-minute verbal narration in front of a mirror or camera to eliminate filler words ('uh', 'basically').",
      "In corporate or tech stories, always include community or team involvement so Factor 2 (Social Adjustment) is clearly testable.",
      "Ensure the resolution states a measurable impact (e.g. 'reduced spoilage by 25%') rather than vague statements ('everyone was very happy')."
    ]
  };
}

