// Generates the ambient sounds from scratch, with plain math.
//
// Each sound is a short stereo recording (a few seconds of numbers) that we
// build once and then loop. Everything starts from random noise:
//   white noise  = every sample random            (hiss)
//   pink noise   = softer highs                   (rain, leaves)
//   brown noise  = much softer highs              (rumble, distant sea)
// Then we shape it with simple filters and volume envelopes, and add little
// events on top: rain drops, fire crackles, bird chirps, key clicks.
//
// The end of each loop is cross-faded into its start, so you never hear a seam.

const TAU = Math.PI * 2;
const white = () => Math.random() * 2 - 1;
const rand = (lo, hi) => lo + Math.random() * (hi - lo);

/** Pink noise generator (Paul Kellet's filter). Call the returned function once per sample. */
function pinkNoise() {
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  return () => {
    const w = white();
    b0 = 0.99886 * b0 + w * 0.0555179;
    b1 = 0.99332 * b1 + w * 0.0750759;
    b2 = 0.969 * b2 + w * 0.153852;
    b3 = 0.8665 * b3 + w * 0.3104856;
    b4 = 0.55 * b4 + w * 0.5329522;
    b5 = -0.7616 * b5 - w * 0.016898;
    const out = b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362;
    b6 = w * 0.115926;
    return out * 0.11;
  };
}

/** Brown noise generator: a random walk that drifts back towards zero. */
function brownNoise() {
  let last = 0;
  return () => {
    last = (last + 0.02 * white()) / 1.02;
    return last * 3.5;
  };
}

/** One-pole low-pass filter: keeps frequencies below `cutoff` (Hz). */
function lowPass(sampleRate, cutoff) {
  let y = 0;
  let a = Math.exp((-TAU * cutoff) / sampleRate);
  const step = (x) => (y = (1 - a) * x + a * y);
  step.setCutoff = (c) => {
    a = Math.exp((-TAU * c) / sampleRate);
  };
  return step;
}

/** One-pole high-pass filter: removes frequencies below `cutoff` (Hz). */
function highPass(sampleRate, cutoff) {
  const lp = lowPass(sampleRate, cutoff);
  return (x) => x - lp(x);
}

/** A slow, smooth wobble between 0 and 1 (several sines that never line up). */
function slowWobble(seed) {
  const f = [0.071, 0.13, 0.217].map((n) => n * (1 + seed * 0.1));
  const p = [seed, seed * 2.1, seed * 3.7];
  return (t) => 0.5 + (Math.sin(TAU * f[0] * t + p[0]) * 0.5 + Math.sin(TAU * f[1] * t + p[1]) * 0.3 + Math.sin(TAU * f[2] * t + p[2]) * 0.2) * 0.5;
}

/** Add a decaying burst of noise starting at sample `start`. */
function addBurst(data, start, { amp, decaySamples, length, filter }) {
  for (let k = 0; k < length && start + k < data.length; k += 1) {
    const s = white() * amp * Math.exp(-k / decaySamples);
    data[start + k] += filter ? filter(s) : s;
  }
}

/** Add a short sine "ping" (cup clink, key thock) starting at sample `start`. */
function addTone(data, start, sampleRate, { freq, amp, decay, length }) {
  const n = Math.floor(length * sampleRate);
  for (let k = 0; k < n && start + k < data.length; k += 1) {
    const t = k / sampleRate;
    data[start + k] += Math.sin(TAU * freq * t) * amp * Math.exp(-t / decay);
  }
}

// ---------------------------------------------------------------------------
// The sounds. Each returns [left, right] Float32Arrays.
// ---------------------------------------------------------------------------

function makeStereo(seconds, sampleRate, fillChannel) {
  const length = Math.floor(seconds * sampleRate);
  return [0, 1].map((channel) => {
    const data = new Float32Array(length);
    fillChannel(data, channel);
    return data;
  });
}

