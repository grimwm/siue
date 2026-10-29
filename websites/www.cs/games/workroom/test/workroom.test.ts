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
  assert.equal(named(root, 'data-legend').textContent, 'block = a note · star = a note · higher = higher note · bigger = louder · glow = energy');
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
  assert.ok(cls.includes('relative') && cls.includes('z-10'), 'paints above the inline word beside it, so a word never steals its taps');
  const li = walk(root).find(e => e._attrs['data-change'] !== undefined && e.localName === 'li')!;
  assert.ok((li._attrs['class'] ?? li.className ?? '').split(/\s+/).includes('leading-8'), 'a line tall enough that a word’s 44 px hit area stays within half a line gap of its text');
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

test('a piece part’s Hear it plays the piece from the clip’s start; Next stops it', async () => {
  const root = await mount();
  await act(() => { fire(button(root, 'How to read this'), 'click'); });
  const audio = audios[audios.length - 1]!;
  audio.currentTime = 5;
  const before = audio.played;
  await act(() => { fire(button(root, 'Hear it'), 'click'); });
  assert.equal(audio.played, before + 1);
  assert.equal(audio.currentTime, 0, 'the first section starts at 0');
  assert.equal(audio.paused, false);
  await act(() => { fire(button(root, 'Next'), 'click'); });
  assert.equal(audio.paused, true, 'moving on stops the clip');
  unmount(root);
});

test('Next and Close leave the owner’s own music playing; a demo’s Hear it pauses it', async () => {
  const log: string[] = [];
  const root = await mount({ playDemo: (id: string) => log.push(id), stopDemo: () => log.push('stop') });
  await act(() => { fire(button(root, 'Play'), 'click'); });
  const audio = audios[audios.length - 1]!;
  await act(() => { fire(button(root, 'How to read this'), 'click'); });
  await act(() => { fire(button(root, 'Next'), 'click'); });
  await act(() => { fire(button(root, 'Back'), 'click'); });
  assert.equal(audio.paused, false, 'the music plays on while the guide is walked');
  await act(() => { fire(button(root, 'Close'), 'click'); });
  assert.equal(audio.paused, false, 'and after it closes');
  await act(() => { fire(button(root, 'How to read this'), 'click'); });
  for (let n = 1; n < 7; n++) await act(() => { fire(button(root, 'Next'), 'click'); });
  await act(() => { fire(button(root, 'Hear it'), 'click'); });
  assert.equal(audio.paused, true, 'a demo pauses the piece');
  unmount(root);
});

/** A stage whose width the test sets, then the observer is fired. */
const resizeTo = async (root: StubElement, observers: { fire: () => void }[], width: number): Promise<void> => {
  const stage = walk(root).find(e => e._attrs['data-guide'] === 'view')!;
  stage.getBoundingClientRect = () => ({ width, height: 460 });
  await act(() => { observers[0]!.fire(); });
};
const withObserver = async (run: (observers: { fire: () => void }[]) => Promise<void>): Promise<void> => {
  const observers: { fire: () => void }[] = [];
  class Obs { constructor(cb: () => void) { observers.push({ fire: cb }); } observe(): void {} disconnect(): void {} }
  Object.assign(globalThis, { ResizeObserver: Obs });
  try { await run(observers); } finally { delete (globalThis as { ResizeObserver?: unknown }).ResizeObserver; }
};
const sound = JSON.parse(readFileSync(new URL('./fixtures/score-sound-v1.json', import.meta.url), 'utf8')) as Score;
const lastSection = (root: StubElement): { right: number } => {
  const rects = walk(root).filter(e => e._attrs['data-section'] !== undefined);
  const el = rects.at(-1)!;
  const parent = walk(root).find(e => e.children?.includes(el)) ?? el;
  return { right: Number(parent._attrs['x']) + Number(parent._attrs['width']) };
};

test('the Story opens with the whole piece in the width the stage measures, at 390, 320 and 1280', async () => {
  for (const sc of [score, sound]) for (const width of [390, 320, 1280]) {
    await withObserver(async observers => {
      const root = makeEl('root');
      await act(() => { render(h(ui.room.Workroom, { score: sc, version: 1, versions: [1], audioSrc: (f: string) => f, onVersion: () => {} }), renderTarget(root)); });
      await resizeTo(root, observers, width);
      assert.equal(Number(named(root, 'data-timeline')._attrs['width']), width);
      const end = lastSection(root).right;
      assert.ok(end <= width + 1, `${sc.kind} at ${width}: the last section ends inside the drawing (${end})`);
      assert.ok(end >= width * 0.5, `${sc.kind} at ${width}: and the piece is not squeezed into a corner (${end})`);
      assert.ok(end > width - 1, `${sc.kind} runs to the right edge`);
      unmount(root);
    });
  }
});

