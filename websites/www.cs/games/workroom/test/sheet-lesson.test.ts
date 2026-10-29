// The reading lesson on the Sheet music view, against a fake notation library:
// it opens beside the music without hiding it, each step lights its bar and
// plays it, glossary words open their cards, reading along follows the
// playhead, a lane without an example offers no Hear it there, and Close puts
// out the light and returns focus.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { h, render } from 'preact';
import { act } from 'preact/test-utils';
import { click, installDocument, makeEl, document as stubDocument, renderTarget, walk } from '../../_kit/test/dom-stub.ts';
import type { StubElement } from '../../_kit/test/dom-stub.ts';
import type { TempoMap } from '../src/tempo.ts';

installDocument();
Object.assign(globalThis, { requestAnimationFrame: () => 0, cancelAnimationFrame: () => {} });

const ui = await (await import('../../_kit/test/tsx.ts')).importTsx<{
  sheet: typeof import('../src/ui/SheetMusic.tsx');
}>(import.meta.dirname, { sheet: '../src/ui/SheetMusic.tsx' });
const { createSheet } = await import('../src/sheetlife.ts');

const note = (step: string, octave: number, type: string, more = ''): string =>
  `<note><pitch><step>${step}</step><octave>${octave}</octave></pitch><duration>1</duration><type>${type}</type>${more}</note>`;
const XML = `<score-partwise><part-list><score-part id="a"><part-name>Lane a</part-name></score-part><score-part id="b"><part-name>Lane b</part-name></score-part></part-list>
<part id="a"><measure number="1"><attributes><time><beats>4</beats><beat-type>4</beat-type></time><clef><sign>G</sign><line>2</line></clef></attributes><note><rest measure="yes"/><duration>4</duration></note></measure>
<measure number="2">${note('D', 4, 'half')}${note('E', 4, 'quarter')}${note('F', 4, 'quarter')}</measure>
<measure number="3"><note><pitch><step>B</step><alter>-1</alter><octave>4</octave></pitch><duration>4</duration><type>whole</type><accidental>flat</accidental><tie type="start"/></note></measure>
<measure number="4"><note><pitch><step>B</step><alter>-1</alter><octave>4</octave></pitch><duration>4</duration><type>whole</type><tie type="stop"/></note></measure></part>
<part id="b"><measure number="1"><attributes><clef><sign>F</sign><line>4</line></clef></attributes>${note('C', 3, 'whole')}</measure></part></score-partwise>`;

const lanes = ['a', 'b'].map(id => ({ id, name: `Lane ${id}`, family: 'strings' as const, icon: 'strings' as const, color: '#112233' }));
const tempo: TempoMap = { metric: true, barStart: n => (n - 1) * 2, barAt: t => Math.floor(t / 2) + 1 };
const settle = async (): Promise<void> => { for (let i = 0; i < 6; i++) await act(() => new Promise<void>(r => setImmediate(r))); };
const button = (root: StubElement, name: string): StubElement | undefined => walk(root).find(e => e.localName === 'button' && e.textContent === name);
const lesson = (root: StubElement): StubElement | undefined => walk(root).find(e => Boolean(e.getAttribute('data-lesson')));

function setup() {
  const marks: (number | null)[] = [];
  const ports = {
    fetchText: async () => XML,
    loadModule: async () => ({
      mountSheet: (el: HTMLElement) => createSheet(el as unknown as StubElement as never, host => ({
        load: async () => {},
        render: () => { (host as unknown as StubElement).appendChild(stubDocument.createElement('svg')); },
        clear: () => {},
        mark: (bar: number | null) => { marks.push(bar); },
      }), { addEventListener: () => {}, removeEventListener: () => {} }, x => x),
    }),
  };
  const heard: { from: number; to: number }[] = [];
  const terms: string[] = [];
  const root = makeEl('root');
  const draw = async (over: Record<string, unknown> = {}): Promise<void> => {
    await act(() => { render(h(ui.sheet.SheetMusic, { musicxmlSrc: 'score.musicxml', laneId: 'a', lanes, onLane: () => {}, ports, tempo, duration: 20, time: 0, onHear: (c: { from: number; to: number }) => { heard.push(c); }, onTerm: (id: string) => { terms.push(id); }, ...over }), renderTarget(root)); });
    await settle();
  };
  return { root, marks, heard, terms, draw };
}

