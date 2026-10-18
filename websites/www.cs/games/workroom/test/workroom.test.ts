// The whole Workroom against a stub <audio>: a pan made while paused stays where
// the owner left it, playing follows the playhead, Hear it starts the sound inside
// the tap, a refused or broken sound says so, an opened word is scrolled into
// view, and the page names its piece and links back.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { h, render } from 'preact';
import { act } from 'preact/test-utils';
import { fire, installDocument, makeEl, document as stubDocument, renderTarget, walk } from '../../_kit/test/dom-stub.ts';
import type { StubElement } from '../../_kit/test/dom-stub.ts';
import { importTsx } from '../../_kit/test/tsx.ts';
import { memoryStorage } from '../../_kit/test/record.ts';
import { guideStore } from '../src/guide.ts';
import type { Score } from '../src/score.ts';

installDocument();
Object.assign(globalThis, { window: { addEventListener() {}, removeEventListener() {} } });
const frames = new Map<number, (t: number) => void>();
let nextFrame = 1;
Object.assign(globalThis, {
  requestAnimationFrame: (cb: (t: number) => void) => { frames.set(nextFrame, cb); return nextFrame++; },
  cancelAnimationFrame: (id: number) => { frames.delete(id); },
});
const frame = (): void => { const run = [...frames.values()]; frames.clear(); for (const cb of run) cb(0); };

interface StubAudio extends StubElement { currentTime: number; paused: boolean; played: number; play(): Promise<void>; pause(): void; canPlayType(t: string): string }
let rejectPlay = false;
const audios: StubAudio[] = [];
const asAudio = (el: StubElement): StubAudio => {
  const a = el as StubAudio;
  a.currentTime = 0;
  a.paused = true;
  a.played = 0;
  a.canPlayType = () => 'maybe';
  a.play = () => {
    a.played++;
    if (rejectPlay) return Promise.reject(new Error('NotAllowedError'));
    a.paused = false;
    fire(a, 'play');
    return Promise.resolve();
  };
  a.pause = () => { a.paused = true; fire(a, 'pause'); };
  return a;
};
const originalNS = stubDocument.createElementNS;
const originalEl = stubDocument.createElement;
stubDocument.createElement = tag => (tag === 'audio' ? asAudio(originalEl(tag)) : originalEl(tag));
stubDocument.createElementNS = (ns, tag) => {
  const el = originalNS(ns, tag);
  if (tag !== 'audio') return el;
  const a = asAudio(el);
  audios.push(a);
  return a;
};

const ui = await importTsx<{ room: typeof import('../src/ui/Workroom.tsx') }>(import.meta.dirname, { room: '../src/ui/Workroom.tsx' });
const score = JSON.parse(readFileSync(new URL('./fixtures/score-v1.json', import.meta.url), 'utf8')) as Score;

const mount = async (extra: Record<string, unknown> = {}): Promise<StubElement> => {
  const root = makeEl('root');
  await act(() => { render(h(ui.room.Workroom, { score, version: 1, versions: [1], audioSrc: (f: string) => f, onVersion: () => {}, ...extra }), renderTarget(root)); });
  return root;
};
const named = (root: StubElement, attr: string): StubElement => walk(root).find(e => e._attrs[attr] !== undefined)!;
const button = (root: StubElement, text: string): StubElement => walk(root).find(e => e.localName === 'button' && e.textContent === text)!;
const ticks = (root: StubElement): string[] => walk(root).filter(e => e._attrs['data-tick'] !== undefined).map(e => e.textContent);
const unmount = (root: StubElement): void => { render(null, renderTarget(root)); };

/** Zoomed in about 7x, then dragged left so the view starts later than 0. */
const zoomAndPan = async (root: StubElement): Promise<void> => {
  const svg = named(root, 'data-timeline');
  await act(() => { fire(svg, 'wheel', { clientX: 100, deltaX: 0, deltaY: -400, ctrlKey: true }); });
  await act(() => { fire(svg, 'pointerdown', { pointerId: 1, clientX: 500, clientY: 120, timeStamp: 0 }); });
  await act(() => { fire(svg, 'pointermove', { pointerId: 1, clientX: 200, clientY: 120, timeStamp: 100 }); });
};

