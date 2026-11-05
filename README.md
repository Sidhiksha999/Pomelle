# Pomelle

A Pomodoro study companion with five little worlds to study in: **Jolly**, **Makeup**, **Cat**, **Aesthetic** and **Minimalist**.

> **Status:** complete. All six build stages are done: themes and timer, tasks and stats, the AI coach, music, the study-methods library, and polish and onboarding.

## Features so far

- **Five themes**, each with its own timer face, mascot or decorations, fonts, sounds, cursor and voice.
- **Pomodoro timer** with custom lengths, long breaks every N sessions, auto-start, sounds and notifications.
- **Tasks** next to the timer. Press the target button on a task to work on it; every focus session you finish is credited to that task and its subject.
- **Stats** (the *Stats* link in the header): day streak, total focus hours, a weekly bar chart and a subject breakdown, all drawn in the active theme's style.
- **AI coach** (the *Coach* link):
  - **Goal → mind map.** Describe a goal and get an interactive map of milestones and topics with time estimates. Drag bubbles, pan, zoom, edit, add or delete branches, mark things done, and start a Pomodoro on any bubble. There's also an outline view.
  - **Notes → flashcards.** Paste your notes, choose how many cards and how hard. Study with flip cards and a spaced-repetition schedule, take a multiple-choice quiz, and edit every card.
  - Both also work without the AI: start a blank map or write your own deck.
- **Music mini-player** in the bottom-right corner that keeps playing while you move between pages:
  - **YouTube**: paste any video or playlist link, or pick a study stream.
  - **Spotify**: paste a playlist, album or track link. Full songs play when you're logged in to Spotify in the same browser; otherwise Spotify plays 30-second previews.
  - **Ambient mixer**: rain, thunder, forest, ocean, café, fireplace, wind, typing, white and brown noise, each with its own volume. Includes ready-made mixes ("Rainy library"…), your own saved mixes and a sleep timer.
  - **Quieter during breaks** (on by default): sounds and YouTube drop to 30% while a break runs; Spotify pauses and resumes afterwards.
- **Study-methods library** (the *Methods* link): 13 methods (Pomodoro, 52/17, Ultradian, Flowtime, Kaizen, Shu-Ha-Ri, Feynman, Active recall, Cornell notes, SQ3R, Blurting, Time-blocking, Eisenhower matrix), each with its origin, steps, what it's best for and an intensity meter. Press *Study with this method* for a guided session:
  - **Pomodoro, 52/17, Ultradian**: set the main timer to that rhythm and start.
  - **Flowtime**: a stopwatch; when focus fades, you get a break sized to match.
  - **Kaizen**: one tiny daily step, a 10-minute timer, a streak, and a "1% better tomorrow" note.
  - **Shu-Ha-Ri**: track each skill through follow → break → go beyond, with prompts and notes per stage.
  - **Feynman**: explain a topic in plain words; the AI scores clarity, accuracy and completeness, lists gaps and jargon, and shows a simpler version.
  - **Active recall**: study a flashcard deck with spaced repetition.
  - **Cornell notes**: a three-part page that covers your notes for self-quizzing.
  - **SQ3R**: a five-step walkthrough with a timer and fields for each step.
  - **Blurting**: hide your notes, write what you remember, then see which key terms you missed.
  - **Time-blocking**: plan today on a timeline and start any block as a focus session.
  - **Eisenhower matrix**: sort everything into four boxes (drag and drop or menus) and send items to your tasks.
  - Timed steps in guided sessions count toward your stats.
- **Quotes and jokes** in each theme's voice (except Minimalist), with favorites.
- **A first-run welcome** to pick your theme and focus rhythm, with a short tour. Replay it any time from *Settings → Welcome tour*.
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

## Ambient sounds (optional real recordings)

Every ambient sound is **generated in your browser** with the Web Audio API, so the mixer works with no downloads. If you'd like real recordings instead, you can swap in your own files at any time:

1. Download a loopable, royalty-free recording. Good free sources:
   - **Pixabay Sound Effects**: https://pixabay.com/sound-effects/ (no attribution needed)
   - **Freesound**: https://freesound.org/ (filter by the *Creative Commons 0* license)
