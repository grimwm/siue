// What a drone buys (src/drones.ts): each personality's choices on fixed inputs, the budget, the reserve, the
// caps, the shapeshifter's shifts, and that a drone buys through the player's own function. The server's twin
// is pinned to these by the 'drone-shop' and 'drone-deal' groups of test/sim-vectors.test.ts.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { buildArsenal } from '../src/sim.ts';
import type { Arsenal, Personality } from '../src/sim.ts';
import { dealDrone, droneForm, droneRng, droneShop, droneVisit, personalityOf, shopRowOf } from '../src/drones.ts';
import type { Drone, DroneView } from '../src/drones.ts';
import { soloBuy, buyPacks } from '../src/buy.ts';
import { maxArmor } from '../src/armor.ts';
import { soloDeal } from '../src/solo.ts';
import type { SoloState } from '../src/solo.ts';

const GAME: { arsenal: Parameters<typeof buildArsenal>[0]; drones: Parameters<typeof buildArsenal>[1] } =
  JSON.parse(fs.readFileSync(path.join(import.meta.dirname, '..', 'game.json'), 'utf8'));
const arsenal: Arsenal = (() => { const a = buildArsenal(GAME.arsenal, GAME.drones); assert.ok(a, 'game.json has an arsenal'); return a; })();
const RULED = arsenal.drones.filter(p => p.shift === undefined);
const SHIFTERS = arsenal.drones.filter(p => p.shift !== undefined);

const fresh = (over: Partial<DroneView> = {}): DroneView => ({ cash: 600, armor: 100, plate: 0, chutes: 0, shield: false, ...over });
const personality = (key: string): Personality => {
  const p = personalityOf(arsenal, key);
  assert.ok(p, `game.yaml has a ${key} personality`);
  return p;
};
const gunsFor = (left: number) => arsenal.order.filter(k => {
  const a = arsenal.weapons[k]!;
  return a.ai && a.pack > 0 && a.price > 0 && a.dmg > 0 && a.price <= left;
});
const best = (keys: string[], score: (k: string) => number): number => Math.max(...keys.map(score));
const w = (k: string) => arsenal.weapons[k]!;
const spend = (buys: { item: string; qty: number }[]) => buys.reduce((n, b) => {
  const row = shopRowOf(arsenal, b.item);
  assert.ok(row, `${b.item} is for sale`);
  return n + (row.price || 0) * b.qty;
}, 0);
const isGun = (item: string) => item in arsenal.weapons;
const rngFor = (seed: string, round = 1, seat = 1) => droneRng(seed, round, seat);

test('the personalities come from game.yaml: five with rules and a shapeshifter without', () => {
  assert.ok(RULED.length >= 2 && SHIFTERS.length >= 1);
  for (const p of RULED) {
    assert.ok(p.reserve! >= 0 && p.reserve! <= 0.9, p.key);
    assert.ok(p.defense! >= 0 && p.defense! <= 1, p.key);
    assert.ok(p.maxBuys! >= 1 && p.maxBuys! <= 12, p.key);
  }
  for (const p of SHIFTERS) assert.deepEqual([p.reserve, p.defense, p.pick, p.maxBuys], [undefined, undefined, undefined, undefined]);
});

test('each personality picks guns the way its rule says: the best of the guns it can afford', () => {
  for (const p of RULED) {
    for (const cash of [250, 600, 1500, 5000]) {
      const state = fresh({ cash });
      const budget = Math.floor(cash * (1 - p.reserve!));
      const defBudget = Math.floor(budget * p.defense!);
      const buys = droneShop(state, arsenal, p, rngFor('pick'));
      const guns = buys.filter(b => isGun(b.item));
      if (!guns.length) continue;
      // The first gun is picked with what is left after the defense it bought.
      const left = budget - spend(buys.filter(b => !isGun(b.item)));
      assert.ok(defBudget >= 0);
      const first = guns[0]!.item;
      const keys = gunsFor(left);
      assert.ok(keys.includes(first), `${p.key} $${cash}: ${first} is affordable and an ai gun`);
      if (p.pick === 'big') assert.equal(w(first).price, best(keys, k => w(k).price), `${p.key} $${cash}: the dearest it can afford`);
      if (p.pick === 'value') assert.equal((w(first).dmg * w(first).pack) / w(first).price, best(keys, k => (w(k).dmg * w(k).pack) / w(k).price), `${p.key} $${cash}`);
      if (p.pick === 'precise') assert.equal(w(first).dmg / w(first).radius / w(first).pack, best(keys, k => w(k).dmg / w(k).radius / w(k).pack), `${p.key} $${cash}`);
    }
  }
});

