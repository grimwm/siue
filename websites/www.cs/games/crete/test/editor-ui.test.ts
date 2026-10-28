// Crete's level editor in the DOM stub: the palette's buttons, the owner's page brush, painting with the mouse
// (a drag is one undo step and leaves no gaps), the size bar, the editor's keys, and Try it on the game screen and
// back, with the author's best.
import { test, afterEach } from 'node:test';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { h, render as preactRender } from 'preact';
import { importTsx } from '../../_kit/test/tsx.ts';
import { byId, click, document, fire, fireDocument, installDocument, makeEl, maybeById, renderTarget, walk } from '../../_kit/test/dom-stub.ts';
import type { StubElement } from '../../_kit/test/dom-stub.ts';
import type { Brush } from '../src/editor/model.ts';
import type { Level } from '../src/puzzle/level.ts';
import { HAZARDS, OBJECTS, TERRAIN } from '../src/puzzle/tiles.ts';
import type { HazardKind, Terrain } from '../src/puzzle/tiles.ts';
import type { Atlas } from '../src/board-plan.ts';
import type { Board } from '../src/board.ts';
import type { Answer, Report } from '../src/solver-host.ts';
import type { Difficulty } from '../src/puzzle/difficulty.ts';
import { manualClock } from '../../_kit/test/clock.ts';
import { createGame } from '../src/game.ts';
import type { Game } from '../src/game.ts';
import { createFoundPages } from '../src/pages.ts';
import { createProgress } from '../src/progress.ts';
import { CAMPAIGN_LEVELS } from '../src/campaign/chapters.ts';
import { createOutside } from '../src/outside.ts';
import { newDraft, toText } from '../src/editor/model.ts';
import { mv } from './puzzle-grid.ts';

installDocument();
/* The page's storage, for the owner flag, and the window the board reads its pixel ratio from. */
const stored = new Map<string, string>();
(globalThis as { window?: unknown }).window = {
  devicePixelRatio: 1,
  localStorage: { getItem: (k: string) => stored.get(k) ?? null, setItem: (k: string, v: string) => { stored.set(k, v); }, removeItem: (k: string) => { stored.delete(k); } },
  addEventListener() {},
  setTimeout: () => 0,
  clearTimeout() {},
};
(globalThis as { getComputedStyle?: unknown }).getComputedStyle = () => ({ paddingLeft: '0', paddingRight: '0', paddingTop: '0', paddingBottom: '0', display: 'block' });
const ed = await importTsx<{
  palette: typeof import('../src/editor/palette.tsx');
  editor: typeof import('../src/editor/editor.ts');
  page: typeof import('../src/ui.ts');
}>(import.meta.dirname, { palette: '../src/editor/palette.tsx', editor: '../src/editor/editor.ts', page: '../src/ui.ts' });

const roots: StubElement[] = [];
afterEach(() => {
  for (const root of roots.splice(0)) preactRender(null, renderTarget(root));
  stored.clear();
});
function palette(brush: Brush, owner: boolean, seen: string[] = []): StubElement {
  const root = makeEl('palette-root');
  roots.push(root);
  preactRender(h(ed.palette.Palette, { brush, owner, onPick: b => seen.push(JSON.stringify(b)), onRotate: () => seen.push('rotate') }), renderTarget(root));
  return root;
}
const brushIds = (root: StubElement) => walk(root).filter(n => n.id.startsWith('brush-') && n.id !== 'brush-rotate').map(n => n.id);

const TERRAINS = (Object.keys(TERRAIN) as Terrain[]).filter(t => t !== 'clone');
const PIECES = Object.keys(OBJECTS).filter(o => o !== 'page');
const KINDS = Object.keys(HAZARDS) as HazardKind[];

test('the palette lists one button per brush, in its groups', () => {
  const root = palette({ kind: 'terrain', t: 'wall' }, false);
  const ids = brushIds(root);
  assert.deepEqual(ids, [
    ...TERRAINS.map(t => `brush-${t}`),
    ...PIECES.map(o => `brush-${o}`),
    'brush-player', 'brush-minotaur', 'brush-erase',
    ...KINDS.map(h => `brush-${h}`),
    'brush-machine-block', ...KINDS.map(h => `brush-machine-${h}`),
  ]);
  assert.equal(new Set(ids).size, ids.length);
  const groups = walk(root).filter(n => n.localName === 'h3').map(n => n.textContent);
  assert.deepEqual(groups, ['Terrain', 'Pieces', 'Figures', 'Hazards', 'Machines']);
  // Each shows its sprite and has a name of its own.
  for (const id of ids) {
    const b = byId(root, id);
    assert.ok(b.getAttribute('aria-label'), id);
    assert.ok(walk(b).some(n => String(n.className).includes('swatch')), `${id} shows its sprite`);
  }
  assert.equal(byId(root, 'brush-wall').getAttribute('aria-pressed'), 'true');
  assert.equal(byId(root, 'brush-floor').getAttribute('aria-pressed'), 'false');
});

