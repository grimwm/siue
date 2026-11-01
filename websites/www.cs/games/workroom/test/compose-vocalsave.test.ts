// Save To Studio: both qualities made for real with their exact sizes, what each leaves of the studio, sizes said as
// the studio says them, and the chosen takes named by their hash in the score and the bundle.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { newDoc } from '../src/compose/doc.ts';
import { decodeFlac } from '../src/compose/flac.ts';
import { addTake, newVocalPart } from '../src/compose/vocal.ts';
import { humanBytes, leaves, sizesFor, withSavedTakes } from '../src/compose/vocalsave.ts';
import { encodeBundle } from '../src/compose/save.ts';

const pcm = Int16Array.from({ length: 48000 }, (_, i) => Math.round(8000 * Math.sin(i / 20)));
const sha256 = async (b: Uint8Array) => createHash('sha256').update(b).digest('hex');

test('a take is made both ways: Perfect is its FLAC, Good To The Ear what the Opus encoder gives', async () => {
  const s = await sizesFor(pcm, 48000, { opus: async () => ({ bytes: new Uint8Array(12_000), ext: 'ogg' }) });
  assert.equal(s.perfect.ext, 'flac');
  assert.deepEqual([...decodeFlac(s.perfect.bytes).pcm], [...pcm]);
  assert.equal(s.ear!.bytes.length, 12_000);
  assert.equal(s.seconds, 1);
  assert.equal((await sizesFor(pcm, 48000, { opus: async () => null })).ear, null, 'no Opus here: Perfect only');
});

test('what a choice leaves: the room after it and the minutes of singing that is at that quality', () => {
  assert.deepEqual(leaves(10_000_000, { bytes: new Uint8Array(1_000_000), ext: 'flac' }, 20), { bytes: 9_000_000, minutes: 3 });
  assert.deepEqual(leaves(500, { bytes: new Uint8Array(1000), ext: 'ogg' }, 1), { bytes: -500, minutes: 0 });
});

test('sizes read as the studio says them', () => {
  assert.equal(humanBytes(0), '0 KB');
  assert.equal(humanBytes(948_000), '926 KB');
  assert.equal(humanBytes(1_048_576), '1 MB');
  assert.equal(humanBytes(26_214_400), '25 MB');
  assert.equal(humanBytes(1_258_291), '1.2 MB');
});

test('chosen takes are named by their SHA-256, the score names them, and the bundle carries them', async () => {
  const local = 'local-0f8fad5b-d9cb-469f-a165-70867728950e';
  const d0 = newDoc('Song');
  const doc = addTake({ ...d0, parts: [newVocalPart('voice', 'Voice', '#c0392b')] }, 'voice', { file: local, seconds: 1 }, 0);
  const bytes = Uint8Array.of(1, 2, 3);
  const r = await withSavedTakes(doc, new Map([[local, { enc: { bytes, ext: 'ogg' }, seconds: 1 }]]), { sha256 });
  const name = `vocal-${createHash('sha256').update(bytes).digest('hex')}.ogg`;
  assert.deepEqual(Object.keys(r.files), [name]);
  assert.equal(r.doc.parts[0]!.vocal!.clips[0]!.take, name);
  assert.equal(r.names.get(local), name);
  const b = encodeBundle({ 'score.json': Uint8Array.of(123), ...r.files });
  assert.equal(b[6], 2, 'two files in the bundle');
});
