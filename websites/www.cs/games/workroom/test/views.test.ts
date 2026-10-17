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
}>(import.meta.dirname, { tl: '../src/ui/Timeline.tsx', gl: '../src/ui/Glossary.tsx', tabs: '../src/ui/ViewTabs.tsx' });

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