test('a random pick is a seeded draw weighted by price, and differs between seeds', () => {
  const gambler = RULED.find(p => p.pick === 'random');
  assert.ok(gambler, 'game.yaml has a random pick');
  const a = droneShop(fresh({ cash: 5000 }), arsenal, gambler, rngFor('a'));
  assert.deepEqual(droneShop(fresh({ cash: 5000 }), arsenal, gambler, rngFor('a')), a, 'the same seed buys the same');
  const seen = new Set<string>();
  for (let i = 0; i < 40; i++) for (const b of droneShop(fresh({ cash: 5000 }), arsenal, gambler, rngFor(`s${i}`))) if (isGun(b.item)) seen.add(b.item);
  assert.ok(seen.size >= 5, `a gambler tries many guns: ${[...seen].join()}`);
  // Weighted by price: over many draws the dearest gun is bought more often than the cheapest.
  const keys = gunsFor(5000).sort((x, y) => w(x).price - w(y).price);
  const cheap = keys[0]!, dear = keys[keys.length - 1]!;
  const tally: Record<string, number> = {};
  for (let i = 0; i < 400; i++) {
    const only = { ...gambler, maxBuys: 1, defense: 0 };
    for (const b of droneShop(fresh({ cash: 5000 }), arsenal, only, rngFor(`w${i}`))) tally[b.item] = (tally[b.item] || 0) + 1;
  }
  assert.ok((tally[dear] || 0) > (tally[cheap] || 0), JSON.stringify(tally));
});

test('never over budget, never past the reserve, never a gun without the ai flag, whatever the purse and the hull', () => {
  const states: DroneView[] = [];
  for (const cash of [0, 59, 60, 119, 120, 301, 600, 777, 2500, 99999]) {
    for (const [armor, plate] of [[100, 0], [3, 0], [40, 2], [125, 1], [1, 4]] as [number, number][]) {
      for (const chutes of [0, 1]) states.push({ cash, armor, plate, chutes, shield: chutes === 1 });
    }
  }
  for (const p of RULED) {
    for (const state of states) {
      for (const seed of ['x', 'y']) {
        const buys = droneShop(state, arsenal, p, rngFor(seed));
        const budget = Math.floor(state.cash * (1 - p.reserve!));
        assert.ok(spend(buys) <= budget, `${p.key} $${state.cash}: spent ${spend(buys)} of ${budget}`);
        assert.ok(state.cash - spend(buys) >= state.cash * p.reserve!, `${p.key} $${state.cash}: the reserve`);
        assert.ok(buys.length <= p.maxBuys!, `${p.key}: ${buys.length} buys`);
        for (const b of buys) {
          assert.ok(b.qty >= 1 && b.qty <= 9, 'one to nine packs a buy');
          if (isGun(b.item)) assert.ok(w(b.item).ai, `${p.key} bought ${b.item}, which a drone may not use`);
        }
        // The player's own function takes every purchase: it never refuses, never overspends.
        const wallet = { ...droneVisitWallet(state) };
        for (const b of buys) {
          const row = shopRowOf(arsenal, b.item)!;
          const r = soloBuy(wallet, row, b.qty);
          assert.ok(r.ok, `${p.key} $${state.cash}: ${b.item} refused (${r.ok ? '' : r.why})`);
          if (r.ok) assert.equal(r.qty, b.qty, `${b.item}: the buy function takes exactly the packs asked`);
        }
        assert.ok(wallet.cash >= 0);
        assert.equal(wallet.cash, state.cash - spend(buys));
      }
    }
  }
});
function droneVisitWallet(s: DroneView) {
  return { cash: s.cash, ammo: { shell: Infinity }, armor: s.armor, plate: s.plate, fuelBank: 0, shield: s.shield, lives: 0, score: 0, jammer: 0, bunker: 0, laststand: false, chutes: s.chutes };
}

