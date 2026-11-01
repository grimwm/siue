// DJ & Effects' processors on test signals, each measured for what its name says: a ramp whose value is its own
// position shows where a deck effect reads (a tape stop slows to silence, a stutter repeats its first slice, a reverse
// reads backwards, a hot cue jumps, the looper repeats its bar), and tones and noise show the rest (a riser climbs, a
// filter sweep closes, a gate follows its pattern, Wide / 8D moves between the sides). Outside a clip nothing changes.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyClips, barMap, crossfadeGain, makeClip } from '../src/render/djfx.ts';
import { seeded } from '../src/render/dsp.ts';
import type { FxClip } from '../src/score.ts';

const RATE = 16000;
const TEMPO = [{ bar: 1, bpm: 120, beats: 4, unit: 4 as const }];
const BAR = 2 * RATE; // 120 BPM in 4/4: two seconds a bar
const BEAT = BAR / 4;
const bars = barMap(TEMPO, RATE);
const N = 6 * BAR;
const env = { rate: RATE, bars };

const clip = (effect: FxClip['effect'], from_bar: number, to_bar: number, settings?: Record<string, unknown>, points?: number[][], lane: string | null = null): FxClip =>
  ({ effect, lane, from_bar, to_bar, ...(settings ? { settings } : {}), ...(points ? { points } : {}) });
/** A stereo pair of copies of `f`. */
const stereo = (f: (i: number) => number): Float32Array[] => [Float32Array.from({ length: N }, (_, i) => f(i)), Float32Array.from({ length: N }, (_, i) => f(i))];
/** The ramp: each sample is its own position over N, so a deck effect's output says where it read. */
const ramp = () => stereo(i => i / N);
const sine = (hz: number) => stereo(i => 0.5 * Math.sin((2 * Math.PI * hz * i) / RATE));
const noise = (seed = 5) => { const r = seeded(seed); const n = Float32Array.from({ length: N }, () => r() * 2 - 1); return [n, Float32Array.from(n)]; };
const silence = () => stereo(() => 0);
const run = (ch: Float32Array[], ...clips: FxClip[]) => { applyClips(ch, clips, env); return ch; };
const at = (bar: number) => Math.round(bars.sample(bar));
const energy = (x: Float32Array, a: number, b: number) => { let s = 0; for (let i = a; i < b; i++) s += x[i]! * x[i]!; return s / Math.max(1, b - a); };
/** Energy above `hz`: the signal minus a one-pole smoothing of it, a crude high-pass that is enough to compare. */
const high = (x: Float32Array, a: number, b: number, hz = 2000) => {
  const k = Math.exp((-2 * Math.PI * hz) / RATE);
  let lp = 0;
  let s = 0;
  for (let i = a; i < b; i++) { lp = k * lp + (1 - k) * x[i]!; const h = x[i]! - lp; s += h * h; }
  return s / (b - a);
};
const crossings = (x: Float32Array, a: number, b: number) => { let n = 0; for (let i = a + 1; i < b; i++) if ((x[i - 1]! < 0) !== (x[i]! < 0)) n++; return n; };
/** Where the deck read at sample i, in samples, from the ramp's value. */
const readAt = (ch: Float32Array[], i: number) => ch[0]![i]! * N;

test('outside its clip the sound is untouched, and the clip edges do not click', () => {
  const dry = sine(220);
  const ch = run(sine(220), clip('tape_stop', 2, 3), clip('stutter', 4, 4.5));
  for (const i of [0, at(2) - 1, at(3) + 10, at(4) - 1, at(4.5) + 10, N - 1]) assert.equal(ch[0]![i], dry[0]![i], `sample ${i}`);
  let jump = 0;
  for (let i = at(2) - 50; i < at(2) + 50; i++) jump = Math.max(jump, Math.abs(ch[0]![i + 1]! - ch[0]![i]!));
  assert.ok(jump < 0.1, `a soft edge, not a click: ${jump}`);
});

test('Tape Stop reads ever more slowly and ends silent', () => {
  const ch = run(ramp(), clip('tape_stop', 2, 3, { time: 'fast' }));
  const s = at(2);
  const speed = (a: number) => (readAt(ch, s + a + 400) - readAt(ch, s + a)) / 400;
  assert.ok(Math.abs(speed(200) - 1) < 0.2, `starts near full speed: ${speed(200)}`);
  assert.ok(speed(0.3 * RATE) < 0.5 * speed(200), 'and slows');
  assert.equal(energy(ch[0]!, s + 0.6 * RATE, at(3) - 100), 0, 'silent once stopped');
});

