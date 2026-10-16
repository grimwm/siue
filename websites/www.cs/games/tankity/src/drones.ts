/* Operation Tankity: what a drone buys.
 *
 * A drone has no free gear. It starts a match with a player's shells and $600,
 * earns as a player does, and shops before the first round and after every
 * round with a personality (game.yaml drones.personalities): how much of its
 * cash it keeps back, how much goes to defense first, and how it ranks guns.
 * droneShop is the pure choice, a list of purchases; the purchases go through
 * buy.ts, the function the player buys with. The draws come from a stream
 * seeded by (match seed, round, seat), never the shot stream, so a shop never
 * moves a flight. server/ai.php room_drone_shop and friends are the same,
 * pinned by the 'drone-shop' sim vectors. Pure: nothing here reads a clock or
 * Math.random. */
import { maxArmor, repairPacksWanted, repairRestores, fitPlates } from './armor.ts';
import { soloBuy } from './buy.ts';
import type { BuyResult, Wallet } from './buy.ts';
import { TUNE, hashSeed, mulberry32, startAmmo } from './sim.ts';
import type { Arsenal, Gear, Personality, Rng, ShopRow } from './sim.ts';

/** A drone's money: a wallet (what a player holds, bought with by buy.ts) and its shopping character. */
export interface Drone extends Wallet {
  /** The key of the personality it was dealt. */
  personality: string;
  /** The key of the personality whose rules it shops by this round: its own, or the one a shapeshifter shifted to. */
  form: string;
}

/** What droneShop reads of a drone: the hull, the parachutes, the shield and the cash. */
export interface DroneView {
  cash: number;
  armor: number;
  plate: number;
  chutes: number;
  shield: boolean;
}

/** One purchase: a gun's or a trick's key, and how many packs. */
export interface Purchase { item: string; qty: number }

const MAX_PACKS = 9;

/** The first gear of an effect (repair, parachute, plate, shield) in game.yaml's order, by effect and never by key. */
function gearRow(arsenal: Arsenal, effect: string): Gear | undefined {
  return Object.values(arsenal.gear).find(g => g.effect === effect);
}

/** A gun's rank for a pick: higher is better; the first gun in the arsenal's order wins a tie. */
function gunScore(pick: string, dmg: number, radius: number, pack: number, price: number): number {
  switch (pick) {
    case 'value': return (dmg * pack) / price;
    case 'precise': return dmg / radius / pack;
    default: return dmg; // big
  }
}

/** The guns a drone may buy with `left` dollars: ai guns the shop sells that do damage, in the arsenal's order. */
function affordable(arsenal: Arsenal, left: number): string[] {
  const out: string[] = [];
  for (const k of arsenal.order) {
    const a = arsenal.weapons[k]!;
    if (a.ai && a.pack > 0 && a.price > 0 && a.dmg > 0 && a.price <= left) out.push(k);
  }
  return out;
}

/**
 * What a drone with these rules buys on one visit. It keeps `reserve` of its cash, spends `defense` of the
 * rest on defense first (repair while the hull is below max, a parachute while it has none, a plate, a shield),
 * then buys guns by its pick until the budget or `maxBuys` runs out. Never over budget, never a gun without the
 * `ai` flag, one-shot gear once, repair only up to a full hull. `rng` is drawn only by the random pick.
 */
