/* The Island of Crete: the words of the status bar, short enough for
 * a phone. `heartsNote` and `keysNote` are the long forms, for a tooltip and
 * a screen reader. Best is the level's fewest possible moves, where it is
 * known; past it the stat says by how many ("42 +3"), since a perfect clear
 * is then out of reach. DOM-free. */
import { KEY_COLORS } from "./puzzle/tiles.ts";
import type { Gear, KeyColor } from "./puzzle/tiles.ts";

export interface StatusInput {
  /** The level's place, short ("Ch 1 · 3"); empty for a level from outside the campaign. */
  trial: string;
  /** The place in full, with the level's title ("Chapter 1, Level 3: The first gate"); empty when `trial` is. */
  trialNote?: string;
  hearts: number;
  relicsLeft: number;
  keys: Record<KeyColor, number>;
  gear: readonly Gear[];
  moves: number;
  /** Turns the Minotaur stays stone; 0 when it moves. */
  stone: number;
  /** The level's fewest possible moves, when known. */
  fewest?: number;
  /** The player's own best clear of this level, when there is one: said in Best's tooltip. */
  yourBest?: number | null;
}

export interface StatusView {
  trial: string;
  /** The level's place in full, for a tooltip and a screen reader; empty outside the campaign. */
  trialNote: string;
  hearts: string;
  relics: string;
  keys: string;
  /** The held keys spelled out, for a screen reader. */
  keysNote: string;
  gear: string;
  moves: string;
  heartsNote: string;
  /** The fewest possible moves, with "+N" once the moves are past it; empty when not known. */
  best: string;
  /** How many moves past the fewest the try is: 0 while a perfect clear is still possible. */
  over: number;
  /** Best in words, for a tooltip and a screen reader. */
  bestNote: string;
}

const DOT: Record<KeyColor, string> = { red: "🔴", blue: "🔵", yellow: "🟡", green: "🟢" };

export function statusView(i: StatusInput): StatusView {
  const held = KEY_COLORS.filter((c) => i.keys[c] > 0);
  let heartsNote = `${i.hearts} heart${i.hearts === 1 ? "" : "s"} left`;
  if (i.stone > 0) heartsNote += `; the Minotaur is stone for ${i.stone} turn${i.stone === 1 ? "" : "s"}`;
  return {
    trial: i.trial,
    trialNote: i.trialNote ?? "",
    hearts: `♥ ${i.hearts}`,
    relics: String(i.relicsLeft),
    keys: held.map((c) => `${DOT[c]}${i.keys[c]}`).join(" "),
    keysNote: held.length ? held.map((c) => `${c} key ×${i.keys[c]}`).join(", ") : "no keys",
    gear: i.gear.join(", "),
    moves: String(i.moves),
    heartsNote,
    ...bestOf(i),
  };
}

function bestOf(i: StatusInput): { best: string; over: number; bestNote: string } {
  if (i.fewest === undefined) return { best: "", over: 0, bestNote: "" };
  const over = Math.max(0, i.moves - i.fewest);
  const yours = i.yourBest != null ? `; your best clear ${i.yourBest}` : "";
  return {
    best: over > 0 ? `${i.fewest} +${over}` : String(i.fewest),
    over,
    bestNote: `Fewest possible moves ${i.fewest}${over > 0 ? `; ${over} over, so a perfect clear is out of reach (Undo takes moves back)` : ""}${yours}`,
  };
}
