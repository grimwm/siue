// websites/www.cs/games/crete/src/puzzle/step.ts
/* The Island of Crete: one turn. `step(state, action)` plays the player's
 * action (a move, a wait or a tool), then, unless the player has won or been
 * caught, the hazards' moves and the Minotaur's two steps, and returns the new
 * state and what happened, for the log, the sounds and the board's animation.
 * A bump (an action that cannot happen: a wall in the way, a tool not held or
 * of no use) returns the same state object and no events, and costs no turn;
 * bumping a fake or invisible wall finds it, and that is a turn. DOM-free. */
import { TERRAIN } from './tiles.ts';
import type { Cell, Dir, Gear, Hazard, KeyColor, ObjectKind, Terrain } from './tiles.ts';
import { index, inside, same, next, gateOpen } from './state.ts';
import type { State } from './state.ts';
import { minotaurPhase } from './minotaur.ts';
import { hazardPhase } from './hazards.ts';
import { caught, leave, turnOver } from './catch.ts';
import { fireRed, flip, hazardOn, heldAt, teleportExit, teleportsLinked } from './pieces.ts';
import { work, tAt, oAt } from './work.ts';
import type { Action, GameEvent, Work } from './work.ts';

export type { Action, GameEvent } from './work.ts';
export interface StepResult { state: State; events: GameEvent[] }

/** A pushed block may enter this cell. Never a hazard's cell, the cell a catch throws the player back to, nor the
 *  Minotaur's start: a block there would share a cell with whoever lands on it. */
export function blockMayEnter(w: Work, x: Cell): boolean {
  return inside(w.level, x) && TERRAIN[tAt(w, x)].block && !oAt(w, x)
    && !same(x, w.player) && !same(x, w.minotaur) && !same(x, w.cow)
    && !same(x, w.throwBack) && !same(x, w.level.minotaur) && !hazardOn(w, x);
}

/** Where a block leaving `from` heading `d` lands: the cell `entry` next to it, or, when that is a teleport, the
 *  cell beyond its exit `via`. `ok` adds the caller's own refusals. Null when it cannot go. */
interface BlockMove { entry: Cell; via?: Cell; to: Cell }
function blockMove(w: Work, from: Cell, d: Dir, ok: (x: Cell) => boolean): BlockMove | null {
  const entry = next(from, d);
  if (tAt(w, entry) !== 'teleport') return blockMayEnter(w, entry) && ok(entry) ? { entry, to: entry } : null;
  if (same(entry, w.player)) return null;
  const exit = teleportExit(w, entry, d, x => blockMayEnter(w, x) && ok(x));
  return exit && { entry, via: exit.via, to: exit.to };
}

function moveBlock(w: Work, from: Cell, m: BlockMove, how: 'pushed' | 'slid', ev: GameEvent[]): void {
  w.objects[index(w, from)] = null;
  w.objects[index(w, m.to)] = 'block';
  ev.push(how === 'pushed' ? { kind: 'pushed', from, to: m.entry } : { kind: 'slid', who: 'block', from, to: m.entry });
  if (m.via) ev.push({ kind: 'teleported', who: 'block', from: m.entry, via: m.via, to: m.to });
}

/** A block has just entered `at` heading `d`: it sinks, explodes, presses, slides or is carried. It never enters
 *  `pusher`, the cell the player is stepping into, and a red button it presses clones nothing there. `inPhase`
 *  is passed on to `fireRed`. */
export function settleBlock(w: Work, at: Cell, d: Dir, pusher: Cell | undefined, ev: GameEvent[], inPhase = false): void {
  let here = at;
  let dir = d;
  const seen = new Set<number>([index(w, here)]);
  if (pusher) seen.add(index(w, pusher));
  for (;;) {
    const t = tAt(w, here);
    if (t === 'water' || t === 'bomb') {
      w.objects[index(w, here)] = null;
      w.terrain[index(w, here)] = t === 'water' ? 'dirt' : 'floor';
      ev.push(t === 'water' ? { kind: 'sank', at: here } : { kind: 'exploded', who: 'block', at: here });
      return;
    }
    if (t === 'button') flip(w, ev);
    else if (t === 'button-red') fireRed(w, index(w, here), ev, pusher, inPhase);
    if (heldAt(w, here)) ev.push({ kind: 'held', who: 'block', at: here });
    const def = TERRAIN[t];
    if (def.carries) dir = def.carries;
    else if (!def.slides) return;
    const m = blockMove(w, here, dir, x => !seen.has(index(w, x)));
    if (!m) return;
    moveBlock(w, here, m, 'slid', ev);
    seen.add(index(w, m.to));
    here = m.to;
  }
}

