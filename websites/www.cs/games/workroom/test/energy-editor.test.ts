// Drawing the energy: the line as it is, dashed; a drag draws the new shape;
// Send this shape waits for a drawing and sends the whole curve; Start over
// brings the line back; a cancelled pointer draws nothing.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { h, render } from 'preact';
import { act } from 'preact/test-utils';
import { fire, installDocument, makeEl, renderTarget, walk } from '../../_kit/test/dom-stub.ts';
import type { StubElement } from '../../_kit/test/dom-stub.ts';
import { importTsx } from '../../_kit/test/tsx.ts';
import type { Score } from '../src/score.ts';
import { tempoMap } from '../src/tempo.ts';
import { fitView } from '../src/zoom.ts';

installDocument();
const ui = await importTsx<{ editor: typeof import('../src/ui/EnergyEditor.tsx') }>(import.meta.dirname, { editor: '../src/ui/EnergyEditor.tsx' });
const score = JSON.parse(readFileSync(new URL('./fixtures/score-v1.json', import.meta.url), 'utf8')) as Score;
const button = (root: StubElement, text: string) => walk(root).find(e => e.localName === 'button' && e.textContent === text)!;
const named = (root: StubElement, attr: string) => walk(root).filter(e => e._attrs[attr] !== undefined);

const mount = async (onSend: (c: [number, number][]) => void = () => {}, onHold?: (held: boolean) => void) => {
  const root = makeEl('root');
  await act(() => { render(h(ui.editor.EnergyEditor, { score, tempo: tempoMap(score), view: fitView(16, 720), busy: false, onSend, onHold, onCancel: () => {} }), renderTarget(root)); });
  return root;
};
const drag = async (svg: StubElement, points: [number, number][], end: 'pointerup' | 'pointercancel' = 'pointerup') => {
  const [first, ...rest] = points;
  await act(() => { fire(svg, 'pointerdown', { pointerId: 1, clientX: first![0], clientY: first![1] }); });
  for (const [x, y] of rest) await act(() => { fire(svg, 'pointermove', { pointerId: 1, clientX: x, clientY: y }); });
  await act(() => { fire(svg, end, { pointerId: 1, clientX: rest.at(-1)![0], clientY: rest.at(-1)![1] }); });
};

test('the drawing shows the energy now and waits for a shape', async () => {
  const root = await mount();
  const svg = named(root, 'data-energy-editor')[0]!;
  assert.equal(svg._attrs['data-guide'], 'energy-editor');
  assert.equal(svg._attrs['height'], String(160 + 20));
  assert.equal(named(root, 'data-energy-now').length, 1);
  assert.equal(named(root, 'data-energy-now')[0]!._attrs['stroke-dasharray'], '6 4');
  assert.equal(named(root, 'data-energy-drawn').length, 0);
  assert.equal(button(root, 'Send this shape').disabled, true);
  assert.equal(named(root, 'data-guide').some(e => e._attrs['data-guide'] === 'energy-actions'), true);
  assert.ok(walk(root).some(e => e._attrs['data-tick'] !== undefined), 'the time axis');
});

test('a drag draws a shape; Send sends the whole curve from 0 to the end', async () => {
  const sent: [number, number][][] = [];
  const root = await mount(c => sent.push(c));
  const svg = named(root, 'data-energy-editor')[0]!;
  await drag(svg, [[180, 150], [270, 80], [360, 10]]);
  assert.equal(named(root, 'data-energy-drawn').length, 1);
  assert.equal(button(root, 'Send this shape').disabled, false);
  await act(() => { fire(button(root, 'Send this shape'), 'click'); });
  const curve = sent[0]!;
  assert.deepEqual([curve[0]![0], curve.at(-1)![0]], [0, 16]);
  assert.ok(curve.some(([t, v]) => t === 8 && Math.abs(v - (1 - 10 / 160)) < 1e-9), 'the stroke is in it');
  assert.ok(curve.every(([, v]) => v >= 0 && v <= 1));
});

test('a stroke in progress holds the playhead\'s follow, and lets go when it ends or is cancelled', async () => {
  const holds: boolean[] = [];
  const root = await mount(() => {}, held => holds.push(held));
  const svg = named(root, 'data-energy-editor')[0]!;
  await act(() => { fire(svg, 'pointerdown', { pointerId: 1, clientX: 100, clientY: 100 }); });
  assert.deepEqual(holds, [true]);
  await act(() => { fire(svg, 'pointermove', { pointerId: 1, clientX: 200, clientY: 60 }); });
  await act(() => { fire(svg, 'pointerup', { pointerId: 1, clientX: 200, clientY: 60 }); });
  assert.deepEqual(holds, [true, false]);
  await act(() => { fire(svg, 'pointerdown', { pointerId: 1, clientX: 100, clientY: 100 }); });
  await act(() => { fire(svg, 'pointercancel', { pointerId: 1 }); });
  assert.deepEqual(holds, [true, false, true, false]);
  await act(() => { fire(svg, 'pointercancel', { pointerId: 1 }); });
  assert.deepEqual(holds, [true, false, true, false], 'a cancel with no stroke holds nothing');
});

test('Start over brings the line back; a cancelled pointer draws nothing', async () => {
  const root = await mount();
  const svg = named(root, 'data-energy-editor')[0]!;
  await drag(svg, [[100, 100], [200, 50]], 'pointercancel');
  assert.equal(named(root, 'data-energy-drawn').length, 0);
  await drag(svg, [[100, 100], [200, 50]]);
  await act(() => { fire(button(root, 'Start over'), 'click'); });
  assert.equal(named(root, 'data-energy-drawn').length, 0);
  assert.equal(button(root, 'Send this shape').disabled, true);
});
