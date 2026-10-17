// The Share icon is defined once, in the kit, and no earlier icon survives
// anywhere in the site's source.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const SITE = join(import.meta.dirname, '..', '..', '..');
const SKIP = new Set(['node_modules', 'vendor', 'dist', '.git', 'test', 'tests', 'data']);
const TEXT = /\.(tsx?|mjs|js|php|html|css|svg)$/;

function sources(dir: string, out: string[] = []): string[] {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) {
      // .tmp-* are scratch builds other tests create and remove while this one runs.
      if (!SKIP.has(e.name) && !e.name.startsWith('.tmp-')) sources(join(dir, e.name), out);
    } else if (TEXT.test(e.name)) {
      out.push(join(dir, e.name));
    }
  }
  return out;
}
const holders = (needle: string): string[] =>
  sources(SITE).filter(f => readFileSync(f, 'utf8').includes(needle)).map(f => relative(SITE, f));

test('the Share icon (arrow up out of a tray) has its path data in one file, the kit\'s share-icon.tsx', () => {
  assert.deepEqual(holders('M12 15V3M7 8l5-5 5 5'), ['games/_kit/ui/share-icon.tsx']);
  assert.deepEqual(holders('M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3'), ['games/_kit/ui/share-icon.tsx']);
});

test('the earlier Share icons (iOS box, three nodes) appear nowhere', () => {
  // Built from pieces so this file does not hold the very text it forbids.
  const old = ['M12 3v12M7.5 7.5 12', 'M8 10H6v11h12V10', 'M8.6 13.5l6.8 4', 'M12 15V3M8 7l4-4 4 4', 'cx="18" cy="5" r="3"'];
  for (const needle of old) assert.deepEqual(holders(needle), [], needle);
});
