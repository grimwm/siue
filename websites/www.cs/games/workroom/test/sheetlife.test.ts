// One notation in the container, however many lanes were shown, and no
// resize listener left once the view is gone.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSheet } from '../src/sheetlife.ts';
import type { Container, Notation } from '../src/sheetlife.ts';

function setup() {
  const children: string[] = [];
  const host: Container = { get firstChild() { return children[0] ?? null; }, removeChild() { children.shift(); } };
  const listeners = new Set<() => void>();
  const win = { addEventListener: (_t: 'resize', f: () => void) => { listeners.add(f); }, removeEventListener: (_t: 'resize', f: () => void) => { listeners.delete(f); } };
  const log: string[] = [];
  const made: Notation[] = [];
  const make = (): Notation => {
    const n: Notation = {
      load: async xml => { log.push(`load ${xml}`); },
      render: () => { children.push('svg'); log.push('render'); },
      clear: () => { log.push('clear'); },
      mark: bar => { log.push(`mark ${bar}`); },
      layout: l => { log.push(`layout ${l.continuous ? 'continuous' : 'pages'} ${l.zoom}`); },
      preview: scale => { log.push(`preview ${scale}`); },
    };
    made.push(n);
    return n;
  };
  const sheet = createSheet(host, make, win, (xml, lane) => `${xml}:${lane ?? 'full'}`);
  return { sheet, children, listeners, log, made };
}

test('two lane switches leave one drawing and one resize listener', async () => {
  const s = setup();
  await s.sheet.show('xml', 'a');
  await s.sheet.show('xml', 'b');
  await s.sheet.show('xml', 'a');
  assert.equal(s.children.length, 1);
  assert.equal(s.listeners.size, 1);
  assert.equal(s.made.length, 3);
  assert.deepEqual(s.log.filter(l => l.startsWith('load')), ['load xml:a', 'load xml:b', 'load xml:a']);
  assert.equal(s.log.filter(l => l === 'clear').length, 2, 'each earlier notation is cleared');
});

test('dispose empties the container and removes the resize listener', async () => {
  const s = setup();
  await s.sheet.show('xml', 'a');
  s.sheet.dispose();
  assert.equal(s.children.length, 0);
  assert.equal(s.listeners.size, 0);
});

test('a resize redraws the current notation', async () => {
  const s = setup();
  await s.sheet.show('xml', 'a');
  const before = s.log.filter(l => l === 'render').length;
  for (const f of s.listeners) f();
  assert.equal(s.log.filter(l => l === 'render').length, before + 1);
});

test('a show that is overtaken while loading draws nothing', async () => {
  const s = setup();
  let release!: () => void;
  const slow: Notation = { load: () => new Promise<void>(r => { release = r; }), render: () => { s.children.push('svg'); }, clear: () => {} };
  const sheet = createSheet({ get firstChild() { return s.children[0] ?? null; }, removeChild() { s.children.shift(); } }, () => slow, { addEventListener: () => {}, removeEventListener: () => {} }, x => x);
  const pending = sheet.show('xml', 'a');
  sheet.dispose();
  release();
  await pending;
  assert.equal(s.children.length, 0);
});

test('a lit bar is drawn after every render, kept across a resize and a lane switch, and cleared with null', async () => {
  const s = setup();
  s.sheet.mark(7);
  await s.sheet.show('xml', 'a');
  assert.equal(s.log.at(-1), 'mark 7', 'a bar lit before the drawing arrives is lit once it is drawn');
  s.sheet.mark(9);
  assert.equal(s.log.at(-1), 'mark 9');
  for (const f of s.listeners) f();
  assert.deepEqual(s.log.slice(-2), ['render', 'mark 9']);
  await s.sheet.show('xml', 'b');
  assert.equal(s.log.at(-1), 'mark 9');
  s.sheet.mark(null);
  assert.equal(s.log.at(-1), 'mark null');
});

test('lighting a bar with nothing drawn yet touches no notation', () => {
  const s = setup();
  s.sheet.mark(3);
  assert.deepEqual(s.log, []);
});

test('the full score is a show with no lane', async () => {
  const s = setup();
  await s.sheet.show('xml', null);
  assert.deepEqual(s.log.filter(l => l.startsWith('load')), ['load xml:full']);
});

test('the layout is set before the first render, and a change redraws the drawing in place with its bar lit again', async () => {
  const s = setup();
  s.sheet.layout({ continuous: true, zoom: 1.5 });
  assert.equal(s.log.length, 0, 'nothing drawn yet, nothing touched');
  s.sheet.mark(4);
  await s.sheet.show('xml', 'a');
  assert.deepEqual(s.log.slice(-3), ['layout continuous 1.5', 'render', 'mark 4']);
  s.sheet.layout({ continuous: false, zoom: 1 });
  assert.deepEqual(s.log.slice(-3), ['layout pages 1', 'render', 'mark 4']);
  assert.equal(s.log.filter(l => l.startsWith('load')).length, 1, 'a layout change does not load the music again');
  for (const f of s.listeners) f();
  assert.deepEqual(s.log.slice(-3), ['layout pages 1', 'render', 'mark 4'], 'a resize keeps the layout');
  await s.sheet.show('xml', 'b');
  assert.ok(s.log.includes('layout pages 1'));
});

test('a pinch previews its scale on the drawing without drawing it again', async () => {
  const s = setup();
  s.sheet.preview(1.2);
  assert.equal(s.log.length, 0, 'nothing drawn, nothing to preview');
  await s.sheet.show('xml', 'a');
  const renders = s.log.filter(l => l === 'render').length;
  s.sheet.preview(1.2);
  assert.equal(s.log.at(-1), 'preview 1.2');
  assert.equal(s.log.filter(l => l === 'render').length, renders);
});

test('a layout kept for the next drawing leaves the current one alone', async () => {
  const s = setup();
  await s.sheet.show('xml', 'a');
  const renders = s.log.filter(l => l === 'render').length;
  s.sheet.layout({ continuous: false, zoom: 0.5 }, false);
  assert.equal(s.log.filter(l => l === 'render').length, renders);
  await s.sheet.show('xml', null);
  assert.ok(s.log.includes('layout pages 0.5'));
});