test('one-shot gear is bought once and only when it is useful: a shield never twice, a parachute only with none, repair only up to a full hull', () => {
  for (const p of RULED) {
    for (const state of [fresh({ cash: 99999 }), fresh({ cash: 99999, chutes: 3, shield: true }), fresh({ cash: 99999, armor: 10 })]) {
      const buys = droneShop(state, arsenal, { ...p, defense: 1, maxBuys: 12 }, rngFor('caps'));
      const effect = (item: string) => shopRowOf(arsenal, item)?.effect;
      const shields = buys.filter(b => effect(b.item) === 'shield');
      const chutes = buys.filter(b => effect(b.item) === 'parachute');
      assert.ok(shields.length <= 1 && shields.every(b => b.qty === 1), `${p.key}: shields ${JSON.stringify(shields)}`);
      assert.ok(chutes.length <= 1 && chutes.every(b => b.qty === 1), `${p.key}: chutes`);
      if (state.shield) assert.equal(shields.length, 0, 'it has a shield');
      if (state.chutes > 0) assert.equal(chutes.length, 0, 'it has a parachute');
      for (const b of buys.filter(x => effect(x.item) === 'repair')) {
        const row = shopRowOf(arsenal, b.item)!;
        assert.ok(b.qty <= buyPacks({ armor: state.armor, plate: state.plate }, row, 9), 'repair up to a full hull and no more');
        assert.ok(state.armor < maxArmor(state.plate), 'a full hull wants no repair');
      }
    }
  }
  // A full hull buys no repair at all.
  for (const p of RULED) {
    const buys = droneShop(fresh({ cash: 99999 }), arsenal, { ...p, defense: 1, maxBuys: 12 }, rngFor('full'));
    assert.equal(buys.filter(b => shopRowOf(arsenal, b.item)?.effect === 'repair').length, 0, p.key);
  }
});

test('the turtle buys repair first when it is damaged, then a parachute, a plate and a shield', () => {
  const turtle = personality('turtle');
  const buys = droneShop(fresh({ cash: 2500, armor: 40, plate: 1 }), arsenal, turtle, rngFor('t'));
  const effects = buys.map(b => shopRowOf(arsenal, b.item)!.effect);
  assert.deepEqual(effects.slice(0, 4), ['repair', 'parachute', 'plate', 'shield']);
  const repair = buys[0]!;
  const row = shopRowOf(arsenal, repair.item)!;
  assert.equal(repair.qty, buyPacks({ armor: 40, plate: 1 }, row, 9), 'as many packs as the hull needs, 9 at most, while its defense share lasts');
  // Undamaged: no repair.
  assert.notEqual(shopRowOf(arsenal, droneShop(fresh({ cash: 2500 }), arsenal, turtle, rngFor('t'))[0]!.item)!.effect, 'repair');
});

test('the defense share caps what the defense costs; the rest buys guns', () => {
  for (const p of RULED) {
    const state = fresh({ cash: 2000, armor: 20 });
    const buys = droneShop(state, arsenal, p, rngFor('d'));
    const budget = Math.floor(2000 * (1 - p.reserve!));
    assert.ok(spend(buys.filter(b => !isGun(b.item))) <= Math.floor(budget * p.defense!), `${p.key}: defense within its share`);
  }
});

test('the shapeshifter shifts by its own probability, never lands on itself, and is deterministic from the seed', () => {
  assert.ok(SHIFTERS.length > 0);
  for (const s of SHIFTERS) {
    for (const seed of ['alpha', 'beta', 'gamma', 'scorched-4242']) {
      const run = (): string[] => {
        const d = { personality: s.key, form: dealDrone(arsenal, seed, 3).form };
        const forms = [d.form];
        for (let round = 0; round < 300; round++) {
          d.form = droneForm(arsenal, d, round, droneRng(seed, round, 3));
          forms.push(d.form);
        }
        return forms;
      };
      const forms = run();
      assert.deepEqual(run(), forms, `${seed}: the same seed shifts the same way`);
      for (const f of forms) {
        assert.notEqual(f, s.key, 'it never takes its own form');
        assert.ok(RULED.some(p => p.key === f), `${f} has rules of its own`);
      }
      const shifts = forms.slice(1).filter((f, i) => f !== forms[i]).length;
      // 300 rounds at 0.35, less the draws that land on the form it already wears: well inside these bounds.
      assert.ok(shifts > 30 && shifts < 200, `${seed}: ${shifts} shifts in 300 rounds`);
    }
    // Round 0 is the pre-match shop: it wears its first form.
    const d = { personality: s.key, form: RULED[0]!.key };
    for (let i = 0; i < 50; i++) assert.equal(droneForm(arsenal, d, 0, droneRng(`z${i}`, 0, 1)), d.form);
  }
  // A drone with rules of its own never changes.
  const turtle = { personality: 'turtle', form: 'turtle' };
  for (let round = 0; round < 20; round++) assert.equal(droneForm(arsenal, turtle, round, droneRng('q', round, 1)), 'turtle');
});

