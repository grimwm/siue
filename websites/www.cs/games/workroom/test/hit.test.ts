import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { hitTimeline, sectionAt, spanBetween } from '../src/hit.ts';
import { layoutTimeline } from '../src/timeline.ts';
import { tempoMap } from '../src/tempo.ts';
import { boundsFor, fitView, timeToX, zoomAt } from '../src/zoom.ts';
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

test('a tap exactly on a section boundary hits the section that starts there, at any zoom', () => {
  const cases: [Score, string, number][] = [[sound, 'echo', 0.08], [score, 'thread', 8]];
  for (const [piece, want, at] of cases) {
    const t = tempoMap(piece);
    for (const width of [390, 391, 733, 1280]) {
      for (const start of [0, 0.0007, 0.031, 0.05, 0.07, 1.3, 2.9]) {
        for (const k of [1, 1.7, 3.3, 7.1]) {
          const v = { start: Math.min(start, piece.duration / 2), pxPerSec: (width / piece.duration) * k, width };
          const x = timeToX(v, at);
          if (x < 0 || x > width) continue;
          const hit = hitTimeline(layoutTimeline(piece, t, v), v, t, x, 90);
          assert.equal(hit.sectionId, want, `${piece.piece.id} width ${width}, start ${v.start}, zoom ${k}: time ${hit.time}`);
        }
      }
    }
  }
});

test('sectionAt: the section under a time; a boundary belongs to the later section; a gap has none', () => {
  assert.equal(sectionAt(score, tempo, 8)?.id, 'thread');
  assert.equal(sectionAt(score, tempo, 8 - 1e-12)?.id, 'thread', 'a hair before the boundary is on it');
  assert.equal(sectionAt(score, tempo, 7.9)?.id, 'stirs');
  assert.equal(sectionAt(score, tempo, 0)?.id, 'stirs');
  assert.equal(sectionAt(score, tempo, 16)?.id, 'thread', 'the end of the piece is in the last section');
  const sTempo = tempoMap(sound);
  assert.equal(sectionAt(sound, sTempo, 0.07999999999999999)?.id, 'echo');
  const gappy: Score = { ...sound, sections: [{ ...sound.sections[0]!, to: 0.05 }, sound.sections[1]!] };
  assert.equal(sectionAt(gappy, tempoMap(gappy), 0.06), null, 'between two moments');
  assert.equal(sectionAt(gappy, tempoMap(gappy), 0.05)?.id, 'blast', 'the end of a moment is still in it');
  assert.equal(sectionAt({ ...sound, sections: [] }, sTempo, 0.1), null);
});
