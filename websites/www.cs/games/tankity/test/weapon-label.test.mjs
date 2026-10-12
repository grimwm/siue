// The Weapon button's second line: damage, then a blast size from the radius.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { blastSize, weaponLine, BLAST_CUTOFFS } from '../src/weapon-label.ts';

const GAME = JSON.parse(fs.readFileSync(new URL('../game.json', import.meta.url), 'utf8'));
const gun = key => GAME.arsenal.ammo.find(a => a.key === key);

test('the cut-offs: below 20 is S, 20 up to 40 is M, 40 and up is L', () => {
  assert.deepEqual(BLAST_CUTOFFS, { smallBelow: 20, largeFrom: 40 });
  assert.deepEqual([0, 19, 19.9, 20, 39, 39.9, 40, 70].map(blastSize), ['S', 'S', 'S', 'M', 'M', 'M', 'L', 'L']);
});

test('the shipped guns read the way the deck shows them', () => {
  assert.equal(weaponLine(gun('shell')), '34 dmg · M');
  assert.equal(blastSize(gun('rail').radius), 'S');
  assert.equal(blastSize(gun('mortar').radius), 'L');
  assert.equal(blastSize(gun('nuke').radius), 'L');
  for (const w of GAME.arsenal.ammo) assert.match(weaponLine(w), /^\d+ dmg · [SML]$/, w.key);
});
