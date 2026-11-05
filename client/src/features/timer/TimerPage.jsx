import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  durationFor,
  MODES,
  pause,
  remainingAt,
  reset,
  skip,
  start,
  STATUS,
  switchMode,
} from '../../store/timerSlice';
import { useCurrentTheme } from '../../components/hooks/useCurrentTheme';
import { useNow } from '../../components/hooks/useNow';
import { unlockAudio } from '../../themes/sounds';
import Icon from '../../components/Icon';
import QuoteCard from '../quotes/QuoteCard';
import TaskList from '../tasks/TaskList';
import { formatTime, useFocusCelebration, useJustStarted } from './useTimerMoments';
import './timer.css';

const MODE_ORDER = [MODES.FOCUS, MODES.SHORT, MODES.LONG];

/** Is the keyboard event coming from somewhere the user is typing or pressing? */
function isInteractiveTarget(target) {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON', 'A'].includes(target.tagName) ||
    target.closest('dialog[open]') !== null
  );
}

export default function TimerPage() {
  const dispatch = useDispatch();
  const theme = useCurrentTheme();
  const timer = useSelector((s) => s.timer);
  const { mode, status, settings, cycleCount } = timer;
  const activeTask = useSelector((s) => s.tasks.items.find((t) => t.id === s.tasks.activeId));

  // Re-render 4× a second while running. The time itself always comes from timestamps.
  const now = useNow(status === STATUS.RUNNING ? 250 : null);
  const remaining = remainingAt(timer, now);
  const total = durationFor(mode, settings);
  const progress = total > 0 ? Math.min(1, Math.max(0, 1 - remaining / total)) : 0;
  const timeText = formatTime(remaining);
  const modeLabel = theme.voice.modes[mode];
  const isBreak = mode !== MODES.FOCUS;

  const justStarted = useJustStarted(status);
  const justCompleted = useFocusCelebration(theme.celebrationMs) !== null;

  const handleStartPause = () => {
    if (status === STATUS.RUNNING) {
      dispatch(pause({ now: Date.now() }));
    } else {
      unlockAudio(); // browsers only allow sound after a click
      dispatch(start({ now: Date.now() }));
    }
  };
  const handleReset = () => dispatch(reset());
  const handleSkip = () => dispatch(skip({ now: Date.now() }));

  // Show the countdown in the browser tab title.
  useEffect(() => {
    document.title = status === STATUS.IDLE ? 'Pomelle' : `${timeText} · ${modeLabel} — Pomelle`;
  }, [timeText, modeLabel, status]);
  useEffect(() => () => {
    document.title = 'Pomelle';
  }, []);

  // Keyboard shortcuts: Space = start/pause, R = reset, S = skip.
  useEffect(() => {
    const onKey = (event) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (isInteractiveTarget(event.target)) return;
      if (event.code === 'Space') {
        event.preventDefault();
        handleStartPause();
      } else if (event.key === 'r' || event.key === 'R') {
        handleReset();
      } else if (event.key === 's' || event.key === 'S') {
        handleSkip();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const { voice } = theme;
  const primaryLabel =
    status === STATUS.RUNNING ? voice.pause : status === STATUS.PAUSED ? voice.resume : voice.start;
  const statusLine =
    status === STATUS.PAUSED
      ? voice.status.paused
      : status === STATUS.RUNNING
        ? isBreak
          ? voice.status.break
          : voice.status.focus
        : voice.status.idle;

  const Face = theme.Face;

  return (
    <section className="timer-page" aria-label="Pomodoro timer">
      <div className="timer-stage">
        <div className="mode-tabs" role="group" aria-label="Session type">
          {MODE_ORDER.map((m) => (
            <button
              key={m}
              type="button"
              className="mode-tab"
              aria-pressed={mode === m}
              onClick={() => dispatch(switchMode(m))}
            >
              {voice.modes[m]}
            </button>
          ))}
        </div>

        {/* role="timer" tells screen readers this is a clock; it isn't read aloud every second. */}
        <div className="timer-face-wrap" role="timer" aria-label={`${modeLabel}: ${timeText} left`}>
          <Face
            progress={progress}
            timeText={timeText}
            mode={mode}
            status={status}
            modeLabel={modeLabel}
            justStarted={justStarted}
            justCompleted={justCompleted}
          />
        </div>

        <div
          className="session-dots"
          role="img"
          aria-label={`${cycleCount} of ${settings.longBreakEvery} focus sessions before a long break`}
          title={voice.sessionsLabel}
        >
          {Array.from({ length: settings.longBreakEvery }, (_, i) => (
            <span key={i} className={i < cycleCount ? 'session-dot is-done' : 'session-dot'} />
          ))}
        </div>

        <div className="timer-controls">
          <button type="button" className="icon-btn" onClick={handleReset} aria-label={voice.reset} title={`${voice.reset} (R)`}>
            <Icon name="reset" />
          </button>
          <button type="button" className="btn btn--primary timer-controls__main" onClick={handleStartPause}>
            <Icon name={status === STATUS.RUNNING ? 'pause' : 'play'} filled={status !== STATUS.RUNNING} />
            {primaryLabel}
          </button>
          <button type="button" className="icon-btn" onClick={handleSkip} aria-label={voice.skip} title={`${voice.skip} (S)`}>
            <Icon name="skip" />
          </button>
        </div>

        <p className="timer-status">{statusLine}</p>
        {activeTask && (
          <p className="timer-active-task">
            <span className="timer-active-task__label">{voice.tasks.activeLabel}</span>
            <span className="timer-active-task__title">{activeTask.title}</span>
          </p>
        )}
      </div>

      <aside className="timer-aside">
        {theme.hasQuotes && <QuoteCard />}
        <TaskList />
      </aside>
    </section>
  );
}
