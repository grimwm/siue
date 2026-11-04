// The embed (src/embed.ts, dist/embed.js) and the boards it keeps in the browser
// (createLocalScoresClient): another site's page cannot reach scores.php.
import { createLocalScoresClient, localWeekStart, LOCAL_SCORES_KEY, weeklyResetText } from '../src/scores.ts';
import type { StorageLike } from '../../_kit/ports.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const read = (...p: string[]): string => readFileSync(join(import.meta.dirname, '..', ...p), 'utf8');

function memory(): StorageLike & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => { data.set(k, v); },
    removeItem: (k) => { data.delete(k); },
  };
}

test('the local boards rank runs, keep them in storage and say when the week resets', async () => {
  const store = memory();
  let now = new Date(2026, 10, 4, 12); // a Wednesday
  const client = createLocalScoresClient(store, () => now);
  const config = await client.load();
  assert.ok(config);
  assert.equal(weeklyResetText(config), 'Play often — scores reset every Sunday at midnight your time.');
  assert.equal(client.qualifies(0), false);
  assert.equal(client.qualifies(1), true);
  assert.deepEqual(await client.submit(5, 'abc', 3), { saved: true, problem: null, allTimeRank: 1 });
  assert.deepEqual(await client.submit(9, 'xy', 3), { saved: true, problem: null, allTimeRank: 1 });
  assert.deepEqual(client.board().map((e) => [e.initials, e.score]), [['XYA', 9], ['ABC', 5]]);
  // A new browser session reads the same boards back.
  const again = createLocalScoresClient(store, () => now);
  await again.load();
  assert.deepEqual(again.alltime().map((e) => e.score), [9, 5]);
  // Next week the weekly board starts empty; all time keeps both.
  now = new Date(2026, 10, 9, 0, 0, 1);
  assert.deepEqual(again.board(), []);
  assert.deepEqual(again.alltime().map((e) => e.score), [9, 5]);
});

test('the local boards keep the top ten and survive broken storage', async () => {
  const store = memory();
  const now = new Date(2026, 10, 4, 12);
  const client = createLocalScoresClient(store, () => now);
  for (let s = 1; s <= 12; s++) await client.submit(s, 'AAA', 0);
  assert.equal(client.alltime().length, 10);
  assert.equal(client.qualifies(2), false);
  assert.equal(client.qualifies(4), true);
  assert.equal((JSON.parse(store.data.get(LOCAL_SCORES_KEY) ?? '[]') as unknown[]).length, 10);
  store.data.set(LOCAL_SCORES_KEY, '{not json');
  const broken = createLocalScoresClient(store, () => now);
  await broken.load();
  assert.deepEqual(broken.alltime(), []);
  const none = createLocalScoresClient(null, () => now);
  assert.equal((await none.submit(3, 'AAA', 0)).saved, true);
});

test('the local week starts on Sunday at midnight', () => {
  assert.equal(localWeekStart(new Date(2026, 10, 4, 15)), new Date(2026, 10, 1).getTime());
  assert.equal(localWeekStart(new Date(2026, 10, 1, 0, 0, 0)), new Date(2026, 10, 1).getTime());
});

test('the embed carries the markup and the stylesheets, and keeps scores local', () => {
  const embed = read('dist', 'embed.js');
  assert.match(embed, /cylon-battlefield/, 'mount.html is inlined');
  assert.match(embed, /cylon-world-ended/, 'the stylesheets are inlined');
  assert.match(embed, /cic-embed-on/, 'the embed rules are inlined');
  assert.doesNotMatch(embed, /scores\.php\?|\bimport\(/, 'it fetches no scores and loads no module');
  const src = read('src', 'embed.ts');
  assert.match(src, /localScores: true/);
  // Every stylesheet the home page links is carried, in the home page's order.
  const linked = [...read('..', '..', 'index.html').matchAll(/games\/cylon\/css\/(\w+)\.css/g)].map((m) => m[1]);
  const carried = [...src.matchAll(/from '\.\.\/css\/(\w+)\.css'/g)].map((m) => m[1]);
  assert.deepEqual(carried, linked);
});
