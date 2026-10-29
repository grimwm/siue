// The console components: what they render, what they report, and the
// keyboard: tabs move with the arrows, Home and End; nothing answers Escape.
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { h, render } from 'preact';
import type { ComponentChild } from 'preact';
import { act } from 'preact/test-utils';
import { document as stubDocument, fire, installDocument, makeEl, renderTarget, walk } from '../../_kit/test/dom-stub.ts';
import type { StubElement } from '../../_kit/test/dom-stub.ts';
import { importTsx } from '../../_kit/test/tsx.ts';
import type { Score } from '../src/score.ts';
import { LEGENDS, legendFor } from '../src/tabs.ts';

installDocument();
const c = await importTsx<{
  button: typeof import('../src/ui/console/Button.tsx');
  tabs: typeof import('../src/ui/console/Tabs.tsx');
  chip: typeof import('../src/ui/console/Chip.tsx');
  panel: typeof import('../src/ui/console/Panel.tsx');
  sheet: typeof import('../src/ui/console/Sheet.tsx');
  readout: typeof import('../src/ui/console/Readout.tsx');
  legend: typeof import('../src/ui/console/Legend.tsx');
}>(import.meta.dirname, {
  button: '../src/ui/console/Button.tsx', tabs: '../src/ui/console/Tabs.tsx', chip: '../src/ui/console/Chip.tsx', panel: '../src/ui/console/Panel.tsx',
  sheet: '../src/ui/console/Sheet.tsx', readout: '../src/ui/console/Readout.tsx', legend: '../src/ui/console/Legend.tsx',
});
const mount = async (vnode: ComponentChild): Promise<StubElement> => {
  const root = makeEl('root');
  await act(() => { render(vnode, renderTarget(root)); });
  return root;
};
const classes = (e: StubElement): string[] => (e._attrs['class'] ?? e.className ?? '').split(/\s+/);

test('Button: a 44 px button of its variant that reports clicks and its pressed state', async () => {
  let n = 0;
  const root = await mount(h(c.button.Button, { variant: 'record', pressed: true, onClick: () => { n++; }, data: { 'data-x': '1' } }, 'Hum'));
  const b = walk(root).find(e => e.localName === 'button')!;
  assert.equal(b._attrs['type'], 'button');
  assert.ok(classes(b).includes('min-h-11') && classes(b).includes('min-w-11'));
  assert.ok(classes(b).includes('bg-record') && classes(b).includes('text-on-accent'));
  assert.equal(b._attrs['aria-pressed'], 'true');
  assert.equal(b._attrs['data-x'], '1');
  fire(b, 'click');
  assert.equal(n, 1);
});

test('Tabs: a tab list with one selected, roving focus, arrows, Home and End; Escape does nothing', async () => {
  const picked: string[] = [];
  const items = [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }, { id: 'c', label: 'C' }] as const;
  const root = await mount(h(c.tabs.Tabs, { label: 'Views', idPrefix: 'v', items, value: 'b', onChange: (id: string) => picked.push(id) }));
  const list = walk(root).find(e => e._attrs['role'] === 'tablist')!;
  assert.equal(list._attrs['aria-label'], 'Views');
  const tabs = walk(root).filter(e => e._attrs['role'] === 'tab');
  assert.deepEqual(tabs.map(t => t._attrs['aria-selected']), ['false', 'true', 'false']);
  assert.deepEqual(tabs.map(t => t._attrs['tabindex']), ['-1', '0', '-1']);
  assert.equal(tabs[1]!.id, c.tabs.tabId('v', 'b'));
  assert.equal(tabs[1]!._attrs['aria-controls'], c.tabs.panelId('v'));
  fire(tabs[1]!, 'keydown', { key: 'ArrowRight' });
  fire(tabs[1]!, 'keydown', { key: 'ArrowLeft' });
  fire(tabs[1]!, 'keydown', { key: 'Home' });
  fire(tabs[1]!, 'keydown', { key: 'End' });
  fire(tabs[1]!, 'keydown', { key: 'Escape' });
  fire(tabs[0]!, 'click');
  assert.deepEqual(picked, ['c', 'a', 'a', 'c', 'a']);
});

test('Tabs: the arrows wrap around the ends', async () => {
  const picked: string[] = [];
  const items = [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }];
  const root = await mount(h(c.tabs.Tabs, { label: 'T', idPrefix: 't', items, value: 'b', onChange: (id: string) => picked.push(id) }));
  const tabs = walk(root).filter(e => e._attrs['role'] === 'tab');
  fire(tabs[1]!, 'keydown', { key: 'ArrowRight' });
  assert.deepEqual(picked, ['a']);
});

