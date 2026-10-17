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
    };
    made.push(n);
    return n;
  };
  const sheet = createSheet(host, make, win, (xml, lane) => `${xml}:${lane}`);
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
