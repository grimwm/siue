// What the page says when Theseus picks up or uses a tool (Daedalus's cow, Medusa's mirror, a honey cake), and the
// effect chips the status bar shows while one is at work, all read from the engine's own state.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { step } from '../src/puzzle/step.ts';
import type { Action } from '../src/puzzle/step.ts';
import type { State } from '../src/puzzle/state.ts';
import { activeEffects, toolLines } from '../src/tool-effects.ts';
import type { Input } from '../src/tool-effects.ts';
import { grid, mv, WAIT } from './puzzle-grid.ts';

const tool = (t: 'mirror' | 'cake' | 'cow'): Action => ({ kind: 'tool', tool: t });

/** Plays `a` and returns what the page says for it. */
function said(s: State, a: Action, input: Input = 'keys'): { lines: string[]; after: State } {
  const r = step(s, a);
  return { lines: toolLines(a, r.events, s, r.state, input), after: r.state };
}

test('picking up the cow says what it does and how to use it, by key or by button', () => {
  const s = grid(['Pc.....M']);
  assert.deepEqual(said(s, mv('right')).lines,
    ["Daedalus's cow: press C to set it down where you stand. The Minotaur goes for the cow, not you, until he reaches it."]);
  assert.deepEqual(said(s, mv('right'), 'touch').lines,
    ["Daedalus's cow: tap 🐄 to set it down where you stand. The Minotaur goes for the cow, not you, until he reaches it."]);
});

test('picking up the mirror and a cake says what each does', () => {
  assert.deepEqual(said(grid(['Pz.....M']), mv('right')).lines,
    ["Medusa's mirror: press Z to raise it. The Minotaur turns to stone for that turn and the 3 after; stone blocks everyone like a wall."]);
  assert.deepEqual(said(grid(['Px.....M']), mv('right'), 'touch').lines,
    ['Honey cake: tap 🍯 to eat it for one more heart.']);
});

test('setting the cow down: the Minotaur chases it, and the chip says so until he reaches it', () => {
  const held = step(grid(['Pc.......M', '#.........']), mv('right')).state;
  const down = said(held, tool('cow'));
  assert.deepEqual(down.lines, ['The cow stands here. The Minotaur is chasing the cow, not you.']);
  assert.deepEqual(activeEffects(down.after).map(e => e.label), ['Chasing the Cow']);
  // Theseus steps off it; the Minotaur walks to it, two steps a turn, and takes it: the chip goes and the page says
  // he hunts Theseus again.
  let { lines, after: s } = said(down.after, mv('down'));
  for (let i = 0; i < 6 && s.cow; i++) ({ lines, after: s } = said(s, WAIT));
  assert.equal(s.cow, null);
  assert.equal(s.hearts, 3, 'no catch');
  assert.deepEqual(lines, ['The Minotaur reached the cow. He comes for you again.']);
  assert.deepEqual(activeEffects(s), []);
});

test('a cow the Minotaur takes in a catch says nothing of its own: the catch is said', () => {
  const held = step(grid(['.Pc', 'M..']), mv('right')).state;
  const r = said(held, tool('cow'));
  assert.equal(r.after.cow, null);
  assert.equal(r.after.hearts, 2);
  assert.deepEqual(r.lines, []);
});

test('raising the mirror: stone for 3 more turns, counted down on the chip, then he moves again', () => {
  const held = step(grid(['Pz.......M']), mv('right')).state;
  const up = said(held, tool('mirror'));
  assert.deepEqual(up.lines, ['The Minotaur is stone for 3 more turns. Stone blocks everyone like a wall.']);
  assert.deepEqual(activeEffects(up.after).map(e => e.label), ['Stone: 3 Turns']);
  const two = said(up.after, WAIT);
  assert.deepEqual(two.lines, []);
  assert.deepEqual(activeEffects(two.after).map(e => e.label), ['Stone: 2 Turns']);
  const one = said(two.after, WAIT).after;
  assert.deepEqual(activeEffects(one).map(e => e.label), ['Stone: 1 Turn']);
  const done = said(one, WAIT);
  assert.equal(done.after.stone, 0);
  assert.deepEqual(done.lines, ['The stone wears off: the Minotaur moves again next turn.']);
  assert.deepEqual(activeEffects(done.after), []);
  assert.deepEqual(done.after.minotaur, up.after.minotaur, 'the last stone turn still holds him');
});

test('eating a cake: one more heart, said with the count', () => {
  const held = step(grid(['Px.......M']), mv('right')).state;
  const r = said(held, tool('cake'));
  assert.equal(r.after.hearts, 4);
  assert.deepEqual(r.lines, ['Honey cake: +1 heart (4 hearts).']);
});

test('both effects at once show both chips, stone first, each with a note', () => {
  let s = step(grid(['Pcz........M']), mv('right')).state;
  s = step(s, mv('right')).state;
  s = step(s, tool('cow')).state;
  s = step(s, tool('mirror')).state;
  const fx = activeEffects(s);
  assert.deepEqual(fx.map(e => e.id), ['stone', 'cow']);
  assert.match(fx[0]!.note, /stone for 3 more turns/);
  assert.match(fx[1]!.note, /goes for the cow, not you/);
});

test('a turn with no tool in it says nothing', () => {
  assert.deepEqual(said(grid(['P.......M']), mv('right')).lines, []);
});
