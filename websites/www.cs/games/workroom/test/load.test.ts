import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { loadDraft, type Fetch } from '../src/load.ts';

const scoreText = readFileSync(new URL('./fixtures/score-v1.json', import.meta.url), 'utf8');
const reply = (body: unknown, extra: { status?: number; redirected?: boolean } = {}) => ({
  ok: (extra.status ?? 200) < 400, status: extra.status ?? 200, redirected: extra.redirected ?? false,
  headers: { get: () => 'application/json' }, json: async () => body, arrayBuffer: async () => new ArrayBuffer(0), text: async () => JSON.stringify(body),
});
const fakeFetch = (score: unknown, redirected = false): { fetch: Fetch; urls: string[] } => {
  const urls: string[] = [];
  return {
    urls,
    fetch: async url => {
      urls.push(url);
      if (redirected) return reply('<html>', { redirected: true });
      return url.startsWith('drafts.php') ? reply({ drafts: [{ version: 2, published_at: 2 }, { version: 1, published_at: 1 }] }) : reply(score);
    },
  };
};

test('loads the latest draft by default', async () => {
  const f = fakeFetch({ ...JSON.parse(scoreText), draft: 2 });
  const r = await loadDraft(f.fetch, 'test-piece', null);
  assert.ok(r.ok);
  assert.deepEqual(r.ok && [r.version, r.versions], [2, [2, 1]]);
  assert.deepEqual(f.urls, ['drafts.php?piece=test-piece', 'draft.php?piece=test-piece&v=2&file=score.json']);
});

test('a sound effect loads like a piece of music', async () => {
  const sound = JSON.parse(readFileSync(new URL('./fixtures/score-sound-v1.json', import.meta.url), 'utf8')) as unknown;
  const r = await loadDraft(fakeFetch(sound).fetch, 'cannon-fire', 1);
  assert.ok(r.ok);
  assert.deepEqual(r.ok && [r.score.kind, r.score.project.id, r.score.duration], ['sound', 'tankity', 0.4]);
});

test('an unknown schema is refused, not drawn', async () => {
  const r = await loadDraft(fakeFetch({ ...JSON.parse(scoreText), schema: 9 }).fetch, 'test-piece', 1);
  assert.deepEqual(r.ok ? '' : r.error.slice(0, 31), 'This draft uses score schema 9,');
});

test('a lost session says so', async () => {
  const r = await loadDraft(fakeFetch(null, true).fetch, 'test-piece', null);
  assert.deepEqual(r, { ok: false, error: 'Your sign-in ended. Sign in again.' });
});

test('a sibling script is loaded with the page script\'s own query, so one version stamps both', async () => {
  const { siblingUrl } = await import('../src/load.ts');
  assert.equal(siblingUrl('https://www.cs.siue.edu/~wgrim/games/workroom/dist/workroom.js?v=abc1234567', 'sheet.js'), 'https://www.cs.siue.edu/~wgrim/games/workroom/dist/sheet.js?v=abc1234567');
  assert.equal(siblingUrl('https://x.test/dist/workroom.js', 'sheet.js'), 'https://x.test/dist/sheet.js');
});
