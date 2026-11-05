import { Router } from 'express';
import { AppError, generateJson } from '../gemini.js';
import * as mindmapPrompt from '../prompts/mindmap.js';

const router = Router();

const clean = (text, max) => String(text ?? '').trim().slice(0, max);
const hours = (value) => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.round(Math.min(n, 100) * 2) / 2 : 0; // nearest half hour
};

/**
 * POST /api/mindmap   body: { goal: string }
 * Answers: { map: { goal, summary, branches: [{ title, estimateHours, children: [...] }] }, cached }
 */
router.post('/', async (req, res, next) => {
  try {
    const goal = clean(req.body?.goal, 500);
    if (goal.length < 3) {
      throw new AppError('BAD_INPUT', 'Please describe your goal in a few words.', 400);
    }

    const { data, cached } = await generateJson({
      task: 'mindmap',
      system: mindmapPrompt.system,
      prompt: mindmapPrompt.buildPrompt({ goal }),
      schema: mindmapPrompt.schema,
    });

    // Never trust the shape blindly: trim, limit and drop empty items.
    const branches = (Array.isArray(data.branches) ? data.branches : [])
      .slice(0, 6)
      .map((b) => ({
        title: clean(b.title, 80),
        estimateHours: hours(b.estimateHours),
        children: (Array.isArray(b.children) ? b.children : [])
          .slice(0, 5)
          .map((c) => ({ title: clean(c.title, 80), estimateHours: hours(c.estimateHours) }))
          .filter((c) => c.title),
      }))
      .filter((b) => b.title);

    if (branches.length === 0) {
      throw new AppError('BAD_RESPONSE', 'The AI returned an empty plan.', 502);
    }

    res.json({
      map: { goal: clean(data.goal, 120) || goal, summary: clean(data.summary, 240), branches },
      cached,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
