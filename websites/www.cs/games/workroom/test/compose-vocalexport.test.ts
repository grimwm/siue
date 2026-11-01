// Export With Vocals: a zip any unzip opens, holding the notes as MusicXML (vocal parts left out), every take at the
// quality it was saved in, a take only on this device as Perfect FLAC, and where each clip plays.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { newDoc } from '../src/compose/doc.ts';
import { addNotes, addPart } from '../src/compose/edit.ts';
import { decodeFlac } from '../src/compose/flac.ts';
import { addTake, newVocalPart } from '../src/compose/vocal.ts';
import { exportWithVocals, notesOnly } from '../src/compose/vocalexport.ts';
import { crc32 } from '../src/compose/zip.ts';
import { ENTRIES } from './compose-fixture.ts';

const LOCAL = 'local-0f8fad5b-d9cb-469f-a165-70867728950e';
const SAVED = `vocal-${'c'.repeat(64)}.ogg`;

test('zip\'s CRC-32 of "123456789" is 0xCBF43926', () => {
  assert.equal(crc32(new TextEncoder().encode('123456789')), 0xcbf43926);
});

test('the zip holds the MusicXML, each take as saved or as Perfect FLAC, and vocals.json', async () => {
  const added = addPart(newDoc('Song'), ENTRIES.find(e => e.id === 'piano')!)!;
  let d = addNotes(added.doc, added.id, [{ start: 0, length: 1, pitch: 60 }]).doc;
  d = { ...d, parts: [...d.parts, newVocalPart('voice', 'My Voice', '#c0392b')] };
  d = addTake(d, 'voice', { file: LOCAL, seconds: 1 }, 2);
  d = addTake(d, 'voice', { file: SAVED, seconds: 3 }, 5);
  const pcm = Int16Array.from({ length: 48000 }, (_, i) => Math.round(5000 * Math.sin(i / 30)));
  const zip = await exportWithVocals(d, ENTRIES, 'song', { saved: async () => Uint8Array.of(9, 9, 9), local: async () => ({ pcm, rate: 48000 }) });
  const dir = mkdtempSync(join(tmpdir(), 'zip-'));
  writeFileSync(join(dir, 'a.zip'), zip);
  // Python's zipfile checks every entry's CRC and unpacks them.
  execFileSync('python3', ['-I', '-c', 'import sys,zipfile; z=zipfile.ZipFile(sys.argv[1]); assert z.testzip() is None; z.extractall(sys.argv[2])', join(dir, 'a.zip'), join(dir, 'out')]);
  const names = ['song.musicxml', 'vocals.json', `vocals/${LOCAL}.flac`, `vocals/${SAVED}`];
  const files = new Map(names.map(n => [n, new Uint8Array(readFileSync(join(dir, 'out', n)))]));
  assert.match(new TextDecoder().decode(files.get('song.musicxml')), /<score-partwise/);
  assert.deepEqual([...files.get(`vocals/${SAVED}`)!], [9, 9, 9]);
  assert.deepEqual([...decodeFlac(files.get(`vocals/${LOCAL}.flac`)!).pcm], [...pcm]);
  const v = JSON.parse(new TextDecoder().decode(files.get('vocals.json')));
  assert.deepEqual(v.tracks[0].clips.map((c: { file: string; starts_at: number }) => [c.file, c.starts_at]), [[`vocals/${LOCAL}.flac`, 2], [`vocals/${SAVED}`, 5]]);
  assert.equal(notesOnly(d).parts.length, 1, 'MusicXML and MIDI leave vocal parts out');
});
