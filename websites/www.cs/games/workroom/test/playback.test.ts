// The Player against a stub <audio> and the Sheet against a fake notation
// library: a seek during playback is never undone, a clip stops at its end, the
// frame loop ends with the Player, and switching lanes leaves one drawing.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { h, render } from 'preact';
import { act } from 'preact/test-utils';
import { fire, installDocument, makeEl, document as stubDocument, renderTarget, walk } from '../../_kit/test/dom-stub.ts';
import type { StubElement } from '../../_kit/test/dom-stub.ts';

installDocument();

// A manual frame clock: the Player's loop (and Preact's own effect flush) run when the test says.
const frames = new Map<number, (t: number) => void>();
let nextFrame = 1;
Object.assign(globalThis, {
  requestAnimationFrame: (cb: (t: number) => void) => { frames.set(nextFrame, cb); return nextFrame++; },
  cancelAnimationFrame: (id: number) => { frames.delete(id); },
});
const frame = (): void => { const run = [...frames.values()]; frames.clear(); for (const cb of run) cb(0); };

interface StubAudio extends StubElement { currentTime: number; paused: boolean; play(): Promise<void>; pause(): void; canPlayType(t: string): string }
const audios: StubAudio[] = [];
const asAudio = (el: StubElement): StubAudio => {
  const a = el as StubAudio;
  a.currentTime = 0;
  a.paused = true;
  a.canPlayType = () => 'maybe';
  a.play = () => { a.paused = false; fire(a, 'play'); return Promise.resolve(); };
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

const ui = await (await import('../../_kit/test/tsx.ts')).importTsx<{
  player: typeof import('../src/ui/Player.tsx');
  sheet: typeof import('../src/ui/Sheet.tsx');
}>(import.meta.dirname, { player: '../src/ui/Player.tsx', sheet: '../src/ui/Sheet.tsx' });
const { createSheet } = await import('../src/sheetlife.ts');

const SRC = [{ file: 'audio.webm' as const, type: 'audio/webm; codecs=opus' }];
const playerProps = (over: Record<string, unknown> = {}) => ({ src: SRC, audioSrc: (f: string) => f, time: 0, bar: null, onTime: () => {}, clip: null, onClipDone: () => {}, ...over });
const button = (root: StubElement, name: string): StubElement => walk(root).find(e => e.localName === 'button' && e.textContent === name)!;
const pending = (): number => frames.size;

test('a seek while playing writes the audio position at once and the old time never comes back', async () => {
  const root = makeEl('root');
  const reported: number[] = [];
  const seekRef: { current: ((t: number) => void) | null } = { current: null };
  await act(() => { render(h(ui.player.Player, playerProps({ onTime: (t: number) => reported.push(t), seekRef })), renderTarget(root)); });
  const audio = audios.at(-1)!;
  await act(() => { fire(button(root, 'Play'), 'click'); });
  audio.currentTime = 1;
  frame();
  assert.equal(reported.at(-1), 1);
  assert.ok(seekRef.current, 'the Player hands out its seek');
  seekRef.current!(5);
  assert.equal(audio.currentTime, 5, 'written in the same call');
  frame();
  frame();
  assert.deepEqual(reported.slice(-2), [5, 5]);
  assert.ok(!reported.slice(reported.indexOf(5)).includes(1), 'the old time did not return');
  assert.equal(button(root, 'Pause')?.textContent, 'Pause');
  render(null, renderTarget(root));
});

test('Hear it plays the clip and stops at its end', async () => {
  const root = makeEl('root');
  let done = 0;
  const clip = { from: 2, to: 4 };
  await act(() => { render(h(ui.player.Player, playerProps({ clip, onClipDone: () => { done++; } })), renderTarget(root)); });
  const audio = audios.at(-1)!;
  assert.equal(audio.currentTime, 2, 'starts at the clip start');
  assert.equal(audio.paused, false, 'and plays');
  await act(() => {});
  audio.currentTime = 3.9;
  frame();
  assert.equal(done, 0);
  audio.currentTime = 4.05;
  frame();
  assert.equal(audio.paused, true, 'paused at the end');
  assert.equal(done, 1);
  frame();
  assert.equal(done, 1, 'the loop ended');
  render(null, renderTarget(root));
});

test('unmounting ends the frame loop and drops the seek handle', async () => {
  const root = makeEl('root');
  const reported: number[] = [];
  const seekRef: { current: ((t: number) => void) | null } = { current: null };
  await act(() => { render(h(ui.player.Player, playerProps({ onTime: (t: number) => reported.push(t), seekRef })), renderTarget(root)); });
  await act(() => { fire(button(root, 'Play'), 'click'); });
  frame();
  const seen = reported.length;
  assert.ok(pending() > 0, 'a frame is waiting while playing');
  await act(() => { render(null, renderTarget(root)); });
  frames.clear(); // anything Preact itself queued
  assert.equal(seekRef.current, null);
  frame();
  assert.equal(reported.length, seen, 'nothing reported after unmount');
});

test('pausing cancels the frame loop', async () => {
  const root = makeEl('root');
  await act(() => { render(h(ui.player.Player, playerProps()), renderTarget(root)); });
  await act(() => { fire(button(root, 'Play'), 'click'); });
  await act(() => { fire(button(root, 'Pause'), 'click'); });
  frames.clear();
  const reported: number[] = [];
  frame();
  assert.deepEqual(reported, []);
  render(null, renderTarget(root));
});

// --- Sheet ---

const lanes = ['a', 'b'].map(id => ({ id, name: id, family: 'strings' as const, icon: 'strings' as const, color: '#112233' }));
const settle = async (): Promise<void> => { for (let i = 0; i < 6; i++) await act(() => new Promise<void>(r => setTimeout(r, 5))); };

test('switching lanes twice leaves one drawing, and leaving the view removes the resize listener', async () => {
  const listeners = new Set<() => void>();
  const win = { addEventListener: (_t: 'resize', f: () => void) => { listeners.add(f); }, removeEventListener: (_t: 'resize', f: () => void) => { listeners.delete(f); } };
  const shown: string[] = [];
  const ports = {
    fetchText: async () => '<xml/>',
    loadModule: async () => ({
      mountSheet: (el: HTMLElement) => createSheet(el as unknown as StubElement as never, host => ({
        load: async () => {},
        render: () => { const svg = stubDocument.createElement('svg'); (host as unknown as StubElement).appendChild(svg); },
        clear: () => {},
      }), win, (_x, lane) => { shown.push(lane); return ''; }),
    }),
  };
  const root = makeEl('root');
  const props = (laneId: string) => ({ musicxmlSrc: 'score.musicxml', laneId, lanes, onLane: () => {}, ports });
  await act(() => { render(h(ui.sheet.Sheet, props('a')), renderTarget(root)); });
  assert.match(root.textContent, /Loading sheet music/);
  await settle();
  const sheet = walk(root).find(e => e.id === 'sheet')!;
  assert.equal(sheet.children.length, 1);
  await act(() => { render(h(ui.sheet.Sheet, props('b')), renderTarget(root)); });
  await settle();
  await act(() => { render(h(ui.sheet.Sheet, props('a')), renderTarget(root)); });
  await settle();
  assert.deepEqual(shown, ['a', 'b', 'a']);
  assert.equal(sheet.children.length, 1, 'one drawing after two lane switches');
  assert.equal(listeners.size, 1);
  assert.doesNotMatch(root.textContent, /Loading sheet music/);
  await act(() => { render(null, renderTarget(root)); });
  await settle();
  assert.equal(listeners.size, 0, 'the resize listener is gone');
  assert.equal(sheet.children.length, 0);
});

test('a renderer that fails to load says so, readably', async () => {
  const ports = { fetchText: async () => '<xml/>', loadModule: async () => { throw new Error('The sheet music renderer did not load. Check the connection and reload the page.'); } };
  const root = makeEl('root');
  await act(() => { render(h(ui.sheet.Sheet, { musicxmlSrc: 'score.musicxml', laneId: 'a', lanes, onLane: () => {}, ports }), renderTarget(root)); });
  await settle();
  assert.match(root.textContent, /renderer did not load/);
  assert.doesNotMatch(root.textContent, /Loading sheet music/);
  render(null, renderTarget(root));
});
