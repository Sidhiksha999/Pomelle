import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

const QUERY = '(prefers-color-scheme: dark)';

/**
 * True when the night look should be used.
 * The in-app setting wins; "system" follows the device's light/dark setting.
 * (Whether the current theme actually HAS a night look is checked by the caller.)
 */
export function useDarkMode() {
  const setting = useSelector((s) => s.theme.colorMode);
  const [systemPrefersDark, setSystemPrefersDark] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(QUERY).matches,
  );

  useEffect(() => {
    const media = window.matchMedia(QUERY);
    const onChange = () => setSystemPrefersDark(media.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  if (setting === 'dark') return true;
  if (setting === 'light') return false;
  return systemPrefersDark;
}
