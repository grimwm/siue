// A player's initials: the rule, the random first set, and storage that is
// empty, junk, or refuses to save.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validInitials, randomInitials, initialsPref, readInitials, saveInitials, BLOCKED_INITIALS, INITIALS_REFUSED, INITIALS_SHORT } from '../src/initials.ts';
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

test('the three boxes read as a set, or say why not and which box to fix', () => {
  assert.deepEqual(readInitials('zed'), { initials: 'ZED' });
  assert.deepEqual(readInitials('Z D'), { problem: INITIALS_SHORT, box: 1 });
  assert.deepEqual(readInitials('Z  '), { problem: INITIALS_SHORT, box: 1 });
  assert.deepEqual(readInitials('   '), { problem: INITIALS_SHORT, box: 0 });
  assert.deepEqual(readInitials(''), { problem: INITIALS_SHORT, box: 0 });
  assert.deepEqual(readInitials('ass'), { problem: INITIALS_REFUSED, box: 0 });
  assert.match(INITIALS_SHORT, /three/);
  assert.match(INITIALS_REFUSED, /not allowed/);
});

test('a typed set is saved when allowed; a refused one leaves the saved set and says why', () => {
  const p = initialsPref(memoryStorage({ 'tankity-initials': 'ZED' }), mulberry32(1));
  assert.equal(saveInitials(p, 'abc'), '');
  assert.equal(p.get(), 'ABC');
  assert.equal(saveInitials(p, 'ASS'), INITIALS_REFUSED);
  assert.equal(p.get(), 'ABC');
});
