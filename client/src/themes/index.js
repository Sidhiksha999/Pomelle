// The theme registry: everything that makes each theme its own little world.
//
// HOW TO ADD A THEME
// 1. Create a folder next to this file (e.g. themes/ocean/) with:
//    - ocean.css: the CSS variables under [data-theme="ocean"] plus any overrides
//    - OceanFace.jsx: the timer face (ring + numbers + mascot)
//    - optional OceanBackdrop.jsx and OceanCelebration.jsx
// 2. Import the CSS in src/main.jsx.
// 3. Add a sound recipe in themes/sounds.js (keyed by the theme id).
// 4. Add an entry to THEMES below. Add quotes and jokes in data/quotes.js
//    if `hasQuotes` is true.

import JollyFace from './jolly/JollyFace';
import JollyBackdrop from './jolly/JollyBackdrop';
import JollyCelebration from './jolly/JollyCelebration';
import MakeupFace from './makeup/MakeupFace';
import MakeupBackdrop from './makeup/MakeupBackdrop';
import MakeupCelebration from './makeup/MakeupCelebration';
import CatFace from './cat/CatFace';
import CatBackdrop from './cat/CatBackdrop';
import CatCelebration from './cat/CatCelebration';
import AestheticFace from './aesthetic/AestheticFace';
import AestheticBackdrop from './aesthetic/AestheticBackdrop';
import AestheticCelebration from './aesthetic/AestheticCelebration';
import MinimalFace from './minimalist/MinimalFace';
import MinimalCelebration from './minimalist/MinimalCelebration';

// Arrow shape used by several custom cursors (32×32, tip at 4,3).
const ARROW = 'M4 3 L4 25 L10 19.5 L14 28 L18.5 26 L14.5 17.6 L22 17.6 Z';

const arrowCursor = (fill, stroke) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path d="${ARROW}" fill="${fill}" stroke="${stroke}" stroke-width="2" stroke-linejoin="round"/></svg>`;

const pawCursor = (fill) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><g fill="${fill}" stroke="#3B302A" stroke-width="1.4"><ellipse cx="16" cy="20" rx="6.5" ry="5.5"/><ellipse cx="8" cy="13" rx="2.6" ry="3.3"/><ellipse cx="12.5" cy="8" rx="2.6" ry="3.3"/><ellipse cx="19.5" cy="8" rx="2.6" ry="3.3"/><ellipse cx="24" cy="13" rx="2.6" ry="3.3"/></g></svg>`;

