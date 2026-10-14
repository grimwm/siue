// The field shop (src/shop.ts) with stubbed surroundings: a solo visit buys as
// often as the chest allows, and a room's Repair asks netBuy for what the hull
// takes, not the count on the dial.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { importTsx } from '../../_kit/test/tsx.ts';

// One bundle, so the shop and the rules share one copy of every module.
const m = await importTsx(import.meta.dirname, { sim: '../src/sim.ts', solo: '../src/solo.ts', shop: '../src/shop.ts' });
const { buildArsenal } = m.sim;
const { soloDeal } = m.solo;
const { createShop } = m.shop;

const GAME = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, '..', 'game.json'), 'utf8'));
const arsenal = buildArsenal(GAME.arsenal);

function shopFor(on, seed = 'shop') {
  const G = { body: 'tank' };
  soloDeal(G, arsenal, seed, 'normal', 720);
  Object.assign(G, { phase: 'shop', shopSel: 0, shopQty: 1, selected: 'shell' });
  const lines = [], netBuys = [], preloads = [];
  const tables = { arsenal, weapons: arsenal.weapons, shop: arsenal.shop, gear: arsenal.gear, order: arsenal.order };
  const shop = createShop({
    G, $: () => null, tables, net: { on, seats: () => [], readyNow: () => false, shopClockLeft: () => 0, closeClockLeft: () => null },
    sfx: { play() {} }, me: () => G.tanks[0], touch: false, keyHint: () => '',
    say: (t) => lines.push(t), advance() {}, render() {}, renderHUD() {}, refreshNavHints() {},
    drawShellIcon() {}, drawGearIcon() {}, openPreview() {}, nextRound() {}, openLeaveVeil() {},
    netBuy: (it, q) => netBuys.push([it.g, q]), board: () => null, preloadFx: keys => preloads.push([...keys]),
  });
  return { G, shop, lines, netBuys, preloads };
}
const rowOf = (k) => arsenal.shop.find(r => (r.kind === 'ammo' ? r.w : r.g) === k);

test('a solo visit has no cap on how many buys it makes', () => {
  const { G, shop, lines } = shopFor(false);
  G.cash = 1e6;
  const before = G.ammo.mortar ?? 0;
  for (let k = 0; k < 80; k++) shop.buyItem(rowOf('mortar'), 1);
  assert.ok(G.ammo.mortar > before, 'the buys landed');
  assert.ok(!lines.some(l => /most you can buy/.test(l)), lines.at(-1));
  assert.ok(G.cash < 1e6);
});

test('a room\'s Repair asks netBuy for what the hull takes, not the dial', () => {
  const { G, shop, netBuys, lines } = shopFor(true);
  G.armor = 30;
  shop.buyItem(rowOf('repair'), 9);
  assert.deepEqual(netBuys, [['repair', 2]]);
  G.armor = 100;
  shop.buyItem(rowOf('repair'), 9);
  assert.equal(netBuys.length, 1, 'a full hull never reaches the server');
  assert.equal(lines.at(-1), 'Armor is full already.');
});

test('a gun bought, and the rack as the round starts, get their effects fetched ahead of the first shot', () => {
  const { G, shop, preloads } = shopFor(false);
  G.cash = 1e6;
  shop.buyItem(rowOf('mortar'), 1);
  assert.deepEqual(preloads.at(-1), ['mortar']);
  shop.buyItem(rowOf('repair'), 1);
  assert.equal(preloads.length, 1, 'gear has no effects to fetch');
  shop.hideShop();
  const rack = preloads.at(-1);
  assert.ok(rack.includes('shell') && rack.includes('mortar'), rack.join(','));
  assert.ok(rack.every(k => k === 'shell' || G.ammo[k] > 0), 'only guns in the rack');
});

test('a shop row says what its gun does: a blast doubles on a direct hit, a beam and a ring do not, a tracer does no damage', () => {
  const { ammoSub } = m.shop;
  const byEffect = e => GAME.arsenal.ammo.find(a => a.effect === e);
  assert.match(ammoSub(arsenal.weapons.shell), /^34 damage, blast 26, .*Direct hits count double\.$/);
  const beam = byEffect('beam'), ring = byEffect('plasma'), tracer = byEffect('tracer');
  assert.match(ammoSub(beam), new RegExp(`^${beam.dmg} damage to every unit on its line, `));
  assert.doesNotMatch(ammoSub(beam), /double|blast/);
  assert.equal(ammoSub(ring), `Up to ${ring.dmg} damage, ring ${ring.radius} at full power, spares you; power sets its size.`);
  assert.equal(ammoSub(beam), `${beam.dmg} damage to every unit on its line, dead straight along the barrel, which dips below level; power sets its reach. Cuts through hills.`);
  assert.doesNotMatch(ammoSub(ring), /double/);
  assert.match(ammoSub(tracer), /^No damage, /);
  assert.doesNotMatch(ammoSub(tracer), /double|blast/);
  assert.match(ammoSub({ ...arsenal.weapons.shell, dmg: 0, note: undefined }), /^No damage, blast 26\.$/);
});

test('an earth gun\'s row says how it moves the ground, never that hits double', () => {
  const { ammoSub } = m.shop;
  const plain = pred => ({ ...GAME.arsenal.ammo.find(pred), note: undefined });
  assert.equal(ammoSub(plain(a => a.effect === 'dirt' && a.dmg === 0)), `No damage, a mound of dirt ${plain(a => a.effect === 'dirt' && a.dmg === 0).radius} round.`);
  const charge = plain(a => a.effect === 'dirt' && a.dmg > 0);
  assert.equal(ammoSub(charge), `${charge.dmg} damage, blast ${charge.radius}, then a mound of dirt ${charge.radius} round.`);
  const pour = plain(a => a.effect === 'pour');
  assert.equal(ammoSub(pour), `No damage, ${pour.volume} px² of liquid dirt.`);
  const digger = plain(a => a.effect === 'dig' && !a.warheads), hog = plain(a => a.effect === 'dig' && a.warheads > 0);
  assert.equal(ammoSub(digger), `No damage, burrows ${digger.digLen} on.`);
  assert.equal(ammoSub(hog), `${hog.warheads} warheads of ${hog.subDmg} damage along a ${hog.digLen} burrow.`);
  const riot = plain(a => a.effect === 'riot'), slump = plain(a => a.effect === 'slump');
  assert.equal(ammoSub(riot), `No damage, clears the earth ${riot.radius} along the barrel.`);
  assert.equal(ammoSub(slump), `No damage, slopes slump within ${slump.radius}.`);
  for (const w of GAME.arsenal.ammo.filter(a => ['dirt', 'pour', 'dig', 'riot', 'slump'].includes(a.effect))) assert.doesNotMatch(ammoSub(w), /double/, w.key);
});

test('a napalm gun\'s row says what it burns a tick and how many ticks, never that hits double', () => {
  const { ammoSub } = m.shop;
  for (const w of GAME.arsenal.ammo.filter(a => a.effect === 'napalm')) {
    const ticks = Math.floor(w.burn / w.tick + 1e-9);
    assert.equal(ammoSub({ ...w, note: undefined }), `${w.dmg} damage a tick, ${ticks} ticks, to all in a burning pool of ${w.volume} px².`);
    assert.doesNotMatch(ammoSub(w), /double/, w.key);
  }
});
