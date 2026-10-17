// The views are thin: the timeline draws what the layout says, a tap seeks to
// the hit time, a glossary word opens its two-line card, and Hear it plays the clip.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { h, render } from 'preact';
import { importTsx } from '../../_kit/test/tsx.ts';
import { fire, installDocument, makeEl, renderTarget, walk, type StubElement } from '../../_kit/test/dom-stub.ts';
import { tempoMap } from '../src/tempo.ts';
import { fitView } from '../src/zoom.ts';
import { term } from '../src/glossary.ts';
import { tabsFor } from '../src/tabs.ts';
import type { Score } from '../src/score.ts';

installDocument();
const ui = await importTsx<{
  tl: typeof import('../src/ui/Timeline.tsx');
  gl: typeof import('../src/ui/Glossary.tsx');
  tabs: typeof import('../src/ui/ViewTabs.tsx');
  roll: typeof import('../src/ui/PianoRoll.tsx');
}>(import.meta.dirname, { tl: '../src/ui/Timeline.tsx', gl: '../src/ui/Glossary.tsx', tabs: '../src/ui/ViewTabs.tsx', roll: '../src/ui/PianoRoll.tsx' });

const score = JSON.parse(readFileSync(new URL('./fixtures/score-v1.json', import.meta.url), 'utf8')) as Score;
const sound = JSON.parse(readFileSync(new URL('./fixtures/score-sound-v1.json', import.meta.url), 'utf8')) as Score;
const withAttr = (root: StubElement, name: string) => walk(root).filter(e => e._attrs[name] !== undefined);

test('the timeline draws sections, lanes and the motif ribbon', () => {
  const root = makeEl('root');
  render(h(ui.tl.Timeline, { score, tempo: tempoMap(score), view: fitView(16, 800), time: 0, onSeek: () => {}, onView: () => {}, onTerm: () => {} }), renderTarget(root));
  assert.deepEqual(withAttr(root, 'data-section').map(e => e._attrs['data-section']), ['stirs', 'thread']);
  assert.deepEqual(withAttr(root, 'data-lane').map(e => e._attrs['data-lane']), ['strings-low', 'brass']);
  assert.deepEqual(withAttr(root, 'data-motif').map(e => e._attrs['data-motif']), ['ariadne']);
  assert.match(root.textContent, /The Labyrinth stirs/);
});

test('a music timeline is ticked by bar', () => {
  const root = makeEl('root');
  render(h(ui.tl.Timeline, { score, tempo: tempoMap(score), view: fitView(16, 800), time: 0, onSeek: () => {}, onView: () => {}, onTerm: () => {} }), renderTarget(root));
  assert.deepEqual(withAttr(root, 'data-tick').map(e => e.textContent), ['1', '2', '3', '4', '5', '6', '7', '8']);
});

test('a sound effect fills the view, is ticked in milliseconds, and draws its layers and moments', () => {
  const root = makeEl('root');
  render(h(ui.tl.Timeline, { score: sound, tempo: tempoMap(sound), view: fitView(sound.duration, 800), time: 0, onSeek: () => {}, onView: () => {}, onTerm: () => {} }), renderTarget(root));
  assert.deepEqual(withAttr(root, 'data-tick').map(e => e.textContent), ['0 s', '50 ms', '100 ms', '150 ms', '200 ms', '250 ms', '300 ms', '350 ms']);
  assert.deepEqual(withAttr(root, 'data-lane').map(e => e._attrs['data-lane']), ['boom', 'air']);
  assert.deepEqual(withAttr(root, 'data-section').map(e => e._attrs['data-section']), ['blast', 'echo']);
  assert.deepEqual(withAttr(root, 'data-motif'), [], 'no characters, no ribbons');
});

test('a tap on a sound effect seeks to a time in seconds', () => {
  const root = makeEl('root');
  const seeks: number[] = [];
  render(h(ui.tl.Timeline, { score: sound, tempo: tempoMap(sound), view: fitView(sound.duration, 800), time: 0, onSeek: t => seeks.push(t), onView: () => {}, onTerm: () => {} }), renderTarget(root));
  const svg = withAttr(root, 'data-timeline')[0]!;
  fire(svg, 'pointerdown', { pointerId: 1, clientX: 400, clientY: 120, timeStamp: 0 });
  fire(svg, 'pointerup', { pointerId: 1, clientX: 400, clientY: 120, timeStamp: 50 });
  assert.equal(seeks.length, 1);
  assert.ok(Math.abs(seeks[0]! - 0.2) < 1e-9);
});

