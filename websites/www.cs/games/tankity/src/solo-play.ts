/* Operation Tankity: solo matches without a page; not part of the page bundle.
 *
 * soloRound() plays one round from the shop the way server/solo.php does, and
 * refuses what it refuses; playSolo() drives the rules with a bot and records
 * each round as the page would send it; replaySolo() checks every claim. */
import { ROOM_W, anyTankFalling, clamp, facing, fallTanks, fieldWidthOk, fireWeapon, hashSeed, muzzle, mulberry32, simShot, spotTaken, stepShells, surfY } from './sim.ts';
import type { Arsenal, Difficulty, World } from './sim.ts';
import { DIFFICULTIES } from './ai.ts';
import { SOLO_STEP, soloAim, soloBuy, soloDeal, soloMuster, soloOneUps, soloSettle } from './solo.ts';
import type { Settled, SoloState, SoloTank } from './solo.ts';
import { closeRound, newRecorder, recordBuy, recordShot, ROUND_MAX_BUYS, ROUND_MAX_SHOTS } from './solo-log.ts';
import type { RoundClaim, SoloBuy, SoloRoundLog, SoloShot } from './solo-log.ts';

export const FLIGHT_MAX_STEPS = 20000;

export interface Bot {
  shop(G: SoloState, arsenal: Arsenal): SoloBuy[];
  aim(G: SoloState, arsenal: Arsenal): SoloShot;
}
export interface Played { seed: string; difficulty: Difficulty; w: number; rounds: SoloRoundLog[]; score: number; roundsWon: number }
export type RoundResult = { ok: true; claim: RoundClaim } | { ok: false; error: string };

/** An empty state for soloDeal to fill. */
export function blankSolo(): SoloState {
  return { body: 'tank' } as SoloState;
}

/** The war's fixed steps for one volley, as the page's frame takes them:
 *  each drops the tanks, then moves the shells; once the last shell is gone,
 *  steps drop the tanks until none is falling, maxSteps in all. server/flight.php
 *  flight_volley() is the same. Answers the steps taken. */
export function flyVolley(G: World, arsenal: Arsenal, onStep?: (G: World) => void, maxSteps = FLIGHT_MAX_STEPS): number {
  let steps = 0;
  for (; G.shells.length && steps < maxSteps; steps++) {
    fallTanks(G, SOLO_STEP);
    stepShells(G, arsenal, SOLO_STEP);
    if (onStep) onStep(G);
  }
  for (; anyTankFalling(G) && steps < maxSteps; steps++) {
    fallTanks(G, SOLO_STEP);
    if (onStep) onStep(G);
  }
  return steps;
}

function droneTurn(G: SoloState, arsenal: Arsenal, t: SoloTank): void {
  const plan = soloAim(G, arsenal, t);
  t.angle = plan.angle;
  t.power = plan.power;
  fireWeapon(G, arsenal, t, plan.wkey);
}

/** Drives the player's tank to x (paying fuel) and fires; an error when the move is not legal. */
export function playerFire(G: SoloState, arsenal: Arsenal, m: SoloShot): string | null {
  const me = G.tanks[0]!;
  if (!Object.hasOwn(arsenal.weapons, m.w)) return 'no such weapon';
  if (!(m.a >= 10 && m.a <= 170 && m.p >= 10 && m.p <= 100 && m.x >= 12 && m.x <= G.w - 12)) return 'out of range';
  // The page drops the player's tank while it aims, so it is on the ground when it fires.
  me.y = surfY(G.terrain, me.x);
  me.vy = 0;
  const dx = Math.abs(m.x - me.x);
  if (dx > 0) {
    if (dx > me.fuel + 1e-6) return 'not enough fuel';
    if (spotTaken(G.tanks, me, m.x)) return 'blocked';
    me.fuel = Math.max(0, me.fuel - dx);
    me.x = m.x;
    me.y = surfY(G.terrain, me.x);
  }
  me.angle = m.a;
  me.power = m.p;
  return fireWeapon(G, arsenal, me, m.w) ? null : 'none left';
}

const isMove = (m: unknown): m is SoloShot => {
  const o = m as Record<string, unknown> | null;
  return !!o && typeof o === 'object' && typeof o['w'] === 'string'
    && [o['a'], o['p'], o['x']].every(v => typeof v === 'number' && Number.isFinite(v));
};

function claimOf(G: SoloState, end: Exclude<Settled['kind'], 'next'>): RoundClaim {
  return { end, score: G.score, cash: G.cash, lives: G.lives, roundsWon: G.roundsWon };
}