test('the lesson opens beside the music, lights the bar each step talks about and plays it', async () => {
  const s = setup();
  await s.draw();
  assert.equal(lesson(s.root), undefined, 'closed until asked for');
  const open = button(s.root, 'Learn to read sheet music')!;
  await act(() => { click(open); });
  await settle();
  const panel = lesson(s.root)!;
  assert.equal(panel.getAttribute('role'), 'region');
  assert.equal(globalThis.__focused, panel, 'focus moves into the lesson');
  assert.equal(walk(s.root).find(e => e.id === 'sheet')!.children.length, 1, 'the music is still drawn');
  assert.match(panel.textContent, /Step 1 of 6/);
  assert.match(panel.textContent, /The staff and the clef/);
  assert.match(panel.textContent, /The first note here, in bar 2, is D4/);
  assert.equal(s.marks.at(-1), 2);
  await act(() => { click(button(s.root, 'Hear it')!); });
  assert.deepEqual(s.heard.at(-1), { from: 2, to: 4 }, 'bar 2 of the draft');

  await act(() => { click(button(s.root, 'Next')!); });
  await settle();
  assert.match(lesson(s.root)!.textContent, /Step 2 of 6/);
  assert.match(lesson(s.root)!.textContent, /Bar 2 holds a half note and two quarter notes/);
  await act(() => { click(button(s.root, 'Next')!); });
  await act(() => { click(button(s.root, 'Next')!); });
  await settle();
  assert.match(lesson(s.root)!.textContent, /Bar 3 has B♭4/);
  assert.equal(s.marks.at(-1), 3);
  await act(() => { click(button(s.root, 'Hear it')!); });
  assert.deepEqual(s.heard.at(-1), { from: 4, to: 6 });
  await act(() => { click(button(s.root, 'Back')!); });
  await settle();
  assert.match(lesson(s.root)!.textContent, /Step 3 of 6/);
  render(null, renderTarget(s.root));
});

test('a glossary word in a step opens its card', async () => {
  const s = setup();
  await s.draw();
  await act(() => { click(button(s.root, 'Learn to read sheet music')!); });
  await settle();
  const word = walk(lesson(s.root)!).find(e => e.getAttribute('data-term') === 'clef')!;
  await act(() => { click(word); });
  assert.deepEqual(s.terms, ['clef']);
  render(null, renderTarget(s.root));
});

test('reading along lights the bar playing now, and Next stops at the last step', async () => {
  const s = setup();
  await s.draw();
  await act(() => { click(button(s.root, 'Learn to read sheet music')!); });
  for (let i = 0; i < 5; i++) await act(() => { click(button(s.root, 'Next')!); });
  await settle();
  assert.match(lesson(s.root)!.textContent, /Step 6 of 6/);
  assert.match(lesson(s.root)!.textContent, /Reading along/);
  assert.equal(button(s.root, 'Next')!.disabled, true);
  assert.equal(globalThis.__focused, lesson(s.root), 'focus stays in the lesson when Next is disabled');
  await s.draw({ time: 5 });
  assert.equal(s.marks.at(-1), 3, 'the bar at 5 s');
  await s.draw({ time: 7 });
  assert.equal(s.marks.at(-1), 4);
  render(null, renderTarget(s.root));
});

test('a lane with no example keeps the plain rule and offers no Hear it for that step', async () => {
  const s = setup();
  await s.draw({ laneId: 'b' });
  await act(() => { click(button(s.root, 'Learn to read sheet music')!); });
  for (let i = 0; i < 3; i++) await act(() => { click(button(s.root, 'Next')!); });
  await settle();
  assert.match(lesson(s.root)!.textContent, /Sharps, flats and naturals/);
  assert.equal(button(s.root, 'Hear it'), undefined);
  assert.equal(s.marks.at(-1), null, 'no bar lit');
  render(null, renderTarget(s.root));
});

test('Close puts out the light, hides the lesson and returns focus; the lesson opens again', async () => {
  const s = setup();
  await s.draw();
  const open = button(s.root, 'Learn to read sheet music')!;
  await act(() => { click(open); });
  await settle();
  assert.equal(open.getAttribute('aria-pressed'), 'true');
  await act(() => { click(button(s.root, 'Close')!); });
  await settle();
  assert.equal(lesson(s.root), undefined);
  assert.equal(s.marks.at(-1), null);
  assert.equal(globalThis.__focused, open);
  await act(() => { click(open); });
  await settle();
  assert.ok(lesson(s.root));
  render(null, renderTarget(s.root));
});
