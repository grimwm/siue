// Bringing in another program's file: which reader, the limits (10 MB, 16 parts, 20,000 notes, 5 seconds), each part
// matched to the nearest instrument, the preview's facts, and the two ways in: Add As New Parts at the piece's own
// speed, or Start A New Piece at the file's.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { newDoc } from '../src/compose/doc.ts';
import { addAsNewParts, matchInstrument, newDocFrom, previewOf, readMusicFile } from '../src/compose/importing.ts';
import type { ImportPorts } from '../src/compose/importing.ts';
import { ImportError } from '../src/compose/music-file.ts';
import type { ReadMusic, ReadPart } from '../src/compose/music-file.ts';
import { browserInflate } from '../src/compose/mxl.ts';
import { docWith, ENTRIES, parseXml } from './compose-fixture.ts';

const bytesOf = (name: string): Uint8Array => new Uint8Array(readFileSync(join(import.meta.dirname, 'fixtures', 'import', name)));
const PORTS: ImportPorts = { parseXml, inflate: browserInflate, now: () => 0 };
const part = (name: string, program: number | null, drums = false, pitches = [60]): ReadPart =>
  ({ name, program, drums, notes: pitches.map((pitch, i) => ({ start: i, length: 1, pitch, velocity: 80 })) });

test('matching each part to the nearest instrument', () => {
  assert.equal(matchInstrument(part('Violin I', 41), ENTRIES), 'violin');
  assert.equal(matchInstrument(part('Track 2', 34), ENTRIES), 'bass', 'GM 34 Electric Bass (finger) is in the bass family');
  assert.equal(matchInstrument(part('Alto Sax', 66), ENTRIES), 'clarinet');
  assert.equal(matchInstrument(part('English Horn', 70), ENTRIES), 'oboe');
  assert.equal(matchInstrument(part('Horn in F', 61), ENTRIES), 'horn');
  assert.equal(matchInstrument(part('Pad', 89), ENTRIES), 'organ');
  assert.equal(matchInstrument(part('Steel Guitar', 26), ENTRIES), 'harp');
  assert.equal(matchInstrument(part('Mystery', null), ENTRIES), 'piano');
  assert.equal(matchInstrument(part('Drums', null, true, [36, 38, 42]), ENTRIES), 'kit');
  assert.equal(matchInstrument(part('Percussion', null, true, [35, 57, 81]), ENTRIES), 'orch');
});

test('the preview of the MIDI fixture', async () => {
  const read = await readMusicFile('gm-band.mid', bytesOf('gm-band.mid'), PORTS);
  const p = previewOf(read, 'gm-band.mid', ENTRIES);
  assert.deepEqual([p.file, p.type, p.app, p.bpm, p.time, p.key, p.bars], ['gm-band.mid', 'MIDI', 'a MIDI program', 100, '3/4', 'Not In The File', 2]);
  assert.deepEqual(p.parts.map(x => [x.name, x.from, x.match]), [['Piano', 'GM 1 Acoustic Grand Piano', 'piano'], ['Bass', 'GM 33 Acoustic Bass', 'bass'], ['Drums', 'Channel 10', 'kit']]);
});

test('the preview of the MuseScore fixture, and of the same file as an .mxl', async () => {
  const xml = await readMusicFile('quartet.musicxml', bytesOf('musescore-quartet.musicxml'), PORTS);
  const p = previewOf(xml, 'quartet.musicxml', ENTRIES);
  assert.deepEqual([p.type, p.app, p.bpm, p.time, p.key, p.bars], ['MusicXML', 'MuseScore 4.4.2', 112, '4/4', 'F Major', 2]);
  assert.deepEqual(p.parts.map(x => x.match), ['flute', 'clarinet', 'piano', 'kit']);
});

