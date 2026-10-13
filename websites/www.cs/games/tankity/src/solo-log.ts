/* Operation Tankity: a solo round as the server plays it.
 *
 * What the browser sends as each round ends: the purchases made before it,
 * each shot (gun, angle, power, and where the tank had driven to), and how the
 * browser saw it end (the claim). The server plays the round from the run's
 * stored state; a claim it does not reach voids the run. Numbers are the
 * browser's own: JSON carries a double exactly. */
import type { ShopRow, Tank } from './sim.ts';

export interface SoloBuy { i: string; q: number }
export interface SoloShot { w: string; a: number; p: number; x: number }
export type RoundEnd = 'roundWon' | 'tankLost' | 'matchLost';
export interface RoundClaim { end: RoundEnd; score: number; cash: number; lives: number; roundsWon: number }
export interface SoloRoundLog { n: number; buys: SoloBuy[]; shots: SoloShot[]; claim: RoundClaim }

/** server/solo.php SOLO_MAX_SHOTS and SOLO_MAX_BUYS: a round past them is refused. */
export const ROUND_MAX_SHOTS = 200;
export const ROUND_MAX_BUYS = 60;

export interface RoundRecorder { buys: SoloBuy[]; shots: SoloShot[] }

export function newRecorder(): RoundRecorder {
  return { buys: [], shots: [] };
}
export function recordBuy(r: RoundRecorder, row: Pick<ShopRow, 'kind' | 'w' | 'g'>, qty: number): void {
  r.buys.push({ i: (row.kind === 'ammo' ? row.w : row.g)!, q: qty });
}
export function recordShot(r: RoundRecorder, t: Pick<Tank, 'x' | 'angle' | 'power'>, w: string): void {
  r.shots.push({ w, a: t.angle, p: t.power, x: t.x });
}
/** The round as sent; the recorder is emptied for the next one. */
export function closeRound(r: RoundRecorder, n: number, claim: RoundClaim): SoloRoundLog {
  const round = { n, buys: r.buys, shots: r.shots, claim };
  r.buys = [];
  r.shots = [];
  return round;
}

const num = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const int = (v: unknown): v is number => Number.isInteger(v);
const ENDS: readonly string[] = ['roundWon', 'tankLost', 'matchLost'];
function isBuy(v: unknown): v is SoloBuy {
  const o = v as Record<string, unknown> | null;
  return !!o && typeof o === 'object' && typeof o['i'] === 'string' && int(o['q']);
}
function isShot(v: unknown): v is SoloShot {
  const o = v as Record<string, unknown> | null;
  return !!o && typeof o === 'object' && typeof o['w'] === 'string' && num(o['a']) && num(o['p']) && num(o['x']);
}
function isClaim(v: unknown): v is RoundClaim {
  const o = v as Record<string, unknown> | null;
  return !!o && typeof o === 'object' && ENDS.includes(o['end'] as string)
    && int(o['score']) && int(o['cash']) && int(o['lives']) && int(o['roundsWon']);
}
export function isRoundLog(v: unknown): v is SoloRoundLog {
  if (!v || typeof v !== 'object') return false;
  const o = v as Record<string, unknown>;
  return int(o['n']) && (o['n'] as number) >= 1
    && Array.isArray(o['buys']) && o['buys'].length <= ROUND_MAX_BUYS && o['buys'].every(isBuy)
    && Array.isArray(o['shots']) && o['shots'].length <= ROUND_MAX_SHOTS && o['shots'].every(isShot)
    && isClaim(o['claim']);
}

/** PHP hashes a seed's bytes and the browser its UTF-16 units: only printable
 * ASCII hashes the same on both. */
export function replayableSeed(seed: string): boolean {
  return /^[\x20-\x7e]{1,64}$/.test(seed);
}
