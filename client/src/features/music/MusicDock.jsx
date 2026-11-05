import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setDockOpen, setFadeOnBreaks, setMusicTab } from '../../store/musicSlice';
import { useCurrentTheme } from '../../components/hooks/useCurrentTheme';
import Icon from '../../components/Icon';
import NowPlaying from './NowPlaying';
import SourceTab from './SourceTab';
import AmbientTab from './AmbientTab';
import './music.css';

/**
 * The music mini-player in the bottom corner. It's part of the app shell
 * (not a page), so music keeps going while you move between pages.
 */
export default function MusicDock() {
  const dispatch = useDispatch();
  const { voice } = useCurrentTheme();
  const { dockOpen, tab, source, ambient, externalPlaying, fadeOnBreaks } = useSelector((s) => s.music);
  const pillRef = useRef(null);

  const tabs = [
    { id: 'youtube', label: 'YouTube', icon: 'video' },
    { id: 'spotify', label: 'Spotify', icon: 'disc' },
    { id: 'ambient', label: voice.music.mixerTitle, icon: 'rain' },
  ];

  const ambientOn = ambient.playing && Object.values(ambient.volumes).some((v) => v > 0);
  const anyPlaying = ambientOn || externalPlaying.youtube || externalPlaying.spotify;

  // Escape closes the panel and puts focus back on the button.
  useEffect(() => {
    if (!dockOpen) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape' && !event.target.closest?.('dialog')) {
        dispatch(setDockOpen(false));
        pillRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [dockOpen, dispatch]);

  const onTabKey = (event) => {
    const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (!step) return;
    const index = tabs.findIndex((t) => t.id === tab);
    const next = tabs[(index + step + tabs.length) % tabs.length].id;
    dispatch(setMusicTab(next));
    document.getElementById(`music-tab-${next}`)?.focus();
  };

  return (
    <div className={`music-dock${dockOpen ? ' is-open' : ''}`}>
      {dockOpen && (
        <section id="music-panel" className="card music-panel" aria-labelledby="music-title">
          <div className="music-panel__head">
            <h2 id="music-title">{voice.music.title}</h2>
            <button type="button" className="icon-btn" aria-label="Close music" onClick={() => dispatch(setDockOpen(false))}>
              <Icon name="close" />
            </button>
          </div>

          <div className="music-tabs" role="tablist" aria-label="Music sources">
            {tabs.map((t) => (
              <button
                key={t.id}
                id={`music-tab-${t.id}`}
                type="button"
                role="tab"
                className="music-tab"
                aria-selected={tab === t.id}
                aria-controls="music-tabpanel"
                tabIndex={tab === t.id ? 0 : -1}
                onClick={() => dispatch(setMusicTab(t.id))}
                onKeyDown={onTabKey}
              >
                <Icon name={t.icon} />
                {t.label}
              </button>
            ))}
          </div>

          <div id="music-tabpanel" role="tabpanel" aria-labelledby={`music-tab-${tab}`} className="music-panel__body">
            {tab === 'ambient' ? <AmbientTab /> : <SourceTab key={tab} kind={tab} />}
          </div>

          <label className="music-panel__fade">
            <input type="checkbox" checked={fadeOnBreaks} onChange={(event) => dispatch(setFadeOnBreaks(event.target.checked))} />
            Quieter during breaks
            <span className="field__hint">Sounds and YouTube drop to 30%; Spotify pauses until the break ends.</span>
          </label>
        </section>
      )}

      {source && <NowPlaying source={source} compact={!dockOpen} />}

      <button
        ref={pillRef}
        type="button"
        className="btn music-pill"
        aria-expanded={dockOpen}
        aria-controls="music-panel"
        onClick={() => dispatch(setDockOpen(!dockOpen))}
      >
        <span className={`music-eq${anyPlaying ? ' is-playing' : ''}`} aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </span>
        {anyPlaying ? voice.music.playing : voice.music.idle}
      </button>
    </div>
  );
}