export function droneShop(state: DroneView, arsenal: Arsenal, personality: Personality, rng: Rng): Purchase[] {
  const reserve = personality.reserve ?? 0;
  const defense = personality.defense ?? 0;
  const maxBuys = personality.maxBuys ?? 1;
  const pick = personality.pick ?? 'big';
  const budget = Math.floor(state.cash * (1 - reserve));
  const defBudget = Math.floor(budget * defense);
  const buys: Purchase[] = [];
  let spent = 0;
  let armor = state.armor, plate = state.plate, chutes = state.chutes, shield = state.shield;
  const defLeft = (): number => defBudget - spent;

  const repair = gearRow(arsenal, 'repair');
  if (repair && buys.length < maxBuys && armor < maxArmor(plate) && repair.price > 0) {
    const qty = Math.min(repairPacksWanted(armor, plate, repair.n || 0), MAX_PACKS, Math.floor(defLeft() / repair.price));
    if (qty >= 1) {
      buys.push({ item: repair.key, qty });
      spent += repair.price * qty;
      armor += repairRestores(armor, plate, (repair.n || 0), qty);
    }
  }
  const chute = gearRow(arsenal, 'parachute');
  if (chute && buys.length < maxBuys && chutes === 0 && chute.price <= defLeft()) {
    buys.push({ item: chute.key, qty: 1 });
    spent += chute.price;
    chutes += chute.n || 0;
  }
  const plateRow = gearRow(arsenal, 'plate');
  if (plateRow && buys.length < maxBuys && plateRow.price <= defLeft()) {
    buys.push({ item: plateRow.key, qty: 1 });
    spent += plateRow.price;
    const h = fitPlates({ armor, plates: plate }, 1);
    armor = h.armor; plate = h.plates;
  }
  const shieldRow = gearRow(arsenal, 'shield');
  if (shieldRow && buys.length < maxBuys && !shield && shieldRow.price <= defLeft()) {
    buys.push({ item: shieldRow.key, qty: 1 });
    spent += shieldRow.price;
    shield = true;
  }

  while (buys.length < maxBuys) {
    const left = budget - spent;
    const keys = affordable(arsenal, left);
    if (!keys.length) break;
    let chosen = keys[0]!;
    if (pick === 'random') {
      let total = 0;
      for (const k of keys) total += arsenal.weapons[k]!.price;
      const r = rng() * total;
      let acc = 0;
      chosen = keys[keys.length - 1]!;
      for (const k of keys) {
        acc += arsenal.weapons[k]!.price;
        if (r < acc) { chosen = k; break; }
      }
    } else {
      let best = -Infinity;
      for (const k of keys) {
        const a = arsenal.weapons[k]!;
        const score = gunScore(pick, a.dmg, a.radius, a.pack, a.price);
        if (score > best) { best = score; chosen = k; }
      }
    }
    buys.push({ item: chosen, qty: 1 });
    spent += arsenal.weapons[chosen]!.price;
  }
  return buys;
}

/** The personality with this key. */
export function personalityOf(arsenal: Arsenal, key: string): Personality | undefined {
  return arsenal.drones.find(p => p.key === key);
}

/** The personalities that have rules of their own: what a shapeshifter may take. */
function ruled(arsenal: Arsenal, self: string): Personality[] {
  return arsenal.drones.filter(p => p.key !== self && p.shift === undefined);
}

/** The stream a drone's draws come from in one round: the match seed, the round (0 is the pre-match shop) and the seat. */
export function droneRng(seed: string, round: number, seat: number): Rng {
  return mulberry32(hashSeed(`${seed}|drone|${round}|${seat}`));
}

/** A new drone: a personality drawn uniformly from the seed and its seat, a shapeshifter's first form, and a player's stake. */
export function dealDrone(arsenal: Arsenal, seed: string, seat: number): Drone {
  const list = arsenal.drones;
  const rng = mulberry32(hashSeed(`${seed}|drone|deal|${seat}`));
  const mine = list.length ? list[Math.floor(rng() * list.length)]! : undefined;
  let form = mine ? mine.key : '';
  if (mine && mine.shift !== undefined) {
    const others = ruled(arsenal, mine.key);
    form = others.length ? others[Math.floor(rng() * others.length)]!.key : mine.key;
  }
  return {
    personality: mine ? mine.key : '', form,
    cash: 600, ammo: startAmmo(arsenal), armor: TUNE.playerArmor, plate: 0, shield: false, chutes: 0,
    fuelBank: 0, lives: 0, score: 0, jammer: 0, bunker: 0, laststand: false,
  };
}

/** Which personality's rules a drone shops by this round. A shapeshifter after the first shop shifts with
 *  probability `shift` (one draw), to another personality with rules (a second draw); else it keeps its form. */
export function droneForm(arsenal: Arsenal, drone: Pick<Drone, 'personality' | 'form'>, round: number, rng: Rng): string {
  const mine = personalityOf(arsenal, drone.personality);
  if (!mine || mine.shift === undefined) return drone.personality;
  if (round > 0 && rng() < mine.shift) {
    const others = ruled(arsenal, mine.key);
    if (others.length) return others[Math.floor(rng() * others.length)]!.key;
  }
  return drone.form;
}

/** The shop row a purchase names. */
export function shopRowOf(arsenal: Arsenal, item: string): ShopRow | undefined {
  return arsenal.shop.find(r => (r.kind === 'ammo' ? r.w : r.g) === item);
}

/** One shop visit: the drone settles its form for the round, chooses, and buys each purchase with the player's
 *  buy function. Returns the purchases that went through. */
export function droneVisit(drone: Drone, arsenal: Arsenal, seed: string, round: number, seat: number): Purchase[] {
  const rng = droneRng(seed, round, seat);
  drone.form = droneForm(arsenal, drone, round, rng);
  const rules = personalityOf(arsenal, drone.form);
  if (!rules) return [];
  const done: Purchase[] = [];
  for (const p of droneShop(drone, arsenal, rules, rng)) {
    const row = shopRowOf(arsenal, p.item);
    if (!row) continue;
    const r: BuyResult = soloBuy(drone, row, p.qty);
    if (r.ok) done.push({ item: p.item, qty: r.qty });
  }
  return done;
}
