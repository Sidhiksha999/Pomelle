import { createAsyncThunk, createSlice, nanoid } from '@reduxjs/toolkit';
import { postCoach } from '../features/coach/api';

// Everything the guided study methods remember between visits.

export const methodsInitialState = {
  kaizen: [], // [{ id, day: 'YYYY-MM-DD', step, done, better }]
  shuhari: [], // [{ id, topic, stage: 'shu' | 'ha' | 'ri', notes: { shu, ha, ri } }]
  feynman: [], // [{ id, topic, audience, explanation, review, createdAt }]
  cornell: [], // [{ id, title, notes, cues, summary, updatedAt }]
  blocks: {}, // { 'YYYY-MM-DD': [{ id, start: '09:00', minutes, label, done }] }
  matrix: [], // [{ id, text, quadrant: 'do' | 'schedule' | 'delegate' | 'drop', done }]
  feynmanStatus: 'idle', // not saved
  feynmanError: null, // not saved
};

/** Ask the AI to review a Feynman explanation. */
export const reviewExplanation = createAsyncThunk(
  'methods/reviewExplanation',
  async ({ topic, audience, explanation }, { rejectWithValue }) => {
    try {
      const { review } = await postCoach('/feynman', { topic, audience, explanation });
      return { topic, audience, explanation, review };
    } catch (error) {
      return rejectWithValue({ code: error.code || 'AI_FAILED', message: error.message });
    }
  },
);

const byId = (list, id) => list.find((item) => item.id === id);

const methodsSlice = createSlice({
  name: 'methods',
  initialState: methodsInitialState,
  reducers: {
    // ---- Kaizen ----
    addKaizenStep: {
      reducer(state, action) {
        state.kaizen.unshift(action.payload);
      },
      prepare({ day, step }) {
        return { payload: { id: nanoid(), day, step, done: false, better: '' } };
      },
    },
    updateKaizenStep(state, action) {
      const entry = byId(state.kaizen, action.payload.id);
      if (entry) Object.assign(entry, action.payload.changes);
    },

    // ---- Shu-Ha-Ri ----
    addShuHaRiTopic: {
      reducer(state, action) {
        state.shuhari.unshift(action.payload);
      },
      prepare(topic) {
        return { payload: { id: nanoid(), topic, stage: 'shu', notes: { shu: '', ha: '', ri: '' } } };
      },
    },
    updateShuHaRiTopic(state, action) {
      const topic = byId(state.shuhari, action.payload.id);
      if (!topic) return;
      const { stage, note } = action.payload;
      if (stage) topic.stage = stage;
      if (note) topic.notes[note.stage] = note.text;
    },
    deleteShuHaRiTopic(state, action) {
      state.shuhari = state.shuhari.filter((t) => t.id !== action.payload);
    },

    // ---- Feynman ----
    deleteFeynman(state, action) {
      state.feynman = state.feynman.filter((f) => f.id !== action.payload);
    },
    clearFeynmanError(state) {
      state.feynmanStatus = 'idle';
      state.feynmanError = null;
    },

    // ---- Cornell notes ----
    addCornell: {
      reducer(state, action) {
        state.cornell.unshift(action.payload);
      },
      prepare(title) {
        return { payload: { id: nanoid(), title, notes: '', cues: '', summary: '', updatedAt: Date.now() } };
      },
    },
    updateCornell: {
      reducer(state, action) {
        const page = byId(state.cornell, action.payload.id);
        if (page) Object.assign(page, action.payload.changes, { updatedAt: action.payload.at });
      },
      prepare(payload) {
        return { payload: { ...payload, at: Date.now() } };
      },
    },
    deleteCornell(state, action) {
      state.cornell = state.cornell.filter((c) => c.id !== action.payload);
    },

    // ---- Time-blocking ----
    addBlock: {
      reducer(state, action) {
        const { day, block } = action.payload;
        state.blocks[day] = [...(state.blocks[day] || []), block].sort((a, b) => a.start.localeCompare(b.start));
      },
      prepare({ day, start, minutes, label }) {
        return { payload: { day, block: { id: nanoid(), start, minutes, label, done: false } } };
      },
    },
    updateBlock(state, action) {
      const { day, id, changes } = action.payload;
      const block = state.blocks[day]?.find((b) => b.id === id);
      if (block) Object.assign(block, changes);
      state.blocks[day]?.sort((a, b) => a.start.localeCompare(b.start));
    },
    deleteBlock(state, action) {
      const { day, id } = action.payload;
      state.blocks[day] = (state.blocks[day] || []).filter((b) => b.id !== id);
    },

    // ---- Eisenhower matrix ----
    addMatrixItem: {
      reducer(state, action) {
        state.matrix.push(action.payload);
      },
      prepare({ text, quadrant }) {
        return { payload: { id: nanoid(), text, quadrant, done: false } };
      },
    },
    updateMatrixItem(state, action) {
      const item = byId(state.matrix, action.payload.id);
      if (item) Object.assign(item, action.payload.changes);
    },
    deleteMatrixItem(state, action) {
      state.matrix = state.matrix.filter((i) => i.id !== action.payload);
    },
    clearDoneMatrixItems(state) {
      state.matrix = state.matrix.filter((i) => !i.done);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(reviewExplanation.pending, (state) => {
        state.feynmanStatus = 'loading';
        state.feynmanError = null;
      })
      .addCase(reviewExplanation.fulfilled, (state, action) => {
        state.feynman.unshift({ id: nanoid(), createdAt: Date.now(), ...action.payload });
        state.feynman = state.feynman.slice(0, 50); // keep the 50 most recent
        state.feynmanStatus = 'idle';
      })
      .addCase(reviewExplanation.rejected, (state, action) => {
        state.feynmanStatus = 'error';
        state.feynmanError = action.payload || { code: 'AI_FAILED', message: action.error.message };
      });
  },
});

export const {
  addKaizenStep,
  updateKaizenStep,
  addShuHaRiTopic,
  updateShuHaRiTopic,
  deleteShuHaRiTopic,
  deleteFeynman,
  clearFeynmanError,
  addCornell,
  updateCornell,
  deleteCornell,
  addBlock,
  updateBlock,
  deleteBlock,
  addMatrixItem,
  updateMatrixItem,
  deleteMatrixItem,
  clearDoneMatrixItems,
} = methodsSlice.actions;

export default methodsSlice.reducer;
