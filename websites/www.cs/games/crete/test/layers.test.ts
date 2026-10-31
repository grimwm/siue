import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createLayers } from '../src/layers.ts';

const make = () => {
  let changes = 0;
  const layers = createLayers(() => { changes++; });
  return { layers, changes: () => changes };
};

test('Q with nothing open opens the menu; the next Q closes it', () => {
  const { layers } = make();
  assert.equal(layers.pressBack(), 'opened');
  assert.equal(layers.top(), 'menu');
  assert.equal(layers.pressBack(), 'closed');
  assert.equal(layers.top(), null);
});

test('Q under the title card does nothing: it has nothing to go back to', () => {
  const { layers, changes } = make();
  layers.open('title');
  const before = changes();
  assert.equal(layers.pressBack(), 'kept');
  assert.equal(layers.top(), 'title');
  assert.equal(changes(), before, 'a kept press changes nothing');
});

test('Settings and Story open over the title card; Q returns to it', () => {
  const { layers } = make();
  layers.open('title');
  layers.open('menu');
  assert.equal(layers.isOpen('menu'), true);
  assert.equal(layers.isOpen('title'), false, 'only the top layer is open');
  assert.equal(layers.has('title'), true);
  assert.equal(layers.pressBack(), 'closed');
  assert.equal(layers.isOpen('title'), true);
  layers.open('story');
  assert.equal(layers.pressBack(), 'closed');
  assert.equal(layers.top(), 'title');
});

test('a run ending puts the ending over the title card; Q reveals the title card, never the menu', () => {
  const { layers } = make();
  layers.open('title');
  layers.open('end');
  assert.equal(layers.top(), 'end');
  assert.equal(layers.pressBack(), 'closed');
  assert.equal(layers.top(), 'title');
  assert.equal(layers.pressBack(), 'kept');
});

test('opening a layer that is already open lifts it to the top once', () => {
  const { layers } = make();
  layers.open('title');
  layers.open('menu');
  layers.open('title');
  assert.equal(layers.top(), 'title');
  layers.close('title');
  assert.equal(layers.top(), 'menu');
});

test('close and clear tell the page only when something changed', () => {
  const { layers, changes } = make();
  layers.close('menu');
  layers.clear();
  assert.equal(changes(), 0);
  layers.open('menu');
  layers.clear();
  assert.equal(layers.any(), false);
  assert.equal(changes(), 2);
});

test('the levels list opens over the title card or the ending card; Q returns to what it came from', () => {
  const { layers } = make();
  layers.open('title');
  layers.open('levels');
  assert.equal(layers.top(), 'levels');
  assert.equal(layers.pressBack(), 'closed');
  assert.equal(layers.top(), 'title');
  layers.clear();
  layers.open('end');
  layers.open('levels');
  assert.equal(layers.pressBack(), 'closed');
  assert.equal(layers.top(), 'end');
});

test('the chapter card is closed by Q like any other card, and the levels list opens over it', () => {
  const { layers } = make();
  layers.open('title');
  layers.open('chapter');
  assert.equal(layers.pressBack(), 'closed');
  assert.equal(layers.top(), 'title');
  layers.open('chapter');
  layers.open('levels');
  assert.equal(layers.top(), 'levels');
  assert.equal(layers.pressBack(), 'closed');
  assert.equal(layers.top(), 'chapter');
  layers.clear();
  layers.open('chapter');
  assert.equal(layers.pressBack(), 'closed');
  assert.equal(layers.any(), false);
});

test('the Lore Book opens over the menu; Q returns to it', () => {
  const { layers } = make();
  layers.open('menu');
  layers.open('lore');
  assert.equal(layers.top(), 'lore');
  assert.equal(layers.pressBack(), 'closed');
  assert.equal(layers.top(), 'menu');
});

test('the closing chapter card opens over the end card; Q returns to it', () => {
  const { layers } = make();
  layers.open('end');
  layers.open('chapter');
  assert.equal(layers.isOpen('end'), false);
  assert.equal(layers.pressBack(), 'closed');
  assert.equal(layers.top(), 'end');
});

test('the stack reads from the bottom card up, and is a copy', () => {
  const { layers } = make();
  layers.open('title');
  layers.open('story');
  layers.open('levels');
  const stack = layers.stack();
  assert.deepEqual(stack, ['title', 'story', 'levels']);
  stack.pop();
  assert.equal(layers.top(), 'levels');
});
