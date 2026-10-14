// The initials boxes the title card and the rooms lobby share: ids under a
// prefix, the saved set shown, a full typed set reported, typing that
// survives a redraw, and the saved set put back when the game asks.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { h, render } from 'preact';
import { byId, fire, installDocument, makeEl, maybeById, renderTarget } from '../../_kit/test/dom-stub.ts';
import type { StubElement } from '../../_kit/test/dom-stub.ts';
import { importTsx } from '../../_kit/test/tsx.ts';
import type { InitialsPickerProps } from '../src/ui/initials-picker.tsx';

installDocument();
const { picker } = await importTsx<{ picker: typeof import('../src/ui/initials-picker.tsx') }>(import.meta.dirname, { picker: '../src/ui/initials-picker.tsx' });
const type = (box: StubElement, value: string) => { box.value = value; fire(box, 'input'); };

function draw(over: Partial<InitialsPickerProps> = {}) {
  const root = makeEl('root');
  const calls: string[] = [];
  const field: { current: HTMLFieldSetElement | null } = { current: null };
  const props: InitialsPickerProps = { idPrefix: 'lobby', initials: 'BDJ', rev: 0, onInitials: w => { calls.push(w); }, fieldRef: field, ...over };
  const redraw = (more: Partial<InitialsPickerProps> = {}) => render(h(picker.InitialsPicker, { ...props, ...more }), renderTarget(root));
  redraw();
  const boxes = (): [StubElement, StubElement, StubElement] =>
    [byId(root, `${props.idPrefix}-initial-1`), byId(root, `${props.idPrefix}-initial-2`), byId(root, `${props.idPrefix}-initial-3`)];
  return { root, calls, redraw, boxes, field };
}

test('the ids carry the prefix, so two pickers on one page never share one', () => {
  const lobby = draw({ idPrefix: 'lobby' });
  const title = draw({ idPrefix: 'title' });
  assert.ok(lobby.boxes().every(Boolean));
  assert.ok(title.boxes().every(Boolean));
  assert.equal(maybeById(lobby.root, 'title-initial-1'), undefined);
  assert.equal(lobby.boxes()[0].getAttribute('aria-label'), 'Initial 1 of 3');
});

test('the boxes show the saved set and a full typed set is reported uppercase', () => {
  const { boxes, calls } = draw({ initials: 'ZED' });
  assert.deepEqual(boxes().map(b => b.value), ['Z', 'E', 'D']);
  type(boxes()[2], 'x');
  assert.deepEqual(calls, ['ZEX']);
});

test('half-typed boxes survive a redraw; a new saved set or a new rev puts the saved set back', () => {
  const { boxes, redraw, calls } = draw({ initials: 'BDJ' });
  type(boxes()[0], 'q');
  assert.deepEqual(boxes().map(b => b.value), ['Q', '', '']);
  redraw();
  assert.deepEqual(boxes().map(b => b.value), ['Q', '', ''], 'a redraw (a poll, a status line) keeps the typing');
  redraw({ rev: 1 });
  assert.deepEqual(boxes().map(b => b.value), ['B', 'D', 'J']);
  type(boxes()[0], 'q');
  redraw({ rev: 1, initials: 'ZED' });
  assert.deepEqual(boxes().map(b => b.value), ['Z', 'E', 'D'], 'the set saved elsewhere shows here too');
  assert.deepEqual(calls, []);
});

test('the letters read from the fieldset, a space for an empty box', () => {
  const { boxes, field } = draw({ initials: 'BDJ' });
  assert.equal(picker.typedLetters(field.current), 'BDJ');
  type(boxes()[0], 'z');
  assert.equal(picker.typedLetters(field.current), 'Z  ');
  assert.equal(picker.typedLetters(null), '   ');
});

test('a letter typed into a box that already holds one replaces it, wherever the caret was', () => {
  const { boxes, calls } = draw({ initials: 'BDJ' });
  const [, , c] = boxes();
  c.value = 'xJ'; // caret before the J
  fire(c, 'input', { data: 'x' });
  assert.equal(c.value, 'X');
  assert.deepEqual(calls, ['BDX']);
});

test('a pasted set fills this box and the ones after it', () => {
  const { boxes, calls } = draw({ initials: 'BDJ' });
  const [a] = boxes();
  a.value = 'xyz';
  fire(a, 'input', { data: 'xyz', inputType: 'insertFromPaste' });
  assert.deepEqual(boxes().map(b => b.value), ['X', 'Y', 'Z']);
  assert.deepEqual(calls, ['XYZ']);
  const [, b2] = boxes();
  b2.value = 'q1w2e';
  fire(b2, 'input', { data: null, inputType: 'insertFromPaste' });
  assert.deepEqual(boxes().map(b => b.value), ['X', 'Q', 'W'], 'only letters, only as many boxes as remain');
});

test('a visible rejection marks every box invalid and ties it to the note; a clear one removes both', () => {
  const { boxes, redraw } = draw({ problem: 'Pick other initials.', noteId: 'lobby-initials-note' });
  for (const b of boxes()) {
    assert.equal(b.getAttribute('aria-invalid'), 'true');
    assert.equal(b.getAttribute('aria-describedby'), 'lobby-initials-note');
  }
  redraw({ problem: '', noteId: 'lobby-initials-note' });
  for (const b of boxes()) {
    assert.ok(b.getAttribute('aria-invalid') == null);
    assert.ok(b.getAttribute('aria-describedby') == null);
  }
});
