// websites/www.cs/games/crete/test/board-plan.test.ts
// The board's plan: rows back to front so a wall's top overlaps the row above, figures over their row,
// a turn's slides one after the other at 120 ms a cell, and reduced motion snaps.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { drawList, timeline, SLIDE_MS, boardRows } from '../src/board-plan.ts';
import type { Atlas, Figures } from '../src/board-plan.ts';
import type { State } from '../src/puzzle/state.ts';
import { parse } from '../src/puzzle/level.ts';
import { DIRS, TERRAIN, OBJECTS, HAZARDS } from '../src/puzzle/tiles.ts';
import { TILES_LEVEL } from '../src/tiles-level.ts';
import { step } from '../src/puzzle/step.ts';
import { grid, icedPages, mv, WAIT } from './puzzle-grid.ts';
import { initial } from '../src/puzzle/state.ts';

const atlas = JSON.parse(readFileSync(new URL('../fx/sprites/tiles.json', import.meta.url), 'utf8')) as Atlas;

test('terrain is drawn row by row from the top, objects and figures after their row', () => {
  const s = grid(['P#', '*M']);
  const list = drawList(s, { player: s.player, minotaur: s.minotaur, hazards: [] }, atlas, 0);
  const names = list.map(d => d.sprite);
  assert.deepEqual(names, ['floor', 'wall', 'theseus', 'floor', 'floor', 'relic', 'minotaur']);
  assert.deepEqual(list.find(d => d.sprite === 'wall'), { sprite: 'wall', frame: 0, x: 1, y: 0 });
});

test('a figure between two rows is drawn after the lower row, so no floor paints over it', () => {
  const s = grid(['P#', '*M']);
  const order = (r: number) => {
    const list = drawList(s, { player: { r, c: 0 }, minotaur: null, hazards: [] }, atlas, 0);
    const me = list.findIndex(d => d.sprite === 'theseus');
    const lastTerrainOfRow = (row: number) => list.reduce((n, d, i) => (d.y === row && (d.sprite === 'floor' || d.sprite === 'wall') ? i : n), -1);
    return { me, row0: lastTerrainOfRow(0), row1: lastTerrainOfRow(1) };
  };
  const down = order(0.5);
  assert.ok(down.me > down.row1, 'a move down, midway');
  const up = order(0.4);
  assert.ok(up.me > up.row1, 'a move up, midway');
  const onRow = order(1);
  assert.ok(onRow.me > onRow.row1, 'exactly on row 1');
  const onZero = order(0);
  assert.ok(onZero.row0 < onZero.me && onZero.me < onZero.row1, 'exactly on row 0 it stays before row 1');
});

test('the gate shows open once the relics are taken; a stone Minotaur and a standing cow have their own sprites', () => {
  const s = { ...grid(['P|M']), relicsLeft: 0, stone: 2, cow: { r: 0, c: 0 } };
  const names = drawList(s, { player: s.player, minotaur: s.minotaur, hazards: [] }, atlas, 0).map(d => d.sprite);
  assert.ok(names.includes('gate-open'));
  assert.ok(names.includes('minotaur-stone'));
  assert.ok(names.includes('cow-standing'));
});

test('a loop picks its frame from the time', () => {
  const s = grid(['P~']);
  const water = (ms: number) => drawList(s, { player: s.player, minotaur: null, hazards: [] }, atlas, ms).find(d => d.sprite === 'water')!.frame;
  const fps = atlas.sprites.water!.fps;
  assert.equal(water(0), 0);
  assert.equal(water(1000 / fps), 1);
  assert.equal(water((1000 / fps) * atlas.sprites.water!.frames), 0);
});

test("a turn plays the player's slide, then each Minotaur step, 120 ms a cell", () => {
  const s = grid(['P....', '.....', '....M']);
  const r = step(s, mv('right'));
  const tl = timeline(s, r.events, false, r.state);
  assert.equal(tl.duration, 3 * SLIDE_MS);
  assert.deepEqual(tl.at(SLIDE_MS / 2).player, { r: 0, c: 0.5 });
  assert.deepEqual(tl.at(SLIDE_MS / 2).minotaur, { r: 2, c: 4 });
  assert.deepEqual(tl.at(SLIDE_MS * 1.5).minotaur, { r: 2, c: 3.5 });
  assert.deepEqual(tl.at(tl.duration), { player: { r: 0, c: 1 }, minotaur: { r: 2, c: 2 }, hazards: [] });
  assert.deepEqual(tl.at(tl.duration + 999), tl.at(tl.duration));
});

