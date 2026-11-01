// The signal kit the Sound panel and Voice Effects are built from, in plain JS so the same code runs in the renderer,
// on a live microphone and under node:test: an in-place FFT, RBJ biquads, a one-shot FFT convolution, and a streaming
// short-time Fourier transform (Hann frames, overlap-add) that hands each frame's spectrum to an effect. DOM-free.

/** In-place radix-2 FFT of (re, im), whose length is a power of two; `inverse` also divides by the length. */
export function fft(re: Float64Array, im: Float64Array, inverse = false): void {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      [re[i], re[j]] = [re[j]!, re[i]!];
      [im[i], im[j]] = [im[j]!, im[i]!];
    }
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
        re[b] = re[a]! - tr;
        im[b] = im[a]! - ti;
        re[a] = re[a]! + tr;
        im[a] = im[a]! + ti;
        const nr = cr * wr - ci * wi;
        ci = cr * wi + ci * wr;
        cr = nr;
      }
    }
  }
  if (inverse) for (let i = 0; i < n; i++) { re[i] = re[i]! / n; im[i] = im[i]! / n; }
}

export const nextPow2 = (n: number): number => 2 ** Math.ceil(Math.log2(Math.max(1, n)));

/** `x` convolved with `ir`, cut to x's length plus the IR's (one FFT of the whole length). */
export function convolve(x: Float32Array, ir: Float32Array): Float32Array {
  const n = nextPow2(x.length + ir.length);
  const ar = new Float64Array(n);
  const ai = new Float64Array(n);
  const br = new Float64Array(n);
  const bi = new Float64Array(n);
  ar.set(x);
  br.set(ir);
  fft(ar, ai);
  fft(br, bi);
  for (let i = 0; i < n; i++) {
    const r = ar[i]! * br[i]! - ai[i]! * bi[i]!;
    ai[i] = ar[i]! * bi[i]! + ai[i]! * br[i]!;
    ar[i] = r;
  }
  fft(ar, ai, true);
  return Float32Array.from(ar.subarray(0, x.length + ir.length));
}

export type BiquadType = 'lowpass' | 'bandpass' | 'lowshelf' | 'highshelf' | 'peaking';

/** An RBJ cookbook biquad, its state kept between calls so it can run block by block. */
export class Biquad {
  private b0 = 1; private b1 = 0; private b2 = 0; private a1 = 0; private a2 = 0;
  private x1 = 0; private x2 = 0; private y1 = 0; private y2 = 0;
  private rate: number;
  constructor(rate: number, type: BiquadType, hz: number, q = Math.SQRT1_2, gainDb = 0) { this.rate = rate; this.set(type, hz, q, gainDb); }

  set(type: BiquadType, hz: number, q = Math.SQRT1_2, gainDb = 0): void {
    const w = (2 * Math.PI * Math.min(hz, this.rate * 0.49)) / this.rate;
    const cos = Math.cos(w);
    const alpha = Math.sin(w) / (2 * q);
    const A = 10 ** (gainDb / 40);
    let b0: number, b1: number, b2: number, a0: number, a1: number, a2: number;
    if (type === 'lowpass') { b0 = (1 - cos) / 2; b1 = 1 - cos; b2 = b0; a0 = 1 + alpha; a1 = -2 * cos; a2 = 1 - alpha; }
    else if (type === 'bandpass') { b0 = alpha; b1 = 0; b2 = -alpha; a0 = 1 + alpha; a1 = -2 * cos; a2 = 1 - alpha; }
    else if (type === 'peaking') { b0 = 1 + alpha * A; b1 = -2 * cos; b2 = 1 - alpha * A; a0 = 1 + alpha / A; a1 = -2 * cos; a2 = 1 - alpha / A; }
    else {
      const s = 2 * Math.sqrt(A) * alpha;
      const sign = type === 'lowshelf' ? 1 : -1;
      b0 = A * (A + 1 - sign * (A - 1) * cos + s);
      b1 = 2 * sign * A * (A - 1 - sign * (A + 1) * cos);
      b2 = A * (A + 1 - sign * (A - 1) * cos - s);
      a0 = A + 1 + sign * (A - 1) * cos + s;
      a1 = -2 * sign * (A - 1 + sign * (A + 1) * cos);
      a2 = A + 1 + sign * (A - 1) * cos - s;
    }
    this.b0 = b0 / a0; this.b1 = b1 / a0; this.b2 = b2 / a0; this.a1 = a1 / a0; this.a2 = a2 / a0;
  }

