// The piano roll's note tools: a box picks the notes it touches; a transpose stops at the keyboard's ends (the whole
// selection moving together); a shift never goes before the piece; a duplicate lands right after on the grid; fix
// timing lines starts up; velocity is kept to 1–127; copy and paste make new notes, and moved notes get regions.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { docWith } from './compose-fixture.ts';
import type { EditDoc } from '../src/compose/doc.ts';
import { fitRegions, regionAt } from '../src/compose/regions.ts';
import { copyNotes, duplicateNotes, fixTiming, notesInBox, pasteNotes, setVelocity, shiftNotes, transposeNotes } from '../src/compose/notetools.ts';

const doc = (): EditDoc => fitRegions(docWith([['piano', [[0, 1, 60], [1, 0.5, 64], [2.1, 1, 67], [6, 2, 120], [9, 1, 3]]]]));
const P = 'piano';
const notes = (d: EditDoc) => d.parts[0]!.notes.map(n => [n.start, n.length, n.pitch]);

test('a box picks every note it touches, drawn either way', () => {
  const d = doc();
  assert.deepEqual(notesInBox(d.parts[0]!.notes, { from: 0.5, to: 2.2, low: 60, high: 66 }), [1, 2], 'a note half inside counts');
  assert.deepEqual(notesInBox(d.parts[0]!.notes, { from: 2.2, to: 0.5, low: 66, high: 60 }), [1, 2]);
  assert.deepEqual(notesInBox(d.parts[0]!.notes, { from: 1.5, to: 2.1, low: 0, high: 127 }), [], 'touching an edge is not inside');
});

test('a transpose moves the selection together and stops at the keyboard\'s ends', () => {
  const d = doc();
  assert.deepEqual(notes(transposeNotes(d, P, new Set([1, 4]), 12)).map(n => n[2]), [67, 64, 67, 127, 3], 'shrunk to 7 so the top note stays on');
  assert.deepEqual(notes(transposeNotes(d, P, new Set([5]), -12)).map(n => n[2]).at(-1), 0);
  const top = transposeNotes(d, P, new Set([4]), 12);
  assert.equal(transposeNotes(top, P, new Set([4]), 12), top, 'already at the top: no change');
  assert.equal(transposeNotes(d, P, new Set(), 2), d);
});

test('a shift never goes before the piece, and the moved notes get a region', () => {
  const d = doc();
  assert.deepEqual(notes(shiftNotes(d, P, new Set([2, 3]), -5)).slice(0, 3).map(n => n[0]), [0, 0, 1.1], 'shortened to −1');
  const far = shiftNotes(d, P, new Set([5]), 8);
  assert.deepEqual(far.parts[0]!.notes.at(-1)!.start, 17);
  assert.ok(far.parts[0]!.regions!.some(r => r.start <= 17 && r.start + r.length > 17));
  assert.equal(shiftNotes(d, P, new Set([1]), -1), d, 'already at the start');
});

test('a duplicate goes right after the notes, rounded up to the step; its ids are new', () => {
  const d = doc();
  const dup = duplicateNotes(d, P, new Set([1, 2]), 1);
  assert.deepEqual(dup.ids, [d.nextId, d.nextId + 1]);
  assert.deepEqual(dup.doc.parts[0]!.notes.filter(n => dup.ids.includes(n.id)).map(n => [n.start, n.pitch]), [[2, 60], [3, 64]], 'span 1.5 → 2 beats on');
  const fine = duplicateNotes(d, P, new Set([1, 2]), 0.25);
  assert.deepEqual(fine.doc.parts[0]!.notes.filter(n => fine.ids.includes(n.id)).map(n => n.start), [1.5, 2.5]);
  assert.equal(dup.doc.nextId, d.nextId + 2);
});

test('fix timing moves starts to the nearest step, the chosen ones or all', () => {
  const d = doc();
  assert.equal(notes(fixTiming(d, P, new Set([3]), 0.5))[2]![0], 2);
  assert.equal(notes(fixTiming(d, P, null, 1))[2]![0], 2);
  assert.equal(notes(fixTiming(d, P, null, 1))[2]![1], 1, 'lengths stay');
  assert.equal(fixTiming(d, P, new Set([1]), 1), d, 'already on the grid');
});

test('velocity is set within 1 to 127', () => {
  const d = doc();
  assert.deepEqual(setVelocity(d, P, new Set([1, 2]), 200).parts[0]!.notes.map(n => n.velocity), [127, 127, 90, 90, 90]);
  assert.equal(setVelocity(d, P, new Set([1]), 0).parts[0]!.notes[0]!.velocity, 1);
  assert.equal(setVelocity(d, P, new Set([1]), 90), d);
});

test('copied notes keep their shape and paste as new notes at the playhead', () => {
  const d = doc();
  assert.equal(copyNotes(d, P, new Set(), false), null);
  const clip = copyNotes(d, P, new Set([2, 3]), false)!;
  assert.deepEqual(clip, { kind: 'notes', drums: false, span: 2.1, notes: [
    { start: 0, length: 0.5, pitch: 64, velocity: 90, motif: null }, { start: 1.1, length: 1, pitch: 67, velocity: 90, motif: null }] });
  const p = pasteNotes(d, P, clip, 12);
  assert.deepEqual(p.doc.parts[0]!.notes.filter(n => p.ids.includes(n.id)).map(n => [n.start, n.pitch]), [[12, 64], [13.1, 67]]);
  assert.ok(p.ids.every(id => id >= d.nextId));
  assert.ok(regionAt(p.doc.parts[0]!, 12) && regionAt(p.doc.parts[0]!, 13.1), 'a region holds them');
});
