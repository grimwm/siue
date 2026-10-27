// The editor's document and its undo: a draft always parses, painting keeps one player,
// sharing drops the owner-only text, and one stroke is one undo step.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newDraft, paint, resize, toText, fromLevel, toLevel, MIN_SIDE, MAX_SIDE } from '../src/editor/model.ts';
import type { Brush, Draft } from '../src/editor/model.ts';
import { startHistory, commit, undoH, redoH, UNDO_LIMIT } from '../src/editor/history.ts';
import { parse, serialize } from '../src/puzzle/level.ts';
import { TERRAIN, OBJECTS, HAZARDS, DIRS } from '../src/puzzle/tiles.ts';
import type { Terrain, ObjectKind, HazardKind, Template } from '../src/puzzle/tiles.ts';
import { TRIALS } from '../src/puzzle/trials.ts';

const BRUSHES: Brush[] = [
  ...(Object.keys(TERRAIN) as Terrain[]).map((t): Brush => ({ kind: 'terrain', t })),
  ...(Object.keys(OBJECTS) as ObjectKind[]).map((o): Brush => ({ kind: 'object', o })),
  { kind: 'player' }, { kind: 'minotaur' }, { kind: 'erase' },
  ...(Object.keys(HAZARDS) as HazardKind[]).flatMap(h => DIRS.map((dir): Brush => ({ kind: 'hazard', h, dir }))),
  ...(['block', 'ball', 'glider', 'fireball'] as Template[]).flatMap(template => DIRS.map((dir): Brush => ({ kind: 'machine', template, dir }))),
  { kind: 'page', id: 'a-page' }, { kind: 'page', id: 'Bad Id!' },
];
const at = (r: number, c: number) => ({ r, c });
const playerAt = (d: Draft) => d.cells.indexOf('P');

test('a draft always parses', () => {
  let d = newDraft(5, 5);
  for (const b of BRUSHES) {
    for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) {
      d = paint(d, at(r, c), b);
      assert.doesNotThrow(() => toLevel(d), `${JSON.stringify(b)} at ${r},${c}`);
      assert.equal(d.cells.filter(ch => ch === 'P').length, 1);
    }
  }
});

test('painting the player moves him', () => {
  const d = newDraft(5, 5);
  const e = paint(d, at(3, 3), { kind: 'player' });
  assert.equal(e.cells[3 * 5 + 3], 'P');
  assert.equal(e.cells[1 * 5 + 1], '.');
  assert.equal(toLevel(e).player.r, 3);
  assert.equal(paint(e, at(3, 3), { kind: 'player' }), e);
});

test('erase on the player does nothing', () => {
  const d = newDraft(5, 5);
  assert.equal(paint(d, at(1, 1), { kind: 'erase' }), d);
  assert.equal(paint(d, at(1, 1), { kind: 'terrain', t: 'wall' }), d);
  assert.equal(paint(d, at(1, 1), { kind: 'minotaur' }), d);
});

test('the Minotaur is replaced by terrain and by the player', () => {
  let d = paint(newDraft(5, 5), at(2, 2), { kind: 'minotaur' });
  assert.ok(toLevel(d).minotaur);
  assert.equal(toLevel(paint(d, at(2, 2), { kind: 'terrain', t: 'water' })).minotaur, null);
  d = paint(d, at(2, 2), { kind: 'player' });
  assert.equal(toLevel(d).minotaur, null);
  assert.equal(toLevel(d).player.r, 2);
  assert.equal(paint(d, at(2, 3), { kind: 'erase' }), d);
});

