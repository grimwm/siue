// The Weapon button's second line: damage, then a blast size from the radius.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { blastSize, weaponLine, weaponLineSpoken, BLAST_CUTOFFS } from '../src/weapon-label.ts';

import type { Weapon } from '../src/sim.ts';

function must<T>(v: T | null | undefined, what: string): T {
  assert.ok(v !== null && v !== undefined, `${what} is missing`);
  return v;
}

const GAME: { arsenal: { ammo: Weapon[] } } = JSON.parse(fs.readFileSync(new URL('../game.json', import.meta.url), 'utf8'));
const gun = (key: string) => must(GAME.arsenal.ammo.find(a => a.key === key), `the ${key} row`);

test('the cut-offs: below 20 is S, 20 up to 40 is M, 40 and up is L', () => {
  assert.deepEqual(BLAST_CUTOFFS, { smallBelow: 20, largeFrom: 40 });
  assert.deepEqual([0, 19, 19.9, 20, 39, 39.9, 40, 70].map(blastSize), ['S', 'S', 'S', 'M', 'M', 'M', 'L', 'L']);
});

test('the shipped guns read the way the deck shows them', () => {
  assert.equal(weaponLine(gun('shell')), '34 dmg · M');
  assert.equal(blastSize(gun('rail').radius), 'S');
  assert.equal(blastSize(gun('mortar').radius), 'L');
  assert.equal(blastSize(gun('nuke').radius), 'L');
  for (const w of GAME.arsenal.ammo) assert.match(weaponLine(w), /^(\d+ dmg(\/tick)?|no damage) · (S|M|L|beam|path|earth|fire)$/, w.key);
});

test('readers hear the words, not the letters', () => {
  assert.equal(weaponLineSpoken(gun('shell')), '34 damage, medium blast');
  assert.equal(weaponLineSpoken({ dmg: 90, radius: 70 }), '90 damage, large blast');
  assert.equal(weaponLineSpoken({ dmg: 60, radius: 14 }), '60 damage, small blast');
});

test('a harmless gun reads no damage and what it does; a beam reads its damage and beam', () => {
  const byEffect = (e: string) => must(GAME.arsenal.ammo.find(a => a.effect === e), `a ${e} gun`);
  assert.equal(weaponLine({ dmg: 0, radius: 0, effect: 'tracer' }), 'no damage · path');
  assert.equal(weaponLine(byEffect('tracer')), 'no damage · path');
  assert.equal(weaponLine({ dmg: 45, radius: 6, effect: 'beam' }), '45 dmg · beam');
  assert.equal(weaponLine(byEffect('beam')), `${byEffect('beam').dmg} dmg · beam`);
  assert.equal(weaponLineSpoken({ dmg: 0, radius: 0, effect: 'tracer' }), 'no damage, shows its path');
  assert.equal(weaponLineSpoken({ dmg: 45, radius: 6, effect: 'beam' }), '45 damage, beam');
  assert.equal(weaponLine({ dmg: 60, radius: 90, effect: 'plasma' }), '60 dmg · L', 'a ring reads its size as a blast does');
  assert.equal(weaponLine({ dmg: 0, radius: 45, effect: 'shot' }), 'no damage · L', 'a harmless blast keeps its size');
});

test('an earth gun reads earth; one that bursts as it lands (Dirt Charge) reads its blast; a sandhog its warheads\' damage', () => {
  const find = (pred: (a: Weapon) => boolean) => must(GAME.arsenal.ammo.find(pred), 'a matching gun');
  assert.equal(weaponLine(find(a => a.effect === 'dirt' && a.dmg === 0)), 'no damage · earth');
  const charge = find(a => a.effect === 'dirt' && a.dmg > 0);
  assert.equal(weaponLine(charge), `${charge.dmg} dmg · L`);
  const hog = find(a => a.effect === 'dig' && Number(a.warheads) > 0);
  assert.equal(weaponLine(hog), `${hog.subDmg} dmg · earth`);
  assert.equal(weaponLine(find(a => a.effect === 'riot')), 'no damage · earth');
  assert.equal(weaponLineSpoken(find(a => a.effect === 'slump')), 'no damage, moves earth');
});

test('a napalm gun reads its damage a tick, and fire', () => {
  for (const w of GAME.arsenal.ammo.filter(a => a.effect === 'napalm')) {
    assert.equal(weaponLine(w), `${w.dmg} dmg/tick · fire`, w.key);
    assert.equal(weaponLineSpoken(w), `${w.dmg} damage a tick, burns`, w.key);
  }
});
