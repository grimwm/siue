// websites/www.cs/games/crete/src/puzzle/step.ts
/* The Island of Crete: one turn. `step(state, action)` plays the player's
 * action (a move, a wait or a tool), then, unless the player has won, the
 * Minotaur's two steps, and returns the new state and what happened, for the
 * log, the sounds and the board's animation. A bump (an action that cannot
 * happen: a wall in the way, a tool not held or of no use) returns the same
 * state object and no events, and costs no turn. DOM-free. */
import { TERRAIN } from './tiles.ts';
import type { Cell, Dir, Gear, KeyColor, ObjectKind, Terrain } from './tiles.ts';
import { index, inside, same, next, gateOpen } from './state.ts';
import type { State } from './state.ts';
import { minotaurPhase } from './minotaur.ts';
import { work, tAt, oAt } from './work.ts';
import type { Action, GameEvent, Work } from './work.ts';

export type { Action, GameEvent } from './work.ts';
export interface StepResult { state: State; events: GameEvent[] }

function flip(w: Work, ev: GameEvent[]): void {
  w.terrain = w.terrain.map(t => (t === 'toggle-open' ? 'toggle-closed' : t === 'toggle-closed' ? 'toggle-open' : t));
  ev.push({ kind: 'flipped' });
}

/** A pushed block may enter this cell. Never the cell a catch throws the player back to, nor the Minotaur's
 *  start: a block there would share a cell with whoever lands on it. */
function blockMayEnter(w: Work, x: Cell): boolean {
  return inside(w.level, x) && TERRAIN[tAt(w, x)].block && !oAt(w, x)
    && !same(x, w.player) && !same(x, w.minotaur) && !same(x, w.cow)
    && !same(x, w.throwBack) && !same(x, w.level.minotaur);
}

/** A block has just entered `at` heading `d`: it sinks, presses, slides or is carried. It never enters `pusher`,
 *  the cell the player is stepping into. */
function settleBlock(w: Work, at: Cell, d: Dir, pusher: Cell, ev: GameEvent[]): void {
  let here = at;
  let dir = d;
  const seen = new Set<number>([index(w, here), index(w, pusher)]);
  for (;;) {
    const t = tAt(w, here);
    if (t === 'water') {
      w.objects[index(w, here)] = null;
      w.terrain[index(w, here)] = 'dirt';
      ev.push({ kind: 'sank', at: here });
      return;
    }
    if (t === 'button') flip(w, ev);
    const def = TERRAIN[t];
    if (def.carries) dir = def.carries;
    else if (!def.slides) return;
    const to = next(here, dir);
    if (!blockMayEnter(w, to) || seen.has(index(w, to))) return;
    w.objects[index(w, here)] = null;
    w.objects[index(w, to)] = 'block';
    ev.push({ kind: 'slid', who: 'block', from: here, to });
    seen.add(index(w, to));
    here = to;
  }
}

/** Whether the player may enter `to` heading `d`. When they may, a door on the way opens and a block is pushed
 *  (never while riding ice or a force floor). Every refusal happens before anything is changed. */
function enterAsPlayer(w: Work, to: Cell, d: Dir, riding: boolean, ev: GameEvent[]): boolean {
  if (!inside(w.level, to) || same(to, w.minotaur)) return false;
  const t = tAt(w, to);
  const def = TERRAIN[t];
  if (t === 'wall' || t === 'toggle-closed') return false;
  if (t === 'gate' && !gateOpen(w)) return false;
  if (def.needs && !w.gear.includes(def.needs)) return false;
  if (def.door && w.keys[def.door] <= 0) return false;
  const pushing = oAt(w, to) === 'block';
  if (pushing && (riding || !blockMayEnter(w, next(to, d)))) return false;
  if (def.door) {
    if (def.door !== 'green') w.keys[def.door]--;
    w.terrain[index(w, to)] = 'floor';
    ev.push({ kind: 'opened', color: def.door, at: to });
  }
  if (pushing) {
    const beyond = next(to, d);
    w.objects[index(w, to)] = null;
    w.objects[index(w, beyond)] = 'block';
    ev.push({ kind: 'pushed', from: to, to: beyond });
    settleBlock(w, beyond, d, to, ev);
  }
  return true;
}

/** The player is on `at`: take what lies there, press, mark the safe zone, win. */
function arrive(w: Work, at: Cell, ev: GameEvent[]): void {
  w.player = at;
  const o = oAt(w, at);
  if (o && o !== 'block') {
    w.objects[index(w, at)] = null;
    ev.push({ kind: 'took', what: o, at });
    if (o === 'relic') w.relicsLeft = Math.max(0, w.relicsLeft - 1);
    else if (o === 'page') w.pages++;
    else if (o.startsWith('key-')) w.keys[o.slice(4) as KeyColor]++;
    else if (o === 'mirror' || o === 'cake' || o === 'cow') w.tools[o]++;
    else if (!w.gear.includes(o as Gear)) w.gear.push(o as Gear);
  }
  const t = tAt(w, at);
  if (t === 'safe') w.throwBack = at;
  if (t === 'button') flip(w, ev);
  if (t === 'exit' && gateOpen(w)) {
    w.outcome = 'won';
    ev.push({ kind: 'won' });
  }
}

/** Ice and force floors under the player move them on, until the ride ends or would cross itself. A ride may
 *  carry the player back onto the cell the move started from. */
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
    arrive(w, to, ev);
  }
}

const sameItems = <T>(a: readonly T[], b: readonly T[]): boolean => a.every((v, i) => v === b[i]);

export function step(s: State, a: Action): StepResult {
  if (s.outcome !== 'playing') return { state: s, events: [] };
  const w = work(s);
  const ev: GameEvent[] = [];
  if (a.kind === 'move') {
    const from = w.player;
    const to = next(from, a.dir);
    if (!enterAsPlayer(w, to, a.dir, false, ev)) return { state: s, events: [] };
    ev.push({ kind: 'moved', who: 'player', from, to });
    arrive(w, to, ev);
    ridePlayer(w, a.dir, ev);
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
  if (w.outcome === 'playing' && !raisedMirror) minotaurPhase(w, ev);
  w.moves++;
  // A turn that left the terrain or the objects as they were shares the previous arrays.
  if (sameItems(w.terrain, s.terrain)) w.terrain = s.terrain as Terrain[];
  if (sameItems(w.objects, s.objects)) w.objects = s.objects as (ObjectKind | null)[];
  return { state: w, events: ev };
}