test('a palette button picks its brush; hazards and machines take the facing shown', () => {
  const seen: string[] = [];
  const root = palette({ kind: 'hazard', h: 'ball', dir: 'right' }, false, seen);
  click(byId(root, 'brush-relic'));
  click(byId(root, 'brush-glider'));
  click(byId(root, 'brush-machine-block'));
  click(byId(root, 'brush-minotaur'));
  assert.deepEqual(seen.map(s => JSON.parse(s)), [
    { kind: 'object', o: 'relic' }, { kind: 'hazard', h: 'glider', dir: 'right' },
    { kind: 'machine', template: 'block', dir: 'right' }, { kind: 'minotaur' },
  ]);
});

test('the hazard and machine buttons show their direction, and Turn rotates it', () => {
  const seen: string[] = [];
  const root = palette({ kind: 'machine', template: 'fireball', dir: 'left' }, false, seen);
  for (const id of [...KINDS.map(h => `brush-${h}`), 'brush-machine-block', ...KINDS.map(h => `brush-machine-${h}`)]) {
    assert.match(byId(root, id).getAttribute('aria-label') ?? '', /facing left$/, id);
    assert.equal(byId(root, id).querySelector('.brush-dir')?.textContent, '←', id);
  }
  assert.equal(byId(root, 'brush-wall').querySelector('.brush-dir'), null);
  assert.equal(byId(root, 'brush-machine-fireball').getAttribute('aria-pressed'), 'true');
  const turn = byId(root, 'brush-rotate');
  assert.equal(turn.disabled, false);
  assert.match(turn.textContent, /O$/);
  click(turn);
  assert.deepEqual(seen, ['rotate']);
  assert.equal(byId(palette({ kind: 'terrain', t: 'ice' }, false), 'brush-rotate').disabled, true, 'nothing to turn');
});

test('the page brush only with the owner flag', () => {
  assert.equal(maybeById(palette({ kind: 'terrain', t: 'wall' }, false), 'brush-page'), undefined);
  const owned = palette({ kind: 'page', id: 'x' }, true);
  assert.equal(brushIds(owned).filter(id => id === 'brush-page').length, 1);
  assert.equal(byId(owned, 'brush-page').getAttribute('aria-pressed'), 'true');
});

// ---- the editor itself ----
const atlas = JSON.parse(readFileSync(new URL('../fx/sprites/tiles.json', import.meta.url), 'utf8')) as Atlas;
interface Fake { text: string; calls: string[]; answer(a: Answer): void; report(r: Report): void }
interface Made { root: StubElement; canvas: StubElement; tries: { level: Level; text: string; line: unknown }[]; searches: Fake[]; changes: () => number; editor: ReturnType<typeof ed.editor.createEditor> }
function make(): Made {
  const root = makeEl('editor-root');
  roots.push(root);
  const holder = makeEl('editor-board');
  const canvas = makeEl('editor-stage');
  holder.appendChild(canvas);
  root.appendChild(holder);
  const tries: { level: Level; text: string; line: unknown }[] = [];
  const searches: Fake[] = [];
  let changes = 0;
  const image = makeEl('img');
  const editor = ed.editor.createEditor({
    root: root as unknown as HTMLElement, atlas, image: image as unknown as HTMLImageElement,
    tryIt: (level, text, line) => tries.push({ level, text, line }), changed: () => { changes++; },
    start: (text) => {
      const calls: string[] = [];
      const cbs: ((r: Report) => void)[] = [];
      let resolve!: (a: Answer) => void;
      const result = new Promise<Answer>(res => { resolve = res; });
      searches.push({ text, calls, answer: resolve, report: r => { for (const cb of cbs) cb(r); } });
      return { progress: cb => { cbs.push(cb); }, stop: () => { calls.push('stop'); }, resume: () => { calls.push('resume'); }, cancel: () => { calls.push('cancel'); }, result };
    },
  });
  return { root, canvas, tries, searches, changes: () => changes, editor };
}
/** A press of `key` handed to the editor, as the page hands it. */
function press(e: Made, key: string, mods: Record<string, unknown> = {}): { used: boolean; prevented: boolean } {
  let prevented = false;
  const used = e.editor.key({ key, target: { tagName: 'DIV' }, preventDefault: () => { prevented = true; }, ...mods } as unknown as KeyboardEvent);
  return { used, prevented };
}
/** The pointer over cell (r, c) of the editor's board, which the canvas lays out at 10 px a cell under its rise. */
function at(e: Made, r: number, c: number): Record<string, unknown> {
  const d = e.editor.draft;
  const rise = (10 * atlas.rise) / atlas.cell;
  e.canvas.getBoundingClientRect = () => ({ left: 0, top: 0, width: d.cols * 10, height: d.rows * 10 + rise }) as { width: number; height: number };
  return { clientX: c * 10 + 5, clientY: rise + r * 10 + 5, pointerId: 1, pointerType: 'mouse', button: 0, isPrimary: true };
}
const cell = (e: Made, r: number, c: number) => e.editor.draft.cells[r * e.editor.draft.cols + c];

