import { createSlice, nanoid } from '@reduxjs/toolkit';
import { completeSession, MODES } from './timerSlice';

// The study to-do list. One task can be "active": finished focus sessions
// are credited to it (and to its subject in the stats).
export const tasksInitialState = {
  items: [], // [{ id, title, subject, estimate, pomodoros, done, createdAt }]
  activeId: null,
};

const tasksSlice = createSlice({
  name: 'tasks',
  initialState: tasksInitialState,
  reducers: {
    addTask: {
      reducer(state, action) {
        state.items.push(action.payload);
        // The first task you add becomes the one you're working on.
        if (!state.activeId) state.activeId = action.payload.id;
      },
      // prepare() builds the full task so the reducer stays pure.
      prepare({ title, subject = '', estimate = 1 }) {
        return {
          payload: {
            id: nanoid(),
            title: title.trim(),
            subject: subject.trim(),
            estimate,
            pomodoros: 0,
            done: false,
            createdAt: Date.now(),
          },
        };
      },
    },

    updateTask(state, action) {
      const { id, changes } = action.payload;
      const task = state.items.find((t) => t.id === id);
      if (task) Object.assign(task, changes);
    },

    toggleTaskDone(state, action) {
      const task = state.items.find((t) => t.id === action.payload);
      if (!task) return;
      task.done = !task.done;
      // A finished task can't stay the active one.
      if (task.done && state.activeId === task.id) state.activeId = null;
    },

    deleteTask(state, action) {
      state.items = state.items.filter((t) => t.id !== action.payload);
      if (state.activeId === action.payload) state.activeId = null;
    },

    setActiveTask(state, action) {
      state.activeId = action.payload; // an id, or null for "no task"
    },

    clearCompleted(state) {
      state.items = state.items.filter((t) => !t.done);
    },
  },

  // React to actions from other slices: a finished focus session adds a
  // pomodoro to the task it was credited to.
  extraReducers: (builder) => {
    builder.addCase(completeSession, (state, action) => {
      const { finishedMode, taskId } = action.payload;
      if (finishedMode !== MODES.FOCUS || !taskId) return;
      const task = state.items.find((t) => t.id === taskId);
      if (task) task.pomodoros += 1;
    });
  },
});

export const { addTask, updateTask, toggleTaskDone, deleteTask, setActiveTask, clearCompleted } =
  tasksSlice.actions;

export default tasksSlice.reducer;
