import { useEffect } from 'react';
import { useCurrentTheme } from '../components/hooks/useCurrentTheme';
import { useReducedMotion } from '../components/hooks/useReducedMotion';
import { svgToDataUri } from './index';

/**
 * Applies the active theme to the whole page:
 * - data-theme on <html>, which switches every CSS variable
 * - data-motion on <html>, which calms animations when needed
 * - the custom cursor, favicon and browser theme color
 */
export function useThemeEffects() {
  const theme = useCurrentTheme();
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme.id);

    // Cursors: the numbers after the URL are the "hotspot" (the clicking point).
    if (theme.cursor) {
      const hotspot = theme.id === 'cat' ? '16 16' : '4 3';
      root.style.setProperty('--cursor', `url("${svgToDataUri(theme.cursor.default)}") ${hotspot}, auto`);
      root.style.setProperty('--cursor-pointer', `url("${svgToDataUri(theme.cursor.pointer)}") ${hotspot}, pointer`);
    } else {
      root.style.setProperty('--cursor', 'auto');
      root.style.setProperty('--cursor-pointer', 'pointer');
    }

    const favicon = document.getElementById('favicon');
    if (favicon) favicon.setAttribute('href', svgToDataUri(theme.icon));

    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) themeColor.setAttribute('content', theme.themeColor);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-motion', reducedMotion ? 'reduced' : 'full');
  }, [reducedMotion]);
}