test('reduced motion snaps; a catch plays the Minotaur in, then throws the player back', () => {
  const s = grid(['P....', '.....', '....M']);
  const moved = step(s, mv('right'));
  assert.equal(timeline(s, moved.events, true, moved.state).duration, 0);
  const c = grid(['M.P']);
  const r = step(c, WAIT);
  const tl = timeline(c, r.events, false, r.state);
  assert.deepEqual(tl.at(SLIDE_MS * 0.5), { player: { r: 0, c: 2 }, minotaur: { r: 0, c: 0.5 }, hazards: [] });
  assert.deepEqual(tl.at(SLIDE_MS * 1.5), { player: { r: 0, c: 2 }, minotaur: { r: 0, c: 1.5 }, hazards: [] });
  assert.deepEqual(tl.at(tl.duration), { player: { r: 0, c: 2 }, minotaur: { r: 0, c: 0 }, hazards: [] });
});

test('the board is the rows plus the rise of the top row', () => {
  assert.equal(boardRows({ rows: 10 }, atlas), 10 + atlas.rise / atlas.cell);
});

test('a pushed block is drawn between its cells during the player\'s segment, and not at its old cell', () => {
  const s = grid(['PO...', '.....', '....M']);
  const r = step(s, mv('right'));
  const tl = timeline(s, r.events, false, r.state);
  assert.equal(tl.playerEnd, SLIDE_MS);
  assert.equal(tl.duration, 3 * SLIDE_MS);
  const f = tl.at(SLIDE_MS / 2);
  assert.deepEqual(f.blocks, [{ origin: { r: 0, c: 1 }, at: { r: 0, c: 1.5 } }]);
  const blocks = drawList(s, f, atlas, 0).filter(d => d.sprite === 'block');
  assert.deepEqual(blocks.map(d => [d.x, d.y]), [[1.5, 0]]);
  assert.equal(tl.at(SLIDE_MS * 1.5).blocks, undefined);
});

test('a block that slides on after the push moves cell by cell and the Minotaur waits for it', () => {
  const s = grid(['PO==.', '.....', '....M']);
  const r = step(s, mv('right'));
  const tl = timeline(s, r.events, false, r.state);
  assert.ok(tl.playerEnd >= 2 * SLIDE_MS);
  const late = tl.at(tl.playerEnd - 1);
  assert.equal(late.blocks?.length, 1);
  assert.deepEqual(tl.at(tl.playerEnd).minotaur, s.minotaur);
});

test('the timeline says when the figure reaches each thing it takes: a slide over two pages, each in its turn', () => {
  const s = initial(icedPages(['P=p=p.'], 'a b'));
  const r = step(s, mv('right'));
  const tl = timeline(s, r.events, false, r.state);
  assert.deepEqual(tl.taken.map(t => [t.what, t.at, t.ms]), [['page', { r: 0, c: 2 }, 2 * SLIDE_MS], ['page', { r: 0, c: 4 }, 4 * SLIDE_MS]]);
  assert.deepEqual(tl.at(2 * SLIDE_MS).player, { r: 0, c: 2 });
  assert.deepEqual(tl.at(4 * SLIDE_MS).player, { r: 0, c: 4 });
  assert.deepEqual(timeline(s, r.events, true, r.state).taken.map(t => t.ms), [0, 0]);
});

const at = (r: number, c: number) => ({ r, c });
const rest = (s: State): Figures => ({ player: s.player, minotaur: s.minotaur, hazards: s.hazards.map(h => ({ kind: h.kind, at: h.at })) });

test('hazards are drawn in their row, after its objects and before the Minotaur and Theseus', () => {
  const s = grid(['Pe*', '.oM'], 'facing: up left');
  const names = drawList(s, rest(s), atlas, 0).map(d => d.sprite);
  assert.deepEqual(names, ['floor', 'floor', 'floor', 'relic', 'fireball', 'theseus', 'floor', 'floor', 'floor', 'ball', 'minotaur']);
  const between = drawList(s, { ...rest(s), hazards: [{ kind: 'glider', at: { r: 0.5, c: 1 } }] }, atlas, 0);
  const harpy = between.findIndex(d => d.sprite === 'glider');
  assert.ok(harpy > between.reduce((n, d, i) => (d.y === 1 && d.sprite === 'floor' ? i : n), -1), 'a hazard between rows draws after the lower one');
  assert.deepEqual(between[harpy], { sprite: 'glider', frame: 0, x: 1, y: 0.5 });
});

