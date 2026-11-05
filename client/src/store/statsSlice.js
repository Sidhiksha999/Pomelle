import { createSlice } from '@reduxjs/toolkit';
import { completeSession, MODES } from './timerSlice';

// A log of every finished focus session. All the numbers on the stats page
// (streak, hours, weekly chart, subjects) are worked out from this list.

// Keep the log from growing forever; this is years of daily study.
const MAX_SESSIONS = 5000;

export const statsInitialState = {
  sessions: [], // [{ at, minutes, subject, taskId }]
};

const statsSlice = createSlice({
  name: 'stats',
  initialState: statsInitialState,
  reducers: {
    clearHistory(state) {
      state.sessions = [];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(completeSession, (state, action) => {
      const { finishedMode, now, durationMs, subject, taskId } = action.payload;
      if (finishedMode !== MODES.FOCUS) return;
      state.sessions.push({
        at: now,
        minutes: Math.round(durationMs / 60000),
        subject: subject || '',
        taskId: taskId || null,
      });
      if (state.sessions.length > MAX_SESSIONS) {
        state.sessions.splice(0, state.sessions.length - MAX_SESSIONS);
      }
    });
  },
});

export const { clearHistory } = statsSlice.actions;

export default statsSlice.reducer;
