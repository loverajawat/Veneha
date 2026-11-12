/**
 * OpenAPI / JSON Schema definition for Gemini responseSchema (Schema Version 2).
 * Enforces the exact bullet/item structure required by the Veneha redesign specification.
 */

export const EVALUATION_RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    schema_version: {
      type: 'INTEGER',
      description: 'Always 2',
    },
    scores: {
      type: 'OBJECT',
      description: 'Six scores out of 10 in half points (0.0 to 10.0 in 0.5 increments). Must not all be 5.0.',
      properties: {
        overall: {
          type: 'NUMBER',
          description: 'Overall score (0 to 10, half points)',
        },
        picture_perception: {
          type: 'NUMBER',
          description: 'Picture perception score (0 to 10, half points)',
        },
        story: {
          type: 'NUMBER',
          description: 'Story score (0 to 10, half points)',
        },
        realism: {
          type: 'NUMBER',
          description: 'Realism score (0 to 10, half points)',
        },
        protagonist_action: {
          type: 'NUMBER',
          description: 'Protagonist and action score (0 to 10, half points)',
        },
        narration_suitability: {
          type: 'NUMBER',
          description: 'Narration suitability score (0 to 10, half points)',
        },
      },
      required: [
        'overall',
        'picture_perception',
        'story',
        'realism',
        'protagonist_action',
        'narration_suitability',
      ],
    },
    picture_perception: {
      type: 'ARRAY',
      description: 'Exactly 4 labelled items for Picture Perception: "Identified correctly", "Ignored elements", "Logical interpretation", "Unnecessarily imagined details".',
      items: {
        type: 'OBJECT',
        properties: {
          label: {
            type: 'STRING',
            description: 'One of the 4 required labels.',
          },
          text: {
            type: 'STRING',
            description: '1 to 3 full sentences with concrete visual details. Never "None" or "N/A".',
          },
          quote: {
            type: 'STRING',
            description: 'Exact excerpt from candidate story if applicable, or empty string.',
          },
        },
        required: ['label', 'text'],
      },
    },
    story_quality: {
      type: 'ARRAY',
      description: 'Exactly 9 labelled items for Story Quality: "Main character/protagonist", "Age, gender, and emotional state", "Premise/situation identified", "Actions taken by the protagonist", "Logical sequence of events", "Initiative and responsibility", "Practicality and realism", "Ending/resolution", "Action vs. description".',
      items: {
        type: 'OBJECT',
        properties: {
          label: {
            type: 'STRING',
            description: 'One of the 9 required labels.',
          },
          text: {
            type: 'STRING',
            description: '1 to 3 complete sentences describing this aspect. Never "None" or "N/A".',
          },
          quote: {
            type: 'STRING',
            description: 'Exact verbatim excerpt from candidate story supporting this point.',
          },
        },
        required: ['label', 'text'],
      },
    },
    olq: {
      type: 'ARRAY',
      description: '3 to 12 items assessing only the OLQs the story actually indicates. May group related qualities (e.g. "Effective Intelligence and Reasoning Ability").',
      items: {
        type: 'OBJECT',
        properties: {
          label: {
            type: 'STRING',
            description: 'OLQ name or grouped names.',
          },
          text: {
            type: 'STRING',
            description: 'Explanation of tendencies indicated, never claiming definitive proof. Never "None".',
          },
          basis: {
            type: 'STRING',
            enum: ['present_in_story', 'inferred', 'not_demonstrated'],
            description: 'Whether the quality is present in story, inferred, or not demonstrated.',
          },
          quote: {
            type: 'STRING',
            description: 'Verbatim quote from candidate story.',
          },
        },
        required: ['label', 'text', 'basis'],
      },
    },
    realism: {
      type: 'ARRAY',
      description: 'At least 3 labelled items evaluating risks (e.g. "Unrealistic solutions", "Heroic or superhuman behaviour", "Coincidences", "Minor flaw").',
      items: {
        type: 'OBJECT',
        properties: {
          label: {
            type: 'STRING',
            description: 'Risk or realism parameter label.',
          },
          text: {
            type: 'STRING',
            description: 'Detailed explanation of why it works or what the risk is. Never "None".',
          },
          quote: {
            type: 'STRING',
            description: 'Verbatim excerpt from candidate story if relevant.',
          },
        },
        required: ['label', 'text'],
      },
    },
    suitability: {
      type: 'OBJECT',
      description: 'PPDT Suitability Assessment.',
      properties: {
        verdict: {
          type: 'STRING',
          enum: ['Strong', 'Average', 'Weak'],
          description: 'Overall PPDT suitability classification.',
        },
        explanation: {
          type: 'STRING',
          description: 'Detailed explanation of why the story is Strong, Average, or Weak.',
        },
        narration: {
          type: 'STRING',
          description: 'Assessment of narration feasibility within the PPDT 1-minute time limit.',
        },
      },
      required: ['verdict', 'explanation', 'narration'],
    },
    changes: {
      type: 'ARRAY',
      description: 'Exactly 6 labelled items: "What to remove or correct", "What to add", "Protagonist changes", "Make solution more practical", "How to make it concise", "Mistakes to avoid next time".',
      items: {
        type: 'OBJECT',
        properties: {
          label: {
            type: 'STRING',
            description: 'One of the 6 required labels.',
          },
          text: {
            type: 'STRING',
            description: 'Actionable explanation. If nothing needed, say so and explain why. Never "None" or "N/A".',
          },
        },
        required: ['label', 'text'],
      },
    },
    verdict: {
      type: 'STRING',
      description: 'Short, blunt assessor-style verdict in 3 to 5 sentences. No flattery or filler.',
    },
    improved_story: {
      type: 'OBJECT',
      description: 'Elevated model story when helpful.',
      properties: {
        included: {
          type: 'BOOLEAN',
          description: 'Whether an improved story is included.',
        },
        aim: {
          type: 'STRING',
          description: 'One concise sentence stating the aim of the story.',
        },
        story: {
          type: 'STRING',
          description: 'Full paragraph improved story text preserving the basic premise.',
        },
      },
      required: ['included'],
    },
    discussion: {
      type: 'OBJECT',
      description: 'PPDT Discussion Entry and Speaking Points.',
      properties: {
        entry_strategy: {
          type: 'STRING',
          description: 'Concrete strategy on how to enter without interrupting.',
        },
        entry_timing: {
          type: 'STRING',
          description: 'At what point to try to enter the discussion.',
        },
        entry_phrases: {
          type: 'ARRAY',
          description: '2 to 3 natural, polite, and confident entry phrases.',
          items: {
            type: 'STRING',
          },
        },
        stance: {
          type: 'STRING',
          enum: ['support', 'modify', 'agree_with_other'],
          description: 'Recommended stance in the group discussion.',
        },
        stance_explanation: {
          type: 'STRING',
          description: 'Explanation for why this stance is recommended.',
        },
        key_points: {
          type: 'ARRAY',
          description: '3 to 5 key speaking points in speaking order, each with purpose tag.',
          items: {
            type: 'OBJECT',
            properties: {
              order: {
                type: 'INTEGER',
                description: 'Speaking sequence number (1, 2, 3...).',
              },
              purpose: {
                type: 'STRING',
                description: 'Purpose tag e.g. "Establish the professional setting", "First action step", "Teamwork".',
              },
              text: {
                type: 'STRING',
                description: 'Clear, discussion-ready speaking point.',
              },
            },
            required: ['order', 'purpose', 'text'],
          },
        },
        details_to_avoid: {
          type: 'STRING',
          description: 'Details from the story that should NOT be mentioned in GD. Explain why.',
        },
        connecting_with_others: {
          type: 'STRING',
          description: 'How to connect the candidate narrative with other candidates stories.',
        },
        weaknesses_handling: {
          type: 'STRING',
          description: 'Story weaknesses and concrete strategies to handle or defend them during discussion.',
        },
      },
      required: [
        'entry_strategy',
        'entry_timing',
        'entry_phrases',
        'stance',
        'stance_explanation',
        'key_points',
        'details_to_avoid',
        'connecting_with_others',
        'weaknesses_handling',
      ],
    },
  },
  required: [
    'schema_version',
    'scores',
    'picture_perception',
    'story_quality',
    'olq',
    'realism',
    'suitability',
    'changes',
    'verdict',
    'improved_story',
    'discussion',
  ],
} as const;