test('painting over a hazard or machine clears its extra', () => {
  let d = paint(newDraft(5, 5), at(2, 2), { kind: 'hazard', h: 'ball', dir: 'right' });
  assert.equal(d.extra[2 * 5 + 2], 'right');
  assert.match(toText(d, false), /facing: right/);
  d = paint(d, at(2, 2), { kind: 'erase' });
  assert.equal(d.extra[2 * 5 + 2], null);
  assert.doesNotMatch(toText(d, false), /facing/);
  d = paint(d, at(2, 3), { kind: 'machine', template: 'glider', dir: 'up' });
  assert.match(toText(d, false), /machines: glider-up/);
  d = paint(d, at(2, 3), { kind: 'terrain', t: 'wall' });
  assert.equal(d.extra[2 * 5 + 3], null);
  assert.doesNotMatch(toText(d, false), /machines/);
});

test('facing and machines are written in reading order', () => {
  let d = newDraft(6, 6);
  d = paint(d, at(3, 1), { kind: 'hazard', h: 'glider', dir: 'down' });
  d = paint(d, at(1, 3), { kind: 'hazard', h: 'ball', dir: 'left' });
  d = paint(d, at(4, 4), { kind: 'machine', template: 'ball', dir: 'up' });
  d = paint(d, at(2, 2), { kind: 'machine', template: 'block', dir: 'right' });
  const text = toText(d, false);
  assert.match(text, /facing: left down\n/);
  assert.match(text, /machines: block-right ball-up\n/);
  assert.equal(toLevel(d).machines[1]!.template, 'ball');
});

test('painting a page: ids are valid and unique, at most 31', () => {
  let d = newDraft(8, 8);
  d = paint(d, at(1, 2), { kind: 'page', id: 'intro' });
  d = paint(d, at(1, 3), { kind: 'page', id: 'intro' });
  d = paint(d, at(1, 4), { kind: 'page', id: 'Not Valid' });
  d = paint(d, at(1, 5), { kind: 'object', o: 'page' });
  assert.deepEqual(toLevel(d).pageIds, ['intro', 'page-1', 'page-2', 'page-3']);
  assert.equal(paint(d, at(1, 2), { kind: 'page', id: 'intro' }), d);
  let big = newDraft(8, 8);
  for (let r = 1; r < 7; r++) for (let c = 1; c < 7; c++) big = paint(big, at(r, c), { kind: 'page', id: '' });
  assert.equal(toLevel(big).pageIds.length, 31);
  assert.equal(paint(big, at(6, 6), { kind: 'page', id: 'x' }), big);
});

test('the object page brush keeps an existing page id', () => {
  let d = paint(newDraft(5, 5), at(2, 2), { kind: 'page', id: 'intro' });
  assert.equal(paint(d, at(2, 2), { kind: 'object', o: 'page' }), d);
  d = paint(d, at(2, 3), { kind: 'object', o: 'page' });
  assert.deepEqual(toLevel(d).pageIds, ['intro', 'page-1']);
});

test('a non-finite hearts or relics still parses', () => {
  let d = paint(newDraft(5, 5), at(2, 2), { kind: 'object', o: 'relic' });
  d = { ...d, hearts: NaN, relics: NaN };
  const lv = toLevel(d);
  assert.equal(lv.hearts, 3);
  assert.equal(lv.relics, 1);
  assert.equal(toLevel({ ...d, hearts: Infinity, relics: Infinity }).hearts, 3);
});

test('toText for sharing drops title, intro and pages', () => {
  let d = { ...newDraft(5, 5), title: 'T', intro: 'I' };
  d = paint(d, at(2, 2), { kind: 'page', id: 'secret' });
  const own = toText(d, false);
  assert.match(own, /^title: T\nintro: I\npages: secret\n/);
  const shared = toText(d, true);
  assert.doesNotMatch(shared, /title|intro|pages|secret|p/);
  assert.equal(parse(shared).pageIds.length, 0);
  assert.equal(parse(shared).objects.includes('page'), false);
});