  step(x: number): number {
    const y = this.b0 * x + this.b1 * this.x1 + this.b2 * this.x2 - this.a1 * this.y1 - this.a2 * this.y2;
    this.x2 = this.x1; this.x1 = x; this.y2 = this.y1; this.y1 = y;
    return y;
  }

  run(x: Float32Array): void { for (let i = 0; i < x.length; i++) x[i] = this.step(x[i]!); }
}

/** A seeded uniform random source in [0, 1) (mulberry32), so a render is the same every time. */
export function seeded(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** One frame's spectrum, bins 0 to n/2 used (the rest mirrored on the way back), and the frame's windowed samples. */
export interface Frame { re: Float64Array; im: Float64Array; samples: Float64Array }
/** What an STFT effect does to each frame, in place. */
export type FrameEffect = (f: Frame) => void;

export const STFT_SIZE = 2048;
export const STFT_HOP = 512;

/**
 * A streaming short-time Fourier transform: samples go in, each STFT_HOP of them a Hann frame of the last STFT_SIZE is
 * transformed, handed to `effect`, transformed back and overlap-added; samples come out STFT_SIZE later. `dry` keeps
 * the input delayed by as much, for a wet/dry mix that lines up.
 */
export class Stft {
  readonly latency = STFT_SIZE;
  // Rings: the last STFT_SIZE inputs (oldest at `at`), the overlap-add still to come out (next at `at`), the dry input.
  private input = new Float64Array(STFT_SIZE);
  private acc = new Float64Array(STFT_SIZE);
  private dryRing = new Float64Array(STFT_SIZE);
  private at = 0;
  private fill = 0;
  private readonly win = Float64Array.from({ length: STFT_SIZE }, (_, i) => 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / STFT_SIZE));
  // Hann² at 75% overlap sums to 1.5, so each frame comes back at 1 / 1.5.
  private readonly norm = 1 / 1.5;
  private readonly frame: Frame = { re: new Float64Array(STFT_SIZE), im: new Float64Array(STFT_SIZE), samples: new Float64Array(STFT_SIZE) };
  private effect: FrameEffect;
  constructor(effect: FrameEffect) { this.effect = effect; }

  /** Runs `input` through, writing the processed samples to `out` and the delayed input to `dry` when given. */
  process(input: Float32Array, out: Float32Array, dry?: Float32Array): void {
    for (let i = 0; i < input.length; i++) {
      const at = this.at;
      out[i] = this.acc[at]!;
      this.acc[at] = 0;
      if (dry) dry[i] = this.dryRing[at]!;
      this.dryRing[at] = input[i]!;
      this.input[at] = input[i]!;
      this.at = (at + 1) % STFT_SIZE;
      if (++this.fill === STFT_HOP) {
        this.fill = 0;
        this.runFrame();
      }
    }
  }

  private runFrame(): void {
    const { re, im, samples } = this.frame;
    const at = this.at;
    for (let k = 0; k < STFT_SIZE; k++) { samples[k] = this.input[(at + k) % STFT_SIZE]! * this.win[k]!; re[k] = samples[k]!; im[k] = 0; }
    fft(re, im);
    this.effect(this.frame);
    // Keep the spectrum Hermitian so the frame comes back real.
    for (let k = 1; k < STFT_SIZE / 2; k++) { re[STFT_SIZE - k] = re[k]!; im[STFT_SIZE - k] = -im[k]!; }
    im[0] = 0;
    im[STFT_SIZE / 2] = 0;
    fft(re, im, true);
    for (let k = 0; k < STFT_SIZE; k++) {
      const j = (at + k) % STFT_SIZE;
      this.acc[j] = this.acc[j]! + re[k]! * this.win[k]! * this.norm;
    }
  }
}

/** Runs a streaming effect over a whole buffer and returns its output lined up with the input (latency trimmed). */
export function runAligned(x: Float32Array, latency: number, process: (input: Float32Array, out: Float32Array) => void): Float32Array {
  const padded = new Float32Array(x.length + latency);
  padded.set(x);
  const out = new Float32Array(padded.length);
  const BLOCK = 4096;
  for (let i = 0; i < padded.length; i += BLOCK) process(padded.subarray(i, i + BLOCK), out.subarray(i, i + BLOCK));
  return out.slice(latency);
}

export const rms = (x: ArrayLike<number>): number => {
  let s = 0;
  for (let i = 0; i < x.length; i++) s += x[i]! * x[i]!;
  return Math.sqrt(s / Math.max(1, x.length));
};
