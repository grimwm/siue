// The pieces list's per-piece counts: written once the notes are unlocked
// (the server cannot know a sealed note's piece); a piece with none is blank.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { asElement, makeEl } from '../../_kit/test/dom-stub.ts';
import type { StubElement } from '../../_kit/test/dom-stub.ts';
import { showWaiting } from '../src/ui/waiting.ts';

test('each piece row gets its waiting count; a piece with none is blank', () => {
  const list = makeEl('list');
  const row = (piece: string): StubElement => {
    const li = makeEl('');
    const a = makeEl('');
    a.localName = 'a';
    a.setAttribute('data-waiting', piece);
    const count = makeEl('');
    count.localName = 'span';
    count.className = 'waiting-count';
    count.textContent = 'stale';
    li.append(a, count);
    list.append(li);
    return count;
  };
  const three = row('test-piece');
  const none = row('cannon-fire');
  showWaiting(asElement(list), new Map([['test-piece', 3], ['gone', 9]]));
  assert.equal(three.textContent, '3 waiting');
  assert.equal(none.textContent, '');
});
