// The composers are thin: Send waits for a span and words and keeps the words
// until the note is stored; Record waits for a span; a recording shows its
// clock against the minute; the eight reactions and nothing else; and no
// control answers Escape, to the element or to any window or document key listener.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { h, render } from 'preact';
import type { ComponentChild } from 'preact';
import { useState } from 'preact/hooks';
import { act } from 'preact/test-utils';
import { fire, installDocument, makeEl, document as stubDocument, renderTarget, walk } from '../../_kit/test/dom-stub.ts';
import type { StubElement } from '../../_kit/test/dom-stub.ts';
import { importTsx } from '../../_kit/test/tsx.ts';
import type { Score } from '../src/score.ts';

installDocument();
// Every key listener the components put on the window or the document, so the Escape test can press Escape at each.
const keyListeners: unknown[] = [];
const listen = (type: string, f: unknown): void => { if (type.startsWith('key')) keyListeners.push(f); };
Object.assign(globalThis, { window: { addEventListener: listen, removeEventListener() {} } });
const addToDocument = stubDocument.addEventListener;
stubDocument.addEventListener = (type, f) => { listen(type, f); addToDocument(type, f); };
const ui = await importTsx<{
  pin: typeof import('../src/ui/PinComposer.tsx');
  rec: typeof import('../src/ui/RecordButton.tsx');
  react: typeof import('../src/ui/ReactBar.tsx');
}>(import.meta.dirname, { pin: '../src/ui/PinComposer.tsx', rec: '../src/ui/RecordButton.tsx', react: '../src/ui/ReactBar.tsx' });
const score = JSON.parse(readFileSync(new URL('./fixtures/score-v1.json', import.meta.url), 'utf8')) as Score;
const buttons = (root: StubElement) => walk(root).filter(e => e.localName === 'button');
const button = (root: StubElement, text: string) => buttons(root).find(e => e.textContent === text);
const mountInto = async (target: StubElement, vnode: ComponentChild): Promise<void> => { await act(() => { render(vnode, renderTarget(target)); }); };
const settle = async (): Promise<void> => { for (let i = 0; i < 5; i++) await act(async () => { await new Promise(r => setImmediate(r)); }); };

const span = { from: 8, to: 13.6, fromBar: 5, toBar: 7, laneId: 'brass' };
/** The pin composer with its words held as the Workroom holds them. */
function Pin(props: Omit<import('../src/ui/PinComposer.tsx').PinComposerProps, 'text' | 'onText'>) {
  const [text, setText] = useState('');
  return h(ui.pin.PinComposer, { ...props, text, onText: setText });
}
const pinProps = (extra: Record<string, unknown> = {}) => ({ span: null, laneName: null, recording: false, canRecord: true, busy: false, status: null, onSend: async () => true, onRecord: () => {}, onCancel: () => {}, ...extra });

test('Send waits for a span and words, sends the words, and clears the box once the note is stored', async () => {
  const root = makeEl('root');
  const sent: string[] = [];
  const onSend = async (t: string): Promise<boolean> => { sent.push(t); return true; };
  await mountInto(root, h(Pin, pinProps({ onSend })));
  assert.match(root.textContent, /Drag across the Story view to pick a span, or tap one moment\./);
  assert.equal(button(root, 'Send')!.disabled, true, 'no span yet');
  assert.equal(button(root, 'Record')!.disabled, true, 'nothing to record against yet');
  await mountInto(root, h(Pin, pinProps({ span, laneName: 'Horns', onSend })));
  assert.match(root.textContent, /For Bars 5–7 · 8 s – 13\.6 s · Horns/);
  assert.equal(button(root, 'Send')!.disabled, true, 'a span but no words');
  const box = walk(root).find(e => e.localName === 'textarea')!;
  assert.equal(box._attrs['maxLength'], '4000');
  box.value = '   ';
  await act(() => { fire(box, 'input'); });
  assert.equal(button(root, 'Send')!.disabled, true, 'spaces are not words');
  box.value = 'louder and slower right here';
  await act(() => { fire(box, 'input'); });
  assert.equal(button(root, 'Send')!.disabled, false);
  await act(() => { fire(button(root, 'Send')!, 'click'); });
  await settle();
  assert.deepEqual(sent, ['louder and slower right here']);
  assert.equal(box.value, '');
});

