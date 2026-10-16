/* Operation Tankity: what a purchase does, in a solo match.
 *
 * One function buys for the player and for every drone (src/drones.ts decides what a
 * drone wants; this charges it and hands it over), so no tank buys by other rules.
 * server/rules.php room_buy is the same rules. Pure: nothing here reads a clock
 * or Math.random. */
import { fitPlates, repairPacksWanted, repairRestores } from './armor.ts';
import { TUNE, clamp } from './sim.ts';
import type { Ammo, ShopRow } from './sim.ts';

/** What a buyer holds: the match's state for the player, a drone's own record for a drone. */
export interface Wallet {
  cash: number;
  ammo: Ammo | null;
  armor: number;
  plate: number;
  fuelBank: number;
  shield: boolean;
  lives: number;
  score: number;
  jammer: number;
  bunker: number;
  laststand: boolean;
  chutes: number;
}

/** Tricks that do their one thing once: buying more is money on fire. */
export const ONE_SHOT: ReadonlySet<string> = new Set(['shield', 'extralife', 'laststand']);

export function isOneShot(row: Pick<ShopRow, 'kind' | 'effect'>): boolean {
  return row.kind === 'gear' && ONE_SHOT.has(row.effect || '');
}

export type BuyResult = { ok: true; qty: number; total: number } | { ok: false; why: 'cash' | 'full'; total: number };

/** How many packs a purchase of `qtyIn` really buys: one for a one-shot trick,
 * and for Repair no more than the hull needs (0 when it is full). The shop prices
 * and gates by this, a room's log line reports it, and soloBuy charges it. */
export function buyPacks(G: Pick<Wallet, 'armor' | 'plate'>, row: ShopRow, qtyIn: number): number {
  const qty = clamp(Math.floor(qtyIn || 1), 1, 9);
  if (isOneShot(row)) return 1;
  if (row.effect === 'repair') return Math.min(qty, repairPacksWanted(G.armor, G.plate, row.n));
  return qty;
}

/** One purchase, by server/rules.php room_buy()'s rules. The player buys with the match's state, a drone with its own wallet. */
export function soloBuy(G: Wallet, row: ShopRow, qtyIn: number): BuyResult {
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