test('a pan or pinch made while paused stays where the owner left it on release', async () => {
  const root = await mount();
  const zoomed = ticks(root);
  await zoomAndPan(root);
  const panned = ticks(root);
  assert.notDeepEqual(panned, zoomed, 'the drag moved the view');
  assert.ok(panned.length > 0 && !panned.includes('1'), 'and the playhead at 0 is off screen');
  await act(() => { fire(named(root, 'data-timeline'), 'pointerup', { pointerId: 1, clientX: 200, clientY: 120, timeStamp: 200 }); });
  assert.deepEqual(ticks(root), panned, 'releasing did not snap back to the playhead');
  unmount(root);
});

test('while playing, the view follows the playhead again', async () => {
  const root = await mount();
  await zoomAndPan(root);
  const svg = named(root, 'data-timeline');
  await act(() => { fire(svg, 'pointerup', { pointerId: 1, clientX: 200, clientY: 120, timeStamp: 200 }); });
  const panned = ticks(root);
  await act(() => { fire(button(root, 'Play'), 'click'); });
  audios.at(-1)!.currentTime = 12;
  await act(() => { frame(); });
  assert.notDeepEqual(ticks(root), panned, 'the view moved to the playing time');
  assert.ok(walk(root).some(e => e._attrs['data-playhead'] !== undefined), 'the playhead is on screen');
  unmount(root);
});

const openWord = async (root: StubElement, id: string): Promise<void> => {
  const word = walk(root).find(e => e.localName === 'button' && e._attrs['data-term'] === id)!;
  await act(() => { fire(word, 'click'); });
};

test('Hear it starts the sound inside the tap, not in a later effect', async () => {
  const root = await mount();
  await openWord(root, 'motif');
  const audio = audios.at(-1)!;
  audio.played = 0;
  fire(button(root, 'Hear it'), 'click'); // no await: iOS only allows play() during the tap itself
  assert.equal(audio.played, 1, 'play() was called synchronously');
  assert.equal(audio.currentTime, 8, 'from the start of the clip');
  await act(() => {});
  assert.equal(audio.played, 1, 'and only once');
  unmount(root);
});

test('a refused play says so in plain words', async () => {
  const root = await mount();
  await openWord(root, 'motif');
  rejectPlay = true;
  try {
    fire(button(root, 'Hear it'), 'click');
    await act(() => new Promise<void>(r => setImmediate(r))); // the rejected play() settles in microtasks
  } finally { rejectPlay = false; }
  const alert = walk(root).find(e => e._attrs['role'] === 'alert');
  assert.ok(alert, 'a message is shown');
  assert.match(alert.textContent, /did not start|Tap Play/i);
  unmount(root);
});

test('audio that cannot be decoded says so', async () => {
  const root = await mount();
  assert.equal(walk(root).find(e => e._attrs['role'] === 'alert'), undefined);
  await act(() => { fire(audios.at(-1)!, 'error'); });
  const alert = walk(root).find(e => e._attrs['role'] === 'alert');
  assert.ok(alert);
  assert.match(alert.textContent, /could not play/i);
  unmount(root);
});

test('an opened word card is scrolled into view', async () => {
  const root = await mount();
  globalThis.__scrolledTo = null;
  await openWord(root, 'ostinato');
  const card = walk(root).find(e => e._attrs['data-card'] !== undefined);
  assert.ok(card);
  assert.equal(globalThis.__scrolledTo, card);
  unmount(root);
});

test('an opened card takes focus, and closing it returns focus to its word', async () => {
  const root = await mount();
  const word = walk(root).find(e => e.localName === 'button' && e._attrs['data-term'] === 'ostinato')!;
  word.focus();
  await act(() => { fire(word, 'click'); });
  const card = walk(root).find(e => e._attrs['data-card'] !== undefined)!;
  assert.ok(globalThis.__focused === card, 'the card has focus');
  await act(() => { fire(button(root, 'Close'), 'click'); });
  assert.ok(globalThis.__focused === word, 'the word has focus again');
  unmount(root);
});

