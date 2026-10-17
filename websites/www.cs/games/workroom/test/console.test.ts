// The console components: what they render, what they report, and the
// keyboard: tabs move with the arrows, Home and End; nothing answers Escape.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { h, render } from 'preact';
import type { ComponentChild } from 'preact';
import { act } from 'preact/test-utils';
import { fire, installDocument, makeEl, renderTarget, walk } from '../../_kit/test/dom-stub.ts';
import type { StubElement } from '../../_kit/test/dom-stub.ts';
import { importTsx } from '../../_kit/test/tsx.ts';
import { LEGENDS } from '../src/tabs.ts';

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

test('Panel: a section with an optional heading', async () => {
  const root = await mount(h(c.panel.Panel, { title: 'Words', data: { 'data-card': '' } }, 'body'));
  const s = walk(root).find(e => e.localName === 'section')!;
  assert.equal(s._attrs['data-card'], '');
  assert.equal(walk(root).find(e => e.localName === 'h2')!.textContent, 'Words');
});

test('Sheet: the phone handle says what it holds and opens or closes it', async () => {
  const toggles: boolean[] = [];
  const root = await mount(h(c.sheet.Sheet, { title: 'Notes', count: 3, open: false, onToggle: (o: boolean) => toggles.push(o) }, 'inside'));
  const handle = walk(root).find(e => e.localName === 'button' && e._attrs['aria-expanded'] !== undefined)!;
  assert.equal(handle._attrs['aria-expanded'], 'false');
  assert.match(handle.textContent, /Notes.*3/);
  const body = walk(root).find(e => e._attrs['data-sheet-body'] !== undefined)!;
  assert.ok(classes(body).includes('hidden') && classes(body).includes('lg:grid'), 'closed on a phone, always shown from 1024 px');
  fire(handle, 'click');
  assert.deepEqual(toggles, [true]);
});

test('Readout: time always, the bar only on a music piece', async () => {
  const music = await mount(h(c.readout.Readout, { time: 1.5, bar: 3 }));
  assert.equal(walk(music).find(e => e._attrs['data-clock'] !== undefined)!.textContent, '1.5 s');
  assert.equal(walk(music).find(e => e._attrs['data-bar'] !== undefined)!.textContent, 'bar 3');
  const sound = await mount(h(c.readout.Readout, { time: 0.05, bar: null }));
  assert.equal(walk(sound).filter(e => e._attrs['data-bar'] !== undefined).length, 0);
});

test('Legend: the spec’s line for every view', async () => {
  assert.deepEqual(LEGENDS, {
    story: ['star = a note', 'higher = higher note', 'bigger = louder', 'glow = energy'],
    roll: ['bar = a note', 'higher = higher note', 'longer = held longer', 'colour = instrument'],
    sound: ['bottom = low sounds', 'top = high', 'brighter = louder'],
    sheet: ['each line is a staff; notes higher on it are higher'],
  });
  const root = await mount(h(c.legend.Legend, { items: LEGENDS.story }));
  assert.equal(walk(root).find(e => e._attrs['data-legend'] !== undefined)!.textContent, 'star = a note · higher = higher note · bigger = louder · glow = energy');
});