test('opening with no draft starts a 12 x 12 one and shows the editor; closing hides it and keeps the draft', () => {
  const e = make();
  e.editor.open();
  assert.equal(e.root.hidden, false);
  assert.equal(e.editor.draft.rows, 12);
  assert.equal(e.editor.draft.cols, 12);
  const first = e.editor.draft;
  e.editor.close();
  assert.equal(e.root.hidden, true);
  e.editor.open();
  assert.equal(e.editor.draft, first, 'the draft in progress');
});

test('a drag paints every cell it crosses and mouse up commits one undo step', () => {
  const e = make();
  e.editor.open();
  click(byId(e.root, 'brush-wall'));
  fire(e.canvas, 'pointerdown', at(e, 5, 2));
  fire(e.canvas, 'pointermove', at(e, 5, 9));
  fire(e.canvas, 'pointerup', at(e, 5, 9));
  for (let c = 2; c <= 9; c++) assert.equal(cell(e, 5, c), '#', `cell 5,${c}`);
  assert.ok(e.changes() > 0);
  assert.equal(byId(e.root, 'editor-undo').disabled, false);
  assert.deepEqual(press(e, 'u'), { used: true, prevented: true });
  for (let c = 2; c <= 9; c++) assert.equal(cell(e, 5, c), '.', `cell 5,${c} after undo`);
  assert.equal(byId(e.root, 'editor-undo').disabled, true, 'the whole drag was one step');
  press(e, 'y');
  assert.equal(cell(e, 5, 5), '#');
  press(e, 'z', { ctrlKey: true });
  assert.equal(cell(e, 5, 5), '.');
  press(e, 'Z', { metaKey: true, shiftKey: true });
  assert.equal(cell(e, 5, 5), '#');
});

test('a stroke that changes nothing adds no undo step', () => {
  const e = make();
  e.editor.open();
  click(byId(e.root, 'brush-wall'));
  fire(e.canvas, 'pointerdown', at(e, 0, 3));
  fire(e.canvas, 'pointerup', at(e, 0, 3));
  assert.equal(byId(e.root, 'editor-undo').disabled, true);
});

test('O rotates the brush', () => {
  const e = make();
  e.editor.open();
  click(byId(e.root, 'brush-ball'));
  assert.match(byId(e.root, 'brush-ball').getAttribute('aria-label') ?? '', /facing up$/);
  assert.deepEqual(press(e, 'o'), { used: true, prevented: true });
  assert.match(byId(e.root, 'brush-ball').getAttribute('aria-label') ?? '', /facing right$/);
  fire(e.canvas, 'pointerdown', at(e, 4, 4));
  fire(e.canvas, 'pointerup', at(e, 4, 4));
  assert.equal(cell(e, 4, 4), HAZARDS.ball.char);
  assert.equal(e.editor.draft.extra[4 * 12 + 4], 'right');
});

test('P tries the draft; C checks; Q is left to the page unless the drawer is open', () => {
  const e = make();
  e.editor.open();
  assert.deepEqual(press(e, 'p'), { used: true, prevented: true });
  assert.equal(e.tries.length, 1);
  assert.equal(e.tries[0]!.level.rows, 12);
  assert.match(e.tries[0]!.text, /^title: /);
  assert.equal(press(e, 'c').used, true);
  assert.equal(press(e, 'q').used, false);
  assert.equal(press(e, 'Escape').used, false);
  click(byId(e.root, 'editor-pieces'));
  assert.equal(byId(e.root, 'editor-pieces').getAttribute('aria-expanded'), 'true');
  assert.equal(press(e, 'q').used, true, 'Q closes the drawer');
  assert.equal(byId(e.root, 'editor-pieces').getAttribute('aria-expanded'), 'false');
});

