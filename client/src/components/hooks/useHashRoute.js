import { useEffect, useState } from 'react';

// A tiny router built on the URL hash (#/timer, #/stats …), so no routing
// package is needed. The hash also makes the browser back button work.

export const ROUTES = ['timer', 'coach', 'stats'];
const DEFAULT_ROUTE = 'timer';

/** "#/stats" → "stats". Anything unknown falls back to the timer. */
function readRoute() {
  const name = window.location.hash.replace(/^#\/?/, '');
  return ROUTES.includes(name) ? name : DEFAULT_ROUTE;
}

export function routeHref(name) {
  return `#/${name}`;
}

/** The current page name; updates when the hash changes. */
export function useHashRoute() {
  const [route, setRoute] = useState(readRoute);

  useEffect(() => {
    const onChange = () => setRoute(readRoute());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  return route;
}
