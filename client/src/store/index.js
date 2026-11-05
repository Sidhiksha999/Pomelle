import { configureStore } from '@reduxjs/toolkit';
import timerReducer, { timerInitialState } from './timerSlice';
import themeReducer, { themeInitialState } from './themeSlice';
import tasksReducer, { tasksInitialState } from './tasksSlice';
import statsReducer, { statsInitialState } from './statsSlice';
import coachReducer, { coachInitialState } from './coachSlice';
import flashcardsReducer, { flashcardsInitialState } from './flashcardsSlice';
import musicReducer, { musicInitialState } from './musicSlice';
import { loadState, saveState, mergeSaved } from './persist';

// Load whatever was saved last time and merge it over the defaults.
const saved = loadState();

const preloadedState = {
  timer: mergeSaved(timerInitialState, saved?.timer),
  theme: mergeSaved(themeInitialState, saved?.theme),
  tasks: mergeSaved(tasksInitialState, saved?.tasks),
  stats: mergeSaved(statsInitialState, saved?.stats),
  coach: mergeSaved(coachInitialState, saved?.coach),
  flashcards: mergeSaved(flashcardsInitialState, saved?.flashcards),
  music: mergeSaved(musicInitialState, saved?.music),
};

export const store = configureStore({
  reducer: {
    timer: timerReducer,
    theme: themeReducer,
    tasks: tasksReducer,
    stats: statsReducer,
    coach: coachReducer,
    flashcards: flashcardsReducer,
    music: musicReducer,
  },
  preloadedState,
});

// Pick what gets written to localStorage. One-off signals (`lastEvent`) and
// request states (loading, errors) are not saved.
function snapshot() {
  const state = store.getState();
  return {
    timer: { ...state.timer, lastEvent: null },
    theme: state.theme,
    tasks: state.tasks,
    stats: state.stats,
    coach: { maps: state.coach.maps, activeMapId: state.coach.activeMapId },
    flashcards: { decks: state.flashcards.decks, activeDeckId: state.flashcards.activeDeckId },
    // Music: settings and mixes are kept; "is it playing" is not, because
    // browsers won't play sound after a reload until you click anyway.
    music: {
      tab: state.music.tab,
      source: state.music.source,
      ambient: { ...state.music.ambient, playing: false },
      presets: state.music.presets,
      fadeOnBreaks: state.music.fadeOnBreaks,
    },
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