test('keys typed into the size bar are only typing', () => {
  const e = make();
  e.editor.open();
  assert.equal(byId(e.root, 'editor-rows').getAttribute('type'), 'number');
  // The stub's elements have no tagName; the press carries what a browser's number box would.
  const box = { tagName: 'INPUT', type: 'number' };
  for (const k of ['u', 'p', 'o', 'q']) {
    assert.equal(e.editor.key({ key: k, target: box, preventDefault() {} } as unknown as KeyboardEvent), false, k);
  }
  assert.equal(e.tries.length, 0);
});

test('the size bar resizes, and hearts and relics needed are set; each is one undo step', () => {
  const e = make();
  e.editor.open();
  byId(e.root, 'editor-rows').value = '20';
  byId(e.root, 'editor-cols').value = '99';
  click(byId(e.root, 'editor-resize'));
  assert.equal(e.editor.draft.rows, 20);
  assert.equal(e.editor.draft.cols, 64, 'sides stay within 3 to 64');
  const hearts = byId(e.root, 'editor-hearts');
  hearts.value = '7';
  fire(hearts, 'change');
  assert.equal(e.editor.draft.hearts, 7);
  click(byId(e.root, 'brush-relic'));
  fire(e.canvas, 'pointerdown', at(e, 2, 2));
  fire(e.canvas, 'pointermove', at(e, 2, 4));
  fire(e.canvas, 'pointerup', at(e, 2, 4));
  const relics = byId(e.root, 'editor-relics');
  assert.deepEqual(walk(relics).filter(n => n.localName === 'option').map(o => o.textContent), ['all', '0', '1', '2', '3']);
  relics.value = '2';
  fire(relics, 'change');
  assert.equal(e.editor.draft.relics, 2);
  press(e, 'u');
  press(e, 'u');
  press(e, 'u');
  assert.equal(e.editor.draft.hearts, 3);
  press(e, 'u');
  assert.equal(e.editor.draft.rows, 12);
});

test('the editor shows the page brush only with the owner flag', () => {
  const e = make();
  e.editor.open();
  assert.equal(maybeById(e.root, 'brush-page'), undefined);
  e.editor.close();
  stored.set('crete-owner', 'on');
  e.editor.open();
  assert.ok(byId(e.root, 'brush-page'));
});

test('the board is drawn: the canvas is sized to the draft', () => {
  const e = make();
  e.editor.open();
  assert.ok(Number(e.canvas.dataset.cell) >= 1, e.canvas.dataset.cell);
  assert.equal((e.canvas as unknown as { width: number }).width, 12 * Number(e.canvas.dataset.cell));
});

// ---- review round 1 ----
test('the fake and invisible walls carry a mark on the editor board and on their swatches', () => {
  const e = make();
  e.editor.open();
  click(byId(e.root, 'brush-fake-wall'));
  fire(e.canvas, 'pointerdown', at(e, 3, 3));
  fire(e.canvas, 'pointerup', at(e, 3, 3));
  click(byId(e.root, 'brush-invisible-wall'));
  fire(e.canvas, 'pointerdown', at(e, 4, 6));
  fire(e.canvas, 'pointerup', at(e, 4, 6));
  assert.deepEqual(ed.editor.hiddenMarks(e.editor.draft), [{ r: 3, c: 3, mark: 'F' }, { r: 4, c: 6, mark: 'I' }]);
  const root = palette({ kind: 'terrain', t: 'wall' }, false);
  assert.equal(byId(root, 'brush-fake-wall').querySelector('.brush-mark')?.textContent, 'F');
  assert.equal(byId(root, 'brush-invisible-wall').querySelector('.brush-mark')?.textContent, 'I');
  assert.equal(byId(root, 'brush-wall').querySelector('.brush-mark'), null);
});

test('painting the board takes the focus out of a number box, so the editor keys work again', () => {
  const e = make();
  e.editor.open();
  const box = makeEl('editor-rows-focus') as StubElement & { tagName: string; type: string };
  box.tagName = 'INPUT';
  box.type = 'number';
  box.focus();
  globalThis.__blurred = null;
  fire(e.canvas, 'pointerdown', at(e, 6, 6));
  fire(e.canvas, 'pointerup', at(e, 6, 6));
  assert.equal(globalThis.__blurred, box);
  assert.notEqual(document.activeElement, box);
});

