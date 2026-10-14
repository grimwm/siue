// The player's armor between rounds (src/armor.ts): max armor, a capped
// repair, a plate, what the next round musters with, and the shop's notes.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  PLATE_ARMOR, maxArmor, repairRestores, repairPacksWanted, fitPlates, carryArmor, armorLabel, repairNote, plateNote,
} from '../src/armor.ts';

test('max armor is 100 plus 25 per plate', () => {
  assert.equal(PLATE_ARMOR, 25);
  assert.equal(maxArmor(0), 100);
  assert.equal(maxArmor(3), 175);
});

test('a repair restores up to max, never beyond', () => {
  assert.equal(repairRestores(160, 3, 40, 1), 15);
  assert.equal(repairRestores(100, 0, 40, 1), 0);
  assert.equal(repairRestores(20, 0, 40, 2), 80);
  assert.equal(repairRestores(20, 0, 40, 3), 80);
});

test('packs wanted: the fewest that fill the hull, none at full armor', () => {
  assert.equal(repairPacksWanted(100, 0, 40), 0);
  assert.equal(repairPacksWanted(99, 0, 40), 1);
  assert.equal(repairPacksWanted(20, 0, 40), 2);
  assert.equal(repairPacksWanted(0, 2, 40), 4);
});

test('a plate raises max and adds 25 armor now', () => {
  assert.deepEqual(fitPlates({ armor: 60, plates: 0 }, 1), { armor: 85, plates: 1 });
  assert.deepEqual(fitPlates({ armor: 100, plates: 1 }, 2), { armor: 150, plates: 3 });
});

test('a round starts with what the last one ended with; a wreck re-musters at full max, plates kept', () => {
  assert.deepEqual(carryArmor({ armor: 125, plates: 1 }, 72, false), { armor: 72, plates: 1 });
  assert.deepEqual(carryArmor({ armor: 125, plates: 1 }, 0, true), { armor: 125, plates: 1 });
});

test('labels and shop notes', () => {
  assert.equal(armorLabel(160, 3), '160 of 175');
  assert.equal(repairNote(160, 3, 40, 1), "Restores 15 (you're at 160 of 175).");
  assert.equal(repairNote(175, 3, 40, 1), 'Armor full (175 of 175).');
  assert.equal(repairNote(20, 0, 40, 2), "Restores 80 (you're at 20 of 100).");
  assert.equal(plateNote(0), 'Max armor 100; a plate adds 25 max and 25 armor now.');
  assert.equal(plateNote(2), 'Max armor 150 (2 fitted); a plate adds 25 max and 25 armor now.');
});
