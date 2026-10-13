// The page's match keeps one round's log at a time: the buys and shots of a
// round are gone when it ends, so the server's per-round limits never count
// the whole match; each round goes to the filer as it ends and the run files at
// game over. Drives the real createMatch (and createShop) with stubbed surroundings.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { importTsx } from '../../_kit/test/tsx.ts';

const m = await importTsx(import.meta.dirname, {
  sim: '../src/sim.ts', log: '../src/solo-log.ts', match: '../src/match.ts', play: '../src/solo-play.ts', shop: '../src/shop.ts',
});
const { replaySolo } = m.play;
const { buildArsenal, surfY, TUNE, ROOM_W } = m.sim;
const { ROUND_MAX_BUYS, ROUND_MAX_SHOTS, newRecorder, recordBuy } = m.log;
const { createMatch } = m.match;
const { createShop } = m.shop;

const GAME = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, '..', 'game.json'), 'utf8'));
const arsenal = buildArsenal(GAME.arsenal);

function harness(over = {}) {
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
    music: { leaveTheme() {}, start() {}, stop() {}, playTheme() {}, forRound() {} }, sfx: { play() {} }, ...over,
  };
  // Every other dependency is a no-op the match calls and ignores. Only
  // functions may be left out: a value the match reads (G, tables, net, TOUCH,
  // field, difficulty) must be in base, or it arrives here as a function.
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

test('sixty buys through the shop, a round played, and the next shop buys again', () => {
  const { G, match } = harness();
  match.startSolo('wiring');
  match.tickBanner(10);
  const lines = [];
  const shop = createShop({
    G, $: () => null, tables: { arsenal, weapons: arsenal.weapons, shop: arsenal.shop, gear: arsenal.gear, order: arsenal.order },
    net: { on: false, seats: () => [], readyNow: () => false, shopClockLeft: () => 0 }, sfx: { play() {} }, me: () => G.tanks[0],
    touch: false, keyHint: () => '', say: t => lines.push(t), advance() {}, render() {}, renderHUD() {}, refreshNavHints() {},
    drawShellIcon() {}, drawGearIcon() {}, openPreview() {}, nextRound() {}, openLeaveVeil() {}, netBuy() {}, board: () => null,
  });
  const mortar = arsenal.shop.find(r => r.w === 'mortar');
  G.cash = 1e6;
  for (let k = 0; k <= ROUND_MAX_BUYS; k++) shop.buyItem(mortar, 1);
  assert.equal(G.rec.buys.length, ROUND_MAX_BUYS);
  assert.match(lines.at(-1), /most you can buy in one shop visit/);
  match.nextRound();
  playRound(G, match);
  G.cash = 1e6;
  shop.buyItem(mortar, 2);
  assert.deepEqual(G.rec.buys, [{ i: 'mortar', q: 2 }], 'the next visit counts from one');
});

/** The filer's side of the match, noted: begin answers `room`. */
function filing(room = true) {
  const calls = [];
  const said = [];
  return {
    calls, said,
    soloBegin: (...a) => { calls.push(['begin', ...a]); return room; },
    soloRound: (id, log) => calls.push(['round', id, log]),
    soloFinish: (id, who, done) => { calls.push(['finish', id, who]); done('Filed · test'); },
    soloDrop: id => calls.push(['drop', id]),
    say: t => said.push(t), initials: () => 'WGR',
  };
}
/** The frame: the 1-ups, then the war, until the match is over. The player fires straight up, softly. */
function playOut(G, match) {
  for (let i = 0; i < 3_000_000 && !G.over; i++) {
    match.checkOneUps();
    if (G.phase === 'banner') match.tickBanner(10);
    else if (G.phase === 'shop') match.nextRound();
    else if (G.phase === 'aim') { G.tanks[0].angle = 90; G.tanks[0].power = 12; match.playerFire(); }
    else { match.fallTanks(1 / 60); match.stepWar(1 / 60); }
  }
  assert.ok(G.over, 'the match ended');
}

