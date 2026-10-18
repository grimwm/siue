// Building notes: each is tied to its piece, draft and moment; music notes carry
// bars and seconds, sound notes seconds only; the limits are refused in plain words.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { NoteEmpty, NoteTooLong, REACTIONS, energyNote, humNote, reactNote, recordClock, resampleCurve, spanLabel, speechNote, textNote, wholePiece } from '../src/answer.ts';
import { MAX_CURVE_POINTS, REACTION_IDS, isNoteBody } from '../src/note.ts';
import { tempoMap } from '../src/tempo.ts';
import type { Score } from '../src/score.ts';

const score = JSON.parse(readFileSync(new URL('./fixtures/score-v1.json', import.meta.url), 'utf8')) as Score;
const sound = JSON.parse(readFileSync(new URL('./fixtures/score-sound-v1.json', import.meta.url), 'utf8')) as Score;
const ctx = { piece: 'test-piece', draft: 1, now: () => new Date('2026-10-20T14:03:11.000Z') };

test('a typed note is tied to its span and draft, trimmed, and passes the shape check', () => {
  const n = textNote(ctx, { from: 9, to: 14, fromBar: 5, toBar: 8, laneId: 'brass' }, '  more horns  ');
  assert.deepEqual(n, {
    v: 1, kind: 'text', piece: 'test-piece', draft: 1, from: 9, to: 14, fromBar: 5, toBar: 8, lane: 'brass',
    text: 'more horns', reaction: null, curve: null, audio: null, made: '2026-10-20T14:03:11.000Z',
  });
  assert.equal(isNoteBody(n), true);
  assert.throws(() => textNote(ctx, { from: 0, to: 1, fromBar: 1, toBar: 1, laneId: null }, '   '), (e: unknown) => e instanceof NoteEmpty && /Type a note first/.test(e.message));
  assert.throws(() => textNote(ctx, { from: 0, to: 1, fromBar: 1, toBar: 1, laneId: null }, 'x'.repeat(4001)), (e: unknown) => e instanceof NoteTooLong && /4,000 characters/.test(e.message));
});

test('a spoken note and a hum carry their recording; over 60 seconds or empty is refused', () => {
  const s = speechNote(ctx, { from: 2, to: 4, fromBar: 2, toBar: 3, laneId: null }, { mime: 'audio/mp4', seconds: 7.25 });
  assert.deepEqual([s.kind, s.from, s.to, s.text, s.audio], ['speech', 2, 4, null, { mime: 'audio/mp4', seconds: 7.25 }]);
  const h = humNote(ctx, { time: 2, bar: 2, laneId: 'brass' }, { mime: 'audio/mp4', seconds: 60 });
  assert.deepEqual([h.kind, h.from, h.to, h.fromBar, h.toBar, h.lane], ['hum', 2, 2, 2, 2, 'brass']);
  assert.throws(() => humNote(ctx, { time: 2, bar: 2, laneId: null }, { mime: 'audio/mp4', seconds: 60.5 }), NoteTooLong);
  assert.throws(() => humNote(ctx, { time: 2, bar: 2, laneId: null }, { mime: 'audio/mp4', seconds: 0 }), NoteEmpty);
  assert.equal(isNoteBody(s) && isNoteBody(h), true);
});

test('a reaction covers its section; the last section ends at the end of the piece', () => {
  const n = reactNote(ctx, score.sections[1]!, tempoMap(score), score.duration, 'more-epic');
  assert.deepEqual([n.kind, n.from, n.to, n.fromBar, n.toBar, n.reaction, n.lane], ['react', 8, 16, 5, 8, 'more-epic', null]);
  assert.deepEqual(REACTIONS.map(r => r.id), [...REACTION_IDS]);
  assert.deepEqual(REACTIONS.map(r => r.label), ['More epic', 'Calmer', 'Darker', 'Brighter', 'Longer', 'Shorter', 'Love it', 'Not this']);
});

