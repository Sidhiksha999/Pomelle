import { useState } from 'react';
import Header from './components/Header';
import SettingsDialog from './components/SettingsDialog';
import CelebrationLayer from './components/CelebrationLayer';
import TimerPage from './features/timer/TimerPage';
import { useCurrentTheme } from './components/hooks/useCurrentTheme';
import { useThemeEffects } from './themes/useThemeEffects';
import { useTimerEngine } from './features/timer/useTimerEngine';

export default function App() {
  // These two run for the whole life of the app, whatever page is showing.
  useThemeEffects();
  useTimerEngine();

  const theme = useCurrentTheme();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const Backdrop = theme.Backdrop;

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to the timer
      </a>
      {/* key remounts the backdrop when the theme changes */}
      {Backdrop && <Backdrop key={theme.id} />}
      <div className="app-shell">
        <Header onOpenSettings={() => setSettingsOpen(true)} />
        <main id="main" tabIndex={-1}>
          <TimerPage />
        </main>
      </div>
      <CelebrationLayer />
      <SettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}
