// Type Notes: each typing key is a semitone above the C at or above the keyboard's low note; Stay In Key moves a pitch
// outside the key down to a key note; a typed note is never doubled at one start and pitch, and gets a region; Clear
// Step removes the notes starting there.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { docWith } from './compose-fixture.ts';
import { TYPE_KEYS, clearStep, typeNote, typedPitch } from '../src/compose/typenotes.ts';

test('the typing keys are A to L, an octave and a bit from a C', () => {
  assert.equal(TYPE_KEYS['KeyA'], 0);
  assert.equal(TYPE_KEYS['KeyL'], 14);
  assert.equal(TYPE_KEYS['KeyP'], undefined);
  assert.equal(TYPE_KEYS['Semicolon'], undefined);
  assert.equal(Object.keys(TYPE_KEYS).length, 15);
});

test('a typed pitch counts from the C at or above the low note; Stay In Key moves it down into the key', () => {
  assert.equal(typedPitch('KeyA', 60), 60);
  assert.equal(typedPitch('KeyA', 55), 60);
  assert.equal(typedPitch('KeyW', 48), 49);
  assert.equal(typedPitch('KeyQ', 60), null);
  assert.equal(typedPitch('KeyW', 48, { tonic: 0, minor: false }, true), 48, 'C♯ is not in C major: down to C');
  assert.equal(typedPitch('KeyW', 48, { tonic: 0, minor: false }, false), 49, 'without Stay In Key it plays as typed');
  assert.equal(typedPitch('KeyE', 48, { tonic: 0, minor: false }, true), 50, 'E♭ down to D');
  assert.equal(typedPitch('KeyE', 48, { tonic: 9, minor: true }, true), 50);
  assert.equal(typedPitch('KeyL', 120), null, 'off the keyboard');
});

test('a typed note is added once per start and pitch, in a region; Clear Step removes a step\'s notes', () => {
  const d = docWith([['piano', [[0, 1, 60]]]]);
  const p = d.parts[0]!.id;
  const a = typeNote(d, p, 64, 0, 0.5);
  assert.equal(a.added, true);
  assert.deepEqual(a.doc.parts[0]!.notes.map(n => [n.start, n.pitch, n.length]), [[0, 60, 1], [0, 64, 0.5]]);
  assert.ok(a.doc.parts[0]!.regions?.length);
  const again = typeNote(a.doc, p, 64, 0, 1);
  assert.equal(again.added, false);
  assert.equal(again.doc, a.doc);
  const b = typeNote(a.doc, p, 62, 0.5, 0.5).doc;
  assert.deepEqual(clearStep(b, p, 0).parts[0]!.notes.map(n => n.pitch), [62]);
  assert.equal(clearStep(b, p, 3), b);
});