test('the change list is numbered once, by its list markers', async () => {
  const root = await mount();
  const items = walk(root).filter(e => e.localName === 'li' && e._attrs['data-change'] !== undefined);
  assert.ok(items.length > 0);
  for (const li of items) {
    const where = walk(li).find(e => e._attrs['data-where'] !== undefined)!;
    assert.doesNotMatch(where.textContent, /^\d+\./, 'no number inside the button; the <ol> marker is the number');
  }
  unmount(root);
});

test('the page is headed by its piece and project, and its title names them', async () => {
  stubDocument.body.dataset = {};
  const root = await mount();
  const heading = walk(root).find(e => e.localName === 'h1')!;
  assert.equal(heading.textContent, score.piece.title);
  assert.match(root.textContent, new RegExp(score.project.name));
  assert.equal((globalThis.document as unknown as { title: string }).title, `${score.piece.title} – ${score.project.name}`);
  unmount(root);
});

test('the piece page: two columns from 1024 px, the notes in a sheet, a legend under the view', async () => {
  const root = await mount();
  const page = walk(root).find(e => (e._attrs['class'] ?? e.className ?? '').includes('lg:grid-cols-['))!;
  assert.ok(page, 'a grid that becomes two columns at lg');
  const sheet = named(root, 'data-sheet');
  assert.ok(walk(sheet).some(e => e._attrs['data-change'] !== undefined), 'the change list is in the sheet');
  assert.equal(named(root, 'data-legend').textContent, 'star = a note · higher = higher note · bigger = louder · glow = energy');
  assert.ok(named(root, 'data-guide'), 'the view stage is marked for the guide');
  unmount(root);
});

test('opening a word opens the notes sheet on a phone', async () => {
  const root = await mount();
  const handle = walk(named(root, 'data-sheet')).find(e => e._attrs['aria-expanded'] !== undefined)!;
  assert.equal(handle._attrs['aria-expanded'], 'false');
  await openWord(root, 'ostinato');
  assert.equal(handle._attrs['aria-expanded'], 'true');
  unmount(root);
});

test('on a phone the page keeps room under its content for the fixed sheet', async () => {
  const root = await mount();
  const page = walk(root).find(e => (e._attrs['class'] ?? e.className ?? '').includes('lg:grid-cols-['))!;
  const cls = (page._attrs['class'] ?? page.className ?? '').split(/\s+/);
  assert.ok(cls.some(c => /^pb-/.test(c)) && cls.some(c => /^lg:pb-/.test(c)), 'bottom padding below lg, none from lg');
  unmount(root);
});

test('a change that names one bar still has a 44 px tap target', async () => {
  const short = { ...score, changes: [{ ...score.changes[0]!, from_bar: 3, to_bar: 3 }] };
  const root = makeEl('root');
  await act(() => { render(h(ui.room.Workroom, { score: short, version: 1, versions: [1], audioSrc: (f: string) => f, onVersion: () => {} }), renderTarget(root)); });
  const where = walk(root).find(e => e._attrs['data-where'] !== undefined)!;
  assert.equal(where.textContent, 'Bar 3');
  const cls = (where._attrs['class'] ?? where.className ?? '').split(/\s+/);
  assert.ok(cls.includes('min-h-11') && cls.includes('min-w-11'), 'tall and wide enough for a thumb, whatever the label');
  unmount(root);
});

test('the drawing is measured again when the stage changes width without a window resize', async () => {
  const observed: { fire: () => void; observed: StubElement[]; disconnected: boolean }[] = [];
  class StubObserver {
    readonly entry = { fire: () => {}, observed: [] as StubElement[], disconnected: false };
    constructor(cb: () => void) { this.entry.fire = cb; observed.push(this.entry); }
    observe(el: StubElement): void { this.entry.observed.push(el); }
    disconnect(): void { this.entry.disconnected = true; }
  }
  Object.assign(globalThis, { ResizeObserver: StubObserver });
  try {
    const root = await mount();
    const stage = walk(root).find(e => e._attrs['data-guide'] === 'view')!;
    assert.equal(observed.length, 1, 'one observer');
    assert.deepEqual(observed[0]!.observed, [stage], 'it watches the stage');
    const drawing = (): number => Number(named(root, 'data-timeline')._attrs['width']);
    assert.equal(drawing(), 720);
    stage.getBoundingClientRect = () => ({ width: 600, height: 460 });
    await act(() => { observed[0]!.fire(); });
    assert.equal(drawing(), 600, 'the drawing follows the stage');
    unmount(root);
    assert.equal(observed[0]!.disconnected, true, 'leaving the page stops watching');
  } finally {
    delete (globalThis as { ResizeObserver?: unknown }).ResizeObserver;
  }
});

