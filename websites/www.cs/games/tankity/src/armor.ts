/* Operation Tankity: the player's armor between rounds.
 *
 * Max armor, what a repair restores, a plate, the armor a round musters with,
 * and the shop's lines about them. Pure. server/rules.php room_max_armor ..
 * room_carry_armor are the same rules, pinned by the 'armor' sim vectors. */
import { TUNE } from './sim.ts';

export const PLATE_ARMOR = 25;

/** Armor carried into the next round and hull plates fitted. */
export interface Hull { armor: number; plates: number }

export function maxArmor(plates: number): number {
  return TUNE.playerArmor + PLATE_ARMOR * plates;
}

/** Armor `packs` repairs of `per` would restore: never past max. */
export function repairRestores(armor: number, plates: number, per: number, packs: number): number {
  return Math.max(0, Math.min(per * packs, maxArmor(plates) - armor));
}

/** The fewest packs that fill the hull; 0 at full armor. */
export function repairPacksWanted(armor: number, plates: number, per: number): number {
  const missing = maxArmor(plates) - armor;
  return missing <= 0 || per <= 0 ? 0 : Math.ceil(missing / per);
}

export function fitPlates(h: Hull, qty: number): Hull {
  return { armor: h.armor + PLATE_ARMOR * qty, plates: h.plates + qty };
}

/** What the next round musters with: this round's end, or a fresh tank at full max after a wreck. */
export function carryArmor(h: Hull, endHp: number, wrecked: boolean): Hull {
  const max = maxArmor(h.plates);
  return { armor: wrecked ? max : Math.min(endHp, max), plates: h.plates };
}

export function armorLabel(armor: number, plates: number): string {
  return `${armor} of ${maxArmor(plates)}`;
}

export function repairNote(armor: number, plates: number, per: number, packs: number): string {
  const back = repairRestores(armor, plates, per, packs);
  return back === 0
    ? `Armor full (${armorLabel(armor, plates)}).`
    : `Restores ${back} (you're at ${armorLabel(armor, plates)}).`;
}

export function plateNote(plates: number): string {
  return `Max armor ${maxArmor(plates)}${plates ? ` (${plates} fitted)` : ''}; a plate adds 25 max and 25 armor now.`;
}
