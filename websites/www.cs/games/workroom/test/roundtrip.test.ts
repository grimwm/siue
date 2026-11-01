// Export then import is the same piece: through MusicXML and through MIDI, a cello, a horn in F, a Double Bass, a
// piano chord tied across a bar, and drums come back with the same sounding pitches, starts and lengths.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readMusicXml } from '../src/compose/fromxml.ts';
import { readMidi, writeMidi } from '../src/compose/midi.ts';
import { toMusicXml } from '../src/compose/toxml.ts';
import { docWith, ENTRIES, parseXml } from './compose-fixture.ts';

const DOC = docWith([
  ['cello', [[0, 1, 48], [1, 0.5, 50], [1.5, 0.5, 52], [2, 2, 55]]],
  ['horn', [[0, 4, 53], [4, 1.5, 60], [5.5, 0.5, 58]]],
  ['bass', [[0, 2, 28], [2, 2, 31], [4, 4, 33]]],
  ['piano', [[2, 4, 60], [2, 4, 64], [2, 4, 67], [0, 8, 36]]],
  ['kit', [[0, 0.5, 36], [0, 0.5, 42], [0.5, 0.5, 42], [1, 0.5, 38], [1, 0.5, 42]]],
], [{ bar: 1, bpm: 96, beats: 4, unit: 4 }, { bar: 3, bpm: 72, beats: 3, unit: 4 }]);

const expected = DOC.parts.map(p => p.notes.map(n => [n.start, n.length, n.pitch]).sort((a, b) => a[0]! - b[0]! || a[2]! - b[2]!));
const got = (parts: readonly { notes: readonly { start: number; length: number; pitch: number }[] }[]) => parts.map(p => p.notes.map(n => [n.start, n.length, n.pitch]));

test('MusicXML out and back in, written parts read back at their sounding pitch', () => {
  for (const concert of [false, true]) {
    const back = readMusicXml(toMusicXml(DOC, ENTRIES, { concert }), parseXml);
    assert.deepEqual(got(back.parts), expected, concert ? 'concert pitch' : 'written pitch');
    assert.deepEqual(back.parts.map(p => [p.name, p.program, p.drums]), [['Cello', 43, false], ['French Horn', 61, false], ['Double Bass', 44, false], ['Piano', 1, false], ['Drum Kit', null, true]]);
    assert.deepEqual(back.tempo, DOC.tempo);
    assert.equal(back.title, 'Test Tune');
  }
});

test('MIDI out and back in', () => {
  const back = readMidi(writeMidi(DOC, ENTRIES));
  assert.deepEqual(got(back.parts), expected);
  assert.deepEqual(back.tempo, DOC.tempo);
  assert.deepEqual(back.parts.map(p => p.notes.map(n => n.velocity)), DOC.parts.map(p => p.notes.map(() => 90)));
});
