import { useEffect } from 'react';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { completeSession, durationFor, MODES, STATUS } from '../../store/timerSlice';
import { getTheme } from '../../themes';
import { playChime } from '../../themes/sounds';
import { sendNotification } from './notify';

/**
 * The timer engine. Mounted once in <App>, it watches for the moment the
 * running session reaches its `endsAt` timestamp and then:
 *   1. dispatches completeSession (which moves on to the next mode)
 *   2. plays the theme's sound
 *   3. sends a notification if the user is in another tab
 *
 * It sets ONE timeout for the exact end time instead of ticking every
 * second. Browsers may delay timeouts in background tabs, so it also
 * re-checks whenever the tab becomes visible again.
 */
export function useTimerEngine() {
  const dispatch = useDispatch();
  const store = useStore();
  const status = useSelector((s) => s.timer.status);
  const endsAt = useSelector((s) => s.timer.endsAt);

  useEffect(() => {
    if (status !== STATUS.RUNNING || !endsAt) return undefined;

    let timeoutId = null;
    let finished = false; // makes sure we never complete the same session twice

    const check = () => {
      if (finished) return;
      const now = Date.now();
      if (now < endsAt) {
        // Not yet: wait for the remaining time (plus a few ms of slack).
        clearTimeout(timeoutId);
        timeoutId = setTimeout(check, endsAt - now + 15);
        return;
      }
      finished = true;

      const { timer, theme: themeState } = store.getState();
      const finishedMode = timer.mode;
      dispatch(
        completeSession({
          now,
          finishedMode,
          durationMs: durationFor(finishedMode, timer.settings),
        }),
      );

      const theme = getTheme(themeState.current);
      if (themeState.soundOn) playChime(theme.id, themeState.volume);
      if (themeState.notificationsOn) {
        const message = finishedMode === MODES.FOCUS ? theme.voice.focusDone : theme.voice.breakDone;
        sendNotification(message.title, message.body);
      }
    };

    check();
    const onVisible = () => {
      if (document.visibilityState === 'visible') check();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      finished = true;
      clearTimeout(timeoutId);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [status, endsAt, dispatch, store]);
}
