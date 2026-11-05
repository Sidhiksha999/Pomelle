// Load server/.env before anything reads process.env.
import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import { AppError, hasKey, MODEL } from './gemini.js';
import mindmapRoute from './routes/mindmap.js';
import flashcardsRoute from './routes/flashcards.js';
import feynmanRoute from './routes/feynman.js';

const app = express();
const PORT = Number(process.env.PORT) || 8787;

// CORS: which websites may call this API from a browser.
// - the deployed client, from CLIENT_URL (e.g. https://pomellee.vercel.app;
//   several can be listed, separated by commas)
// - any localhost port, for local development
const clientUrls = (process.env.CLIENT_URL || '')
  .split(',')
  .map((url) => url.trim().replace(/\/+$/, '')) // "https://x.app/" → "https://x.app"
  .filter(Boolean);

const corsOptions = {
  origin: [...clientUrls, /^http:\/\/localhost:\d+$/, /^http:\/\/127\.0\.0\.1:\d+$/],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  maxAge: 86400, // browsers may cache the preflight answer for a day
};

// Before a cross-site POST with JSON, browsers send an OPTIONS "preflight"
// request. This middleware answers it (204 + the Access-Control-* headers)
// and adds the right headers to every other response too.
app.use(cors(corsOptions));
app.use(express.json({ limit: '100kb' }));

// Lets the client know whether the AI coach is ready. Never reveals the key.
app.get('/api/health', (req, res) => {
  res.json({ ok: true, hasKey: hasKey(), model: MODEL });
});

app.use('/api/mindmap', mindmapRoute);
app.use('/api/flashcards', flashcardsRoute);
app.use('/api/feynman', feynmanRoute);

app.use('/api', (req, res) => {
  res.status(404).json({ error: 'NOT_FOUND', message: 'No such API route.' });
});

// One place that turns every error into the same JSON shape:
// { error: 'CODE', message: 'Human-readable explanation' }
// Express recognises an error handler by its four parameters, so `next`
// must stay in the list even though it isn't used.
app.use((error, req, res, next) => {
  if (error instanceof AppError) {
    return res.status(error.status).json({ error: error.code, message: error.message });
  }
  if (error?.type === 'entity.too.large') {
    return res.status(413).json({ error: 'BAD_INPUT', message: 'That text is too long. Try a shorter piece of your notes.' });
  }
  if (error?.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'BAD_INPUT', message: 'The request was not valid JSON.' });
  }
  console.error(error);
  res.status(500).json({ error: 'SERVER_ERROR', message: 'Something went wrong on the server.' });
});

app.listen(PORT, () => {
  console.log(`Pomelle server listening on http://localhost:${PORT}`);
  console.log(hasKey() ? `AI coach ready (model: ${MODEL})` : 'No GEMINI_API_KEY found: the AI coach will ask for one.');
});