test('Button: a pressed toggle is drawn filled amber, and unpressed it is drawn as its variant', async () => {
  const find = async (pressed: boolean) => walk(await mount(h(c.button.Button, { pressed, onClick: () => {} }, 'Loop'))).find(e => e.localName === 'button')!;
  const on = await find(true);
  assert.ok(classes(on).includes('bg-amber') && classes(on).includes('text-on-accent') && !classes(on).includes('bg-panel'), classes(on).join(' '));
  const off = await find(false);
  assert.ok(classes(off).includes('bg-panel') && !classes(off).includes('bg-amber'), classes(off).join(' '));
});

test('Chip: a glossary word carries its term; a toggle carries aria-pressed', async () => {
  let n = 0;
  const word = await mount(h(c.chip.Chip, { term: 'ostinato', onClick: () => { n++; } }, 'ostinato'));
  const w = walk(word).find(e => e.localName === 'button')!;
  assert.equal(w._attrs['data-term'], 'ostinato');
  assert.equal(w._attrs['aria-pressed'], undefined);
  fire(w, 'click');
  const toggle = await mount(h(c.chip.Chip, { pressed: false, onClick: () => {} }, 'Brass'));
  const t = walk(toggle).find(e => e.localName === 'button')!;
  assert.equal(t._attrs['aria-pressed'], 'false');
  assert.ok(classes(t).includes('min-h-11'));
  assert.equal(n, 1);
});

test('Chip: an inline word reads as text with a dotted accent underline and keeps a 44 px hit area without changing the line', async () => {
  const root = await mount(h(c.chip.Chip, { term: 'motif', inline: true, onClick: () => {} }, 'motif'));
  const w = walk(root).find(e => e.localName === 'button')!;
  const cls = classes(w);
  assert.ok(cls.includes('underline') && cls.includes('decoration-dotted') && cls.includes('decoration-amber'));
  assert.ok(!cls.includes('rounded-full') && !cls.includes('border-dashed') && !cls.includes('min-h-11'), 'no oval, no tall box');
  assert.ok(cls.includes('inline') && cls.includes('py-3') && cls.includes('-my-3'), 'padding and negative margin make the 44 px hit area, the line stays as tall as the text');
  assert.ok(cls.includes('[font:inherit]'));
});

test('Chip: a listed word is a compact single-line rounded-md chip, not an oval', async () => {
  const root = await mount(h(c.chip.Chip, { term: 'motif', onClick: () => {} }, 'motif'));
  const cls = classes(walk(root).find(e => e.localName === 'button')!);
  assert.ok(cls.includes('rounded-md') && cls.includes('whitespace-nowrap') && cls.includes('min-h-11'));
  assert.ok(!cls.includes('rounded-full'));
});

test('Panel: a section with an optional heading', async () => {
  const root = await mount(h(c.panel.Panel, { title: 'Words', data: { 'data-card': '' } }, 'body'));
  const s = walk(root).find(e => e.localName === 'section')!;
  assert.equal(s._attrs['data-card'], '');
  assert.equal(walk(root).find(e => e.localName === 'h2')!.textContent, 'Words');
});

test('Sheet: the phone handle says what it holds and opens or closes it', async () => {
  const toggles: boolean[] = [];
  const root = await mount(h(c.sheet.Sheet, { title: 'Words & changes', open: false, onToggle: (o: boolean) => toggles.push(o) }, 'inside'));
  const handle = walk(root).find(e => e.localName === 'button' && e._attrs['aria-expanded'] !== undefined)!;
  assert.equal(handle._attrs['aria-expanded'], 'false');
  assert.match(handle.textContent, /Words & changes/);
  assert.doesNotMatch(handle.textContent, /\d/, 'no bare number in the header');
  const body = walk(root).find(e => e._attrs['data-sheet-body'] !== undefined)!;
  assert.ok(classes(body).includes('hidden') && classes(body).includes('lg:grid'), 'closed on a phone, always shown from 1024 px');
  fire(handle, 'click');
  assert.deepEqual(toggles, [true]);
});

test('Readout: time always, as a fixed-width clock; the bar only on a music piece', async () => {
  const music = await mount(h(c.readout.Readout, { time: 1.5, bar: 3 }));
  assert.equal(walk(music).find(e => e._attrs['data-clock'] !== undefined)!.textContent, '0:01.50');
  assert.equal(walk(music).find(e => e._attrs['data-bar'] !== undefined)!.textContent, 'bar 3');
  const sound = await mount(h(c.readout.Readout, { time: 0.05, bar: null }));
  assert.equal(walk(sound).filter(e => e._attrs['data-bar'] !== undefined).length, 0);
});

