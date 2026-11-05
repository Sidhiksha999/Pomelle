import { createAsyncThunk, createSlice, nanoid } from '@reduxjs/toolkit';
import { postCoach } from '../features/coach/api';

// Flashcard decks and a simple spaced-repetition schedule (Leitner boxes).
//
// Every card sits in a "box" from 0 (new) to 5 (well known). Knowing a card
// moves it up a box, and higher boxes come back less often:
//   box 1 → tomorrow, 2 → in 3 days, 3 → in a week, 4 → in 2 weeks, 5 → in a month
// Forgetting a card sends it back to box 1 and shows it again this session.

const DAY = 24 * 60 * 60 * 1000;
export const BOX_INTERVALS = [0, 1 * DAY, 3 * DAY, 7 * DAY, 14 * DAY, 30 * DAY];
export const MASTERED_BOX = 3; // a card counts as "learned" from box 3 up

export const flashcardsInitialState = {
  decks: [], // [{ id, title, difficulty, createdAt, cards: [card] }]
  activeDeckId: null,
  status: 'idle', // not saved
  error: null, // not saved
};

function newCard({ question = '', answer = '', distractors = [] } = {}) {
  return { id: nanoid(), question, answer, distractors, box: 0, due: 0, reviews: 0, lapses: 0 };
}

/** Ask the server to turn notes into a deck. */
export const generateDeck = createAsyncThunk(
  'flashcards/generateDeck',
  async ({ notes, count, difficulty }, { rejectWithValue }) => {
    try {
      const { deck } = await postCoach('/flashcards', { notes, count, difficulty });
      return { ...deck, difficulty };
    } catch (error) {
      return rejectWithValue({ code: error.code || 'AI_FAILED', message: error.message });
    }
  },
);

const findDeck = (state, deckId) => state.decks.find((d) => d.id === deckId);

const flashcardsSlice = createSlice({
  name: 'flashcards',
  initialState: flashcardsInitialState,
  reducers: {
    createDeck: {
      reducer(state, action) {
        state.decks.unshift(action.payload);
        state.activeDeckId = action.payload.id;
      },
      prepare(title) {
        return {
          payload: { id: nanoid(), title, difficulty: 'medium', createdAt: Date.now(), cards: [newCard()] },
        };
      },
    },
    setActiveDeck(state, action) {
      state.activeDeckId = action.payload;
    },
    renameDeck(state, action) {
      const deck = findDeck(state, action.payload.deckId);
      if (deck) deck.title = action.payload.title;
    },
    deleteDeck(state, action) {
      state.decks = state.decks.filter((d) => d.id !== action.payload);
      if (state.activeDeckId === action.payload) state.activeDeckId = state.decks[0]?.id ?? null;
    },
    addCard(state, action) {
      findDeck(state, action.payload)?.cards.push(newCard());
    },
    updateCard(state, action) {
      const { deckId, cardId, changes } = action.payload;
      const card = findDeck(state, deckId)?.cards.find((c) => c.id === cardId);
      if (card) Object.assign(card, changes);
    },
    deleteCard(state, action) {
      const { deckId, cardId } = action.payload;
      const deck = findDeck(state, deckId);
      if (deck) deck.cards = deck.cards.filter((c) => c.id !== cardId);
    },
    resetDeckProgress(state, action) {
      const deck = findDeck(state, action.payload);
      deck?.cards.forEach((c) => Object.assign(c, { box: 0, due: 0, reviews: 0, lapses: 0 }));
    },
    /** grade: 'knew' | 'almost' | 'forgot'. `now` comes in the payload to keep this pure. */
    reviewCard(state, action) {
      const { deckId, cardId, grade, now } = action.payload;
      const card = findDeck(state, deckId)?.cards.find((c) => c.id === cardId);
      if (!card) return;
      card.reviews += 1;
      if (grade === 'knew') {
        card.box = Math.min(5, card.box + 1);
        card.due = now + BOX_INTERVALS[card.box];
      } else if (grade === 'almost') {
        // Stay in the same box (at least box 1) and come back tomorrow.
        card.box = Math.max(1, card.box);
        card.due = now + DAY;
      } else {
        card.box = 1;
        card.due = now; // due again right away
        card.lapses += 1;
      }
    },
    clearFlashcardError(state) {
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateDeck.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(generateDeck.fulfilled, (state, action) => {
        const { title, difficulty, cards } = action.payload;
        const deck = { id: nanoid(), title, difficulty, createdAt: Date.now(), cards: cards.map(newCard) };
        state.decks.unshift(deck);
        state.activeDeckId = deck.id;
        state.status = 'idle';
      })
      .addCase(generateDeck.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.payload || { code: 'AI_FAILED', message: action.error.message };
      });
  },
});

export const {
  createDeck,
  setActiveDeck,
  renameDeck,
  deleteDeck,
  addCard,
  updateCard,
  deleteCard,
  resetDeckProgress,
  reviewCard,
  clearFlashcardError,
} = flashcardsSlice.actions;

/** Cards with both a question and an answer (blank ones are still being written). */
export const usableCards = (deck) => deck.cards.filter((c) => c.question.trim() && c.answer.trim());

/** Numbers for a deck's progress bar. */
export function deckProgress(deck, now) {
  const cards = usableCards(deck);
  const mastered = cards.filter((c) => c.box >= MASTERED_BOX).length;
  const due = cards.filter((c) => c.due <= now).length;
  return { total: cards.length, mastered, due, ratio: cards.length ? mastered / cards.length : 0 };
}

export default flashcardsSlice.reducer;
