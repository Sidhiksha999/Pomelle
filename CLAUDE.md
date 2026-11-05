# Pomelle — project rules for every session

Pomelle is a Pomodoro-based study companion with five visual themes, an AI coach
(mind maps + flashcards), a persistent music mini-player and a study-methods library.
Read this file fully before changing anything.

---

## 1. Tech stack (STRICT — nothing outside this list)

- **Frontend:** React, plain JavaScript (NO TypeScript), built with Vite. Functional components and hooks only.
- **State:** Redux Toolkit. One slice per domain: `timer`, `theme`, `tasks`, `coach`, `flashcards`, `music`, `methods`, `stats`.
- **Backend:** Node.js + Express, plain JavaScript. Exposes routes like `POST /api/mindmap`, `POST /api/flashcards`, `POST /api/feynman`.
  The server is the ONLY code that talks to Gemini. The key is read from `/server/.env` (`GEMINI_API_KEY`). The frontend never sees it.
- **AI:** Google Gemini Flash model via `@google/genai`, using JSON output mode (`responseMimeType: "application/json"`) plus a `responseSchema`.
  No model training. All prompts live in `/server/prompts`. Server must: retry on transient errors, cache identical inputs, and return a
  friendly "AI coach needs a key" response (not a crash) when `GEMINI_API_KEY` is missing.
- **Styling:** plain CSS — one stylesheet per component (or CSS modules), themed with CSS custom properties. NO Tailwind, NO UI kits.
- **Animation:** CSS keyframes and transitions only. No animation libraries.
- **Mind map:** hand-built with SVG + React (nodes, curved links, drag, zoom/pan). No diagram libraries.
- **Charts:** hand-built SVG/CSS bar charts. No chart libraries.
- **Persistence:** `localStorage` for settings, notes, flashcards, stats.
- **Allowed npm packages — ONLY:** `react`, `react-dom`, `@reduxjs/toolkit`, `react-redux`, `express`, `cors`, `dotenv`, `@google/genai`
  (plus Vite and `@vitejs/plugin-react` as the build tooling that comes with the Vite scaffold).
  **Ask the user before adding anything else.**
- **Responsive, mobile-first.** Write base styles for small screens, enhance with `min-width` media queries.
- **Folder structure:**
  ```
  /client/src/{components, themes, features, data, store}
  /client/public/audio        ← ambient sound files
  /server/{routes, prompts}
  ```
- **Code style:** beginner-friendly. Clear names, comments explaining the non-obvious parts, no clever one-liners.
  No placeholder or "TODO" features left behind — if something ships, it works.
- **Timer accuracy:** the timer stores start/end timestamps and derives remaining time from `Date.now()`; never count `setInterval` ticks.

---

## 2. Design direction — it must NOT look AI-generated

**Banned clichés:** purple→blue gradients, generic glassmorphism on dark backgrounds, Inter/Roboto-only typography,
emoji used as icons, identical rounded-rectangle card grids, stock dashboard layouts, symmetric centered-everything layouts,
lorem-ipsum-sounding copy.

**Do instead:**
- An intentional Google Fonts pairing per theme (distinctive display + readable body) with real typographic hierarchy.
- Custom SVG illustrations and icons drawn per theme — never an off-the-shelf icon set, never emoji.
- Texture and depth: paper grain, colored-tint shadows, hand-drawn borders, imperfect/asymmetric layouts,
  overlapping elements, slightly rotated stickers.
- Motion with personality (CSS only):
  Jolly = springy/bouncy · Makeup = glossy sparkles · Cat = sleepy/soft · Aesthetic = slow/floaty · Minimalist = almost none (opacity only).
- Warm, human microcopy (empty states, buttons, errors) written in each theme's own voice.
- Details: custom cursor, themed scrollbars, themed favicon, themed loading states, first-run onboarding with theme picker.
- Accessibility: WCAG AA contrast in every theme, full keyboard navigation, visible focus, and a reduced-motion option
  (respect `prefers-reduced-motion` AND an in-app toggle).

**Themes (worlds, not recolors):** Jolly, Makeup, Cat, Aesthetic, Minimalist.
Each theme owns: palette, fonts, illustrations, button shapes, timer-ring style, completion sound, micro-interactions.
Quotes and jokes (≥30 each per theme) exist for themes 1–4 only — Minimalist shows none.
Design tokens for every theme live in `/client/src/themes/` and are the single source of truth.

---

## 3. Workflow

1. Build in stages, one at a time, in this order:
   1. Theme system + timer
   2. Tasks and stats
   3. AI coach — mind map, then flashcards
   4. Music section
   5. Study-methods library
   6. Polish and onboarding
2. After each stage: tell the user exactly how to run it and what to test, then **wait for their confirmation** before the next stage.
3. Git is initialized; make a commit after each finished (confirmed) stage.
4. Keep `README.md` current: setup steps, Gemini API-key instructions, how to add themes / quotes / methods.
5. Never commit `.env`. Keep `/server/.env.example` up to date.
