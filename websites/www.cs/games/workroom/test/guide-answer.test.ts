// The answering parts explain themselves: the energy drawing has its own guide
// and legend, and the Story guide and legend name the owner's notes once some
// are drawn.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { memoryStorage } from '../../_kit/test/record.ts';
import { AXIS_H } from '../src/axis.ts';
import { ENERGY_EDIT_H } from '../src/energy.ts';
import { energyGuideParts, guideParts, guideStore } from '../src/guide.ts';
import type { Score } from '../src/score.ts';
import { energyLegend, legendFor } from '../src/tabs.ts';
import { tempoMap } from '../src/tempo.ts';
import { fitView } from '../src/zoom.ts';

const music = JSON.parse(readFileSync(new URL('./fixtures/score-v1.json', import.meta.url), 'utf8')) as Score;
const sound = JSON.parse(readFileSync(new URL('./fixtures/score-sound-v1.json', import.meta.url), 'utf8')) as Score;

test('the energy drawing has four parts on its own anchors, with clips inside the piece', () => {
  for (const score of [music, sound]) {
    const view = fitView(score.duration, 720);
    const parts = energyGuideParts({ score, tempo: tempoMap(score), view });
    assert.deepEqual(parts.map(p => p.id), ['energy-now', 'energy-draw', 'ruler', 'energy-send']);
    assert.deepEqual(parts.map(p => p.spot.anchor), ['energy-editor', 'energy-editor', 'energy-editor', 'energy-actions']);
    assert.deepEqual(parts[2]!.spot.rect, { x: 0, y: ENERGY_EDIT_H, w: 720, h: AXIS_H }, 'the ruler under the drawing');
    for (const p of parts) {
      if (p.clip.kind === 'piece') assert.ok(p.clip.from >= 0 && p.clip.to <= score.duration && p.clip.to > p.clip.from, `${score.kind} ${p.id}`);
      if (p.spot.rect) assert.ok(p.spot.rect.x >= 0 && p.spot.rect.x + p.spot.rect.w <= 720, p.id);
    }
  }
  assert.match(energyGuideParts({ score: sound, tempo: tempoMap(sound), view: fitView(sound.duration, 720) })[0]!.what, /strong/);
});

test('the Story guide adds "Your notes" only when a note is on screen', () => {
  const view = fitView(16, 800);
  const base = { tab: 'story' as const, score: music, tempo: tempoMap(music), view, time: 0 };
  const plain = guideParts(base).map(p => p.id);
  assert.equal(plain.includes('your-notes'), false);
  const parts = guideParts({ ...base, marks: [{ id: 'a'.repeat(32), n: 1, from: 8, to: 12, lane: 'brass', kind: 'text', draft: 1 }] });
  const notes = parts.find(p => p.id === 'your-notes')!;
  assert.deepEqual(parts.map(p => p.id), [...plain.slice(0, plain.indexOf('energy')), 'your-notes', ...plain.slice(plain.indexOf('energy'))]);
  assert.ok(notes.spot.rect && notes.spot.rect.y <= 112 && notes.spot.rect.y + notes.spot.rect.h >= 148, 'the brass row, padded');
  assert.deepEqual(notes.clip, { kind: 'piece', from: 8, to: 12 });
  const off = guideParts({ ...base, view: { start: 0, pxPerSec: 400, width: 800 }, marks: [{ id: 'a'.repeat(32), n: 1, from: 12, to: 14, lane: null, kind: 'text', draft: 1 }] });
  assert.equal(off.some(p => p.id === 'your-notes'), false, 'a note off screen has no part');
});

test('a moment note plays from its moment', () => {
  const parts = guideParts({ tab: 'story', score: music, tempo: tempoMap(music), view: fitView(16, 800), time: 0, marks: [{ id: 'b'.repeat(32), n: 1, from: 6, to: 6, lane: null, kind: 'hum', draft: 1 }] });
  assert.deepEqual(parts.find(p => p.id === 'your-notes')!.clip, { kind: 'piece', from: 6, to: 10 });
});

test('the energy guide opens once per kind of piece, like the views', () => {
  const storage = memoryStorage();
  const g = guideStore(storage);
  assert.equal(g.seen('energy', 'music'), false);
  g.markSeen('energy', 'music');
  g.markSeen('energy', 'sound');
  assert.equal(storage.getItem('workroom-guide-energy'), 'seen');
  assert.equal(storage.getItem('workroom-guide-sound-energy'), 'seen');
});

test('legends: the owner\'s notes on the Story view, and the energy drawing', () => {
  assert.deepEqual(legendFor('story', music, { notes: true }), [...legendFor('story', music), 'outline = your note']);
  assert.deepEqual(legendFor('roll', music, { notes: true }), legendFor('roll', music), 'only the Story view draws notes');
  assert.deepEqual(energyLegend(music), ['dashed = the energy now', 'green = your shape', 'higher = more intense']);
  assert.deepEqual(energyLegend(sound), ['dashed = the strength now', 'green = your shape', 'higher = stronger']);
});
