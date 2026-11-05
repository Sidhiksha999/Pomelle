import { addTask, setActiveTask } from '../../store/tasksSlice';
import { MODES, start, STATUS, switchMode } from '../../store/timerSlice';
import { unlockAudio } from '../../themes/sounds';
import { routeHref } from '../../components/hooks/useHashRoute';

/**
 * "Start a Pomodoro on this": makes (or reuses) a task with this name,
 * makes it the active task, starts a focus session and opens the timer.
 * Must be called from a click so the browser allows the timer sound later.
 * Returns the task id so the caller can remember it.
 */
export function startPomodoroOn({ title, subject, existingTaskId }) {
  return (dispatch, getState) => {
    const { tasks, timer } = getState();
    let taskId = existingTaskId;
    const existing = tasks.items.find((t) => t.id === taskId && !t.done);

    if (!existing) {
      const action = addTask({ title, subject, estimate: 1 });
      dispatch(action);
      taskId = action.payload.id;
    }
    dispatch(setActiveTask(taskId));

    // Don't interrupt a focus session that's already running.
    const alreadyFocusing = timer.mode === MODES.FOCUS && timer.status === STATUS.RUNNING;
    if (!alreadyFocusing) {
      if (timer.mode !== MODES.FOCUS) dispatch(switchMode(MODES.FOCUS));
      unlockAudio();
      dispatch(start({ now: Date.now() }));
    }

    window.location.hash = routeHref('timer');
    return taskId;
  };
}
