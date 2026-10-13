// The shop's wiring to the round recorder and to a room's server: a solo buy
// lands in G.rec, the 61st buy of a visit is refused with a line, the next
// visit starts counting again, and a room's Repair asks netBuy for what the hull
// takes, not the count on the dial.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { importTsx } from '../../_kit/test/tsx.ts';

// One bundle, so the shop and the rules share one copy of every module.
const m = await importTsx(import.meta.dirname, {
  sim: '../src/sim.ts', solo: '../src/solo.ts', log: '../src/solo-log.ts', play: '../src/solo-play.ts', shop: '../src/shop.ts',
});
const { buildArsenal } = m.sim;
const { soloDeal } = m.solo;
const { ROUND_MAX_BUYS, clearRound, newRecorder } = m.log;
const { blankSolo, soloRound } = m.play;
const { createShop } = m.shop;

const GAME = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, '..', 'game.json'), 'utf8'));
const arsenal = buildArsenal(GAME.arsenal);

function shopFor(on, seed = 'rec') {
  const G = blankSolo();
  soloDeal(G, arsenal, seed, 'normal', 720);
  Object.assign(G, { phase: 'shop', shopSel: 0, shopQty: 1, selected: 'shell', rec: newRecorder() });
  const lines = [], netBuys = [];
  const tables = { arsenal, weapons: arsenal.weapons, shop: arsenal.shop, gear: arsenal.gear, order: arsenal.order };
  const shop = createShop({
    G, $: () => null, tables, net: { on, seats: () => [], readyNow: () => false, shopClockLeft: () => 0 },
    sfx: { play() {} }, me: () => G.tanks[0], touch: false, keyHint: () => '',
    say: (t) => lines.push(t), advance() {}, render() {}, renderHUD() {}, refreshNavHints() {},
    drawShellIcon() {}, drawGearIcon() {}, openPreview() {}, nextRound() {}, openLeaveVeil() {},
    netBuy: (it, q) => netBuys.push([it.g, q]), board: () => null,
  });
  return { G, shop, lines, netBuys };
}
const rowOf = (k) => arsenal.shop.find(r => (r.kind === 'ammo' ? r.w : r.g) === k);

test('a solo buy lands in the recorder with the count sold', () => {
  const { G, shop } = shopFor(false);
  G.cash = 5000;
  shop.buyItem(rowOf('mortar'), 3);
  assert.deepEqual(G.rec.buys, [{ i: 'mortar', q: 3 }]);
});

test('buy 61 of a visit is refused with a line, and the server\'s buy checks take sixty', () => {
  const { G, shop, lines } = shopFor(false);
  G.cash = 1e6;
  for (let k = 0; k < ROUND_MAX_BUYS; k++) shop.buyItem(rowOf('mortar'), 1);
  assert.equal(G.rec.buys.length, ROUND_MAX_BUYS);
  const cash = G.cash;
  shop.buyItem(rowOf('mortar'), 1);
  assert.equal(G.rec.buys.length, ROUND_MAX_BUYS);
  assert.equal(G.cash, cash, 'nothing was charged');
  assert.match(lines.at(-1), /most you can buy in one shop visit/);

  // The same 60 buys, played from a fresh deal as the server would: they get
  // past its buy checks (the round then waits for shots, which this test has none of).
  const fresh = blankSolo();
  soloDeal(fresh, arsenal, 'rec', 'normal', 720);
  fresh.cash = 1e6;
  const res = soloRound(fresh, arsenal, G.rec.buys, []);
  assert.equal(res.ok, false);
  assert.notEqual(res.error, 'bad buys', 'sixty buys are within the limit');
  assert.notEqual(res.error, 'bad buy', 'and every one is a legal purchase');
  assert.equal(res.error, 'unfinished');
  const over = blankSolo();
  soloDeal(over, arsenal, 'rec', 'normal', 720);
  over.cash = 1e6;
  assert.deepEqual(soloRound(over, arsenal, [...G.rec.buys, G.rec.buys[0]], []), { ok: false, error: 'bad buys' }, 'sixty-one is what the server refuses');
});

test('a new round\'s shop visit buys again after sixty in the last one', () => {
  const { G, shop, lines } = shopFor(false);
  G.cash = 1e6;
  for (let k = 0; k <= ROUND_MAX_BUYS; k++) shop.buyItem(rowOf('mortar'), 1);
  assert.match(lines.at(-1), /most you can buy/);
  clearRound(G.rec); // what the match does when a round ends
  shop.buyItem(rowOf('mortar'), 2);
  assert.deepEqual(G.rec.buys, [{ i: 'mortar', q: 2 }]);
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
