import { Type } from '@google/genai';

// Goal → mind map.
// Tweak the wording here to change how the coach plans. The schema makes
// Gemini answer in exactly this JSON shape.

export const system = `You are a warm, practical study coach.
A student gives you a goal. Break it into a mind map they can actually work through.

Rules:
- 3 to 6 main branches. Each branch is a milestone, subject or phase, in a sensible order.
- 2 to 5 sub-branches per branch. Each is a concrete topic or task, small enough for 1 to 4 Pomodoro sessions.
- Titles are short: at most 7 words, no numbering, no emoji, no trailing punctuation.
- estimateHours is your honest guess of focused study time for that item (0.5 to 20). Use 0 when you really can't tell.
- "goal" is a clean, short restatement of the student's goal (at most 10 words).
- "summary" is one encouraging sentence (at most 25 words) about how to approach it.
- Write in the same language the student used.`;

export function buildPrompt({ goal }) {
  return `My goal: ${goal}`;
}

const leaf = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    estimateHours: { type: Type.NUMBER },
  },
  required: ['title', 'estimateHours'],
  propertyOrdering: ['title', 'estimateHours'],
};

export const schema = {
  type: Type.OBJECT,
  properties: {
    goal: { type: Type.STRING },
    summary: { type: Type.STRING },
    branches: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          estimateHours: { type: Type.NUMBER },
          children: { type: Type.ARRAY, items: leaf },
        },
        required: ['title', 'estimateHours', 'children'],
        propertyOrdering: ['title', 'estimateHours', 'children'],
      },
    },
  },
  required: ['goal', 'summary', 'branches'],
  propertyOrdering: ['goal', 'summary', 'branches'],
};
