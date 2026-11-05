import { getAudioContext } from '../../themes/sounds';
import { synthesize } from './ambientSynth';

// Plays the ambient mixer through the Web Audio API.
//
//   sound loop ─► its own volume ─┐
//   sound loop ─► its own volume ─┼─► master volume ─► speakers
//   sound loop ─► its own volume ─┘
//
// The React side just calls applyAmbient() with the wanted state; this file
// works out what to start, stop or fade.
//
// Real recordings: if client/public/audio/<id>.mp3 exists (e.g. rain.mp3),
// it is used instead of the generated sound.

const channels = new Map(); // id → { gain, source, loading }
let master = null;
let stopTimer = null;

/** How a 0–1 slider maps to loudness. Squaring feels more natural to the ear. */
const loudness = (value) => value * value;

function ensureMaster(ctx) {
  if (!master) {
    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
  }
  return master;
}

/** A real recording if one was added to /public/audio, otherwise the generated sound. */
async function loadBuffer(ctx, id) {
  try {
    const response = await fetch(`/audio/${id}.mp3`);
    const type = response.headers.get('content-type') || '';
    // The dev server answers missing files with the app's HTML page, so check the type.
    if (response.ok && type.startsWith('audio/')) {
      return await ctx.decodeAudioData(await response.arrayBuffer());
    }
  } catch {
    // No file or it couldn't be decoded: fall back to generating it.
  }
  // Let the browser paint first; generating takes a moment.
  await new Promise((resolve) => setTimeout(resolve, 0));
  return synthesize(ctx, id);
}

function ensureChannel(ctx, id) {
  if (channels.has(id)) return channels.get(id);
  const gain = ctx.createGain();
  gain.gain.value = 0;
  gain.connect(ensureMaster(ctx));
  const channel = { gain, source: null, loading: true };
  channels.set(id, channel);

  loadBuffer(ctx, id).then((buffer) => {
    channel.loading = false;
    if (!channels.has(id)) return; // stopped while loading
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(gain);
    // Start each loop at a random point so two sessions never sound identical.
    source.start(0, Math.random() * buffer.duration);
    channel.source = source;
  });
  return channel;
}

function stopEverything() {
  for (const channel of channels.values()) {
    try {
      channel.source?.stop();
    } catch {
      // already stopped
    }
    channel.gain.disconnect();
  }
  channels.clear();
}

/**
 * Bring the speakers in line with the wanted state.
 * @param {object} state
 * @param {boolean} state.playing   is the mixer switched on?
 * @param {object}  state.volumes   { rain: 0.6, … } from 0 to 1
 * @param {number}  state.master    overall volume, 0 to 1
 * @param {number}  state.duck      extra multiplier, e.g. 0.3 during breaks
 */
export function applyAmbient({ playing, volumes, master: masterVolume, duck = 1 }) {
  const anyOn = Object.values(volumes).some((v) => v > 0);

  if (!playing || !anyOn) {
    if (!master) return;
    const ctx = getAudioContext();
    master.gain.setTargetAtTime(0, ctx.currentTime, 0.2);
    // Once it's silent, stop the loops so they don't use any battery.
    clearTimeout(stopTimer);
    stopTimer = setTimeout(stopEverything, 1500);
    return;
  }

  clearTimeout(stopTimer);
  const ctx = getAudioContext();
  if (!ctx) return;
  ensureMaster(ctx);
  const now = ctx.currentTime;

  for (const [id, value] of Object.entries(volumes)) {
    if (value > 0) {
      ensureChannel(ctx, id).gain.gain.setTargetAtTime(loudness(value), now, 0.15);
    } else if (channels.has(id)) {
      channels.get(id).gain.gain.setTargetAtTime(0, now, 0.15);
    }
  }
  // Slow fade for ducking during breaks, quicker for normal changes.
  master.gain.setTargetAtTime(loudness(masterVolume) * duck, now, duck < 1 ? 0.8 : 0.2);
}