test('a match played to its end sends each round as it ends, the referee reaches every claim, and the run files once', () => {
  const f = filing();
  const { G, match } = harness(f);
  match.startSolo('referee-1');
  playOut(G, match);
  const [begin] = f.calls.filter(c => c[0] === 'begin');
  assert.deepEqual(begin.slice(2), ['referee-1', 'normal', G.w], 'begun with the seed, difficulty and the dealt width');
  const rounds = f.calls.filter(c => c[0] === 'round');
  assert.ok(rounds.every(c => c[1] === begin[1]), 'every round under the match\'s id');
  assert.deepEqual(rounds.map(c => c[2].n), rounds.map((_, k) => k + 1));
  assert.equal(rounds.at(-1)[2].claim.end, 'matchLost');
  const played = replaySolo({ seed: G.seed, difficulty: 'normal', w: G.w, rounds: rounds.map(c => c[2]) }, arsenal);
  assert.ok(played.ok, JSON.stringify(played));
  assert.equal(played.score, G.score);
  assert.deepEqual(f.calls.filter(c => c[0] === 'finish'), [['finish', begin[1], 'WGR']], 'filed once, under the player\'s initials');
  assert.equal(match.END.filed, 'Filed · test');
  assert.ok(!f.calls.some(c => c[0] === 'drop'), 'a finished run is not dropped');
  match.startDemo(); // Continue: back to the title card
  assert.ok(!f.calls.some(c => c[0] === 'drop'), 'nor when the next demo deals');
});

test('D41: a 1-up crossed in the settle step counts before the round is settled, as the server plays it', () => {
  const f = filing();
  const { G, match } = harness(f);
  match.startSolo('oneup-settle');
  match.tickBanner(10);
  match.nextRound();
  for (let i = 0; i < 1000 && G.phase !== 'aim'; i++) match.tickBanner(10);
  assert.equal(G.phase, 'aim');
  // One life left, the score just past a threshold the frame has not counted yet, and every unit down.
  G.lives = 1;
  G.score = G.nextOneUp;
  match.playerFire();
  for (const t of G.tanks) t.hp = 0;
  for (let i = 0; i < 100000 && G.phase !== 'shop' && !G.over; i++) { match.fallTanks(1 / 60); match.stepWar(1 / 60); }
  const [, , log] = f.calls.filter(c => c[0] === 'round').at(-1);
  assert.equal(log.claim.end, 'tankLost', 'the extra life came first, so the round lost a tank, not the match');
  assert.equal(log.claim.lives, 1);
  assert.equal(G.over, false);
});

test('a match the filer has no room for plays on unrecorded rounds and its card says it is not filed', () => {
  const f = filing(false);
  const { G, match } = harness(f);
  match.startSolo('no-room');
  playOut(G, match);
  assert.equal(f.calls.filter(c => c[0] === 'round').length, 0);
  assert.equal(f.calls.filter(c => c[0] === 'finish').length, 0);
  assert.equal(match.END.filed, 'This run cannot be filed (see the radio log).');
  assert.deepEqual(G.rec, newRecorder(), 'the round log is still emptied at every round end');
});

test('quitting or dealing a new match mid-match drops the run; every match has its own id', () => {
  const f = filing();
  const { G, match } = harness(f);
  match.startSolo('quit-1');
  match.startSolo('quit-2'); // Play again mid-match
  match.startDemo();        // Quit: the demo under the title card
  const ids = f.calls.filter(c => c[0] === 'begin').map(c => c[1]);
  assert.equal(new Set(ids).size, 2);
  assert.deepEqual(f.calls.filter(c => c[0] === 'drop').map(c => c[1]), ids);
  assert.equal(G.runId, null);
});

test('a round past the shot limit stops the recording and drops the run', () => {
  const f = filing();
  const { G, match } = harness(f);
  match.startSolo('shots-limit');
  match.tickBanner(10);
  match.nextRound();
  for (let i = 0; i < 1000 && G.phase !== 'aim'; i++) match.tickBanner(10);
  const id = G.runId;
  G.rec.shots = Array.from({ length: ROUND_MAX_SHOTS }, () => ({ w: 'shell', a: 45, p: 50, x: 100 }));
  match.playerFire();
  assert.equal(G.rec, null);
  assert.equal(G.runId, null);
  assert.deepEqual(f.calls.filter(c => c[0] === 'drop'), [['drop', id]]);
});