test('Legend: only what each view draws', async () => {
  const music = JSON.parse(readFileSync(new URL('./fixtures/score-v1.json', import.meta.url), 'utf8')) as Score;
  const soundScore = JSON.parse(readFileSync(new URL('./fixtures/score-sound-v1.json', import.meta.url), 'utf8')) as Score;
  const noMotifs: Score = { ...music, motifs: [] };
  const withNotes: Score = { ...soundScore, notes: music.notes };
  assert.deepEqual(LEGENDS.roll, ['block = a note', 'higher = higher note', 'longer = held longer', 'colour = instrument']);
  assert.deepEqual(LEGENDS.sound, ['bottom = low sounds', 'top = high', 'brighter = louder']);
  assert.deepEqual(LEGENDS.sheet, ['five lines = a staff', 'higher on it = higher note']);
  assert.ok(music.motifs.length > 0);
  assert.deepEqual(legendFor('story', music), ['block = a note', 'star = a note', 'higher = higher note', 'bigger = louder', 'glow = energy'], 'music with motifs');
  assert.deepEqual(legendFor('story', noMotifs), ['block = a note', 'glow = energy'], 'music without motifs draws no stars');
  assert.deepEqual(legendFor('story', soundScore), ['row = a layer', 'coloured block = a moment', 'glow = strength over time'], 'sound without notes');
  assert.deepEqual(legendFor('story', withNotes), ['row = a layer', 'coloured block = a moment', 'block = a note', 'glow = strength over time'], 'sound with notes');
  for (const tab of ['roll', 'sound', 'sheet'] as const) assert.deepEqual(legendFor(tab, soundScore), LEGENDS[tab]);
  for (const l of legendFor('story', soundScore)) assert.doesNotMatch(l, /star|note|higher|bigger/, 'a sound has no stars or pitch rows');
  const root = await mount(h(c.legend.Legend, { items: legendFor('story', noMotifs) }));
  assert.equal(walk(root).find(e => e._attrs['data-legend'] !== undefined)!.textContent, 'block = a note · glow = energy');
});

test('Button: submit makes a submit button; otherwise it never submits a form', async () => {
  const plain = walk(await mount(h(c.button.Button, {}, 'Go'))).find(e => e.localName === 'button')!;
  const submit = walk(await mount(h(c.button.Button, { submit: true }, 'Unlock'))).find(e => e.localName === 'button')!;
  assert.equal(plain._attrs['type'], 'button');
  assert.equal(submit._attrs['type'], 'submit');
});

test('Panel: the heading names the panel when no label is given; a label wins', async () => {
  const titled = walk(await mount(h(c.panel.Panel, { title: 'Your notes' }, 'x'))).find(e => e.localName === 'section')!;
  assert.equal(titled._attrs['aria-label'], 'Your notes');
  const labelled = walk(await mount(h(c.panel.Panel, { title: 'Your notes', label: 'Notes for this piece' }, 'x'))).find(e => e.localName === 'section')!;
  assert.equal(labelled._attrs['aria-label'], 'Notes for this piece');
});

test('Sheet: the handle controls the body; open, the body is a grid on a phone too', async () => {
  const root = await mount(h(c.sheet.Sheet, { title: 'Notes & answers', open: true, onToggle: () => {} }, 'inside'));
  const handle = walk(root).find(e => e.localName === 'button' && e._attrs['aria-expanded'] !== undefined)!;
  const body = walk(root).find(e => e._attrs['data-sheet-body'] !== undefined)!;
  assert.equal(body.id, c.sheet.SHEET_BODY_ID);
  assert.equal(handle._attrs['aria-controls'], c.sheet.SHEET_BODY_ID);
  assert.equal(handle._attrs['aria-expanded'], 'true');
  assert.ok(classes(body).includes('grid') && !classes(body).includes('hidden'), 'open: shown at every width');
});

test('Tabs: the arrows, Home and End move the focus with the selection', async () => {
  const items = [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }, { id: 'c', label: 'C' }];
  const root = await mount(h(c.tabs.Tabs, { label: 'Views', idPrefix: 'f', items, value: 'b', onChange: () => {} }));
  const tabs = walk(root).filter(e => e._attrs['role'] === 'tab');
  fire(tabs[1]!, 'keydown', { key: 'ArrowRight' });
  assert.equal(stubDocument.activeElement, tabs[2]);
  fire(tabs[1]!, 'keydown', { key: 'Home' });
  assert.equal(stubDocument.activeElement, tabs[0]);
  fire(tabs[1]!, 'keydown', { key: 'End' });
  assert.equal(stubDocument.activeElement, tabs[2]);
  // The tabs move from the selected one (value), whichever button the key lands on.
  const first = await mount(h(c.tabs.Tabs, { label: 'Views', idPrefix: 'g', items, value: 'a', onChange: () => {} }));
  const wrap = walk(first).filter(e => e._attrs['role'] === 'tab');
  fire(wrap[0]!, 'keydown', { key: 'ArrowLeft' });
  assert.equal(stubDocument.activeElement, wrap[2], 'wraps');
});
