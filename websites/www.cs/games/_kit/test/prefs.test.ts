import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pref, text, json } from '../prefs.ts';
import { memoryStorage, throwingStorage } from './record.ts';

const isNums = v => Array.isArray(v) && v.every(n => typeof n === 'number');

test('reads a value saved before prefs existed, in its old raw form', () => {
  const s = memoryStorage({ 'tankity-text': 'l', 'tankity-local': '[1,2]' });
  assert.equal(pref('tankity-text', 'm', text, s).get(), 'l');
  assert.deepEqual(pref('tankity-local', [], json(isNums), s).get(), [1, 2]);
});

test('falls back when nothing is saved or the saved value is malformed', () => {
  const s = memoryStorage({ bad: '{nope', wrong: '"str"' });
  assert.equal(pref('missing', 'm', text, s).get(), 'm');
  assert.deepEqual(pref('bad', [], json(isNums), s).get(), []);
  assert.deepEqual(pref('wrong', [], json(isNums), s).get(), []);
});

test('set writes the raw form and tells subscribers', () => {
  const s = memoryStorage();
  const p = pref('k', 'a', text, s);
  const seen = [];
  const off = p.subscribe(v => seen.push(v));
  p.set('b');
  off();
  p.set('c');
  assert.equal(s.data.get('k'), 'c');
  assert.deepEqual(seen, ['b']);
  assert.equal(p.get(), 'c');
});

test('storage that throws, or none at all, never throws back', () => {
  for (const s of [throwingStorage(), null]) {
    const p = pref('k', 'a', text, s);
    assert.equal(p.get(), 'a');
    assert.doesNotThrow(() => p.set('b'));
    assert.equal(p.get(), 'b', 'the value lives for the session');
  }
});
