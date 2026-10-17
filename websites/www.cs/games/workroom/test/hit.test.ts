import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { hitTimeline, spanBetween } from '../src/hit.ts';
import { layoutTimeline } from '../src/timeline.ts';
import { tempoMap } from '../src/tempo.ts';
import { boundsFor, fitView, zoomAt } from '../src/zoom.ts';
import type { Score } from '../src/score.ts';

const score = JSON.parse(readFileSync(new URL('./fixtures/score-v1.json', import.meta.url), 'utf8')) as Score;
const sound = JSON.parse(readFileSync(new URL('./fixtures/score-sound-v1.json', import.meta.url), 'utf8')) as Score;
const tempo = tempoMap(score);
const view = fitView(16, 800);
const layout = layoutTimeline(score, tempo, view);
const close = (a: number, b: number) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≈ ${b}`);

test('a tap maps to the right bar, lane and section', () => {
  assert.deepEqual(hitTimeline(layout, view, tempo, 450, 120), { time: 9, bar: 5, zone: 'lanes', laneId: 'brass', sectionId: 'thread' });
  assert.deepEqual(hitTimeline(layout, view, tempo, 50, 80), { time: 1, bar: 1, zone: 'lanes', laneId: 'strings-low', sectionId: 'stirs' });
  assert.equal(hitTimeline(layout, view, tempo, 10, 10).zone, 'energy');
  assert.equal(hitTimeline(layout, view, tempo, 10, 60).zone, 'sections');
  assert.deepEqual(hitTimeline(layout, view, tempo, 10, 500), { time: 0.2, bar: 1, zone: 'none', laneId: null, sectionId: 'stirs' });
});

test('hits stay right when zoomed', () => {
  const v = zoomAt(view, 200, 2, boundsFor(16, 800));
  const l = layoutTimeline(score, tempo, v);
  assert.equal(hitTimeline(l, v, tempo, 200, 120).bar, 3);
});

test('times outside the piece clamp', () => {
  assert.equal(hitTimeline(layout, view, tempo, -50, 120).time, 0);
  assert.equal(hitTimeline(layout, view, tempo, 900, 120).time, 16);
});

test('on a sound piece a tap has seconds and no bar', () => {
  const sTempo = tempoMap(sound);
  const sView = fitView(sound.duration, 800); // 2000 px/s
  const sLayout = layoutTimeline(sound, sTempo, sView);
  const early = hitTimeline(sLayout, sView, sTempo, 40, 90);
  close(early.time, 0.02);
  assert.deepEqual([early.bar, early.zone, early.laneId, early.sectionId], [null, 'lanes', 'boom', 'blast']);
  const late = hitTimeline(sLayout, sView, sTempo, 400, 120);
  close(late.time, 0.2);
  assert.deepEqual([late.bar, late.laneId, late.sectionId], [null, 'air', 'echo']);
  assert.equal(hitTimeline(sLayout, sView, sTempo, 900, 120).time, sound.duration, 'clamped to the end');
  const span = spanBetween(late, early, sTempo);
  close(span.from, 0.02); close(span.to, 0.2);
  assert.deepEqual([span.fromBar, span.toBar, span.laneId], [null, null, null], 'seconds only, no shared lane');
});

test('a span runs forward and keeps a shared lane only', () => {
  const a = hitTimeline(layout, view, tempo, 700, 120);
  const b = hitTimeline(layout, view, tempo, 450, 120);
  assert.deepEqual(spanBetween(a, b, tempo), { from: 9, to: 14, fromBar: 5, toBar: 8, laneId: 'brass' });
  const c = hitTimeline(layout, view, tempo, 50, 80);
  assert.equal(spanBetween(a, c, tempo).laneId, null);
});
