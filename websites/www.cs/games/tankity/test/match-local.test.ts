// A solo match played to its end is saved once on this browser's board, under
// the difficulty it was dealt, and the end card says where it went. Drives the
// real createMatch with stubbed surroundings.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { asElement, installDocument, makeEl } from '../../_kit/test/dom-stub.ts';
import { importTsx } from '../../_kit/test/tsx.ts';
import { createMarks } from '../src/marks.ts';
import { createEarthShow } from '../src/earth-show.ts';
import { createFireShow } from '../src/fire-show.ts';
import type { Difficulty, FallRules, Gear, Weapon } from '../src/sim.ts';
import type { GameState, GameTank, Tables } from '../src/game-types.ts';
import type { LocalRow } from '../src/local-board.ts';
import type { MatchDeps } from '../src/match.ts';
import type { Phase } from '../src/flow.ts';

installDocument();

const m = await importTsx<{ sim: typeof import('../src/sim.ts'); match: typeof import('../src/match.ts') }>(import.meta.dirname, { sim: '../src/sim.ts', match: '../src/match.ts' });
const { buildArsenal, surfY, TUNE, ROOM_W } = m.sim;
const { createMatch } = m.match;
type Match = ReturnType<typeof createMatch>;

function must<T>(v: T | null | undefined, what: string): T {
  assert.ok(v !== null && v !== undefined, `${what} is missing`);
  return v;
}
function nth<T>(list: readonly T[], i: number): T {
  return must(list[i], `item ${i}`);
}

const GAME: { arsenal: { ammo: Weapon[]; gear?: Gear[]; fall?: Partial<FallRules> } } = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, '..', 'game.json'), 'utf8'));
const arsenal = must(buildArsenal(GAME.arsenal), 'the arsenal');

function harness(over: Partial<MatchDeps> = {}) {
  // rng and terrain stay null until startSolo or startDemo deals them, which GameState does not allow.
  const G = {
    seed: '', difficulty: 'normal', rng: null, body: 'tank', terrain: null, clouds: [], tanks: [], turn: 0, phase: 'aim',
    thinkT: 0, settleT: 0, shells: [], parts: [], booms: [], fx: null, marks: createMarks(), earth: createEarthShow(), fire: createFireShow(), wind: 0, round: 1, firstTurn: 0, lives: TUNE.lives, score: 0,
    cash: 0, nextOneUp: TUNE.oneUpEvery, rounds: [], roundStart: { score: 0, cash: 0 }, roundsWon: 0, ammo: null, selected: 'shell',
    shopSel: 0, shopQty: 1, fuelBank: 0, armor: TUNE.playerArmor, plate: 0, shield: false, jammer: 0, bunker: 0, laststand: false,
    time: 0, shake: 0, dlgQ: [], dlgT: 0, lastTalk: -99, banterT: 30, bannerT: 0, bannerDone: null, w: ROOM_W, hills: null,
    cam: { z: 1, cx: ROOM_W / 2, cy: 230 }, over: false, won: false, tactics: {}, demo: false, demoHint: false, watchTurns: 0, preview: null,
  } as unknown as GameState;
  // The page's me() and cur() read their unit after the deal (main.ts), so neither checks it is there.
  const unit = (i: number) => G.tanks[i] as GameTank;
  const tables: Tables = { arsenal, weapons: arsenal.weapons, order: arsenal.order, shop: arsenal.shop, gear: arsenal.gear, rev: 0 };
  const veil = makeEl('end-veil');
  const base: Partial<MatchDeps> = {
    G, $: id => (id === 'end-veil' ? asElement(veil) as HTMLElement : null), TOUCH: false, tables, net: { on: false }, field: { deal: () => ROOM_W },
    alive: () => G.tanks.filter(t => t.hp > 0), foesAlive: () => G.tanks.filter(t => !t.isPlayer && t.hp > 0),
    me: () => unit(0), cur: () => unit(G.turn), surfY: x => surfY(G.terrain, x),
    keyHint: () => '', windText: () => '', closeGuns: () => false, fxImpact: () => 0, openShop: () => match.advance('shopOpen'),
    music: { leaveTheme() {}, start() {}, stop() {}, playTheme() {}, forRound() {} }, sfx: { play() {} }, ...over,
  };
  // Every other dependency is a no-op; values the match reads must be in base.
  const deps = new Proxy(base, { get: (t, k) => (k in t ? Reflect.get(t, k) : () => undefined) }) as MatchDeps;
  const match = createMatch(deps);
  return { G, match };
}

/** The frame until the match is over. The player fires straight up, softly. */
function playOut(G: GameState, match: Match) {
  for (let i = 0; i < 3_000_000 && !G.over; i++) {
    match.checkOneUps();
    if (G.phase === 'banner') match.tickBanner(10);
    else if (G.phase === 'shop') match.nextRound();
    else if (G.phase === 'aim') { nth(G.tanks, 0).angle = 90; nth(G.tanks, 0).power = 12; match.playerFire(); }
    else { match.fallTanks(1 / 60); match.stepWar(1 / 60); }
  }
  assert.ok(G.over, 'the match ended');
}

