// Pinning on the Story view: in select mode a drag picks a span (bars, seconds
// and the lane when both ends are in one) with a live preview, a tap picks a
// moment and still moves the playhead, a second finger drops the preview; the
// owner's notes are drawn numbered in their lanes.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { h, render } from 'preact';
import { act } from 'preact/test-utils';
import { fire, installDocument, makeEl, renderTarget, walk } from '../../_kit/test/dom-stub.ts';
import type { StubElement } from '../../_kit/test/dom-stub.ts';
import { importTsx } from '../../_kit/test/tsx.ts';
import type { Span } from '../src/hit.ts';
import type { Score } from '../src/score.ts';
import { tempoMap } from '../src/tempo.ts';
import { fitView } from '../src/zoom.ts';

installDocument();
const ui = await importTsx<{ tl: typeof import('../src/ui/Timeline.tsx') }>(import.meta.dirname, { tl: '../src/ui/Timeline.tsx' });
const score = JSON.parse(readFileSync(new URL('./fixtures/score-v1.json', import.meta.url), 'utf8')) as Score;
const close = (a: number, b: number) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≈ ${b}`);

interface Run { root: StubElement; picks: [Span | null, boolean][]; seeks: number[]; views: number }
const mount = async (extra: Record<string, unknown> = {}, select = true): Promise<Run> => {
  const run: Run = { root: makeEl('root'), picks: [], seeks: [], views: 0 };
  await act(() => {
    render(h(ui.tl.Timeline, {
      score, tempo: tempoMap(score), view: fitView(16, 720), time: 0, onSeek: (t: number) => run.seeks.push(t), onView: () => { run.views++; }, onTerm: () => {},
      select: select ? { span: null, onPick: (s: Span | null, done: boolean) => run.picks.push([s, done]) } : undefined, ...extra,
    }), renderTarget(run.root));
  });
  return run;
};
const svgOf = (r: Run) => walk(r.root).find(e => e._attrs['data-timeline'] !== undefined)!;
const at = (x: number, y: number, t: number, id = 1) => ({ pointerId: id, clientX: x, clientY: y, timeStamp: t });

test('a drag in select mode picks a span with its bars and lane, previewed as it goes, and pans nothing', async () => {
  const r = await mount();
  const svg = svgOf(r);
  await act(() => { fire(svg, 'pointerdown', at(360, 120, 0)); });
  await act(() => { fire(svg, 'pointermove', at(500, 120, 50)); });
  await act(() => { fire(svg, 'pointermove', at(612, 120, 100)); });
  await act(() => { fire(svg, 'pointerup', at(612, 120, 150)); });
  assert.equal(r.views, 0);
  assert.ok(r.picks.length >= 2 && r.picks.slice(0, -1).every(([, done]) => !done), 'previews before the end');
  const [span, done] = r.picks.at(-1)!;
  assert.equal(done, true);
  close(span!.from, 8);
  close(span!.to, 13.6);
  assert.deepEqual([span!.fromBar, span!.toBar, span!.laneId], [5, 7, 'brass']);
});

test('a drag keeps the lane only when it starts and ends in the same lane', async () => {
  const r = await mount();
  const svg = svgOf(r);
  await act(() => { fire(svg, 'pointerdown', at(360, 120, 0)); });
  await act(() => { fire(svg, 'pointermove', at(500, 85, 50)); });
  await act(() => { fire(svg, 'pointerup', at(612, 80, 100)); });
  const diagonal = r.picks.at(-1)![0]!;
  assert.deepEqual([diagonal.fromBar, diagonal.toBar, diagonal.laneId], [5, 7, null], 'brass to the strings below: no lane');
  await act(() => { fire(svg, 'pointerdown', at(360, 115, 200)); });
  await act(() => { fire(svg, 'pointermove', at(500, 140, 250)); });
  await act(() => { fire(svg, 'pointerup', at(612, 145, 300)); });
  assert.equal(r.picks.at(-1)![0]!.laneId, 'brass', 'both ends in brass, at different heights: the lane stays');
});

test('a tap in select mode picks a moment and still moves the playhead', async () => {
  const r = await mount();
  const svg = svgOf(r);
  await act(() => { fire(svg, 'pointerdown', at(90, 80, 0)); });
  await act(() => { fire(svg, 'pointerup', at(90, 80, 50)); });
  assert.deepEqual(r.seeks, [2]);
  assert.deepEqual(r.picks, [[{ from: 2, to: 2, fromBar: 2, toBar: 2, laneId: 'strings-low' }, true]]);
});

test('a second finger drops the preview', async () => {
  const r = await mount();
  const svg = svgOf(r);
  await act(() => { fire(svg, 'pointerdown', at(100, 120, 0)); });
  await act(() => { fire(svg, 'pointermove', at(300, 120, 50)); });
  await act(() => { fire(svg, 'pointerdown', at(400, 120, 60, 2)); });
  assert.deepEqual(r.picks.at(-1), [null, true]);
});

test('without select the Story view pans as before', async () => {
  const r = await mount({}, false);
  const svg = svgOf(r);
  await act(() => { fire(svg, 'pointerdown', at(360, 120, 0)); });
  await act(() => { fire(svg, 'pointermove', at(200, 120, 50)); });
  assert.ok(r.views > 0);
  assert.deepEqual(r.picks, []);
});

test('the picked span is drawn in its lane; the owner\'s notes are drawn numbered', async () => {
  const marks = [
    { id: 'a'.repeat(32), n: 1, from: 8, to: 12, lane: 'brass', kind: 'text', draft: 1 },
    { id: 'b'.repeat(32), n: 2, from: 4, to: 4, lane: null, kind: 'hum', draft: 1 },
  ];
  const r = await mount({ select: { span: { from: 2, to: 6, fromBar: 2, toBar: 3, laneId: 'brass' }, onPick: () => {} }, marks });
  const sel = walk(r.root).find(e => e._attrs['data-selection'] !== undefined)!;
  assert.deepEqual([sel._attrs['x'], sel._attrs['y'], sel._attrs['width'], sel._attrs['height']], ['90', '112', '180', '36']);
  const drawn = walk(r.root).filter(e => e._attrs['data-note-mark'] !== undefined);
  assert.deepEqual(drawn.map(e => e._attrs['data-note-mark']), [marks[0]!.id, marks[1]!.id]);
  assert.match(drawn[0]!.textContent, /^1$/);
  const outline = walk(drawn[0]!).find(e => e.localName === 'rect')!;
  assert.deepEqual([outline._attrs['x'], outline._attrs['width'], outline._attrs['stroke-dasharray']], ['360', '180', '4 3']);
  assert.equal(walk(drawn[1]!).find(e => e.localName === 'line')!._attrs['x1'], '180', 'a moment is a line');
});
