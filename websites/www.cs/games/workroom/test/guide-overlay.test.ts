// The guide overlay: one part at a time, Back and Next walk them, Hear it hands
// over the part's clip, every move stops what is sounding, focus starts on the
// card and Tab stays in it, Escape does nothing, Close is the only way out. And
// the demo player's tones and its stop.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { h, render } from 'preact';
import { act } from 'preact/test-utils';
import { fire, installDocument, makeEl, document as stubDocument, renderTarget, walk } from '../../_kit/test/dom-stub.ts';
import type { StubElement } from '../../_kit/test/dom-stub.ts';
import { importTsx } from '../../_kit/test/tsx.ts';
import { asAudioContext, fakeAudioContext, nodesOf } from '../../_kit/test/audio.ts';
import { createAudioCore } from '../../_kit/audio/core.ts';
import { DEMOS } from '../src/demo.ts';
import type { GuideClip, GuidePart } from '../src/guide.ts';

installDocument();
// Every key listener the overlay (or anything it mounts) puts on the window or the document, so the Escape test can press Escape at each.
const keyListeners: unknown[] = [];
const listen = (type: string, f: unknown): void => { if (type.startsWith('key')) keyListeners.push(f); };
Object.assign(globalThis, { window: { addEventListener: listen, removeEventListener() {} } });
const addToDocument = stubDocument.addEventListener;
stubDocument.addEventListener = (type, f) => { listen(type, f); addToDocument(type, f); };
const ui = await importTsx<{ g: typeof import('../src/ui/console/GuideOverlay.tsx'); d: typeof import('../src/ui/demo-player.ts') }>(
  import.meta.dirname, { g: '../src/ui/console/GuideOverlay.tsx', d: '../src/ui/demo-player.ts' });

const part = (id: string, clip: GuideClip): GuidePart => ({ id, title: `T ${id}`, what: `W ${id}`, like: `L ${id}`, spot: { anchor: 'view', rect: { x: 1, y: 2, w: 30, h: 40 } }, clip });
const PARTS = [part('a', { kind: 'piece', from: 1, to: 3 }), part('b', { kind: 'demo', id: 'clicks' }), part('c', { kind: 'demo', id: 'swell' })];
const button = (root: StubElement, text: string) => walk(root).find(e => e.localName === 'button' && e.textContent === text)!;
const isDisabled = (e: StubElement): boolean => e.disabled || e._attrs['disabled'] !== undefined;

const mount = async (onHear: (c: GuideClip) => void = () => {}, onClose: () => void = () => {}, onStop: () => void = () => {}) => {
  const root = makeEl('root');
  await act(() => { render(h(ui.g.GuideOverlay, { parts: PARTS, onHear, onClose, onStop, locate: () => ({ left: 10, top: 20, width: 30, height: 40 }) }), renderTarget(root)); });
  return root;
};

test('one part at a time; Back and Next walk them and stop at the ends', async () => {
  const root = await mount();
  assert.match(root.textContent, /Part 1 of 3/);
  assert.match(root.textContent, /T a/);
  assert.ok(isDisabled(button(root, 'Back')));
  await act(() => { fire(button(root, 'Next'), 'click'); });
  await act(() => { fire(button(root, 'Next'), 'click'); });
  assert.match(root.textContent, /Part 3 of 3/);
  assert.ok(isDisabled(button(root, 'Next')));
  await act(() => { fire(button(root, 'Back'), 'click'); });
  assert.match(root.textContent, /Part 2 of 3/);
});

test('the lit spot sits where locate puts it', async () => {
  const root = await mount();
  const spot = walk(root).find(e => e._attrs['data-guide-spot'] !== undefined)!;
  assert.deepEqual([spot.style['left'], spot.style['top'], spot.style['width'], spot.style['height']], ['10px', '20px', '30px', '40px']);
});

test('Hear it hands over the part’s clip and says it is playing', async () => {
  const heard: GuideClip[] = [];
  const root = await mount(c => heard.push(c));
  await act(() => { fire(button(root, 'Hear it'), 'click'); });
  assert.deepEqual(heard, [{ kind: 'piece', from: 1, to: 3 }]);
  assert.ok(walk(root).some(e => e.localName === 'button' && e.textContent === 'Playing…'));
  render(null, renderTarget(root));
});

test('Back, Next and Close each stop the sound', async () => {
  let stops = 0;
  const root = await mount(() => {}, () => {}, () => { stops++; });
  await act(() => { fire(button(root, 'Next'), 'click'); });
  assert.equal(stops, 1);
  await act(() => { fire(button(root, 'Back'), 'click'); });
  assert.equal(stops, 2);
  await act(() => { fire(button(root, 'Close'), 'click'); });
  assert.equal(stops, 3);
});

