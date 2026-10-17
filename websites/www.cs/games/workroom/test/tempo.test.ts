import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { changeTimes, sectionTimes, tempoMap } from '../src/tempo.ts';
import type { Score } from '../src/score.ts';

const score = (): Score => JSON.parse(readFileSync(new URL('./fixtures/score-v1.json', import.meta.url), 'utf8')) as Score;
const sound = (): Score => JSON.parse(readFileSync(new URL('./fixtures/score-sound-v1.json', import.meta.url), 'utf8')) as Score;

test('one tempo: two seconds a bar', () => {
  const m = tempoMap(score());
  assert.deepEqual([m.barStart(1), m.barStart(5), m.barStart(8)], [0, 8, 14]);
  assert.deepEqual([m.barStart(9), m.barStart(99)], [16, 16], 'a bar past the last starts at the end of the piece (duration 16), not at the last bar');
  assert.deepEqual([m.barAt(0), m.barAt(7.99), m.barAt(8), m.barAt(16), m.barAt(99), m.barAt(-1)], [1, 4, 5, 8, 8, 1]);
});

test('a tempo and metre change mid-piece', () => {
  const s = score();
  s.tempo = [{ bar: 1, bpm: 120, beats: 4, unit: 4 }, { bar: 3, bpm: 60, beats: 3, unit: 4 }];
  const m = tempoMap(s);
  assert.deepEqual([m.barStart(2), m.barStart(3), m.barStart(4)], [2, 4, 7]);
  assert.equal(m.barAt(6.9), 3);
  assert.equal(m.barAt(7), 4);
});

test('a sound piece has no bars: the map says so and sections are moments', () => {
  const s = sound();
  const m = tempoMap(s);
  assert.equal(m.metric, false);
  assert.equal(tempoMap(score()).metric, true);
  assert.deepEqual([m.barAt(0), m.barAt(0.3), m.barAt(99)], [null, null, null]);
  assert.deepEqual([m.barStart(1), m.barStart(2)], [0, s.duration]);
  assert.deepEqual(s.sections.map(x => sectionTimes(x, m, s.duration)), [{ from: 0, to: 0.08 }, { from: 0.08, to: 0.4 }]);
});

test('a music section covers its bars, the last to the end of the piece', () => {
  const s = score();
  const m = tempoMap(s);
  assert.deepEqual(s.sections.map(x => sectionTimes(x, m, s.duration)), [{ from: 0, to: 8 }, { from: 8, to: 16 }]);
});

test('a change covers its bars on a music piece and its seconds on a sound piece', () => {
  const m = tempoMap(score());
  assert.deepEqual(changeTimes({ from_bar: 3, to_bar: 4, lane: null, text: 'x', answers: [] }, m, 16), { from: 4, to: 8 });
  assert.deepEqual(changeTimes({ from: 0.1, to: 0.3, lane: null, text: 'x', answers: [] }, tempoMap(sound()), 0.4), { from: 0.1, to: 0.3 });
});
