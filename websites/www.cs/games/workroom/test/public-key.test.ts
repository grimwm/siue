// The key built into the page is the repository's current public key
// (music/keys/public.json), and its fingerprint matches its bytes.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PREVIOUS_KEYS, PUBLIC_KEY } from '../src/public-key.ts';
import { fingerprintOf } from '../src/seal.ts';
import { b64 } from './fixture-key.ts';

const FILE = join(import.meta.dirname, '..', '..', '..', 'music', 'keys', 'public.json');

test('public-key.ts and music/keys/public.json agree', async () => {
  if (!existsSync(FILE)) {
    assert.equal(PUBLIC_KEY, null, 'no key in the repository, none in the page');
    assert.deepEqual(PREVIOUS_KEYS, []);
    return;
  }
  const repo = JSON.parse(readFileSync(FILE, 'utf8')) as { current: { fingerprint: string; spki: string }; previous: { fingerprint: string; spki: string }[] };
  assert.deepEqual(PUBLIC_KEY, repo.current);
  assert.deepEqual(PREVIOUS_KEYS, repo.previous);
  for (const k of [repo.current, ...repo.previous]) assert.equal(await fingerprintOf(b64(k.spki)), k.fingerprint);
});
