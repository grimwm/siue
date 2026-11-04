// Regions: fitted to a part's notes (and left alone when they already cover them), split, joined, moved within a part
// and to another (clearing what was there), duplicated into the next free bar, copied and pasted, looped and unlooped,
// deleted; a looped region's repeats are heard and saved as notes but never stored.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { docWith } from './compose-fixture.ts';
import type { EditDoc, Part, Region } from '../src/compose/doc.ts';
import { newVocalPart } from '../src/compose/vocal.ts';
import {
  copyRegion, deleteRegion, duplicateRegion, expandLoops, fitRegions, heardNotes, joinRegion, loopRegion, moveRegion,
  pasteRegion, regionAt, splitRegion,
} from '../src/compose/regions.ts';

/** A part's regions without their ids. */
const spans = (d: EditDoc, part = 0): Omit<Region, 'id'>[] => (d.parts[part]!.regions ?? []).map(({ id: _, ...r }) => r);
const starts = (p: Part): number[] => p.notes.map(n => n.start);
const piano = (notes: [number, number, number][]): EditDoc => fitRegions(docWith([['piano', notes]]));

test('fitting regions makes one over each run of bars that hold notes, and leaves a fitted part alone', () => {
  const d = piano([[0, 1, 60], [5, 1, 62], [13, 1, 64]]);
  assert.deepEqual(spans(d), [{ start: 0, length: 8 }, { start: 12, length: 4 }]);
  assert.equal(fitRegions(d), d, 'nothing to change: the same document');
  const ids = d.parts[0]!.regions!.map(r => r.id);
  assert.ok(ids.every(id => id >= 4), 'region ids come from nextId, after the notes');
});

test('a note outside every region extends the region before, else the one after, else gets its own bar', () => {
  let d = piano([[0, 1, 60], [13, 1, 64]]);
  d = { ...d, parts: d.parts.map(p => ({ ...p, notes: [...p.notes, { id: 50, start: 9, length: 1, pitch: 61, velocity: 90, motif: null }] })) };
  assert.deepEqual(spans(fitRegions(d)), [{ start: 0, length: 4 }, { start: 8, length: 8 }], 'bar 3 joins the region that starts where it ends');
  const after = { ...d, parts: d.parts.map(p => ({ ...p, regions: [{ id: 90, start: 6, length: 2 }], notes: [{ id: 1, start: 4.5, length: 1, pitch: 60, velocity: 90, motif: null }, { id: 2, start: 6, length: 1, pitch: 60, velocity: 90, motif: null }] })) };
  assert.deepEqual(spans(fitRegions(after)), [{ start: 4, length: 4 }], 'the region after starts in the note\'s bar: it reaches back to the bar line');
  const alone = { ...d, parts: d.parts.map(p => ({ ...p, regions: [{ id: 90, start: 0, length: 2 }, { id: 91, start: 14, length: 2 }], notes: [{ id: 1, start: 9, length: 1, pitch: 60, velocity: 90, motif: null }] })) };
  assert.deepEqual(spans(fitRegions(alone)), [{ start: 0, length: 2 }, { start: 8, length: 4 }, { start: 14, length: 2 }], 'empty regions are kept; the note gets its bar');
  const tight = { ...d, parts: d.parts.map(p => ({ ...p, regions: [{ id: 90, start: 0, length: 2 }, { id: 91, start: 6, length: 2, loop: 1 }], notes: [{ id: 1, start: 3, length: 1, pitch: 60, velocity: 90, motif: null }] })) };
  assert.deepEqual(spans(fitRegions(tight)), [{ start: 0, length: 4 }, { start: 6, length: 2, loop: 1 }], 'never over a neighbour');
});

test('a note dropped in a loop\'s repeat moves into the first stretch; a vocal part has no regions', () => {
  let d = loopRegion(piano([[0, 1, 60]]), 'piano', piano([[0, 1, 60]]).parts[0]!.regions![0]!.id, 16);
  d = { ...d, parts: d.parts.map(p => ({ ...p, notes: [...p.notes, { id: 70, start: 9.5, length: 0.5, pitch: 67, velocity: 90, motif: null }, { id: 71, start: 12, length: 1, pitch: 60, velocity: 90, motif: null }] })) };
  const fitted = fitRegions(d);
  assert.deepEqual(starts(fitted.parts[0]!), [0, 1.5], 'into the first stretch; a copy of a note already there goes');
  const v = fitRegions({ ...d, parts: [...d.parts, { ...newVocalPart('voice', 'Voice', '#123456'), regions: [{ id: 99, start: 0, length: 4 }] }] });
  assert.equal(v.parts[1]!.regions, undefined);
});