const generators = {
  white: (sr) =>
    makeStereo(6, sr, (d) => {
      for (let i = 0; i < d.length; i += 1) d[i] = white() * 0.35;
    }),

  brown: (sr) =>
    makeStereo(8, sr, (d) => {
      const brown = brownNoise();
      for (let i = 0; i < d.length; i += 1) d[i] = brown();
    }),

  rain: (sr) =>
    makeStereo(10, sr, (d) => {
      const pink = pinkNoise();
      const hp = highPass(sr, 450);
      const lp = lowPass(sr, 7000);
      for (let i = 0; i < d.length; i += 1) d[i] = lp(hp(pink())) * 0.9;
      // Individual drops: tiny bright taps, about 45 a second per ear.
      const dropHp = highPass(sr, 2000);
      for (let n = 0; n < 45 * 10; n += 1) {
        addBurst(d, Math.floor(Math.random() * d.length), {
          amp: rand(0.05, 0.35),
          decaySamples: rand(0.002, 0.008) * sr,
          length: Math.floor(0.03 * sr),
          filter: dropHp,
        });
      }
    }),

  wind: (sr) =>
    makeStereo(20, sr, (d, ch) => {
      const brown = brownNoise();
      const pink = pinkNoise();
      const lp = lowPass(sr, 400);
      const gust = slowWobble(ch + 1);
      for (let i = 0; i < d.length; i += 1) {
        const g = gust(i / sr);
        lp.setCutoff(180 + 900 * g * g); // gusts sound brighter
        d[i] = lp(brown() * 0.7 + pink() * 0.5) * (0.35 + 0.9 * g);
      }
    }),

  ocean: (sr) =>
    makeStereo(16, sr, (d, ch) => {
      const brown = brownNoise();
      const pink = pinkNoise();
      const lp = lowPass(sr, 1400);
      const hiss = highPass(sr, 3000);
      const period = 8; // seconds per wave
      for (let i = 0; i < d.length; i += 1) {
        const t = i / sr + ch * 0.35; // the right ear hears the wave a moment later
        const phase = (t % period) / period;
        // A wave builds slowly, crashes, then drains away.
        const wave = phase < 0.55 ? (phase / 0.55) ** 2 : Math.exp(-(phase - 0.55) * 7);
        d[i] = lp(brown() + pink() * 0.4) * (0.25 + 0.75 * wave) + hiss(white()) * 0.12 * wave * wave;
      }
    }),

  thunder: (sr) =>
    makeStereo(30, sr, (d) => {
      const bed = brownNoise();
      const bedLp = lowPass(sr, 160);
      for (let i = 0; i < d.length; i += 1) d[i] = bedLp(bed()) * 0.5;
      // Two rolls of thunder per loop: a crack, then a long rumble that swells and fades.
      for (const startSec of [rand(3, 8), rand(16, 22)]) {
        const start = Math.floor(startSec * sr);
        const rumble = brownNoise();
        const rumbleLp = lowPass(sr, 110);
        const crackLp = lowPass(sr, 1800);
        const length = Math.floor(rand(5, 7) * sr);
        const swells = [0, rand(0.6, 1.2), rand(1.8, 2.8)];
        for (let k = 0; k < length && start + k < d.length; k += 1) {
          const t = k / sr;
          const env = swells.reduce((sum, s) => sum + (t > s ? Math.exp(-(t - s) * 1.3) * (1 - Math.exp(-(t - s) * 12)) : 0), 0);
          const crack = t < 0.4 ? crackLp(white()) * Math.exp(-t * 14) * 1.2 : 0;
          d[start + k] += rumbleLp(rumble()) * env * 2.2 + crack;
        }
      }
    }),

  fireplace: (sr) =>
    makeStereo(20, sr, (d) => {
      const brown = brownNoise();
      const lp = lowPass(sr, 500);
      for (let i = 0; i < d.length; i += 1) d[i] = lp(brown()) * 0.55;
      // Crackles: clusters of tiny sharp pops, now and then a big one.
      const snap = highPass(sr, 1500);
      for (let n = 0; n < 9 * 20; n += 1) {
        const at = Math.floor(Math.random() * d.length);
        const big = Math.random() < 0.06;
        const pops = 1 + Math.floor(Math.random() * 3);
        for (let p = 0; p < pops; p += 1) {
          addBurst(d, at + Math.floor(rand(0, 0.02) * sr), {
            amp: big ? rand(0.7, 1) : rand(0.08, 0.4),
            decaySamples: rand(0.0004, 0.0018) * sr,
            length: Math.floor(0.01 * sr),
            filter: snap,
          });
        }
      }
    }),

  forest: (sr) => {
    const length = Math.floor(24 * sr);
    // Bird phrases are planned once so both ears hear the same bird,
    // just louder on the side it's sitting.
    const birds = Array.from({ length: 9 }, () => ({
      at: rand(0, 22),
      pan: Math.random(),
      notes: Array.from({ length: 2 + Math.floor(Math.random() * 5) }, () => ({
        freq: rand(2300, 4800),
        sweep: rand(-0.4, 0.5),
        dur: rand(0.05, 0.14),
        gap: rand(0.03, 0.12),
      })),
    }));
    return [0, 1].map((ch) => {
      const d = new Float32Array(length);
      const pink = pinkNoise();
      const lp = lowPass(sr, 2400);
      const rustle = slowWobble(ch + 4);
      for (let i = 0; i < length; i += 1) d[i] = lp(pink()) * (0.3 + 0.5 * rustle(i / sr));
      for (const bird of birds) {
        const gain = 0.22 * (ch === 0 ? 1 - bird.pan * 0.7 : 0.3 + bird.pan * 0.7);
        let start = Math.floor(bird.at * sr);
        for (const note of bird.notes) {
          const n = Math.floor(note.dur * sr);
          let phase = 0;
          for (let k = 0; k < n && start + k < length; k += 1) {
            const t = k / n;
            // The pitch glides during the note, with a quick flutter.
            const f = note.freq * (1 + note.sweep * t) * (1 + 0.03 * Math.sin(TAU * 45 * (k / sr)));
            phase += (TAU * f) / sr;
            d[start + k] += Math.sin(phase) * Math.sin(Math.PI * t) * gain;
          }
          start += n + Math.floor(note.gap * sr);
        }
      }
      return d;
    });
  },

  cafe: (sr) => {
    const length = Math.floor(20 * sr);
    const clinks = Array.from({ length: 4 }, () => ({ at: rand(0, 19), freq: rand(2600, 3600) }));
    const BLOCK = 64; // the talking rhythm only needs updating every 64 samples, which keeps this fast
    return [0, 1].map((ch) => {
      const d = new Float32Array(length);
      const bed = brownNoise();
      for (let i = 0; i < length; i += 1) d[i] = bed() * 0.12;
      // A few murmuring voices: band-limited noise that turns on and off in syllables.
      for (let v = 0; v < 4; v += 1) {
        const lp = lowPass(sr, rand(900, 1600));
        const hp = highPass(sr, rand(220, 380));
        const voiceGain = rand(0.3, 0.7) * (v % 2 === ch ? 1 : 0.6);
        const rate = 4.5 + v * 0.35; // syllables per second
        let talking = Math.random() < 0.5;
        let switchAt = 0;
        let level = 0;
        for (let i = 0; i < length; i += 1) {
          if (i % BLOCK === 0) {
            const t = i / sr;
            if (t >= switchAt) {
              talking = !talking;
              switchAt = t + (talking ? rand(1, 4) : rand(0.4, 2));
            }
            const syllable = Math.max(0, Math.sin(TAU * rate * t + v)) ** 2;
            level = voiceGain * (talking ? 0.4 + 0.6 * syllable : 0.05);
          }
          d[i] += hp(lp(white())) * level;
        }
      }
      for (const c of clinks) {
        const start = Math.floor(c.at * sr);
        for (const ratio of [1, 1.48, 2.21]) {
          addTone(d, start, sr, { freq: c.freq * ratio, amp: 0.06 / ratio, decay: 0.25, length: 0.8 });
        }
      }
      return d;
    });
  },

  keyboard: (sr) => {
    const length = Math.floor(20 * sr);
    // Plan the typing rhythm once: words of a few keys, spaces, and pauses to think.
    const keys = [];
    let t = 0.3;
    while (t < 19.5) {
      const words = 3 + Math.floor(Math.random() * 7);
      for (let w = 0; w < words && t < 19.5; w += 1) {
        const letters = 3 + Math.floor(Math.random() * 6);
        for (let l = 0; l < letters; l += 1) {
          keys.push({ at: t, amp: rand(0.55, 1), space: false });
          t += rand(0.08, 0.17);
        }
        keys.push({ at: t, amp: 1, space: true });
        t += rand(0.15, 0.3);
      }
      t += rand(0.8, 2.4);
    }
    return [0, 1].map((ch) => {
      const d = new Float32Array(length);
      const click = highPass(sr, 2500);
      for (const key of keys) {
        const start = Math.floor((key.at + ch * 0.0004) * sr);
        addBurst(d, start, {
          amp: 0.5 * key.amp,
          decaySamples: 0.0012 * sr,
          length: Math.floor(0.006 * sr),
          filter: click,
        });
        addTone(d, start, sr, { freq: key.space ? 150 : rand(190, 260), amp: (key.space ? 0.4 : 0.22) * key.amp, decay: 0.018, length: 0.06 });
      }
      return d;
    });
  },
};

