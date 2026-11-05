import { configureStore } from '@reduxjs/toolkit';
import timerReducer, { timerInitialState } from './timerSlice';
import themeReducer, { themeInitialState } from './themeSlice';
import tasksReducer, { tasksInitialState } from './tasksSlice';
import statsReducer, { statsInitialState } from './statsSlice';
import { loadState, saveState, mergeSaved } from './persist';

// Load whatever was saved last time and merge it over the defaults.
const saved = loadState();

const preloadedState = {
  timer: mergeSaved(timerInitialState, saved?.timer),
  theme: mergeSaved(themeInitialState, saved?.theme),
  tasks: mergeSaved(tasksInitialState, saved?.tasks),
  stats: mergeSaved(statsInitialState, saved?.stats),
};

export const store = configureStore({
  reducer: {
    timer: timerReducer,
    theme: themeReducer,
    tasks: tasksReducer,
    stats: statsReducer,
  },
  preloadedState,
});

// Pick what gets written to localStorage.
// `lastEvent` is a one-off signal (sound, confetti), so it is not saved.
function snapshot() {
  const state = store.getState();
  return {
    timer: { ...state.timer, lastEvent: null },
    theme: state.theme,
    tasks: state.tasks,
    stats: state.stats,
  };
}

// Save at most a few times per second instead of on every single action.
let saveTimer = null;
store.subscribe(() => {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => saveState(snapshot()), 300);
});

// Make sure the very last change is saved when the tab closes.
window.addEventListener('beforeunload', () => saveState(snapshot()));