test('a clone machine draws its own facing with its template over it', () => {
  const s = grid(['P.C', 'C..'], 'machines: glider-down block-up');
  const list = drawList(s, rest(s), atlas, 0);
  const names = list.map(d => d.sprite);
  assert.deepEqual(names, ['floor', 'floor', 'clone-down', 'glider', 'theseus', 'clone-up', 'floor', 'floor', 'block']);
  assert.deepEqual(list[3], { sprite: 'glider', frame: 0, x: 2, y: 0 });
  assert.deepEqual(list[8], { sprite: 'block', frame: 0, x: 0, y: 1 });
});

test('the timeline moves hazards after the player and before the Minotaur, one phase in one slot', () => {
  const s = grid(['P......', '.o==...', '.......', 'w......', '......M'], 'facing: right right');
  const r = step(s, mv('right'));
  const tl = timeline(s, r.events, false, r.state);
  assert.equal(tl.playerEnd, SLIDE_MS);
  const minotaurSteps = r.events.filter(e => e.kind === 'moved' && e.who === 'minotaur').length;
  assert.equal(minotaurSteps, 2);
  assert.equal(tl.duration, SLIDE_MS + 3 * SLIDE_MS + 2 * SLIDE_MS, 'the ball slides three cells: the phase takes three slots');
  const ball = (ms: number) => tl.at(ms).hazards.find(h => h.kind === 'ball')!.at;
  const harpy = (ms: number) => tl.at(ms).hazards.find(h => h.kind === 'glider')!.at;
  assert.deepEqual(ball(SLIDE_MS / 2), at(1, 1), 'hazards wait for the player');
  assert.deepEqual(tl.at(SLIDE_MS / 2).player, at(0, 0.5));
  assert.deepEqual(ball(SLIDE_MS * 1.5), at(1, 1.5));
  assert.deepEqual(harpy(SLIDE_MS * 1.5), at(3, 0.5), 'hazards of one phase move together');
  assert.deepEqual(ball(SLIDE_MS * 2.5), at(1, 2.5));
  assert.deepEqual(harpy(SLIDE_MS * 2.5), at(3, 1));
  assert.deepEqual(ball(SLIDE_MS * 3.5), at(1, 3.5));
  assert.deepEqual(tl.at(SLIDE_MS * 3.5).minotaur, s.minotaur, 'the Minotaur waits for the longest slide');
  assert.notDeepEqual(tl.at(SLIDE_MS * 4.5).minotaur, s.minotaur);
  assert.deepEqual(tl.at(tl.duration), rest(r.state));
});

test('a hazard destroyed plays its move and is gone when the turn lands; a clone appears only then', () => {
  const s = grid(['P.o!..', '......', '.....M'], 'facing: right');
  const r = step(s, mv('down'));
  assert.ok(r.events.some(e => e.kind === 'exploded' && e.who === 'hazard'));
  const tl = timeline(s, r.events, false, r.state);
  assert.equal(tl.hazardEnd, tl.playerEnd + SLIDE_MS);
  assert.deepEqual(tl.at(SLIDE_MS / 2).hazards, [{ kind: 'ball', at: at(0, 2) }]);
  assert.deepEqual(tl.at(SLIDE_MS * 1.5).hazards, [{ kind: 'ball', at: at(0, 2.5) }]);
  assert.deepEqual(tl.at(tl.duration - 1).hazards, [{ kind: 'ball', at: at(0, 3) }]);
  assert.deepEqual(tl.at(tl.duration).hazards, []);
  const c = grid(['P+C.', '....', '...M'], 'machines: ball-right');
  const made = step(c, mv('right'));
  assert.ok(made.events.some(e => e.kind === 'cloned'));
  const ctl = timeline(c, made.events, false, made.state);
  assert.deepEqual(ctl.at(ctl.duration - 1).hazards, [], 'a clone appears only at the end');
  assert.deepEqual(ctl.at(ctl.duration).hazards, rest(made.state).hazards);
  assert.equal(ctl.at(ctl.duration).hazards.length, 1);
});

test('a Minotaur catch throws Theseus onto a hazard: the hazard plays its move, then is home when the turn lands', () => {
  const s = grid(['P.M', 'o..'], 'facing: up');
  const r = step(s, mv('right'));
  assert.ok(r.events.some(e => e.kind === 'caught' && e.by === 'minotaur'));
  assert.ok(r.events.some(e => e.kind === 'sent-home'));
  const tl = timeline(s, r.events, false, r.state);
  assert.deepEqual(tl.at(tl.playerEnd + SLIDE_MS / 2).hazards, [{ kind: 'ball', at: at(0.5, 0) }]);
  assert.deepEqual(tl.at(tl.hazardEnd).hazards, [{ kind: 'ball', at: at(0, 0) }]);
  assert.deepEqual(tl.at(tl.duration - 1).hazards, [{ kind: 'ball', at: at(0, 0) }]);
  assert.deepEqual(tl.at(tl.duration).hazards, [{ kind: 'ball', at: at(1, 0) }]);
  assert.deepEqual(tl.at(tl.duration).player, at(0, 0));
});

