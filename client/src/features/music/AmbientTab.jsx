import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  applyMix,
  deletePreset,
  savePreset,
  setAmbientMaster,
  setAmbientPlaying,
  setAmbientVolume,
  setSleepEndsAt,
} from '../../store/musicSlice';
import { AMBIENT_SOUNDS, BUILT_IN_PRESETS, SLEEP_OPTIONS } from '../../data/music';
import { useNow } from '../../components/hooks/useNow';
import { unlockAudio } from '../../themes/sounds';
import Icon from '../../components/Icon';

/** The ambient mixer: one slider per sound, saved mixes and a sleep timer. */
export default function AmbientTab() {
  const dispatch = useDispatch();
  const { ambient, presets, sleepEndsAt } = useSelector((s) => s.music);
  const [naming, setNaming] = useState(false);
  const [presetName, setPresetName] = useState('');
  const now = useNow(sleepEndsAt ? 15000 : null);

  const anyOn = Object.values(ambient.volumes).some((v) => v > 0);
  const playing = ambient.playing && anyOn;
  const minutesLeft = sleepEndsAt ? Math.max(1, Math.ceil((sleepEndsAt - now) / 60000)) : null;

  const save = (event) => {
    event.preventDefault();
    if (!presetName.trim()) return;
    dispatch(savePreset(presetName.trim().slice(0, 30)));
    setPresetName('');
    setNaming(false);
  };

  return (
    <div className="ambient">
      <div className="ambient__top">
        <button
          type="button"
          className="btn btn--primary btn--small"
          disabled={!anyOn}
          onClick={() => {
            unlockAudio();
            dispatch(setAmbientPlaying(!playing));
          }}
        >
          <Icon name={playing ? 'pause' : 'play'} filled={!playing} />
          {playing ? 'Pause sounds' : 'Play sounds'}
        </button>
        <label className="ambient__master">
          <span className="visually-hidden">Ambient volume</span>
          <Icon name="music" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={ambient.master}
            onChange={(event) => dispatch(setAmbientMaster(Number(event.target.value)))}
          />
        </label>
      </div>
      {!anyOn && <p className="field__hint">Turn a sound up (or pick a mix below) to start.</p>}

      <ul className="ambient__grid">
        {AMBIENT_SOUNDS.map((sound) => {
          const value = ambient.volumes[sound.id] ?? 0;
          return (
            <li key={sound.id} className={`ambient-sound${value > 0 ? ' is-on' : ''}`}>
              <label className="ambient-sound__label" htmlFor={`amb-${sound.id}`}>
                <Icon name={sound.icon} />
                {sound.label}
              </label>
              <input
                id={`amb-${sound.id}`}
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={value}
                onChange={(event) => {
                  unlockAudio();
                  dispatch(setAmbientVolume({ id: sound.id, value: Number(event.target.value) }));
                }}
              />
            </li>
          );
        })}
      </ul>

      <section className="ambient__presets" aria-labelledby="mixes-title">
        <h3 id="mixes-title">Mixes</h3>
        <ul className="ambient__chips">
          {BUILT_IN_PRESETS.map((preset) => (
            <li key={preset.id}>
              <button
                type="button"
                className="mix-chip"
                onClick={() => {
                  unlockAudio();
                  dispatch(applyMix(preset.volumes));
                }}
              >
                {preset.name}
              </button>
            </li>
          ))}
          {presets.map((preset) => (
            <li key={preset.id} className="mix-chip mix-chip--mine">
              <button
                type="button"
                className="mix-chip__apply"
                onClick={() => {
                  unlockAudio();
                  dispatch(applyMix(preset.volumes));
                }}
              >
                {preset.name}
              </button>
              <button type="button" className="mix-chip__delete" aria-label={`Delete mix “${preset.name}”`} onClick={() => dispatch(deletePreset(preset.id))}>
                <Icon name="close" />
              </button>
            </li>
          ))}
        </ul>
        {naming ? (
          <form className="ambient__save" onSubmit={save}>
            <label className="visually-hidden" htmlFor="mix-name">
              Name for this mix
            </label>
            <input
              id="mix-name"
              className="input"
              placeholder="e.g. Exam week"
              maxLength={30}
              value={presetName}
              onChange={(event) => setPresetName(event.target.value)}
              autoFocus
            />
            <button type="submit" className="btn btn--small btn--primary" disabled={!presetName.trim()}>
              Save
            </button>
            <button type="button" className="btn btn--small btn--quiet" onClick={() => setNaming(false)}>
              Cancel
            </button>
          </form>
        ) : (
          <button type="button" className="btn btn--small" disabled={!anyOn} onClick={() => setNaming(true)}>
            <Icon name="plus" />
            Save this mix
          </button>
        )}
      </section>

      <div className="ambient__sleep">
        <label className="field__label" htmlFor="sleep-timer">
          <Icon name="moon" /> Sleep timer
        </label>
        <select
          id="sleep-timer"
          className="input"
          value={sleepEndsAt ? 'on' : 'off'}
          onChange={(event) => {
            const minutes = Number(event.target.value);
            dispatch(setSleepEndsAt(minutes ? Date.now() + minutes * 60000 : null));
          }}
        >
          <option value="off">Off</option>
          {sleepEndsAt && <option value="on">Stops in {minutesLeft} min</option>}
          {SLEEP_OPTIONS.map((m) => (
            <option key={m} value={m}>
              Stop after {m} minutes
            </option>
          ))}
        </select>
        <p className="field__hint">Fades out all music and sounds when it runs out.</p>
      </div>
    </div>
  );
}
