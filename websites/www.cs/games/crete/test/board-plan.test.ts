// websites/www.cs/games/crete/test/board-plan.test.ts
// The board's plan: rows back to front so a wall's top overlaps the row above, figures over their row,
// a turn's slides one after the other at 120 ms a cell, and reduced motion snaps.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { drawList, timeline, SLIDE_MS, boardRows } from '../src/board-plan.ts';
import type { Atlas } from '../src/board-plan.ts';
import { step } from '../src/puzzle/step.ts';
import { grid, mv, WAIT } from './puzzle-grid.ts';

const atlas = JSON.parse(readFileSync(new URL('../fx/sprites/tiles.json', import.meta.url), 'utf8')) as Atlas;

test('terrain is drawn row by row from the top, objects and figures after their row', () => {
  const s = grid(['P#', '*M']);
  const list = drawList(s, { player: s.player, minotaur: s.minotaur }, atlas, 0);
  const names = list.map(d => d.sprite);
  assert.deepEqual(names, ['floor', 'wall', 'theseus', 'floor', 'floor', 'relic', 'minotaur']);
  assert.deepEqual(list.find(d => d.sprite === 'wall'), { sprite: 'wall', frame: 0, x: 1, y: 0 });
});

test('a figure between two rows is drawn after the lower row, so no floor paints over it', () => {
  const s = grid(['P#', '*M']);
  const order = (r: number) => {
    const list = drawList(s, { player: { r, c: 0 }, minotaur: null }, atlas, 0);
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
  const names = drawList(s, { player: s.player, minotaur: s.minotaur }, atlas, 0).map(d => d.sprite);
  assert.ok(names.includes('gate-open'));
  assert.ok(names.includes('minotaur-stone'));
  assert.ok(names.includes('cow-standing'));
});

test('a loop picks its frame from the time', () => {
  const s = grid(['P~']);
  const water = (ms: number) => drawList(s, { player: s.player, minotaur: null }, atlas, ms).find(d => d.sprite === 'water')!.frame;
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
  assert.deepEqual(tl.at(tl.duration), { player: { r: 0, c: 1 }, minotaur: { r: 2, c: 2 } });
  assert.deepEqual(tl.at(tl.duration + 999), tl.at(tl.duration));
});

test('reduced motion snaps; a catch plays the Minotaur in, then throws the player back', () => {
  const s = grid(['P....', '.....', '....M']);
  const moved = step(s, mv('right'));
  assert.equal(timeline(s, moved.events, true, moved.state).duration, 0);
  const c = grid(['M.P']);
  const r = step(c, WAIT);
  const tl = timeline(c, r.events, false, r.state);
  assert.deepEqual(tl.at(SLIDE_MS * 0.5), { player: { r: 0, c: 2 }, minotaur: { r: 0, c: 0.5 } });
  assert.deepEqual(tl.at(SLIDE_MS * 1.5), { player: { r: 0, c: 2 }, minotaur: { r: 0, c: 1.5 } });
  assert.deepEqual(tl.at(tl.duration), { player: { r: 0, c: 2 }, minotaur: { r: 0, c: 0 } });
});

test('the board is the rows plus the rise of the top row', () => {
  assert.equal(boardRows({ rows: 10 }, atlas), 10 + atlas.rise / atlas.cell);
});