test('a hazard catch: the hazard slides onto Theseus in its slot, the Minotaur never moves, Theseus lands thrown back', () => {
  const s = grid(['.==o', 'P..M'], 'facing: left');
  const r = step(s, mv('up'));
  assert.ok(r.events.some(e => e.kind === 'caught' && e.by === 'hazard'));
  const tl = timeline(s, r.events, false, r.state);
  assert.equal(tl.playerEnd, SLIDE_MS);
  assert.equal(tl.hazardEnd, 4 * SLIDE_MS);
  assert.equal(tl.duration, tl.hazardEnd);
  assert.deepEqual(tl.at(SLIDE_MS * 3.5).hazards, [{ kind: 'ball', at: at(0, 0.5) }]);
  assert.deepEqual(tl.at(SLIDE_MS * 3.5).player, at(0, 0));
  for (let ms = 0; ms <= tl.duration; ms += 30) assert.deepEqual(tl.at(ms).minotaur, s.minotaur);
  assert.deepEqual(r.state.throwBack, at(1, 0));
  assert.deepEqual(tl.at(tl.duration).player, at(1, 0));
});

test('clone machine sprites follow DIRS for all four facings', () => {
  const s = grid(['P....', '.C.C.', '.....', '.C.C.', '.....'], 'machines: block-up block-down block-left block-right');
  const list = drawList(s, rest(s), atlas, 0);
  const machine = (r: number, c: number) => list.find(d => d.x === c && d.y === r && d.sprite.startsWith('clone-'))!.sprite;
  assert.deepEqual([machine(1, 1), machine(1, 3), machine(3, 1), machine(3, 3)], DIRS.map(d => `clone-${d}`));
  assert.deepEqual(TERRAIN.clone.sprites, DIRS.map(d => `clone-${d}`));
});

test('a teleport jumps without passing the cells between, then steps on; a block teleports the same way', () => {
  const s = grid(['P@..', '..@*']);
  const r = step(s, mv('right'));
  const tl = timeline(s, r.events, false, r.state);
  assert.equal(tl.playerEnd, 2 * SLIDE_MS);
  assert.deepEqual(tl.taken.map(t => t.ms), [2 * SLIDE_MS]);
  for (let ms = 0; ms <= tl.playerEnd; ms += 5) {
    const p = tl.at(ms).player;
    const onEntry = p.r === 0 && p.c >= 0 && p.c <= 1;
    const onExit = p.r === 1 && p.c >= 2 && p.c <= 3;
    assert.ok(onEntry || onExit, `at ${ms} ms Theseus is at ${JSON.stringify(p)}`);
  }
  assert.deepEqual(tl.at(SLIDE_MS / 2).player, at(0, 0.5));
  assert.deepEqual(tl.at(SLIDE_MS).player, at(1, 2));
  assert.deepEqual(tl.at(SLIDE_MS * 1.5).player, at(1, 2.5));

  const b = grid(['PO@..', '...@.']);
  const pushed = step(b, mv('right'));
  assert.ok(pushed.events.some(e => e.kind === 'teleported' && e.who === 'block'));
  const btl = timeline(b, pushed.events, false, pushed.state);
  assert.equal(btl.playerEnd, 2 * SLIDE_MS);
  assert.deepEqual(btl.at(SLIDE_MS / 2).blocks, [{ origin: at(0, 1), at: at(0, 1.5) }]);
  assert.deepEqual(btl.at(SLIDE_MS).blocks, [{ origin: at(0, 1), at: at(1, 3) }]);
  assert.deepEqual(btl.at(SLIDE_MS * 1.5).blocks, [{ origin: at(0, 1), at: at(1, 3.5) }]);
});

test('the tiles page level holds every piece and parses', () => {
  const lv = parse(TILES_LEVEL);
  const terrain = new Set(lv.terrain);
  for (const t of Object.keys(TERRAIN)) assert.ok(terrain.has(t as never), `terrain ${t}`);
  const objects = new Set(lv.objects.filter(Boolean));
  for (const o of Object.keys(OBJECTS)) assert.ok(objects.has(o as never), `object ${o}`);
  const hazards = new Set(lv.hazards.map(h => h.kind));
  for (const k of Object.keys(HAZARDS)) assert.ok(hazards.has(k as never), `hazard ${k}`);
});
