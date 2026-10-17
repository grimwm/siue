// The guide's parts for every view of both fixtures: their text, a spot on
// the drawing (clamped to it), a clip inside the piece at most 4 s long or a
// built-in demo; parts with nothing to show are left out; the seen flags.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ALWAYS_SEEN, CLIP_MAX, GUIDE_KEY_PREFIX, guideParts, guideStore, pieceClip } from '../src/guide.ts';
import type { GuideInput, GuidePart } from '../src/guide.ts';
import { AXIS_H } from '../src/axis.ts';
import { layoutTimeline } from '../src/timeline.ts';
import { ROLL_H } from '../src/pianoroll.ts';
import { PICTURE_H } from '../src/spectro.ts';
import { tabsFor } from '../src/tabs.ts';
import { tempoMap } from '../src/tempo.ts';
import { boundsFor, fitView, zoomAt } from '../src/zoom.ts';
import type { Score } from '../src/score.ts';
import { memoryStorage, throwingStorage } from '../../_kit/test/record.ts';

const read = (name: string): Score => JSON.parse(readFileSync(new URL(`./fixtures/${name}`, import.meta.url), 'utf8')) as Score;
const crete = read('score-v1.json');
const sound = read('score-sound-v1.json');
const input = (score: Score, tab: GuideInput['tab'], view = fitView(score.duration, 800)): GuideInput => ({ tab, score, tempo: tempoMap(score), view, time: 0 });
const ids = (parts: GuidePart[]) => parts.map(p => p.id);

const drawingHeight = (i: GuideInput): number =>
  i.tab === 'story' ? layoutTimeline(i.score, i.tempo, i.view).height + AXIS_H : i.tab === 'roll' ? ROLL_H + AXIS_H : PICTURE_H + AXIS_H;

const checkParts = (i: GuideInput): void => {
  const parts = guideParts(i);
  assert.ok(parts.length > 0, i.tab);
  for (const p of parts) {
    const at = `${i.score.piece.id} ${i.tab} ${p.id}`;
    assert.ok(p.title && p.what && p.like, `${at}: text`);
    assert.ok(['view', 'lane-picker', 'sheet'].includes(p.spot.anchor), at);
    if (p.spot.rect) {
      const r = p.spot.rect;
      assert.ok(r.w > 0 && r.h > 0, `${at}: a spot with size`);
      assert.ok(r.x >= 0 && r.y >= 0 && r.x + r.w <= i.view.width + 1e-9 && r.y + r.h <= drawingHeight(i) + 1e-9, `${at}: on the drawing ${JSON.stringify(r)}`);
    }
    if (p.clip.kind === 'piece') {
      assert.ok(p.clip.from >= 0 && p.clip.to <= i.score.duration && p.clip.to > p.clip.from, `${at}: inside the piece`);
      assert.ok(p.clip.to - p.clip.from <= CLIP_MAX + 1e-9, `${at}: short`);
    } else assert.ok(['clicks', 'updown', 'swell'].includes(p.clip.id), at);
  }
};

test('every part of every view of both fixtures has text, an on-screen spot and a playable clip', () => {
  for (const s of [crete, sound]) for (const tab of tabsFor(s)) checkParts(input(s, tab));
});

test('the parts, in order, for a music piece', () => {
  assert.deepEqual(ids(guideParts(input(crete, 'story'))), ['sections', 'lanes', 'notes', 'stars', 'energy', 'playhead', 'ruler']);
  assert.deepEqual(ids(guideParts(input(crete, 'roll'))), ['note', 'pitch', 'length', 'colour', 'ruler']);
  assert.deepEqual(ids(guideParts(input(crete, 'sound'))), ['height', 'brightness', 'playhead', 'ruler']);
  assert.deepEqual(ids(guideParts(input(crete, 'sheet'))), ['pick', 'staff', 'higher', 'bars']);
});

test('a sound effect: moments, layers and seconds; no notes, no stars', () => {
  const parts = guideParts(input(sound, 'story'));
  assert.deepEqual(ids(parts), ['sections', 'lanes', 'energy', 'playhead', 'ruler']);
  assert.deepEqual(parts.map(p => p.title).filter(t => /Moments|Layers|Seconds/.test(t)), ['Moments', 'Layers', 'Seconds']);
});

test('a music piece with no motifs has no stars part', () => {
  assert.ok(!ids(guideParts(input({ ...crete, motifs: [] }, 'story'))).includes('stars'));
});

test('a zoomed view keeps every spot on the drawing', () => {
  const view = zoomAt(fitView(16, 800), 700, 8, boundsFor(16, 800));
  checkParts(input(crete, 'story', view));
  checkParts(input(crete, 'roll', view));
});

test('the Story text is the reading guide’s, with no character built in', () => {
  const story = guideParts(input(crete, 'story'));
  assert.equal(story[0]!.what, 'The coloured blocks across the top split the piece into chapters, the way a film has scenes. Each one has a plain name for what is happening in the story.');
  assert.equal(story[6]!.title, 'Bar numbers');
  for (const p of story) assert.doesNotMatch(`${p.what} ${p.like}`, /Ariadne|Minotaur|Daedalus|Athens/);
});

test('pieceClip keeps a clip inside the piece and at most 4 s', () => {
  assert.deepEqual(pieceClip(2, 20, 16), { kind: 'piece', from: 2, to: 6 });
  assert.deepEqual(pieceClip(15, 15, 16), { kind: 'piece', from: 12, to: 16 });
  assert.deepEqual(pieceClip(-1, 0.1, 0.4), { kind: 'piece', from: 0, to: 0.1 });
  assert.deepEqual(pieceClip(0.4, 0.4, 0.4), { kind: 'piece', from: 0, to: 0.4 });
});

test('the seen flags: per view, remembered, and safe with broken storage', () => {
  const storage = memoryStorage();
  const g = guideStore(storage);
  assert.equal(g.seen('story'), false);
  g.markSeen('story');
  assert.equal(g.seen('story'), true);
  assert.equal(g.seen('roll'), false);
  assert.equal(storage.data.get(`${GUIDE_KEY_PREFIX}story`), 'seen');
  assert.equal(guideStore(storage).seen('story'), true, 'the next page view remembers');
  const broken = guideStore(throwingStorage());
  assert.equal(broken.seen('sound'), false);
  broken.markSeen('sound');
  assert.equal(broken.seen('sound'), true, 'held for this page view');
  assert.equal(guideStore(null).seen('sheet'), false);
  assert.equal(ALWAYS_SEEN.seen('story'), true);
});

test('a sound effect’s parts never mention bars or sheet music', () => {
  for (const tab of tabsFor(sound)) for (const p of guideParts(input(sound, tab))) assert.doesNotMatch(`${p.title} ${p.what} ${p.like}`, /\bbars?\b|sheet music/i, `${tab} ${p.id}`);
});
