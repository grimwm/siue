// The look's switchable choices: what ships, and how a sample overrides them.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { VARIANT, VARIANT_KEY, withOverrides } from '../src/modern/variants.ts';

test('with no override, the choices are what ships', () => {
  assert.deepEqual(withOverrides(null), VARIANT);
  assert.equal(VARIANT_KEY, 'crete-variant');
});

test('an override sets only the choices it names, and only to known values', () => {
  const v = withOverrides(JSON.stringify({ items: 'plate', beacon: true, steep: 'yes', caps: true, colour: 'blue' }));
  assert.equal(v.items, 'plate');
  assert.equal(v.beacon, true);
  assert.equal(v.steep, VARIANT.steep, 'a non-boolean is ignored');
  assert.equal(v.caps, true, 'caps set on, unlike the default');
  assert.equal(withOverrides(JSON.stringify({ items: 'gold' })).items, VARIANT.items);
});

test('a malformed override is ignored', () => {
  for (const raw of ['{', '42', 'null', '"cyan"', '[]']) assert.deepEqual(withOverrides(raw), VARIANT, raw);
});
