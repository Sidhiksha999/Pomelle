// Small helpers that save parts of the Redux state to localStorage
// and load them back when the app starts.

// One key holds everything. Bump the "v1" if the saved shape ever changes
// in a way that old data can't be merged.
export const STORAGE_KEY = 'pomelle:v1';

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : undefined;
  } catch {
    // Private mode, blocked storage or broken JSON: start fresh.
    return undefined;
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or blocked. The app still works, it just won't remember.
  }
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Merge saved data on top of a slice's defaults.
 * - Only keys that exist in the defaults are kept, so stale fields from an
 *   older version are dropped.
 * - New fields added in a newer version keep their default value.
 * - Nested objects are merged the same way; arrays are replaced whole.
 */
export function mergeSaved(defaults, saved) {
  if (!isPlainObject(saved)) return defaults;
  const result = { ...defaults };
  for (const key of Object.keys(defaults)) {
    if (!(key in saved)) continue;
    if (isPlainObject(defaults[key]) && isPlainObject(saved[key])) {
      result[key] = mergeSaved(defaults[key], saved[key]);
    } else {
      result[key] = saved[key];
    }
  }
  return result;
}
