import { createSlice } from '@reduxjs/toolkit';

// The theme slice holds the active theme plus the "feel" preferences that
// go with it: sound, notifications, motion, and favorite quotes and jokes.
export const themeInitialState = {
  current: 'jolly',
  reducedMotion: 'system', // 'system' follows the OS setting, 'on' or 'off' override it
  soundOn: true,
  volume: 0.7, // 0 to 1
  notificationsOn: false,
  favorites: [], // [{ themeId, kind: 'quote' | 'joke', text, savedAt }]
  onboarded: false, // has the first-run welcome been shown?
};

const themeSlice = createSlice({
  name: 'theme',
  initialState: themeInitialState,
  reducers: {
    setTheme(state, action) {
      state.current = action.payload;
    },
    setReducedMotion(state, action) {
      state.reducedMotion = action.payload;
    },
    setSoundOn(state, action) {
      state.soundOn = action.payload;
    },
    setVolume(state, action) {
      state.volume = Math.min(1, Math.max(0, action.payload));
    },
    setNotificationsOn(state, action) {
      state.notificationsOn = action.payload;
    },
    setOnboarded(state, action) {
      state.onboarded = action.payload;
    },
    toggleFavorite: {
      reducer(state, action) {
        const { themeId, text } = action.payload;
        const index = state.favorites.findIndex((f) => f.themeId === themeId && f.text === text);
        if (index >= 0) {
          state.favorites.splice(index, 1);
        } else {
          state.favorites.unshift(action.payload);
        }
      },
      // The timestamp is added here so the reducer itself stays pure.
      prepare(item) {
        return { payload: { ...item, savedAt: Date.now() } };
      },
    },
  },
});

export const {
  setTheme,
  setReducedMotion,
  setSoundOn,
  setVolume,
  setNotificationsOn,
  setOnboarded,
  toggleFavorite,
} = themeSlice.actions;

export default themeSlice.reducer;
