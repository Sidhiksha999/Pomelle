import { useEffect, useState } from 'react';

/**
 * Returns the current time (Date.now()) and refreshes it every `intervalMs`.
 * Pass `null` to stop refreshing (for example while the timer is paused).
 *
 * This only re-renders the screen. The timer itself never counts these
 * refreshes: it always works out the time left from timestamps.
 */
export function useNow(intervalMs) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    setNow(Date.now());
    if (intervalMs == null) return undefined;
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    // When a background tab comes back, refresh at once instead of waiting.
    const onVisible = () => setNow(Date.now());
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [intervalMs]);

  return now;
}