/** One round from the shop: its purchases, the muster, then turns until the
 *  round ends, the player's turns taking `shots` in order. server/solo.php
 *  solo_round() is the same, refusal for refusal. A volley still flying after
 *  maxSteps steps is refused (a test lowers it to reach that refusal). */
export function soloRound(G: SoloState, arsenal: Arsenal, buysIn: unknown, shotsIn: unknown, maxSteps = FLIGHT_MAX_STEPS): RoundResult {
  // Records arrive as JSON: anything may be anything, and none of it may throw.
  if (!Array.isArray(buysIn) || buysIn.length > ROUND_MAX_BUYS) return { ok: false, error: 'bad buys' };
  if (!Array.isArray(shotsIn) || shotsIn.length > ROUND_MAX_SHOTS) return { ok: false, error: 'too many shots' };
  const shots = shotsIn as unknown[];
  for (const b of buysIn as unknown[]) {
    const o = b as { i?: unknown; q?: unknown } | null;
    if (!o || typeof o !== 'object' || typeof o.i !== 'string' || !Number.isInteger(o.q) || (o.q as number) < 1) return { ok: false, error: 'bad buy' };
    const row = arsenal.shop.find(r => (r.kind === 'ammo' ? r.w : r.g) === o.i);
    if (!row || !soloBuy(G, row, o.q as number).ok) return { ok: false, error: 'bad buy' };
    soloOneUps(G);
  }
  G.round += 1;
  soloMuster(G, arsenal);
  let i = 0;
  for (;;) {
    const t = G.tanks[G.turn]!;
    if (t.isPlayer) {
      if (i >= shots.length) return { ok: false, error: 'unfinished' };
      const m = shots[i++];
      if (!isMove(m)) return { ok: false, error: 'bad move' };
      const err = playerFire(G, arsenal, m);
      if (err) return { ok: false, error: err };
    } else droneTurn(G, arsenal, t);
    flyVolley(G, arsenal, undefined, maxSteps);
    if (G.shells.length) return { ok: false, error: 'too slow' };
    soloOneUps(G);
    const end = soloSettle(G);
    if (end.kind === 'next') continue;
    if (end.kind !== 'matchLost') soloOneUps(G);
    if (i !== shots.length) return { ok: false, error: 'shots after the end' };
    return { ok: true, claim: claimOf(G, end.kind) };
  }
}

export function playSolo(seed: string, arsenal: Arsenal, bot: Bot, difficulty: Difficulty, w = ROOM_W, maxRounds = 200): Played {
  const G = blankSolo();
  soloDeal(G, arsenal, seed, difficulty, w);
  const rec = newRecorder();
  const rounds: SoloRoundLog[] = [];
  for (;;) {
    for (const want of bot.shop(G, arsenal)) {
      const row = arsenal.shop.find(r => (r.kind === 'ammo' ? r.w : r.g) === want.i);
      if (!row) continue;
      const r = soloBuy(G, row, want.q);
      if (r.ok) { recordBuy(rec, row, r.qty); soloOneUps(G); }
    }
    if (G.round >= maxRounds) throw new Error(`${seed}: still alive after ${maxRounds} rounds`);
    const claim = playTurns(G, arsenal, bot, rec);
    rounds.push(closeRound(rec, G.round, claim));
    if (claim.end === 'matchLost') return { seed, difficulty, w, rounds, score: G.score, roundsWon: G.roundsWon };
  }
}

/* The muster and the turns of one round, the bot choosing each shot as its
   turn comes and the recorder keeping what it fired: soloRound's loop with a
   bot in place of the recorded shots. */
function playTurns(G: SoloState, arsenal: Arsenal, bot: Bot, rec: ReturnType<typeof newRecorder>): RoundClaim {
  G.round += 1;
  soloMuster(G, arsenal);
  for (;;) {
    const t = G.tanks[G.turn]!;
    if (t.isPlayer) {
      // The page stops recording past the limit and the server refuses such a round: a run must stay inside it.
      if (rec.shots.length >= ROUND_MAX_SHOTS) throw new Error(`${G.seed}: round ${G.round} needs more than ${ROUND_MAX_SHOTS} shots`);
      const m = bot.aim(G, arsenal);
      const err = playerFire(G, arsenal, m);
      if (err) throw new Error(`${G.seed}: the bot made an illegal move (${err})`);
      recordShot(rec, G.tanks[0]!, m.w);
    } else droneTurn(G, arsenal, t);
    flyVolley(G, arsenal);
    if (G.shells.length) throw new Error(`${G.seed}: a volley outlasted ${FLIGHT_MAX_STEPS} steps`);
    soloOneUps(G);
    const end = soloSettle(G);
    if (end.kind === 'next') continue;
    if (end.kind !== 'matchLost') soloOneUps(G);
    return claimOf(G, end.kind);
  }
}

