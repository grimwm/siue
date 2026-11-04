// The composer against the DOM stub: the transport and the timeline's Title Case controls, every track closed on
// opening and the open one titled with its instrument, red notes that stay where they were put until Move Them Into
// Range, Mute All and Unmute All with their status line, Save Draft, the Sheet view and the Piece menu's exports, and
// Play starting on its first press however long the sound takes to build.
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
const settle = async (done: () => boolean = () => false): Promise<void> => {
  for (let i = 0; i < 40 && !done(); i++) { await new Promise(r => setTimeout(r, 50)); await act(async () => {}); }
};
const sampler = { ready: async () => {}, start: () => 1, stop() {}, stopAll() {} };
const text = (el: StubElement): string => el.textContent.replace(/\s+/g, ' ').trim();
/** A button by its words, or by its accessible name when it shows only a picture. */
const button = (root: StubElement, words: string): StubElement => {
  const b = walk(root).find(e => e.localName === 'button' && (text(e) === words || e._attrs['aria-label'] === words));
  assert.ok(b, `no button "${words}" in ${walk(root).filter(e => e.localName === 'button').map(e => text(e) || e._attrs['aria-label']).join(' | ')}`);
  return b;
};
const attr = (root: StubElement, name: string): StubElement[] => walk(root).filter(e => e._attrs[name] !== undefined);

