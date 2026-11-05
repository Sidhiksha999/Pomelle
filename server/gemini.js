import { ApiError, GoogleGenAI } from '@google/genai';
import { cacheKey, getCached, setCached } from './cache.js';

// Everything that talks to Gemini lives here. Routes call generateJson()
// and get back a parsed object, or an AppError with a friendly code.

// The main model, then backups that are tried if it is busy or unavailable.
// "gemini-flash-latest" and "gemini-flash-lite-latest" always point at
// Google's current Flash models. The "lite" models give slightly simpler
// answers but are often free when the bigger ones are overloaded.
export const MODEL = process.env.GEMINI_MODEL?.trim() || 'gemini-3.5-flash';
const FALLBACK_MODELS = [
  'gemini-flash-latest',
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-flash-lite-latest',
  'gemini-3.5-flash',
].filter((m) => m !== MODEL);

// Created only when a key exists, so the server can still start without one.
// The SDK's own retries are switched off (attempts: 1) because we retry
// ourselves below, within a time budget. Without this, a busy day could keep
// one request waiting for minutes.
const apiKey = process.env.GEMINI_API_KEY?.trim();
const ai = apiKey
  ? new GoogleGenAI({ apiKey, httpOptions: { timeout: 20000, retryOptions: { attempts: 1 } } })
  : null;

// The longest we keep the student waiting before saying "try again later".
const TIME_BUDGET_MS = 45000;

export function hasKey() {
  return Boolean(ai);
}

/**
 * An error the client knows how to explain.
 * code: NO_KEY | BAD_INPUT | RATE_LIMITED | AI_FAILED | BAD_RESPONSE
 */
export class AppError extends Error {
  constructor(code, message, status) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Busy servers (429, 5xx), timeouts and network hiccups are worth another try. */
function isRetryable(error) {
  if (error instanceof ApiError) return error.status === 429 || error.status >= 500 || error.status === 404;
  return ['TypeError', 'AbortError', 'TimeoutError'].includes(error?.name) || ['ECONNRESET', 'ETIMEDOUT'].includes(error?.code);
}

// The order we try things in: the main model, each backup once, then the main model again.
const ATTEMPTS = [MODEL, ...FALLBACK_MODELS, MODEL];

/** One request to one model, parsed as JSON. */
async function callOnce(model, { system, prompt, schema, temperature }) {
  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction: system,
      responseMimeType: 'application/json', // JSON output mode
      responseSchema: schema, // ...shaped exactly like this
      temperature,
    },
  });
  try {
    return JSON.parse(response.text ?? '');
  } catch {
    throw new AppError('BAD_RESPONSE', 'The AI sent back something that was not valid JSON.', 502);
  }
}

/** Turn whatever went wrong into an error the client can explain. */
function explain(error) {
  if (error instanceof AppError) return error;
  if (['AbortError', 'TimeoutError'].includes(error?.name)) {
    return new AppError('RATE_LIMITED', 'Gemini is taking too long to answer right now. Try again in a minute.', 504);
  }
  if (error instanceof ApiError) {
    if (error.status === 429 || error.status >= 500) {
      return new AppError('RATE_LIMITED', 'Gemini is busy or the free quota is used up. Try again in a minute.', 429);
    }
    if ([400, 401, 403].includes(error.status) && /api key|permission|unauth/i.test(error.message)) {
      return new AppError('NO_KEY', 'Gemini did not accept the API key. Check GEMINI_API_KEY in server/.env.', 503);
    }
  }
  console.error('[gemini] request failed:', error);
  return new AppError('AI_FAILED', 'The AI could not answer right now.', 502);
}

/**
 * Ask Gemini for JSON that matches `schema`.
 * @param {object} options
 * @param {string} options.task          a name used in the cache key, e.g. "mindmap"
 * @param {string} options.system        the system instruction (from /prompts)
 * @param {string} options.prompt        the user message (from /prompts)
 * @param {object} options.schema        the response schema (from /prompts)
 * @param {number} [options.temperature]
 */
export async function generateJson({ task, system, prompt, schema, temperature = 0.7 }) {
  if (!ai) {
    throw new AppError('NO_KEY', 'The AI coach needs a Gemini API key in server/.env.', 503);
  }

  const key = cacheKey(task, system, prompt);
  const cached = getCached(key);
  if (cached) return { data: cached, cached: true };

  const started = Date.now();
  let lastError;
  for (const [index, model] of ATTEMPTS.entries()) {
    try {
      const data = await callOnce(model, { system, prompt, schema, temperature });
      setCached(key, data);
      return { data, cached: false };
    } catch (error) {
      lastError = error;
      if (error instanceof AppError || !isRetryable(error)) break;
      // Stop if there isn't enough time left for another full attempt.
      if (Date.now() - started > TIME_BUDGET_MS - 20000) break;
      console.warn(`[gemini] ${model} failed (${error.status ?? error.name}), trying again…`);
      // A short pause that grows a little each time, but never past 2.5s,
      // so there's time to try every backup model within the budget.
      await wait(Math.min(800 * (index + 1), 2500) + Math.random() * 300);
    }
  }
  throw explain(lastError);
}
