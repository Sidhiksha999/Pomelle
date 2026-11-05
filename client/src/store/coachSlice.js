import { createAsyncThunk, createSlice, nanoid } from '@reduxjs/toolkit';
import { postCoach } from '../features/coach/api';
import { layoutMindMap, positionForNewChild } from '../features/coach/mindmap/layout';

// Mind maps made by the AI coach (or by hand).
// A map stores its nodes in a dictionary keyed by id; each node knows its
// parent, so the tree is easy to edit.

export const coachInitialState = {
  maps: [], // [{ id, title, summary, createdAt, rootId, nodes: { [id]: node } }]
  activeMapId: null,
  status: 'idle', // 'idle' | 'loading' | 'error'  (not saved)
  error: null, // { code, message }                (not saved)
};

/** Ask the server to turn a goal into a mind map. */
export const generateMindMap = createAsyncThunk('coach/generateMindMap', async (goal, { rejectWithValue }) => {
  try {
    const { map } = await postCoach('/mindmap', { goal });
    return map;
  } catch (error) {
    return rejectWithValue({ code: error.code || 'AI_FAILED', message: error.message });
  }
});

function findMap(state, mapId) {
  return state.maps.find((m) => m.id === mapId);
}

/** All the ids under a node (its children, their children, …). */
function descendants(map, nodeId) {
  const result = [];
  const stack = [nodeId];
  while (stack.length) {
    const id = stack.pop();
    for (const node of Object.values(map.nodes)) {
      if (node.parentId === id) {
        result.push(node.id);
        stack.push(node.id);
      }
    }
  }
  return result;
}

const coachSlice = createSlice({
  name: 'coach',
  initialState: coachInitialState,
  reducers: {
    /** A map with only the goal in the middle, for planning without the AI. */
    createBlankMap: {
      reducer(state, action) {
        state.maps.unshift(action.payload);
        state.activeMapId = action.payload.id;
      },
      prepare(goal) {
        const rootId = nanoid();
        return {
          payload: {
            id: nanoid(),
            title: goal,
            summary: '',
            createdAt: Date.now(),
            rootId,
            nodes: { [rootId]: { id: rootId, parentId: null, text: goal, hours: 0, done: false, branch: 0, x: 0, y: 0 } },
          },
        };
      },
    },
    setActiveMap(state, action) {
      state.activeMapId = action.payload;
    },
    deleteMap(state, action) {
      state.maps = state.maps.filter((m) => m.id !== action.payload);
      if (state.activeMapId === action.payload) state.activeMapId = state.maps[0]?.id ?? null;
    },
    updateNode(state, action) {
      const { mapId, nodeId, changes } = action.payload;
      const map = findMap(state, mapId);
      if (!map?.nodes[nodeId]) return;
      Object.assign(map.nodes[nodeId], changes);
      // Renaming the centre renames the map too.
      if (nodeId === map.rootId && typeof changes.text === 'string') map.title = changes.text;
    },
    moveNode(state, action) {
      const { mapId, nodeId, x, y } = action.payload;
      const node = findMap(state, mapId)?.nodes[nodeId];
      if (node) {
        node.x = Math.round(x);
        node.y = Math.round(y);
      }
    },
    addChildNode: {
      reducer(state, action) {
        const { mapId, parentId, id, text } = action.payload;
        const map = findMap(state, mapId);
        const parent = map?.nodes[parentId];
        if (!parent) return;
        const siblings = Object.values(map.nodes).filter((n) => n.parentId === parentId).length;
        // A new main branch gets the next color; a sub-topic keeps its branch's color.
        const branchCount = Object.values(map.nodes).filter((n) => n.parentId === map.rootId).length;
        const branch = parentId === map.rootId ? branchCount : parent.branch;
        map.nodes[id] = { id, parentId, text, hours: 0, done: false, branch, ...positionForNewChild(parent, siblings) };
      },
      prepare({ mapId, parentId, text }) {
        return { payload: { mapId, parentId, text, id: nanoid() } };
      },
    },
    deleteNode(state, action) {
      const { mapId, nodeId } = action.payload;
      const map = findMap(state, mapId);
      if (!map || nodeId === map.rootId) return; // the centre can't be deleted
      for (const id of [nodeId, ...descendants(map, nodeId)]) delete map.nodes[id];
    },
    clearCoachError(state) {
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateMindMap.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(generateMindMap.fulfilled, (state, action) => {
        const { rootId, nodes } = layoutMindMap(action.payload, nanoid);
        const map = {
          id: nanoid(),
          title: action.payload.goal,
          summary: action.payload.summary,
          createdAt: Date.now(),
          rootId,
          nodes,
        };
        state.maps.unshift(map);
        state.activeMapId = map.id;
        state.status = 'idle';
      })
      .addCase(generateMindMap.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.payload || { code: 'AI_FAILED', message: action.error.message };
      });
  },
});

export const {
  createBlankMap,
  setActiveMap,
  deleteMap,
  updateNode,
  moveNode,
  addChildNode,
  deleteNode,
  clearCoachError,
} = coachSlice.actions;

/** Share of non-centre nodes marked done, from 0 to 1. */
export function mapProgress(map) {
  const items = Object.values(map.nodes).filter((n) => n.id !== map.rootId);
  if (items.length === 0) return 0;
  return items.filter((n) => n.done).length / items.length;
}

export default coachSlice.reducer;
