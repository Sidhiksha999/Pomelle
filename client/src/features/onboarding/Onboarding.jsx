import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setOnboarded, setReducedMotion, setSoundOn, setTheme } from '../../store/themeSlice';
import { updateSettings } from '../../store/timerSlice';
import { THEMES, svgToDataUri } from '../../themes';
import { playChime, unlockAudio } from '../../themes/sounds';
import { useCurrentTheme } from '../../components/hooks/useCurrentTheme';
import Icon from '../../components/Icon';
import './onboarding.css';

const RHYTHMS = [
  { id: 'classic', name: 'Classic', focus: 25, rest: 5, long: 15, note: 'The original Pomodoro. Great for getting started.' },
  { id: 'deep', name: 'Deep', focus: 50, rest: 10, long: 20, note: 'Longer stretches for essays and problem sets.' },
  { id: 'marathon', name: 'Marathon', focus: 90, rest: 20, long: 30, note: 'Big blocks for exam season.' },
];

const TOUR = [
  { icon: 'play', title: 'Timer', text: 'Your focus sessions, tasks, and a quote or joke to keep you going.' },
  { icon: 'book', title: 'Methods', text: 'Thirteen study techniques, each with a guided session you can do right here.' },
  { icon: 'sparkle', title: 'Coach', text: 'Turn a goal into a mind map, or your notes into flashcards (needs a free Gemini key).' },
  { icon: 'star', title: 'Stats', text: 'Your streak, hours and subjects, drawn in your theme.' },
  { icon: 'music', title: 'Music corner', text: 'Bottom-right: YouTube, Spotify or rain-on-the-window sounds while you work.' },
];

/**
 * The first-run welcome: pick a world, a rhythm, and get a quick tour.
 * It shows once; Settings has a button to see it again.
 */
