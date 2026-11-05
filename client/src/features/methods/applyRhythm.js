import { MODES, start, STATUS, switchMode, updateSettings } from '../../store/timerSlice';
import { unlockAudio } from '../../themes/sounds';
import { routeHref } from '../../components/hooks/useHashRoute';

/**
 * Set the main timer to a method's rhythm (e.g. 52/17), switch to focus,
 * start it and open the timer page. Call from a click so sound is allowed.
 */
export function applyRhythm(rhythm, { focusMinutes } = {}) {
  return (dispatch, getState) => {
    dispatch(updateSettings(focusMinutes ? { ...rhythm, focusMinutes } : rhythm));
    const { timer } = getState();
    if (timer.mode !== MODES.FOCUS || timer.status !== STATUS.IDLE) dispatch(switchMode(MODES.FOCUS));
    unlockAudio();
    dispatch(start({ now: Date.now() }));
    window.location.hash = routeHref('timer');
  };
}
