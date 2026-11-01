// DJ Mode's deck on a ramp (each sample its own position, so the output says where the deck read): a held pad plays
// its effect and lets go back in time; a stutter starts on the sixteenth-note grid; the platter scratches and carries
// on in time; a hot cue plays from its bar while held; the Looper loops the bar it heard, mutes the deck and clears;
// Record To Timeline gives back what was played as clips in bar positions, with the moves as points.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createDeck } from '../src/compose/djlive.ts';
import { barMap } from '../src/render/djfx.ts';
import { parseScore } from '../src/score.ts';

const RATE = 8000;
const BAR = 2 * RATE; // 120 BPM in 4/4
const BEAT = BAR / 4;
const bars = barMap([{ bar: 1, bpm: 120, beats: 4, unit: 4 }], RATE);
const N = 8 * BAR;
const ramp = () => [Float32Array.from({ length: N }, (_, i) => i / N), Float32Array.from({ length: N }, (_, i) => i / N)];
const half = () => [Float32Array.from({ length: N }, () => 0.25), Float32Array.from({ length: N }, () => 0.25)];

/** Runs the deck for `samples`, giving back where each output sample read (the ramp's value times N). */
function run(deck: ReturnType<typeof createDeck>, samples: number): number[] {
  const out: number[] = [];
  for (let k = 0; k < samples; k += 128) {
    const l = new Float32Array(Math.min(128, samples - k));
    deck.process(l, new Float32Array(l.length));
    for (const v of l) out.push(v * N);
  }
  return out;
}

test('the deck plays the piece from its bar and goes round at the end, letting go of what is held', () => {
  const d = createDeck({ rate: RATE, full: ramp() }, bars, null);
  d.play(3);
  const out = run(d, 1000);
  assert.ok(Math.abs(out[500]! - (2 * BAR + 500)) < 1);
  d.play(8.9);
  d.record(true);
  d.padDown('3', 'stutter', { slice: 16 });
  const wrap = run(d, 0.1 * BAR + 500);
  assert.equal(d.playing(), true);
  assert.ok(Math.abs(wrap[0.1 * BAR + 300]! - 300) < 1, 'bar 1 again, the stutter let go');
  const clips = d.record(false);
  assert.deepEqual(clips.map(c => [c.effect, c.to_bar]), [['stutter', 9]], 'kept up to the end of the piece');
});

test('a held pad plays its effect and, let go, the deck is back in time', () => {
  const d = createDeck({ rate: RATE, full: ramp() }, bars, null);
  d.play(1);
  run(d, BEAT);
  d.padDown('3', 'stutter', { slice: 16 });
  const held = run(d, BEAT);
  assert.ok(Math.abs(held[BEAT / 4 + 100]! - (BEAT + 100)) < 1, 'the first sixteenth again');
  d.padUp('3');
  const after = run(d, 400);
  assert.ok(Math.abs(after[200]! - (2 * BEAT + 200)) < 1, 'back in time');
});

test('a stutter pressed mid-sixteenth starts on the sixteenth it is in', () => {
  const d = createDeck({ rate: RATE, full: ramp() }, bars, null);
  d.play(1);
  run(d, BEAT + 300);
  d.padDown('3', 'stutter', { slice: 16 });
  const held = run(d, BEAT / 2);
  const sixteenth = BEAT / 4;
  assert.ok(Math.abs(held[sixteenth - 300 + 100]! - (BEAT + 100)) < 1, 'it repeats from the start of that sixteenth');
});

test('the platter scratches backwards and, let go, carries on in time', () => {
  const d = createDeck({ rate: RATE, full: ramp() }, bars, null);
  d.play(2);
  d.platter(-1);
  const back = run(d, 1000);
  assert.ok(back[800]! < back[200]!, 'backwards while the hand drags back');
  d.platter(null);
  const on = run(d, 500);
  assert.ok(Math.abs(on[300]! - (BAR + 1000 + 300)) < 1, 'in time again');
});

test('a hot cue set on bar 1 plays from there while held', () => {
  const d = createDeck({ rate: RATE, full: ramp() }, bars, null);
  d.play(1);
  d.setCue(0);
  assert.deepEqual(d.cues(), [1, null, null, null]);
  run(d, 3 * BAR);
  d.cueDown(0);
  const held = run(d, 1000);
  assert.ok(Math.abs(held[500]! - 500) < 1, 'bar 1 again');
  d.cueUp(0);
  assert.ok(Math.abs(run(d, 500)[200]! - (3 * BAR + 1200)) < 1, 'and back in time');
});

