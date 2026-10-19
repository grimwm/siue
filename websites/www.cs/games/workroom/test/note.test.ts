// The shape every opened note must have before the page shows it: ids, times
// in order, bars together, the limits, and what each kind must carry.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MAX_CURVE_POINTS, MAX_TEXT, isNoteBody } from '../src/note.ts';
import type { NoteBody } from '../src/note.ts';
import { NoteUnreadable, open, seal } from '../src/seal.ts';
import { current, fx, importPrivate } from './fixture-key.ts';

const ok: NoteBody = {
  v: 1, kind: 'text', piece: 'test-piece', draft: 2, from: 8, to: 12, fromBar: 5, toBar: 6, lane: 'brass',
  text: 'louder here', reaction: null, curve: null, audio: null, made: '2026-10-20T14:03:11.000Z',
};

test('a well-formed note of each kind passes', () => {
  const good: NoteBody[] = [
    ok,
    { ...ok, kind: 'speech', text: null, audio: { mime: 'audio/mp4', seconds: 12.5 } },
    { ...ok, kind: 'hum', text: null, from: 3, to: 3, fromBar: 2, toBar: 2, lane: null, audio: { mime: 'audio/webm;codecs=opus', seconds: 60 } },
    { ...ok, kind: 'react', text: null, reaction: 'love-it' },
    { ...ok, kind: 'energy', text: null, from: 0, to: 16, fromBar: 1, toBar: 8, lane: null, curve: [[0, 0], [8, 1], [16, 0.5]] },
    { ...ok, piece: 'cannon-fire', from: 0.02, to: 0.2, fromBar: null, toBar: null, lane: 'boom' },
    { ...ok, made: '2026-10-20T14:03:11Z' },
  ];
  for (const b of good) assert.equal(isNoteBody(b), true, JSON.stringify(b));
});

test('a body out of shape is refused', () => {
  const bad: unknown[] = [
    null, [], 'note', { ...ok, v: 2 }, { ...ok, kind: 'shout' },
    { ...ok, piece: 'Bad Piece' }, { ...ok, piece: '../x' }, { ...ok, draft: 0 }, { ...ok, draft: 1.5 },
    { ...ok, from: -1 }, { ...ok, from: 5, to: 4 }, { ...ok, to: Infinity },
    { ...ok, fromBar: 1, toBar: null }, { ...ok, fromBar: 0, toBar: 1 }, { ...ok, fromBar: 6, toBar: 5 }, { ...ok, fromBar: 1.5 },
    { ...ok, lane: 'Brass!' }, { ...ok, text: 'x'.repeat(MAX_TEXT + 1) }, { ...ok, text: '   ' }, { ...ok, text: null },
    { ...ok, kind: 'hum', audio: null }, { ...ok, kind: 'speech', audio: { mime: 'audio/mp4', seconds: 0 } },
    { ...ok, kind: 'hum', audio: { mime: 'audio/mp4', seconds: 60.5 } }, { ...ok, kind: 'hum', audio: { mime: 'x'.repeat(101), seconds: 1 } },
    { ...ok, kind: 'react', reaction: null }, { ...ok, reaction: 'meh' },
    { ...ok, kind: 'energy', curve: [[0, 0.5]] }, { ...ok, kind: 'energy', curve: [[0, 1.5], [1, 0]] }, { ...ok, kind: 'energy', curve: [[-1, 0.5], [1, 0]] },
    { ...ok, kind: 'energy', curve: Array.from({ length: MAX_CURVE_POINTS + 1 }, (_, i) => [i, 0]) },
    { ...ok, made: '2026-10-20 14:03' }, { ...ok, made: null }, { ...ok, made: '2026-13-45T99:99:99Z' },
    { ...ok, kind: 'energy', curve: [[4, 0.5], [2, 0.1]] }, { ...ok, kind: 'energy', to: 12, curve: [[0, 0.5], [13, 0.1]] },
  ];
  for (const b of bad) assert.equal(isNoteBody(b), false, JSON.stringify(b)?.slice(0, 120));
});

test('opening a sealed note refuses a malformed body', async () => {
  const keyring = new Map([[fx.fingerprint, await importPrivate(fx.pkcs8)]]);
  const bad = { ...ok, made: '2026-13-45T99:99:99Z' };
  await assert.rejects(open(await seal(bad, null, current), keyring), (e: unknown) => e instanceof NoteUnreadable && e.reason === 'tampered');
  assert.deepEqual((await open(await seal(ok, null, current), keyring)).body, ok);
});
