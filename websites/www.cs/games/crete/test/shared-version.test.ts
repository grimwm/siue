// The generator's version pin. A shared level is verified by making it again from its tuple, so every device that
// says it runs ENDLESS_VERSION must make the same level from the same tuple. This test runs one part of a search,
// short, and pins what it came to (the level, the changes tried, the situations spent) to the version. When it fails,
// the generator now makes other levels: bump ENDLESS_VERSION in src/endless/provenance.ts, add the new number to
// `accept` in games/crete/bank/config.json, and record the new fingerprint here under it.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makePart } from '../src/endless/generate.ts';
import { BANKS } from '../src/endless/bank.ts';
import { knownOf } from '../src/endless/gate.ts';
import { campaignLevels } from '../src/endless/campaign.ts';
import { hash } from '../src/endless/random.ts';
import { ENDLESS_VERSION } from '../src/endless/provenance.ts';
import { readFileSync } from 'node:fs';

/** Each version's fingerprint of the pinned part. */
const PINS: Readonly<Record<number, number>> = { 1: 2177071660, 2: 1764154521 };

test('the generator makes what its version says it makes', () => {
  const b = BANKS.hard[20]!;
  const p = makePart({ seed: 'pin', tier: 9, grade: 'hard', depth: 7, run: [{ text: b.text, explored: b.explored, score: b.score }], budget: 12 * 150_000 }, 1, knownOf(campaignLevels()));
  const print = hash('pin', p.found?.text ?? '', p.tries, p.spent);
  assert.equal(print, PINS[ENDLESS_VERSION], `the generator changed (fingerprint ${print}): bump ENDLESS_VERSION and pin it`);
});

test('the shared bank accepts the version the page runs', () => {
  const config = JSON.parse(readFileSync(new URL('../bank/config.json', import.meta.url), 'utf8')) as { accept: number[] };
  assert.ok(config.accept.includes(ENDLESS_VERSION));
});
