import { useState } from 'react';
import { useSelector } from 'react-redux';
import { deckProgress } from '../../../store/flashcardsSlice';
import { routeHref } from '../../../components/hooks/useHashRoute';
import StudyMode from '../../coach/flashcards/StudyMode';

/**
 * Active recall + spaced repetition, using your flashcard decks.
 * The scheduling is the same one the coach's study mode uses.
 */
export default function RecallGuide() {
  const decks = useSelector((s) => s.flashcards.decks);
  const [deckId, setDeckId] = useState(decks[0]?.id ?? '');
  const deck = decks.find((d) => d.id === deckId);
  const now = Date.now();

  if (decks.length === 0) {
    return (
      <div className="guide">
        <h2>First, make some flashcards</h2>
        <p className="guide__tip">
          Active recall works on questions. Paste your notes into the AI coach to turn them into a deck, or write
          cards yourself, then come back here.
        </p>
        <a className="btn btn--primary" href={routeHref('coach', 'cards')}>
          Make a deck
        </a>
      </div>
    );
  }

  return (
    <div className="guide guide--recall">
      <div className="field">
        <label className="field__label" htmlFor="recall-deck">
          Deck to practise
        </label>
        <select id="recall-deck" className="input" value={deckId} onChange={(event) => setDeckId(event.target.value)}>
          {decks.map((d) => {
            const p = deckProgress(d, now);
            return (
              <option key={d.id} value={d.id}>
                {d.title} ({p.due} due)
              </option>
            );
          })}
        </select>
      </div>
      <p className="guide__tip">
        Read the question, answer it in your head (or out loud) <em>before</em> flipping. Be honest with the buttons:
        that’s what decides when each card comes back.
      </p>
      {deck && <StudyMode key={deck.id} deck={deck} onEdit={() => (window.location.hash = routeHref('coach', 'cards'))} />}
    </div>
  );
}
