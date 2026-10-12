// A player's initials: the rule, the random first set, and storage that is
// empty, junk, or refuses to save.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validInitials, randomInitials, initialsPref, BLOCKED_INITIALS } from '../src/initials.ts';
import { mulberry32 } from '../../_kit/test/rng.ts';
import { memoryStorage, throwingStorage } from '../../_kit/test/record.ts';

test('three letters in either case come back uppercase; anything else is refused', () => {
  assert.equal(validInitials('abc'), 'ABC');
  assert.equal(validInitials('ZeD'), 'ZED');
  assert.equal(validInitials(' zed '), 'ZED');
  for (const bad of ['ab', 'abcd', 'a1c', '', 'äbc', null, undefined, 123]) assert.equal(validInitials(bad), null, String(bad));
});

test('blocked words are refused in any case', () => {
  assert.ok(BLOCKED_INITIALS.includes('ASS'));
  assert.equal(validInitials('ass'), null);
  assert.equal(validInitials('KkK'), null);
});

test('random initials are three uppercase letters and never a blocked word', () => {
  const rng = mulberry32(7);
  for (let i = 0; i < 2000; i++) {
    const s = randomInitials(rng);
    assert.match(s, /^[A-Z]{3}$/);
    assert.ok(!BLOCKED_INITIALS.includes(s), s);
  }
});

test('a generator stuck on a blocked word still ends, on a fixed set', () => {
  const k = (10 + 0.5) / 26; // always "K": KKK is blocked
  assert.equal(randomInitials(() => k), 'TNK');
});

test('a browser with none gets random initials, saved once', () => {
  const storage = memoryStorage();
  const first = initialsPref(storage, mulberry32(1)).get();
  assert.match(first, /^[A-Z]{3}$/);
  assert.equal(storage.getItem('tankity-initials'), first);
  assert.equal(initialsPref(storage, mulberry32(2)).get(), first);
});

test('saved initials come back uppercase; junk or a blocked word is replaced', () => {
  assert.equal(initialsPref(memoryStorage({ 'tankity-initials': 'zed' }), mulberry32(1)).get(), 'ZED');
  for (const junk of ['a1', 'ass', '{"x":1}']) {
    const storage = memoryStorage({ 'tankity-initials': junk });
    const got = initialsPref(storage, mulberry32(3)).get();
    assert.match(got, /^[A-Z]{3}$/);
    assert.equal(storage.getItem('tankity-initials'), got);
  }
});

test('storage that throws still gives initials for the session', () => {
  const p = initialsPref(throwingStorage(), mulberry32(4));
  const got = p.get();
  assert.match(got, /^[A-Z]{3}$/);
  p.set('ZED');
  assert.equal(p.get(), 'ZED');
});
