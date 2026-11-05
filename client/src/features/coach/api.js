// Talks to the Pomelle server (never to Gemini directly — the key stays on
// the server). Also keeps a small cache in localStorage so asking for the
// exact same thing twice doesn't use up any more of the free Gemini quota.

// Where the Pomelle server lives. Set VITE_API_URL when building for the web
// (see client/.env.production); during local development it falls back to the
// server on your own computer. Vite bakes this in at build time, so changing
// it needs a new build/deploy. Any trailing slash is removed.
const LOCAL_SERVER = 'http://localhost:8787';
export const API_URL = (import.meta.env.VITE_API_URL || LOCAL_SERVER).replace(/\/+$/, '');

const CACHE_KEY = 'pomelle:ai-cache';
const CACHE_SIZE = 30;

/** An error with a `code` the coach screens know how to explain in each theme's voice. */
export class CoachError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code; // OFFLINE | NO_KEY | BAD_INPUT | RATE_LIMITED | AI_FAILED | BAD_RESPONSE | SERVER_ERROR
  }
}

/** A short, stable fingerprint of a string (FNV-1a hash). */
function hash(text) {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(36);
}

function readCache() {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || '[]');
  } catch {
    return [];
  }
}

function writeCache(entries) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(entries.slice(-CACHE_SIZE)));
  } catch {
    // Storage full: skip caching, everything still works.
  }
}

/**
 * POST to /api/<path> and return the parsed JSON.
 * Throws CoachError on any problem.
 */
export async function postCoach(path, body) {
  const key = hash(path + JSON.stringify(body));
  const hit = readCache().find((entry) => entry.key === key);
  if (hit) return hit.data;

  let response;
  try {
    response = await fetch(`${API_URL}/api${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new CoachError('OFFLINE', 'Could not reach the Pomelle server.');
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    // Something answered, but not with JSON (e.g. a host's error page): treat it as unreachable.
    throw new CoachError('OFFLINE', 'Could not reach the Pomelle server.');
  }

  if (!response.ok) {
    throw new CoachError(data?.error || 'SERVER_ERROR', data?.message || 'Something went wrong.');
  }

  writeCache([...readCache().filter((entry) => entry.key !== key), { key, data }]);
  return data;
}

/** Is the API on this computer (local development) rather than on the web? */
export const IS_LOCAL_SERVER = /\/\/(localhost|127\.0\.0\.1)(:|\/|$)/.test(API_URL);

const HEALTH_PATIENCE_MS = 70000; // a sleeping free server can take about a minute to wake
const HEALTH_RETRY_MS = 5000;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** One look at /api/health. Returns { reachable, hasKey }, or null if it didn't answer properly. */
async function pingHealth() {
  try {
    const response = await fetch(`${API_URL}/api/health`, { cache: 'no-store' });
    if (!response.ok) return null; // e.g. the host's "starting up" page
    const data = await response.json();
    return data?.ok ? { reachable: true, hasKey: Boolean(data.hasKey) } : null;
  } catch {
    return null;
  }
}

/**
 * { reachable, hasKey }: whether the server is running and has a Gemini key.
 * Keeps trying for about a minute, because a server that is waking up or
 * restarting doesn't answer straight away. `onWaiting` is called after the
 * first failed try, so the page can say "waking up…".
 */
export async function checkHealth({ onWaiting } = {}) {
  const giveUpAt = Date.now() + HEALTH_PATIENCE_MS;
  for (let attempt = 1; ; attempt += 1) {
    const result = await pingHealth();
    if (result) return result;
    if (Date.now() + HEALTH_RETRY_MS > giveUpAt) return { reachable: false, hasKey: false };
    if (attempt === 1) onWaiting?.();
    await wait(HEALTH_RETRY_MS);
  }
}
