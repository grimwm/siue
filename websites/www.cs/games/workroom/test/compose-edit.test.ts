// The editor's edits and their history: parts named and limited as the score is, notes never moved unless the person
// asks, Move Them Into Range by whole octaves only, and Undo/Redo over every one of them.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { catalogue, rangeClass } from '../src/catalogue.ts';
import { newDoc } from '../src/compose/doc.ts';
import { addNotes, addPart, clearPart, intoRange, MAX_PARTS, moveIntoRange, moveNote, removeNotes, removePart, renamePart, setInstrument } from '../src/compose/edit.ts';
import { createHistory } from '../src/compose/history.ts';
import type { Library } from '../src/render/plan.ts';

const ENTRIES = catalogue(JSON.parse(readFileSync(join(import.meta.dirname, '..', '..', '..', 'music', 'library', 'library.json'), 'utf8')) as Library);
const entry = (id: string) => ENTRIES.find(e => e.id === id)!;

test('history: undo and redo step through every pushed document; a push drops the redo', () => {
  const h = createHistory('a');
  h.push('b');
  h.push('c');
  assert.deepEqual([h.undoCount(), h.redoCount()], [2, 0]);
  assert.equal(h.undo(), 'b');
  assert.equal(h.undo(), 'a');
  assert.equal(h.undo(), 'a', 'nothing more to undo');
  assert.equal(h.redo(), 'b');
  h.push('d');
  assert.deepEqual([h.now(), h.undoCount(), h.redoCount()], ['d', 2, 0]);
  h.push('d');
  assert.equal(h.undoCount(), 2, 'the same document is no edit');
});

test('parts are named for their instrument and numbered when taken; sixteen at most', () => {
  let doc = newDoc('T');
  doc = addPart(doc, entry('cello'))!.doc;
  const second = addPart(doc, entry('cello'))!;
  assert.deepEqual(second.doc.parts.map(p => [p.id, p.name, p.family]), [['cello', 'Cello', 'strings'], ['cello-2', 'Cello 2', 'strings']]);
  doc = second.doc;
  while (doc.parts.length < MAX_PARTS) doc = addPart(doc, entry('flute'))!.doc;
  assert.equal(addPart(doc, entry('flute')), null);
  assert.equal(new Set(doc.parts.map(p => p.id)).size, MAX_PARTS, 'every id is its own');
  assert.equal(addPart(newDoc('T'), entry('harp'))!.doc.parts[0]!.family, 'harp');
  assert.equal(addPart(newDoc('T'), entry('kit'))!.doc.parts[0]!.family, 'percussion');
});

test('notes: a chord is added at one start; move, remove and clear touch only that part', () => {
  let doc = addPart(addPart(newDoc('T'), entry('cello'))!.doc, entry('violin'))!.doc;
  const added = addNotes(doc, 'cello', [{ start: 0, length: 1, pitch: 48 }, { start: 0, length: 1, pitch: 52 }, { start: 0, length: 1, pitch: 55 }]);
  doc = added.doc;
  assert.equal(added.ids.length, 3);
  assert.deepEqual(doc.parts[0]!.notes.map(n => [n.start, n.pitch, n.velocity]), [[0, 48, 90], [0, 52, 90], [0, 55, 90]]);
  const violin = doc.parts[1];
  doc = moveNote(doc, 'cello', added.ids[0]!, 2, 50);
  assert.equal(doc.parts[1], violin, 'the other part is shared, not copied');
  assert.deepEqual(doc.parts[0]!.notes.map(n => [n.start, n.pitch]), [[0, 52], [0, 55], [2, 50]]);
  doc = removeNotes(doc, 'cello', new Set([added.ids[1]!]));
  assert.equal(doc.parts[0]!.notes.length, 2);
  const h = createHistory(doc);
  h.push(clearPart(doc, 'cello'));
  assert.equal(h.now().parts[0]!.notes.length, 0);
  assert.equal(h.undo().parts[0]!.notes.length, 2, 'Clear can be undone');
});

test('a note outside the instrument is kept and coloured, never moved; changing instrument keeps every note', () => {
  let doc = addPart(newDoc('T'), entry('violin'))!.doc;
  doc = addNotes(doc, 'violin', [{ start: 0, length: 1, pitch: 24 }, { start: 1, length: 1, pitch: 103 }, { start: 2, length: 1, pitch: 60 }]).doc;
  assert.deepEqual(doc.parts[0]!.notes.map(n => rangeClass(entry('violin'), n.pitch)), ['out', 'expert', 'normal']);
  const asCello = setInstrument(doc, 'violin', entry('cello'));
  assert.deepEqual(asCello.parts[0]!.notes.map(n => n.pitch), [24, 103, 60]);
  assert.deepEqual([asCello.parts[0]!.instrument, asCello.parts[0]!.attack], ['cello', entry('cello').attack]);
});

test('Move Them Into Range moves only red notes, by whole octaves, into the normal range when it can', () => {
  let doc = addPart(newDoc('T'), entry('violin'))!.doc;
  doc = addNotes(doc, 'violin', [{ start: 0, length: 1, pitch: 24 }, { start: 1, length: 1, pitch: 103 }, { start: 2, length: 1, pitch: 120 }]).doc;
  const moved = moveIntoRange(doc, 'violin', entry('violin'));
  assert.deepEqual(moved.parts[0]!.notes.map(n => n.pitch), [60, 103, 96], 'C1 to C4, the amber note stays, 120 down an octave to C7');
  assert.equal(intoRange(entry('bass'), 12), 36, 'a C0 on Double Bass to C2');
  assert.equal(intoRange(entry('kit'), 61), 61, 'drums have no octaves to move by');
});

test('renaming keeps a name; an empty one changes nothing; removing a part removes its notes', () => {
  let doc = addPart(newDoc('T'), entry('cello'))!.doc;
  assert.equal(renamePart(doc, 'cello', '  Low Drone ').parts[0]!.name, 'Low Drone');
  assert.equal(renamePart(doc, 'cello', '   '), doc);
  doc = removePart(doc, 'cello');
  assert.deepEqual(doc.parts, []);
});
