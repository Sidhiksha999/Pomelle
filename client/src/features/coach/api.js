// Talks to the Pomelle server (never to Gemini directly — the key stays on
// the server). Also keeps a small cache in localStorage so asking for the
// exact same thing twice doesn't use up any more of the free Gemini quota.

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
    response = await fetch(`/api${path}`, {
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
    // The dev proxy answers with an empty page when the server isn't running.
    throw new CoachError('OFFLINE', 'Could not reach the Pomelle server.');
  }

  if (!response.ok) {
    throw new CoachError(data?.error || 'SERVER_ERROR', data?.message || 'Something went wrong.');
  }

  writeCache([...readCache().filter((entry) => entry.key !== key), { key, data }]);
  return data;
}

/** { reachable, hasKey } — whether the server is running and has a Gemini key. */
export async function checkHealth() {
  try {
    const response = await fetch('/api/health');
    const data = await response.json();
    return { reachable: Boolean(data?.ok), hasKey: Boolean(data?.hasKey) };
  } catch {
    return { reachable: false, hasKey: false };
  }
}