test('the composer: the transport, closed tracks, the instrument as the title, red notes kept until Move Them Into Range, mutes and Save Draft', async () => {
  let doc = addPart(newDoc('My First Tune'), ENTRIES.find(e => e.id === 'violin')!)!.doc;
  doc = addNotes(doc, 'violin', [{ start: 0, length: 1, pitch: 24 }, { start: 1, length: 1, pitch: 67 }, { start: 2, length: 1, pitch: 69 }]).doc;
  doc = addPart(doc, ENTRIES.find(e => e.id === 'kit')!)!.doc;
  const saved: number[] = [];
  const api = { saveDraft: async (_piece: string, version: number) => { saved.push(version); return { status: 201, data: { version } }; } };
  const root = makeEl('root');
  await act(() => {
    render(h(ui.c.Composer, {
      start: { doc, piece: { id: 'my-first-tune', title: 'My First Tune' }, project: { id: 'my-pieces', name: 'My Pieces' }, version: 0 },
      entries: ENTRIES, api, sampler, buildSound: async () => { throw new Error('no sound here'); }, now: () => 0,
    }), renderTarget(root));
  });
  for (const words of ['Play', 'Back To Start', 'Loop', 'Undo', 'Redo', 'Save Draft', 'Piece Menu', 'Compose', 'Mix', 'Sheet',
    'Mute All', 'Unmute All', 'Expand All', 'Collapse All', 'Add Effect', 'Add Section', 'Add Instrument', 'Expand Violin', 'Mute Violin', 'Track Menu: Violin']) button(root, words);
  assert.equal(attr(root, 'data-grid').length, 0, 'every track starts closed');
  assert.equal(attr(root, 'data-region').length, 1, 'an old piece opens with a region over its notes');

  await act(() => click(button(root, 'Expand Violin')));
  assert.equal(text(attr(root, 'data-editor-title')[0]!), 'Violin· Piano Roll');
  for (const words of ['1/16', '1/8', 'Beat', '1/2', 'Bar', 'Type Notes', 'Select', 'Chords', 'Split', 'Fix Timing', 'Record', 'Move Them Into Range']) button(root, words);
  const ranges = () => attr(root, 'data-note-id').map(e => e._attrs['data-range']);
  assert.match(text(attr(root, 'data-out-of-range')[0]!), /^1 note is out of this instrument's range/);
  await act(() => click(button(root, 'Move Them Into Range')));
  assert.ok(!attr(root, 'data-out-of-range').length, 'no red notes left');
  await act(() => click(button(root, 'Undo')));
  assert.match(text(attr(root, 'data-out-of-range')[0]!), /^1 note is out/, 'Undo puts the red note back');
  assert.ok(ranges().length >= 2);

  await act(() => click(button(root, 'Expand Drum Kit')));
  assert.equal(text(attr(root, 'data-editor-title')[1]!), 'Drum Kit· Step Sequencer');
  await act(() => click(button(root, 'Collapse All')));
  assert.equal(attr(root, 'data-grid').length, 0);

  const heard = () => text(attr(root, 'data-mute-status')[0]!);
  assert.equal(heard(), 'All tracks will play.');
  await act(() => click(button(root, 'Mute Drum Kit')));
  assert.equal(heard(), 'Playing: Violin. Muted: Drum Kit.');
  button(root, 'Unmute Drum Kit');
  await act(() => click(button(root, 'Mute All')));
  assert.equal(heard(), 'All tracks are muted. Press Unmute on each track you want to hear.');
  await act(() => click(button(root, 'Unmute All')));
  assert.equal(heard(), 'All tracks will play.');

  await act(async () => { click(button(root, 'Save Draft')); await new Promise(r => setTimeout(r, 0)); });
  assert.deepEqual(saved, [1]);
  assert.equal(text(attr(root, 'data-status')[0]!), 'Saved as draft 1.');
  assert.match(text(attr(root, 'data-draft-line')[0]!), /^Draft 1 · 92 BPM · 4\/4$/);
  render(null, renderTarget(root));
});

test('Sheet shows every track on the timeline\'s scale, and the chosen track engraved behind its button, written as it is read, Concert Pitch as it sounds; the Piece menu exports', async () => {
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
  const sheetBoxes = () => attr(root, 'data-part-sheet').length;
  assert.equal(sheetBoxes(), 0, 'Compose first');
  await act(() => click(button(root, 'Sheet')));
  assert.equal(attr(root, 'data-sheet-row').length, 1, 'the horn on the staff view');
  assert.equal(attr(root, 'data-sheet-note').length, 1);
  assert.equal(sheetBoxes(), 0, 'engraved only when asked for');
  await act(() => click(button(root, 'Engraved Sheet Music'))); await settle(() => sheetBoxes() === 1 && shown.length === 1);
  assert.equal(sheetBoxes(), 1);
  assert.equal(shown.length, 1, text(walk(root).find(e => e._attrs['data-sheet-state'] !== undefined) ?? root));
  assert.equal(shown[0]!.lane, 'french-horn');
  assert.match(shown[0]!.xml, /<step>C<\/step><octave>4<\/octave>/, 'the horn in F is written a fifth up');
  await act(() => click(button(root, 'Concert Pitch: Off'))); await settle(() => shown.length === 2);
  assert.match(shown[shown.length - 1]!.xml, /<step>F<\/step><octave>3<\/octave>/);
  assert.doesNotMatch(shown[shown.length - 1]!.xml, /<transpose>/);

  await act(() => click(button(root, 'Piece Menu')));
  for (const words of ['Save Draft', 'Song', 'Start A Song', 'Colors And Style', 'Import Music File', 'Export MusicXML', 'Export MIDI', 'Markers']) button(root, words);
  await act(() => click(button(root, 'Export MIDI')));
  assert.equal(saved[0]!.name, 'horn-call.mid');
  assert.equal(new TextDecoder().decode(new Uint8Array(await saved[0]!.data.arrayBuffer()).slice(0, 4)), 'MThd');
  await act(() => click(button(root, 'Piece Menu')));
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

/**
 * An audio element as a browser's autoplay rule has it: play() is let through inside a press, or on an element already
 * played in one; any other play() is refused. `pressing` is true only while a click runs.
 */
let pressing = false;
const elements: FakeAudio[] = [];
class FakeAudio {
  src = '';
  currentTime = 0;
  paused = true;
  unlocked = false;
  plays: string[] = [];
  constructor(src = '') { this.src = src; elements.push(this); }
  addEventListener(): void {}
  pause(): void { this.paused = true; }
  play(): Promise<void> {
    if (pressing) this.unlocked = true;
    if (!this.unlocked) { this.plays.push(`refused ${this.src}`); return Promise.reject(new Error('NotAllowedError')); }
    this.plays.push(`played ${this.src}`);
    if (this.src) this.paused = false;
    return Promise.resolve();
  }
}
const press = (el: StubElement): void => { pressing = true; try { click(el); } finally { pressing = false; } };

test('Play plays on its first press however long the sound takes to build; a build replaced by Back To Start never plays', async () => {
  Object.assign(globalThis, { Audio: FakeAudio });
  let doc = addPart(newDoc('Slow Build'), ENTRIES.find(e => e.id === 'cello')!)!.doc;
  doc = addNotes(doc, 'cello', [{ start: 0, length: 4, pitch: 48 }, { start: 8, length: 4, pitch: 50 }]).doc;
  const builds: ((url: string) => void)[] = [];
  const buildSound = () => new Promise<{ url: string; channels: Float32Array[]; rate: number }>(r => builds.push(url => r({ url, channels: [new Float32Array(1)], rate: 48000 })));
  const root = makeEl('root');
  await act(() => {
    render(h(ui.c.Composer, {
      start: { doc, piece: { id: 'slow-build', title: 'Slow Build' }, project: { id: 'my-pieces', name: 'My Pieces' }, version: 0 },
      entries: ENTRIES, api: { saveDraft: async () => ({ status: 201, data: { version: 1 } }) }, sampler, buildSound, now: () => 0,
    }), renderTarget(root));
  });
  const play = () => walk(root).find(e => e._attrs['data-play'] !== undefined)!;
  const built = async (url: string) => act(async () => { builds.shift()!(url); });

  // One press; the build finishes long after it, outside the press.
  await act(() => press(play()));
  assert.equal(text(play()), 'Getting Ready…', 'the press shows the sound is on its way, beside Play');
  await built('blob:one');
  const one = elements.at(-1)!;
  assert.deepEqual(one.plays, ['played ', 'played blob:one'], 'played in the press, then let play once built');
  assert.equal(one.paused, false);
  assert.equal(text(play()), 'Stop');

  // Stop while it plays; then Play, and Back To Start while that build is pending: the replaced build never plays.
  await act(() => click(play()));
  assert.equal(one.paused, true);
  await act(() => press(play()));
  const stopped = elements.at(-1)!;
  await act(() => press(button(root, 'Back To Start')));
  const restarted = elements.at(-1)!;
  assert.notEqual(stopped, restarted, 'Back To Start while it builds starts again from the top');
  await built('blob:late');
  await built('blob:top');
  assert.ok(stopped.paused && !stopped.plays.some(p => p.includes('blob:')), 'a replaced build never plays');
  assert.deepEqual(restarted.plays, ['played ', 'played blob:top']);
  render(null, renderTarget(root));
});
