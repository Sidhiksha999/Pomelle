import { useEffect, useRef, useState } from 'react';
import Header from './components/Header';
import SettingsDialog from './components/SettingsDialog';
import CelebrationLayer from './components/CelebrationLayer';
import TimerPage from './features/timer/TimerPage';
import StatsPage from './features/stats/StatsPage';
import { useCurrentTheme } from './components/hooks/useCurrentTheme';
import { useHashRoute } from './components/hooks/useHashRoute';
import { useThemeEffects } from './themes/useThemeEffects';
import { useTimerEngine } from './features/timer/useTimerEngine';

const PAGES = {
  timer: TimerPage,
  stats: StatsPage,
};

export default function App() {
  // These two run for the whole life of the app, whatever page is showing.
  useThemeEffects();
  useTimerEngine();

  const theme = useCurrentTheme();
  const route = useHashRoute();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const mainRef = useRef(null);
  const Backdrop = theme.Backdrop;
  const Page = PAGES[route];

  // After changing page, move keyboard focus to the new content and scroll up.
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    window.scrollTo(0, 0);
    mainRef.current?.focus({ preventScroll: true });
  }, [route]);

  // The skip link can't use href="#main" because the hash is our router.
  const skipToMain = (event) => {
    event.preventDefault();
    mainRef.current?.focus();
  };

  return (
    <>
      <a className="skip-link" href="#/" onClick={skipToMain}>
        Skip to main content
      </a>
      {/* key remounts the backdrop when the theme changes */}
      {Backdrop && <Backdrop key={theme.id} />}
      <div className="app-shell">
        <Header route={route} onOpenSettings={() => setSettingsOpen(true)} />
        <main id="main" ref={mainRef} tabIndex={-1} className="app-main">
          <Page />
        </main>
      </div>
      <CelebrationLayer />
      <SettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}
