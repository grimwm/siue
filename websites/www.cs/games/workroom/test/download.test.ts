// The draft's downloads: the file names a saved draft keeps, and which files
// the piece page offers.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { downloadLinks, downloadName } from '../src/download.ts';

const url = (file: string): string => `draft.php?file=${file}`;
const WEBM = { file: 'audio.webm' as const, type: 'audio/webm; codecs=opus' };
const M4A = { file: 'audio.m4a' as const, type: 'audio/mp4; codecs=mp4a.40.2' };

test('a saved file is named for the piece and the draft, with the file\'s own extension', () => {
  assert.equal(downloadName('crete-title', 3, 'audio.webm'), 'crete-title-v3.webm');
  assert.equal(downloadName('crete-title', 3, 'audio.m4a'), 'crete-title-v3.m4a');
  assert.equal(downloadName('crete-title', 3, 'score.musicxml'), 'crete-title-v3.musicxml');
  assert.equal(downloadName('crete-title', 12, 'score.json'), 'crete-title-v12.json');
});

test('a music piece offers the audio being played, the sheet music and the score', () => {
  assert.deepEqual(downloadLinks({ piece: 'crete-title', version: 3, audio: M4A, sheet: true }, url), [
    { label: 'Audio', href: 'draft.php?file=audio.m4a', name: 'crete-title-v3.m4a' },
    { label: 'Sheet music', href: 'draft.php?file=score.musicxml', name: 'crete-title-v3.musicxml' },
    { label: 'Score', href: 'draft.php?file=score.json', name: 'crete-title-v3.json' },
  ]);
});

test('a piece without sheet music offers no sheet music, and no playable audio offers no audio', () => {
  assert.deepEqual(downloadLinks({ piece: 'rain', version: 1, audio: WEBM, sheet: false }, url).map(l => l.name), ['rain-v1.webm', 'rain-v1.json']);
  assert.deepEqual(downloadLinks({ piece: 'rain', version: 1, audio: null, sheet: false }, url).map(l => l.name), ['rain-v1.json']);
});
