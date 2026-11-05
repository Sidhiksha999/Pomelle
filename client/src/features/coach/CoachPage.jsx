import { useCallback, useEffect, useState } from 'react';
import { useCurrentTheme } from '../../components/hooks/useCurrentTheme';
import { useHashParam } from '../../components/hooks/useHashRoute';
import { checkHealth } from './api';
import Icon from '../../components/Icon';
import CoachNotice from './CoachNotice';
import MindMapPanel from './mindmap/MindMapPanel';
import FlashcardsPanel from './flashcards/FlashcardsPanel';
import './coach.css';

const TABS = [
  { id: 'map', label: 'Goal → Mind map' },
  { id: 'cards', label: 'Notes → Flashcards' },
];

/**
 * The AI coach: two tools on two tabs. Both also work without the AI
 * (blank maps, hand-written decks), so a missing key never blocks the page.
 */
export default function CoachPage() {
  const { voice } = useCurrentTheme();
  const copy = voice.coach;
  // #/coach/cards opens straight on the flashcards tab.
  const param = useHashParam();
  const [tab, setTab] = useState(param === 'cards' ? 'cards' : 'map');
  useEffect(() => {
    if (param === 'cards' || param === 'map') setTab(param);
  }, [param]);
  const [health, setHealth] = useState(null); // null while checking
  const [waking, setWaking] = useState(false); // the first check failed, still trying

  const refreshHealth = useCallback(() => {
    let cancelled = false; // stop updating if the page is left mid-check
    setHealth(null);
    setWaking(false);
    checkHealth({ onWaiting: () => !cancelled && setWaking(true) }).then((result) => {
      if (cancelled) return;
      setHealth(result);
      setWaking(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(refreshHealth, [refreshHealth]);

  // Left/right arrow keys move between tabs (the standard tab pattern).
  const onTabKey = (event) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    const next = tab === 'map' ? 'cards' : 'map';
    setTab(next);
    document.getElementById(`coach-tab-${next}`)?.focus();
  };

  return (
    <section className="coach-page" aria-labelledby="coach-title">
      <header className="coach-hero">
        <h1 id="coach-title">{copy.title}</h1>
        <p className="coach-hero__intro">{copy.intro}</p>
      </header>

      {waking && (
        <p className="coach-waking" role="status">
          <Icon name="refresh" />
          Waking up the coach’s server… on the free plan this can take up to a minute.
        </p>
      )}
      {health && (!health.reachable || !health.hasKey) && <CoachNotice health={health} onRecheck={refreshHealth} />}

      <div className="coach-tabs" role="tablist" aria-label="Coach tools">
        {TABS.map((t) => (
          <button
            key={t.id}
            id={`coach-tab-${t.id}`}
            type="button"
            role="tab"
            className="coach-tab"
            aria-selected={tab === t.id}
            aria-controls={`coach-panel-${t.id}`}
            tabIndex={tab === t.id ? 0 : -1}
            onClick={() => setTab(t.id)}
            onKeyDown={onTabKey}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div
        id={`coach-panel-${tab}`}
        className="coach-panel"
        role="tabpanel"
        aria-labelledby={`coach-tab-${tab}`}
      >
        {tab === 'map' ? <MindMapPanel /> : <FlashcardsPanel />}
      </div>
    </section>
  );
}