test('Tape Start winds up from a standstill and lands back in time', () => {
  const ch = run(ramp(), clip('tape_start', 2, 3, { time: 'fast' }));
  const s = at(2);
  const early = (readAt(ch, s + 800) - readAt(ch, s + 400)) / 400;
  assert.ok(early < 0.2, `starts nearly still: ${early}`);
  const late = s + 0.7 * RATE;
  assert.ok(Math.abs(readAt(ch, late) - late) < 3, `in time after the wind-up: ${readAt(ch, late)} vs ${late}`);
});

test('Spinback throws the record backwards', () => {
  const ch = run(ramp(), clip('spinback', 2, 3));
  const s = at(2);
  assert.ok(readAt(ch, s + 0.5 * RATE) < readAt(ch, s + 0.2 * RATE), 'the read position goes back');
});

test('a recorded Scratch follows its platter moves', () => {
  // Forward at 1 for half a beat, then back at −1 for half a beat: the record comes back to where it started.
  const pts = [[2, 1], [2.0624, 1], [2.0626, -1], [2.125, -1]];
  const ch = run(ramp(), clip('scratch', 2, 2.125, { style: 'baby' }, pts));
  const s = at(2);
  assert.ok(readAt(ch, s + BEAT / 4) > s + BEAT / 4 - 10, 'forward first');
  assert.ok(Math.abs(readAt(ch, at(2.125) - 120) - (s + 120)) < 60, `and back to the start: ${readAt(ch, at(2.125) - 120) - s}`);
});

test('Stutter repeats its first slice, and Roll Down halves it each beat', () => {
  const ch = run(ramp(), clip('stutter', 2, 3, { slice: 16 }));
  const slice = BEAT / 4;
  const s = at(2);
  assert.ok(Math.abs(readAt(ch, s + 3 * slice + 100) - (s + 100)) < 1, 'the fourth slice is the first again');
  const roll = run(ramp(), clip('stutter', 2, 3, { slice: 0 }));
  const third = s + 2 * BEAT; // a beat, half a beat, then in the third beat a quarter of one
  assert.ok(Math.abs(readAt(roll, third + BEAT / 4 + 100) - (third + 100)) < 1, 'by the third beat the slice is a quarter of a beat');
});

test('Reverse plays each bar backwards', () => {
  const ch = run(ramp(), clip('reverse', 2, 3, { length: 'bar' }));
  const s = at(2);
  assert.ok(readAt(ch, s + 1000) > readAt(ch, s + 2000), 'the read position falls');
  assert.ok(Math.abs(readAt(ch, s + 1000) - (s + BAR - 1 - 1000)) < 1, 'it reads the bar from its end');
});

test('a Hot Cue plays from its cue bar', () => {
  const ch = run(ramp(), clip('hot_cue', 4, 4.5, { cue_bar: 1.5 }));
  assert.ok(Math.abs(readAt(ch, at(4) + 500) - (at(1.5) + 500)) < 1);
});

test('the Looper repeats its bar, and Mute Deck leaves only the loop', () => {
  const ch = run(ramp(), clip('looper', 4, 6, { bars: [2], mute_deck: true }));
  assert.ok(Math.abs(readAt(ch, at(4) + 700) - (at(2) + 700)) < 1, 'bar 2 again');
  assert.ok(Math.abs(readAt(ch, at(5) + 700) - (at(2) + 700)) < 1, 'and again a bar later');
  const layered = run(stereo(() => 0.25), clip('looper', 4, 5, { bars: [2] }));
  assert.ok(Math.abs(layered[0]![at(4) + 700]! - 0.5) < 1e-6, 'without Mute Deck the loop plays over the deck');
});

test('Granular Freeze holds the moment it started, and Stretch creeps on at half speed', () => {
  const ch = run(ramp(), clip('granular_freeze', 2, 3, { mode: 'freeze' }));
  const s = at(2);
  for (const k of [0.3, 0.6, 0.9]) assert.ok(Math.abs(readAt(ch, s + k * BAR) / 1 - (s + 0.03 * RATE)) < 0.07 * RATE, `frozen at ${k}`);
  const st = run(ramp(), clip('granular_freeze', 2, 3, { mode: 'stretch' }));
  const moved = readAt(st, s + 0.8 * BAR) - readAt(st, s + 0.2 * BAR);
  assert.ok(Math.abs(moved - 0.5 * 0.6 * BAR) < 0.06 * RATE, `half speed: ${moved / (0.6 * BAR)}`);
});

