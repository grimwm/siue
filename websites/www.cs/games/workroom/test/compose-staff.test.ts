// The Sheet view's staff: which staff a part gets, where each note sits on the lines, its ledger lines, its sharps and
// flats in the piece's key, looped repeats, and the drum staff.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { docWith, entry } from './compose-fixture.ts';
import type { Part } from '../src/compose/doc.ts';
import { clefOf, ledgersFor, signatureOf, spell, staffOf } from '../src/compose/staff.ts';

const part = (inst: string, notes: [number, number, number][]): Part => docWith([[inst, notes]]).parts[0]!;

test('the staff follows the notes, else the instrument', () => {
  assert.equal(clefOf(entry('flute'), [72, 79]), 'treble');
  assert.equal(clefOf(entry('cello'), [43, 50]), 'bass');
  assert.equal(clefOf(entry('piano'), [48, 72]), 'grand');
  assert.equal(clefOf(entry('piano'), []), 'grand');
  assert.equal(clefOf(entry('cello'), []), 'bass');
  // Notes that fit either staff keep the instrument's own.
  assert.equal(clefOf(entry('cello'), [57, 60]), 'bass');
  assert.equal(clefOf(entry('violin'), [57, 60]), 'treble');
  assert.equal(clefOf(null, []), 'treble');
});

test('notes sit on the treble staff from its middle line, with ledger lines outside it', () => {
  const s = staffOf(part('flute', [[0, 1, 71], [1, 1, 60], [2, 1, 64], [3, 1, 84]]), entry('flute'));
  assert.equal(s.kind, 'treble');
  const [b4, c4, e4, c6] = s.notes;
  assert.equal(b4!.step, 0);
  assert.equal(c4!.step, -6);
  assert.deepEqual(c4!.ledgers, [-6]);
  assert.equal(e4!.step, -4);
  assert.deepEqual(e4!.ledgers, []);
  assert.equal(c6!.step, 8);
  assert.deepEqual(c6!.ledgers, [6, 8]);
  assert.equal(c4!.stemUp, true);
  assert.equal(c6!.stemUp, false);
  assert.equal(c4!.name, 'C4');
});

test('a grand staff puts middle C and up on the treble staff, the rest on the bass staff', () => {
  const s = staffOf(part('piano', [[0, 1, 72], [0, 1, 60], [0, 1, 48], [0, 4, 50]]), entry('piano'));
  assert.equal(s.kind, 'grand');
  const byPitch = new Map(s.notes.map(n => [n.pitch, n]));
  assert.equal(byPitch.get(60)!.staff, 0);
  assert.equal(byPitch.get(48)!.staff, 1);
  assert.equal(byPitch.get(50)!.step, 0);
  assert.equal(byPitch.get(50)!.hollow, true);
  assert.equal(byPitch.get(48)!.hollow, false);
});

test('sharps with no key, flats in a flat key, naturals only where the key needs them', () => {
  assert.deepEqual(spell(61, false), { letter: 0, alter: 1, diatonic: 28 });
  assert.deepEqual(spell(61, true), { letter: 1, alter: -1, diatonic: 29 });
  const plain = staffOf(part('flute', [[0, 1, 70], [1, 1, 71]]), entry('flute'));
  assert.deepEqual(plain.notes.map(n => [n.name, n.accidental]), [['A♯4', '♯'], ['B4', null]]);
  assert.equal(plain.signature, null);
  const eFlat = { tonic: 3, minor: false };
  assert.deepEqual(signatureOf(eFlat), { accidental: '♭', letters: ['B', 'E', 'A'] });
  const flat = staffOf(part('flute', [[0, 1, 70], [1, 1, 71], [2, 1, 66]]), entry('flute'), eFlat);
  assert.deepEqual(flat.notes.map(n => [n.name, n.accidental]), [['B♭4', null], ['B4', '♮'], ['G♭4', '♭']]);
  // C minor shares E flat major's signature; A minor has none.
  assert.deepEqual(signatureOf({ tonic: 0, minor: true }), signatureOf(eFlat));
  assert.equal(signatureOf({ tonic: 9, minor: true }), null);
  assert.deepEqual(signatureOf({ tonic: 7, minor: false }), { accidental: '♯', letters: ['F'] });
});

test('a note of two quarters or more is hollow, in 6/8 too', () => {
  const s = staffOf(part('flute', [[0, 2, 72], [2, 3, 72]]), entry('flute'), null, 2);
  assert.deepEqual(s.notes.map(n => n.hollow), [false, false]);
  const t = staffOf(part('flute', [[0, 4, 72]]), entry('flute'), null, 2);
  assert.equal(t.notes[0]!.hollow, true);
});

test('drums sit on fixed lines by piece, hi-hats with an x', () => {
  const s = staffOf(part('kit', [[0, 1, 36], [1, 1, 38], [0, 0.5, 42]]), entry('kit'));
  assert.equal(s.kind, 'drums');
  const by = new Map(s.notes.map(n => [n.pitch, n]));
  assert.ok(by.get(36)!.step < by.get(38)!.step);
  assert.ok(by.get(38)!.step < by.get(42)!.step);
  assert.equal(by.get(42)!.cross, true);
  assert.equal(by.get(36)!.cross, false);
  assert.equal(by.get(38)!.name, 'Snare');
  assert.equal(by.get(42)!.name, 'Closed Hi-Hat');
});

test('a looped region shows its repeats', () => {
  const p = part('flute', [[0, 1, 72]]);
  const looped: Part = { ...p, regions: [{ id: 99, start: 0, length: 8, loop: 4 }] };
  const s = staffOf(looped, entry('flute'));
  assert.deepEqual(s.notes.map(n => [n.start, n.ghost]), [[0, false], [4, true]]);
});

test('ledger lines run from the staff to the note', () => {
  assert.deepEqual(ledgersFor(5), []);
  assert.deepEqual(ledgersFor(7), [6]);
  assert.deepEqual(ledgersFor(-9), [-6, -8]);
});
