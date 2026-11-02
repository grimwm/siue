// The Daedalus Gate's bars, the sinking doors and the Minotaur at the gate (src/openings.ts), and how Classic draws
// them (src/board-plan.ts drawList).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  DOOR_SINK_MS, GATE_SLIDE_MS, HOOF_MS, REST, STEP_BACK, axisAt, beastDrawnAt, createOpenings, hoofAt, openedDoor,
} from '../src/openings.ts';
import { drawList, slideFrame } from '../src/board-plan.ts';
import type { Atlas, Figures } from '../src/board-plan.ts';
import { terrainModel } from '../src/modern/model-names.ts';
import type { State } from '../src/puzzle/state.ts';
import { grid, mv, play } from './puzzle-grid.ts';

const atlas = JSON.parse(readFileSync(new URL('../fx/sprites/tiles.json', import.meta.url), 'utf8')) as Atlas;
const rest = (s: State): Figures => ({ player: s.player, minotaur: s.minotaur, hazards: [] });

test('the way through a gate or door runs between its walls', () => {
  const s = grid(['#####', 'P*|.E', '#####']);
  assert.equal(axisAt(s, 1, 2), 'h');
  const t = grid(['#P#', '#*#', '#|#', '#E#']);
  assert.equal(axisAt(t, 2, 1), 'v');
});

test('an opened door is its colour; a shut one or plain floor is none', () => {
  const st = grid(['PrR.']);
  assert.equal(openedDoor(st, 2), null, 'shut');
  const opened = play(st, mv('right'), mv('right')).state;
  assert.equal(openedDoor(opened, 2), 'red');
  assert.equal(openedDoor(opened, 3), null, 'floor that was never a door');
  assert.equal(terrainModel(opened, 2), 'door-red-sill', 'Modern shows its sill');
});

test('the Minotaur stands back from a gate beside him, and leans into it with the hoof', () => {
  const s = grid(['#####', 'P*|M.', '#####']);
  assert.deepEqual(beastDrawnAt(s, { r: 1, c: 3 }), { r: 1, c: 3 + STEP_BACK });
  const leaning = beastDrawnAt(s, { r: 1, c: 3 }, 0.3);
  assert.ok(Math.abs(leaning.c - (3 + STEP_BACK - 0.3)) < 1e-9 && leaning.r === 1);
  assert.deepEqual(beastDrawnAt(s, { r: 1, c: 4 }), { r: 1, c: 4 }, 'no gate beside him');
  // Halfway between cells he is not stood back at all, so he never jumps as he arrives.
  assert.deepEqual(beastDrawnAt(s, { r: 1, c: 3.5 }), { r: 1, c: 3.5 });
});

test('the bars slide across once the last relic is taken, and back on undo', () => {
  const o = createOpenings();
  const s = grid(['#####', 'P*|.E', '#####']);
  const fig = (x: State) => rest(x);
  assert.equal(o.at(s, fig(s), 0, false, true), REST, 'a new level is at rest');
  const t = play(s, mv('right')).state;
  assert.equal(t.relicsLeft, 0);
  const start = o.at(t, fig(t), 1000, false, true);
  assert.equal(start.bars.get(1 * 5 + 2), 0, 'the bars start in the walls');
  const mid = o.at(t, fig(t), 1000 + GATE_SLIDE_MS / 2, false, true).bars.get(7)!;
  assert.ok(mid > 0.3 && mid < 0.7, `halfway ${mid}`);
  assert.equal(o.at(t, fig(t), 1000 + GATE_SLIDE_MS + 1, false, true), REST, 'then the grid rests');
  // Undo shuts it again: the bars slide back.
  assert.equal(o.at(s, fig(s), 5000, false, true).bars.get(7), 1, 'the bars start across');
  const back2 = o.at(s, fig(s), 5000 + GATE_SLIDE_MS / 2, false, true).bars.get(7)!;
  assert.ok(back2 < 1 && back2 > 0, `sliding back ${back2}`);
});

test('with reduced motion the gate opens and the door goes at once', () => {
  const o = createOpenings();
  const s = grid(['#####', 'P*|.E', '#####']);
  o.at(s, rest(s), 0, true, true);
  const t = play(s, mv('right')).state;
  assert.equal(o.at(t, rest(t), 10, true, true), REST);
});