export default function Onboarding() {
  const dispatch = useDispatch();
  const onboarded = useSelector((s) => s.theme.onboarded);
  const soundOn = useSelector((s) => s.theme.soundOn);
  const reducedMotion = useSelector((s) => s.theme.reducedMotion);
  const focusMinutes = useSelector((s) => s.timer.settings.focusMinutes);
  const current = useCurrentTheme();
  const dialogRef = useRef(null);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!onboarded && !dialog.open) {
      setStep(0);
      dialog.showModal();
    }
    if (onboarded && dialog.open) dialog.close();
  }, [onboarded]);

  const finish = () => dispatch(setOnboarded(true));

  const pickTheme = (id) => {
    unlockAudio();
    dispatch(setTheme(id));
  };

  const pickRhythm = (r) =>
    dispatch(updateSettings({ focusMinutes: r.focus, shortMinutes: r.rest, longMinutes: r.long }));

  const steps = ['Pick your world', 'Your rhythm', 'A quick look around'];

  return (
    <dialog
      ref={dialogRef}
      className="onboarding"
      aria-labelledby="onboarding-title"
      // Escape counts as "skip": the welcome won't come back by itself.
      onCancel={finish}
    >
      <div className="onboarding__inner">
        <div className="onboarding__top">
          <p className="onboarding__progress" aria-label={`Step ${step + 1} of ${steps.length}`}>
            {steps.map((label, i) => (
              <span key={label} className={i <= step ? 'is-done' : ''} aria-hidden="true" />
            ))}
          </p>
          <button type="button" className="btn btn--small btn--quiet" onClick={finish}>
            Skip, I’ll explore
          </button>
        </div>

        {step === 0 && (
          <section className="onboarding__step">
            <p className="onboarding__kicker">Welcome to Pomelle</p>
            <h1 id="onboarding-title">Pick the world you want to study in.</h1>
            <p className="onboarding__lead">Each one has its own look, sounds and personality. You can switch any time from the top bar.</p>
            <ul className="onboarding__themes" role="radiogroup" aria-label="Themes">
              {THEMES.map((theme) => (
                <li key={theme.id}>
                  {/* data-theme on the tile shows it in that theme's own colors and fonts */}
                  <button
                    type="button"
                    role="radio"
                    aria-checked={current.id === theme.id}
                    className="theme-tile"
                    data-theme={theme.id}
                    onClick={() => pickTheme(theme.id)}
                  >
                    <img src={svgToDataUri(theme.icon)} alt="" width="44" height="44" />
                    <span className="theme-tile__name">{theme.name}</span>
                    <span className="theme-tile__tagline">{theme.tagline}</span>
                    <span className="theme-tile__swatches" aria-hidden="true">
                      {[1, 2, 3, 4].map((n) => (
                        <span key={n} style={{ background: `var(--series-${n})` }} />
                      ))}
                    </span>
                    <span className="btn btn--primary btn--small theme-tile__sample" aria-hidden="true">
                      {theme.voice.start}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {step === 1 && (
          <section className="onboarding__step">
            <p className="onboarding__kicker">{current.name}. Lovely choice.</p>
            <h1 id="onboarding-title">How long do you like to focus?</h1>
            <ul className="onboarding__rhythms" role="radiogroup" aria-label="Focus rhythm">
              {RHYTHMS.map((r) => (
                <li key={r.id}>
                  <button type="button" role="radio" aria-checked={focusMinutes === r.focus} className="rhythm-tile" onClick={() => pickRhythm(r)}>
                    <span className="rhythm-tile__numbers">
                      {r.focus}
                      <small>/{r.rest}</small>
                    </span>
                    <span className="rhythm-tile__name">{r.name}</span>
                    <span className="rhythm-tile__note">{r.note}</span>
                  </button>
                </li>
              ))}
            </ul>
            <p className="onboarding__lead">You can fine-tune every length in Settings.</p>
            <div className="onboarding__prefs">
              <label>
                <input type="checkbox" checked={soundOn} onChange={(event) => dispatch(setSoundOn(event.target.checked))} />
                Play a sound when a session ends
              </label>
              <button
                type="button"
                className="btn btn--small"
                disabled={!soundOn}
                onClick={() => {
                  unlockAudio();
                  playChime(current.id, 0.7);
                }}
              >
                <Icon name="bell" /> Hear {current.name}’s chime
              </button>
              <label>
                <input
                  type="checkbox"
                  checked={reducedMotion === 'on'}
                  onChange={(event) => dispatch(setReducedMotion(event.target.checked ? 'on' : 'system'))}
                />
                Keep animations to a minimum
              </label>
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="onboarding__step">
            <p className="onboarding__kicker">Almost there</p>
            <h1 id="onboarding-title">Here’s what’s inside.</h1>
            <ul className="onboarding__tour">
              {TOUR.map((item) => (
                <li key={item.title}>
                  <span className="onboarding__tour-icon">
                    <Icon name={item.icon} />
                  </span>
                  <span>
                    <strong>{item.title}</strong>
                    {item.text}
                  </span>
                </li>
              ))}
            </ul>
            <p className="onboarding__lead">
              Shortcuts on the timer: <kbd>Space</kbd> start/pause, <kbd>R</kbd> reset, <kbd>S</kbd> skip.
            </p>
          </section>
        )}

        <div className="onboarding__nav">
          {step > 0 ? (
            <button type="button" className="btn btn--small btn--quiet" onClick={() => setStep((s) => s - 1)}>
              Back
            </button>
          ) : (
            <span />
          )}
          {step < steps.length - 1 ? (
            <button type="button" className="btn btn--primary" onClick={() => setStep((s) => s + 1)}>
              Next: {steps[step + 1].toLowerCase()}
            </button>
          ) : (
            <button type="button" className="btn btn--primary" onClick={finish}>
              <Icon name="play" filled />
              {current.voice.start}
            </button>
          )}
        </div>
      </div>
    </dialog>
  );
}
