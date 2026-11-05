import { useSelector } from 'react-redux';
import { useCurrentTheme } from './hooks/useCurrentTheme';
import { useReducedMotion } from './hooks/useReducedMotion';
import { useFocusCelebration } from '../features/timer/useTimerMoments';
import { MODES } from '../store/timerSlice';
import './CelebrationLayer.css';

/**
 * Shows the active theme's celebration (confetti, sparkles…) after a focus
 * session ends, and announces every finished session to screen readers.
 */
export default function CelebrationLayer() {
  const theme = useCurrentTheme();
  const reducedMotion = useReducedMotion();
  const celebrationId = useFocusCelebration(theme.celebrationMs);
  const lastEvent = useSelector((s) => s.timer.lastEvent);
  const Celebration = theme.Celebration;

  let message = '';
  if (lastEvent) {
    const { title, body } = lastEvent.mode === MODES.FOCUS ? theme.voice.focusDone : theme.voice.breakDone;
    // Add a full stop only if the title doesn't already end with punctuation.
    message = /[.!?]$/.test(title) ? `${title} ${body}` : `${title}. ${body}`;
  }

  return (
    <>
      {/* key forces a fresh celebration (new random confetti) each time */}
      {celebrationId !== null && !reducedMotion && Celebration && <Celebration key={celebrationId} />}
      <p className="visually-hidden" role="status" aria-live="polite">
        {message}
      </p>
    </>
  );
}