test('a door sinks as Theseus walks into it, and rises again on undo', () => {
  const o = createOpenings();
  const s = grid(['#####', 'PrR.E', '#####']);
  const t = play(s, mv('right')).state;
  o.at(t, rest(t), 0, false, true);
  // His figure halfway into the door: the state still holds it shut, but it has begun to sink.
  o.at(t, { player: { r: 1, c: 1.5 }, minotaur: null }, 100, false, false);
  const half = o.at(t, { player: { r: 1, c: 1.9 }, minotaur: null }, 100 + DOOR_SINK_MS / 2, false, false);
  const sink = half.doors.get(7)!;
  assert.ok(sink > 0.3 && sink < 0.7, `sinking ${sink}`);
  const u = play(t, mv('right')).state;
  assert.equal(u.terrain[7], 'floor');
  assert.equal(o.at(u, rest(u), 100 + DOOR_SINK_MS + 1, false, true), REST, 'sunk');
  // Undo: the door stands again, rising out of its slot.
  o.at(t, rest(t), 2000, false, true);
  const rising = o.at(t, rest(t), 2000 + DOOR_SINK_MS / 2, false, true).doors.get(7)!;
  assert.ok(rising > 0 && rising < 1, `rising ${rising}`);
});

test('the hoof test plays once a try, when he rests beside the open gate, and stops at the next turn', () => {
  const o = createOpenings();
  const s = grid(['######', 'P*.|M.', '######']);
  o.at(s, rest(s), 0, false, true);
  const t = play(s, mv('right')).state;
  assert.equal(t.relicsLeft, 0);
  assert.ok(t.minotaur && Math.abs(t.minotaur.c - 3) === 1, 'he waits beside the gate');
  const fig = rest(t);
  o.at(t, fig, 100, false, false);
  assert.equal(o.at(t, fig, 110, false, false).hoof, 0, 'not while the turn plays');
  o.at(t, fig, 1000 + GATE_SLIDE_MS, false, true);
  const lean = o.at(t, fig, 1000 + GATE_SLIDE_MS + 500, false, true).hoof;
  assert.ok(lean > 0.2, `he leans in ${lean}`);
  const u = play(t, { kind: 'wait' }).state;
  assert.equal(o.at(u, rest(u), 1000 + GATE_SLIDE_MS + 600, false, true).hoof, 0, 'a turn stops it');
  assert.equal(o.at(u, rest(u), 1000 + GATE_SLIDE_MS + 700, false, true).hoof, 0, 'and it does not play again this try');
});

test('the hoof keys end where he started', () => {
  assert.equal(hoofAt(0), 0);
  assert.equal(hoofAt(HOOF_MS), 0);
  assert.ok(hoofAt(500) > 0.25);
});

test('Classic draws the pit, the bars part way across, the grid, and each the other way round across a v way', () => {
  const n = atlas.sprites['gate-slide']!.frames;
  assert.equal(slideFrame(atlas, 0), -1);
  assert.equal(slideFrame(atlas, 1), n);
  const s = grid(['#####', 'P*|.E', '#####']);
  const at = (x: State, p?: number) => drawList(x, rest(x), atlas, 0, p === undefined ? REST : { ...REST, bars: new Map([[7, p]]), busy: true })
    .find(d => d.x === 2 && d.y === 1)!;
  assert.equal(at(s).sprite, 'gate-closed');
  const t = play(s, mv('right')).state;
  assert.equal(at(t).sprite, 'gate-open');
  const mid = at(t, 0.5);
  assert.equal(mid.sprite, 'gate-slide');
  assert.ok(mid.frame > 0 && mid.frame < n - 1);
  const v = grid(['#P#', '#*#', '#|#', '#E#']);
  assert.ok(drawList(v, rest(v), atlas, 0).some(d => d.sprite === 'gate-closed-v'));
});

test('Classic draws an opened door as its sill, with the door over it while it sinks', () => {
  const s = grid(['#####', 'PrR.E', '#####']);
  const u = play(s, mv('right'), mv('right'), mv('right')).state;
  const at = (m = REST) => drawList(u, rest(u), atlas, 0, m).filter(d => d.x === 2 && d.y === 1);
  assert.deepEqual(at().map(d => d.sprite), ['door-red-sill']);
  const moving = at({ ...REST, doors: new Map([[7, 0.4]]), busy: true });
  assert.deepEqual(moving.map(d => [d.sprite, d.sink ?? 0]), [['door-red-sill', 0], ['door-red', 0.4]]);
});

test('Classic draws the Minotaur stood back from the gate', () => {
  const s = grid(['#####', 'P*|M.', '#####']);
  const m = drawList(s, rest(s), atlas, 0).find(d => d.sprite === 'minotaur')!;
  assert.equal(m.x, 3 + STEP_BACK);
});