2. Convert it to **MP3** if needed, and name it after the sound's id:
   `rain.mp3`, `thunder.mp3`, `forest.mp3`, `ocean.mp3`, `cafe.mp3`, `fireplace.mp3`, `wind.mp3`, `keyboard.mp3`, `white.mp3`, `brown.mp3`
3. Put it in **`client/public/audio/`** (for example `client/public/audio/rain.mp3`).
4. Reload the page. Pomelle uses your file for that sound and keeps generating the others.

Tips: 30 seconds to 2 minutes is plenty, and recordings without obvious events (a single loud thunderclap, a voice) loop most naturally.

## Project layout

```
pomelle/
├── client/                 the React app (Vite)
│   ├── index.html
│   └── src/
│       ├── components/     shared pieces: header, theme picker, settings, icons, hooks
│       ├── features/       one folder per feature (timer, tasks, stats, quotes, coach, music, methods)
│       ├── themes/         everything that makes each theme its own world
│       │   ├── index.js    the theme registry (names, voice, cursors, icons)
│       │   ├── base.css    shared foundations that read the theme variables
│       │   ├── sounds.js   completion chimes, made with the Web Audio API
│       │   └── jolly/ makeup/ cat/ aesthetic/ minimalist/
│       ├── data/           quotes and jokes, music suggestions and mixes, study methods
│       └── store/          Redux Toolkit slices + localStorage saving
└── server/                 the Express API: the only code that talks to Gemini
    ├── index.js            routes, error handling, /api/health
    ├── gemini.js           calls Gemini (JSON mode + schema), retries, fallbacks
    ├── cache.js            remembers recent answers
    ├── routes/             POST /api/mindmap, /api/flashcards, /api/feynman
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

### Change the music suggestions or mixes

Open `client/src/data/music.js`. `YOUTUBE_SUGGESTIONS` and `SPOTIFY_SUGGESTIONS` are plain lists of names and links, and `BUILT_IN_PRESETS` are the ready-made mixes (each sound's volume from 0 to 1). Live streams sometimes end; if one stops working, replace its link.

### Add a study method

1. Add an entry to `METHODS` in `client/src/data/methods.js`: name, origin, steps, what it's best for, category and difficulty (1–5).
2. Draw its illustration in `client/src/features/methods/MethodArt.jsx` (an SVG on a 120×90 canvas, keyed by the method's id).
3. Give it a guided session:
   - If it's just a timer rhythm, add `rhythm: { focusMinutes, shortMinutes, longMinutes, longBreakEvery }` and map it to `RhythmGuide` in `client/src/features/methods/guides/index.js`.
   - Otherwise write a component in `client/src/features/methods/guides/` and register it there. `MethodTimer` gives you a ready-made step timer (`countsAsFocus` adds it to stats).

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

- Every theme's text meets **WCAG AA contrast**. This was checked by measuring every piece of rendered text on every page in all five themes.
- Every button, link and form field has an accessible name, every page has a main heading, and focus is always visible.
- Everything works from the keyboard. The mind map has an outline view and arrow-key moving, and flashcards use Space and 1/2/3.
- **Settings → Motion** can reduce animations (or follow your device setting); the theme switch, confetti and card flips then become simple fades.
- Finished sessions are announced to screen readers.
- Layouts are mobile-first and were checked at phone width (375 px) on every page in every theme.

## Troubleshooting

- **The Coach says the server isn't answering.** Start the server in a second terminal: `cd server`, then `npm run dev`.
- **The Coach says it needs a key.** Follow *Setting up the Gemini API key* above, then restart the server.
- **"Gemini is busy".** Free-tier models are sometimes overloaded. Wait a minute and press *Try again*; the server already retries and switches between Flash models by itself.
- **No sound.** Browsers only allow sound after you click something on the page. Press Start once, and check *Settings → Sound*.
- **A YouTube video won't play.** Some owners don't allow their videos to be embedded on other sites. Try another link.
- **Spotify only plays 30 seconds.** Log in to Spotify in the same browser.
- **Start completely fresh.** In your browser's developer tools, under Application → Local Storage, delete the `pomelle:v1` entry and reload.
