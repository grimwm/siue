// The lo-fi master's pieces that need no audio graph, the way the composing pipeline
// (music/compose/siue_compose/render.py) makes them: the hall's impulse response, the fold that makes the loop
// carry its own tail, the hiss, the BS.1770 loudness, the one leveling gain and the WAV file. Audio is a list of
// channels, each a Float32Array of samples at `rate`. The noise comes from a seeded PRNG, so a seed gives the same
// audio every time (not numpy's numbers). DOM-free.

/** mulberry32: a small seeded PRNG, uniform in [0, 1). */
function uniform(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Standard normal numbers by Box-Muller. */
function normal(seed: number): () => number {
  const u = uniform(seed);
  return () => Math.sqrt(-2 * Math.log(1 - u())) * Math.cos(2 * Math.PI * u());
}

const SMOOTH = 24; // taps of the moving average that takes the fizz off the hall's noise

/**
 * A long, dark hall, as render.py's reverb_ir: decaying stereo noise smoothed by a 24-tap moving average (centred
 * as numpy's convolve mode="same"), an exponential decay with time constant seconds / 6.9, a 20 ms fade-in, then
 * scaled so the peak of both channels is 0.5.
 */
export function reverbIR(seconds: number, rate: number, seed: number): Float32Array[] {
  const n = Math.floor(seconds * rate);
  const next = normal(seed);
  const tau = seconds / 6.9;
  const fade = Math.floor(0.02 * rate);
  const ir = [0, 1].map(() => {
    const noise = Float64Array.from({ length: n }, next);
    const out = new Float64Array(n);
    let sum = 0;
    // out[i] is the mean of noise[i - 12 .. i + 11], the samples outside the IR counting as 0.
    for (let j = 0; j < Math.min(n, SMOOTH / 2); j++) sum += noise[j]!;
    for (let i = 0; i < n; i++) {
      out[i] = (sum / SMOOTH) * Math.exp(-i / rate / tau) * (i < fade ? i / (fade - 1) : 1);
      const enter = i + SMOOTH / 2;
      const leave = i - SMOOTH / 2;
      if (enter < n) sum += noise[enter]!;
      if (leave >= 0) sum -= noise[leave]!;
    }
    return out;
  });
  const peak = Math.max(...ir.map(c => c.reduce((m, v) => Math.max(m, Math.abs(v)), 0)));
  return ir.map(c => Float32Array.from(c, v => (v / peak) * 0.5));
}

/**
 * The audio cut to `length` with everything after it added onto the start, as often as it wraps, so the loop carries
 * its own tail. Done in place: each channel comes back as the first `length` samples of its own memory (a channel
 * shorter than `length` comes back as a padded copy).
 */
export function fold(ch: readonly Float32Array[], length: number): Float32Array[] {
  return ch.map(c => {
    if (c.length < length) {
      const out = new Float32Array(length);
      out.set(c);
      return out;
    }
    // Only samples at `length` and past are read, and only samples before it are written.
    for (let i = length; i < c.length; i++) c[i % length]! += c[i]!;
    return c.subarray(0, length);
  });
}

const HISS_AMPLITUDE = 0.0015;
const HISS_LOWPASS_HZ = 5000;

/**
 * The tape hiss, as render.py's ffmpeg anoisesrc color=pink amplitude=0.0015, lowpass=f=5000, upmixed to stereo:
 * uniform white noise of that amplitude through Paul Kellet's pink filter (scaled by 0.11 as anoisesrc does), then a
 * two-pole Butterworth low-pass at 5 kHz, at 1/√2 as ffmpeg's -ac 2 puts mono into each channel. One sample per call,
 * each a float32 value, so the engine adds the same noise to both channels without holding the hiss whole.
 */
export function hissSource(rate: number, seed: number): () => number {
  const u = uniform(seed);
  const b = [0, 0, 0, 0, 0, 0, 0];
  const lp = biquad(lowpass(HISS_LOWPASS_HZ, rate));
  return () => {
    const white = HISS_AMPLITUDE * (2 * u() - 1);
    b[0] = 0.99886 * b[0]! + white * 0.0555179;
    b[1] = 0.99332 * b[1]! + white * 0.0750759;
    b[2] = 0.969 * b[2]! + white * 0.153852;
    b[3] = 0.8665 * b[3]! + white * 0.3104856;
    b[4] = 0.55 * b[4]! + white * 0.5329522;
    b[5] = -0.7616 * b[5]! - white * 0.016898;
    const pink = b[0]! + b[1]! + b[2]! + b[3]! + b[4]! + b[5]! + b[6]! + white * 0.5362;
    b[6] = white * 0.115926;
    return Math.fround(lp(pink * 0.11) * Math.SQRT1_2);
  };
}

/** `length` samples of the hiss: what hissSource gives, as one channel, the level of each stereo channel. */
export function pinkHiss(length: number, rate: number, seed: number): Float32Array {
  return Float32Array.from({ length }, hissSource(rate, seed));
}

/** Biquad coefficients, normalised so a0 is 1. */
interface Coeffs { b0: number; b1: number; b2: number; a1: number; a2: number }

/** A direct-form-I biquad with its own state, one sample at a time. */
function biquad({ b0, b1, b2, a1, a2 }: Coeffs): (x: number) => number {
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  return x => {
    const y = b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
    x2 = x1; x1 = x; y2 = y1; y1 = y;
    return y;
  };
}

/** The RBJ cookbook low-pass at Q 0.7071 (ffmpeg lowpass's default two poles). */
function lowpass(hz: number, rate: number): Coeffs {
  const w = (2 * Math.PI * hz) / rate;
  const alpha = Math.sin(w) / (2 * Math.SQRT1_2);
  const a0 = 1 + alpha;
  const c = Math.cos(w);
  return { b0: (1 - c) / 2 / a0, b1: (1 - c) / a0, b2: (1 - c) / 2 / a0, a1: (-2 * c) / a0, a2: (1 - alpha) / a0 };
}

/**
 * BS.1770's K-weighting at any rate: the high shelf (stage 1) and the high-pass (stage 2) designed from their
 * analogue parameters, as libebur128 does, which gives the standard's 48 kHz coefficients at 48 kHz.
 */
function kWeighting(rate: number): [Coeffs, Coeffs] {
  let f0 = 1681.974450955533;
  const gainDb = 3.999843853973347;
  let q = 0.7071752369554196;
  let k = Math.tan((Math.PI * f0) / rate);
  const vh = 10 ** (gainDb / 20);
  const vb = vh ** 0.4996667741545416;
  let a0 = 1 + k / q + k * k;
  const shelf = { b0: (vh + (vb * k) / q + k * k) / a0, b1: (2 * (k * k - vh)) / a0, b2: (vh - (vb * k) / q + k * k) / a0, a1: (2 * (k * k - 1)) / a0, a2: (1 - k / q + k * k) / a0 };
  f0 = 38.13547087602444;
  q = 0.5003270373238773;
  k = Math.tan((Math.PI * f0) / rate);
  a0 = 1 + k / q + k * k;
  const highpass = { b0: 1, b1: -2, b2: 1, a1: (2 * (k * k - 1)) / a0, a2: (1 - k / q + k * k) / a0 };
  return [shelf, highpass];
}

const ABSOLUTE_GATE = -70; // LUFS
const RELATIVE_GATE = -10; // LU under the loudness of the blocks that pass the absolute gate

/**
 * Integrated loudness in LUFS (ITU-R BS.1770-4, EBU R128): K-weighting, 400 ms blocks every 100 ms (75% overlap),
 * every channel weighted 1.0 (the weights of left, right and a mono channel), the absolute gate at -70 LUFS and
 * the relative gate 10 LU under. -Infinity for audio shorter than one block or wholly under the absolute gate.
 */
export function loudnessLufs(ch: readonly Float32Array[], rate: number): number {
  const step = Math.round(0.1 * rate);
  const n = ch.reduce((m, c) => Math.max(m, c.length), 0);
  const hops = Math.floor(n / step);
  if (hops < 4) return -Infinity;
  // The K-weighted energy of each 100 ms hop, summed over the channels; a block is four hops.
  const energy = new Float64Array(hops);
  const [shelf, highpass] = kWeighting(rate);
  for (const c of ch) {
    const s1 = biquad(shelf);
    const s2 = biquad(highpass);
    for (let i = 0; i < hops * step; i++) {
      const y = s2(s1(c[i] ?? 0));
      energy[Math.floor(i / step)]! += y * y;
    }
  }
  const blocks: number[] = [];
  for (let j = 0; j + 4 <= hops; j++) blocks.push((energy[j]! + energy[j + 1]! + energy[j + 2]! + energy[j + 3]!) / (4 * step));
  const lufs = (z: number): number => -0.691 + 10 * Math.log10(z);
  const mean = (zs: number[]): number => zs.reduce((a, b) => a + b, 0) / zs.length;
  const loud = blocks.filter(z => lufs(z) > ABSOLUTE_GATE);
  if (loud.length === 0) return -Infinity;
  const threshold = lufs(mean(loud)) + RELATIVE_GATE;
  return lufs(mean(loud.filter(z => lufs(z) > threshold)));
}

/**
 * One gain for the whole piece (a changing gain would break the loop point), as render.py's level(): the gain that
 * brings the loudness to `target` LUFS, or less if a peak would pass `peakDb` dBFS. Silence keeps gain 1.
 */
export function levelGain(ch: readonly Float32Array[], rate: number, target: number, peakDb: number): number {
  const loudness = loudnessLufs(ch, rate);
  if (!Number.isFinite(loudness)) return 1;
  const gain = 10 ** ((target - loudness) / 20);
  const peak = ch.reduce((m, c) => c.reduce((p, v) => Math.max(p, Math.abs(v)), m), 0);
  return peak > 0 ? Math.min(gain, 10 ** (peakDb / 20) / peak) : gain;
}

/** A 16-bit PCM WAV file of the channels, interleaved; samples past full scale are clipped. */
export function wav(ch: readonly Float32Array[], rate: number): Uint8Array {
  const frames = ch.reduce((m, c) => Math.max(m, c.length), 0);
  const block = ch.length * 2;
  const bytes = new Uint8Array(44 + frames * block);
  const v = new DataView(bytes.buffer);
  const tag = (at: number, s: string): void => { for (let i = 0; i < 4; i++) bytes[at + i] = s.charCodeAt(i); };
  tag(0, 'RIFF');
  v.setUint32(4, bytes.length - 8, true);
  tag(8, 'WAVE');
  tag(12, 'fmt ');
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true); // PCM
  v.setUint16(22, ch.length, true);
  v.setUint32(24, rate, true);
  v.setUint32(28, rate * block, true);
  v.setUint16(32, block, true);
  v.setUint16(34, 16, true);
  tag(36, 'data');
  v.setUint32(40, frames * block, true);
  for (let i = 0; i < frames; i++) {
    ch.forEach((c, k) => {
      const x = Math.max(-1, Math.min(1, c[i] ?? 0));
      v.setInt16(44 + i * block + k * 2, Math.sign(x) * Math.round(Math.abs(x) * 32767), true);
    });
  }
  return bytes;
}
