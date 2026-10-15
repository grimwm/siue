// The real createMatch (src/match.ts) with stubbed surroundings, for the
// unit tests that play solo matches through it: a fresh GameState as main.ts
// starts one, the arsenal from game.json, and a no-op for every dependency a
// test does not hand in.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { asElement, installDocument, makeEl } from '../../_kit/test/dom-stub.ts';
import { importTsx } from '../../_kit/test/tsx.ts';
import { createMarks } from '../src/marks.ts';
import { createEarthShow } from '../src/earth-show.ts';
import { createFireShow } from '../src/fire-show.ts';
import type { FallRules, Gear, Weapon } from '../src/sim.ts';
import type { GameState, GameTank, Tables } from '../src/game-types.ts';
import type { MatchDeps } from '../src/match.ts';

installDocument();

const m = await importTsx<{ sim: typeof import('../src/sim.ts'); match: typeof import('../src/match.ts') }>(import.meta.dirname, { sim: '../src/sim.ts', match: '../src/match.ts' });
export const { buildArsenal, surfY, TUNE, ROOM_W } = m.sim;
const { createMatch } = m.match;
export type Match = ReturnType<typeof createMatch>;

export function must<T>(v: T | null | undefined, what: string): T {
  assert.ok(v !== null && v !== undefined, `${what} is missing`);
  return v;
}
export function nth<T>(list: readonly T[], i: number): T {
  return must(list[i], `item ${i}`);
}

const GAME: { arsenal: { ammo: Weapon[]; gear?: Gear[]; fall?: Partial<FallRules> } } = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, '..', 'game.json'), 'utf8'));
export const arsenal = must(buildArsenal(GAME.arsenal), 'the arsenal');

export function harness(over: Partial<MatchDeps> = {}) {
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

