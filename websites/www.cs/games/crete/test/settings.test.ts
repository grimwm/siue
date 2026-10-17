import { test } from 'node:test';
import assert from 'node:assert/strict';
import { memoryStorage, throwingStorage } from '../../_kit/test/record.ts';
import { createSettings, FULLSCREEN_KEY, SOUND_KEY } from '../src/settings.ts';

test('defaults: sound on, fullscreen off', () => {
  const s = createSettings(memoryStorage());
  assert.deepEqual([s.sound.get(), s.fullscreen.get()], ['on', 'off']);
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
