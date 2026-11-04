// The Daedalus Gate's bars, the sinking doors and the Minotaur at the gate (src/openings.ts), and how Classic draws
// them (src/board-plan.ts drawList).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  DOOR_SINK_MS, GATE_SLIDE_MS, HOOF_MS, PORTAL_WAKE_MS, REST, STEP_BACK, axisAt, beastDrawnAt, createOpenings, hoofAt,
  openedDoor, portalAt, portalLit,
} from '../src/openings.ts';
import { WAKE_MS } from '../src/modern/portal-wake.ts';
import { drawList, exitSprite, slideFrame } from '../src/board-plan.ts';
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
  assert.equal(o.at(t, fig(t), 1000 + GATE_SLIDE_MS + 1, false, true).bars.size, 0, 'then the grid rests');
  assert.equal(o.at(t, fig(t), 1000 + Math.max(GATE_SLIDE_MS, WAKE_MS), false, true), REST, 'and, the portal awake, all is still');
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

test('the exit\'s portal is dormant until the last relic is taken, lights up with the bars, and goes dark on undo', () => {
  const o = createOpenings();
  const s = grid(['#####', 'P*|.E', '#####']);
  assert.equal(portalLit(s), 0, 'dormant while a relic is left');
  assert.equal(portalAt(s, o.at(s, rest(s), 0, false, true)), 0);
  const t = play(s, mv('right')).state;
  assert.equal(portalLit(t), 1, 'lit once every relic is taken');
  assert.equal(o.at(t, rest(t), 1000, false, true).portal, 0, 'it starts dark');
  const mid = o.at(t, rest(t), 1000 + PORTAL_WAKE_MS / 2, false, true).portal!;
  assert.ok(mid > 0.3 && mid < 0.7, `half lit ${mid}`);
  assert.equal(portalAt(t, o.at(t, rest(t), 1000 + Math.max(PORTAL_WAKE_MS, GATE_SLIDE_MS) + 1, false, true)), 1, 'then lit');
  // Undo puts the relic back: the light fades out again.
  assert.equal(o.at(s, rest(s), 5000, false, true).portal, 1, 'it starts lit');
  const fading = o.at(s, rest(s), 5000 + PORTAL_WAKE_MS / 2, false, true).portal!;
  assert.ok(fading > 0 && fading < 1, `fading ${fading}`);
  assert.equal(portalAt(s, o.at(s, rest(s), 5000 + GATE_SLIDE_MS + 1, false, true)), 0, 'dormant again');
});

test('Modern\'s waking runs its own clock from the last relic, keeps the board moving, and never plays going dark', () => {
  const o = createOpenings();
  const s = grid(['#####', 'P*|.E', '#####']);
  assert.equal(o.at(s, rest(s), 0, false, true).wake, null);
  const t = play(s, mv('right')).state;
  assert.equal(o.at(t, rest(t), 1000, false, true).wake, 0, 'it starts with the last relic');
  assert.equal(o.at(t, rest(t), 1000 + WAKE_MS / 2, false, true).wake, WAKE_MS / 2);
  const late = o.at(t, rest(t), 1000 + WAKE_MS - 1, false, true);
  assert.equal(late.wake, WAKE_MS - 1, 'it outlasts the plain fade');
  assert.equal(late.portal, null, 'which Classic has finished');
  assert.ok(late.busy, 'the board keeps drawing');
  assert.equal(o.at(t, rest(t), 1000 + WAKE_MS, false, true), REST, 'then all is still');
  // Undo during the waking: it stops, and the light only fades.
  const p = createOpenings();
  p.at(s, rest(s), 0, false, true);
  p.at(t, rest(t), 1000, false, true);
  p.at(t, rest(t), 1000 + PORTAL_WAKE_MS / 2, false, true);
  const u = p.at(s, rest(s), 1000 + PORTAL_WAKE_MS / 2 + 100, false, true);
  assert.equal(u.wake, null, 'no waking on the way out');
  assert.ok(u.portal! > 0 && u.portal! < 1, 'a fade');
  const r = createOpenings();
  r.at(s, rest(s), 0, true, true);
  assert.equal(r.at(t, rest(t), 10, true, true).wake, null, 'reduced motion: no waking');
});

test('the portal is lit from the start on a level with no relics, and a restart or reduced motion sets it at once', () => {
  const o = createOpenings();
  const bare = grid(['#####', 'P...E', '#####']);
  assert.equal(portalAt(bare, o.at(bare, rest(bare), 0, false, true)), 1, 'no relics: lit at once');
  const p = createOpenings();
  const s = grid(['#######', 'P*...E#', '#######']);
  p.at(s, rest(s), 0, false, true);
  const t = play(s, mv('right'), mv('right'), mv('right')).state;
  p.at(t, rest(t), 100, false, true);
  assert.equal(portalAt(t, p.at(t, rest(t), 100 + PORTAL_WAKE_MS + GATE_SLIDE_MS, false, true)), 1);
  // A restart: back to no moves from three away. Dormant at once, nothing fading.
  assert.equal(p.at(s, rest(s), 5000, false, true), REST);
  assert.equal(portalAt(s, REST), 0);
  const r = createOpenings();
  r.at(s, rest(s), 0, true, true);
  const u = play(s, mv('right')).state;
  assert.equal(r.at(u, rest(u), 10, true, true), REST, 'reduced motion: no fade');
  assert.equal(portalAt(u, REST), 1);
});

test('Classic draws the exit dormant, waking frame by frame, and lit', () => {
  const n = atlas.sprites['exit-wake']!.frames;
  assert.ok(n > 1, 'the waking has frames');
  assert.deepEqual(exitSprite(atlas, 0), { sprite: 'exit-off', frame: 0 });
  assert.deepEqual(exitSprite(atlas, 1), { sprite: 'exit', frame: 0 });
  const mid = exitSprite(atlas, 0.5);
  assert.equal(mid.sprite, 'exit-wake');
  assert.ok(mid.frame > 0 && mid.frame < n - 1);
  const s = grid(['#####', 'P*|.E', '#####']);
  const at = (x: State, m = REST) => drawList(x, rest(x), atlas, 0, m).find(d => d.x === 4 && d.y === 1)!;
  assert.equal(at(s).sprite, 'exit-off', 'a relic left: dormant');
  const t = play(s, mv('right')).state;
  assert.equal(at(t).sprite, 'exit', 'every relic taken: lit');
  assert.equal(at(t, { ...REST, portal: 0.5, busy: true }).sprite, 'exit-wake');
});