const CLAIM_KEYS = ['end', 'score', 'cash', 'lives', 'roundsWon'] as const;

/** Plays a recorded run round by round and checks every claim. Whatever the
 *  record holds, it answers a refusal and does not throw. */
export function replaySolo(p: unknown, arsenal: Arsenal):
  { ok: true; score: number; roundsWon: number; rounds: number } | { ok: false; round: number; error: string } {
  const run = p as Partial<Pick<Played, 'seed' | 'difficulty' | 'w' | 'rounds'>> | null;
  if (!run || typeof run !== 'object' || typeof run.seed !== 'string' || !DIFFICULTIES.includes(run.difficulty as Difficulty)
    || !Array.isArray(run.rounds)) return { ok: false, round: 1, error: 'bad run' };
  if (!fieldWidthOk(run.w)) return { ok: false, round: 1, error: 'bad width' };
  const rounds = run.rounds as unknown[];
  const G = blankSolo();
  soloDeal(G, arsenal, run.seed, run.difficulty as Difficulty, run.w);
  for (const [k, r] of rounds.entries()) {
    const o = r as Partial<SoloRoundLog> | null;
    if (!o || typeof o !== 'object' || !o.claim || typeof o.claim !== 'object') return { ok: false, round: k + 1, error: 'bad round' };
    if (o.n !== k + 1) return { ok: false, round: Number.isInteger(o.n) ? o.n! : k + 1, error: 'out of order' };
    const got = soloRound(G, arsenal, o.buys, o.shots);
    if (!got.ok) return { ok: false, round: o.n, error: got.error };
    if (CLAIM_KEYS.some(key => got.claim[key] !== o.claim![key])) return { ok: false, round: o.n, error: 'mismatch' };
    if (got.claim.end === 'matchLost' && k !== rounds.length - 1) return { ok: false, round: o.n + 1, error: 'the run is over' };
  }
  const last = rounds.at(-1) as SoloRoundLog | undefined;
  if (!last || last.claim.end !== 'matchLost') return { ok: false, round: rounds.length, error: 'unfinished' };
  return { ok: true, score: G.score, roundsWon: G.roundsWon, rounds: G.round };
}

/** A bot with its own random stream (never the match's): it shops at random,
 * drives a little, and with probability `skill` aims with the sim's own
 * predictor at the nearest drone, until round `untilRound`; after that it
 * fires wild, so every run ends. */
export function makeBot(seed: string, skill: number, untilRound: number): Bot {
  const r = mulberry32(hashSeed('bot:' + seed));
  return {
    shop(G, arsenal) {
      const rows = arsenal.shop.filter(row => (row.minRound || 0) <= G.round && (row.price || 0) > 0);
      const out: SoloBuy[] = [];
      for (let k = 0; k < 3 && rows.length; k++) {
        const row = rows[Math.floor(r() * rows.length)]!;
        if (r() < 0.6) out.push({ i: (row.kind === 'ammo' ? row.w : row.g)!, q: 1 + Math.floor(r() * 2) });
      }
      return out;
    },
    aim(G, arsenal) {
      const me = G.tanks[0]!;
      const guns = arsenal.order.filter(k => k === 'shell' || (G.ammo![k] || 0) > 0);
      const w = guns[Math.floor(r() * guns.length)]!;
      let x = me.x;
      if (r() < 0.3 && me.fuel > 1) {
        const nx = clamp(me.x + (r() * 2 - 1) * Math.min(me.fuel, 30), 12, G.w - 12);
        if (!spotTaken(G.tanks, me, nx)) x = nx;
      }
      if (G.round <= untilRound && r() < skill) {
        const foes = G.tanks.filter(t => !t.isPlayer && t.hp > 0).sort((a, b) => Math.abs(a.x - x) - Math.abs(b.x - x));
        const target = foes[0];
        if (target) {
          const m = muzzle({ ...me, x, y: surfY(G.terrain, x) });
          let best = { err: Infinity, a: 45, p: 50 };
          for (let a = 15; a <= 165; a += 2) {
            for (let p = 20; p <= 100; p += 4) {
              const land = simShot(G, arsenal, m.x, m.y, a, p, w, facing(me));
              const err = land.oob ? Infinity : Math.abs(land.x - target.x);
              if (err < best.err) best = { err, a, p };
            }
          }
          return { w, a: clamp(best.a + (r() - 0.5) * 2, 10, 170), p: best.p, x };
        }
      }
      return { w, a: 15 + r() * 150, p: 20 + r() * 80, x };
    },
  };
}
