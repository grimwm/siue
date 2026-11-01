// Voice Effects: Vocoder, Auto-Tune, Harmonizer, Pitch Shift with Formant, Talk Box, Robot and Whisper. Each is a
// streaming processor (block in, block out) so the same code shapes a part in the renderer and a live microphone in the
// page. The pitch effects are a phase vocoder that moves the voice's harmonics but keeps its spectral envelope (so a
// voice moved up does not sound sped up), with Formant moving the envelope on its own; Auto-Tune and the Harmonizer find
// the sung pitch in each frame with Hum's tracker. Vocoder and Talk Box are filter banks: the voice's band loudness
// shapes another part (the carrier). DOM-free.
import { detectPitch, midiOf } from '../compose/pitch.ts';
import type { VoiceFx } from '../score.ts';
import { Biquad, fft, runAligned, seeded, Stft, STFT_HOP, STFT_SIZE } from './dsp.ts';
import type { Frame } from './dsp.ts';

const BINS = STFT_SIZE / 2 + 1;
const LIFTER = 40; // cepstral coefficients kept for the spectral envelope

/** A streaming voice processor; `carrier` is the carrier's block for Vocoder and Talk Box. */
export interface VoiceProcessor { readonly latency: number; process(input: Float32Array, out: Float32Array, carrier?: Float32Array): void }

/** The smooth spectral envelope of magnitudes `mag` (cepstral smoothing). */
function envelope(mag: Float64Array): Float64Array {
  const re = new Float64Array(STFT_SIZE);
  const im = new Float64Array(STFT_SIZE);
  for (let k = 0; k < BINS; k++) re[k] = Math.log(mag[k]! + 1e-9);
  for (let k = 1; k < STFT_SIZE / 2; k++) re[STFT_SIZE - k] = re[k]!;
  fft(re, im, true);
  for (let k = LIFTER; k <= STFT_SIZE - LIFTER; k++) { re[k] = 0; im[k] = 0; }
  fft(re, im);
  const env = new Float64Array(BINS);
  for (let k = 0; k < BINS; k++) env[k] = Math.exp(re[k]!);
  return env;
}

/**
 * Moves a frame's harmonics by `ratio` (phase vocoder, bin by bin), keeping its spectral envelope, moved by `formant`
 * (1 keeps it). State is kept per shifter so consecutive frames join up.
 */
class Shifter {
  private lastPhase = new Float64Array(BINS);
  private sumPhase = new Float64Array(BINS);
  private readonly expect = (2 * Math.PI * STFT_HOP) / STFT_SIZE;

  /** The shifted frame's spectrum, written to (re, im), from the analysis magnitudes, phases and envelope. */
  shift(mag: Float64Array, phase: Float64Array, env: Float64Array, ratio: number, formant: number, re: Float64Array, im: Float64Array, gain = 1): void {
    const outMag = new Float64Array(BINS);
    const outFreq = new Float64Array(BINS);
    for (let k = 0; k < BINS; k++) {
      let d = phase[k]! - this.lastPhase[k]! - k * this.expect;
      this.lastPhase[k] = phase[k]!;
      d -= 2 * Math.PI * Math.round(d / (2 * Math.PI));
      const trueBin = k + d / this.expect;
      const j = Math.round(k * ratio);
      if (j < 0 || j >= BINS) continue;
      outMag[j] = outMag[j]! + mag[k]! / env[k]!;
      outFreq[j] = trueBin * ratio;
    }
    for (let j = 0; j < BINS; j++) {
      this.sumPhase[j] = this.sumPhase[j]! + outFreq[j]! * this.expect;
      const e = env[Math.min(BINS - 1, Math.round(j / formant))]!;
      const m = outMag[j]! * e * gain;
      re[j] = re[j]! + m * Math.cos(this.sumPhase[j]!);
      im[j] = im[j]! + m * Math.sin(this.sumPhase[j]!);
    }
  }
}

/** Magnitudes and phases of a frame's bins 0 to n/2. */
function polar(f: Frame): { mag: Float64Array; phase: Float64Array } {
  const mag = new Float64Array(BINS);
  const phase = new Float64Array(BINS);
  for (let k = 0; k < BINS; k++) { mag[k] = Math.hypot(f.re[k]!, f.im[k]!); phase[k] = Math.atan2(f.im[k]!, f.re[k]!); }
  return { mag, phase };
}