test('Doppler Fly-By comes in higher and leaves lower, crossing from left to right', () => {
  const ch = run(sine(500), clip('doppler', 2, 4));
  const s = at(2);
  const q = BAR / 2;
  assert.ok(crossings(ch[0]!, s + 200, s + q) > crossings(ch[0]!, at(4) - q, at(4) - 200), 'pitch falls');
  assert.ok(energy(ch[0]!, s + 200, s + q) > energy(ch[1]!, s + 200, s + q), 'it starts on the left');
  assert.ok(energy(ch[1]!, at(4) - q, at(4) - 200) > energy(ch[0]!, at(4) - q, at(4) - 200), 'and ends on the right');
});

test('a Riser climbs in pitch and loudness', () => {
  const ch = run(silence(), clip('riser', 2, 4, { climb: 3 }));
  const s = at(2);
  const q = BAR / 2;
  assert.ok(energy(ch[0]!, at(4) - q, at(4)) > 4 * energy(ch[0]!, s, s + q), 'louder at the end');
  assert.ok(high(ch[0]!, at(4) - q, at(4)) / energy(ch[0]!, at(4) - q, at(4)) > high(ch[0]!, s + q, s + 2 * q) / energy(ch[0]!, s + q, s + 2 * q), 'and brighter');
});

test('a Snare Roll hits faster and louder toward the end', () => {
  const ch = run(silence(), clip('snare_roll', 2, 3, { level: 1 }));
  const onsets = (a: number, b: number) => { let n = 0; for (let i = a + 1; i < b; i++) if (Math.abs(ch[0]![i]!) > 0.05 && Math.abs(ch[0]![i - 1]!) <= 0.05 && Math.abs(ch[0]![i - 30] ?? 0) <= 0.05) n++; return n; };
  assert.ok(energy(ch[0]!, at(2.75), at(3)) > energy(ch[0]!, at(2), at(2.25)), 'louder');
  assert.ok(onsets(at(2.75), at(3)) >= onsets(at(2), at(2.25)), 'no slower');
});

test('Filter Sweep closes from the bottom up, or from the top down', () => {
  const up = run(noise(), clip('filter_sweep', 2, 4, { mode: 'highpass_up' }));
  const lowEnergy = (x: Float32Array, a: number, b: number) => {
    const k = Math.exp((-2 * Math.PI * 400) / RATE);
    let lp = 0;
    let e = 0;
    for (let i = a; i < b; i++) { lp = k * lp + (1 - k) * x[i]!; e += lp * lp; }
    return e / (b - a);
  };
  assert.ok(lowEnergy(up[0]!, at(3.75), at(4)) < 0.3 * lowEnergy(up[0]!, at(2), at(2.25)), 'the lows go');
  const down = run(noise(), clip('filter_sweep', 2, 4, { mode: 'lowpass_down' }));
  assert.ok(high(down[0]!, at(3.75), at(4)) < 0.1 * high(down[0]!, at(2), at(2.25)), 'the highs go');
});

test('an Impact lands on its first beat and rings on past the clip', () => {
  const ch = run(silence(), clip('impact', 2, 2.25));
  assert.ok(energy(ch[0]!, at(2), at(2) + 0.2 * RATE) > 0.01);
  assert.ok(energy(ch[0]!, at(2.25), at(2.25) + 0.3 * RATE) > 1e-4, 'it rings on');
});

test('Sidechain Pump ducks on every beat and swells back', () => {
  const ch = run(stereo(() => 0.5), clip('sidechain', 2, 3, { depth: 0.9 }));
  const s = at(2);
  assert.ok(ch[0]![s + BEAT + 20]! < 0.15, 'down on the beat');
  assert.ok(ch[0]![s + BEAT + 0.8 * BEAT]! > 0.45, 'back up before the next');
});

test('Trance Gate follows its pattern, sixteen steps a bar', () => {
  const ch = run(stereo(() => 0.5), clip('trance_gate', 2, 3, { pattern: 'classic' }));
  const step = BAR / 16;
  const level = (k: number) => Math.abs(ch[0]![at(2) + k * step + step / 2]!);
  const pattern = '1011101110111010';
  for (let k = 0; k < 16; k++) assert.equal(level(k) > 0.25, pattern[k] === '1', `step ${k + 1}`);
});

test('Wobble swings a low-pass open and shut', () => {
  const ch = run(noise(), clip('wobble', 2, 3, { rate: 1, depth: 1 }));
  const bits = Array.from({ length: 8 }, (_, k) => high(ch[0]!, at(2) + (k * BEAT) / 2, at(2) + ((k + 1) * BEAT) / 2, 1500));
  assert.ok(Math.max(...bits) > 5 * Math.min(...bits), `bright and dull in turn: ${bits.map(b => b.toFixed(4))}`);
});