test('hearts are clamped before they are compared; an empty box changes nothing and shows the hearts', () => {
  const e = make();
  e.editor.open();
  const hearts = () => byId(e.root, 'editor-hearts');
  hearts().value = '99';
  fire(hearts(), 'change');
  assert.equal(e.editor.draft.hearts, 99);
  const box = hearts();
  box.value = '150';
  fire(box, 'change');
  assert.equal(e.editor.draft.hearts, 99);
  assert.equal(box.value, '99', 'the box shows the clamped value');
  box.value = '';
  fire(box, 'change');
  assert.equal(e.editor.draft.hearts, 99);
  assert.equal(box.value, '99');
  press(e, 'u');
  assert.equal(e.editor.draft.hearts, 3, '150 and the empty box added no undo step');
  assert.equal(byId(e.root, 'editor-undo').disabled, true);
});

test('Resize ignores an empty box, and the boxes show the size the board has', () => {
  const e = make();
  e.editor.open();
  const rows = byId(e.root, 'editor-rows');
  const cols = byId(e.root, 'editor-cols');
  rows.value = '';
  cols.value = '20';
  click(byId(e.root, 'editor-resize'));
  assert.equal(e.editor.draft.rows, 12);
  assert.equal(e.editor.draft.cols, 12);
  assert.deepEqual([rows.value, cols.value], ['12', '12']);
  assert.equal(byId(e.root, 'editor-undo').disabled, true);
  rows.value = '12';
  cols.value = '2';
  click(byId(e.root, 'editor-resize'));
  assert.equal(e.editor.draft.cols, 3);
  const r2 = byId(e.root, 'editor-rows');
  const c2 = byId(e.root, 'editor-cols');
  r2.value = '12';
  c2.value = '1';
  click(byId(e.root, 'editor-resize'));
  assert.equal(c2.value, '3', 'a clamped size equal to the board shows the board\'s size');
  press(e, 'u');
  assert.equal(e.editor.draft.cols, 12, 'the clamped equal size added no undo step');
});

// ---- Try it: the draft on the game screen, and back ----
/* The page as src/main.ts wires it: the game, its UI, the editor, and the outside slot a try plays in. */
const tryRoot = makeEl('try-editor-root');
const progress = createProgress(null);
const m = manualClock();
const outside = createOutside(CAMPAIGN_LEVELS, {
  open: i => tryGame.open(i),
  settle: () => tryGame.settle(),
  closeLayers: () => flow.closeLayers(),
  showEditor: () => flow.showEditor(),
  bestWon: (text, moves) => tryEditor.tryWon(text, moves),
});
const flow = ed.page.createUi({ atlas: { cell: 16, rise: 8, sprites: {} } as Atlas, board: { size() {}, paint() {} } as Board, progress, pages: createFoundPages(null), levels: outside.levels });
const tryGame: Game = createGame({
  sfx() {}, say() {}, progress, pages: createFoundPages(null), timers: m.timers, clock: m.clock, levels: outside.levels,
  reducedMotion: () => true, changed: () => flow.render(tryGame),
});
const tryEditor = ed.editor.createEditor({
  root: tryRoot as unknown as HTMLElement, atlas, image: makeEl('img') as unknown as HTMLImageElement,
  tryIt: (level, text) => outside.tryLevel(level, text, null), changed() {},
});
/* How many times the page was told the editor's visit ended (it then takes #edit off the address). */
let lefts = 0;
flow.bindControls({
  game: tryGame, toggleMute() {}, toggleFullscreen() {}, wake() {}, quit() {}, play() {}, backToEditor: outside.backToEditor, editor: tryEditor,
  leftEditor: () => { lefts++; },
});
const key = (k: string) => fireDocument('keydown', { key: k, target: { tagName: 'DIV' } });
const rootOf = (id: string) => document.getElementById(`${id.split('-')[0]}-root`)!;
const el = (id: string) => maybeById(rootOf(id), id);
/** The editor, alone, on a new draft of `rows` x `cols` (the player at the top left, the exit at the bottom right). */
function editing(rows: number, cols: number): void {
  flow.showEditor();
  tryEditor.open(newDraft(rows, cols));
}
/** Paints a wall at (r, c) of the open draft, as a click on the board does. */
function wallAt(r: number, c: number): void {
  const d = tryEditor.draft;
  const rise = (10 * atlas.rise) / atlas.cell;
  const canvas = byId(tryRoot, 'editor-stage');
  canvas.getBoundingClientRect = () => ({ left: 0, top: 0, width: d.cols * 10, height: d.rows * 10 + rise }) as { width: number; height: number };
  click(byId(tryRoot, 'brush-wall'));
  const ev = { clientX: c * 10 + 5, clientY: rise + r * 10 + 5, pointerId: 1, pointerType: 'mouse', button: 0, isPrimary: true };
  fire(canvas, 'pointerdown', ev);
  fire(canvas, 'pointerup', ev);
}
/** Begins the try and walks from the top left to the bottom right of an open draft: its moves. */
function walkToExit(): number {
  key('Enter');
  const d = tryEditor.draft;
  for (let i = 0; i < d.cols - 3; i++) tryGame.press(mv('right'));
  for (let i = 0; i < d.rows - 3; i++) tryGame.press(mv('down'));
  assert.equal(tryGame.run!.now.outcome, 'won');
  return tryGame.run!.now.moves;
}

