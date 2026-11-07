/* The Island of Crete: what the tools do, said as they happen. A line when Theseus picks up Daedalus's cow, Medusa's
 * mirror or a honey cake (what it does, and its key or button); a line when he uses one and when its effect ends; and
 * the effects at work now, for the status bar's chips. Also the line for a Theseus boxed in, every move a bump. All
 * of it is read from the engine's own state and events (src/puzzle/step.ts), never a rule of its own. DOM-free. */
import { DIRS, TOOLS } from './puzzle/tiles.ts';
import type { Tool } from './puzzle/tiles.ts';
import type { State } from './puzzle/state.ts';
import { step } from './puzzle/step.ts';
import type { Action, GameEvent } from './puzzle/step.ts';
import { heldAt } from './puzzle/pieces.ts';
import { turnOf } from './puzzle/work.ts';
import { KEYS } from './keys.ts';

/** How the player plays: with keys at hand (a fine pointer), or by touch. Keys are named by key, buttons by face. */
export type Input = 'keys' | 'touch';

/** A piece of a line the page says: words, or a tool's button named by its picture (src/ui.ts draws the picture the
 *  tool's button shows, src/ui/strip.tsx, with `TOOL_ALT` as its text). */
export type Part = string | { tool: Tool };
/** A line the page says: plain words, or words with tools' pictures among them. */
export type Said = string | readonly Part[];

/** A tool's picture in words, for a screen reader and the story log. */
export const TOOL_ALT: Record<Tool, string> = { mirror: 'Mirror', cake: 'Honey Cake', cow: 'Cow' };

/** A line in words alone: each tool's picture by its `TOOL_ALT`. */
export function saidText(said: Said): string {
  return typeof said === 'string' ? said : said.map(p => (typeof p === 'string' ? p : TOOL_ALT[p.tool])).join('');
}

/** A turn's lines joined into one, a space between each: plain words while every line is. Neighbouring words merge,
 *  so a line with pictures holds words and pictures in turn. */
export function joinSaid(lines: readonly Said[]): Said {
  if (lines.every(l => typeof l === 'string')) return lines.join(' ');
  return merged(lines.flatMap((l, i) => [...(i > 0 ? [' '] : []), ...(typeof l === 'string' ? [l] : l)]));
}

/** `parts` with neighbouring words run together. */
function merged(parts: readonly Part[]): Part[] {
  const out: Part[] = [];
  for (const p of parts) {
    const last = out[out.length - 1];
    if (typeof p === 'string' && typeof last === 'string') out[out.length - 1] = last + p;
    else out.push(p);
  }
  return out;
}

/** "press C or tap [the cow's picture]" with keys at hand (a fine pointer is no promise of a keyboard, so the button
 *  is named too), "tap [the cow's picture]" by touch. */
const useOf = (tool: Tool, input: Input): Part[] =>
  [input === 'keys' ? `press ${TOOLS[tool].key} or tap ` : 'tap ', { tool }];

/** What a tool just picked up does, and how to use it. */
export function pickupLine(tool: Tool, input: Input): Part[] {
  switch (tool) {
    case 'cow':
      return merged(["Daedalus's cow: ", ...useOf('cow', input), ' to set it down where you stand. The Minotaur goes for the cow, not you, until he reaches it.']);
    case 'mirror':
      return merged(["Medusa's mirror: ", ...useOf('mirror', input), ' to raise it. The Minotaur turns to stone for that turn and the 3 after; stone blocks everyone like a wall.']);
    case 'cake':
      return merged(['Honey cake: ', ...useOf('cake', input), ' to eat it for one more heart.']);
  }
}

const TOOL_ORDER = Object.keys(TOOLS) as Tool[];

/** Watches the try for tools picked up, for the tool buttons' pickup glow (src/ui/strip.tsx). Each call reads the
 *  state shown now and what the last turn played took (`Game.took`, empty after open, undo and restart) and answers
 *  the tools a new turn just picked up and still holds; a state already seen (a redraw, a look switched) answers
 *  none, and so does the first state it sees. */
export function pickupWatch(): (now: State, took: readonly string[]) => Tool[] {
  let seen: State | null = null;
  return (now, took) => {
    const was = seen;
    seen = now;
    if (was === null || was === now) return [];
    return TOOL_ORDER.filter(t => took.includes(t) && now.tools[t] > 0);
  };
}

const turns = (n: number): string => `${n} more turn${n === 1 ? '' : 's'}`;

/** What a turn's tools said: each tool picked up, a tool used, and an effect that ended. `a` is the action played,
 *  `events` the turn's, `before` and `after` the states either side of it. A turn that ended in a catch says nothing
 *  of a cow it took: the catch is said. */
export function toolLines(a: Action, events: readonly GameEvent[], before: State, after: State, input: Input): Said[] {
  const out: Said[] = [];
  for (const e of events) {
    if (e.kind === 'took' && (e.what === 'cow' || e.what === 'mirror' || e.what === 'cake')) out.push(pickupLine(e.what, input));
  }
  const caught = events.some(e => e.kind === 'caught');
  const used = a.kind === 'tool' ? a.tool : null;
  if (used === 'cow') {
    if (after.cow) out.push('The cow stands here. The Minotaur is chasing the cow, not you.');
  } else if (used === 'mirror') {
    out.push(`The Minotaur is stone for ${turns(after.stone)}. Stone blocks everyone like a wall.`);
  } else if (used === 'cake') {
    out.push(`Honey cake: +1 heart (${after.hearts} hearts).`);
  }
  if (before.cow && !after.cow && !caught) out.push('The Minotaur reached the cow. He comes for you again.');
  if (before.stone > 0 && after.stone === 0) out.push('The stone wears off: the Minotaur moves again next turn.');
  return out;
}

/** An effect at work, for a status bar chip: `label` in Title Case, `note` a sentence for its tooltip. */
export interface Effect {
  id: 'stone' | 'cow';
  label: string;
  /** Its label in short, where it has one, for a narrow phone showing two chips at once. */
  short?: string;
  note: string;
}

/** The effects at work in `s`: the Minotaur stone (Medusa's mirror), then the cow standing (Daedalus's cow). */
export function activeEffects(s: State): Effect[] {
  const out: Effect[] = [];
  if (s.outcome !== 'playing') return out;
  if (s.stone > 0) {
    out.push({
      id: 'stone',
      label: `Stone: ${s.stone} Turn${s.stone === 1 ? '' : 's'}`,
      short: `Stone: ${s.stone}`,
      note: `The Minotaur is stone for ${turns(s.stone)}: he cannot move, and blocks everyone like a wall.`,
    });
  }
  if (s.cow) {
    out.push({ id: 'cow', label: 'Chasing the Cow', short: 'Cow', note: 'The Minotaur goes for the cow, not you, until he reaches it.' });
  }
  return out;
}

/** Theseus is boxed in: the try goes on, no snare holds him, and every move is a bump (walls, a shut door, the board's
 *  edge, a stone Minotaur; walking into the live one is a catch, so it never boxes him in). Only Wait, a tool, Undo
 *  or Restart plays on. */
export function boxedIn(s: State): boolean {
  if (s.outcome !== 'playing' || heldAt(turnOf(s), s.player)) return false;
  return DIRS.every(d => step(s, { kind: 'move', dir: d }).state === s);
}

/** What the page says to a boxed-in Theseus. */
export function boxedInLine(input: Input): string {
  return input === 'keys'
    ? `No way to move: Wait (${KEYS.wait.label}) or Undo (${KEYS.undo.label}).`
    : 'No way to move: tap Wait or Undo.';
}