test('a redrawn energy curve covers the whole piece; a long one is resampled to 512 points, never refused', () => {
  const n = energyNote(ctx, [[0, 0.1], [16, 1]], 16, 8);
  assert.deepEqual([n.kind, n.from, n.to, n.fromBar, n.toBar, n.curve], ['energy', 0, 16, 1, 8, [[0, 0.1], [16, 1]]]);
  const ramp = Array.from({ length: 3001 }, (_, i): [number, number] => [(i * 16) / 3000, i / 3000]);
  const long = energyNote(ctx, ramp, 16, 8);
  assert.equal(long.curve!.length, MAX_CURVE_POINTS);
  assert.deepEqual([long.curve![0], long.curve!.at(-1)], [[0, 0], [16, 1]], 'the ends stay where they were');
  assert.ok(long.curve!.every(([t, v], i, all) => (i === 0 || t > all[i - 1]![0]) && Math.abs(v - t / 16) < 1e-9), 'in time order, following the ramp');
  assert.equal(isNoteBody(long), true);
  const noisy = Array.from({ length: 2000 }, (_, i): [number, number] => [(i * 8) / 1999, i % 2]);
  const thin = resampleCurve(noisy);
  assert.equal(thin.length, MAX_CURVE_POINTS);
  assert.ok(thin.every(([, v]) => v >= 0 && v <= 1));
  assert.deepEqual(resampleCurve([[2, 0.5], [0, 0.1], [1, 0.2]]), [[0, 0.1], [1, 0.2], [2, 0.5]], 'a short curve is only put in time order');
  assert.equal(resampleCurve(Array.from({ length: 600 }, (_, i): [number, number] => [i, 0.5]), 100).length, 100);
});

test('notes on a sound effect carry seconds only', () => {
  const sctx = { ...ctx, piece: 'cannon-fire' };
  const text = textNote(sctx, { from: 0.02, to: 0.2, fromBar: null, toBar: null, laneId: 'boom' }, 'a sharper attack');
  assert.deepEqual([text.from, text.to, text.fromBar, text.toBar, text.lane], [0.02, 0.2, null, null, 'boom']);
  const echo = reactNote(sctx, sound.sections[1]!, tempoMap(sound), sound.duration, 'calmer');
  assert.deepEqual([echo.from, echo.to, echo.fromBar, echo.toBar], [0.08, 0.4, null, null]);
  const whole = reactNote(sctx, wholePiece(sound), tempoMap(sound), sound.duration, 'love-it');
  assert.deepEqual([whole.from, whole.to, whole.fromBar, whole.toBar], [0, 0.4, null, null], 'a sound may react to the whole piece');
  assert.deepEqual([wholePiece(score).from_bar, wholePiece(score).to_bar, wholePiece(score).name], [1, 8, 'The whole piece']);
  const energy = energyNote(sctx, [[0, 1], [0.4, 0]], sound.duration, sound.bars ?? null);
  assert.deepEqual([energy.from, energy.to, energy.fromBar, energy.toBar], [0, 0.4, null, null]);
});

test('labels say where a note sits in the words the piece is counted in', () => {
  assert.equal(spanLabel({ from: 8, to: 13.6, fromBar: 5, toBar: 7 }), 'Bars 5–7 · 8 s – 13.6 s');
  assert.equal(spanLabel({ from: 8, to: 9, fromBar: 5, toBar: 5 }), 'Bar 5 · 8 s – 9 s');
  assert.equal(spanLabel({ from: 8, to: 8, fromBar: 5, toBar: 5 }), 'Bar 5 · 8 s');
  assert.equal(spanLabel({ from: 0.02, to: 0.2, fromBar: null, toBar: null }), '20 ms – 200 ms');
  assert.equal(spanLabel({ from: 0.08, to: 0.08, fromBar: null, toBar: null }), '80 ms');
  assert.deepEqual([recordClock(0), recordClock(7.9), recordClock(60)], ['0:00', '0:07', '1:00']);
});

test('every builder yields a body the shape check accepts, and energy refuses what it cannot make', () => {
  const t = tempoMap(score);
  const ok = (n: unknown) => assert.equal(isNoteBody(n), true, JSON.stringify(n)?.slice(0, 160));
  ok(reactNote(ctx, score.sections[0]!, t, score.duration, 'calmer'));
  ok(reactNote(ctx, wholePiece(score), t, score.duration, 'love-it'));
  ok(reactNote({ ...ctx, piece: 'cannon-fire' }, wholePiece(sound), tempoMap(sound), sound.duration, 'love-it'));
  ok(energyNote(ctx, [[0, 0.1], [16, 1]], 16, 8));
  ok(energyNote({ ...ctx, piece: 'cannon-fire' }, [[0, 1], [0.4, 0]], 0.4, null));
  const messy = energyNote(ctx, [[8, 3], [0, -1], [4, Number.NaN], [16, 0.5]], 16, 8);
  assert.deepEqual(messy.curve, [[0, 0], [8, 1], [16, 0.5]], 'clamped, sorted, non-finite dropped');
  ok(messy);
  assert.throws(() => energyNote(ctx, [], 16, 8), NoteEmpty);
  assert.throws(() => energyNote(ctx, [[1, 0.5], [2, Number.NaN]], 16, 8), NoteEmpty);
  assert.throws(() => humNote(ctx, { time: 1, bar: 1, laneId: null }, { mime: '', seconds: 3 }), NoteEmpty);
  assert.deepEqual(resampleCurve([[0, 0], [1, 1], [2, 0]], 1), [[0, 0]]);
});