test('Try it opens the level on the game screen with its start card', () => {
  editing(8, 9);
  wallAt(3, 5);
  const draft = tryEditor.draft;
  click(byId(tryRoot, 'editor-try'));
  assert.equal(flow.top(), 'start');
  assert.equal(tryRoot.hidden, true, 'the editor is put away');
  assert.equal(tryGame.trial, outside.at);
  assert.equal(tryGame.run!.now.level.cols, 9);
  assert.equal(tryGame.run!.now.level.terrain[3 * 9 + 5], 'wall');
  assert.equal(walk(byId(rootOf('start-veil'), 'start-veil')).find(n => n.className === 'kicker')?.textContent, 'Your level');
  assert.equal(byId(rootOf('start-title'), 'start-title').textContent, 'Your level');
  assert.equal(tryEditor.draft, draft);
  key('Enter');
  assert.equal(flow.top(), null, 'Enter begins the try');
  key('ArrowRight');
  assert.equal(tryGame.run!.now.moves, 1, 'the game takes the keys');
});

test('a draft with a title is named by it, and its best is kept under its share text', () => {
  flow.showEditor();
  tryEditor.open({ ...newDraft(6, 6), title: 'My maze' });
  key('p');
  assert.equal(byId(rootOf('start-title'), 'start-title').textContent, 'My maze');
  const moves = walkToExit();
  assert.equal(byId(rootOf('end-title'), 'end-title').textContent, 'My maze');
  assert.equal(tryEditor.bestFor(toText(tryEditor.draft, true)), moves);
});

test('Back to the editor returns to the same draft and history', () => {
  editing(7, 8);
  wallAt(2, 4);
  wallAt(3, 4);
  const draft = tryEditor.draft;
  key('p');
  key('Enter');
  tryGame.press(mv('right'));
  tryGame.auto();
  assert.equal(tryGame.playing, true, 'a play-out runs');
  key('q');
  assert.equal(flow.top(), 'menu');
  click(el('menu-editor')!);
  assert.equal(flow.top(), 'editor');
  assert.equal(tryRoot.hidden, false);
  assert.equal(tryGame.playing, false, 'the play-out stopped');
  assert.equal(tryEditor.draft, draft);
  key('u');
  assert.equal(tryEditor.draft.cells[3 * 8 + 4], '.', 'the last stroke undone');
  assert.equal(tryEditor.draft.cells[2 * 8 + 4], '#', 'and only it');
  // From the end card too.
  key('p');
  walkToExit();
  assert.equal(flow.top(), 'end');
  click(el('end-editor')!);
  assert.equal(flow.top(), 'editor');
  key('y');
  assert.equal(tryEditor.draft, draft, 'redo still has the stroke');
});

test('an unassisted win records the author\'s best for that text', () => {
  editing(9, 9);
  const text = toText(tryEditor.draft, true);
  assert.equal(tryEditor.bestFor(text), null);
  key('p');
  const moves = walkToExit();
  assert.equal(moves, 12);
  assert.equal(tryEditor.bestFor(text), 12);
  // A longer win keeps the best; Retry plays the same try.
  click(el('end-retry')!);
  key('Enter');
  tryGame.press({ kind: 'wait' });
  for (let i = 0; i < 6; i++) tryGame.press(mv('right'));
  for (let i = 0; i < 6; i++) tryGame.press(mv('down'));
  assert.equal(tryGame.run!.now.outcome, 'won');
  assert.equal(tryEditor.bestFor(text), 12);
  assert.equal(progress.get('outside').cleared, false, 'a try records no progress');
});

test('a hinted win records none', () => {
  editing(9, 10);
  const text = toText(tryEditor.draft, true);
  key('p');
  key('Enter');
  key('h');
  assert.equal(tryGame.run!.assisted, true);
  for (let i = 0; i < 7; i++) tryGame.press(mv('right'));
  for (let i = 0; i < 6; i++) tryGame.press(mv('down'));
  assert.equal(tryGame.run!.now.outcome, 'won');
  assert.equal(tryEditor.bestFor(text), null);
});