/** The pitch-class set of the piece's key (C major's when none is known). */
export type KeyClasses = readonly number[];
const C_MAJOR: KeyClasses = [0, 2, 4, 5, 7, 9, 11];
const nearestInKey = (midi: number, key: KeyClasses): number => {
  let best = Math.round(midi);
  let dist = Infinity;
  for (let p = Math.floor(midi) - 2; p <= Math.ceil(midi) + 2; p++) {
    if (!key.includes(((p % 12) + 12) % 12)) continue;
    if (Math.abs(p - midi) < dist) { dist = Math.abs(p - midi); best = p; }
  }
  return best;
};
/** Semitones from `note` (in the key) to the key's note `steps` scale steps above it. */
const scaleStep = (note: number, steps: number, key: KeyClasses): number => {
  let p = note;
  for (let s = 0; s < steps; s++) do p++; while (!key.includes(((p % 12) + 12) % 12));
  return p - note;
};

/** The sung pitch of a frame (MIDI, fractional), or null. */
function framePitch(f: Frame, rate: number): number | null {
  const got = detectPitch(Float32Array.from(f.samples), rate, { minHz: 70, maxHz: 1000 });
  return got && got.clarity > 0.5 ? midiOf(got.hz) : null;
}

class StftVoice implements VoiceProcessor {
  readonly latency = STFT_SIZE;
  private stft: Stft;
  private dry = new Float32Array(0);
  private wet: number;
  constructor(effect: (f: Frame) => void, wet: number) { this.stft = new Stft(effect); this.wet = wet; }
  process(input: Float32Array, out: Float32Array): void {
    if (this.dry.length < input.length) this.dry = new Float32Array(input.length);
    const dry = this.dry.subarray(0, input.length);
    this.stft.process(input, out, dry);
    for (let i = 0; i < out.length; i++) out[i] = this.wet * out[i]! + (1 - this.wet) * dry[i]!;
  }
}

/** Pitch Shift: `semitones` up or down, the voice's envelope moved by `formant` semitones (0 keeps it). */
export function pitchShift(semitones: number, formant: number): VoiceProcessor {
  const s = new Shifter();
  return new StftVoice(f => {
    const { mag, phase } = polar(f);
    const env = envelope(mag);
    f.re.fill(0); f.im.fill(0);
    s.shift(mag, phase, env, 2 ** (semitones / 12), 2 ** (formant / 12), f.re, f.im);
  }, 1);
}

/**
 * Auto-Tune: each frame's sung pitch is pulled toward the nearest note of the key by `strength` (1: all the way), the
 * correction reaching its target over `retuneMs` (0: at once, the robotic jump).
 */
export function autotune(strength: number, retuneMs: number, rate: number, key: KeyClasses = C_MAJOR): VoiceProcessor {
  const s = new Shifter();
  let current = 0;
  const step = retuneMs <= 0 ? 1 : 1 - Math.exp(-STFT_HOP / ((rate * retuneMs) / 1000));
  return new StftVoice(f => {
    const midi = framePitch(f, rate);
    const want = midi === null ? 0 : (nearestInKey(midi, key) - midi) * strength;
    current += (want - current) * step;
    const { mag, phase } = polar(f);
    const env = envelope(mag);
    f.re.fill(0); f.im.fill(0);
    s.shift(mag, phase, env, 2 ** (current / 12), 1, f.re, f.im);
  }, 1);
}

const HARMONY: Record<string, (note: number, key: KeyClasses) => number> = {
  third: (n, k) => scaleStep(n, 2, k), fifth: (n, k) => scaleStep(n, 4, k), octave_up: () => 12, octave_down: () => -12,
};

/** Harmonizer: up to three voices a 3rd, a 5th or an octave from the sung note, in the key, mixed in at `mix`. */
export function harmonizer(voices: readonly string[], mix: number, rate: number, key: KeyClasses = C_MAJOR): VoiceProcessor {
  const shifters = voices.map(() => new Shifter());
  let last: number | null = null;
  return new StftVoice(f => {
    const midi = framePitch(f, rate) ?? last;
    last = midi;
    const { mag, phase } = polar(f);
    const env = envelope(mag);
    if (midi === null) return;
    const note = nearestInKey(midi, key);
    // The dry voice stays as it is; each harmony voice is added at mix / voices.
    voices.forEach((v, i) => shifters[i]!.shift(mag, phase, env, 2 ** (HARMONY[v]!(note, key) / 12), 1, f.re, f.im, mix / voices.length));
  }, 1);
}

/** Robot: every frame's phases set to zero, so the voice buzzes on one pitch (the frame rate) with its words kept. */
export function robot(mix: number): VoiceProcessor {
  return new StftVoice(f => {
    for (let k = 0; k < BINS; k++) { f.re[k] = Math.hypot(f.re[k]!, f.im[k]!); f.im[k] = 0; }
  }, mix);
}

