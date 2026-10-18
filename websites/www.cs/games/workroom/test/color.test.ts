// Contrast arithmetic and the nudge that keeps a score's colours readable on
// either theme's drawing surface.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { contrast, luminance, MARK_MIN, mix, readable, readableOn, TEXT_MIN } from '../src/color.ts';
import { TOKENS } from '../src/tokens.ts';
import type { Score } from '../src/score.ts';

const read = (name: string): Score => JSON.parse(readFileSync(new URL(`./fixtures/${name}`, import.meta.url), 'utf8')) as Score;
const near = (a: number, b: number, eps = 0.01) => assert.ok(Math.abs(a - b) < eps, `${a} ≈ ${b}`);

test('contrast: black on white is 21:1, a colour on itself 1:1, either order', () => {
  near(contrast('#000000', '#ffffff'), 21);
  near(contrast('#ffffff', '#000000'), 21);
  near(contrast('#7a9cc6', '#7a9cc6'), 1);
  near(luminance('#ffffff'), 1);
  near(luminance('#000000'), 0);
});

test('mix moves a colour toward another by the given share', () => {
  assert.equal(mix('#000000', '#ffffff', 0), '#000000');
  assert.equal(mix('#000000', '#ffffff', 1), '#ffffff');
  assert.equal(mix('#000000', '#ffffff', 0.5), '#808080');
});

test('readable leaves a colour that already reaches the floor alone', () => {
  assert.equal(readable('#d4a017', TOKENS.dark.well, MARK_MIN), '#d4a017');
  assert.equal(readable('#2e4057', TOKENS.light.well, TEXT_MIN), '#2e4057');
});

test('readable lightens on the dark well and darkens on the light one until the floor is met', () => {
  const navy = readable('#2e4057', TOKENS.dark.well, MARK_MIN);
  assert.notEqual(navy, '#2e4057');
  assert.ok(luminance(navy) > luminance('#2e4057'));
  assert.ok(contrast(navy, TOKENS.dark.well) >= MARK_MIN);
  const gold = readable('#d4a017', TOKENS.light.well, TEXT_MIN);
  assert.ok(luminance(gold) < luminance('#d4a017'));
  assert.ok(contrast(gold, TOKENS.light.well) >= TEXT_MIN);
});

test('every fixture colour and both extremes reach both floors on the well and the lane, in both themes', () => {
  const scores = [read('score-v1.json'), read('score-sound-v1.json')];
  const all = [...scores.flatMap(s => [...s.characters, ...s.lanes, ...s.sections].map(x => x.color)), '#000000', '#ffffff'];
  for (const theme of ['dark', 'light'] as const) {
    for (const c of all) {
      for (const surface of ['well', 'lane'] as const) {
        assert.ok(contrast(readableOn(theme, c, 'mark'), TOKENS[theme][surface]) >= MARK_MIN, `${theme} mark ${c} on ${surface}`);
        assert.ok(contrast(readableOn(theme, c, 'text'), TOKENS[theme][surface]) >= TEXT_MIN, `${theme} text ${c} on ${surface}`);
      }
    }
  }
});