test('a note that was not stored keeps its words in the box', async () => {
  const root = makeEl('root');
  await mountInto(root, h(Pin, pinProps({ span, onSend: async () => false })));
  const box = walk(root).find(e => e.localName === 'textarea')!;
  box.value = 'do not lose me';
  await act(() => { fire(box, 'input'); });
  await act(() => { fire(button(root, 'Send')!, 'click'); });
  await settle();
  assert.equal(box.value, 'do not lose me');
  assert.equal(button(root, 'Send')!.disabled, false, 'it can be sent again');
});

test('words typed while a note is being sent stay in the box once it is stored', async () => {
  const root = makeEl('root');
  let done: (stored: boolean) => void = () => {};
  await mountInto(root, h(Pin, pinProps({ span, onSend: () => new Promise<boolean>(r => { done = r; }) })));
  const box = walk(root).find(e => e.localName === 'textarea')!;
  box.value = 'first thought';
  await act(() => { fire(box, 'input'); });
  await act(() => { fire(button(root, 'Send')!, 'click'); });
  box.value = 'first thought, and a second';
  await act(() => { fire(box, 'input'); });
  await act(() => { done(true); });
  await settle();
  assert.equal(box.value, 'first thought, and a second');
});

test('a send that fails outright keeps the words, and Send works again', async () => {
  const root = makeEl('root');
  await mountInto(root, h(Pin, pinProps({ span, onSend: async () => { throw new Error('no'); } })));
  const box = walk(root).find(e => e.localName === 'textarea')!;
  box.value = 'keep me';
  await act(() => { fire(box, 'input'); });
  await act(() => { fire(button(root, 'Send')!, 'click'); });
  await settle();
  assert.equal(box.value, 'keep me');
  assert.equal(button(root, 'Send')!.disabled, false);
});

test('Send is one note: a second tap while it is being sent sends nothing', async () => {
  const root = makeEl('root');
  const sent: string[] = [];
  let done: (stored: boolean) => void = () => {};
  await mountInto(root, h(Pin, pinProps({ span, onSend: (t: string) => { sent.push(t); return new Promise<boolean>(r => { done = r; }); } })));
  const box = walk(root).find(e => e.localName === 'textarea')!;
  box.value = 'once';
  await act(() => { fire(box, 'input'); });
  await act(() => { fire(button(root, 'Send')!, 'click'); });
  assert.equal(button(root, 'Send')!.disabled, true, 'busy while sending');
  await act(() => { fire(button(root, 'Send')!, 'click'); });
  await act(() => { done(true); });
  await settle();
  assert.deepEqual(sent, ['once']);
  assert.equal(button(root, 'Send')!.disabled, true, 'the box is empty again');
});

test('the box is the textbox "Your note", and the composer shows what became of the last send', async () => {
  const root = makeEl('root');
  await mountInto(root, h(Pin, pinProps({ span, status: 'No connection: this note is kept on this device.' })));
  const label = walk(root).find(e => e.localName === 'label')!;
  assert.match(label.textContent, /^Your note/);
  assert.equal(walk(label).filter(e => e.localName === 'textarea').length, 1);
  assert.equal(walk(root).find(e => e._attrs['role'] === 'status')!.textContent, 'No connection: this note is kept on this device.');
});

test('the characters left show from the last 500 and count down', async () => {
  const root = makeEl('root');
  await mountInto(root, h(Pin, pinProps({ span })));
  const box = walk(root).find(e => e.localName === 'textarea')!;
  for (const [length, shown] of [[3499, null], [3500, '500 characters left'], [3700, '300 characters left']] as const) {
    box.value = 'x'.repeat(length);
    await act(() => { fire(box, 'input'); });
    if (shown === null) assert.doesNotMatch(root.textContent, /characters left/, `${length} characters`);
    else assert.match(root.textContent, new RegExp(shown), `${length} characters`);
  }
});