test('a glossary word in a section name is SVG text that opens its card, not a button', () => {
  const root = makeEl('root');
  const opened: string[] = [];
  const seeks: number[] = [];
  const s: Score = { ...score, sections: [{ ...score.sections[0]!, name: 'A Phrygian stir' }, score.sections[1]!] };
  render(h(ui.tl.Timeline, { score: s, tempo: tempoMap(s), view: fitView(16, 800), time: 0, onSeek: t => seeks.push(t), onView: () => {}, onTerm: id => opened.push(id) }), renderTarget(root));
  const word = withAttr(root, 'data-term')[0]!;
  assert.equal(word._attrs['data-term'], 'phrygian');
  assert.notEqual(word.localName, 'button', 'buttons do not belong inside an <svg>');
  assert.match(root.textContent, /A Phrygian stir/);
  fire(word, 'click');
  assert.deepEqual(opened, ['phrygian']);
  assert.deepEqual(seeks, []);
});

test('a tap on the timeline seeks to that time', () => {
  const root = makeEl('root');
  const seeks: number[] = [];
  render(h(ui.tl.Timeline, { score, tempo: tempoMap(score), view: fitView(16, 800), time: 0, onSeek: t => seeks.push(t), onView: () => {}, onTerm: () => {} }), renderTarget(root));
  const svg = withAttr(root, 'data-timeline')[0]!;
  fire(svg, 'pointerdown', { pointerId: 1, clientX: 450, clientY: 120, timeStamp: 0 });
  fire(svg, 'pointerup', { pointerId: 1, clientX: 450, clientY: 120, timeStamp: 50 });
  assert.deepEqual(seeks, [9]);
});

test('a glossary word opens a two-line card and Hear it plays the clip', () => {
  const root = makeEl('root');
  const heard: { from: number; to: number }[] = [];
  const t = term('ostinato')!;
  render(h(ui.gl.Card, { term: t, clip: { from: 0, to: 4 }, onHear: c => heard.push(c), onClose: () => {} }), renderTarget(root));
  assert.match(root.textContent, /repeated over and over/);
  const hear = walk(root).find(e => e.textContent === 'Hear it')!;
  fire(hear, 'click');
  assert.deepEqual(heard, [{ from: 0, to: 4 }]);
});

test('four view tabs for music', () => {
  const root = makeEl('root');
  const picked: string[] = [];
  render(h(ui.tabs.ViewTabs, { tabs: tabsFor(score), tab: 'story', onTab: t => picked.push(t) }), renderTarget(root));
  const buttons = walk(root).filter(e => e.localName === 'button');
  assert.deepEqual(buttons.map(b => b.textContent), ['Story', 'Piano roll', 'Sound picture', 'Sheet music']);
  fire(buttons[3]!, 'click');
  assert.deepEqual(picked, ['sheet']);
});

test('a sound effect has no Sheet music tab and no empty Piano roll', () => {
  const root = makeEl('root');
  render(h(ui.tabs.ViewTabs, { tabs: tabsFor(sound), tab: 'story', onTab: () => {} }), renderTarget(root));
  assert.deepEqual(walk(root).filter(e => e.localName === 'button').map(b => b.textContent), ['Story', 'Sound picture']);
  assert.doesNotMatch(root.textContent, /Sheet music|Piano roll/);
});

test('a view reports being held while a pointer is down, and lets go on up, cancel or a lost capture', () => {
  for (const release of ['pointerup', 'pointercancel', 'lostpointercapture']) {
    const root = makeEl('root');
    const held: boolean[] = [];
    render(h(ui.tl.Timeline, { score, tempo: tempoMap(score), view: fitView(16, 800), time: 0, onSeek: () => {}, onView: () => {}, onTerm: () => {}, onHold: (b: boolean) => held.push(b) }), renderTarget(root));
    const svg = withAttr(root, 'data-timeline')[0]!;
    fire(svg, 'pointerdown', { pointerId: 1, clientX: 10, clientY: 120, timeStamp: 0 });
    fire(svg, 'pointerdown', { pointerId: 2, clientX: 20, clientY: 120, timeStamp: 1 });
    assert.deepEqual(held, [true], 'one report for the first finger');
    fire(svg, release, { pointerId: 2, clientX: 20, clientY: 120, timeStamp: 5 });
    assert.deepEqual(held, [true], 'still held with one finger down');
    fire(svg, release, { pointerId: 1, clientX: 10, clientY: 120, timeStamp: 6 });
    assert.deepEqual(held, [true, false], release);
  }
});