test('an edit after a win forgets the best', () => {
  editing(10, 9);
  key('p');
  const moves = walkToExit();
  click(el('end-editor')!);
  assert.equal(tryEditor.bestFor(toText(tryEditor.draft, true)), moves);
  wallAt(4, 4);
  assert.equal(tryEditor.bestFor(toText(tryEditor.draft, true)), null, 'the edited level has no best');
  key('u');
  assert.equal(tryEditor.bestFor(toText(tryEditor.draft, true)), moves, 'undo brings back the level that was won');
});

test('P with no player-reachable problem opens Try it; the editor layer closes', () => {
  editing(12, 12);
  assert.equal(flow.top(), 'editor');
  key('p');
  assert.equal(flow.top(), 'start');
  assert.equal(tryRoot.hidden, true);
  key('q');
  assert.equal(flow.top(), null, 'Q closes the start card, not a hidden editor');
  key('q');
  assert.equal(flow.top(), 'menu');
  assert.ok(el('menu-editor'));
});

test('the browser leaving #edit during a try leaves the try playing', () => {
  editing(6, 7);
  key('p');
  key('Enter');
  tryGame.press(mv('right'));
  flow.leaveEditor();
  assert.equal(flow.top(), null, 'no title card over the try, and no editor');
  assert.equal(tryRoot.hidden, true);
  assert.equal(tryGame.trial, outside.at);
  assert.equal(tryGame.run!.now.moves, 1);
});

test('the #edit path back into the editor settles a running try: no play-out, no animation, no thread', () => {
  editing(8, 8);
  key('p');
  key('Enter');
  key('v');
  assert.ok(tryGame.thread, 'the thread is drawn');
  tryGame.auto();
  m.advance(1000);
  assert.equal(tryGame.playing, true);
  const moves = tryGame.run!.now.moves;
  assert.ok(moves > 0, 'the play-out has played');
  // The browser's Forward to #edit takes this path (src/main.ts followHash).
  outside.backToEditor();
  assert.equal(flow.top(), 'editor');
  assert.equal(tryGame.playing, false);
  assert.equal(tryGame.anim, null);
  assert.equal(tryGame.thread, null);
  const at = tryGame.run!.now.moves;
  m.advance(10_000);
  assert.equal(tryGame.run!.now.moves, at, 'no move is played under the editor');
});

test('a try left for a campaign level ends the editor\'s visit; Retry does not', () => {
  editing(7, 7);
  key('p');
  walkToExit();
  lefts = 0;
  click(el('end-retry')!);
  assert.equal(tryGame.trial, outside.at);
  assert.equal(lefts, 0, 'Retry plays the try again');
  key('Enter');
  key('n');
  assert.equal(flow.top(), 'levels');
  click(byId(rootOf('levels-root'), 'level-2'));
  assert.equal(tryGame.trial, 1);
  assert.equal(lefts, 1);
});

/* ---------- Check ---------- */
const REPORT: Report = { expanded: 10, stored: 1234, bestF: 40, startH: 30, storage: 'disk' };
const ANSWER: Difficulty = {
  solved: true, shortest: 54, explored: 24086, withoutMinotaur: 32, minotaurDelta: 22, greedyWins: false, catchFree: 54,
  catches: 0, label: 'chase', naiveWins: false, line: 'rrdd',
};
const settle = () => new Promise<void>(r => setImmediate(r));
const said = (e: Made, id: string) => byId(e.root, id).textContent;

test('C and the Check button run the search of the draft; the panel shows its progress, Stop and Keep searching', async () => {
  const e = make();
  e.editor.open();
  assert.equal(maybeById(e.root, 'check-progress'), undefined);
  assert.deepEqual(press(e, 'c'), { used: true, prevented: true });
  assert.equal(e.searches.length, 1);
  assert.equal(e.searches[0]!.text, toText(e.editor.draft, true));
  assert.match(said(e, 'check-progress'), /^Starting/);
  e.searches[0]!.report(REPORT);
  assert.equal(said(e, 'check-progress'), 'Searched 1,234 situations · trying lines of at least 40 moves');
  e.searches[0]!.report({ ...REPORT, storage: 'memory' });
  assert.match(said(e, 'check-progress'), /\(in memory only\)$/);
  assert.equal(byId(e.root, 'check-keep').disabled, true);
  click(byId(e.root, 'check-stop'));
  assert.deepEqual(e.searches[0]!.calls, ['stop']);
  assert.equal(byId(e.root, 'check-stop').disabled, true);
  assert.equal(byId(e.root, 'check-keep').disabled, false);
  click(byId(e.root, 'check-keep'));
  assert.deepEqual(e.searches[0]!.calls, ['stop', 'resume']);
  e.searches[0]!.answer(ANSWER);
  await settle();
  assert.equal(maybeById(e.root, 'check-progress'), undefined);
  assert.match(said(e, 'check-result'), /^Winnable: quickest win 54 moves/);
  assert.equal(maybeById(e.root, 'check-stale'), undefined);
  click(byId(e.root, 'check-run'));
  assert.equal(e.searches.length, 1, 'the answer for this text is reused');
});

