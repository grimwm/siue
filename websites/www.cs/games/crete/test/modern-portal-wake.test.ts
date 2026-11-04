// How Modern's Aegean Portal wakes once the last relic is taken (src/modern/portal-wake.ts): runes, then the
// keystone, then the light and the pool, then the motes.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  FLARE_AT, FLARE_MS, LIGHT_AT, LIGHT_MS, MOTES, MOTE_COUNT, MOTE_MS, RUNES_MS, RUNE_REST, WAKE_MS, flareAt, lightAt,
  moteAt, runeAt,
} from '../src/modern/portal-wake.ts';

test('the runes trace from each capital to the crown, burn bright, and settle to a faint gold', () => {
  assert.equal(runeAt(0, 0.05), 0, 'dark before the trace');
  const low = (RUNES_MS * 0.05) + 60, high = RUNES_MS * 0.95 + 60;
  assert.ok(runeAt(low, 0.05) > 0.5, 'the rune by the capital lights first');
  assert.equal(runeAt(low, 0.95), 0, 'the one by the crown is still dark');
  assert.ok(runeAt(high, 0.95) > 0.5, 'then the trace reaches the crown');
  assert.ok(runeAt(high, 0.05) < runeAt(high, 0.95), 'the first has eased back by then');
  for (const u of [0.05, 0.5, 0.95]) assert.ok(Math.abs(runeAt(WAKE_MS, u) - RUNE_REST) < 1e-9, `rune ${u} settles`);
  assert.ok(RUNE_REST > 0.05 && RUNE_REST < 0.3, 'faint, not gone');
});

test('the keystone flares as the runes reach the crown, before the light rises', () => {
  assert.equal(flareAt(FLARE_AT), 0);
  assert.ok(Math.abs(flareAt(FLARE_AT + FLARE_MS / 2) - 1) < 1e-9, 'full half way');
  assert.equal(flareAt(FLARE_AT + FLARE_MS), 0, 'and gone');
  assert.ok(FLARE_AT < RUNES_MS && FLARE_AT + FLARE_MS / 2 < LIGHT_AT + LIGHT_MS / 2, 'between the runes and the light');
  assert.equal(flareAt(WAKE_MS), 0);
});

test('the sheet of light rises and the pool fills after the keystone, and stay full', () => {
  assert.equal(lightAt(0), 0);
  assert.equal(lightAt(LIGHT_AT), 0, 'dark through the runes');
  assert.ok(LIGHT_AT > FLARE_AT, 'after the flare begins');
  const mid = lightAt(LIGHT_AT + LIGHT_MS / 2);
  assert.ok(mid > 0.3 && mid < 0.7, `half lit ${mid}`);
  assert.equal(lightAt(LIGHT_AT + LIGHT_MS), 1);
  assert.equal(lightAt(WAKE_MS), 1, 'lit at the end');
  let prev = -1;
  for (let t = 0; t <= WAKE_MS; t += 20) {
    assert.ok(lightAt(t) >= prev, 'never dims while it wakes');
    prev = lightAt(t);
  }
});

test('about a dozen motes rise from the pool once it is filling and fade before the waking ends', () => {
  assert.equal(MOTES.length, MOTE_COUNT);
  assert.ok(MOTE_COUNT >= 10 && MOTE_COUNT <= 14);
  for (const m of MOTES) {
    assert.ok(m.t0 > LIGHT_AT, 'not before the light');
    assert.ok(m.t0 + MOTE_MS <= WAKE_MS, 'gone by the end');
    assert.ok(Math.abs(m.z) <= 0.3 && m.x <= 0 && m.x >= -0.3, 'over the pool');
    assert.equal(moteAt(m.t0, m).o, 0, 'it starts unseen');
    const mid = moteAt(m.t0 + MOTE_MS / 2, m);
    assert.ok(mid.o > 0.99 && mid.up > 0.4 && mid.up < 0.6, 'bright and rising half way');
    assert.ok(moteAt(m.t0 + MOTE_MS * 0.9, m).up > mid.up, 'still rising');
    assert.equal(moteAt(WAKE_MS, m).o, 0, 'faded');
  }
  assert.ok(new Set(MOTES.map(m => m.t0)).size === MOTE_COUNT, 'they rise one after another');
});
