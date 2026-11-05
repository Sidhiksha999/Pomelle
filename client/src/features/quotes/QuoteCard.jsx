import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { QUOTES } from '../../data/quotes';
import { toggleFavorite } from '../../store/themeSlice';
import { MODES, STATUS } from '../../store/timerSlice';
import { useCurrentTheme } from '../../components/hooks/useCurrentTheme';
import Icon from '../../components/Icon';
import FavoritesDialog from './FavoritesDialog';
import './quotes.css';

// Each theme has its own "favorite" mark.
export const FAVORITE_ICON = { jolly: 'star', makeup: 'heart', cat: 'paw', aesthetic: 'flower' };

/** A random index from 0 to length-1 that is never the same as `previous`. */
function pickIndex(length, previous) {
  if (length <= 1) return 0;
  let next = previous;
  while (next === previous) next = Math.floor(Math.random() * length);
  return next;
}

/** Jokes are "Question? Answer." — split them so the answer can be revealed. */
function splitJoke(text) {
  const mark = text.indexOf('?');
  if (mark === -1) return { setup: text, punchline: '' };
  return { setup: text.slice(0, mark + 1), punchline: text.slice(mark + 1).trim() };
}

/**
 * Shows a quote during focus and a joke during breaks, in the active theme's
 * voice. A new quote appears whenever a focus session starts.
 */
export default function QuoteCard() {
  const dispatch = useDispatch();
  const theme = useCurrentTheme();
  const mode = useSelector((s) => s.timer.mode);
  const status = useSelector((s) => s.timer.status);
  const favorites = useSelector((s) => s.theme.favorites);

  const kind = mode === MODES.FOCUS ? 'quote' : 'joke';
  const pool = QUOTES[theme.id]?.[kind === 'quote' ? 'quotes' : 'jokes'] ?? [];

  const [index, setIndex] = useState(() => pickIndex(pool.length, -1));
  const [revealed, setRevealed] = useState(false);
  const [showCount, setShowCount] = useState(0); // changes the key so the entrance animation replays
  const [favoritesOpen, setFavoritesOpen] = useState(false);

  const showAnother = useCallback(() => {
    setIndex((previous) => pickIndex(pool.length, previous));
    setRevealed(false);
    setShowCount((n) => n + 1);
  }, [pool.length]);

  // New theme or switching between focus and break: pick from the new list.
  useEffect(() => {
    showAnother();
  }, [theme.id, kind, showAnother]);

  // A fresh quote each time a focus session starts from the beginning.
  const previousStatus = useRef(status);
  useEffect(() => {
    if (previousStatus.current === STATUS.IDLE && status === STATUS.RUNNING && kind === 'quote') {
      showAnother();
    }
    previousStatus.current = status;
  }, [status, kind, showAnother]);

  if (pool.length === 0) return null;

  const text = pool[index % pool.length];
  const { voice } = theme;
  const isFavorite = favorites.some((f) => f.themeId === theme.id && f.text === text);
  const themeFavoriteCount = favorites.filter((f) => f.themeId === theme.id).length;
  const joke = kind === 'joke' ? splitJoke(text) : null;

  return (
    <article className={`card quote-card is-${kind}`} aria-labelledby="quote-card-label">
      <div className="quote-card__head">
        <span id="quote-card-label" className="quote-card__label">
          {kind === 'quote' ? voice.quoteLabel : voice.jokeLabel}
        </span>
        <button
          type="button"
          className="icon-btn quote-card__fav"
          aria-pressed={isFavorite}
          aria-label={isFavorite ? voice.unfavorite : voice.favorite}
          title={isFavorite ? voice.unfavorite : voice.favorite}
          onClick={() => dispatch(toggleFavorite({ themeId: theme.id, kind, text }))}
        >
          <Icon name={FAVORITE_ICON[theme.id]} filled={isFavorite} />
        </button>
      </div>

      <div className="quote-card__body" aria-live="polite">
        {joke ? (
          <>
            <p key={showCount} className="quote-card__text is-new">
              {joke.setup}
            </p>
            {revealed ? (
              <p className="quote-card__punch">{joke.punchline}</p>
            ) : (
              <button type="button" className="btn btn--small quote-card__reveal" onClick={() => setRevealed(true)}>
                {voice.reveal}
              </button>
            )}
          </>
        ) : (
          <blockquote key={showCount} className="quote-card__text is-new">
            {text}
          </blockquote>
        )}
      </div>

      <div className="quote-card__actions">
        <button type="button" className="btn btn--small" onClick={showAnother}>
          <Icon name="refresh" />
          {voice.another}
        </button>
        <button type="button" className="btn btn--small btn--quiet" onClick={() => setFavoritesOpen(true)}>
          <Icon name="book" />
          {voice.favoritesTitle}
          {themeFavoriteCount > 0 && <span className="quote-card__count">{themeFavoriteCount}</span>}
        </button>
      </div>

      <FavoritesDialog open={favoritesOpen} onClose={() => setFavoritesOpen(false)} />
    </article>
  );
}
