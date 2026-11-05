import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setSource } from '../../store/musicSlice';
import { SPOTIFY_SUGGESTIONS, YOUTUBE_SUGGESTIONS } from '../../data/music';
import Icon from '../../components/Icon';
import { parseSpotify, parseYouTube } from './links';

// One component for both the YouTube and the Spotify tab: paste a link or
// pick a suggestion.

const KINDS = {
  youtube: {
    parse: parseYouTube,
    suggestions: YOUTUBE_SUGGESTIONS,
    label: 'YouTube video or playlist link',
    placeholder: 'https://www.youtube.com/watch?v=…',
    invalid: "That doesn't look like a YouTube video or playlist link.",
    note: null,
  },
  spotify: {
    parse: parseSpotify,
    suggestions: SPOTIFY_SUGGESTIONS,
    label: 'Spotify playlist, album or track link',
    placeholder: 'https://open.spotify.com/playlist/…',
    invalid: "That doesn't look like a Spotify playlist, album or track link.",
    note: 'Full songs play when you’re logged in to Spotify in this browser. Otherwise Spotify plays 30-second previews.',
  },
};

export default function SourceTab({ kind }) {
  const dispatch = useDispatch();
  const current = useSelector((s) => s.music.source);
  const [text, setText] = useState('');
  const [invalid, setInvalid] = useState(false);
  const config = KINDS[kind];

  const play = (link) => {
    const parsed = config.parse(link);
    if (!parsed) {
      setInvalid(true);
      return;
    }
    setInvalid(false);
    setText('');
    // pickedAt tells the player this was just chosen, so it may start playing.
    dispatch(setSource({ ...parsed, pickedAt: Date.now() }));
  };

  return (
    <div className="music-source">
      <form
        className="music-source__form"
        onSubmit={(event) => {
          event.preventDefault();
          play(text);
        }}
      >
        <label className="field__label" htmlFor={`music-link-${kind}`}>
          {config.label}
        </label>
        <div className="music-source__row">
          <input
            id={`music-link-${kind}`}
            className="input"
            type="url"
            inputMode="url"
            placeholder={config.placeholder}
            value={text}
            onChange={(event) => {
              setText(event.target.value);
              setInvalid(false);
            }}
            aria-invalid={invalid}
            aria-describedby={invalid ? `music-link-${kind}-error` : undefined}
          />
          <button type="submit" className="btn btn--primary btn--small" disabled={!text.trim()}>
            <Icon name="play" filled />
            Play
          </button>
        </div>
        {invalid && (
          <p id={`music-link-${kind}-error`} className="music-source__error" role="alert">
            {config.invalid}
          </p>
        )}
      </form>

      {config.note && <p className="field__hint">{config.note}</p>}

      <div className="music-source__suggestions">
        <h3>Good for studying</h3>
        <ul>
          {config.suggestions.map((s) => {
            const parsed = config.parse(s.url);
            const isCurrent = current?.url === parsed?.url;
            return (
              <li key={s.url}>
                <button type="button" className="music-suggestion" aria-pressed={isCurrent} onClick={() => play(s.url)}>
                  <Icon name={kind === 'youtube' ? 'video' : 'disc'} />
                  <span>{s.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
