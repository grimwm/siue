// The history: newest first, waiting or picked up, counts per piece, a note that
// cannot be opened named and kept (never hidden, never failing the list), and
// the marks the Story view draws for this piece's notes.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DownloadFailed, PROBLEMS, downloadProblem, answeredBy, buildHistory, forPiece, timelineMarks, waitingByPiece } from '../src/history.ts';
import type { OpenOutcome } from '../src/history.ts';
import { NoteUnreadable, type Opened } from '../src/seal.ts';
import type { NoteBody } from '../src/note.ts';

const body = (piece: string, extra: Partial<NoteBody> = {}): NoteBody => ({ v: 1, kind: 'text', piece, draft: 1, from: 2, to: 4, fromBar: 2, toBar: 3, lane: 'brass', text: 't', reaction: null, curve: null, audio: null, made: '2026-10-20T00:00:00Z', ...extra });
const opened = (piece: string, extra: Partial<NoteBody> = {}): Opened => ({ fingerprint: 'ab'.repeat(32), body: body(piece, extra), audio: null });
const id = (c: string) => c.repeat(32);
const server = [
  { id: id('a'), size: 1, arrived_at: 1, picked_up_at: null },
  { id: id('b'), size: 1, arrived_at: 2, picked_up_at: 5 },
  { id: id('c'), size: 1, arrived_at: 3, picked_up_at: null },
  { id: id('d'), size: 1, arrived_at: 4, picked_up_at: null },
  { id: id('e'), size: 1, arrived_at: 5, picked_up_at: null },
];
const outcomes = new Map<string, OpenOutcome>([
  [id('a'), opened('ch1')], [id('b'), opened('ch1', { from: 6, to: 6, fromBar: 4, toBar: 4, lane: null, kind: 'hum', text: null, audio: { mime: 'audio/mp4', seconds: 2 } })],
  [id('c'), new NoteUnreadable('tampered')], [id('d'), new DownloadFailed('the server answered with an error (500)')], [id('e'), opened('other')],
]);

test('newest first, waiting or picked up, problems named', () => {
  const items = buildHistory(server, outcomes);
  assert.deepEqual(items.map(i => [i.id[0], i.state]), [['e', 'waiting'], ['d', 'waiting'], ['c', 'waiting'], ['b', 'picked-up'], ['a', 'waiting']]);
  assert.equal(items[2]!.problem, PROBLEMS.tampered);
  assert.equal(items[1]!.problem, downloadProblem('the server answered with an error (500)'));
  assert.match(items[1]!.problem!, /500/);
  assert.equal(items[0]!.problem, null);
  assert.equal(items[3]!.pickedUp, 5);
  assert.equal(buildHistory(server, new Map())[0]!.problem, null, 'not opened yet is not a problem');
});

test('waiting counts per piece; this piece lists its notes and every note that could not be opened', () => {
  const items = buildHistory(server, outcomes);
  assert.deepEqual([...waitingByPiece(items)].sort(), [['ch1', 1], ['other', 1]]);
  assert.deepEqual(forPiece(items, 'ch1').map(i => i.id[0]), ['d', 'c', 'b', 'a']);
});

test('timeline marks: this piece only, oldest first, numbered, energy left out, times inside the piece', () => {
  const extra = { id: id('f'), size: 1, arrived_at: 6, picked_up_at: null };
  const more = new Map(outcomes);
  more.set(id('f'), opened('ch1', { kind: 'energy', text: null, from: 0, to: 16, fromBar: 1, toBar: 8, lane: null, curve: [[0, 0], [16, 1]] }));
  const marks = timelineMarks(buildHistory([...server, extra], more), 'ch1', 5);
  assert.deepEqual(marks, [
    { id: id('a'), n: 1, from: 2, to: 4, lane: 'brass', kind: 'text', draft: 1 },
    { id: id('b'), n: 2, from: 5, to: 5, lane: null, kind: 'hum', draft: 1 },
  ]);
});

test('the changes that answer a note', () => {
  const changes = [{ from_bar: 1, to_bar: 2, lane: null, text: 'x', answers: [id('a')] }, { from_bar: 3, to_bar: 4, lane: null, text: 'y', answers: [id('b'), id('a')] }];
  assert.deepEqual(answeredBy(changes, id('a')), [0, 1]);
  assert.deepEqual(answeredBy(changes, id('c')), []);
});
