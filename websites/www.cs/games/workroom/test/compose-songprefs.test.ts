// The composer's Click, count-in and stay-in-key switches are remembered on the device; anything unreadable is off.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_SONG_PREFS, SONG_PREFS_KEY, songPrefs } from '../src/compose/songprefs.ts';

const memory = (init: Record<string, string> = {}) => {
  const m = new Map(Object.entries(init));
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => { m.set(k, v); }, removeItem: (k: string) => { m.delete(k); } };
};

test('the switches start off and are remembered', () => {
  const s = memory();
  assert.deepEqual(songPrefs(s).get(), DEFAULT_SONG_PREFS);
  songPrefs(s).set({ click: true, countIn: true, inKey: false });
  assert.deepEqual(songPrefs(s).get(), { click: true, countIn: true, inKey: false });
});

test('a broken or odd stored value reads as off', () => {
  assert.deepEqual(songPrefs(memory({ [SONG_PREFS_KEY]: '{oops' })).get(), DEFAULT_SONG_PREFS);
  assert.deepEqual(songPrefs(memory({ [SONG_PREFS_KEY]: '{"click":"yes","inKey":true}' })).get(), { click: false, countIn: false, inKey: true });
  assert.deepEqual(songPrefs(null).get(), DEFAULT_SONG_PREFS);
});
