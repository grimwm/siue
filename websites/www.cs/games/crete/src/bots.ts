/* The Island of Crete: the two bots that judge a maze. The dasher runs the
 * route and never fights; the strategist plays well, and is what the
 * play-through (T) runs. Each looks at a game and names one action; the
 * engine carries it out. Pure: in the DOM-free program. */
import { key, manhattan } from "./grid.ts";
import type { Cell } from "./grid.ts";
import type { Game, ItemKind } from "./engine.ts";

export type BotAction =
  | { kind: "bash" }
  | { kind: "item"; item: ItemKind }
  | { kind: "wait" }
  | { kind: "move"; dr: number; dc: number }
  | { kind: "stuck" };

export type Bot = (game: Game) => BotAction;

/** Turns the strategist will wait in a row; a creature pacing just out of reach would otherwise hold it forever. */
export const WAIT_LIMIT = 6;
export const SNACK_AT_HP = 8;
/** Steps (by search) within which a creature on the route ahead gets the jammer. */
export const JAM_WITHIN = 2;

function stepAlong(from: Cell, path: Cell[]): BotAction {
  const next = path[1];
  return next ? { kind: "move", dr: next.r - from.r, dc: next.c - from.c } : { kind: "stuck" };
}

/** Walks goalPath() (which fetches fuses when a barrier blocks the way); never bashes, uses items or waits. */
export const dasher: Bot = (game) => stepAlong(game.G.player, game.goalPath());

/** The first rule that matches wins: bash, shard, jammer, snack, wait, step. */
export const strategist: Bot = (game) => {
  const G = game.G;
  const beside = manhattan(G.foe, G.player) === 1;
  if (beside && G.bashCd === 0) return { kind: "bash" };
  if (beside && G.inv.shard > 0 && G.frozen === 0) return { kind: "item", item: "shard" };
  const path = game.goalPath();
  const foeAhead = path.slice(1).some((c) => c.r === G.foe.r && c.c === G.foe.c);
  const d = game.foeDistance();
  if (foeAhead && G.inv.jammer > 0 && d >= 0 && d <= JAM_WITHIN && game.canJam()) return { kind: "item", item: "jammer" };
  if (G.hp <= SNACK_AT_HP && G.inv.snack > 0) return { kind: "item", item: "snack" };
  if (foeAhead && G.safe.has(key(G.player.r, G.player.c)) && G.stillTurns < WAIT_LIMIT) return { kind: "wait" };
  return stepAlong(G.player, path);
};