test('the stage measured after the first draw refits a piece the owner has not zoomed; a zoomed one keeps its zoom', async () => {
  await withObserver(async observers => {
    const root = await mount();
    await resizeTo(root, observers, 390);
    const secs = walk(root).filter(e => e._attrs['data-section'] !== undefined);
    assert.ok(secs.length >= 2);
    assert.ok(lastSection(root).right <= 391 && lastSection(root).right > 380, `the 8 bars fill 390 px, got ${lastSection(root).right}`);
    await zoomAndPan(root);
    const before = ticks(root);
    await resizeTo(root, observers, 360);
    assert.ok(before.length > 0);
    assert.ok(lastSection(root).right > 360 * 2, 'still zoomed in after a resize');
    unmount(root);
  });
});

test('the How to read this button is a visible secondary button with an icon, 44 px tall', async () => {
  const root = await mount();
  const b = button(root, 'How to read this');
  const cls = (b._attrs['class'] ?? b.className ?? '').split(/\s+/);
  assert.ok(cls.includes('min-h-11') && cls.includes('bg-panel') && cls.includes('border-rule'), 'secondary variant');
  const svg = walk(b).find(e => e.localName === 'svg')!;
  assert.equal(svg._attrs['aria-hidden'], 'true');
  unmount(root);
});