test('an edit cancels a running check and marks a finished one out of date; undo makes it current', async () => {
  const e = make();
  e.editor.open();
  press(e, 'c');
  click(byId(e.root, 'brush-wall'));
  fire(e.canvas, 'pointerdown', at(e, 5, 2));
  fire(e.canvas, 'pointerup', at(e, 5, 2));
  assert.deepEqual(e.searches[0]!.calls, ['cancel']);
  assert.equal(maybeById(e.root, 'check-progress'), undefined);
  press(e, 'u');
  click(byId(e.root, 'check-run'));
  assert.equal(e.searches.length, 2);
  e.searches[1]!.answer(ANSWER);
  await settle();
  fire(e.canvas, 'pointerdown', at(e, 5, 2));
  fire(e.canvas, 'pointerup', at(e, 5, 2));
  assert.equal(said(e, 'check-stale'), 'Out of date: press Check.');
  assert.ok(byId(e.root, 'check-result').className.includes('stale'));
  press(e, 'u');
  assert.equal(maybeById(e.root, 'check-stale'), undefined);
  assert.match(said(e, 'check-result'), /Winnable/);
});

test('Try it hands the last Check\'s line over only when that check was of the very text', async () => {
  const e = make();
  e.editor.open();
  press(e, 'p');
  assert.equal(e.tries[0]!.line, null);
  press(e, 'c');
  e.searches[0]!.answer(ANSWER);
  await settle();
  press(e, 'p');
  assert.deepEqual((e.tries[1]!.line as { kind: string; dir: string }[]).map(a => a.dir), ['right', 'right', 'down', 'down']);
  click(byId(e.root, 'brush-wall'));
  fire(e.canvas, 'pointerdown', at(e, 5, 2));
  fire(e.canvas, 'pointerup', at(e, 5, 2));
  press(e, 'p');
  assert.equal(e.tries[2]!.line, null);
});

test('the check strip in the bar, outside the drawer, shows the run, the answer and the stale note, and has its own buttons', async () => {
  const e = make();
  e.editor.open();
  const strip = () => byId(e.root, 'check-strip');
  assert.equal(maybeById(strip(), 'check-strip-text'), undefined);
  click(byId(e.root, 'check-strip-run'));
  assert.equal(e.searches.length, 1);
  assert.equal(byId(e.root, 'check-strip-text').textContent, 'Starting the search…');
  assert.ok(walk(strip()).some(n => n.getAttribute('role') === 'progressbar'));
  e.searches[0]!.report(REPORT);
  assert.equal(byId(e.root, 'check-strip-text').textContent, 'Searched 1,234 situations · trying lines of at least 40 moves');
  click(byId(e.root, 'check-strip-stop'));
  assert.deepEqual(e.searches[0]!.calls, ['stop']);
  assert.match(byId(e.root, 'check-strip-text').textContent, /Stopped\.$/);
  assert.equal(byId(e.root, 'check-strip-keep').disabled, false);
  click(byId(e.root, 'check-strip-run'));
  assert.deepEqual(e.searches[0]!.calls, ['stop', 'resume']);
  e.searches[0]!.answer({ ...ANSWER, shortest: 60, explored: 900000 });
  await settle();
  assert.equal(maybeById(e.root, 'check-strip-stop'), undefined);
  assert.equal(byId(e.root, 'check-strip-text').textContent, 'Winnable in 60 · Shareable');
  click(byId(e.root, 'brush-wall'));
  fire(e.canvas, 'pointerdown', at(e, 5, 2));
  fire(e.canvas, 'pointerup', at(e, 5, 2));
  assert.equal(byId(e.root, 'check-strip-text').textContent, 'Out of date: press Check.');
  assert.ok(strip().className.includes('stale'));
  const ids = walk(e.root).map(n => n.id).filter(Boolean);
  assert.equal(new Set(ids).size, ids.length, 'no id twice');
});
