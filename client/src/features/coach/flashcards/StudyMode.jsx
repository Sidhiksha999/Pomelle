import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { reviewCard, usableCards } from '../../../store/flashcardsSlice';
import { useCurrentTheme } from '../../../components/hooks/useCurrentTheme';
import { shuffle } from './shuffle';

/** Card ids to review now: anything due, newest-learned boxes first. */
function dueQueue(deck, now) {
  return usableCards(deck)
    .filter((c) => c.due <= now)
    .sort((a, b) => a.box - b.box || a.due - b.due)
    .map((c) => c.id);
}

/**
 * Flip-card study with spaced repetition. After seeing the answer you say how
 * well you knew it; cards you didn't know come back at the end of the session.
 */
export default function StudyMode({ deck, onEdit }) {
  const dispatch = useDispatch();
  const { voice } = useCurrentTheme();
  const copy = voice.coach;

  const [queue, setQueue] = useState(() => dueQueue(deck, Date.now()));
  const [flipped, setFlipped] = useState(false);
  const [tally, setTally] = useState({ knew: 0, almost: 0, forgot: 0 });
  const [started, setStarted] = useState(false);

  const card = deck.cards.find((c) => c.id === queue[0]);
  const total = usableCards(deck).length;

  const grade = (result) => {
    if (!card) return;
    dispatch(reviewCard({ deckId: deck.id, cardId: card.id, grade: result, now: Date.now() }));
    setTally((t) => ({ ...t, [result]: t[result] + 1 }));
    // A card you didn't know goes to the back of the line to try again.
    setQueue((q) => (result === 'forgot' ? [...q.slice(1), q[0]] : q.slice(1)));
    setFlipped(false);
    setStarted(true);
  };

  // Keyboard: Space flips the card, 1 / 2 / 3 answer once it's flipped.
  useEffect(() => {
    const onKey = (event) => {
      if (event.target.closest?.('input, textarea, select, button, [contenteditable]')) return;
      if (!card) return;
      if (event.code === 'Space') {
        event.preventDefault();
        setFlipped((f) => !f);
      } else if (flipped && ['1', '2', '3'].includes(event.key)) {
        grade({ 1: 'forgot', 2: 'almost', 3: 'knew' }[event.key]);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (total === 0) {
    return (
      <div className="study-empty card">
        <p>This deck has no finished cards yet.</p>
        <button type="button" className="btn btn--primary btn--small" onClick={onEdit}>
          Write some cards
        </button>
      </div>
    );
  }

  if (!card) {
    const reviewed = tally.knew + tally.almost + tally.forgot;
    return (
      <div className="study-done card">
        <p className="study-done__title">{started ? copy.studyDone : 'Nothing is due right now. Nice!'}</p>
        {started && (
          <p className="study-done__tally">
            {reviewed} reviews · {tally.knew} {copy.knew.toLowerCase()} · {tally.almost} {copy.almost.toLowerCase()} · {tally.forgot}{' '}
            {copy.forgot.toLowerCase()}
          </p>
        )}
        <button
          type="button"
          className="btn btn--small"
          onClick={() => {
            setQueue(shuffle(usableCards(deck).map((c) => c.id)));
            setTally({ knew: 0, almost: 0, forgot: 0 });
            setStarted(false);
          }}
        >
          Study the whole deck anyway
        </button>
      </div>
    );
  }

  return (
    <div className="study">
      <p className="study__count" aria-live="polite">
        {queue.length} {queue.length === 1 ? 'card' : 'cards'} to go
      </p>

      <button
        type="button"
        className={`flashcard${flipped ? ' is-flipped' : ''}`}
        onClick={() => setFlipped((f) => !f)}
        aria-label={flipped ? `Answer: ${card.answer}. Click to see the question again.` : `Question: ${card.question}. Click to see the answer.`}
      >
        <span className="flashcard__inner">
          <span className="flashcard__face flashcard__face--front" aria-hidden={flipped}>
            <span className="flashcard__kind">Question</span>
            <span className="flashcard__text">{card.question}</span>
            <span className="flashcard__hint">Click or press Space to flip</span>
          </span>
          <span className="flashcard__face flashcard__face--back" aria-hidden={!flipped}>
            <span className="flashcard__kind">Answer</span>
            <span className="flashcard__text">{card.answer}</span>
          </span>
        </span>
      </button>

      <div className="study__grades" aria-hidden={!flipped}>
        <button type="button" className="btn grade grade--forgot" disabled={!flipped} onClick={() => grade('forgot')}>
          {copy.forgot} <kbd>1</kbd>
        </button>
        <button type="button" className="btn grade grade--almost" disabled={!flipped} onClick={() => grade('almost')}>
          {copy.almost} <kbd>2</kbd>
        </button>
        <button type="button" className="btn btn--primary grade grade--knew" disabled={!flipped} onClick={() => grade('knew')}>
          {copy.knew} <kbd>3</kbd>
        </button>
      </div>
    </div>
  );
}
