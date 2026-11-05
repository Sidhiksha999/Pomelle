import { useState } from 'react';
import { deckProgress, usableCards } from '../../../store/flashcardsSlice';
import StudyMode from './StudyMode';
import QuizMode from './QuizMode';
import DeckEditor from './DeckEditor';

const MODES = [
  { id: 'study', label: 'Study' },
  { id: 'quiz', label: 'Quiz' },
  { id: 'edit', label: 'Edit' },
];

/** One deck: its progress, and the study / quiz / edit modes. */
export default function DeckView({ deck }) {
  // A brand-new hand-made deck opens in edit mode so you can write cards.
  const [mode, setMode] = useState(usableCards(deck).length === 0 ? 'edit' : 'study');
  const progress = deckProgress(deck, Date.now());

  return (
    <div className="deck-view">
      <div className="map-head">
        <div>
          <h2 className="map-head__title">{deck.title}</h2>
          <p className="map-head__summary">
            {progress.total} cards · {progress.mastered} learned · {progress.due} due now
          </p>
        </div>
        <div className="map-head__tools">
          <div
            className="coach-progress"
            role="progressbar"
            aria-label="Cards learned"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress.ratio * 100)}
          >
            <span className="coach-progress__bar" style={{ width: `${progress.ratio * 100}%` }} />
          </div>
          <div className="segmented" role="group" aria-label="Mode">
            {MODES.map((m) => (
              <button key={m.id} type="button" aria-pressed={mode === m.id} onClick={() => setMode(m.id)}>
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {mode === 'study' && <StudyMode deck={deck} onEdit={() => setMode('edit')} />}
      {mode === 'quiz' && <QuizMode deck={deck} onEdit={() => setMode('edit')} />}
      {mode === 'edit' && <DeckEditor deck={deck} />}
    </div>
  );
}
