import { useCallback, useEffect, useState } from 'react';
import { useCurrentTheme } from '../../components/hooks/useCurrentTheme';
import { checkHealth } from './api';
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
  const [tab, setTab] = useState('map');
  const [health, setHealth] = useState(null); // null while checking

  const refreshHealth = useCallback(() => {
    checkHealth().then(setHealth);
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