test('the Looper records the next bar, loops it over the deck, mutes the deck and clears', () => {
  const d = createDeck({ rate: RATE, full: half() }, bars, null);
  d.play(1);
  run(d, 100);
  d.loopRecord();
  assert.equal(d.looper().waiting, true);
  run(d, BAR - 100 + 10);
  assert.deepEqual(d.looper().bars, [2], 'the bar it heard after Record');
  const looping = run(d, BAR + 400);
  assert.ok(Math.abs(looping[BAR - 10 + 100]! / N - 0.5) < 1e-6, 'the loop plays over the deck from the bar after');
  d.loopMute();
  assert.ok(Math.abs(run(d, 400)[200]! / N - 0.25) < 1e-6, 'muted, only the loop');
  d.loopClear();
  assert.ok(Math.abs(run(d, 400)[300]! / N - 0.25) < 1e-6, 'cleared, the deck alone');
  assert.deepEqual(d.looper(), { bars: [], mute: false, waiting: false });
});

test('Record To Timeline gives back what was played as clips the score keeps, moves as points', () => {
  const d = createDeck({ rate: RATE, full: half(), a: half(), b: half() }, bars, { a: ['drums'], b: ['bass'] });
  d.play(1);
  d.record(true);
  assert.equal(d.recording(), true);
  run(d, BEAT);
  d.padDown('q', 'tape_stop', { time: 'fast' });
  run(d, BEAT);
  d.padUp('q');
  d.platter(2);
  run(d, 600);
  d.platter(-2);
  run(d, 600);
  d.platter(null);
  d.fader(0.2);
  run(d, 600);
  d.fader(0.9);
  run(d, 600);
  d.fader(null);
  d.xy('filter', 0.1, 0.5);
  run(d, 400);
  d.xy('filter', 0.9, 0.2);
  run(d, 400);
  const clips = d.record(false);
  assert.equal(d.recording(), false);
  const kinds = clips.map(c => c.effect);
  assert.deepEqual(kinds, ['tape_stop', 'scratch', 'crossfader', 'filter']);
  assert.deepEqual([clips[0]!.from_bar, clips[0]!.to_bar], [1.25, 1.5]);
  assert.ok(clips[1]!.points!.some(p => p[1] === 2) && clips[1]!.points!.some(p => p[1] === -2), 'the platter\'s moves');
  assert.deepEqual(clips[2]!.settings, { a: ['drums'], b: ['bass'] });
  assert.ok(clips[3]!.points!.length >= 2 && clips[3]!.points!.every(p => p.length === 3));
  // The clips the deck gives are clips the score takes.
  const score = JSON.parse(JSON.stringify({ schema: 2, kind: 'music', project: { id: 'p', name: 'P' }, piece: { id: 'q', title: 'Q' }, draft: 1, made: '2026-11-01T00:00:00Z', duration: 16, bars: 8,
    tempo: [{ bar: 1, bpm: 120, beats: 4, unit: 4 }], sections: [{ id: 's', name: 'S', color: '#000000', from_bar: 1, to_bar: 8 }],
    lanes: [{ id: 'drums', name: 'D', family: 'percussion', icon: 'percussion', color: '#000000' }, { id: 'bass', name: 'B', family: 'strings', icon: 'strings', color: '#000000' }],
    characters: [], motifs: [], notes: [], energy: [[0, 0.5], [16, 0.5]], glossary: [], audio: ['x'].map(() => ({ file: 'audio.webm', type: 'audio/webm; codecs=opus' })), spectrogram: { file: 'spectrogram.png', low_hz: 20, high_hz: 8000, scale: 'log' }, changes: [], musicxml: 'score.musicxml', fx_clips: clips }));
  const r = parseScore(score);
  assert.ok(r.ok, r.ok ? '' : r.error);
});

test('a riser held past the end of the next bar stops there by itself', () => {
  const d = createDeck({ rate: RATE, full: half() }, bars, null);
  d.play(1);
  d.record(true);
  run(d, 100);
  d.padDown('a', 'riser', { climb: 2 });
  run(d, 3 * BAR);
  const clips = d.record(false);
  assert.equal(clips.length, 1);
  assert.equal(clips[0]!.to_bar, 3);
});