export const THEMES = [
  {
    id: 'jolly',
    name: 'Jolly',
    tagline: 'Bright, bouncy and a little bit silly.',
    hasQuotes: true,
    themeColor: '#FFF6DC',
    Face: JollyFace,
    Backdrop: JollyBackdrop,
    Celebration: JollyCelebration,
    celebrationMs: 3800,
    cursor: { default: arrowCursor('#FFC93C', '#2B1B0E'), pointer: arrowCursor('#E8432C', '#2B1B0E') },
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><g stroke="#2B1B0E" stroke-width="3.5" stroke-linecap="round"><path d="M32 4v8M32 52v8M4 32h8M52 32h8M12 12l6 6M46 46l6 6M52 12l-6 6M18 46l-6 6"/></g><circle cx="32" cy="32" r="14" fill="#FFC93C" stroke="#2B1B0E" stroke-width="3.5"/><circle cx="27" cy="30" r="2" fill="#2B1B0E"/><circle cx="37" cy="30" r="2" fill="#2B1B0E"/><path d="M26 36q6 5 12 0" fill="none" stroke="#2B1B0E" stroke-width="2.5" stroke-linecap="round"/></svg>`,
    voice: {
      modes: { focus: 'Focus time', short: 'Snack break', long: 'Big break' },
      start: "Let's go!",
      resume: 'Back at it',
      pause: 'Hold up',
      skip: 'Skip ahead',
      reset: 'Start over',
      status: {
        idle: 'Ready when you are, sunshine.',
        focus: "You're on a roll. Keep it rolling!",
        break: 'Stretch, sip, wiggle. Go on.',
        paused: 'Paused. The sun can wait a sec.',
      },
      focusDone: { title: 'Ding ding! Session done!', body: 'Grab a snack, you earned it.' },
      breakDone: { title: "Break's over, superstar", body: 'Back to the fun stuff.' },
      quoteLabel: 'Pep talk',
      jokeLabel: 'Break-time giggle',
      another: 'Another one!',
      reveal: 'Tell me!',
      favorite: 'Save as a sticker',
      unfavorite: 'Peel off this sticker',
      favoritesTitle: 'Sticker book',
      favoritesEmpty: 'No stickers yet. Tap the star on a quote you love and it lands here.',
      settingsTitle: 'Tweak the fun',
      sessionsLabel: 'Sessions this round',
    },
  },
  {
    id: 'makeup',
    name: 'Makeup',
    tagline: 'Blush, gloss and a little rose-gold glamour.',
    hasQuotes: true,
    themeColor: '#FBEFEA',
    Face: MakeupFace,
    Backdrop: MakeupBackdrop,
    Celebration: MakeupCelebration,
    celebrationMs: 3200,
    cursor: { default: arrowCursor('#F2B8C6', '#8C2F4E'), pointer: arrowCursor('#8C2F4E', '#3A1F27') },
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect x="22" y="34" width="20" height="24" rx="3" fill="#B76E79" stroke="#3A1F27" stroke-width="2.5"/><rect x="25" y="26" width="14" height="9" fill="#F3DFC1" stroke="#3A1F27" stroke-width="2.5"/><path d="M26 26V14q0-6 6-9 6 3 6 9v12z" fill="#8C2F4E" stroke="#3A1F27" stroke-width="2.5" stroke-linejoin="round"/><path d="M30 12v10" stroke="#F2B8C6" stroke-width="2" stroke-linecap="round"/></svg>`,
    voice: {
      modes: { focus: 'Focus', short: 'Touch-up', long: 'Spa break' },
      start: 'Begin the look',
      resume: 'Back to it, gorgeous',
      pause: 'Pause & blot',
      skip: 'Skip this step',
      reset: 'Fresh face',
      status: {
        idle: 'Primed and ready whenever you are.',
        focus: 'Flawless focus. Keep blending.',
        break: 'Hydrate, stretch, admire your work.',
        paused: 'Paused. Let it set for a moment.',
      },
      focusDone: { title: 'Session complete, darling', body: 'That was a flawless application. Touch-up time.' },
      breakDone: { title: 'Touch-up finished', body: 'Back to your glow-up.' },
      quoteLabel: 'Mirror note',
      jokeLabel: 'Vanity giggles',
      another: 'Swatch another',
      reveal: 'Reveal the look',
      favorite: 'Add to my vanity',
      unfavorite: 'Remove from my vanity',
      favoritesTitle: 'My vanity',
      favoritesEmpty: 'Your vanity is empty. Heart a line you love to keep it here.',
      settingsTitle: 'Customize your kit',
      sessionsLabel: 'Pans swatched',
    },
  },
  {
    id: 'cat',
    name: 'Cat',
    tagline: 'Warm blankets, soft paws and a sleepy study buddy.',
    hasQuotes: true,
    themeColor: '#FBF4EA',
    Face: CatFace,
    Backdrop: CatBackdrop,
    Celebration: CatCelebration,
    celebrationMs: 4200,
    cursor: { default: pawCursor('#F6B99A'), pointer: pawCursor('#A9532F') },
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M12 30L14 8l14 12h8l14-12 2 22q0 24-20 24T12 30z" fill="#F6B99A" stroke="#3B302A" stroke-width="3" stroke-linejoin="round"/><path d="M22 34q3-3 6 0M36 34q3-3 6 0" fill="none" stroke="#3B302A" stroke-width="2.5" stroke-linecap="round"/><path d="M30 41h4l-2 2.5z" fill="#3B302A"/></svg>`,
    voice: {
      modes: { focus: 'Hunt mode', short: 'Catnap', long: 'Long nap' },
      start: 'Wake the cat',
      resume: 'Back to the hunt',
      pause: 'Paws',
      skip: 'Skip ahead',
      reset: 'Start over',
      status: {
        idle: 'The cat is snoozing. Press start to wake her.',
        focus: 'Eyes on the mouse. You are doing purr-fectly.',
        break: 'Purr break. Stretch those paws.',
        paused: 'Paused. She went back to sleep.',
      },
      focusDone: { title: 'Hunt complete!', body: 'Curl up for a catnap. You earned it.' },
      breakDone: { title: 'Nap over', body: 'Whiskers up, back to the hunt.' },
      quoteLabel: 'Whisker wisdom',
      jokeLabel: 'Cat-nap chuckle',
      another: 'Another one, meow',
      reveal: 'Meow what?',
      favorite: 'Keep in the basket',
      unfavorite: 'Take out of the basket',
      favoritesTitle: 'The cozy basket',
      favoritesEmpty: 'Nothing in the basket yet. Tap the paw on one you like.',
      settingsTitle: 'Cozy settings',
      sessionsLabel: 'Paw prints today',
    },
  },
  {
    id: 'aesthetic',
    name: 'Aesthetic',
    tagline: 'Rain on the window, golden hour, slow pages.',
    hasQuotes: true,
    themeColor: '#ECE6DA',
    Face: AestheticFace,
    Backdrop: AestheticBackdrop,
    Celebration: AestheticCelebration,
    celebrationMs: 6500,
    cursor: { default: arrowCursor('#F7F3EC', '#3A3530'), pointer: arrowCursor('#A9858F', '#3A3530') },
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="10" fill="#ECE6DA"/><path d="M40 12a20 20 0 1 0 12 30A16 16 0 0 1 40 12z" fill="#A9858F" stroke="#3A3530" stroke-width="2.5" stroke-linejoin="round"/><circle cx="46" cy="20" r="1.8" fill="#3A3530"/><circle cx="52" cy="30" r="1.2" fill="#3A3530"/></svg>`,
    voice: {
      modes: { focus: 'deep focus', short: 'a small pause', long: 'a long breath' },
      start: 'begin',
      resume: 'continue',
      pause: 'pause',
      skip: 'skip',
      reset: 'start again',
      status: {
        idle: 'whenever you are ready. no rush.',
        focus: 'just this page, just this moment.',
        break: 'look out the window for a while.',
        paused: 'paused. the rain keeps falling.',
      },
      focusDone: { title: 'session complete', body: 'put the pen down. take a slow breath.' },
      breakDone: { title: 'the pause is over', body: 'come back to the page, gently.' },
      quoteLabel: 'a small note',
      jokeLabel: 'something light',
      another: 'another, please',
      reveal: 'and…?',
      favorite: 'press it into the journal',
      unfavorite: 'take it out of the journal',
      favoritesTitle: 'pressed pages',
      favoritesEmpty: 'nothing pressed here yet. tap the flower on a note you want to keep.',
      settingsTitle: 'settings',
      sessionsLabel: 'moons this cycle',
    },
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    tagline: 'Black. Quiet. Nothing extra.',
    hasQuotes: false,
    themeColor: '#000000',
    Face: MinimalFace,
    Backdrop: null,
    Celebration: MinimalCelebration,
    celebrationMs: 1600,
    cursor: null, // the system cursor is already minimal
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#000"/><circle cx="32" cy="32" r="20" fill="none" stroke="#3A3A3A" stroke-width="2"/><path d="M32 12a20 20 0 0 1 20 20" fill="none" stroke="#FF4D1A" stroke-width="2"/></svg>`,
    voice: {
      modes: { focus: 'Focus', short: 'Short break', long: 'Long break' },
      start: 'Start',
      resume: 'Resume',
      pause: 'Pause',
      skip: 'Skip',
      reset: 'Reset',
      status: { idle: 'Ready.', focus: 'Focus.', break: 'Break.', paused: 'Paused.' },
      focusDone: { title: 'Focus complete', body: 'Break.' },
      breakDone: { title: 'Break complete', body: 'Focus.' },
      settingsTitle: 'Settings',
      sessionsLabel: 'Sessions',
    },
  },
];

export const DEFAULT_THEME_ID = 'jolly';

/** Look up a theme by id, falling back to the default if it doesn't exist. */
export function getTheme(id) {
  return THEMES.find((t) => t.id === id) || THEMES.find((t) => t.id === DEFAULT_THEME_ID);
}

/** Turn an SVG string into something usable in `src` or CSS `url()`. */
export function svgToDataUri(svg) {
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