/** Terrain the player never enters. A fake or invisible wall is found only by a bump of his own step. */
const PLAYER_WALLS: ReadonlySet<Terrain> = new Set<Terrain>(['wall', 'toggle-closed', 'fake-wall', 'invisible-wall', 'clone']);

/** Whether the player may enter `to` heading `d`, pushing a block there (never while riding). Changes nothing. */
function playerMayEnter(w: Work, to: Cell, d: Dir, riding: boolean): boolean {
  if (!inside(w.level, to) || same(to, w.minotaur)) return false;
  const t = tAt(w, to);
  const def = TERRAIN[t];
  if (PLAYER_WALLS.has(t)) return false;
  if (t === 'teleport' && !teleportsLinked(w.level)) return false;
  if (t === 'gate' && !gateOpen(w)) return false;
  if (def.needs && !w.gear.includes(def.needs)) return false;
  if (def.door && w.keys[def.door] <= 0) return false;
  if (hazardOn(w, to) || oAt(w, to) !== 'block') return true;
  return !riding && !heldAt(w, to) && !!blockMove(w, to, d, () => true);
}

/** Whether the player enters `to` heading `d`. When they may, a door on the way opens and a block is pushed; a
 *  hazard there catches them where they stand, and they do not enter. Every refusal happens before anything is
 *  changed. */
function enterAsPlayer(w: Work, to: Cell, d: Dir, riding: boolean, ev: GameEvent[]): boolean {
  if (!playerMayEnter(w, to, d, riding)) return false;
  if (hazardOn(w, to)) {
    caught(w, ev, 'hazard');
    return false;
  }
  const def = TERRAIN[tAt(w, to)];
  if (def.door) {
    if (def.door !== 'green') w.keys[def.door]--;
    w.terrain[index(w, to)] = 'floor';
    ev.push({ kind: 'opened', color: def.door, at: to });
  }
  if (oAt(w, to) === 'block') {
    const m = blockMove(w, to, d, () => true)!;
    moveBlock(w, to, m, 'pushed', ev);
    settleBlock(w, m.to, d, to, ev);
  }
  return true;
}

/** The player is on `at`, heading `d`: a bomb catches them; else take what lies there, lose gear to a thief,
 *  press, mark the safe zone, win, or go out of a teleport and on to the cell beyond its exit. Out of a teleport
 *  entered on a ride, a block beyond is a blocked exit. True when a bomb or a hazard caught the player. */
function arrive(w: Work, at: Cell, d: Dir, riding: boolean, ev: GameEvent[]): boolean {
  leave(w, w.player, ev);
  w.player = at;
  const t = tAt(w, at);
  if (t === 'bomb') {
    w.terrain[index(w, at)] = 'floor';
    ev.push({ kind: 'exploded', who: 'player', at });
    caught(w, ev, 'bomb');
    return true;
  }
  const o = oAt(w, at);
  if (o && o !== 'block') {
    w.objects[index(w, at)] = null;
    ev.push({ kind: 'took', what: o, at });
    if (o === 'relic') w.relicsLeft = Math.max(0, w.relicsLeft - 1);
    else if (o === 'page') w.pages |= 1 << w.level.pageCells.indexOf(index(w, at));
    else if (o.startsWith('key-')) w.keys[o.slice(4) as KeyColor]++;
    else if (o === 'mirror' || o === 'cake' || o === 'cow') w.tools[o]++;
    else if (!w.gear.includes(o as Gear)) w.gear.push(o as Gear);
  }
  if (t === 'thief' && w.gear.length > 0) {
    ev.push({ kind: 'robbed', at, gear: w.gear });
    w.gear = [];
  }
  if (t === 'safe') w.throwBack = at;
  if (heldAt(w, at)) ev.push({ kind: 'held', who: 'player', at });
  if (t === 'button') flip(w, ev);
  else if (t === 'button-red') fireRed(w, index(w, at), ev);
  if (t === 'exit' && gateOpen(w)) {
    w.outcome = 'won';
    ev.push({ kind: 'won' });
  }
  if (t === 'teleport') {
    const exit = teleportExit(w, at, d, x => playerMayEnter(w, x, d, riding));
    if (!exit) return false;
    // The exit passed playerMayEnter, so entering fails only when a hazard there caught the player.
    if (!enterAsPlayer(w, exit.to, d, riding, ev)) return true;
    ev.push({ kind: 'teleported', who: 'player', from: at, via: exit.via, to: exit.to });
    return arrive(w, exit.to, d, riding, ev);
  }
  return false;
}

