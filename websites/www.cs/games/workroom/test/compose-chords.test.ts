// Chords and keys: the six friendly chords with no key, a key's six major and minor chords, their names and notes, a
// chord's root near a pitch, which pitches are in a key, and a key's name.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BASIC_CHORDS, chordName, chordPitches, chordRoot, inKey, keyChords, keyName } from '../src/compose/chords.ts';

test('with no key the chords are C, Dm, Em, F, G and Am', () => {
  assert.deepEqual(BASIC_CHORDS.map(chordName), ['C', 'Dm', 'Em', 'F', 'G', 'Am']);
});

test('a key gives its six major and minor chords, no diminished', () => {
  assert.deepEqual(keyChords({ tonic: 7, minor: false }).map(chordName), ['G', 'Am', 'Bm', 'C', 'D', 'Em']);
  assert.deepEqual(keyChords({ tonic: 9, minor: true }).map(chordName), ['Am', 'C', 'Dm', 'Em', 'F', 'G']);
  assert.deepEqual(keyChords({ tonic: 6, minor: true }).map(chordName), ['F♯m', 'A', 'Bm', 'C♯m', 'D', 'E']);
  assert.deepEqual(keyChords({ tonic: 3, minor: false }).map(chordName), ['E♭', 'Fm', 'Gm', 'A♭', 'B♭', 'Cm']);
});

test('a chord\'s notes are its root, third and fifth; its root sits at or just below a pitch', () => {
  assert.deepEqual(chordPitches({ root: 0, minor: false }, 60), [60, 64, 67]);
  assert.deepEqual(chordPitches({ root: 9, minor: true }, 57), [57, 60, 64]);
  assert.equal(chordRoot({ root: 9, minor: true }, 60), 57);
  assert.equal(chordRoot({ root: 0, minor: false }, 60), 60);
  assert.equal(chordRoot({ root: 11, minor: false }, 60), 59);
});

test('pitches in a key, and its name', () => {
  assert.deepEqual([60, 61, 62, 64, 65, 66, 71].map(p => inKey(p, { tonic: 0, minor: false })), [true, false, true, true, true, false, true]);
  assert.deepEqual([69, 71, 72, 73, 79, 80].map(p => inKey(p, { tonic: 9, minor: true })), [true, true, true, false, true, false]);
  assert.equal(keyName({ tonic: 9, minor: true }), 'A Minor');
  assert.equal(keyName({ tonic: 3, minor: false }), 'E♭ Major');
});
