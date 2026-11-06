import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateSettings } from '../store/timerSlice';
import {
  setNotificationsOn,
  setOnboarded,
  setColorMode,
  setReducedMotion,
  setSoundOn,
  setVolume,
} from '../store/themeSlice';
import { playChime, unlockAudio } from '../themes/sounds';
import { requestNotificationPermission, notificationsSupported } from '../features/timer/notify';
import { useCurrentTheme } from './hooks/useCurrentTheme';
import { THEMES } from '../themes';
import Icon from './Icon';
import './SettingsDialog.css';

// Names of the themes that have a night look, e.g. "Cat".
const NIGHT_THEMES = THEMES.filter((t) => t.dark).map((t) => t.name).join(', ');

/**
 * A number box that lets you type freely and only saves when you leave the
 * field (or press Enter). The value is clamped to [min, max].
 */
function NumberField({ id, label, hint, value, min, max, onCommit }) {
  const [text, setText] = useState(String(value));

  // If the saved value changes elsewhere, show it.
  useEffect(() => setText(String(value)), [value]);

  const commit = () => {
    const parsed = Math.round(Number(text));
    const clamped = Number.isFinite(parsed) ? Math.min(max, Math.max(min, parsed)) : value;
    setText(String(clamped));
    if (clamped !== value) onCommit(clamped);
  };

  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className="input"
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={text}
        onChange={(event) => setText(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => event.key === 'Enter' && commit()}
        aria-describedby={hint ? `${id}-hint` : undefined}
      />
      {hint && (
        <span id={`${id}-hint`} className="field__hint">
          {hint}
        </span>
      )}
    </div>
  );
}

function Toggle({ id, label, checked, onChange, hint }) {
  return (
    <div className="toggle-row">
      <input id={id} type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <label htmlFor={id}>
        {label}
        {hint && <span className="field__hint toggle-row__hint">{hint}</span>}
      </label>
    </div>
  );
}

