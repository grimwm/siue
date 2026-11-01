// The composer against the DOM stub: Title Case controls, Undo counting each edit, amber and red notes that stay where
// they were put until Move Them Into Range, and Save Draft keeping the next draft and saying so.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { h, render } from 'preact';
import { act } from 'preact/test-utils';
import { click, installDocument, makeEl, renderTarget, walk } from '../../_kit/test/dom-stub.ts';
import type { StubElement } from '../../_kit/test/dom-stub.ts';
import { importTsx } from '../../_kit/test/tsx.ts';
import { catalogue } from '../src/catalogue.ts';
import { newDoc } from '../src/compose/doc.ts';
import { addNotes, addPart } from '../src/compose/edit.ts';
import type { Library } from '../src/render/plan.ts';

installDocument();
Object.assign(globalThis, {
  window: { addEventListener() {}, removeEventListener() {}, scrollX: 0, scrollY: 0, scrollTo() {} },
  requestAnimationFrame: () => 0,
  cancelAnimationFrame: () => {},
});
const ENTRIES = catalogue(JSON.parse(readFileSync(join(import.meta.dirname, '..', '..', '..', 'music', 'library', 'library.json'), 'utf8')) as Library);
const ui = await importTsx<{ c: typeof import('../src/ui/compose/Composer.tsx') }>(import.meta.dirname, { c: '../src/ui/compose/Composer.tsx' });

const sampler = { ready: async () => {}, start: () => 1, stop() {}, stopAll() {} };
const text = (el: StubElement): string => el.textContent.replace(/\s+/g, ' ').trim();
const button = (root: StubElement, words: string): StubElement => {
  const b = walk(root).find(e => e.localName === 'button' && text(e) === words);
  assert.ok(b, `no button "${words}" in ${walk(root).filter(e => e.localName === 'button').map(text).join(' | ')}`);
  return b;
};

test('the composer: Title Case controls, coloured notes, Move Them Into Range with Undo, and Save Draft', async () => {
  let doc = addPart(newDoc('My First Tune'), ENTRIES.find(e => e.id === 'violin')!)!.doc;
  doc = addNotes(doc, 'violin', [{ start: 0, length: 1, pitch: 24 }, { start: 1, length: 1, pitch: 103 }, { start: 2, length: 1, pitch: 67 }]).doc;
  const saved: number[] = [];
  const api = { saveDraft: async (_piece: string, version: number) => { saved.push(version); return { status: 201, data: { version } }; } };
  const root = makeEl('root');
  await act(() => {
    render(h(ui.c.Composer, {
      start: { doc, piece: { id: 'my-first-tune', title: 'My First Tune' }, project: { id: 'my-pieces', name: 'My Pieces' }, version: 0 },
      entries: ENTRIES, api, sampler, buildSound: async () => { throw new Error('no sound here'); }, now: () => 0,
    }), renderTarget(root));
  });
  for (const words of ['↶ Undo 0', '↷ Redo 0', 'Clear', 'Save Draft', 'Notes On Controls: On', 'Fill My Screen', 'Add Part', 'Hear With The Piece', 'Hear My Part Alone',
    'Change Instrument', 'Move Them Into Range', 'Remove Part', '‹ Lower', 'Higher ›']) button(root, words);
  const ranges = () => walk(root).filter(e => e.dataset['noteId'] !== undefined || e._attrs['data-note-id'] !== undefined).map(e => e._attrs['data-range'] ?? e.dataset['range']);
  assert.deepEqual(ranges(), ['out', 'expert', 'normal']);
  assert.match(text(walk(root).find(e => e._attrs['data-out-of-range'] !== undefined)!), /^1 note is out of this instrument's range/);

  await act(() => click(button(root, 'Move Them Into Range')));
  assert.deepEqual(ranges(), ['normal', 'expert', 'normal']);
  button(root, '↶ Undo 1');
  await act(() => click(button(root, '↶ Undo 1')));
  assert.deepEqual(ranges(), ['out', 'expert', 'normal'], 'Undo puts the red note back');
  button(root, '↷ Redo 1');

  await act(async () => { click(button(root, 'Save Draft')); await new Promise(r => setTimeout(r, 0)); });
  assert.deepEqual(saved, [1]);
  assert.equal(text(walk(root).find(e => e._attrs['data-status'] !== undefined)!), 'Saved as draft 1.');
  assert.match(text(walk(root).find(e => e._attrs['data-draft-line'] !== undefined)!), /^Draft 1 · 92 BPM · 4\/4$/);
  render(null, renderTarget(root));
});