test('a looped region\'s repeats are heard as ghosts and saved as plain notes, cut off at its end', () => {
  const d0 = piano([[0, 1, 60], [3, 2, 64]]);
  const d = loopRegion(d0, 'piano', d0.parts[0]!.regions![0]!.id, 10);
  assert.deepEqual(spans(d), [{ start: 0, length: 10, loop: 4 }]);
  const heard = heardNotes(d.parts[0]!);
  assert.deepEqual(heard.map(n => [n.start, n.length, n.ghost ?? false]), [[0, 1, false], [3, 2, false], [4, 1, true], [7, 2, true], [8, 1, true]]);
  assert.deepEqual(expandLoops(d.parts[0]!).map(n => [n.start, n.length]), [[0, 1], [3, 2], [4, 1], [7, 2], [8, 1]]);
  assert.ok(expandLoops(d.parts[0]!).every(n => !('ghost' in n)));
  assert.equal(d.parts[0]!.notes.length, 2, 'only the first stretch is stored');
  assert.deepEqual(regionAt(d.parts[0]!, 9.5)?.id, d.parts[0]!.regions![0]!.id);
  assert.equal(regionAt(d.parts[0]!, 10), null);
});

test('looping stops at the next region and grows the piece; a loop back to the first stretch unloops', () => {
  const d0 = piano([[0, 1, 60], [13, 1, 64]]);
  const [a] = d0.parts[0]!.regions!;
  assert.deepEqual(spans(loopRegion(d0, 'piano', a!.id, 40)), [{ start: 0, length: 12, loop: 4 }, { start: 12, length: 4 }]);
  const d1 = piano([[0, 1, 60]]);
  const long = loopRegion(d1, 'piano', d1.parts[0]!.regions![0]!.id, 24);
  assert.equal(long.bars, 6, 'looped past the end, the piece grows');
  const back = loopRegion(long, 'piano', d1.parts[0]!.regions![0]!.id, 2);
  assert.deepEqual(spans(back), [{ start: 0, length: 4 }]);
});

test('a split cuts a region in two (a loop becomes real notes first); a join makes one of two and the gap', () => {
  const d0 = piano([[0, 1, 60], [5, 1, 62]]);
  const r = d0.parts[0]!.regions![0]!;
  assert.equal(splitRegion(d0, 'piano', r.id, 0), null, 'not at its edge');
  assert.equal(splitRegion(d0, 'piano', r.id, 8), null);
  const s = splitRegion(d0, 'piano', r.id, 4)!;
  assert.deepEqual(spans(s.doc), [{ start: 0, length: 4 }, { start: 4, length: 4 }]);
  assert.equal(s.doc.parts[0]!.regions![1]!.id, s.id);
  assert.equal(s.doc.nextId, d0.nextId + 1);
  const looped = loopRegion(piano([[1, 1, 60]]), 'piano', piano([[1, 1, 60]]).parts[0]!.regions![0]!.id, 12);
  const s2 = splitRegion(looped, 'piano', looped.parts[0]!.regions![0]!.id, 6)!;
  assert.deepEqual(spans(s2.doc), [{ start: 0, length: 6 }, { start: 6, length: 6 }]);
  assert.deepEqual(starts(s2.doc.parts[0]!), [1, 5, 9], 'every repeat is a real note now');
  const gap = piano([[0, 1, 60], [13, 1, 64]]);
  const j = joinRegion(gap, 'piano', gap.parts[0]!.regions![1]!.id)!;
  assert.deepEqual(spans(j), [{ start: 0, length: 16 }], 'the last joins the one before');
  assert.equal(joinRegion(piano([[0, 1, 60]]), 'piano', piano([[0, 1, 60]]).parts[0]!.regions![0]!.id), null, 'nothing to join with');
});

