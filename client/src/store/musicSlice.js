import { createSlice, nanoid } from '@reduxjs/toolkit';
import { AMBIENT_SOUNDS } from '../data/music';

// The music mini-player: what's loaded from YouTube or Spotify, the ambient
// mixer, saved mixes, the sleep timer and the "quieter during breaks" option.

const silentMix = Object.fromEntries(AMBIENT_SOUNDS.map((s) => [s.id, 0]));

export const musicInitialState = {
  dockOpen: false,
  tab: 'ambient', // 'youtube' | 'spotify' | 'ambient'
  // { kind: 'youtube', videoId, listId, url } or { kind: 'spotify', uri, url } or null
  source: null,
  ambient: {
    playing: false, // not saved: browsers block sound until you click anyway
    master: 0.8,
    volumes: silentMix,
  },
  presets: [], // your own saved mixes: [{ id, name, volumes }]
  fadeOnBreaks: true,
  sleepEndsAt: null, // timestamp, not saved
  // Whether YouTube / Spotify are currently playing (reported by the players, not saved)
  externalPlaying: { youtube: false, spotify: false },
};

const musicSlice = createSlice({
  name: 'music',
  initialState: musicInitialState,
  reducers: {
    setDockOpen(state, action) {
      state.dockOpen = action.payload;
    },
    setMusicTab(state, action) {
      state.tab = action.payload;
    },
    /** Load something from YouTube or Spotify (replaces whatever was loaded). */
    setSource(state, action) {
      state.source = action.payload;
      state.externalPlaying = { youtube: false, spotify: false };
    },
    clearSource(state) {
      state.source = null;
      state.externalPlaying = { youtube: false, spotify: false };
    },
    setExternalPlaying(state, action) {
      const { kind, playing } = action.payload;
      state.externalPlaying[kind] = playing;
    },
    setAmbientPlaying(state, action) {
      state.ambient.playing = action.payload;
    },
    setAmbientVolume(state, action) {
      const { id, value } = action.payload;
      state.ambient.volumes[id] = value;
      // Turning a sound up switches the mixer on.
      if (value > 0) state.ambient.playing = true;
    },
    setAmbientMaster(state, action) {
      state.ambient.master = action.payload;
    },
    applyMix(state, action) {
      state.ambient.volumes = { ...silentMix, ...action.payload };
      state.ambient.playing = true;
    },
    /** Save the current mixer volumes under a name. */
    savePreset: {
      reducer(state, action) {
        state.presets.push({ ...action.payload, volumes: { ...state.ambient.volumes } });
      },
      prepare(name) {
        return { payload: { id: nanoid(), name } };
      },
    },
    deletePreset(state, action) {
      state.presets = state.presets.filter((p) => p.id !== action.payload);
    },
    setFadeOnBreaks(state, action) {
      state.fadeOnBreaks = action.payload;
    },
    setSleepEndsAt(state, action) {
      state.sleepEndsAt = action.payload; // a timestamp, or null to cancel
    },
    /** The sleep timer ran out: stop everything. */
    stopAllMusic(state) {
      state.ambient.playing = false;
      state.sleepEndsAt = null;
    },
  },
});

export default musicSlice.reducer;

export const {
  setDockOpen,
  setMusicTab,
  setSource,
  clearSource,
  setExternalPlaying,
  setAmbientPlaying,
  setAmbientVolume,
  setAmbientMaster,
  applyMix,
  savePreset,
  deletePreset,
  setFadeOnBreaks,
  setSleepEndsAt,
  stopAllMusic,
} = musicSlice.actions;
