import { Type } from '@google/genai';

// Feynman technique: the student explains a topic in plain words and the
// coach gives honest, kind feedback on how clear and correct it was.

export const AUDIENCES = {
  child: 'a curious 12-year-old',
  classmate: 'a classmate who missed the lecture',
  beginner: 'an adult who has never studied this subject',
};

export const system = `You are a kind but honest tutor reviewing a student's Feynman-technique explanation.
The student tried to explain a topic in simple words, as if teaching someone else.

Judge it on:
- clarity: could the stated audience follow it? Short sentences, plain words, good examples.
- accuracy: is everything said correct? Flag real errors only, not simplifications that are fair for the audience.
- completeness: are the key ideas there, or are there gaps the audience would trip on?

Rules:
- Scores are whole numbers from 1 (poor) to 5 (excellent). "overall" is from 1 to 10.
- "verdict" is one warm, specific sentence (at most 25 words).
- "strengths": 1 to 3 short points about what worked.
- "gaps": 0 to 4 short points: errors, missing steps or vague parts. Quote the student's words when useful.
- "jargon": technical words the audience wouldn't know, each with a plain-language replacement. Empty if none.
- "simplerVersion": your own clearer explanation for the same audience, at most 120 words.
- "followUpQuestions": exactly 3 questions the audience might ask next, to test deeper understanding.
- Write in the same language as the student.`;

export function buildPrompt({ topic, audience, explanation }) {
  return `Topic: ${topic}
Audience: ${AUDIENCES[audience]}

The student's explanation:
"""
${explanation}
"""`;
}

const shortList = { type: Type.ARRAY, items: { type: Type.STRING } };

export const schema = {
  type: Type.OBJECT,
  properties: {
    clarity: { type: Type.INTEGER },
    accuracy: { type: Type.INTEGER },
    completeness: { type: Type.INTEGER },
    overall: { type: Type.INTEGER },
    verdict: { type: Type.STRING },
    strengths: shortList,
    gaps: shortList,
    jargon: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: { term: { type: Type.STRING }, plain: { type: Type.STRING } },
        required: ['term', 'plain'],
        propertyOrdering: ['term', 'plain'],
      },
    },
    simplerVersion: { type: Type.STRING },
    followUpQuestions: shortList,
  },
  required: ['clarity', 'accuracy', 'completeness', 'overall', 'verdict', 'strengths', 'gaps', 'jargon', 'simplerVersion', 'followUpQuestions'],
  propertyOrdering: ['clarity', 'accuracy', 'completeness', 'overall', 'verdict', 'strengths', 'gaps', 'jargon', 'simplerVersion', 'followUpQuestions'],
};
