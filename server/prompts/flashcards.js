import { Type } from '@google/genai';

// Notes → flashcards.
// Each card also gets three wrong-but-believable answers, used by quiz mode.

const DIFFICULTY_GUIDE = {
  easy: 'Ask about key terms and definitions. One clear fact per card.',
  medium: 'Mix definitions with "why" and "how" questions that connect ideas.',
  hard: 'Ask application, comparison and cause-and-effect questions that need real understanding.',
};

export const system = `You write excellent study flashcards from a student's notes.

Rules:
- Use ONLY information found in the notes. Never invent facts.
- One idea per card. Questions must make sense on their own, without the notes.
- Answers are short: at most 30 words.
- Avoid yes/no questions and avoid repeating the same fact on two cards.
- "distractors" are exactly 3 wrong answers that sound plausible, are similar in length and style to the real answer, and are clearly wrong to someone who studied.
- "deckTitle" is a short name for the topic (at most 6 words).
- Write in the same language as the notes.`;

export function buildPrompt({ notes, count, difficulty }) {
  return `Make exactly ${count} flashcards.
Difficulty: ${difficulty}. ${DIFFICULTY_GUIDE[difficulty]}

Notes:
"""
${notes}
"""`;
}

export const schema = {
  type: Type.OBJECT,
  properties: {
    deckTitle: { type: Type.STRING },
    cards: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          answer: { type: Type.STRING },
          distractors: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ['question', 'answer', 'distractors'],
        propertyOrdering: ['question', 'answer', 'distractors'],
      },
    },
  },
  required: ['deckTitle', 'cards'],
  propertyOrdering: ['deckTitle', 'cards'],
};
