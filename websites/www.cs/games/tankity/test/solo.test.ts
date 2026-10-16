// The solo rules (src/solo.ts) without a page: the deal, a round's muster,
// settling a volley, the turn order and 1-ups.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { buildArsenal, SPAWN_GAP, startAmmo, TUNE, surfY } from '../src/sim.ts';
import type { Arsenal, ShopRow, Weapon } from '../src/sim.ts';
import type { Difficulty } from '../src/ai.ts';
import { buyPacks, soloAim, soloBuy, soloDeal, soloMuster, soloSettle, soloNextTurn, soloOneUps, snapTanks } from '../src/solo.ts';
import type { BuyResult, Settled, SoloState } from '../src/solo.ts';

/** game.json, as far as these cases read it: the arsenal rows. */
const GAME: { arsenal: NonNullable<Parameters<typeof buildArsenal>[0]> & { ammo: Weapon[] }; drones: Parameters<typeof buildArsenal>[1] } =
  JSON.parse(fs.readFileSync(path.join(import.meta.dirname, '..', 'game.json'), 'utf8'));
const arsenal: Arsenal = (() => { const a = buildArsenal(GAME.arsenal, GAME.drones); assert.ok(a, 'game.json has an arsenal'); return a; })();

/** Item `i` of a list the case reads, which must be there. */
function nth<T>(list: readonly T[], i: number): T {
  const v = list[i];
  assert.ok(v !== undefined, `no item ${i} of ${list.length}`);
  return v;
}
/** A dealt match's ammo, which the deal always sets. */
const ammoOf = (G: SoloState) => { assert.ok(G.ammo, 'the deal sets the ammo'); return G.ammo; };
/** A blank match for soloDeal to deal: it sets every field but `body`, so the partial literal stands for the whole state. */
const blank = (): SoloState => ({ body: 'tank' }) as SoloState;
const fresh = (seed: string, level: Difficulty = 'normal', w = 720) => { const G = blank(); soloDeal(G, arsenal, seed, level, w); return G; };
const round1 = (seed: string, level: Difficulty = 'normal', w = 720) => { const G = fresh(seed, level, w); G.round = 1; soloMuster(G, arsenal); return G; };

test('a deal keeps its width; a wide field is the same hills with the units spread over it', () => {
  const a = round1('alpha'), b = round1('alpha', 'normal', 1440);
  assert.equal(b.w, 1440);
  assert.equal(b.terrain.length, 1440);
  assert.deepEqual(b.terrain.slice(0, 720), a.terrain);
  const xs = b.tanks.map(t => t.x).sort((x, y) => x - y);
  assert.ok(nth(xs, 0) >= 30 && nth(xs, xs.length - 1) <= 1410);
  for (let i = 1; i < xs.length; i++) assert.ok(nth(xs, i) - nth(xs, i - 1) >= SPAWN_GAP, 'nobody starts inside another\'s blast');
  assert.throws(() => soloDeal(blank(), arsenal, 'x', 'normal', 1000), RangeError);
});

test('a drone owns no gear of its own: it starts a match as a player does and musters with what it holds', () => {
  const bare = buildArsenal(GAME.arsenal); // no personalities: nobody shops, so the deal shows the starting purse
  assert.ok(bare);
  const G = blank();
  soloDeal(G, bare, 'alpha', 'normal', 720);
  G.round = 1;
  soloMuster(G, bare);
  assert.equal(G.drones.length, 3);
  for (const [i, t] of G.tanks.slice(1).entries()) {
    const d = nth(G.drones, i);
    assert.equal(d.cash, 600);
    assert.equal(t.cash, 600);
    assert.equal(t.hp, TUNE.playerArmor);
    assert.equal(t.maxHp, TUNE.playerArmor);
    assert.deepEqual(t.ammo, startAmmo(bare), 'the starting shells a player has, and no others');
    assert.equal(t.chutes, 0);
    assert.equal(t.shield, false);
  }
});