test('a view unmounted with a pointer down lets go of the hold', async () => {
  const { act } = await import('preact/test-utils');
  const root = makeEl('root');
  const held: boolean[] = [];
  await act(() => { render(h(ui.tl.Timeline, { score, tempo: tempoMap(score), view: fitView(16, 800), time: 0, onSeek: () => {}, onView: () => {}, onTerm: () => {}, onHold: (b: boolean) => held.push(b) }), renderTarget(root)); });
  fire(withAttr(root, 'data-timeline')[0]!, 'pointerdown', { pointerId: 1, clientX: 10, clientY: 120, timeStamp: 0 });
  assert.deepEqual(held, [true]);
  await act(() => { render(null, renderTarget(root)); });
  assert.deepEqual(held, [true, false]);
});

test('a wheel over a view is only stopped when it moved the view, so the page still scrolls', async () => {
  const { act } = await import('preact/test-utils');
  const root = makeEl('root');
  const seen: unknown[] = [];
  const base = { score, tempo: tempoMap(score), time: 0, onSeek: () => {}, onTerm: () => {} };
  const mount = async (view: ReturnType<typeof fitView>) => {
    seen.length = 0;
    await act(() => { render(h(ui.tl.Timeline, { ...base, view, onView: (v: unknown) => seen.push(v) }), renderTarget(root)); });
    return withAttr(root, 'data-timeline')[0]!;
  };
  const wheel = (svg: StubElement, extra: Record<string, unknown>): boolean => {
    let prevented = false;
    fire(svg, 'wheel', { clientX: 100, deltaX: 0, deltaY: 0, ctrlKey: false, preventDefault: () => { prevented = true; }, ...extra });
    return prevented;
  };
  const fit = await mount(fitView(16, 800));
  assert.equal(wheel(fit, { deltaY: 120 }), false, 'a plain vertical scroll goes to the page');
  assert.equal(wheel(fit, { deltaX: 40 }), false, 'a sideways wheel on a view that shows everything moves nothing');
  assert.equal(wheel(fit, { deltaY: -200, ctrlKey: true }), true, 'a pinch zooms the view, not the page');
  const zoomed = await mount({ start: 4, pxPerSec: 100, width: 800 });
  assert.equal(wheel(zoomed, { deltaX: 40 }), true, 'a sideways wheel pans a zoomed view');
  assert.equal(wheel(zoomed, { deltaY: 120 }), false, 'a vertical scroll over it still scrolls the page');
});

test('every instrument family has its own icon in the timeline lane labels, named for the family', async () => {
  const { FAMILIES } = await import('../src/score.ts');
  const lanes = FAMILIES.map(f => ({ id: `lane-${f}`, name: `Lane ${f}`, family: f, icon: f, color: '#7a9cc6' }));
  const s: Score = { ...score, lanes, motifs: [], notes: [] };
  const root = makeEl('root');
  render(h(ui.tl.Timeline, { score: s, tempo: tempoMap(s), view: fitView(16, 800), time: 0, onSeek: () => {}, onView: () => {}, onTerm: () => {} }), renderTarget(root));
  const icons = withAttr(root, 'data-icon');
  assert.deepEqual(icons.map(e => e._attrs['data-icon']), [...FAMILIES]);
  const drawn = new Set<string>();
  for (const icon of icons) {
    const family = icon._attrs['data-icon']!;
    assert.match(icon._attrs['aria-label']!, new RegExp(family));
    assert.equal(icon._attrs['role'], 'img');
    const d = walk(icon).map(e => e._attrs['d'] ?? e._attrs['points'] ?? `${e.localName}:${e._attrs['cx'] ?? ''}${e._attrs['cy'] ?? ''}${e._attrs['rx'] ?? ''}${e._attrs['x'] ?? ''}`).join('|');
    assert.ok(d.length > 0, `${family} draws something`);
    drawn.add(d);
  }
  assert.equal(drawn.size, FAMILIES.length, 'no two families share a drawing');
});

test('a piano roll with no C in its range still shows pitch names', () => {
  const root = makeEl('root');
  const narrow: Score = { ...score, notes: [62, 64].map((pitch, i) => ({ lane: 'brass', start: i, length: 1, pitch, velocity: 80, motif: null })) };
  render(h(ui.roll.PianoRoll, { score: narrow, tempo: tempoMap(narrow), view: fitView(16, 800), time: 0, onSeek: () => {}, onView: () => {} }), renderTarget(root));
  const names = walk(root).filter(e => e.className === 'pitch-name').map(e => e.textContent);
  assert.deepEqual(names, ['F4', 'C#4']);
});
