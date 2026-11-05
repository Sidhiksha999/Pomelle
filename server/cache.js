import { createHash } from 'node:crypto';

// A small in-memory cache so the same request isn't sent to Gemini twice.
// This saves free-tier quota when someone presses "generate" again with the
// same input. It is emptied when the server restarts (the browser keeps its
// own copy too).

const MAX_ENTRIES = 200;
const entries = new Map(); // Map keeps insertion order, which we use for "oldest first"

/** A short fingerprint of any JSON-able value. */
export function cacheKey(...parts) {
  return createHash('sha256').update(JSON.stringify(parts)).digest('hex');
}

export function getCached(key) {
  if (!entries.has(key)) return undefined;
  // Move it to the end so it counts as recently used.
  const value = entries.get(key);
  entries.delete(key);
  entries.set(key, value);
  return value;
}

export function setCached(key, value) {
  entries.set(key, value);
  if (entries.size > MAX_ENTRIES) {
    const oldestKey = entries.keys().next().value;
    entries.delete(oldestKey);
  }
}
