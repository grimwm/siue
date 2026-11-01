// Reading MusicXML from other programs: a MuseScore-shaped file with a transposing clarinet, a piano on two staves
// (backup, a chord, a tie across the bar), drums by <instrument>, a grace note, lyrics, a chord symbol, an ornament
// and a repeat; and refusing what is not a partwise score or declares entities.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { readMusicXml } from '../src/compose/fromxml.ts';
import { ImportError } from '../src/compose/music-file.ts';
import { parseXml } from './compose-fixture.ts';

const fixture = (name: string): string => readFileSync(join(import.meta.dirname, 'fixtures', 'import', name), 'utf8');
const list = (notes: readonly { start: number; length: number; pitch: number }[]) => notes.map(n => [n.start, n.length, n.pitch]);

test('reads the MuseScore fixture', () => {
  const m = readMusicXml(fixture('musescore-quartet.musicxml'), parseXml);
  assert.equal(m.format, 'MusicXML');
  assert.equal(m.app, 'MuseScore 4.4.2');
  assert.equal(m.title, 'Quartet For The Workroom');
  assert.deepEqual(m.tempo, [{ bar: 1, bpm: 112, beats: 4, unit: 4 }]);
  assert.equal(m.fifths, -1);
  assert.equal(m.mode, 'major');
  assert.deepEqual(m.parts.map(p => [p.name, p.program, p.drums]), [['Flute', 74, false], ['Clarinet in B♭', 72, false], ['Piano', 1, false], ['Drumset', null, true]]);
  assert.deepEqual(list(m.parts[0]!.notes), [[0, 1, 77], [1, 1, 79], [2, 2, 81], [4, 4, 82]], 'the grace note is left out');
  assert.deepEqual(list(m.parts[1]!.notes), [[0, 2, 65], [2, 2, 67], [4, 4, 72]], 'the clarinet sounds a tone below where it is written');
  assert.deepEqual(list(m.parts[2]!.notes), [[0, 4, 53], [0, 2, 65], [0, 2, 69], [0, 2, 72], [2, 4, 72], [4, 2, 48], [6, 2, 41]], 'the tie joins across the bar');
  assert.deepEqual(list(m.parts[3]!.notes), [[0, 1, 36], [1, 1, 38], [1, 1, 42]]);
  const lost = m.lost.join(' | ');
  assert.match(lost, /Lyrics \(3 words\)/);
  assert.match(lost, /Grace notes \(1\)/);
  assert.match(lost, /Chord symbols \(F\)/);
  assert.match(lost, /Ornaments/);
  assert.match(lost, /Repeat signs/);
});

test('our own MusicXML reads back with its transposition undone', () => {
  const xml = `<?xml version="1.0"?><score-partwise version="4.0"><part-list><score-part id="bass"><part-name>Double Bass</part-name></score-part></part-list>
    <part id="bass"><measure number="1"><attributes><divisions>24</divisions><time><beats>3</beats><beat-type>4</beat-type></time>
    <transpose><diatonic>0</diatonic><chromatic>0</chromatic><octave-change>-1</octave-change></transpose></attributes>
    <note><pitch><step>E</step><octave>2</octave></pitch><duration>72</duration><voice>1</voice><type>half</type><dot/></note></measure></part></score-partwise>`;
  const m = readMusicXml(xml, parseXml);
  assert.deepEqual(list(m.parts[0]!.notes), [[0, 3, 28]]);
  assert.deepEqual(m.tempo, [{ bar: 1, bpm: 120, beats: 3, unit: 4 }], 'no tempo mark: MusicXML\'s 120 to the quarter');
});

test('a dynamic sets the loudness of the notes after it', () => {
  const xml = `<score-partwise><part-list><score-part id="P1"><part-name>Oboe</part-name></score-part></part-list><part id="P1"><measure number="1">
    <attributes><divisions>1</divisions></attributes><direction><sound dynamics="40"/></direction>
    <note><pitch><step>A</step><octave>4</octave></pitch><duration>1</duration></note>
    <note dynamics="120"><pitch><step>B</step><octave>4</octave></pitch><duration>1</duration></note></measure></part></score-partwise>`;
  assert.deepEqual(readMusicXml(xml, parseXml).parts[0]!.notes.map(n => n.velocity), [36, 108]);
});

test('refuses entities, timewise scores and files that are not MusicXML', () => {
  const evil = '<?xml version="1.0"?><!DOCTYPE x [<!ENTITY e SYSTEM "file:///etc/passwd">]><score-partwise><part-list/></score-partwise>';
  assert.throws(() => readMusicXml(evil, parseXml), (e: unknown) => e instanceof ImportError && /entit/i.test(e.message));
  assert.throws(() => readMusicXml('<score-timewise version="4.0"></score-timewise>', parseXml), (e: unknown) => e instanceof ImportError && /by time/i.test(e.message));
  assert.throws(() => readMusicXml('<html><body>hi</body></html>', parseXml), ImportError);
  assert.throws(() => readMusicXml('not xml at all <', parseXml), ImportError);
});

test('the deadline stops a long read', () => {
  const notes = '<note><pitch><step>C</step><octave>4</octave></pitch><duration>1</duration></note>'.repeat(3000);
  const xml = `<score-partwise><part-list><score-part id="P1"><part-name>P</part-name></score-part></part-list><part id="P1"><measure number="1"><attributes><divisions>1</divisions></attributes>${notes}</measure></part></score-partwise>`;
  let calls = 0;
  assert.throws(() => readMusicXml(xml, parseXml, () => { if (++calls > 1) throw new ImportError('took too long'); }), /took too long/);
});
