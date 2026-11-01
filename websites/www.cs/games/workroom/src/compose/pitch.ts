// The pitch tracker: what note a voice is singing, frame by frame, from its samples. It is YIN (de Cheveigné and
// Kawahara, 2002): the cumulative-mean-normalised difference of a window with itself shifted, its first dip below the
// threshold refined between samples. The difference is worked out with an FFT, so a minute of voice takes well under a
// second. Hum turns its frames into notes (hum.ts); Auto-Tune follows the same frames live, through the streaming
// tracker. DOM-free.

export interface PitchFrame {
  /** Seconds from the start of the samples: the middle of the frame's window. */
  t: number;
  /** The pitch sung, or null for silence, breath or noise. */
  hz: number | null;
  /** How sure the tracker is, 0 to 1 (1 − the dip's depth). */
  clarity: number;
  /** The frame's loudness (root mean square). */
  rms: number;
}

export interface PitchOptions { minHz?: number; maxHz?: number; threshold?: number }

export const FRAME = 2048;
export const HOP = 256;
/** A frame quieter than this (rms) is silence, whatever pitch it holds. */
export const QUIET = 0.005;
const MIN_HZ = 65;
const MAX_HZ = 1100;
const THRESHOLD = 0.15;

/** The fractional MIDI note of a frequency: 440 Hz is 69, each semitone 1. */
export const midiOf = (hz: number): number => 69 + 12 * Math.log2(hz / 440);

/** An in-place radix-2 FFT of `re` and `im` (their length a power of two); `inverse` without the 1/n. */
function fft(re: Float64Array, im: Float64Array, inverse: boolean): void {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) { [re[i], re[j]] = [re[j]!, re[i]!]; [im[i], im[j]] = [im[j]!, im[i]!]; }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = ((inverse ? 2 : -2) * Math.PI) / len;
    const wr = Math.cos(ang);
    const wi = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let cr = 1;
      let ci = 0;
      for (let k = 0; k < len / 2; k++) {
        const a = i + k;
        const b = a + len / 2;
        const tr = re[b]! * cr - im[b]! * ci;
        const ti = re[b]! * ci + im[b]! * cr;
        re[b] = re[a]! - tr; im[b] = im[a]! - ti;
        re[a] = re[a]! + tr; im[a] = im[a]! + ti;
        const nr = cr * wr - ci * wi;
        ci = cr * wi + ci * wr;
        cr = nr;
      }
    }
  }
}

/**
 * The pitch of one frame: the window is its first half, compared with itself shifted by up to half the frame. Null when
 * no shift matches well enough (noise, breath) or the frame is silent.
 */
export function detectPitch(frame: Float32Array, rate: number, o: PitchOptions = {}): { hz: number; clarity: number } | null {
  const w = frame.length >> 1;
  const tauMin = Math.max(2, Math.floor(rate / (o.maxHz ?? MAX_HZ)));
  const tauMax = Math.min(w - 1, Math.ceil(rate / (o.minHz ?? MIN_HZ)));
  const threshold = o.threshold ?? THRESHOLD;
  let size = 1;
  while (size < frame.length + w) size <<= 1;
  // The cross term Σ x[j]·x[j+τ] for j < w, by FFT: the window against the whole frame.
  const ar = new Float64Array(size); const ai = new Float64Array(size);
  const br = new Float64Array(size); const bi = new Float64Array(size);
  for (let i = 0; i < w; i++) ar[i] = frame[i]!;
  for (let i = 0; i < frame.length; i++) br[i] = frame[i]!;
  fft(ar, ai, false);
  fft(br, bi, false);
  for (let k = 0; k < size; k++) {
    const r = ar[k]! * br[k]! + ai[k]! * bi[k]!;
    const i = ar[k]! * bi[k]! - ai[k]! * br[k]!;
    ar[k] = r; ai[k] = i;
  }
  fft(ar, ai, true);
  // The energies Σ x[j]² of the window and of the window shifted by τ, from running sums.
  const sq = new Float64Array(frame.length + 1);
  for (let i = 0; i < frame.length; i++) sq[i + 1] = sq[i]! + frame[i]! * frame[i]!;
  const e0 = sq[w]!;
  if (e0 < 1e-10) return null;
  const d = new Float64Array(tauMax + 1);
  for (let tau = 1; tau <= tauMax; tau++) d[tau] = Math.max(0, e0 + (sq[tau + w]! - sq[tau]!) - (2 * ar[tau]!) / size);
  // Cumulative mean normalised difference.
  const dn = new Float64Array(tauMax + 1);
  dn[0] = 1;
  let sum = 0;
  for (let tau = 1; tau <= tauMax; tau++) { sum += d[tau]!; dn[tau] = sum > 0 ? (d[tau]! * tau) / sum : 1; }
  let tau = -1;
  for (let t = tauMin; t <= tauMax; t++) {
    if (dn[t]! < threshold) {
      while (t + 1 <= tauMax && dn[t + 1]! < dn[t]!) t++;
      tau = t;
      break;
    }
  }
  if (tau < 0) return null;
  // Between samples: the parabola through the dip and its neighbours.
  let better = tau;
  if (tau > 1 && tau < tauMax) {
    const a = dn[tau - 1]!; const b = dn[tau]!; const c = dn[tau + 1]!;
    const den = a - 2 * b + c;
    if (den > 0) better = tau + (a - c) / (2 * den);
  }
  return { hz: rate / better, clarity: Math.max(0, Math.min(1, 1 - dn[tau]!)) };
}

const rmsOf = (x: Float32Array): number => {
  let s = 0;
  for (let i = 0; i < x.length; i++) s += x[i]! * x[i]!;
  return Math.sqrt(s / x.length);
};

export interface PitchTracker {
  /** More samples; answers every frame they complete, in order. */
  push(samples: Float32Array): PitchFrame[];
}

/** A tracker fed samples as they come (a microphone, a decoded file), a frame every `hop` samples. */
export function createPitchTracker(rate: number, o: PitchOptions & { frame?: number; hop?: number; quiet?: number } = {}): PitchTracker {
  const size = o.frame ?? FRAME;
  const hop = o.hop ?? HOP;
  const quiet = o.quiet ?? QUIET;
  let buf = new Float32Array(size * 2);
  let filled = 0;
  /** The sample index of buf[0]. */
  let base = 0;
  return {
    push(samples) {
      if (filled + samples.length > buf.length) {
        const grown = new Float32Array(Math.max(buf.length * 2, filled + samples.length));
        grown.set(buf.subarray(0, filled));
        buf = grown;
      }
      buf.set(samples, filled);
      filled += samples.length;
      const out: PitchFrame[] = [];
      let at = 0;
      while (at + size <= filled) {
        const frame = buf.subarray(at, at + size);
        const rms = rmsOf(frame);
        const got = rms < quiet ? null : detectPitch(frame, rate, o);
        out.push({ t: (base + at + size / 4) / rate, hz: got?.hz ?? null, clarity: got?.clarity ?? 0, rms });
        at += hop;
      }
      if (at > 0) {
        buf.copyWithin(0, at, filled);
        filled -= at;
        base += at;
      }
      return out;
    },
  };
}

/** Every frame of a whole recording. */
export function trackPitch(samples: Float32Array, rate: number, o: PitchOptions & { frame?: number; hop?: number; quiet?: number } = {}): PitchFrame[] {
  return createPitchTracker(rate, o).push(samples);
}