test('a drone carries its armor, shells and cash between rounds the way the player carries his', () => {
  const bare = buildArsenal(GAME.arsenal);
  assert.ok(bare);
  const G = blank();
  soloDeal(G, bare, 'alpha', 'normal', 720);
  G.round = 1;
  soloMuster(G, bare);
  const [a, b, c] = [nth(G.tanks, 1), nth(G.tanks, 2), nth(G.tanks, 3)];
  a.hp = 40; a.ammo!.buck = 0; a.cash = 900; a.chutes = 1; a.shield = true;
  b.hp = 0;
  c.hp = 0;
  nth(G.tanks, 0).hp = 0;
  assert.equal(soloSettle(G, bare).kind, 'tankLost');
  assert.equal(nth(G.drones, 0).armor, 40, 'what it ended with');
  assert.equal(nth(G.drones, 1).armor, TUNE.playerArmor, 'a wreck re-musters at full');
  assert.equal(nth(G.drones, 0).cash, 900 + 600, 'what it held, and the prize of the round it won alone');
  assert.equal(nth(G.drones, 0).ammo!.buck, 0);
  assert.equal(nth(G.drones, 0).chutes, 1);
  assert.equal(nth(G.drones, 0).shield, true);
  G.round = 2;
  soloMuster(G, bare);
  const again = nth(G.tanks, 1);
  assert.deepEqual([again.hp, again.maxHp, again.cash, again.chutes, again.shield, again.ammo!.buck], [40, 100, 1500, 1, true, 0]);
});

test('a drone that stands alone wins the round prize in cash, as the player would', () => {
  const bare = buildArsenal(GAME.arsenal);
  assert.ok(bare);
  const G = blank();
  soloDeal(G, bare, 'alpha', 'normal', 720);
  G.round = 2;
  soloMuster(G, bare);
  nth(G.tanks, 0).hp = 0;
  nth(G.tanks, 1).hp = 0;
  nth(G.tanks, 3).hp = 0;
  const before = G.score;
  assert.deepEqual(soloSettle(G, bare), { kind: 'tankLost' });
  assert.equal(nth(G.drones, 1).cash, 600 + 500 + 2 * 100, 'roundWinCash + round x 100');
  assert.equal(nth(G.drones, 0).cash, 600);
  assert.equal(G.score, before, 'the score rules do not change');
});

test('with two drones left standing nobody takes the prize', () => {
  const bare = buildArsenal(GAME.arsenal);
  assert.ok(bare);
  const G = blank();
  soloDeal(G, bare, 'alpha', 'normal', 720);
  G.round = 1;
  soloMuster(G, bare);
  nth(G.tanks, 0).hp = 0;
  nth(G.tanks, 3).hp = 0;
  G.watchTurns = 39;
  assert.deepEqual(soloSettle(G, bare), { kind: 'tankLost' });
  assert.deepEqual(G.drones.map(d => d.cash), [600, 600, 600]);
});

test('every drone is dealt a personality and shops before round 1 with the player\'s rules, never over its purse', () => {
  const G = fresh('alpha');
  assert.equal(G.drones.length, 3);
  for (const d of G.drones) {
    assert.ok(arsenal.drones.some(p => p.key === d.personality), d.personality);
    assert.ok(d.cash >= 0 && d.cash <= 600, `cash ${d.cash}`);
  }
  // The same seed deals the same drones the same purchases.
  assert.deepEqual(fresh('alpha').drones, G.drones);
  // A mustered drone wears its personality's name, which the battlefield and the armor line show.
  G.round = 1;
  soloMuster(G, arsenal);
  for (const [i, t] of G.tanks.slice(1).entries()) {
    assert.equal(t.personality, arsenal.drones.find(p => p.key === nth(G.drones, i).personality)?.name);
    assert.ok(t.personality);
  }
});

test('a deal is the stake, three lives and full armor', () => {
  const G = fresh('alpha');
  assert.equal(G.cash, 600);
  assert.equal(G.lives, TUNE.lives);
  assert.equal(G.armor, 100);
  assert.equal(ammoOf(G).shell, Infinity);
  assert.equal(ammoOf(G).buck, 1);
  assert.equal(G.round, 0);
});

test('the same seed musters the same round', () => {
  const a = round1('alpha'), b = round1('alpha'), c = round1('beta');
  assert.deepEqual(a.terrain, b.terrain);
  assert.deepEqual(a.tanks.map(t => [t.x, t.s]), b.tanks.map(t => [t.x, t.s]));
  assert.equal(a.wind, b.wind);
  assert.notDeepEqual(a.terrain, c.terrain);
  assert.equal(a.tanks.length, 4);
  assert.equal(nth(a.tanks, 0).hp, 100);
  assert.equal(nth(a.tanks, 1).hp, TUNE.playerArmor);
});

