import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { clearSource, setExternalPlaying } from '../../store/musicSlice';
import Icon from '../../components/Icon';
import { loadSpotifyApi, loadYouTubeApi, players } from './players';

// The YouTube or Spotify player. It lives outside the collapsible panel so it
// keeps playing (and stays visible, as YouTube and Spotify require) when the
// panel is closed or you move to another page.

/** Only start playing by itself if the user picked this a moment ago (not after a page reload). */
const justPicked = (source) => Date.now() - (source.pickedAt || 0) < 15000;

const YOUTUBE_ERRORS = {
  2: "That link doesn't point to a video YouTube recognizes.",
  5: "This video can't be played in the browser right now.",
  100: 'This video was removed or is private.',
  101: "The video's owner doesn't allow it to be played outside YouTube. Try another one.",
  150: "The video's owner doesn't allow it to be played outside YouTube. Try another one.",
};

function YouTubePlayer({ source }) {
  const dispatch = useDispatch();
  const hostRef = useRef(null);
  const [error, setError] = useState(null);
  const firstSource = useRef(source);

  // Create the player once.
  useEffect(() => {
    let cancelled = false;
    const host = hostRef.current;
    loadYouTubeApi().then((YT) => {
      if (cancelled) return;
      const target = document.createElement('div');
      host.appendChild(target);
      const start = firstSource.current;
      players.youtube = new YT.Player(target, {
        width: '100%',
        height: '100%',
        videoId: start.videoId || undefined,
        playerVars: {
          playsinline: 1,
          rel: 0,
          ...(!start.videoId && start.listId ? { listType: 'playlist', list: start.listId } : {}),
        },
        events: {
          onReady: (event) => {
            if (justPicked(start)) event.target.playVideo();
          },
          onStateChange: (event) => {
            dispatch(setExternalPlaying({ kind: 'youtube', playing: event.data === YT.PlayerState.PLAYING }));
          },
          onError: (event) => setError(YOUTUBE_ERRORS[event.data] || "This video can't be played here."),
        },
      });
    });
    return () => {
      cancelled = true;
      players.youtube?.destroy?.();
      players.youtube = null;
      host.innerHTML = '';
      dispatch(setExternalPlaying({ kind: 'youtube', playing: false }));
    };
  }, [dispatch]);

  // A new link while the player already exists: just load it.
  useEffect(() => {
    if (source === firstSource.current) return;
    const player = players.youtube;
    if (!player?.loadVideoById) return;
    setError(null);
    if (source.videoId) player.loadVideoById(source.videoId);
    else player.loadPlaylist({ list: source.listId, listType: 'playlist', index: 0 });
  }, [source]);

  return (
    <>
      <div ref={hostRef} className="music-now__frame music-now__frame--video" />
      {error && (
        <p className="music-now__error" role="alert">
          {error}
        </p>
      )}
    </>
  );
}

function SpotifyPlayer({ source }) {
  const dispatch = useDispatch();
  const hostRef = useRef(null);
  const firstSource = useRef(source);

  useEffect(() => {
    let cancelled = false;
    const host = hostRef.current;
    loadSpotifyApi().then((api) => {
      if (cancelled) return;
      const target = document.createElement('div');
      host.appendChild(target);
      const start = firstSource.current;
      api.createController(target, { uri: start.uri, width: '100%', height: 152 }, (controller) => {
        if (cancelled) {
          controller.destroy();
          return;
        }
        players.spotify = controller;
        controller.addListener('playback_update', (event) => {
          dispatch(setExternalPlaying({ kind: 'spotify', playing: !event.data.isPaused }));
        });
        if (justPicked(start)) controller.play();
      });
    });
    return () => {
      cancelled = true;
      players.spotify?.destroy?.();
      players.spotify = null;
      host.innerHTML = '';
      dispatch(setExternalPlaying({ kind: 'spotify', playing: false }));
    };
  }, [dispatch]);

  useEffect(() => {
    if (source === firstSource.current || !players.spotify) return;
    players.spotify.loadUri(source.uri);
    players.spotify.play();
  }, [source]);

  return <div ref={hostRef} className="music-now__frame music-now__frame--spotify" />;
}

export default function NowPlaying({ source, compact }) {
  const dispatch = useDispatch();
  return (
    <div className={`music-now music-now--${source.kind}${compact ? ' is-compact' : ''}`}>
      {/* key: switching between YouTube and Spotify builds a fresh player */}
      {source.kind === 'youtube' ? <YouTubePlayer key="youtube" source={source} /> : <SpotifyPlayer key="spotify" source={source} />}
      <button type="button" className="music-now__close" aria-label="Stop and remove this player" onClick={() => dispatch(clearSource())}>
        <Icon name="close" />
      </button>
    </div>
  );
}