test('a finished solo match is saved once, on its dealt difficulty, and the card reads the local line', () => {
  const saves: [Difficulty, LocalRow][] = [];
  const { G, match } = harness({
    difficulty: { get: () => 'hard' }, initials: () => 'WGR',
    saveLocal: (level, row) => { saves.push([level, row]); return { place: 3, kept: true }; },
  });
  match.startSolo('local-1');
  playOut(G, match);
  assert.equal(saves.length, 1);
  const [level, row] = nth(saves, 0);
  assert.equal(level, 'hard');
  assert.equal(row.initials, 'WGR');
  assert.equal(row.score, G.score);
  assert.equal(row.rounds, G.roundsWon);
  assert.equal(row.seed, 'local-1');
  assert.equal(row.kind, 'solo');
  assert.match(row.at, /^\d{4}-\d\d-\d\dT/);
  assert.equal(row.ref, `solo:local-1:${row.at}`);
  assert.equal(match.END.filed, "Saved on this browser's board · #3 on Hard");
  // The settle that ended it never ends it twice.
  match.checkOneUps();
  assert.equal(saves.length, 1);
});

test('blocked storage: the card says this browser cannot keep scores', () => {
  const { G, match } = harness({
    difficulty: { get: () => 'normal' }, initials: () => 'WGR', saveLocal: () => ({ place: null, kept: false }),
  });
  match.startSolo('local-2');
  playOut(G, match);
  assert.equal(match.END.filed, "This browser can't keep scores (storage is blocked).");
});

test('the demo saves nothing', () => {
  const saves: unknown[] = [];
  const { G, match } = harness({ difficulty: { get: () => 'normal' }, initials: () => 'WGR', saveLocal: (...a) => { saves.push(a); return { place: 1, kept: true }; } });
  match.startDemo();
  for (let i = 0; i < 200000; i++) {
    if (G.phase === 'banner') match.tickBanner(10);
    else if (G.phase === 'shop') match.nextRound();
    else { match.fallTanks(1 / 60); match.stepWar(1 / 60); }
  }
  assert.deepEqual(saves, []);
});

test('a fall still playing out when a match is left never speaks in the next one', () => {
  const said: string[] = [];
  const { G, match } = harness({ say: t => said.push(t), difficulty: { get: () => 'normal' } });
  const toFirstTurn = () => {
    for (let i = 0; i < 10_000 && G.phase !== 'aim'; i++) {
      if (G.phase === 'banner') match.tickBanner(10);
      else if (G.phase === 'shop') match.nextRound();
      else { match.fallTanks(1 / 60); match.stepWar(1 / 60); }
    }
    assert.equal(G.phase, 'aim');
  };
  match.startSolo('falls');
  toFirstTurn();
  // A drone hangs over a pit when its volley's last shell goes off the board.
  const foe = nth(G.tanks, 1);
  foe.y -= 120;
  foe.fellBy = 0;
  G.shells = [{ x: -100, y: 100, vx: -50, vy: 0, wkey: 'shell', owner: nth(G.tanks, 0), life: 1, age: 1, pierced: false, split: false, order: [0] }];
  G.phase = 'fly';
  match.stepWar(1 / 60);
  assert.equal(match.fallsPending(), 1, 'its landing waits to be seen');
  said.length = 0;
  match.startSolo('next');
  assert.equal(match.fallsPending(), 0, 'a new match starts with none');
  toFirstTurn();
  for (let i = 0; i < 600; i++) match.fallTanks(1 / 60);
  assert.ok(!said.some(t => /falls|crater/.test(t)), said.join(' | '));
});

test('the turn does not pass while a napalm pool burns, and its ticks land on the drone in it', () => {
  const said: string[] = [];
  const { G, match } = harness({ say: t => said.push(t), difficulty: { get: () => 'normal' } });
  match.startSolo('napalm');
  for (let i = 0; i < 10_000 && G.phase !== 'aim'; i++) {
    if (G.phase === 'banner') match.tickBanner(10);
    else if (G.phase === 'shop') match.nextRound();
    else { match.fallTanks(1 / 60); match.stepWar(1 / 60); }
  }
  assert.equal(G.phase, 'aim');
  // A narrow valley under the first drone; everyone else on the flat around it.
  const foe = nth(G.tanks, 1), cx = Math.round(foe.x);
  G.terrain = G.terrain.map((_, ix) => 330 + 90 * Math.max(0, 1 - Math.abs(ix - cx) / 60));
  for (const t of G.tanks) t.y = surfY(G.terrain, t.x);
  const hp = foe.hp, turn = G.turn;
  // The player's napalm comes straight down into the valley.
  G.shells = [{ x: cx, y: 380, vx: 0, vy: 80, wkey: 'napalm', owner: nth(G.tanks, 0), life: 5, age: 1, pierced: false, split: false, order: [0], clear: true }];
  G.phase = 'fly' as Phase; // as Phase: stepWar moves it on, which tsc cannot see
  let burning = 0;
  for (let i = 0; i < 2000 && (G.shells.length || (G.fires || []).length); i++) {
    match.fallTanks(1 / 60);
    match.stepWar(1 / 60);
    if ((G.fires || []).length) {
      burning++;
      assert.equal(G.phase, 'settle', 'a burning pool holds the volley open');
      assert.equal(G.turn, turn, 'the turn waits for the fire');
    }
  }
  const w = must(arsenal.weapons.napalm, 'the napalm row');
  const burn = must(w.burn, 'its burn'), tick = must(w.tick, 'its tick');
  assert.ok(Math.abs(burning - burn * 60) <= 2, `it burned ${burning} steps`);
  assert.equal(hp - foe.hp, w.dmg * Math.floor(burn / tick), 'every tick burned the drone in the pool');
  assert.ok(said.some(t => /burn/i.test(t)), said.join(' | '));
  for (let i = 0; i < 600 && G.phase === 'settle'; i++) { match.fallTanks(1 / 60); match.stepWar(1 / 60); }
  assert.notEqual(G.phase, 'settle', 'once it is out, the turn passes');
});
