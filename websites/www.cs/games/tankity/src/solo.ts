/* Operation Tankity: the solo rules.
 *
 * The rules of a match against the drone battery, without a page: dealing,
 * mustering a round, the turn order, settling a volley, 1-ups, a drone's
 * aim and what a purchase does. match.ts plays them with words and sound. Nothing here reads a clock
 * or Math.random, so the same seed deals the same match anywhere. */
import { aiChoose, pickTactic } from './ai.ts';
import type { AimChoice } from './ai.ts';
import { carryArmor, fitPlates, maxArmor, repairPacksWanted, repairRestores } from './armor.ts';
import { SOLO_STEP, WATCH_TURNS } from './flow.ts';
import { TUNE, clamp, droneChutes, droneRack, fieldWidthOk, gauss, genTerrain, hashSeed, mulberry32, restY, spawnSpots, surfY } from './sim.ts';
import type { Arsenal, Cloud, Difficulty, Hills, ShopRow, Tank, World } from './sim.ts';

export { SOLO_STEP };
export const FOES = [
  { id: 'reaper', color: '#ff0000' },
  { id: 'wraith', color: '#00ffff' },
  { id: 'spotter', color: '#ff00ff' },
] as const;

export interface SoloTank extends Tank { maxHp: number; color?: string; body?: string }
export interface SoloState extends World {
  seed: string;
  /** How well the drones aim this match (ai.ts DIFFICULTY); set at the deal, never during play. */
  difficulty: Difficulty;
  /** The field's width, dealt once per match from the screen (spec 6.6). */
  w: number;
  hills: Hills | null;
  body: string;
  clouds: Cloud[];
  tanks: SoloTank[];
  turn: number;
  firstTurn: number;
  lives: number;
  nextOneUp: number;
  roundsWon: number;
  tactics: Record<string, string>;
  watchTurns: number;
  armor: number;
  plate: number;
  fuelBank: number;
  /** The player's parachutes: they stack, and one opens on a hard fall. */
  chutes: number;
}

/** A new match at a difficulty and a width: the stake, three lives, full armor, and the pre-match hills (drawn, never fought on). */
export function soloDeal(G: SoloState, arsenal: Arsenal, seed: string, difficulty: Difficulty, w: number): void {
  if (!fieldWidthOk(w)) throw new RangeError(`field width ${w}`);
  G.w = w;
  G.seed = seed;
  G.difficulty = difficulty;
  G.rng = mulberry32(hashSeed(seed));
  G.lives = TUNE.lives;
  G.score = 0;
  G.cash = 600;
  G.nextOneUp = TUNE.oneUpEvery;
  G.roundsWon = 0;
  G.round = 0;
  G.tactics = {};
  G.firstTurn = 0;
  G.ammo = { shell: Infinity, buck: 1 };
  for (const k of arsenal.order) if (!(k in G.ammo)) G.ammo[k] = 0;
  G.selected = 'shell';
  G.fuelBank = 0;
  G.armor = TUNE.playerArmor;
  G.plate = 0;
  G.shield = false;
  G.jammer = 0;
  G.bunker = 0;
  G.laststand = false;
  G.chutes = 0;
  G.watchTurns = 0;
  const g = genTerrain(G.rng, G.w);
  G.terrain = g.terrain;
  G.clouds = g.clouds;
  G.hills = g.hills;
  G.tanks = [];
  G.shells = [];
}

/** A round's hills, wind and four units, spread anywhere; the opener rotates round by round. */
export function soloMuster(G: SoloState, arsenal: Arsenal): void {
  const g = genTerrain(G.rng, G.w);
  G.terrain = g.terrain;
  G.clouds = g.clouds;
  G.hills = g.hills;
  G.watchTurns = 0;
  G.wind = Math.round((G.rng() * 2 - 1) * 8);
  const order = spawnSpots(1 + FOES.length, G.rng, G.w); // over the whole field: the extra hills are part of the fight
  const fuel = TUNE.fuel + (G.fuelBank || 0);
  G.fuelBank = 0;
  G.tanks = [{
    id: 'tank', isPlayer: true, color: '#ffff00', body: G.body,
    x: order[0]!, y: 0, angle: 62, power: 55, hp: G.armor, maxHp: maxArmor(G.plate), fuel,
  }];
  FOES.forEach((f, i) => {
    // Endless escalation: thicker armor and a deeper magazine every round.
    const armor = TUNE.droneArmor + 6 * (G.round - 1);
    G.tanks.push({
      id: f.id, isPlayer: false, color: f.color,
      x: order[i + 1]!, y: 0, angle: 62, power: 55, hp: armor, maxHp: armor, fuel: 0,
      ammo: droneRack(arsenal, G.round),
      chutes: droneChutes(arsenal, G.round),
      s: G.tactics[f.id] || (G.tactics[f.id] = pickTactic(G.rng)),
    });
  });
  for (const t of G.tanks) {
    t.y = surfY(G.terrain, t.x);
    t.dirS = t.x < G.w / 2 ? 1 : -1; // face the middle of the field
  }
  G.turn = G.firstTurn % G.tanks.length;
  G.firstTurn++;
  G.shells = [];
}

/** Standing tanks sit exactly where they rest (where the volley's settle
 *  put them, else the ground or a unit they stand on) once the falls are
 *  over, so a settled round starts from exact heights. The falls' armor was
 *  decided by the settle (sim.ts settleAndShow); this only places units. */
export function snapTanks(G: Pick<SoloState, 'tanks' | 'terrain'>): void {
  for (const t of G.tanks) {
    if (t.hp <= 0) continue;
    t.y = t.restAt ?? restY(G.tanks, G.terrain, t);
    t.restAt = undefined;
    t.vy = 0;
    t.chute = false;
  }
}

