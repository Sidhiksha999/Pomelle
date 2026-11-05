# Pomelle

A Pomodoro study companion with five little worlds to study in: **Jolly**, **Makeup**, **Cat**, **Aesthetic** and **Minimalist**.

> **Build status:** Stage 1 of 6 (theme system + timer) is done. Tasks and stats, the AI coach, music and the study-methods library come in the next stages.

---

## What you need

- **Node.js 20 or newer** (check with `node -v`). Download it from [nodejs.org](https://nodejs.org) if needed.
- A modern browser (Chrome, Edge, Firefox or Safari).

## Run it locally

1. Open a terminal in the `pomelle` folder.
2. Go into the client folder and install the packages (only needed the first time):

   ```bash
   cd client
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open **http://localhost:5173** in your browser.

To stop the server, press `Ctrl + C` in the terminal.

## Project layout

```
pomelle/
├── client/                 the React app (Vite)
│   ├── index.html
│   └── src/
│       ├── components/     shared pieces: header, theme picker, settings, icons, hooks
│       ├── features/       one folder per feature (timer, quotes, …)
│       ├── themes/         everything that makes each theme its own world
│       │   ├── index.js    the theme registry (names, voice, cursors, icons)
│       │   ├── base.css    shared foundations that read the theme variables
│       │   ├── sounds.js   completion chimes, made with the Web Audio API
│       │   └── jolly/ makeup/ cat/ aesthetic/ minimalist/
│       ├── data/           quotes and jokes
│       └── store/          Redux Toolkit slices + localStorage saving
└── server/                 the Express API (arrives with the AI coach, Stage 3)
```

## How the timer keeps correct time

The timer never counts seconds. When you press start it saves the exact moment the session should end (`endsAt`). The time left is always `endsAt − now`. Browsers slow down background tabs, but the countdown stays right because it only compares timestamps. A refresh doesn't lose a running session either, because the timer state is saved to `localStorage`.

## Keyboard shortcuts

| Key   | Action                    |
| ----- | ------------------------- |
| Space | Start or pause            |
| R     | Reset the current session |
| S     | Skip to the next session  |

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
4. Add an entry to the `THEMES` list in `client/src/themes/index.js`, including the `voice` texts.
5. If `hasQuotes` is `true`, add an `ocean` section to `client/src/data/quotes.js`.

## Accessibility

- Every theme's text meets WCAG AA contrast.
- Everything works from the keyboard and focus is always visible.
- **Settings → Motion** can reduce animations (or follow your device setting).
- Finished sessions are announced to screen readers.