/** Ice and force floors under the player move them on, until the ride ends, would cross itself or a catch ends
 *  the turn. A ride may carry the player back onto the cell the move started from. */
function ridePlayer(w: Work, d: Dir, ev: GameEvent[]): void {
  let dir = d;
  const seen = new Set<number>([index(w, w.player)]);
  while (w.outcome === 'playing') {
    const def = TERRAIN[tAt(w, w.player)];
    if (def.carries && !w.gear.includes('suction')) dir = def.carries;
    else if (!def.slides || w.gear.includes(def.slides)) return;
    const to = next(w.player, dir);
    if (seen.has(index(w, to)) || !enterAsPlayer(w, to, dir, true, ev)) return;
    ev.push({ kind: 'slid', who: 'player', from: w.player, to });
    seen.add(index(w, to));
    if (arrive(w, to, dir, true, ev)) return;
    seen.add(index(w, w.player));
  }
}

function sameItems<T>(a: readonly T[], b: readonly T[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

export function step(s: State, a: Action): StepResult {
  if (s.outcome !== 'playing') return { state: s, events: [] };
  const w = work(s);
  const ev: GameEvent[] = [];
  if (a.kind === 'move') {
    const from = w.player;
    if (heldAt(w, from)) return { state: s, events: [] };
    const to = next(from, a.dir);
    const t = tAt(w, to);
    if (t === 'fake-wall' || t === 'invisible-wall') {
      w.terrain[index(w, to)] = t === 'fake-wall' ? 'floor' : 'wall';
      ev.push({ kind: 'revealed', at: to, what: t });
    } else {
      if (enterAsPlayer(w, to, a.dir, false, ev)) {
        ev.push({ kind: 'moved', who: 'player', from, to });
        if (!arrive(w, to, a.dir, false, ev)) ridePlayer(w, a.dir, ev);
      } else if (!turnOver(w, ev)) return { state: s, events: [] };
    }
  } else if (a.kind === 'tool') {
    if (w.tools[a.tool] <= 0) return { state: s, events: [] };
    if (a.tool === 'cake') {
      if (w.hearts >= w.level.hearts) return { state: s, events: [] };
      w.hearts++;
    } else if (a.tool === 'cow') {
      if (w.cow) return { state: s, events: [] };
      w.cow = w.player;
    } else {
      w.stone = 3;
      ev.push({ kind: 'stoned', turns: 3 });
    }
    w.tools[a.tool]--;
  }
  // The mirror turn is itself a stone turn: the Minotaur sits it out without spending any of the 3 that follow.
  const raisedMirror = a.kind === 'tool' && a.tool === 'mirror';
  if (!turnOver(w, ev)) hazardPhase(w, ev);
  if (!raisedMirror && !turnOver(w, ev)) minotaurPhase(w, ev);
  w.moves++;
  // A turn that left the terrain or the objects as they were shares the previous arrays.
  if (sameItems(w.terrain, s.terrain)) w.terrain = s.terrain as Terrain[];
  if (sameItems(w.objects, s.objects)) w.objects = s.objects as (ObjectKind | null)[];
  if (sameItems(w.hazards, s.hazards)) w.hazards = s.hazards as Hazard[];
  return { state: w, events: ev };
}
