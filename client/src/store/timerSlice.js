import { createSlice } from '@reduxjs/toolkit';

// The three kinds of session the timer can be in.
export const MODES = {
  FOCUS: 'focus',
  SHORT: 'short',
  LONG: 'long',
};

// What the timer is doing right now.
export const STATUS = {
  IDLE: 'idle', // ready to start, full time on the clock
  RUNNING: 'running',
  PAUSED: 'paused',
};

const defaultSettings = {
  focusMinutes: 25,
  shortMinutes: 5,
  longMinutes: 15,
  longBreakEvery: 4, // a long break comes after this many focus sessions
  autoStartBreaks: false,
  autoStartFocus: false,
};

/** How long a mode lasts, in milliseconds, with the given settings. */
export function durationFor(mode, settings) {
  const minutes =
    mode === MODES.FOCUS
      ? settings.focusMinutes
      : mode === MODES.SHORT
        ? settings.shortMinutes
        : settings.longMinutes;
  return Math.round(minutes * 60 * 1000);
}

/*
 * HOW THE TIMER KEEPS CORRECT TIME
 * We never count ticks. When the timer starts we store `endsAt`, the exact
 * moment (a Date.now() timestamp) it should finish. The time left is always
 * `endsAt - Date.now()`, so it stays right even if the browser slows down
 * timers in a background tab. When paused we store the leftover time in
 * `remainingMs` instead.
 *
 * Reducers must be pure, so every action that needs "now" receives it in
 * its payload rather than calling Date.now() itself.
 */
export const timerInitialState = {
  mode: MODES.FOCUS,
  status: STATUS.IDLE,
  endsAt: null, // timestamp, only set while running
  remainingMs: durationFor(MODES.FOCUS, defaultSettings), // used while idle/paused
  cycleCount: 0, // focus sessions finished since the last long break
  lastEvent: null, // { id, type: 'completed', mode, at } — drives sounds and confetti
  settings: defaultSettings,
};

/** Pick the mode that follows a finished (or skipped) one. */
function nextModeAfter(state, countedFocus) {
  if (state.mode !== MODES.FOCUS) return MODES.FOCUS;
  if (countedFocus && state.cycleCount % state.settings.longBreakEvery === 0) {
    return MODES.LONG;
  }
  return MODES.SHORT;
}

/** Move to a new mode, either waiting (idle) or already running. */
function enterMode(state, mode, now, autoStart) {
  // Leaving a long break starts a fresh cycle of session dots.
  if (state.mode === MODES.LONG) state.cycleCount = 0;
  state.mode = mode;
  const duration = durationFor(mode, state.settings);
  if (autoStart) {
    state.status = STATUS.RUNNING;
    state.endsAt = now + duration;
    state.remainingMs = duration;
  } else {
    state.status = STATUS.IDLE;
    state.endsAt = null;
    state.remainingMs = duration;
  }
}

const timerSlice = createSlice({
  name: 'timer',
  initialState: timerInitialState,
  reducers: {
    start(state, action) {
      if (state.status === STATUS.RUNNING) return;
      const { now } = action.payload;
      state.endsAt = now + state.remainingMs;
      state.status = STATUS.RUNNING;
    },

    pause(state, action) {
      if (state.status !== STATUS.RUNNING) return;
      const { now } = action.payload;
      state.remainingMs = Math.max(0, state.endsAt - now);
      state.endsAt = null;
      state.status = STATUS.PAUSED;
    },

    reset(state) {
      state.status = STATUS.IDLE;
      state.endsAt = null;
      state.remainingMs = durationFor(state.mode, state.settings);
    },

    // Jump to the next mode without counting the current session.
    skip(state, action) {
      const { now } = action.payload;
      enterMode(state, nextModeAfter(state, false), now, false);
    },

    // Pick a mode by hand from the mode tabs.
    switchMode(state, action) {
      const mode = action.payload;
      if (state.mode === mode && state.status === STATUS.IDLE) return;
      state.mode = mode;
      state.status = STATUS.IDLE;
      state.endsAt = null;
      state.remainingMs = durationFor(mode, state.settings);
    },

    /**
     * Called by the timer engine when the clock reaches zero.
     * Payload: { now, finishedMode, durationMs, taskId, subject } — the extra
     * fields let the tasks and stats slices record what was just finished.
     */
    completeSession(state, action) {
      const { now } = action.payload;
      const finished = state.mode;
      if (finished === MODES.FOCUS) state.cycleCount += 1;

      state.lastEvent = {
        id: (state.lastEvent?.id ?? 0) + 1,
        type: 'completed',
        mode: finished,
        at: now,
      };

      const next = nextModeAfter(state, true);
      const autoStart =
        next === MODES.FOCUS ? state.settings.autoStartFocus : state.settings.autoStartBreaks;
      enterMode(state, next, now, autoStart);
    },

    updateSettings(state, action) {
      state.settings = { ...state.settings, ...action.payload };
      // If the timer hasn't started yet, show the new length right away.
      if (state.status === STATUS.IDLE) {
        state.remainingMs = durationFor(state.mode, state.settings);
      }
      // Keep the cycle counter inside the new range.
      if (state.cycleCount > state.settings.longBreakEvery) {
        state.cycleCount = state.settings.longBreakEvery;
      }
    },
  },
});

export const { start, pause, reset, skip, switchMode, completeSession, updateSettings } =
  timerSlice.actions;

/** Milliseconds left on the clock at the moment `now`. */
export function remainingAt(timer, now) {
  if (timer.status === STATUS.RUNNING && timer.endsAt) {
    return Math.max(0, timer.endsAt - now);
  }
  return timer.remainingMs;
}

export default timerSlice.reducer;
