// The arsenal's balance, measured on the real sim (src/balance.ts): every gun
// fired at the standard scenarios, its expected damage per shot at one target
// and at three, and its damage per dollar. The invariants:
//   - NUKE does the most expected damage of any gun, at one target and at three;
//   - along each weapon line (a cat, or a `line` within it) in shop order, every
//     tier costs more per shot than the one before and, where the line does
//     damage, does more expected damage;
//   - every damage gun's damage per dollar sits within BAND_LO..BAND_HI of the
//     damage guns' median (utility and damage-over-time guns are judged by
//     their lines instead, see balanceRole);
//   - unlocks follow power: along a line minRound never falls, and a damage gun
//     UNLOCK_GAP times stronger than another never unlocks before it;
//   - every gun that flies reaches REACH_MIN of a room's field at full power
//     and its best angle, unless its row says shortRange.
// tools/balance-report.ts prints the same numbers as a table.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { buildArsenal } from '../src/sim.ts';
import { BAL_W, BAND_HI, BAND_LO, REACH_MIN, UNLOCK_GAP, fullReach, lineOf, measureArsenal, median } from '../src/balance.ts';
import { flies } from '../src/sim.ts';
import type { GunWorth } from '../src/balance.ts';

const GAME = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, '..', 'game.json'), 'utf8'));
const arsenal = buildArsenal(GAME.arsenal);
assert.ok(arsenal, 'game.json has an arsenal');
const worth = measureArsenal(arsenal);
const by = new Map(worth.map(g => [g.key, g]));
const gun = (k: string) => arsenal.weapons[k]!;
const name = (g: GunWorth) => gun(g.key).name;
const f1 = (v: number) => v.toFixed(1);
/** The strongest gun by expected damage: the row whose name is NUKE, found by its data, not a key. */
const nuke = worth.find(g => gun(g.key).name === 'NUKE');

test('the harness measures every gun, and every damage gun does damage', () => {
  assert.equal(worth.length, arsenal.order.length);
  for (const g of worth) {
    if (g.role !== 'utility') assert.ok(g.single > 0, `${name(g)} does no damage in any scenario`);
  }
});

test('NUKE does the most expected damage of any gun, at one target and at a cluster of three', () => {
  assert.ok(nuke, 'the arsenal has a NUKE');
  for (const g of worth) {
    if (g === nuke) continue;
    assert.ok(nuke.single > g.single, `${name(g)} ${f1(g.single)} vs NUKE ${f1(nuke.single)} at one target`);
    assert.ok(nuke.cluster > g.cluster, `${name(g)} ${f1(g.cluster)} vs NUKE ${f1(nuke.cluster)} at three targets`);
  }
});

const lines = new Map<string, GunWorth[]>();
for (const g of worth) {
  if (gun(g.key).pack <= 0) continue; // the free Shell heads its line at $0
  const l = lineOf(gun(g.key));
  lines.set(l, [...(lines.get(l) || []), g]);
}
const shell = worth.find(g => gun(g.key).pack <= 0 && gun(g.key).price === 0);
if (shell) lines.get(lineOf(gun(shell.key)))?.unshift(shell);

test('along each line, a bigger tier costs more per shot, does more damage and unlocks no sooner', () => {
  assert.ok(lines.size >= 8, `only ${lines.size} lines`);
  for (const [l, row] of lines) {
    const damaging = row.every(g => g.single > 0);
    for (let i = 1; i < row.length; i++) {
      const a = row[i - 1]!, b = row[i]!;
      assert.ok(b.perShot > a.perShot, `${l}: ${name(b)} $${f1(b.perShot)} a shot is not dearer than ${name(a)} $${f1(a.perShot)}`);
      if (damaging) assert.ok(b.single > a.single, `${l}: ${name(b)} ${f1(b.single)} does no more than ${name(a)} ${f1(a.single)}`);
      assert.ok(gun(b.key).minRound >= gun(a.key).minRound, `${l}: ${name(b)} unlocks before ${name(a)}`);
    }
  }
});

test('each line sits together in the shop, its tiers in order', () => {
  const shelf = arsenal.shelf;
  for (const [l, row] of lines) {
    const at = row.map(g => shelf.indexOf(g.key));
    assert.deepEqual(at, at.slice().sort((a, b) => a - b), `${l} is out of order on the shelf`);
  }
});

const damage = worth.filter(g => g.role === 'damage' && g.perDollar !== null);
const mid = median(damage.map(g => g.perDollar!));
test(`every damage gun's damage per dollar sits within ${BAND_LO}x to ${BAND_HI}x the median`, () => {
  assert.ok(damage.length >= 15, `only ${damage.length} damage guns`);
  for (const g of damage) {
    const r = g.perDollar! / mid;
    assert.ok(r >= BAND_LO && r <= BAND_HI, `${name(g)}: ${g.perDollar!.toFixed(3)} damage per dollar is ${r.toFixed(2)}x the median ${mid.toFixed(3)}`);
  }
});

test('unlocks follow power: a gun far stronger than another never unlocks before it', () => {
  const fighters = worth.filter(g => g.role === 'damage');
  for (const a of fighters) {
    for (const b of fighters) {
      if (a.single >= UNLOCK_GAP * b.single) {
        assert.ok(gun(a.key).minRound >= gun(b.key).minRound,
          `${name(a)} (${f1(a.single)}, round ${gun(a.key).minRound}) unlocks before ${name(b)} (${f1(b.single)}, round ${gun(b.key).minRound})`);
      }
    }
  }
});

test(`every gun that flies reaches ${REACH_MIN * 100}% of a room's field at full power, unless it is short-range on purpose`, () => {
  for (const k of arsenal.order) {
    const w = gun(k);
    if (!flies(w) || w.shortRange) continue;
    const r = fullReach(w);
    assert.ok(r >= REACH_MIN * BAL_W, `${w.name} reaches ${r.toFixed(0)} px of ${BAL_W} (speed ${w.speed})`);
  }
});

test('the measure is the sim\'s: the same arsenal gives the same numbers', () => {
  const k = must(nuke).key;
  assert.deepEqual(measureArsenal({ ...arsenal, order: [k] })[0], by.get(k));
});

function must<T>(v: T | undefined): T {
  assert.ok(v !== undefined);
  return v;
}
