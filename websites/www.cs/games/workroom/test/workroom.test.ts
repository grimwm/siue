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

const mount = async (): Promise<StubElement> => {
  const root = makeEl('root');
  await act(() => { render(h(ui.room.Workroom, { score, version: 1, versions: [1], audioSrc: (f: string) => f, onVersion: () => {} }), renderTarget(root)); });
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
    await act(() => new Promise<void>(r => setTimeout(r, 5)));
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
  const card = walk(root).find(e => e.className === 'card');
  assert.ok(card);
  assert.equal(globalThis.__scrolledTo, card);
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
