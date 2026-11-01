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

/** Lets the sheet's engraving timer fire and its drawing finish. */
const settle = async (): Promise<void> => { await new Promise(r => setTimeout(r, 300)); await act(async () => {}); };
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

test('Show As: Grid, Sheet Music and Both; the sheet is the part engraved, written as it is read, Concert Pitch as it sounds', async () => {
  let doc = addPart(newDoc('Horn Call'), ENTRIES.find(e => e.id === 'horn')!)!.doc;
  doc = addNotes(doc, 'french-horn', [{ start: 0, length: 4, pitch: 53 }]).doc;
  const shown: { xml: string; lane: string | null }[] = [];
  const sheet = { show: async (xml: string, lane: string | null) => { shown.push({ xml, lane }); }, mark() {}, layout() {}, preview() {}, dispose() {} };
  const saved: { name: string; data: Blob }[] = [];
  const files = {
    loadSheet: async () => ({ mountSheet: () => sheet }),
    importPorts: { parseXml: () => { throw new Error('unused'); }, inflate: async (b: Uint8Array) => b, now: () => 0 },
    save: (name: string, data: Blob) => { saved.push({ name, data }); },
  };
  const root = makeEl('root');
  await act(() => {
    render(h(ui.c.Composer, {
      start: { doc, piece: { id: 'horn-call', title: 'Horn Call' }, project: { id: 'my-pieces', name: 'My Pieces' }, version: 0 },
      entries: ENTRIES, api: { saveDraft: async () => ({ status: 201, data: { version: 1 } }) }, sampler, buildSound: async () => { throw new Error('no sound'); }, now: () => 0, files,
    }), renderTarget(root));
  });
  for (const words of ['Import Music File', 'Export MusicXML', 'Export MIDI', 'Grid', 'Sheet Music', 'Both']) button(root, words);
  const sheetBoxes = () => walk(root).filter(e => e._attrs['data-part-sheet'] !== undefined).length;
  const grids = () => walk(root).filter(e => e._attrs['data-edit-grid'] !== undefined).length;
  assert.deepEqual([grids(), sheetBoxes()], [1, 0], 'the grid alone at first');
  assert.ok(walk(root).some(e => e._attrs['data-range-picture'] !== undefined), 'the range picture in Part Settings');

  await act(() => click(button(root, 'Sheet Music'))); await settle();
  assert.deepEqual([grids(), sheetBoxes()], [0, 1]);
  assert.equal(shown.length, 1, text(walk(root).find(e => e._attrs['data-sheet-state'] !== undefined) ?? root));
  assert.equal(shown[0]!.lane, 'french-horn');
  assert.match(shown[0]!.xml, /<step>C<\/step><octave>4<\/octave>/, 'the horn in F is written a fifth up');

  await act(() => click(button(root, 'Concert Pitch: Off'))); await settle();
  assert.match(shown[shown.length - 1]!.xml, /<step>F<\/step><octave>3<\/octave>/);
  assert.doesNotMatch(shown[shown.length - 1]!.xml, /<transpose>/);

  await act(() => click(button(root, 'Both'))); await settle();
  assert.deepEqual([grids(), sheetBoxes()], [1, 1]);

  await act(() => click(button(root, 'Export MIDI')));
  assert.equal(saved[0]!.name, 'horn-call.mid');
  assert.equal(new TextDecoder().decode(new Uint8Array(await saved[0]!.data.arrayBuffer()).slice(0, 4)), 'MThd');
  await act(() => click(button(root, 'Export MusicXML')));
  assert.equal(saved[1]!.name, 'horn-call.musicxml');
  assert.doesNotMatch(await saved[1]!.data.text(), /color=/, 'an export carries no range colours');
  render(null, renderTarget(root));
});

test('the import preview: facts, a select per part (drums only drums), What Can\'t Come Across, and its three buttons', async () => {
  const view = await importTsx<{ p: typeof import('../src/ui/compose/ImportPreview.tsx') }>(import.meta.dirname, { p: '../src/ui/compose/ImportPreview.tsx' });
  const preview = {
    file: 'band.mid', type: 'MIDI' as const, app: 'a MIDI program', bpm: 100, tempoWord: 'Walking', time: '3/4', key: 'Not In The File', bars: 2, title: null,
    tempo: [{ bar: 1, bpm: 100, beats: 3, unit: 4 as const }], lost: ['Pitch-wheel moves (1). The notes come across at their own pitch, without the bends.'],
    parts: [{ name: 'Bass', from: 'GM 33 Acoustic Bass', match: 'bass', drums: false, notes: [{ start: 0, length: 1, pitch: 20, velocity: 80 }] },
      { name: 'Drums', from: 'Channel 10', match: 'kit', drums: true, notes: [{ start: 0, length: 1, pitch: 36, velocity: 80 }] }],
  };
  const calls: string[] = [];
  const root = makeEl('root');
  await act(() => {
    render(h(view.p.ImportPreview, { preview, choice: ['bass', 'kit'], entries: ENTRIES, piece: 'My Tune', onChoice: (i: number, id: string) => calls.push(`${i}:${id}`),
      onAdd: () => calls.push('add'), onNew: () => calls.push('new'), onCancel: () => calls.push('cancel') }), renderTarget(root));
  });
  assert.match(text(root), /Found In band\.mid/);
  assert.match(text(root), /Speed 100 BPM · Walking/);
  assert.match(text(root), /Time Signature 3\/4/);
  assert.match(text(root), /1 note a real player can't play/, 'E0 is below the Double Bass');
  const selects = walk(root).filter(e => e.localName === 'select');
  const options = (s: StubElement) => walk(s).filter(e => e.localName === 'option').map(e => e._attrs['value'] ?? (e as unknown as { value: string }).value);
  assert.ok(!options(selects[0]!).includes('kit'), 'a pitched part offers no drums');
  assert.deepEqual(options(selects[1]!), ['kit', 'orch'], 'a drum part offers only drums');
  assert.match(text(root), /What Can't Come Across.*Pitch-wheel moves/);
  for (const b of ['Add As New Parts', 'Start A New Piece', 'Cancel']) await act(() => click(button(root, b)));
  assert.deepEqual(calls, ['add', 'new', 'cancel']);
  render(null, renderTarget(root));
});
