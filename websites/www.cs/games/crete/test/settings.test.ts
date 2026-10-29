import { test } from 'node:test';
import assert from 'node:assert/strict';
import { memoryStorage, throwingStorage } from '../../_kit/test/record.ts';
import { createSettings, FULLSCREEN_KEY, MUSIC_HIDDEN_KEY, MUSIC_KEY, SOUND_KEY } from '../src/settings.ts';

test('defaults: sound on, music on, music in the background on, fullscreen off', () => {
  const s = createSettings(memoryStorage());
  assert.deepEqual([s.sound.get(), s.music.get(), s.musicHidden.get(), s.fullscreen.get()], ['on', 'on', 'on', 'off']);
});

test('music is its own setting, kept apart from sound', () => {
  const storage = memoryStorage();
  createSettings(storage).music.set('off');
  assert.equal(storage.data.get(MUSIC_KEY), 'off');
  assert.equal(MUSIC_KEY, 'crete-music');
  const again = createSettings(storage);
  assert.deepEqual([again.sound.get(), again.music.get()], ['on', 'off']);
  assert.equal(createSettings(memoryStorage({ [MUSIC_KEY]: 'quiet' })).music.get(), 'on');
});

test('a choice survives a new page', () => {
  const storage = memoryStorage();
  const first = createSettings(storage);
  first.sound.set('off');
  first.fullscreen.set('on');
  assert.equal(storage.data.get(SOUND_KEY), 'off');
  assert.equal(storage.data.get(FULLSCREEN_KEY), 'on');
  const second = createSettings(storage);
  assert.deepEqual([second.sound.get(), second.fullscreen.get()], ['off', 'on']);
});

test('a stored word that is neither on nor off reads as the default', () => {
  const s = createSettings(memoryStorage({ [SOUND_KEY]: 'loud', [FULLSCREEN_KEY]: '1' }));
  assert.deepEqual([s.sound.get(), s.fullscreen.get()], ['on', 'off']);
});

test('storage that throws, or none at all, never throws back and still remembers for the session', () => {
  for (const storage of [throwingStorage(), null]) {
    const s = createSettings(storage);
    assert.equal(s.sound.get(), 'on');
    s.sound.set('off');
    assert.equal(s.sound.get(), 'off');
  }
});

test('music in the background is its own setting and defaults to on', () => {
  const storage = memoryStorage();
  createSettings(storage).musicHidden.set('off');
  assert.equal(storage.data.get(MUSIC_HIDDEN_KEY), 'off');
  assert.equal(MUSIC_HIDDEN_KEY, 'crete-music-hidden');
  const again = createSettings(storage);
  assert.deepEqual([again.music.get(), again.musicHidden.get()], ['on', 'off']);
  assert.equal(createSettings(memoryStorage({ [MUSIC_HIDDEN_KEY]: 'sometimes' })).musicHidden.get(), 'on');
});