test('a round won pays the bonus and carries the armor', () => {
  const G = round1('alpha');
  nth(G.tanks, 0).hp = 64;
  for (const t of G.tanks.slice(1)) t.hp = 0;
  const end = soloSettle(G, arsenal);
  assert.deepEqual(end, { kind: 'roundWon', bonus: 900, prize: 600 });
  assert.equal(G.score, 900);
  assert.equal(G.armor, 64);
  assert.equal(G.roundsWon, 1);
});

test('a wreck costs a life and re-musters at full max; the last life ends the match', () => {
  const G = round1('alpha');
  G.plate = 1;
  nth(G.tanks, 0).hp = 0;
  nth(G.tanks, 1).hp = 0; nth(G.tanks, 2).hp = 0;
  assert.deepEqual(soloSettle(G, arsenal), { kind: 'tankLost' });
  assert.equal(G.lives, 2);
  assert.equal(G.armor, 125);
  G.lives = 1;
  nth(G.tanks, 0).hp = 0;
  assert.deepEqual(soloSettle(G, arsenal), { kind: 'matchLost' });
  assert.equal(G.lives, 0);
});

test('play goes on, the wind shifts, and the turn skips the wrecked', () => {
  const G = round1('alpha');
  G.turn = 0;
  nth(G.tanks, 1).hp = 0;
  assert.deepEqual(soloSettle(G, arsenal), { kind: 'next' });
  assert.equal(G.turn, 2);
  G.turn = 3; soloNextTurn(G);
  assert.equal(G.turn, 0);
});

test('with the player down the drones get WATCH_TURNS settles', () => {
  const G = round1('alpha');
  nth(G.tanks, 0).hp = 0;
  let end: Settled | undefined;
  for (let i = 0; i < 40 && (!end || end.kind === 'next'); i++) end = soloSettle(G, arsenal);
  assert.deepEqual(end, { kind: 'tankLost' });
  assert.equal(G.watchTurns, 40);
});

test('the deal keeps its difficulty, and the drones aim with it', () => {
  assert.equal(fresh('alpha', 'hard').difficulty, 'hard');
  const easy = round1('alpha', 'easy'), hard = round1('alpha', 'hard');
  const aim = (G: SoloState) => { const t = nth(G.tanks, 1); const c = soloAim(G, arsenal, t); return [c.wkey, c.angle, c.power]; };
  assert.notDeepEqual(aim(easy), aim(hard));
});

test('1-ups: a life per 3000, or 500 points at five lives', () => {
  const G = fresh('alpha');
  G.score = 6100;
  G.lives = 3;
  assert.deepEqual(soloOneUps(G), [{ kind: 'life', lives: 4 }, { kind: 'life', lives: 5 }]);
  assert.equal(G.lives, 5);
  G.score = 12000;
  assert.deepEqual(soloOneUps(G), [{ kind: 'points', lives: 5 }, { kind: 'points', lives: 5 }]);
  assert.equal(G.score, 13000);
});

test('snapTanks puts standing tanks on the ground and leaves wrecks where they hang', () => {
  const G = round1('alpha');
  const a = nth(G.tanks, 0), b = nth(G.tanks, 1);
  a.y = surfY(G.terrain, a.x) - 0.3; a.vy = 2;
  b.hp = 0; b.y = 5; b.vy = 3;
  snapTanks(G);
  assert.equal(a.y, surfY(G.terrain, a.x));
  assert.equal(a.vy, 0);
  assert.equal(b.y, 5);
  assert.equal(b.vy, 3);
});

const row = (key: string): ShopRow => {
  const r = arsenal.shop.find(x => (x.w ?? x.g) === key);
  assert.ok(r, `no shop row ${key}`);
  return r;
};
/** Why a purchase was refused; undefined when it went through. */
const whyOf = (r: BuyResult) => (r.ok ? undefined : r.why);
/** How many a purchase bought; undefined when it was refused. */
const qtyOf = (r: BuyResult) => (r.ok ? r.qty : undefined);

