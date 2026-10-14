// Which track starts are announced as "Next song": only the ones the player asked for.
// Runs src/audio.ts against the kit's fake audio context and a fetch whose loads finish when the test says.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { initAudio, music, noteGesture } from '../src/audio.ts';
import { fakeAudioContext } from '../../_kit/test/audio.ts';

// The module makes its one context through the kit's audio core the first
// time a sound needs it; this fake is that context.
const ctx = fakeAudioContext();
globalThis.AudioContext = function AudioContext() { return ctx; };
const pending = {};
globalThis.fetch = file => new Promise(res => {
  pending[file] = () => res({ ok: true, arrayBuffer: () => Promise.resolve({ file }) });
});
const land = async file => { pending[file](); for (let i = 0; i < 10; i++) await new Promise(r => setTimeout(r, 0)); };

test('Next song is announced; the theme and a round change are not', async () => {
  initAudio({ sfx: {}, music: [{ file: 'a.mp3', title: 'A' }, { file: 'b.mp3', title: 'B' }, { file: 'c.mp3', title: 'C' }] });
  const started = [];
  music.onTrackStart((track, cause) => started.push(`${track.title}:${cause}`));
  noteGesture(false); // the theme
  await land('a.mp3');
  music.next();
  await land('b.mp3');
  music.forRound(2); // a round picks track 2 by itself
  await land('c.mp3');
  music.next(); // wraps to the theme, already decoded
  for (let i = 0; i < 10; i++) await new Promise(r => setTimeout(r, 0));
  music.stop();
  assert.deepEqual(started, ['A:auto', 'B:next', 'C:auto', 'A:next']);
});

test('a round that takes over while Next song is still loading is not announced', async () => {
  const started = [];
  music.onTrackStart((track, cause) => started.push(`${track.title}:${cause}`));
  const settle = async () => { for (let i = 0; i < 10; i++) await new Promise(r => setTimeout(r, 0)); };
  music.start(); // the theme again, decoded by the test above
  await settle();
  music.next(); // asks for B ...
  music.forRound(2); // ... but the round picks C before B can start
  await settle();
  music.stop();
  assert.deepEqual(started, ['A:auto', 'C:auto']);
});