test('Add As New Parts keeps the piece\'s own speed: quarters become the piece\'s beats', async () => {
  const read = await readMusicFile('gm-band.mid', bytesOf('gm-band.mid'), PORTS);
  const doc = docWith([['cello', [[0, 3, 48]]]], [{ bar: 1, bpm: 60, beats: 6, unit: 8 }]);
  const p = previewOf(read, 'gm-band.mid', ENTRIES);
  const next = addAsNewParts(doc, p, p.parts.map(x => x.match), ENTRIES);
  assert.deepEqual(next.tempo, doc.tempo);
  assert.deepEqual(next.parts.map(x => [x.name, x.instrument]), [['Cello', 'cello'], ['Piano', 'piano'], ['Bass', 'bass'], ['Drums', 'kit']]);
  // The bass's C2 lasts three quarters: six eighth-note beats in 6/8.
  assert.deepEqual(next.parts[2]!.notes.map(n => [n.start, n.length, n.pitch]), [[0, 6, 36], [6, 3, 31]]);
  assert.equal(doc.parts.length, 1, 'the piece it was given is unchanged');
  const ids = new Set(next.parts.flatMap(x => x.notes.map(n => n.id)));
  assert.equal(ids.size, next.parts.reduce((s, x) => s + x.notes.length, 0), 'every note has its own id');
});

test('Start A New Piece keeps the file\'s speed and time signature', async () => {
  const read = await readMusicFile('gm-band.mid', bytesOf('gm-band.mid'), PORTS);
  const p = previewOf(read, 'gm-band.mid', ENTRIES);
  const doc = newDocFrom(p, ['violin', 'cello', 'kit'], ENTRIES, 'GM Band');
  assert.equal(doc.title, 'GM Band');
  assert.deepEqual(doc.tempo, [{ bar: 1, bpm: 100, beats: 3, unit: 4 }]);
  assert.deepEqual(doc.parts.map(x => x.instrument), ['violin', 'cello', 'kit'], 'the person\'s choices, not the matches');
  assert.equal(doc.base, null);
});

test('the limits: parts, notes, size and time', async () => {
  const many: ReadMusic = { format: 'MIDI', app: null, title: null, tempo: [{ bar: 1, bpm: 120, beats: 4, unit: 4 }], fifths: null, mode: null, lost: [],
    parts: Array.from({ length: 10 }, (_, i) => part(`P${i}`, 1)) };
  const p = previewOf(many, 'x.mid', ENTRIES);
  const full = docWith(Array.from({ length: 8 }, () => ['cello', []] as [string, []]));
  assert.throws(() => addAsNewParts(full, p, p.parts.map(x => x.match), ENTRIES), (e: unknown) => e instanceof ImportError && /8 parts.*10 parts.*16/.test(e.message));
  await assert.rejects(readMusicFile('big.mid', new Uint8Array(10 * 1024 * 1024 + 1), PORTS), (e: unknown) => e instanceof ImportError && /10 MB/.test(e.message));
  let t = 0;
  const slow: ImportPorts = { ...PORTS, now: () => (t += 6000) };
  await assert.rejects(readMusicFile('quartet.musicxml', bytesOf('musescore-quartet.musicxml'), slow), (e: unknown) => e instanceof ImportError && /5 seconds/.test(e.message));
  const notes = '<note><pitch><step>C</step><octave>4</octave></pitch><duration>1</duration></note>'.repeat(20_001);
  const xml = `<score-partwise><part-list><score-part id="P1"><part-name>P</part-name></score-part></part-list><part id="P1"><measure number="1"><attributes><divisions>1</divisions></attributes>${notes}</measure></part></score-partwise>`;
  await assert.rejects(readMusicFile('many.xml', new TextEncoder().encode(xml), PORTS), (e: unknown) => e instanceof ImportError && /20,001 notes/.test(e.message));
  await assert.rejects(readMusicFile('empty.mid', new Uint8Array([0x4d, 0x54, 0x68, 0x64, 0, 0, 0, 6, 0, 0, 0, 0, 0, 96]), PORTS), (e: unknown) => e instanceof ImportError && /no notes/.test(e.message));
  assert.ok(newDoc('x'));
});