const overlay = (root: StubElement) => walk(root).find(e => e._attrs['data-guide-overlay'] !== undefined);

test('the guide opens by itself on a first visit, once, and Close gives focus to How to read this', async () => {
  const storage = memoryStorage();
  const root = await mount({ guide: guideStore(storage) });
  assert.ok(overlay(root), 'opened on the first visit');
  assert.equal(storage.data.get('workroom-guide-story'), 'seen');
  await act(() => { fire(button(root, 'Close'), 'click'); });
  assert.equal(overlay(root), undefined);
  assert.equal(globalThis.__focused?._attrs['data-guide-open'], '');
  unmount(root);
  const again = await mount({ guide: guideStore(storage) });
  assert.equal(overlay(again), undefined, 'never again by itself');
  await act(() => { fire(button(again, 'How to read this'), 'click'); });
  assert.ok(overlay(again), 'but on request');
  unmount(again);
});

test('without a guide store nothing opens by itself', async () => {
  const root = await mount();
  assert.equal(overlay(root), undefined);
  unmount(root);
});

test('storage that throws never breaks the page', async () => {
  const broken = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); }, removeItem() { throw new Error('blocked'); } };
  const root = await mount({ guide: guideStore(broken) });
  assert.ok(overlay(root), 'treated as not seen');
  unmount(root);
});

test('each view has its own first visit', async () => {
  const storage = memoryStorage({ 'workroom-guide-story': 'seen' });
  const root = await mount({ guide: guideStore(storage) });
  assert.equal(overlay(root), undefined);
  const rollTab = walk(root).find(e => e._attrs['role'] === 'tab' && e.textContent === 'Piano roll')!;
  await act(() => { fire(rollTab, 'click'); });
  assert.ok(overlay(root));
  assert.match(root.textContent, /Part 1 of 5/);
  unmount(root);
});

test('a demo’s Hear it pauses the piece first and plays the demo once; Close stops it', async () => {
  const log: string[] = [];
  const root = await mount({ playDemo: (id: string) => log.push(id), stopDemo: () => log.push('stop') });
  await act(() => { fire(button(root, 'Play'), 'click'); });
  const audio = audios[audios.length - 1]!;
  assert.equal(audio.paused, false);
  await act(() => { fire(button(root, 'How to read this'), 'click'); });
  for (let n = 1; n < 7; n++) await act(() => { fire(button(root, 'Next'), 'click'); });
  log.length = 0;
  await act(() => { fire(button(root, 'Hear it'), 'click'); });
  assert.deepEqual(log, ['stop', 'clicks'], 'any demo already sounding is stopped first');
  assert.equal(audio.paused, true);
  log.length = 0;
  await act(() => { fire(button(root, 'Back'), 'click'); });
  assert.deepEqual(log, ['stop'], 'moving on stops the demo');
  await act(() => { fire(button(root, 'Hear it'), 'click'); });
  log.length = 0;
  await act(() => { fire(button(root, 'Close'), 'click'); });
  assert.deepEqual(log, ['stop'], 'closing stops it');
  unmount(root);
});

test('a piece part’s Hear it plays the piece from the clip’s start; Next stops it and a demo stops it', async () => {
  const demos: string[] = [];
  const root = await mount({ playDemo: (id: string) => demos.push(id), stopDemo: () => {} });
  await act(() => { fire(button(root, 'How to read this'), 'click'); });
  const audio = audios[audios.length - 1]!;
  const before = audio.played;
  await act(() => { fire(button(root, 'Hear it'), 'click'); });
  assert.equal(audio.played, before + 1);
  assert.equal(audio.currentTime, 0, 'the first section starts at 0');
  assert.equal(audio.paused, false);
  await act(() => { fire(button(root, 'Next'), 'click'); });
  assert.equal(audio.paused, true, 'moving on stops the clip');
  unmount(root);
});