test('a personality is dealt from the seed and the seat, uniformly over the list', () => {
  const tally: Record<string, number> = {};
  for (let i = 0; i < 1200; i++) {
    const d = dealDrone(arsenal, `seed${i}`, 1 + (i % 3));
    tally[d.personality] = (tally[d.personality] || 0) + 1;
  }
  for (const p of arsenal.drones) assert.ok((tally[p.key] || 0) > 120 && (tally[p.key] || 0) < 300, `${p.key}: ${tally[p.key]} of 1200`);
  assert.deepEqual(dealDrone(arsenal, 'alpha', 2), dealDrone(arsenal, 'alpha', 2));
  assert.ok(new Set([1, 2, 3, 4, 5, 6].map(s => dealDrone(arsenal, 'alpha', s).personality)).size > 1, 'the seat is part of the draw');
});

test('a visit buys through the player\'s buy function and leaves the wallet as the purchases say', () => {
  const d: Drone = dealDrone(arsenal, 'visit', 1);
  d.armor = 30;
  d.cash = 1200;
  const before = { ...d, ammo: { ...d.ammo } };
  const done = droneVisit(d, arsenal, 'visit', 1, 1);
  const total = spend(done);
  assert.equal(d.cash, before.cash - total);
  for (const b of done.filter(x => isGun(x.item))) assert.ok(d.ammo![b.item]! > (before.ammo[b.item] || 0), b.item);
  assert.ok(d.cash >= 0);
});

test('shopping never touches the match\'s shot stream: the same deal with and without personalities leaves G.rng where it was', () => {
  const bare = buildArsenal(GAME.arsenal);
  assert.ok(bare);
  const a = { body: 'tank' } as SoloState, b = { body: 'tank' } as SoloState;
  soloDeal(a, arsenal, 'stream', 'normal', 720);
  soloDeal(b, bare, 'stream', 'normal', 720);
  assert.deepEqual([a.rng(), a.rng(), a.rng()], [b.rng(), b.rng(), b.rng()]);
  assert.ok(a.drones.some(d => d.cash < 600), 'the drones did shop');
});

test('a value pick buys no more than two packs of any one gun in a visit, and spreads over several', () => {
  const rich = { ...personality('scrapper'), maxBuys: 12 };
  assert.equal(rich.pick, 'value');
  for (const cash of [600, 1500, 4000, 20000]) {
    const guns = droneShop(fresh({ cash }), arsenal, rich, rngFor('cap')).filter(b => isGun(b.item));
    const tally: Record<string, number> = {};
    for (const b of guns) tally[b.item] = (tally[b.item] || 0) + b.qty;
    assert.ok(Object.values(tally).every(n => n <= 2), `$${cash}: ${JSON.stringify(tally)}`);
    if (guns.length > 2) assert.ok(Object.keys(tally).length >= 2, `$${cash}: spread over several guns`);
  }
  // A big pick is not capped: with enough money it may buy the same dear gun again.
  const saver = { ...personality('saver'), reserve: 0, maxBuys: 12 };
  const again = droneShop(fresh({ cash: 20000 }), arsenal, saver, rngFor('big'));
  assert.ok(again.filter(b => isGun(b.item)).length > 2 && new Set(again.map(b => b.item)).size < again.length);
});

test('a big pick saves up for the dearest gun it can afford, a precise pick takes the tight hard hit: the personalities do not all buy alike', () => {
  const saver = personality('saver'), scrapper = personality('scrapper'), sniper = personality('sniper');
  const list = (p: Personality, cash: number) => JSON.stringify(droneShop(fresh({ cash }), arsenal, p, rngFor('distinct')));
  for (const cash of [600, 1500, 4000]) {
    const lists = new Set([list(saver, cash), list(scrapper, cash), list(sniper, cash)]);
    assert.ok(lists.size >= 2, `$${cash}: all three bought the same: ${[...lists][0]}`);
  }
  // Across the three purses together all three differ from each other.
  const all = (p: Personality) => [600, 1500, 4000].map(c => list(p, c)).join('|');
  assert.equal(new Set([all(saver), all(scrapper), all(sniper)]).size, 3);
  // Saver's first gun is the dearest within its reserve at each purse.
  for (const cash of [600, 1500, 4000]) {
    const budget = Math.floor(cash * (1 - saver.reserve!));
    const keys = gunsFor(budget);
    const first = droneShop(fresh({ cash }), arsenal, saver, rngFor('distinct')).find(b => isGun(b.item));
    if (keys.length && first) assert.equal(w(first.item).price, Math.max(...keys.map(k => w(k).price)));
  }
});
