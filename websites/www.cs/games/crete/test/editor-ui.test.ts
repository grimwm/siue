// Crete's level editor in the DOM stub: the palette's buttons, the owner's page brush, painting with the mouse
// (a drag is one undo step and leaves no gaps), the size bar, and the editor's keys.
import { test, afterEach } from 'node:test';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { h, render as preactRender } from 'preact';
import { importTsx } from '../../_kit/test/tsx.ts';
import { byId, click, document, fire, installDocument, makeEl, maybeById, renderTarget, walk } from '../../_kit/test/dom-stub.ts';
import type { StubElement } from '../../_kit/test/dom-stub.ts';
import type { Brush } from '../src/editor/model.ts';
import type { Level } from '../src/puzzle/level.ts';
import { HAZARDS, OBJECTS, TERRAIN } from '../src/puzzle/tiles.ts';
import type { HazardKind, Terrain } from '../src/puzzle/tiles.ts';
import type { Atlas } from '../src/board-plan.ts';

installDocument();
/* The page's storage, for the owner flag, and the window the board reads its pixel ratio from. */
const stored = new Map<string, string>();
(globalThis as { window?: unknown }).window = {
  devicePixelRatio: 1,
  localStorage: { getItem: (k: string) => stored.get(k) ?? null, setItem: (k: string, v: string) => { stored.set(k, v); }, removeItem: (k: string) => { stored.delete(k); } },
  addEventListener() {},
};
(globalThis as { getComputedStyle?: unknown }).getComputedStyle = () => ({ paddingLeft: '0', paddingRight: '0', paddingTop: '0', paddingBottom: '0' });
const ed = await importTsx<{
  palette: typeof import('../src/editor/palette.tsx');
  editor: typeof import('../src/editor/editor.ts');
}>(import.meta.dirname, { palette: '../src/editor/palette.tsx', editor: '../src/editor/editor.ts' });

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
interface Made { root: StubElement; canvas: StubElement; tries: { level: Level; text: string }[]; changes: () => number; editor: ReturnType<typeof ed.editor.createEditor> }
function make(): Made {
  const root = makeEl('editor-root');
  roots.push(root);
  const holder = makeEl('editor-board');
  const canvas = makeEl('editor-stage');
  holder.appendChild(canvas);
  root.appendChild(holder);
  const tries: { level: Level; text: string }[] = [];
  let changes = 0;
  const image = makeEl('img');
  const editor = ed.editor.createEditor({
    root: root as unknown as HTMLElement, atlas, image: image as unknown as HTMLImageElement,
    tryIt: (level, text) => tries.push({ level, text }), changed: () => { changes++; },
  });
  return { root, canvas, tries, changes: () => changes, editor };
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

test('P tries the draft; C is taken; Q is left to the page unless the drawer is open', () => {
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