test('recording: Record starts it; while it runs the composer says so and offers no second recording', async () => {
  const root = makeEl('root');
  const calls: string[] = [];
  await mountInto(root, h(Pin, pinProps({ span, onRecord: () => calls.push('record') })));
  fire(button(root, 'Record')!, 'click');
  await mountInto(root, h(Pin, pinProps({ span, recording: true, onRecord: () => calls.push('record') })));
  assert.equal(button(root, 'Recording…')!.disabled, true);
  assert.equal(button(root, 'Send')!.disabled, true, 'no sending while recording');
  assert.equal(buttons(root).some(b => /^Stop/.test(b.textContent)), false, 'Stop lives in the answer bar\'s dock');
  assert.deepEqual(calls, ['record']);
  await mountInto(root, h(Pin, pinProps({ span, canRecord: false })));
  assert.equal(button(root, 'Record'), undefined);
});

test('Hum it is a record button with its own clock', async () => {
  const root = makeEl('root');
  let started = 0;
  await mountInto(root, h(ui.rec.RecordButton, { recording: false, seconds: 0, onStart: () => started++, onStop: () => {} }));
  fire(button(root, 'Hum it')!, 'click');
  assert.equal(started, 1);
  await mountInto(root, h(ui.rec.RecordButton, { recording: true, seconds: 12.4, onStart: () => {}, onStop: () => {} }));
  const stop = button(root, 'Stop (0:12 of 1:00)')!;
  assert.equal(stop._attrs['aria-pressed'], 'true');
  assert.ok((stop._attrs['class'] ?? stop.className).includes('bg-record'));
  await mountInto(root, h(ui.rec.RecordButton, { recording: true, seconds: 61, onStart: () => {}, onStop: () => {} }));
  assert.ok(button(root, 'Stop (1:00 of 1:00)'), 'the clock stops at the minute');
});

test('eight reactions on a section, and the whole piece when there is none', async () => {
  const root = makeEl('root');
  const got: string[] = [];
  await mountInto(root, h(ui.react.ReactBar, { section: score.sections[1]!, whole: false, busy: false, onReact: (r: string) => got.push(r) }));
  assert.match(root.textContent, /React to: Ariadne's thread/);
  assert.equal(buttons(root).length, 8);
  for (const b of buttons(root)) assert.ok((b._attrs['class'] ?? b.className).includes('min-h-11'));
  fire(button(root, 'Love it')!, 'click');
  assert.deepEqual(got, ['love-it']);
  await mountInto(root, h(ui.react.ReactBar, { section: score.sections[0]!, whole: true, busy: false, onReact: () => {} }));
  assert.match(root.textContent, /React to the whole piece/);
});

test('no composer takes Escape: not on any of its elements, nor at any window or document key listener', async () => {
  const calls: string[] = [];
  const root = makeEl('root');
  const mounts: ComponentChild[] = [
    h(Pin, pinProps({ span, onRecord: () => calls.push('record'), onCancel: () => calls.push('cancel'), onSend: async () => { calls.push('send'); return true; } })),
    h(Pin, pinProps({ span, recording: true, onCancel: () => calls.push('cancel') })),
    h(ui.rec.RecordButton, { recording: true, seconds: 3, onStart: () => calls.push('start'), onStop: () => calls.push('stop') }),
    h(ui.react.ReactBar, { section: score.sections[1]!, whole: false, busy: false, onReact: () => calls.push('react') }),
  ];
  for (const vnode of mounts) {
    await mountInto(root, vnode);
    const before = walk(root).length;
    let taken = 0;
    for (const el of [root, ...walk(root)]) {
      for (const type of ['keydown', 'keyup', 'keypress']) {
        const ev = { key: 'Escape', code: 'Escape', keyCode: 27, preventDefault: () => { taken++; }, stopPropagation: () => { taken++; } };
        fire(el, type, ev);
      }
    }
    const pressed = keyListeners.map(f => {
      const ev = { type: 'keydown', key: 'Escape', prevented: false, stopped: false, preventDefault() { ev.prevented = true; }, stopPropagation() { ev.stopped = true; } };
      (f as (e: typeof ev) => void)(ev);
      return ev;
    });
    assert.equal(taken, 0, 'no element takes Escape');
    assert.ok(pressed.every(ev => !ev.prevented && !ev.stopped), 'no global key listener takes Escape');
    assert.equal(walk(root).length, before, 'the component is still there');
  }
  assert.deepEqual(calls, [], 'Escape triggered nothing');
});