test('a region moves with its notes, clearing the span it lands on; within a part and to another', () => {
  let d = fitRegions(docWith([['piano', [[0, 1, 60], [1, 1, 62], [7, 1, 64], [9, 1, 65]]], ['cello', [[12, 1, 40]]]]));
  // Make the piano's regions [0,4) and [6,12).
  const pid = d.parts[0]!.id;
  d = { ...d, parts: d.parts.map(p => (p.id === pid ? { ...p, regions: [{ id: 100, start: 0, length: 4 }, { id: 101, start: 6, length: 6 }] } : p)) };
  const ids = d.parts[0]!.notes.slice(0, 2).map(n => n.id);
  const m = moveRegion(d, pid, 100, pid, 8);
  assert.deepEqual(spans(m), [{ start: 6, length: 2 }, { start: 8, length: 4 }], 'the region it lands on is cut at the edge');
  assert.deepEqual(m.parts[0]!.notes.map(n => [n.start, n.pitch]), [[7, 64], [8, 60], [9, 62]], 'the note inside the span goes');
  assert.deepEqual(m.parts[0]!.notes.filter(n => n.pitch === 60 || n.pitch === 62).map(n => n.id), ids, 'moved notes keep their ids');
  const cid = d.parts[1]!.id;
  const across = moveRegion(d, pid, 100, cid, 13);
  assert.deepEqual(spans(across, 0), [{ start: 6, length: 6 }]);
  assert.deepEqual(spans(across, 1), [{ start: 12, length: 1 }, { start: 13, length: 4 }], 'the cello\'s region is cut where the new one starts');
  assert.deepEqual(across.parts[1]!.notes.map(n => n.start), [12, 13, 14]);
  assert.equal(across.bars, 5, 'the piece grows to hold it');
  assert.equal(moveRegion(d, pid, 100, pid, 0), d, 'no move, no change');
  const cover = moveRegion(d, pid, 100, pid, 7);
  assert.deepEqual(spans(cover), [{ start: 6, length: 1 }, { start: 7, length: 4 }, { start: 11, length: 1 }], 'a region over both edges is cut on each side');
});

test('a duplicate goes to the next free bar line after the region; copy and paste make new notes', () => {
  const d = piano([[0, 1, 60], [2, 1, 62], [8, 1, 64]]);
  const first = d.parts[0]!.regions![0]!;
  const dup = duplicateRegion(d, 'piano', first.id);
  assert.deepEqual(spans(dup.doc), [{ start: 0, length: 4 }, { start: 4, length: 4 }, { start: 8, length: 4 }]);
  assert.deepEqual(dup.doc.parts[0]!.notes.map(n => n.start), [0, 2, 4, 6, 8]);
  const again = duplicateRegion(dup.doc, 'piano', first.id);
  assert.equal(again.doc.parts[0]!.regions!.find(r => r.id === again.id)!.start, 12, 'past the regions in the way');
  const clip = copyRegion(d, 'piano', first.id, false);
  assert.deepEqual(clip, { kind: 'region', drums: false, length: 4, notes: [
    { start: 0, length: 1, pitch: 60, velocity: 90, motif: null }, { start: 2, length: 1, pitch: 62, velocity: 90, motif: null }] });
  const pasted = pasteRegion(d, 'piano', clip, 16);
  assert.deepEqual(spans(pasted.doc).at(-1), { start: 16, length: 4 });
  assert.equal(pasted.doc.bars, 5);
  const fresh = pasted.doc.parts[0]!.notes.filter(n => n.start >= 16);
  assert.ok(fresh.every(n => n.id >= d.nextId), 'pasted notes are new');
  const looped = loopRegion(d, 'piano', first.id, 8);
  assert.equal(copyRegion(looped, 'piano', first.id, true).loop, 4, 'a loop is copied with its region');
});

test('deleting a region takes its notes', () => {
  const d = piano([[0, 1, 60], [13, 1, 64]]);
  const gone = deleteRegion(d, 'piano', d.parts[0]!.regions![0]!.id);
  assert.deepEqual(spans(gone), [{ start: 12, length: 4 }]);
  assert.deepEqual(starts(gone.parts[0]!), [13]);
});
