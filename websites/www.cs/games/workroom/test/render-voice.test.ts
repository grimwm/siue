// Voice Effects measured: the STFT gives back what it is given; Pitch Shift moves the pitch and keeps it with Formant 0;
// Auto-Tune pulls a flat note onto the key at Hard and leaves it at Natural; the Harmonizer adds the key's third; Robot
// holds a gliding voice on one pitch; Whisper takes the pitch away; the Vocoder follows the voice's loudness.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { detectPitch, midiOf } from '../src/compose/pitch.ts';
import { rms, runAligned, Stft, STFT_SIZE } from '../src/render/dsp.ts';
import { applyVoice, autotune, harmonizer, pitchShift, robot, vocoder, whisper } from '../src/render/voice.ts';
import type { VoiceProcessor } from '../src/render/voice.ts';

const RATE = 48000;
/** A voice-like tone (three harmonics) whose pitch in MIDI follows `midi(t)`, `seconds` long. */
const tone = (midi: (t: number) => number, seconds: number): Float32Array => {
  let ph = 0;
  return Float32Array.from({ length: Math.round(seconds * RATE) }, (_, i) => {
    ph += (2 * Math.PI * 440 * 2 ** ((midi(i / RATE) - 69) / 12)) / RATE;
    return 0.3 * (Math.sin(ph) + 0.5 * Math.sin(2 * ph) + 0.25 * Math.sin(3 * ph));
  });
};
const run = (p: VoiceProcessor, x: Float32Array): Float32Array => runAligned(x, p.latency, (a, b) => p.process(a, b));
/** The pitch (MIDI) of the frame at `at` seconds. */
const pitchAt = (x: Float32Array, at: number): number => {
  const i = Math.round(at * RATE);
  const got = detectPitch(x.subarray(i, i + 2048), RATE, { minHz: 60, maxHz: 1200 });
  assert.ok(got, `a pitch at ${at} s`);
  return midiOf(got!.hz);
};

test('the STFT gives back its input, STFT_SIZE samples later', () => {
  const x = tone(() => 60, 1);
  const s = new Stft(() => {});
  const out = new Float32Array(x.length);
  s.process(x, out);
  let err = 0;
  for (let i = STFT_SIZE * 2; i < x.length; i++) err = Math.max(err, Math.abs(out[i]! - x[i - STFT_SIZE]!));
  assert.ok(err < 1e-6, `max error ${err}`);
});

test('Pitch Shift +12 moves the voice an octave up; 0 leaves it where it was', () => {
  const x = tone(() => 57, 1.5);
  assert.ok(Math.abs(pitchAt(run(pitchShift(12, 0), x), 0.8) - 69) < 0.3);
  assert.ok(Math.abs(pitchAt(run(pitchShift(-5, 0), x), 0.8) - 52) < 0.3);
  assert.ok(Math.abs(pitchAt(run(pitchShift(0, 0), x), 0.8) - 57) < 0.2);
});

test('Auto-Tune at Hard pulls a note 50 cents flat onto the key; at Natural strength 0 it stays', () => {
  const flat = tone(() => 68.5, 1.5);
  assert.ok(Math.abs(pitchAt(run(autotune(1, 0, RATE), flat), 1) - 69) < 0.1, 'within 10 cents of A');
  assert.ok(Math.abs(pitchAt(run(autotune(0, 0, RATE), flat), 1) - 68.5) < 0.1);
  const slow = run(autotune(1, 400, RATE), flat);
  assert.ok(pitchAt(slow, 0.1) < pitchAt(slow, 1.2) - 0.1, 'a slow retune gets there gradually');
});

test('the Harmonizer adds the key\'s third above the sung note', () => {
  const c4 = tone(() => 60, 1.5);
  const out = run(harmonizer(['third'], 1, RATE), c4);
  const energyAt = (x: Float32Array, hz: number): number => {
    let re = 0, im = 0;
    for (let i = RATE * 0.5; i < RATE * 1.2; i++) { re += x[i]! * Math.cos((2 * Math.PI * hz * i) / RATE); im += x[i]! * Math.sin((2 * Math.PI * hz * i) / RATE); }
    return Math.hypot(re, im);
  };
  const e = 329.63; // E4
  assert.ok(energyAt(out, e) > 10 * energyAt(c4, e), 'E4 is there now');
  assert.ok(energyAt(out, 261.63) > 0.5 * energyAt(c4, 261.63), 'and the sung C4 stays');
});

test('Robot holds a gliding voice on one pitch; Whisper takes the pitch away', () => {
  const glide = tone(t => 55 + 8 * t, 1.5);
  const r = run(robot(1), glide);
  assert.ok(pitchAt(glide, 1.2) - pitchAt(glide, 0.4) > 5, 'the voice glides');
  // Zero phases repeat every frame hop (512 samples), so the robot's sound repeats every 512 samples as the voice glides.
  const repeats = (x: Float32Array, lag: number) => {
    let ab = 0, aa = 0, bb = 0;
    for (let i = RATE * 0.4; i < RATE * 1.3; i++) { ab += x[i]! * x[i + lag]!; aa += x[i]! ** 2; bb += x[i + lag]! ** 2; }
    return ab / Math.sqrt(aa * bb);
  };
  assert.ok(repeats(r, 512) > 0.8, `robot repeats ${repeats(r, 512)}`);
  assert.ok(repeats(glide, 512) < 0.5, `the voice does not ${repeats(glide, 512)}`);
  const w = run(whisper(1), tone(() => 60, 1.5));
  const clarity = (x: Float32Array) => detectPitch(x.subarray(RATE, RATE + 2048), RATE, { minHz: 60, maxHz: 1200, threshold: 0.99 })?.clarity ?? 0;
  assert.ok(clarity(w) < clarity(tone(() => 60, 1.5)) - 0.3, `whisper clarity ${clarity(w)}`);
});

test('the Vocoder follows the voice: loud where the voice sounds, quiet where it rests', () => {
  const voice = tone(() => 57, 2).map((v, i) => (Math.floor(i / (RATE * 0.25)) % 2 === 0 ? v : 0));
  let ph = 0;
  const saw = Float32Array.from({ length: voice.length }, () => { ph = (ph + 110 / RATE) % 1; return 0.5 * (2 * ph - 1); });
  const out = applyVoice(voice, [{ effect: 'vocoder', carrier: 'synth', bands: 16 }], RATE, new Map([['synth', saw]]));
  const seg = (a: number) => rms(out.subarray(Math.round(a * RATE), Math.round((a + 0.15) * RATE)));
  assert.ok(seg(0.55) > 5 * seg(0.30), `on ${seg(0.55)} off ${seg(0.30)}`);
  const p = vocoder(16, RATE);
  assert.equal(p.latency, 0);
});