export function soloNextTurn(G: SoloState): void {
  const n = G.tanks.length;
  for (let k = 1; k <= n; k++) {
    if (G.tanks[(G.turn + k) % n]!.hp > 0) { G.turn = (G.turn + k) % n; return; }
  }
}

export type Settled =
  | { kind: 'next' }
  | { kind: 'roundWon'; bonus: number; prize: number }
  | { kind: 'tankLost' }
  | { kind: 'matchLost' };

/** After a volley: play on (the wind shifts, the next unit is up), or the round ends. */
export function soloSettle(G: SoloState): Settled {
  snapTanks(G);
  const me = G.tanks[0]!;
  const alive = G.tanks.filter(t => t.hp > 0).length;
  // A round ends with one unit left; with the player wrecked the drones fight
  // on for at most WATCH_TURNS settles, so a stalemate cannot run forever.
  if (alive > 1 && !(me.hp <= 0 && ++G.watchTurns >= WATCH_TURNS)) {
    G.wind = clamp(Math.round(G.wind + gauss(G.rng) * 2), -12, 12);
    soloNextTurn(G);
    return { kind: 'next' };
  }
  if (me.hp <= 0) {
    G.lives -= 1;
    G.armor = carryArmor({ armor: G.armor, plates: G.plate }, 0, true).armor;
    if (G.lives <= 0) { G.lives = 0; return { kind: 'matchLost' }; }
    return { kind: 'tankLost' };
  }
  G.roundsWon += 1;
  const bonus = TUNE.roundWinScore + G.round * 150;
  const prize = TUNE.roundWinCash + G.round * 100;
  G.score += bonus;
  G.cash += prize;
  // Trick timers tick down on claimed rounds, not on wrecked restarts.
  if (G.jammer > 0) G.jammer--;
  if (G.bunker > 0) G.bunker--;
  G.armor = carryArmor({ armor: G.armor, plates: G.plate }, me.hp, false).armor;
  return { kind: 'roundWon', bonus, prize };
}

export type OneUp = { kind: 'life' | 'points'; lives: number };
/** Every 3000 points a life, up to five; past five, 500 points instead. */
export function soloOneUps(G: SoloState): OneUp[] {
  const out: OneUp[] = [];
  while (G.score >= G.nextOneUp) {
    G.nextOneUp += TUNE.oneUpEvery;
    if (G.lives < TUNE.maxLives) { G.lives += 1; out.push({ kind: 'life', lives: G.lives }); }
    else { G.score += 500; out.push({ kind: 'points', lives: G.lives }); }
  }
  return out;
}

/** A drone's choice for its turn, aimed at the match's difficulty (aiChoose reads
 *  G.difficulty); a strategy switch is remembered for later rounds. */
export function soloAim(G: SoloState, arsenal: Arsenal, t: SoloTank): AimChoice {
  const plan = aiChoose(G, arsenal, t);
  if (plan.tactic) G.tactics[t.id] = plan.tactic;
  return plan;
}

/** Tricks that do their one thing once: buying more is money on fire. */
export const ONE_SHOT: ReadonlySet<string> = new Set(['shield', 'extralife', 'laststand']);

export function isOneShot(row: Pick<ShopRow, 'kind' | 'effect'>): boolean {
  return row.kind === 'gear' && ONE_SHOT.has(row.effect || '');
}

export type BuyResult = { ok: true; qty: number; total: number } | { ok: false; why: 'locked' | 'cash' | 'full'; total: number };

/** How many packs a purchase of `qtyIn` really buys: one for a one-shot trick,
 * and for Repair no more than the hull needs (0 when it is full). The shop prices
 * and gates by this, a room's log line reports it, and soloBuy charges it. */
export function buyPacks(G: Pick<SoloState, 'armor' | 'plate'>, row: ShopRow, qtyIn: number): number {
  const qty = clamp(Math.floor(qtyIn || 1), 1, 9);
  if (isOneShot(row)) return 1;
  if (row.effect === 'repair') return Math.min(qty, repairPacksWanted(G.armor, G.plate, row.n));
  return qty;
}

/** One purchase, by server/rules.php room_buy()'s rules. */
export function soloBuy(G: SoloState, row: ShopRow, qtyIn: number): BuyResult {
  if ((row.minRound || 0) > G.round) return { ok: false, why: 'locked', total: 0 };
  const qty = buyPacks(G, row, qtyIn);
  if (qty === 0) return { ok: false, why: 'full', total: 0 };
  const total = (row.price || 0) * qty;
  if (G.cash < total) return { ok: false, why: 'cash', total };
  G.cash -= total;
  if (row.kind === 'ammo') {
    G.ammo![row.w!] = (G.ammo![row.w!] || 0) + row.n * qty;
    return { ok: true, qty, total };
  }
  const n = (row.n || 0) * qty;
  switch (row.effect) {
    case 'repair': G.armor += repairRestores(G.armor, G.plate, row.n || 0, qty); break;
    case 'fuel': G.fuelBank += n; break;
    case 'plate': { const h = fitPlates({ armor: G.armor, plates: G.plate }, qty); G.armor = h.armor; G.plate = h.plates; break; }
    case 'shield': G.shield = true; break;
    case 'extralife': if (G.lives < TUNE.maxLives) G.lives += 1; else G.score += 500; break;
    case 'jammer': G.jammer = Math.max(G.jammer, n); break;
    case 'bunker': G.bunker = Math.max(G.bunker, n); break;
    case 'laststand': G.laststand = true; break;
    case 'parachute': G.chutes += n; break;
  }
  return { ok: true, qty, total };
}
