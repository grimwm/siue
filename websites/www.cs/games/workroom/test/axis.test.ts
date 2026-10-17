import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { axisTicks, formatSeconds, secondsTicks } from '../src/axis.ts';
import { tempoMap } from '../src/tempo.ts';
import { fitView, zoomAt, boundsFor } from '../src/zoom.ts';
import type { Score } from '../src/score.ts';

const read = (name: string): Score => JSON.parse(readFileSync(new URL(`./fixtures/${name}`, import.meta.url), 'utf8')) as Score;
const close = (a: number, b: number) => assert.ok(Math.abs(a - b) < 1e-6, `${a} ≈ ${b}`);

test('milliseconds below one second, seconds above', () => {
  assert.deepEqual([0, 0.01, 0.05, 0.3, 0.999, 1, 1.5, 2.25, 12].map(formatSeconds), ['0 s', '10 ms', '50 ms', '300 ms', '999 ms', '1 s', '1.5 s', '2.25 s', '12 s']);
});

test('a 0.4 s sound is ticked every 50 ms across the full width', () => {
  const ticks = secondsTicks(fitView(0.4, 800));
  assert.deepEqual(ticks.map(t => t.label), ['0 s', '50 ms', '100 ms', '150 ms', '200 ms', '250 ms', '300 ms', '350 ms']);
  assert.ok(ticks.every(t => t.bar === null));
  close(ticks[1]!.x, 100);
  close(ticks[7]!.x, 700);
});

test('a longer sound is ticked in whole seconds, and zooming in narrows the step', () => {
  assert.deepEqual(secondsTicks(fitView(12, 600)).map(t => t.label), ['0 s', '2 s', '4 s', '6 s', '8 s', '10 s']);
  const zoomed = zoomAt(fitView(12, 600), 0, 8, boundsFor(12, 600)); // 400 px/s
  assert.deepEqual(secondsTicks(zoomed).map(t => t.label), ['0 s', '200 ms', '400 ms', '600 ms', '800 ms', '1 s', '1.2 s', '1.4 s']);
});

test('a music piece is ticked by bar, a sound piece by seconds', () => {
  const music = read('score-v1.json');
  const bars = axisTicks(music, tempoMap(music), fitView(16, 800));
  assert.deepEqual(bars.map(t => [t.bar, t.label]), [1, 2, 3, 4, 5, 6, 7, 8].map(n => [n, String(n)]));
  const sound = read('score-sound-v1.json');
  const seconds = axisTicks(sound, tempoMap(sound), fitView(sound.duration, 800));
  assert.equal(seconds[1]!.label, '50 ms');
  assert.ok(seconds.every(t => t.bar === null));
});
