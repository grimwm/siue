// Which views a piece offers: a sound effect never gets Sheet music, and the
// Piano roll waits for notes.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { TAB_LABELS, pickTab, tabsFor } from '../src/tabs.ts';
import type { Score } from '../src/score.ts';

const read = (name: string): Score => JSON.parse(readFileSync(new URL(`./fixtures/${name}`, import.meta.url), 'utf8')) as Score;

test('a music piece offers all four views', () => {
  assert.deepEqual(tabsFor(read('score-v1.json')), ['story', 'roll', 'sound', 'sheet']);
  assert.deepEqual(Object.values(TAB_LABELS), ['Story', 'Piano roll', 'Sound picture', 'Sheet music']);
});

test('a score-only studio draft has no sheet music to show', () => {
  assert.deepEqual(tabsFor(read('score-v1.json'), { sheet: false }), ['story', 'roll', 'sound']);
  assert.deepEqual(tabsFor(read('score-v1.json'), { sheet: true }), ['story', 'roll', 'sound', 'sheet']);
});

test('a sound effect without notes offers the story and the sound picture only', () => {
  assert.deepEqual(tabsFor(read('score-sound-v1.json')), ['story', 'sound']);
});

test('a sound effect with notes gets the piano roll but never sheet music, even with MusicXML', () => {
  const s: Score = { ...read('score-sound-v1.json'), musicxml: 'score.musicxml', notes: [{ lane: 'boom', start: 0, length: 0.1, pitch: 36, velocity: 100, motif: null }] };
  assert.deepEqual(tabsFor(s), ['story', 'roll', 'sound']);
});

test('a music piece without notes has no piano roll', () => {
  assert.deepEqual(tabsFor({ ...read('score-v1.json'), notes: [], motifs: [] }), ['story', 'sound', 'sheet']);
});

test('a tab the piece does not offer falls back to the story', () => {
  assert.equal(pickTab(['story', 'sound'], 'sheet'), 'story');
  assert.equal(pickTab(['story', 'sound'], 'sound'), 'sound');
});
