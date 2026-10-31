/* The Island of Crete: the words of the status bar, short enough for
 * a phone. `heartsNote` and `keysNote` are the long forms, for a tooltip and
 * a screen reader. DOM-free. */
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
  };
}
