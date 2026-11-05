import { useEffect, useState } from 'react';

// A tiny router built on the URL hash (#/timer, #/stats …), so no routing
// package is needed. The hash also makes the browser back button work.

export const ROUTES = ['timer', 'methods', 'coach', 'stats'];
const DEFAULT_ROUTE = 'timer';

/** The hash split into parts: "#/methods/feynman" → ["methods", "feynman"]. */
function hashParts() {
  return window.location.hash.replace(/^#\/?/, '').split('/');
}

/** "#/stats" → "stats". Anything unknown falls back to the timer. */
function readRoute() {
  const name = hashParts()[0];
  return ROUTES.includes(name) ? name : DEFAULT_ROUTE;
}

/** The part after the page name: "#/methods/feynman" → "feynman" (or null). */
function readParam() {
  return hashParts()[1] || null;
}

export function routeHref(name, param) {
  return param ? `#/${name}/${param}` : `#/${name}`;
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

/** The current sub-page, e.g. which study method is open; updates with the hash. */
export function useHashParam() {
  const [param, setParam] = useState(readParam);

  useEffect(() => {
    const onChange = () => setParam(readParam());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  return param;
}
