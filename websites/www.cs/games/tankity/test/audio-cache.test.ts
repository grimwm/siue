// The decoded soundtrack held in memory stays small: sixteen decoded tracks are
// about 550 MiB, so only the theme and the playing track are kept decoded.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { initAudio, music, noteGesture } from '../src/audio.ts';
import { fakeAudioContext } from '../../_kit/test/audio.ts';

const ctx = fakeAudioContext();
Reflect.set(globalThis, 'AudioContext', function AudioContext() { return ctx; });
const fetched: string[] = [];
Reflect.set(globalThis, 'fetch', (file: string) => { fetched.push(file); return Promise.resolve({ ok: true, arrayBuffer: () => Promise.resolve({ file }) }); });
const settle = async () => { for (let i = 0; i < 10; i++) await new Promise(r => setTimeout(r, 0)); };
const list = Array.from({ length: 16 }, (_, i) => ({ file: `t${i}.mp3`, title: `T${i}` }));

test('walking all sixteen tracks keeps at most three decoded, the theme among them', async () => {
  initAudio({ sfx: {}, music: list });
  const started: string[] = [];
  music.onTrackStart(t => started.push(t.file));
  noteGesture(false);
  try {
    await settle();
    for (let i = 1; i < 16; i++) {
      music.next();
      await settle();
      const held = music.decodedTracks();
      assert.ok(held.length <= 3, `${held.length} decoded after ${started.at(-1)}: ${held}`);
      assert.ok(held.includes('t0.mp3'), 'the theme stays decoded');
      assert.ok(held.includes(`t${i}.mp3`), 'the playing track stays decoded');
    }
    assert.equal(started.length, 16);
    for (let r = 1; r <= 15; r++) { music.forRound(r); await settle(); }
    assert.ok(music.decodedTracks().length <= 3);
    // The theme is decoded once; a dropped track is fetched again when it comes back.
    assert.equal(fetched.filter(f => f === 't0.mp3').length, 1);
    assert.equal(fetched.filter(f => f === 't1.mp3').length, 2);
  } finally { music.stop(); }
});
