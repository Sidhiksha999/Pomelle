import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

const QUERY = '(prefers-reduced-motion: reduce)';

/**
 * True when animations should be calmed down.
 * The in-app setting wins; "system" follows the operating system preference.
 */
export function useReducedMotion() {
  const setting = useSelector((s) => s.theme.reducedMotion);
  const [systemPrefersReduced, setSystemPrefersReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(QUERY).matches,
  );

  useEffect(() => {
    const media = window.matchMedia(QUERY);
    const onChange = () => setSystemPrefersReduced(media.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  if (setting === 'on') return true;
  if (setting === 'off') return false;
  return systemPrefersReduced;
}
