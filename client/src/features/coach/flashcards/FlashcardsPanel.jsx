import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  clearFlashcardError,
  createDeck,
  deckProgress,
  deleteDeck,
  generateDeck,
  setActiveDeck,
} from '../../../store/flashcardsSlice';
import { useCurrentTheme } from '../../../components/hooks/useCurrentTheme';
import Icon from '../../../components/Icon';
import { CoachError, CoachSkeleton } from '../CoachNotice';
import DeckView from './DeckView';

const MAX_NOTES = 20000;
const DIFFICULTIES = ['easy', 'medium', 'hard'];

export default function FlashcardsPanel() {
  const dispatch = useDispatch();
  const { voice } = useCurrentTheme();
  const copy = voice.coach;
  const { decks, activeDeckId, status, error } = useSelector((s) => s.flashcards);
  const activeDeck = decks.find((d) => d.id === activeDeckId) || null;

  const [notes, setNotes] = useState('');
  const [count, setCount] = useState(10);
  const [difficulty, setDifficulty] = useState('medium');
  const [lastRequest, setLastRequest] = useState(null);
  const loading = status === 'loading';
  const now = Date.now();

  const generate = (request) => {
    setLastRequest(request);
    dispatch(generateDeck(request));
  };

  const onSubmit = (event) => {
    event.preventDefault();
    if (notes.trim().length >= 40 && !loading) generate({ notes: notes.trim(), count, difficulty });
  };

  const onDelete = (deck) => {
    if (window.confirm(`Delete the deck “${deck.title}” and all its cards?`)) dispatch(deleteDeck(deck.id));
  };

  return (
    <div className="coach-workspace">
      <div className="coach-side">
        <form className="card coach-form" onSubmit={onSubmit}>
          <label className="field__label" htmlFor="coach-notes">
            Paste your notes
          </label>
          <textarea
            id="coach-notes"
            className="input coach-form__notes"
            rows={7}
            maxLength={MAX_NOTES}
            placeholder="Lecture notes, a textbook section, your summary…"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            aria-describedby="notes-count"
          />
          <span id="notes-count" className="field__hint">
            {notes.length.toLocaleString()} / {MAX_NOTES.toLocaleString()} characters
            {notes.trim().length > 0 && notes.trim().length < 40 && ' · a little more, please'}
          </span>

          <div className="field">
            <label className="field__label" htmlFor="coach-count">
              How many cards? <strong>{count}</strong>
            </label>
            <input
              id="coach-count"
              type="range"
              min="3"
              max="30"
              value={count}
              onChange={(event) => setCount(Number(event.target.value))}
            />
          </div>

          <fieldset className="coach-form__difficulty">
            <legend className="field__label">Difficulty</legend>
            <div className="segmented">
              {DIFFICULTIES.map((d) => (
                <label key={d} className="segmented__option">
                  <input type="radio" name="difficulty" value={d} checked={difficulty === d} onChange={() => setDifficulty(d)} />
                  <span>{d}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="coach-form__actions">
            <button type="submit" className="btn btn--primary" disabled={loading || notes.trim().length < 40}>
              <Icon name="sparkle" />
              Make flashcards
            </button>
            <button type="button" className="btn btn--small btn--quiet" onClick={() => dispatch(createDeck('New deck'))}>
              Write my own deck
            </button>
          </div>
        </form>

        {decks.length > 0 && (
          <nav className="coach-list" aria-label="Saved decks">
            <h2 className="coach-list__title">Your decks</h2>
            <ul>
              {decks.map((deck) => {
                const p = deckProgress(deck, now);
                return (
                  <li key={deck.id} className={`coach-list__item${deck.id === activeDeckId ? ' is-active' : ''}`}>
                    <button
                      type="button"
                      className="coach-list__open"
                      aria-current={deck.id === activeDeckId ? 'true' : undefined}
                      onClick={() => dispatch(setActiveDeck(deck.id))}
                    >
                      <span className="coach-list__name">{deck.title}</span>
                      <span className="coach-list__meta">
                        {p.mastered}/{p.total} learned{p.due > 0 ? ` · ${p.due} due` : ''}
                      </span>
                    </button>
                    <button type="button" className="task__btn" aria-label={`Delete deck “${deck.title}”`} onClick={() => onDelete(deck)}>
                      <Icon name="trash" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        )}
      </div>

      <div className="coach-main">
        {error && (
          <CoachError
            error={error}
            onRetry={lastRequest ? () => generate(lastRequest) : undefined}
            onDismiss={() => dispatch(clearFlashcardError())}
          />
        )}
        {loading ? (
          <CoachSkeleton kind="cards" label={copy.thinkingCards} />
        ) : activeDeck ? (
          <DeckView key={activeDeck.id} deck={activeDeck} />
        ) : (
          <p className="coach-empty">{copy.emptyDecks}</p>
        )}
      </div>
    </div>
  );
}