test('focus starts on the card; Escape does nothing, on the card or to any window or document key listener; Close calls onClose', async () => {
  let closed = 0;
  const root = await mount(() => {}, () => { closed++; });
  const card = walk(root).find(e => e._attrs['data-guide-card'] !== undefined)!;
  assert.equal(card._attrs['role'], 'dialog');
  assert.equal(globalThis.__focused, card);
  fire(card, 'keydown', { key: 'Escape' });
  const pressed = keyListeners.map(f => {
    const ev = { type: 'keydown', key: 'Escape', prevented: false, stopped: false, preventDefault() { ev.prevented = true; }, stopPropagation() { ev.stopped = true; } };
    (f as (e: typeof ev) => void)(ev);
    return ev;
  });
  assert.ok(pressed.every(ev => !ev.prevented && !ev.stopped), 'no global key listener takes Escape');
  assert.equal(closed, 0);
  assert.ok(walk(root).some(e => e._attrs['data-guide-card'] !== undefined));
  await act(() => { fire(button(root, 'Close'), 'click'); });
  assert.equal(closed, 1);
});

test('the demo player plays every tone of a demo', () => {
  const ctx = fakeAudioContext();
  const play = ui.d.demoPlayer(createAudioCore({ createContext: () => asAudioContext(ctx) }));
  play('clicks');
  const oscs = nodesOf(ctx, 'osc');
  assert.equal(oscs.length, 1 + 8, 'the unlock blip, then eight clicks');
  assert.deepEqual(oscs.slice(1).map(o => o.frequency.value), DEMOS.clicks.map(t => t.freq));
});

test('the demo player sets the audio session to playback before it schedules or unlocks', () => {
  const order: string[] = [];
  const session = { _t: '', get type() { return this._t; }, set type(v: string) { this._t = v; order.push(`type=${v}`); } };
  const had = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
  Object.defineProperty(globalThis, 'navigator', { value: { audioSession: session }, configurable: true });
  try {
    const ctx = fakeAudioContext();
    const core = createAudioCore({ createContext: () => { order.push('context'); return asAudioContext(ctx); } });
    ui.d.demoPlayer(core)('clicks');
    assert.equal(session.type, 'playback');
    assert.equal(order[0], 'type=playback', 'set before the context is made and the tones scheduled');
    assert.ok(nodesOf(ctx, 'osc').length > 1);
  } finally {
    if (had) Object.defineProperty(globalThis, 'navigator', had); else delete (globalThis as { navigator?: unknown }).navigator;
  }
});

test('a browser without an audio session still plays', () => {
  const had = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
  Object.defineProperty(globalThis, 'navigator', { value: {}, configurable: true });
  try {
    const ctx = fakeAudioContext();
    ui.d.demoPlayer(createAudioCore({ createContext: () => asAudioContext(ctx) }))('swell');
    assert.ok(nodesOf(ctx, 'osc').length > 1);
  } finally {
    if (had) Object.defineProperty(globalThis, 'navigator', had); else delete (globalThis as { navigator?: unknown }).navigator;
  }
});

test('playing a demo stops the one before; stop fades the current one', () => {
  const ctx = fakeAudioContext();
  const play = ui.d.demoPlayer(createAudioCore({ createContext: () => asAudioContext(ctx) }));
  play('clicks');
  const first = nodesOf(ctx, 'osc').slice(1);
  ctx.currentTime = 0.1;
  play('swell');
  assert.ok(first.every(o => o.stopped !== null && o.stopped <= 0.1 + 0.03 + 1e-9), 'the first demo is cut within 30 ms');
  const second = nodesOf(ctx, 'osc').slice(1 + 8);
  assert.equal(second.length, 1);
  ctx.currentTime = 0.2;
  play.stop();
  assert.ok(second[0]!.stopped! <= 0.2 + 0.03 + 1e-9);
  assert.doesNotThrow(() => play.stop());
});

test('focus stays in the card when Next or Back becomes disabled, and Tab stays in it', async () => {
  const root = await mount();
  const card = walk(root).find(e => e._attrs['data-guide-card'] !== undefined)!;
  const inCard = (e: unknown): boolean => e === card || walk(card).includes(e as StubElement);
  await act(() => { fire(button(root, 'Next'), 'click'); });
  await act(() => { fire(button(root, 'Next'), 'click'); });
  assert.ok(isDisabled(button(root, 'Next')));
  assert.ok(inCard(globalThis.__focused), 'focus is in the card, not lost with the disabled button');
  await act(() => { fire(button(root, 'Back'), 'click'); });
  await act(() => { fire(button(root, 'Back'), 'click'); });
  assert.ok(isDisabled(button(root, 'Back')));
  assert.ok(inCard(globalThis.__focused));
});