test('Tremolo makes the level wobble, and Auto-Pan swings between the sides', () => {
  const tr = run(stereo(() => 0.5), clip('tremolo', 2, 3, { rate: 4 }));
  const lv = Array.from({ length: 16 }, (_, k) => Math.abs(tr[0]![at(2) + (k * BAR) / 16]!));
  assert.ok(Math.max(...lv) - Math.min(...lv) > 0.3);
  const pan = run(stereo(() => 0.5), clip('auto_pan', 2, 3, { speed: 'bar' }));
  const q = at(2) + BAR / 4;
  const tq = at(2) + (3 * BAR) / 4;
  assert.ok(pan[1]![q]! > pan[0]![q]! && pan[0]![tq]! > pan[1]![tq]!, 'right a quarter in, left at three quarters');
});

test('Bitcrusher leaves few levels and holds samples', () => {
  const ch = run(sine(110), clip('bitcrusher', 2, 3, { crunch: 1 }));
  const levels = new Set(Array.from(ch[0]!.subarray(at(2) + 100, at(3) - 100)));
  assert.ok(levels.size <= 8, `${levels.size} levels`);
});

test('Ring Mod moves a tone to its sum and difference', () => {
  const ch = run(sine(1000), clip('ring_mod', 2, 3, { tone: 400 }));
  const s = at(2) + 1000;
  const n = 8000;
  const mag = (hz: number) => { let re = 0; let im = 0; for (let i = 0; i < n; i++) { const a = (2 * Math.PI * hz * i) / RATE; re += ch[0]![s + i]! * Math.cos(a); im += ch[0]![s + i]! * Math.sin(a); } return Math.hypot(re, im) / n; };
  assert.ok(mag(1400) > 0.05 && mag(600) > 0.05, 'sidebands');
  assert.ok(mag(1000) < mag(1400), 'more sideband than the tone');
});

test('Phaser, Flanger, Auto-Wah and Rotary Speaker colour the sound and keep it', () => {
  for (const [effect, settings] of [['phaser', { speed: 'fast' }], ['flanger', { speed: 'fast' }], ['auto_wah', { sensitivity: 1 }], ['rotary', { speed: 'fast' }]] as const) {
    const dry = noise();
    const ch = run(noise(), clip(effect, 2, 3, settings));
    let diff = 0;
    for (let i = at(2) + 200; i < at(3) - 200; i++) diff += (ch[0]![i]! - dry[0]![i]!) ** 2;
    const e = energy(ch[0]!, at(2) + 200, at(3) - 200);
    assert.ok(diff / (at(3) - at(2) - 400) > 0.01 && e > 0.05, effect);
  }
  const rot = run(stereo(() => 0.5), clip('rotary', 2, 3, { speed: 'fast' }));
  const lr = Array.from({ length: 40 }, (_, k) => rot[0]![at(2) + 500 + k * 100]! - rot[1]![at(2) + 500 + k * 100]!);
  assert.ok(Math.max(...lr) > 0.2 && Math.min(...lr) < -0.2, 'the horn swings left and right');
});

test('Echo Out cuts the music and lets its echoes trail on', () => {
  const ch = run(stereo(i => (i < at(2) + 200 && i >= at(2) ? 1 : 0)), clip('echo_out', 2, 3, { time: 'quarter' }));
  const e = (k: number) => Math.max(...Array.from(ch[0]!.subarray(at(2) + k * BEAT - 5, at(2) + k * BEAT + 205)).map(Math.abs));
  assert.ok(e(1) > 0.5 && e(2) > 0.3 && e(2) < e(1), `echoes a beat apart, each softer: ${e(1)}, ${e(2)}`);
  assert.ok(e(5) > 0.05, 'and they trail on past the clip');
});

test('Ping-Pong Echo bounces from left to right', () => {
  const ch = run(stereo(i => (i >= at(2) && i < at(2) + 100 ? 1 : 0)), clip('ping_pong', 2, 3, { time: 'quarter' }));
  const d = BEAT;
  const peak = (c: number, a: number) => Math.max(...Array.from(ch[c]!.subarray(a - 5, a + 105)).map(Math.abs));
  assert.ok(peak(0, at(2) + d) > 0.2 && peak(1, at(2) + d) < 0.05, 'first echo on the left');
  assert.ok(peak(1, at(2) + 2 * d) > 0.1, 'then the right');
});

test('Reverse Reverb swells up into the bar after it', () => {
  const ch = run(stereo(i => (i >= at(3) && i < at(3) + 400 ? 1 : 0)), clip('reverse_reverb', 2, 3, { swell: 'short' }));
  assert.ok(energy(ch[0]!, at(3) - 0.2 * RATE, at(3)) > 4 * energy(ch[0]!, at(3) - 1.4 * RATE, at(3) - 1.2 * RATE), 'it grows toward the downbeat');
});