/**
 * Whisper / Breathy: each frame becomes noise in the voice's spectral envelope (its harmonics smoothed away, its phases
 * scattered at random), so the voice loses its pitch and keeps its vowels.
 */
export function whisper(mix: number, seed = 7): VoiceProcessor {
  const rnd = seeded(seed);
  return new StftVoice(f => {
    const env = envelope(polar(f).mag);
    for (let k = 0; k < BINS; k++) {
      const m = env[k]!;
      const a = 2 * Math.PI * rnd();
      f.re[k] = m * Math.cos(a);
      f.im[k] = m * Math.sin(a);
    }
  }, mix);
}

/**
 * Vocoder: `bands` bandpass filters from 120 Hz to 7 kHz; each band of the carrier is made as loud as the voice's
 * band. The output follows the voice's loudness. Talk Box is a 24-band vocoder mixed with the voice at `mix`.
 */
export function vocoder(bands: number, rate: number, mix = 1): VoiceProcessor {
  const lo = 120;
  const hi = 7000;
  const ratio = (hi / lo) ** (1 / Math.max(1, bands - 1));
  const q = 1 / (Math.sqrt(ratio) - 1 / Math.sqrt(ratio));
  const centres = Array.from({ length: bands }, (_, i) => lo * ratio ** i);
  const mod = centres.map(c => new Biquad(rate, 'bandpass', c, q));
  const car = centres.map(c => new Biquad(rate, 'bandpass', c, q));
  const env = new Float64Array(bands);
  const att = 1 - Math.exp(-1 / (0.005 * rate));
  const rel = 1 - Math.exp(-1 / (0.03 * rate));
  const slow = 1 - Math.exp(-1 / (0.2 * rate));
  let inLevel = 0;
  let outLevel = 0;
  return {
    latency: 0,
    process(input, out, carrier) {
      for (let i = 0; i < input.length; i++) {
        const x = input[i]!;
        const c = carrier ? carrier[i]! : 0;
        let y = 0;
        for (let b = 0; b < bands; b++) {
          const m = Math.abs(mod[b]!.step(x));
          env[b] = env[b]! + (m > env[b]! ? att : rel) * (m - env[b]!);
          y += car[b]!.step(c) * env[b]!;
        }
        // Keep the vocoded sound as loud as the voice, whatever the carrier's level.
        inLevel += slow * (x * x - inLevel);
        outLevel += slow * (y * y - outLevel);
        const g = Math.min(50, Math.sqrt((inLevel + 1e-12) / (outLevel + 1e-12)));
        out[i] = mix * y * g + (1 - mix) * x;
      }
    },
  };
}

/** One effect of a lane's chain as a processor. */
export function voiceProcessor(fx: VoiceFx, rate: number, key?: KeyClasses): VoiceProcessor {
  switch (fx.effect) {
    case 'vocoder': return vocoder(fx.bands, rate, 1);
    case 'talkbox': return vocoder(24, rate, fx.mix);
    case 'autotune': return autotune(fx.strength, fx.retune_ms, rate, key);
    case 'harmonizer': return harmonizer(fx.voices, fx.mix, rate, key);
    case 'pitch': return pitchShift(fx.semitones, fx.formant);
    case 'robot': return robot(fx.mix);
    case 'whisper': return whisper(fx.mix);
  }
}

/**
 * A lane's voice chain over a whole mono buffer, in order, each effect lined up with its input. `carriers` gives the
 * mono audio of each lane a Vocoder or Talk Box names.
 */
export function applyVoice(x: Float32Array, chain: readonly VoiceFx[], rate: number, carriers: ReadonlyMap<string, Float32Array>, key?: KeyClasses): Float32Array {
  let y = x;
  for (const fx of chain) {
    const p = voiceProcessor(fx, rate, key);
    const carrier = 'carrier' in fx ? carriers.get(fx.carrier) : undefined;
    if (carrier) {
      const c = new Float32Array(y.length);
      c.set(carrier.subarray(0, y.length));
      const out = new Float32Array(y.length);
      const BLOCK = 4096;
      for (let i = 0; i < y.length; i += BLOCK) p.process(y.subarray(i, i + BLOCK), out.subarray(i, i + BLOCK), c.subarray(i, i + BLOCK));
      y = out;
    } else if ('carrier' in fx) continue;
    else y = runAligned(y, p.latency, (a, b) => p.process(a, b));
  }
  return y;
}
