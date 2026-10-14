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
    G, $: () => null, tables, net: { on, seats: () => [], readyNow: () => false, shopClockLeft: () => 0 },
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
  assert.match(ammoSub(ring), new RegExp(`^${ring.dmg} damage, ring ${ring.radius} at full power, `));
  assert.doesNotMatch(ammoSub(ring), /double/);
  assert.match(ammoSub(tracer), /^No damage, /);
  assert.doesNotMatch(ammoSub(tracer), /double|blast/);
  assert.match(ammoSub({ ...arsenal.weapons.shell, dmg: 0, note: undefined }), /^No damage, blast 26\.$/);
});