test('Wide / 8D circles round the head', () => {
  const ch = run(stereo(() => 0.5), clip('wide_8d', 2, 3, { circle: 'bar' }));
  const q = at(2) + BAR / 4;
  const tq = at(2) + (3 * BAR) / 4;
  assert.ok(ch[1]![q]! > 2 * Math.abs(ch[0]![q]!), 'right');
  assert.ok(ch[0]![tq]! > 2 * Math.abs(ch[1]![tq]!), 'then left');
});

test('Vinyl Crackle and Wow crackles over silence and dulls the top', () => {
  const ch = run(silence(), clip('vinyl', 2, 3, { age: 1 }));
  assert.ok(energy(ch[0]!, at(2), at(3)) > 0, 'crackle');
  const dull = run(noise(), clip('vinyl', 2, 3, { age: 1 }));
  assert.ok(high(dull[0]!, at(2), at(3), 5000) < high(noise()[0]!, at(2), at(3), 5000));
});

test('the XY Filter follows its recorded moves', () => {
  const ch = run(noise(), clip('filter', 2, 3, undefined, [[2, 0, 0], [2.5, 0, 0], [2.5, 1, 0], [3, 1, 0]]));
  assert.ok(high(ch[0]!, at(2.1), at(2.4)) < 0.05 * high(ch[0]!, at(2.6), at(2.9)), 'closed, then open');
});

test('Pitch Shift an octave up doubles a tone', () => {
  const ch = run(sine(220), clip('pitch_shift', 2, 3, { semitones: 12, formant: 0 }));
  const n = crossings(ch[0]!, at(2) + 3000, at(3) - 3000);
  const dry = crossings(sine(220)[0]!, at(2) + 3000, at(3) - 3000);
  assert.ok(Math.abs(n / dry - 2) < 0.15, `${n / dry}`);
});

test('a Vocoder clip needs its carrier and makes sound from it', () => {
  const carrier = sine(110)[0]!;
  const ch = noise();
  applyClips(ch, [clip('vocoder', 2, 3, { carrier: 'synth', bands: 16 }, undefined, 'voice')], { ...env, carriers: new Map([['synth', carrier]]) });
  assert.ok(energy(ch[0]!, at(2) + 2000, at(3) - 2000) > 1e-4);
});

test('the Crossfader moves the A side out and the B side in; other parts play on', () => {
  const c = clip('crossfader', 2, 4, { a: ['drums'], b: ['bass'] }, [[2, 0], [4, 1]]);
  assert.equal(crossfadeGain(c, 'drums', at(2) + 10, bars), 1);
  assert.equal(crossfadeGain(c, 'bass', at(2) + 10, bars) < 0.01, true);
  assert.equal(crossfadeGain(c, 'drums', at(3.9), bars) < 0.25, true);
  assert.equal(crossfadeGain(c, 'bass', at(3.9), bars), 1);
  assert.equal(crossfadeGain(c, 'keys', at(3), bars), 1);
  assert.equal(crossfadeGain(c, 'bass', at(1), bars), 1, 'before the clip, every lane');
});

test('a live pad with no end yet keeps going until it is let go', () => {
  const ch = ramp();
  const p = makeClip(clip('stutter', 1, 1.001, { slice: 4 }), { ...env, src: ch }, { start: at(2), end: Infinity });
  const x = [0, 0];
  const out: number[] = [];
  for (let i = at(2); i < at(2) + 3 * BEAT; i++) { x[0] = ch[0]![i]!; x[1] = ch[1]![i]!; p.tick(i, x); out.push(x[0]! * N); }
  assert.ok(Math.abs(out[2 * BEAT + 100]! - (at(2) + 100)) < 1, 'still repeating two beats on');
  p.end = at(2) + 3 * BEAT;
});

test('Harmonizer and Pitch Correction clips change a voice and keep it sounding', () => {
  for (const c of [clip('harmonizer', 2, 3, { voices: ['fifth'], mix: 0.6 }), clip('autotune', 2, 3, { strength: 1, retune_ms: 0 })]) {
    const dry = sine(233);
    const ch = run(sine(233), c);
    let diff = 0;
    for (let i = at(2) + 3000; i < at(3) - 3000; i++) diff += (ch[0]![i]! - dry[0]![i]!) ** 2;
    assert.ok(diff > 1 && energy(ch[0]!, at(2) + 3000, at(3) - 3000) > 0.01, c.effect);
  }
});
