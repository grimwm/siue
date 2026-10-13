// The page's match keeps one round's log at a time: the buys and shots of a
// round are gone when it ends, so the server's per-round limits never count
// the whole match. Drives the real createMatch with stubbed surroundings.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { importTsx } from '../../_kit/test/tsx.ts';

const m = await importTsx(import.meta.dirname, {
  sim: '../src/sim.ts', log: '../src/solo-log.ts', match: '../src/match.ts', play: '../src/solo-play.ts',
});
const { buildArsenal, surfY, TUNE, ROOM_W } = m.sim;
const { ROUND_MAX_BUYS, newRecorder, recordBuy } = m.log;
const { createMatch } = m.match;

const GAME = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, '..', 'game.json'), 'utf8'));
const arsenal = buildArsenal(GAME.arsenal);

function harness() {
  const G = {
    seed: '', difficulty: 'normal', rec: null, rng: null, body: 'tank', terrain: null, clouds: [], tanks: [], turn: 0, phase: 'aim',
    thinkT: 0, settleT: 0, shells: [], parts: [], booms: [], fx: null, wind: 0, round: 1, firstTurn: 0, lives: TUNE.lives, score: 0,
    cash: 0, nextOneUp: TUNE.oneUpEvery, rounds: [], roundStart: { score: 0, cash: 0 }, roundsWon: 0, ammo: null, selected: 'shell',
    shopSel: 0, shopQty: 1, fuelBank: 0, armor: TUNE.playerArmor, plate: 0, shield: false, jammer: 0, bunker: 0, laststand: false,
    time: 0, shake: 0, dlgQ: [], dlgT: 0, lastTalk: -99, banterT: 30, bannerT: 0, bannerDone: null, w: ROOM_W, hills: null,
    cam: { z: 1, cx: ROOM_W / 2, cy: 230 }, over: false, won: false, tactics: {}, demo: false, demoHint: false, watchTurns: 0, preview: null,
  };
  const tables = { arsenal, weapons: arsenal.weapons, order: arsenal.order, shop: arsenal.shop, gear: arsenal.gear, rev: 0, fromFile: true };
  const base = {
    G, $: () => null, TOUCH: false, tables, net: { on: false }, field: { deal: () => ROOM_W }, difficulty: { get: () => 'normal' },
    alive: () => G.tanks.filter(t => t.hp > 0), foesAlive: () => G.tanks.filter(t => !t.isPlayer && t.hp > 0),
    me: () => G.tanks[0], cur: () => G.tanks[G.turn], surfY: x => surfY(G.terrain, x),
    keyHint: () => '', windText: () => '', closeGuns: () => false, fxImpact: () => 0, openShop: () => match.advance('shopOpen'),
    music: { leaveTheme() {}, start() {}, stop() {}, playTheme() {}, forRound() {} }, sfx: { play() {} },
  };
  // Every other dependency is a no-op the match calls and ignores.
  const deps = new Proxy(base, { get: (t, k) => (k in t ? t[k] : () => undefined) });
  const match = createMatch(deps);
  return { G, match };
}

/** Plays the player's turns (a Shell each) and the war until a round ends and the shop opens. */
function playRound(G, match) {
  let shots = 0;
  for (let i = 0; i < 400000 && G.phase !== 'shop'; i++) {
    if (G.phase === 'banner') match.tickBanner(10);
    else if (G.phase === 'aim') { G.tanks[0].angle = 60; G.tanks[0].power = 70; match.playerFire(); shots++; }
    else { match.fallTanks(1 / 60); match.stepWar(1 / 60); }
  }
  assert.equal(G.phase, 'shop', 'the round ended');
  return shots;
}

test('the round log is empty when the next shop opens: the buy limit counts one visit', () => {
  const { G, match } = harness();
  match.startSolo('visit');
  match.tickBanner(10);
  assert.equal(G.phase, 'shop');
  for (let k = 0; k < ROUND_MAX_BUYS; k++) recordBuy(G.rec, { kind: 'ammo', w: 'mortar' }, 1);
  match.nextRound();
  const shots = playRound(G, match);
  assert.ok(shots >= 1);
  assert.deepEqual(G.rec, newRecorder(), 'sixty buys and the shots of round 1 are gone');
});

test('the shots of a round do not add up across rounds', () => {
  const { G, match } = harness();
  match.startSolo('shots');
  match.tickBanner(10);
  for (let r = 1; r <= 2; r++) {
    match.nextRound();
    const fired = playRound(G, match);
    assert.ok(fired >= 1, `round ${r} fired`);
    assert.ok(G.rec, 'the recording is still on');
    assert.equal(G.rec.shots.length, 0, `round ${r} ended with its shot count cleared`);
  }
});