test('the notes panel is "Notes & answers"; the change count is on the changes heading only', async () => {
  const root = await mount();
  const aside = named(root, 'data-sheet');
  assert.equal(aside._attrs['aria-label'], 'Notes & answers');
  assert.doesNotMatch(walk(aside).find(e => e.localName === 'h2')!.textContent, /\d/);
  assert.match(aside.textContent, /Claude's changes\s*1 change(?!s)/);
  const many = makeEl('root');
  const two = { ...score, changes: [score.changes[0]!, score.changes[0]!] };
  await act(() => { render(h(ui.room.Workroom, { score: two, version: 1, versions: [1], audioSrc: (f: string) => f, onVersion: () => {} }), renderTarget(many)); });
  assert.match(named(many, 'data-sheet').textContent, /2 changes/);
  unmount(root); unmount(many);
});

test('a sound piece’s Story legend describes layers and moments, not stars', async () => {
  const root = makeEl('root');
  await act(() => { render(h(ui.room.Workroom, { score: sound, version: 1, versions: [1], audioSrc: (f: string) => f, onVersion: () => {} }), renderTarget(root)); });
  const legend = named(root, 'data-legend').textContent;
  assert.match(legend, /row = a layer/);
  assert.doesNotMatch(legend, /star|higher/);
  unmount(root);
});

const withMedia = async (wide: boolean, run: () => Promise<void>): Promise<void> => {
  const had = Object.getOwnPropertyDescriptor(globalThis, 'matchMedia');
  Object.defineProperty(globalThis, 'matchMedia', { value: (q: string) => ({ matches: wide && q === '(min-width: 1024px)' }), configurable: true });
  try { await run(); } finally { if (had) Object.defineProperty(globalThis, 'matchMedia', had); else delete (globalThis as { matchMedia?: unknown }).matchMedia; }
};

const tapWhere = async (wide: boolean): Promise<{ expanded: string | undefined; scrolls: unknown[] }> => {
  let out = { expanded: undefined as string | undefined, scrolls: [] as unknown[] };
  await withMedia(wide, async () => {
    const root = await mount();
    const stage = named(root, 'data-guide');
    const scrolls: unknown[] = [];
    (stage as unknown as { scrollIntoView(o: unknown): void }).scrollIntoView = o => { scrolls.push(o); };
    const handle = walk(named(root, 'data-sheet')).find(e => e._attrs['aria-expanded'] !== undefined)!;
    await act(() => { fire(handle, 'click'); });
    assert.equal(handle._attrs['aria-expanded'], 'true');
    await act(() => { fire(named(root, 'data-where'), 'click'); });
    out = { expanded: handle._attrs['aria-expanded'], scrolls };
    unmount(root);
  });
  return out;
};

test('at phone width a where tap closes the bottom sheet and scrolls the stage into view', async () => {
  const r = await tapWhere(false);
  assert.equal(r.expanded, 'false');
  assert.deepEqual(r.scrolls, [{ block: 'nearest' }]);
});

test('at desktop width a where tap leaves the side column alone', async () => {
  const r = await tapWhere(true);
  assert.equal(r.expanded, 'true');
  assert.deepEqual(r.scrolls, []);
});

test('a sound piece’s Story guide opens by itself even when the music Story guide was seen', async () => {
  const storage = memoryStorage({ 'workroom-guide-story': 'seen' });
  const root = makeEl('root');
  await act(() => { render(h(ui.room.Workroom, { score: sound, version: 1, versions: [1], audioSrc: (f: string) => f, onVersion: () => {}, guide: guideStore(storage) }), renderTarget(root)); });
  assert.ok(overlay(root), 'first visit for a sound piece');
  assert.equal(storage.data.get('workroom-guide-sound-story'), 'seen');
  unmount(root);
});

test("a change note's everyday \"rest\" is plain text, not a glossary word", async () => {
  const changes = [{ from_bar: 1, to_bar: 2, lane: null, text: 'Quieter, then a quarter rest; keep the rest of the piece.', answers: [] }];
  const root = await mount({ score: { ...score, changes } });
  const note = walk(root).find(e => e.localName === 'li' && e._attrs['data-change'] === '0')!;
  assert.match(note.textContent, /keep the rest of the piece/);
  assert.deepEqual(walk(note).filter(e => e._attrs['data-term'] !== undefined).map(e => e.textContent), ['quarter rest'], 'only the musical phrase links');
  unmount(root);
});

// --- A draft played from its score ---

const parsedRenderable = (await import('../src/score.ts')).parseScore(JSON.parse(readFileSync(new URL('./fixtures/score-renderable-v1.json', import.meta.url), 'utf8')));
assert.ok(parsedRenderable.ok);
const renderableScore = parsedRenderable.score;

test('a draft with no audio file is built once, says so while it builds, then plays the built sound', async () => {
  const asked: string[] = [];
  let finish!: (s: { url: string; channels: Float32Array[]; rate: number }) => void;
  const buildSound = (key: string, _s: Score, onStage: (s: 'instruments' | 'rendering' | 'finishing') => void) => {
    asked.push(key);
    onStage('rendering');
    return new Promise<{ url: string; channels: Float32Array[]; rate: number }>(r => { finish = r; });
  };
  const before = audios.length;
  const root = await mount({ score: renderableScore, version: 3, versions: [3], buildSound });
  assert.deepEqual(asked, [`${renderableScore.piece.id}/v3`]);
  assert.match(root.textContent, /Building the sound…/);
  assert.equal(audios.length, before, 'nothing to play yet');
  await act(async () => { finish({ url: 'blob:built', channels: [new Float32Array(8)], rate: 48000 }); });
  assert.doesNotMatch(root.textContent, /Building the sound/);
  assert.equal(audios.at(-1)!.getAttribute('src'), 'blob:built');
  assert.equal(button(root, 'Play').disabled, false);
  assert.ok(walk(root).some(e => e.localName === 'a' && e.textContent === 'Audio (WAV)' && e.getAttribute('download') === `${renderableScore.piece.id}-v3.wav`));
  assert.deepEqual(asked.length, 1, 'built once');
  unmount(root);
});

test('a sound that could not be built says why, Play is disabled, and the other views still work', async () => {
  const root = await mount({ score: renderableScore, buildSound: () => Promise.reject(new Error('the sample library\'s index could not be loaded: the server answered 404')) });
  await act(async () => {});
  assert.match(root.textContent, /The sound could not be built: the sample library's index could not be loaded: the server answered 404/);
  assert.equal(button(root, 'Play').disabled, true);
  assert.ok(!walk(root).some(e => e.localName === 'a' && e.textContent === 'Audio (WAV)'), 'no audio to download');
  await act(() => { fire(button(root, 'Piano roll'), 'click'); });
  assert.ok(walk(root).some(e => e._attrs['data-note'] !== undefined), 'the piano roll draws its notes');
  unmount(root);
});

test('a draft with audio files plays them and never builds', async () => {
  let builds = 0;
  const root = await mount({ buildSound: () => { builds++; return new Promise(() => {}); } });
  assert.equal(builds, 0);
  assert.equal(audios.at(-1)!.getAttribute('src'), 'audio.webm');
  assert.doesNotMatch(root.textContent, /Building the sound/);
  unmount(root);
});
