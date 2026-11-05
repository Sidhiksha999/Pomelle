// Completion sounds for every theme, made live with the Web Audio API.
// No audio files are needed: each "recipe" schedules a few short tones.

let audioContext = null;

/**
 * Browsers only allow sound after the user has interacted with the page,
 * so we create the AudioContext lazily and resume it on the first click.
 */
export function getAudioContext() {
  if (!audioContext) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    audioContext = new AudioCtx();
  }
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  return audioContext;
}

/** Call this from a click handler (like Start) so later chimes are allowed to play. */
export function unlockAudio() {
  getAudioContext();
}

/**
 * Play one note with a quick fade-in and a smooth fade-out.
 * `glide` optionally bends the pitch: [[freq, secondsAfterStart], ...]
 */
function note(ctx, output, { freq, at, length, type = 'sine', volume = 0.3, attack = 0.006, glide, detune = 0 }) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.detune.value = detune;
  osc.frequency.setValueAtTime(freq, at);
  if (glide) {
    for (const [target, offset] of glide) {
      osc.frequency.exponentialRampToValueAtTime(target, at + offset);
    }
  }
  // Envelope: silent → peak → (almost) silent. Exponential ramps can't reach 0.
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.linearRampToValueAtTime(volume, at + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + length);
  osc.connect(gain);
  gain.connect(output);
  osc.start(at);
  osc.stop(at + length + 0.05);
}

const recipes = {
  // Jolly: a bright xylophone arpeggio that bounces upward.
  jolly(ctx, out, t) {
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
    notes.forEach((freq, i) => {
      note(ctx, out, { freq, at: t + i * 0.09, length: 0.4, type: 'triangle', volume: 0.32 });
    });
    note(ctx, out, { freq: 1567.98, at: t + 0.42, length: 0.6, volume: 0.12 });
  },

  // Makeup: a glassy bell struck twice, then a quick shimmer.
  makeup(ctx, out, t) {
    const bell = (base, at) => {
      // Bells sound "bell-like" because their overtones aren't whole multiples.
      [
        [1, 0.22, 1.8],
        [2.76, 0.07, 1.0],
        [5.4, 0.035, 0.5],
      ].forEach(([ratio, volume, length]) => note(ctx, out, { freq: base * ratio, at, length, volume }));
    };
    bell(1318.51, t);
    bell(1760, t + 0.28);
    [3520, 3135.96, 2793.83, 2637.02].forEach((freq, i) => {
      note(ctx, out, { freq, at: t + 0.6 + i * 0.05, length: 0.25, volume: 0.04 });
    });
  },

  // Cat: a soft little "mrrp" (a rising-then-falling glide) and a gentle chime.
  cat(ctx, out, t) {
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1600;
    filter.connect(out);
    note(ctx, filter, {
      freq: 520,
      at: t,
      length: 0.42,
      type: 'triangle',
      volume: 0.28,
      attack: 0.03,
      glide: [
        [820, 0.12],
        [600, 0.36],
      ],
    });
    note(ctx, out, { freq: 783.99, at: t + 0.5, length: 1.0, volume: 0.14 });
    note(ctx, out, { freq: 1174.66, at: t + 0.72, length: 1.2, volume: 0.12 });
  },

  // Aesthetic: a few music-box notes, slightly out of tune like an old one.
  aesthetic(ctx, out, t) {
    const melody = [1318.51, 1174.66, 987.77, 1046.5, 783.99]; // E6 D6 B5 C6 G5
    melody.forEach((freq, i) => {
      const at = t + i * 0.3;
      const detune = i % 2 === 0 ? 6 : -5;
      note(ctx, out, { freq, at, length: 1.5, volume: 0.17, attack: 0.003, detune });
      note(ctx, out, { freq: freq * 2, at, length: 0.6, volume: 0.035, attack: 0.003 });
    });
  },

  // Minimalist: one clean tone. Nothing more.
  minimalist(ctx, out, t) {
    note(ctx, out, { freq: 880, at: t, length: 0.9, volume: 0.2, attack: 0.01 });
  },
};

/** Play the completion sound for a theme at a volume from 0 to 1. */
export function playChime(themeId, volume = 0.7) {
  const ctx = getAudioContext();
  if (!ctx) return;
  const master = ctx.createGain();
  master.gain.value = volume;
  master.connect(ctx.destination);
  const recipe = recipes[themeId] || recipes.minimalist;
  recipe(ctx, master, ctx.currentTime + 0.03);
}