test('the shop: every gun the stake buys sells before round one', () => {
  // From game.json: no gun waits for a later round.
  const sold = GAME.arsenal.ammo.filter(a => a.pack > 0 && a.price <= 600);
  assert.ok(sold.length > 15);
  for (const a of sold) {
    const G = fresh('shop');
    const had = ammoOf(G)[a.key] || 0;
    assert.deepEqual(soloBuy(G, row(a.key), 1), { ok: true, qty: 1, total: a.price }, a.key);
    assert.equal(ammoOf(G)[a.key], had + a.pack, a.key);
  }
  // The dearest gun is refused for cash alone.
  const G = fresh('shop');
  G.cash = 0;
  assert.equal(whyOf(soloBuy(G, row('nuke'), 1)), 'cash');
});

test('one-shot tricks never stack; Repair buys only what fills the hull', () => {
  const G = fresh('shop');
  assert.deepEqual(soloBuy(G, row('shield'), 3), { ok: true, qty: 1, total: 250 });
  assert.equal(whyOf(soloBuy(G, row('repair'), 1)), 'full');
  G.armor = 30;
  assert.deepEqual(soloBuy(G, row('repair'), 9), { ok: true, qty: 2, total: 240 });
  assert.equal(G.armor, 100);
});

test('a plate and the chest', () => {
  const G = fresh('shop');
  G.cash = 299;
  assert.equal(whyOf(soloBuy(G, row('plate'), 1)), 'cash');
  G.cash = 300;
  soloBuy(G, row('plate'), 1);
  assert.deepEqual([G.plate, G.armor, G.cash], [1, 125, 0]);
});

test('buyPacks: one-shot tricks are one pack, Repair what the hull needs, the rest the count', () => {
  const G = fresh('shop');
  for (const k of ['shield', 'extralife', 'laststand']) assert.equal(buyPacks(G, row(k), 3), 1, k);
  assert.equal(buyPacks(G, row('repair'), 9), 0, 'a full hull wants none');
  G.armor = 80;
  assert.equal(buyPacks(G, row('repair'), 9), 1);
  G.armor = 30;
  assert.equal(buyPacks(G, row('repair'), 9), 2, 'a room asks for 2 packs, not 9');
  for (const k of ['fuel', 'jammer', 'bunker', 'plate']) assert.equal(buyPacks(G, row(k), 3), 3, k);
});

test('Extra life at max lives pays 500 points; Last stand stays at one; Fuel stacks; Jammer and Bunker keep the longer', () => {
  const G = fresh('shop');
  G.cash = 5000;
  G.lives = TUNE.maxLives;
  const score = G.score;
  assert.equal(qtyOf(soloBuy(G, row('extralife'), 3)), 1);
  assert.deepEqual([G.lives, G.score], [TUNE.maxLives, score + 500]);
  assert.equal(qtyOf(soloBuy(G, row('laststand'), 4)), 1);
  const fuel = G.fuelBank;
  soloBuy(G, row('fuel'), 2);
  assert.equal(G.fuelBank, fuel + 2 * row('fuel').n);
  for (const k of ['jammer', 'bunker'] as const) {
    soloBuy(G, row(k), 2);
    assert.equal(G[k], 2 * row(k).n, k);
    soloBuy(G, row(k), 1);
    assert.equal(G[k], 2 * row(k).n, `${k}: a smaller lot after a bigger one adds nothing`);
  }
});

test('a round plays the Walls it is mustered with; Random draws one real wall last, and no other pick moves the dice', () => {
  const open = fresh('walls-seed'), fixed = fresh('walls-seed');
  open.round = fixed.round = 1;
  soloMuster(open, arsenal);
  soloMuster(fixed, arsenal, 'spring');
  assert.equal(open.walls, 'none');
  assert.equal(fixed.walls, 'spring');
  assert.equal(open.rng(), fixed.rng(), 'a fixed pick draws nothing');
  const rnd = fresh('walls-seed');
  const seen = new Set<string>();
  for (let r = 1; r <= 16; r++) {
    rnd.round = r;
    soloMuster(rnd, arsenal, 'random');
    seen.add(String(rnd.walls));
  }
  assert.ok([...seen].every(w => ['concrete', 'rubber', 'spring', 'wrap'].includes(w)), [...seen].join());
  assert.ok(seen.size > 1, 'it changes from round to round');
});
