import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pref, text, json, oneOf } from '../prefs.ts';
import { memoryStorage, throwingStorage } from './record.ts';

const isNums = (v: unknown): v is number[] => Array.isArray(v) && v.every(n => typeof n === 'number');

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
  const seen: string[] = [];
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

test('oneOf keeps a listed word and reads any other stored word as the fallback', () => {
  const size = oneOf(['s', 'm', 'l'], 'm');
  assert.equal(size.parse('l'), 'l');
  for (const bad of ['xl', '', 'L', '__proto__', 'toString']) assert.equal(size.parse(bad), 'm', bad);
  assert.equal(size.stringify('s'), 's');
  assert.equal(pref('k', 'm', size, memoryStorage({ k: 'huge' })).get(), 'm');
  const stored = memoryStorage({ k: 's' });
  assert.equal(pref('k', 'm', size, stored).get(), 's');
  const p = pref('k', 'm', size, stored);
  p.set('l');
  assert.equal(stored.getItem('k'), 'l'); // the raw word, as a text pref stored it
});
