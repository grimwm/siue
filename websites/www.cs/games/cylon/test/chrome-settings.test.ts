// Players' saved settings must read back unchanged through the kit pref.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pref, json } from '../../_kit/prefs.ts';
import type { StorageLike } from '../../_kit/ports.ts';
import { memoryStorage, throwingStorage } from '../../_kit/test/record.ts';
import { DEFAULT_SETTINGS, SETTINGS_KEY, isSettings } from '../src/types.ts';

// What the chrome wrote before it used the pref: JSON.stringify of the default
// settings, with the sound volume moved and the music turned off.
const WRITTEN = '{"gameEnabled":false,"soundEnabled":true,"musicEnabled":false,"soundVolume":70,"musicVolume":50,"eyeEnabled":true}';

const open = (storage: StorageLike) => pref(SETTINGS_KEY, DEFAULT_SETTINGS, json(isSettings), storage);

test('the storage key is the one players already have', () => {
  assert.equal(SETTINGS_KEY, 'cylon-settings');
});

test('previously saved settings come back unchanged', () => {
  const saved = open(memoryStorage({ [SETTINGS_KEY]: WRITTEN })).get();
  assert.deepEqual(saved, { ...DEFAULT_SETTINGS, musicEnabled: false, soundVolume: 70 });
});

test('a partial older object still loads, over the defaults', () => {
  const saved = open(memoryStorage({ [SETTINGS_KEY]: '{"soundVolume":85}' })).get();
  assert.deepEqual({ ...DEFAULT_SETTINGS, ...saved }, { ...DEFAULT_SETTINGS, soundVolume: 85 });
});

test('nothing saved, malformed or the wrong shape gives the defaults', () => {
  for (const raw of [undefined, '', '{nope', 'null', '[1,2]', '7']) {
    const storage = memoryStorage(raw === undefined ? {} : { [SETTINGS_KEY]: raw });
    assert.deepEqual(open(storage).get(), DEFAULT_SETTINGS, String(raw));
  }
});

test('a write is stored in the same JSON shape', () => {
  const storage = memoryStorage({});
  open(storage).set({ ...DEFAULT_SETTINGS, soundVolume: 70, musicEnabled: false });
  assert.equal(storage.getItem(SETTINGS_KEY), WRITTEN);
});

test('storage that refuses writes keeps the session value', () => {
  const settings = open(throwingStorage());
  settings.set({ ...DEFAULT_SETTINGS, musicVolume: 10 });
  assert.equal(settings.get().musicVolume, 10);
});
