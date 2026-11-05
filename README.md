# Pomelle

A Pomodoro study companion with five little worlds to study in: **Jolly**, **Makeup**, **Cat**, **Aesthetic** and **Minimalist**.

> **Build status:** Stages 1–3 of 6 are done: the theme system, the timer, tasks, stats and the AI coach. Music and the study-methods library come in the next stages.

## Features so far

- **Five themes**, each with its own timer face, mascot or decorations, fonts, sounds, cursor and voice.
- **Pomodoro timer** with custom lengths, long breaks every N sessions, auto-start, sounds and notifications.
- **Tasks** next to the timer. Press the target button on a task to work on it; every focus session you finish is credited to that task and its subject.
- **Stats** (the *Stats* link in the header): day streak, total focus hours, a weekly bar chart and a subject breakdown, all drawn in the active theme's style.
- **AI coach** (the *Coach* link):
  - **Goal → mind map.** Describe a goal and get an interactive map of milestones and topics with time estimates. Drag bubbles, pan, zoom, edit, add or delete branches, mark things done, and start a Pomodoro on any bubble. There's also an outline view.
  - **Notes → flashcards.** Paste your notes, choose how many cards and how hard. Study with flip cards and a spaced-repetition schedule, take a multiple-choice quiz, and edit every card.
  - Both also work without the AI: start a blank map or write your own deck.
- **Quotes and jokes** in each theme's voice (except Minimalist), with favorites.
- Everything is saved in your browser (`localStorage`), so nothing is lost on refresh.

---

## What you need

- **Node.js 20 or newer** (check with `node -v`). Download it from [nodejs.org](https://nodejs.org) if needed.
- A modern browser (Chrome, Edge, Firefox or Safari).
- For the AI coach: a free **Gemini API key** (see below). Everything else works without one.

## Run it locally

Pomelle has two parts that run side by side, each in its own terminal.

**Terminal 1: the app (client)**

```bash
cd client
npm install
npm run dev
```

**Terminal 2: the API server (needed for the AI coach)**

```bash
cd server
npm install
npm run dev
```

Then open **http://localhost:5173**. (`npm install` is only needed the first time.)

To stop either one, press `Ctrl + C` in its terminal.

## Setting up the Gemini API key

The AI coach uses Google's Gemini API. Only the server ever sees the key; the browser never does.

1. Get a free key at **https://aistudio.google.com/apikey**.
2. In the `server` folder, copy `.env.example` to a new file called `.env`.
3. Open `server/.env` and paste the key after `GEMINI_API_KEY=` (no quotes, no spaces).
4. Restart the server (`Ctrl + C`, then `npm run dev` again).

`server/.env` is listed in `.gitignore`, so the key is never committed. **Put the key only in `.env`, never in `.env.example`**: the example file is meant to be shared.

Good to know:

- **Model.** The server uses `GEMINI_MODEL` from `.env` (default `gemini-3.5-flash`). If that model is busy or unavailable, it automatically falls back to Google's other Flash models.
- **Busy times.** Each request is retried a few times, but never for longer than about 45 seconds. After that the coach shows a friendly "try again in a minute" message.
- **Saving quota.** Answers are cached on the server and in the browser, so asking for exactly the same map or deck again doesn't use any more of your free quota.

## Project layout

```
pomelle/
├── client/                 the React app (Vite)
│   ├── index.html
│   └── src/
│       ├── components/     shared pieces: header, theme picker, settings, icons, hooks
│       ├── features/       one folder per feature (timer, tasks, stats, quotes, coach)
│       ├── themes/         everything that makes each theme its own world
│       │   ├── index.js    the theme registry (names, voice, cursors, icons)
│       │   ├── base.css    shared foundations that read the theme variables
│       │   ├── sounds.js   completion chimes, made with the Web Audio API
│       │   └── jolly/ makeup/ cat/ aesthetic/ minimalist/
│       ├── data/           quotes and jokes
│       └── store/          Redux Toolkit slices + localStorage saving
└── server/                 the Express API: the only code that talks to Gemini
    ├── index.js            routes, error handling, /api/health
    ├── gemini.js           calls Gemini (JSON mode + schema), retries, fallbacks
    ├── cache.js            remembers recent answers
    ├── routes/             POST /api/mindmap, POST /api/flashcards
    └── prompts/            the prompts and response schemas (easy to tune)
```

## How things work

**Timer.** The timer never counts seconds. When you press start it saves the exact moment the session should end (`endsAt`). The time left is always `endsAt − now`. Browsers slow down background tabs, but the countdown stays right because it only compares timestamps.

**Spaced repetition.** Each card sits in a box from 0 (new) to 5. *Knew it* moves it up a box, and higher boxes come back later: tomorrow, in 3 days, a week, 2 weeks, a month. *Almost* brings it back tomorrow. *Didn't know* sends it back to box 1 and repeats it in the same session. A card counts as *learned* from box 3.

**Prompts.** To change how the coach plans or writes cards, edit the files in `server/prompts/`. Each one has the instructions (`system`), the message built from your input (`buildPrompt`) and the exact JSON shape Gemini must answer with (`schema`).

## Keyboard shortcuts

| Where      | Key        | Action                          |
| ---------- | ---------- | ------------------------------- |
| Timer      | Space      | Start or pause                  |
| Timer      | R          | Reset the current session       |
| Timer      | S          | Skip to the next session        |
| Mind map   | Tab        | Move between bubbles            |
| Mind map   | Arrow keys | Move the focused bubble (Shift = further) |
| Flashcards | Space      | Flip the card                   |
| Flashcards | 1 / 2 / 3  | Didn't know / Almost / Knew it  |

## Customizing

### Add quotes or jokes

Open `client/src/data/quotes.js` and add a line to the theme's `quotes` or `jokes` list. Write jokes as **"Question? Answer."** The card splits them at the first `?` so the answer can be revealed with a button.

### Add a new theme

1. Create a folder in `client/src/themes/`, for example `ocean/`, containing:
   - `ocean.css`: the CSS variables under `[data-theme='ocean'] { … }` (copy one of the existing theme files to see every variable) plus any extra styling.
   - `OceanFace.jsx`: the timer face. It receives `progress` (0 to 1), `timeText`, `mode`, `status`, `modeLabel`, `justStarted` and `justCompleted`. Give the dial SVG the class `face__dial`.
   - Optional: `OceanBackdrop.jsx` (decorations behind the page) and `OceanCelebration.jsx` (what plays when a focus session ends).
2. Import `ocean.css` in `client/src/main.jsx`.
3. Add a sound recipe called `ocean` in `client/src/themes/sounds.js`.
4. Add an entry to the `THEMES` list in `client/src/themes/index.js`, including the `voice` texts (timer, tasks, stats and coach wording) and a `chart` bar style (`chunky`, `lipstick`, `paws`, `hatched` or `line`).
   Define `--series-1` to `--series-6` in your CSS; tasks, charts and mind-map branches use them for colors.
5. If `hasQuotes` is `true`, add an `ocean` section to `client/src/data/quotes.js`.

Pages also have a few theme-specific touches in their own stylesheets (look for `[data-theme='…']` in `features/*/*.css`).

## Accessibility

- Every theme's text meets WCAG AA contrast.
- Everything works from the keyboard and focus is always visible. The mind map has an outline view as a list.
- **Settings → Motion** can reduce animations (or follow your device setting).
- Finished sessions are announced to screen readers.