test('relics and hearts headers', () => {
  let d = paint(newDraft(5, 5), at(2, 2), { kind: 'object', o: 'relic' });
  assert.doesNotMatch(toText(d, false), /relics|hearts/);
  d = { ...d, relics: 0, hearts: 5 };
  assert.match(toText(d, false), /hearts: 5/);
  assert.equal(toLevel(d).relics, 0);
  assert.equal(toLevel({ ...d, relics: 9 }).relics, 1);
  assert.equal(fromLevel(toLevel(d)).relics, 0);
  assert.equal(fromLevel(toLevel({ ...d, relics: null })).relics, null);
});

test('fromLevel(parse(text)) round-trips every trial', () => {
  for (const t of TRIALS) {
    const lv = parse(t.text);
    const again = parse(toText(fromLevel(lv), false));
    assert.equal(serialize(again), serialize(lv), t.id);
  }
});

test('resize keeps the top-left', () => {
  let d = paint(newDraft(5, 5), at(3, 3), { kind: 'terrain', t: 'water' });
  const big = resize(d, 7, 8);
  assert.equal(big.rows, 7); assert.equal(big.cols, 8);
  assert.equal(big.cells[3 * 8 + 3], '~');
  assert.equal(big.cells[6 * 8 + 7], '.');
  assert.equal(big.cells[0], '#');
  // the player cut off goes to the first floor in reading order
  d = paint(newDraft(6, 6), at(5, 5), { kind: 'player' });
  const small = resize(d, 3, 3);
  assert.equal(small.cells.filter(ch => ch === 'P').length, 1);
  assert.equal(small.cells[1 * 3 + 1], 'P');
  assert.doesNotThrow(() => toLevel(small));
  // no floor left: (0,0) becomes floor and holds him
  let walls = newDraft(5, 5);
  for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) if (r + c > 0) walls = paint(walls, at(r, c), { kind: 'terrain', t: 'wall' });
  walls = { ...walls, cells: walls.cells.map(ch => (ch === 'P' ? '#' : ch)) };
  walls = paint(walls, at(4, 4), { kind: 'player' });
  const cut = resize(walls, 3, 3);
  assert.equal(cut.cells[0], 'P');
  // a cut-off Minotaur is gone
  const m = paint(newDraft(6, 6), at(4, 4), { kind: 'minotaur' });
  assert.equal(toLevel(resize(m, 4, 4)).minotaur, null);
});

test('resize clamps to 3..64', () => {
  const d = newDraft(5, 5);
  assert.equal(resize(d, 1, 1).rows, MIN_SIDE);
  assert.equal(resize(d, 100, 200).cols, MAX_SIDE);
  assert.equal(newDraft(0, 99).rows, MIN_SIDE);
  assert.equal(newDraft(0, 99).cols, MAX_SIDE);
  assert.doesNotThrow(() => toLevel(newDraft(3, 3)));
  assert.equal(playerAt(newDraft(3, 3)), 4);
});

test('a stroke is one edit', () => {
  const start = newDraft(8, 8);
  let d = start;
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) d = paint(d, at(r, c), { kind: 'terrain', t: 'dirt' });
  let h = commit(startHistory(start), d);
  assert.equal(h.canUndo, true);
  assert.equal(commit(h, d), h);
  h = undoH(h);
  assert.equal(h.now, start);
  assert.equal(h.canUndo, false);
  assert.equal(h.canRedo, true);
  assert.equal(redoH(h).now, d);
});

test('the 51st edit drops the first', () => {
  let h = startHistory(0);
  for (let i = 1; i <= UNDO_LIMIT + 1; i++) h = commit(h, i);
  let steps = 0;
  while (h.canUndo) { h = undoH(h); steps++; }
  assert.equal(steps, UNDO_LIMIT);
  assert.equal(h.now, 1);
});

test('redo after a new edit is gone', () => {
  let h = commit(commit(startHistory('a'), 'b'), 'c');
  h = undoH(h);
  assert.equal(h.canRedo, true);
  h = commit(h, 'd');
  assert.equal(h.canRedo, false);
  assert.equal(redoH(h), h);
  assert.equal(undoH(startHistory('a')).now, 'a');
});