export default function SettingsDialog({ open, onClose }) {
  const dialogRef = useRef(null);
  const dispatch = useDispatch();
  const theme = useCurrentTheme();
  const timerSettings = useSelector((s) => s.timer.settings);
  const prefs = useSelector((s) => s.theme);
  const [notifyMessage, setNotifyMessage] = useState('');

  // <dialog> must be opened with showModal() to get focus trapping and Escape.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const set = (key) => (value) => dispatch(updateSettings({ [key]: value }));

  const onNotificationsChange = async (wanted) => {
    if (!wanted) {
      dispatch(setNotificationsOn(false));
      setNotifyMessage('');
      return;
    }
    const permission = await requestNotificationPermission();
    if (permission === 'granted') {
      dispatch(setNotificationsOn(true));
      setNotifyMessage('');
    } else if (permission === 'unsupported') {
      setNotifyMessage("This browser doesn't support notifications.");
    } else {
      setNotifyMessage('Notifications are blocked. You can allow them in your browser’s site settings.');
    }
  };

  const previewSound = () => {
    unlockAudio();
    playChime(theme.id, prefs.volume);
  };

  return (
    <dialog
      ref={dialogRef}
      className="dialog settings-dialog"
      aria-labelledby="settings-title"
      onClose={onClose}
      onClick={(event) => {
        // Clicking the dim area outside the box closes it.
        if (event.target === dialogRef.current) onClose();
      }}
    >
      <div className="dialog__header">
        <h2 id="settings-title">{theme.voice.settingsTitle}</h2>
        <button type="button" className="icon-btn" onClick={onClose} aria-label="Close settings">
          <Icon name="close" />
        </button>
      </div>

      <div className="dialog__body settings-dialog__body">
        <fieldset className="settings-group">
          <legend>Timer</legend>
          <div className="settings-grid">
            <NumberField id="set-focus" label="Focus (minutes)" value={timerSettings.focusMinutes} min={1} max={180} onCommit={set('focusMinutes')} />
            <NumberField id="set-short" label="Short break" value={timerSettings.shortMinutes} min={1} max={60} onCommit={set('shortMinutes')} />
            <NumberField id="set-long" label="Long break" value={timerSettings.longMinutes} min={1} max={90} onCommit={set('longMinutes')} />
            <NumberField
              id="set-every"
              label="Long break every"
              hint="focus sessions"
              value={timerSettings.longBreakEvery}
              min={2}
              max={12}
              onCommit={set('longBreakEvery')}
            />
          </div>
          <Toggle id="set-auto-breaks" label="Start breaks automatically" checked={timerSettings.autoStartBreaks} onChange={set('autoStartBreaks')} />
          <Toggle id="set-auto-focus" label="Start focus sessions automatically" checked={timerSettings.autoStartFocus} onChange={set('autoStartFocus')} />
        </fieldset>

        <fieldset className="settings-group">
          <legend>Sound & alerts</legend>
          <Toggle
            id="set-sound"
            label="Play a sound when a session ends"
            hint={`${theme.name} has its own chime.`}
            checked={prefs.soundOn}
            onChange={(on) => dispatch(setSoundOn(on))}
          />
          <div className="field">
            <label className="field__label" htmlFor="set-volume">
              Volume
            </label>
            <div className="volume-row">
              <input
                id="set-volume"
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={prefs.volume}
                disabled={!prefs.soundOn}
                onChange={(event) => dispatch(setVolume(Number(event.target.value)))}
              />
              <button type="button" className="btn btn--small" onClick={previewSound} disabled={!prefs.soundOn}>
                <Icon name="bell" /> Preview
              </button>
            </div>
          </div>
          <Toggle
            id="set-notify"
            label="Notify me when I'm in another tab"
            checked={prefs.notificationsOn}
            onChange={onNotificationsChange}
            hint={notificationsSupported() ? undefined : 'Not available in this browser.'}
          />
          {notifyMessage && (
            <p className="field__hint" role="status">
              {notifyMessage}
            </p>
          )}
        </fieldset>

        <fieldset className="settings-group">
          <legend>Motion</legend>
          <div className="radio-row" role="radiogroup" aria-label="Animations">
            {[
              ['system', 'Match my device'],
              ['on', 'Reduce motion'],
              ['off', 'Full motion'],
            ].map(([value, label]) => (
              <label key={value} className="radio-pill">
                <input
                  type="radio"
                  name="motion"
                  value={value}
                  checked={prefs.reducedMotion === value}
                  onChange={() => dispatch(setReducedMotion(value))}
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="settings-group">
          <legend>Night look</legend>
          <div className="radio-row" role="radiogroup" aria-label="Night look">
            {[
              ['light', 'Day'],
              ['dark', 'Night'],
              ['system', 'Match my device'],
            ].map(([value, label]) => (
              <label key={value} className="radio-pill">
                <input
                  type="radio"
                  name="color-mode"
                  value={value}
                  checked={prefs.colorMode === value}
                  onChange={() => dispatch(setColorMode(value))}
                />
                {label}
              </label>
            ))}
          </div>
          <p className="field__hint">
            {theme.dark
              ? `${theme.name} has a night look: a darker, softer version of the same world.`
              : `${theme.name} stays as it is. Themes with a night look: ${NIGHT_THEMES}.`}
          </p>
        </fieldset>

        <fieldset className="settings-group">
          <legend>Welcome tour</legend>
          <div>
            <button
              type="button"
              className="btn btn--small"
              onClick={() => {
                onClose();
                dispatch(setOnboarded(false));
              }}
            >
              Show the welcome again
            </button>
          </div>
        </fieldset>

        <fieldset className="settings-group">
          <legend>Keyboard shortcuts</legend>
          <dl className="shortcut-list">
            <div>
              <dt><kbd>Space</kbd></dt>
              <dd>Start or pause</dd>
            </div>
            <div>
              <dt><kbd>R</kbd></dt>
              <dd>Reset the current session</dd>
            </div>
            <div>
              <dt><kbd>S</kbd></dt>
              <dd>Skip to the next session</dd>
            </div>
          </dl>
        </fieldset>
      </div>
    </dialog>
  );
}
