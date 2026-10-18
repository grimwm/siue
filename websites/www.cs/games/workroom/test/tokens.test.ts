// The colour tokens: app.css defines them once (dark in @theme, light under
// data-theme="light"), tokens.ts mirrors them for contrast arithmetic, every
// pair the page draws meets its floor in both themes, and no component names
// a colour of its own.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { TOKEN_NAMES, TOKENS } from '../src/tokens.ts';
import type { Theme, Token } from '../src/tokens.ts';
import { contrast } from '../src/color.ts';

const SRC = join(import.meta.dirname, '..', 'src');
const css = readFileSync(join(SRC, 'app.css'), 'utf8');
const block = (start: string): string => {
  const at = css.indexOf(start);
  assert.ok(at >= 0, `app.css has ${start}`);
  return css.slice(at, css.indexOf('}', at));
};
const colours = (text: string): Record<string, string> =>
  Object.fromEntries([...text.matchAll(/--color-([a-z-]+):\s*(#[0-9a-f]{6});/g)].map(m => [m[1]!, m[2]!]));

test('tokens.ts holds exactly the values app.css defines, in both themes', () => {
  assert.deepEqual(colours(block('@theme static {')), TOKENS.dark);
  assert.deepEqual(colours(block(':root[data-theme="light"] {')), TOKENS.light);
  for (const theme of ['dark', 'light'] as const) assert.deepEqual(Object.keys(TOKENS[theme]).sort(), [...TOKEN_NAMES].sort());
});

const FLOORS: readonly [Token, readonly Token[], number][] = [
  ['ink', ['ground', 'panel', 'well', 'lane'], 4.5],
  ['dim', ['ground', 'panel', 'well', 'lane'], 4.5],
  ['amber', ['ground', 'panel', 'well'], 4.5],
  ['go', ['panel'], 4.5],
  ['amber', ['ground', 'panel', 'well', 'lane'], 3],
  ['go', ['ground', 'panel', 'well', 'lane'], 3],
  ['record', ['ground', 'panel', 'well', 'lane'], 3],
  ['on-accent', ['amber', 'go', 'record'], 4.5],
];

test('every token pair the page draws meets its contrast floor in both themes', () => {
  for (const theme of ['dark', 'light'] as Theme[]) {
    for (const [fg, bgs, min] of FLOORS) {
      for (const bg of bgs) {
        const ratio = contrast(TOKENS[theme][fg], TOKENS[theme][bg]);
        assert.ok(ratio >= min, `${theme}: ${fg} on ${bg} is ${ratio.toFixed(2)}:1, under ${min}:1`);
      }
    }
  }
});

const uiFiles = (dir: string): string[] => readdirSync(dir, { withFileTypes: true }).flatMap(e =>
  e.isDirectory() ? uiFiles(join(dir, e.name)) : e.name.endsWith('.tsx') ? [join(dir, e.name)] : []);

test('no component names a colour: no hex literal, no Tailwind palette class', () => {
  for (const f of [...uiFiles(join(SRC, 'ui')), join(SRC, 'main.ts')]) {
    const text = readFileSync(f, 'utf8');
    assert.doesNotMatch(text, /#[0-9a-fA-F]{3,8}\b/, f);
    // bg-amber is a token; bg-amber-500, text-white and the like are Tailwind's palette.
    assert.doesNotMatch(text, /\b(?:bg|text|border|fill|stroke|ring|outline)-(?:(?:red|blue|green|gray|slate|zinc|neutral|amber|yellow)-\d{2,3}|white|black)\b/, f);
  }
});
