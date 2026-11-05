import { Router } from 'express';
import { AppError, generateJson } from '../gemini.js';
import * as flashcardPrompt from '../prompts/flashcards.js';

const router = Router();

const DIFFICULTIES = ['easy', 'medium', 'hard'];
const MAX_NOTES = 20000; // characters, roughly 8–10 pages of notes
const clean = (text, max) => String(text ?? '').trim().slice(0, max);

/**
 * POST /api/flashcards   body: { notes: string, count: number, difficulty: 'easy' | 'medium' | 'hard' }
 * Answers: { deck: { title, cards: [{ question, answer, distractors: [3] }] }, cached }
 */
router.post('/', async (req, res, next) => {
  try {
    const notes = clean(req.body?.notes, MAX_NOTES);
    const count = Math.round(Number(req.body?.count));
    const difficulty = req.body?.difficulty;

    if (notes.length < 40) {
      throw new AppError('BAD_INPUT', 'Paste a bit more of your notes (at least a couple of sentences).', 400);
    }
    if (!Number.isFinite(count) || count < 3 || count > 30) {
      throw new AppError('BAD_INPUT', 'Pick between 3 and 30 cards.', 400);
    }
    if (!DIFFICULTIES.includes(difficulty)) {
      throw new AppError('BAD_INPUT', 'Difficulty must be easy, medium or hard.', 400);
    }

    const { data, cached } = await generateJson({
      task: 'flashcards',
      system: flashcardPrompt.system,
      prompt: flashcardPrompt.buildPrompt({ notes, count, difficulty }),
      schema: flashcardPrompt.schema,
      temperature: 0.4, // stay close to the notes
    });

    const cards = (Array.isArray(data.cards) ? data.cards : [])
      .slice(0, count)
      .map((c) => ({
        question: clean(c.question, 300),
        answer: clean(c.answer, 300),
        distractors: (Array.isArray(c.distractors) ? c.distractors : [])
          .map((d) => clean(d, 300))
          .filter(Boolean)
          .slice(0, 3),
      }))
      .filter((c) => c.question && c.answer);

    if (cards.length === 0) {
      throw new AppError('BAD_RESPONSE', 'The AI returned no cards.', 502);
    }

    res.json({ deck: { title: clean(data.deckTitle, 60) || 'New deck', cards }, cached });
  } catch (error) {
    next(error);
  }
});

export default router;
