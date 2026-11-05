import { Router } from 'express';
import { AppError, generateJson } from '../gemini.js';
import * as feynmanPrompt from '../prompts/feynman.js';

const router = Router();

const clean = (text, max) => String(text ?? '').trim().slice(0, max);
const score = (value, max) => Math.min(max, Math.max(1, Math.round(Number(value) || 1)));
const list = (value, maxItems, maxLength) =>
  (Array.isArray(value) ? value : []).map((item) => clean(item, maxLength)).filter(Boolean).slice(0, maxItems);

/**
 * POST /api/feynman   body: { topic, audience: 'child' | 'classmate' | 'beginner', explanation }
 * Answers: { review: { clarity, accuracy, completeness, overall, verdict, strengths, gaps, jargon, simplerVersion, followUpQuestions }, cached }
 */
router.post('/', async (req, res, next) => {
  try {
    const topic = clean(req.body?.topic, 120);
    const explanation = clean(req.body?.explanation, 6000);
    const audience = req.body?.audience;

    if (topic.length < 2) throw new AppError('BAD_INPUT', 'Write down which topic you are explaining.', 400);
    if (explanation.length < 40) {
      throw new AppError('BAD_INPUT', 'Write a little more of your explanation (a few sentences at least).', 400);
    }
    if (!Object.hasOwn(feynmanPrompt.AUDIENCES, audience)) {
      throw new AppError('BAD_INPUT', 'Pick who you are explaining it to.', 400);
    }

    const { data, cached } = await generateJson({
      task: 'feynman',
      system: feynmanPrompt.system,
      prompt: feynmanPrompt.buildPrompt({ topic, audience, explanation }),
      schema: feynmanPrompt.schema,
      temperature: 0.4,
    });

    res.json({
      review: {
        clarity: score(data.clarity, 5),
        accuracy: score(data.accuracy, 5),
        completeness: score(data.completeness, 5),
        overall: score(data.overall, 10),
        verdict: clean(data.verdict, 240),
        strengths: list(data.strengths, 3, 200),
        gaps: list(data.gaps, 4, 300),
        jargon: (Array.isArray(data.jargon) ? data.jargon : [])
          .map((j) => ({ term: clean(j.term, 60), plain: clean(j.plain, 160) }))
          .filter((j) => j.term && j.plain)
          .slice(0, 6),
        simplerVersion: clean(data.simplerVersion, 1200),
        followUpQuestions: list(data.followUpQuestions, 3, 200),
      },
      cached,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