/** Fade the loop's end into its start so it repeats without a click. */
function makeSeamless(data, fadeSamples) {
  const length = data.length - fadeSamples;
  const out = new Float32Array(length);
  out.set(data.subarray(0, length));
  for (let i = 0; i < fadeSamples; i += 1) {
    const x = i / fadeSamples;
    // Equal-power fade keeps the loudness steady through the join.
    out[i] = data[i] * Math.sin((x * Math.PI) / 2) + data[length + i] * Math.cos((x * Math.PI) / 2);
  }
  return out;
}

/** Make the loudest moment about the same for every sound. */
function normalize(channels, peak = 0.85) {
  let max = 0;
  for (const data of channels) for (let i = 0; i < data.length; i += 1) max = Math.max(max, Math.abs(data[i]));
  const scale = max > 0 ? peak / max : 1;
  for (const data of channels) for (let i = 0; i < data.length; i += 1) data[i] *= scale;
}

/** Build the AudioBuffer for one sound id. */
export function synthesize(audioContext, id) {
  const sr = audioContext.sampleRate;
  const channels = generators[id](sr).map((data) => makeSeamless(data, Math.floor(0.6 * sr)));
  normalize(channels);
  const buffer = audioContext.createBuffer(2, channels[0].length, sr);
  channels.forEach((data, i) => buffer.copyToChannel(data, i));
  return buffer;
}
