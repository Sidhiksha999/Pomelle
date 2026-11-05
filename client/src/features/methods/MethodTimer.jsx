import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logFocusSession } from '../../store/statsSlice';
import { useCurrentTheme } from '../../components/hooks/useCurrentTheme';
import { useNow } from '../../components/hooks/useNow';
import { playChime, unlockAudio } from '../../themes/sounds';
import Icon from '../../components/Icon';
import { formatTime } from '../timer/useTimerMoments';

/**
 * A small timer for guided study steps (separate from the main Pomodoro timer).
 * Like the main timer it stores timestamps, so it stays right in background tabs.
 *
 * Props:
 *   minutes        length of the step (ignored when countUp)
 *   countUp        a stopwatch instead of a countdown (used by Flowtime)
 *   label          what this step is, shown above the numbers
 *   countsAsFocus  when the step finishes, add it to your stats as a focus session
 *   onDone(mins)   called when the countdown reaches zero, or when a stopwatch is stopped
 */
export default function MethodTimer({ minutes = 25, countUp = false, label, countsAsFocus = false, onDone, stopLabel = 'Stop' }) {
  const dispatch = useDispatch();
  const theme = useCurrentTheme();
  const { soundOn, volume } = useSelector((s) => s.theme);
  const activeTask = useSelector((s) => s.tasks.items.find((t) => t.id === s.tasks.activeId));

  // startedAt: when the current run began; banked: ms already done before a pause
  const [startedAt, setStartedAt] = useState(null);
  const [banked, setBanked] = useState(0);
  const running = startedAt !== null;
  const now = useNow(running ? 250 : null);

  const elapsed = banked + (running ? now - startedAt : 0);
  const total = minutes * 60000;
  const remaining = Math.max(0, total - elapsed);
  const finishedRef = useRef(false);

  const finish = (ms) => {
    const mins = ms / 60000;
    if (countsAsFocus && mins >= 1) {
      dispatch(logFocusSession({ minutes: mins, subject: activeTask?.subject, taskId: activeTask?.id }));
    }
    onDone?.(mins);
  };

  // Countdown reached zero.
  useEffect(() => {
    if (countUp || !running || remaining > 0 || finishedRef.current) return;
    finishedRef.current = true;
    setStartedAt(null);
    setBanked(total);
    if (soundOn) playChime(theme.id, volume);
    finish(total);
  });

  // A new length (e.g. the next step) resets the timer.
  useEffect(() => {
    setStartedAt(null);
    setBanked(0);
    finishedRef.current = false;
  }, [minutes, label]);

  const start = () => {
    unlockAudio();
    if (!countUp && remaining === 0) {
      setBanked(0);
      finishedRef.current = false;
    }
    setStartedAt(Date.now());
  };

  const pause = () => {
    setBanked(elapsed);
    setStartedAt(null);
  };

  const reset = () => {
    setStartedAt(null);
    setBanked(0);
    finishedRef.current = false;
  };

  const stopStopwatch = () => {
    const ms = elapsed;
    reset();
    finish(ms);
  };

  const shown = countUp ? elapsed : remaining;
  const progress = countUp ? 0 : Math.min(1, elapsed / total);

  return (
    <div className="method-timer" role="timer" aria-label={`${label || 'Timer'}: ${formatTime(shown)}`}>
      {label && <span className="method-timer__label">{label}</span>}
      <span className="method-timer__time">{formatTime(shown)}</span>
      {!countUp && (
        <span className="method-timer__bar" aria-hidden="true">
          <span style={{ width: `${progress * 100}%` }} />
        </span>
      )}
      <div className="method-timer__controls">
        {running ? (
          <button type="button" className="btn btn--small" onClick={pause}>
            <Icon name="pause" /> Pause
          </button>
        ) : (
          <button type="button" className="btn btn--small btn--primary" onClick={start}>
            <Icon name="play" filled /> {elapsed > 0 && remaining > 0 ? 'Resume' : 'Start'}
          </button>
        )}
        {countUp ? (
          <button type="button" className="btn btn--small" onClick={stopStopwatch} disabled={elapsed < 1000}>
            {stopLabel}
          </button>
        ) : (
          <button type="button" className="btn btn--small btn--quiet" onClick={reset} disabled={elapsed === 0}>
            <Icon name="reset" /> Reset
          </button>
        )}
      </div>
    </div>
  );
}
