// The generator's version pin. A shared level is verified by making it again from its tuple, so every device that
// says it runs ENDLESS_VERSION must make the same level from the same tuple. This test runs one part of a search,
// short, and pins what it came to (the level, the changes tried, the situations spent) to the version, and the same
// part as each older version this generator still makes again (VERSIONS) made it. When it fails, the generator now
// makes other levels: bump ENDLESS_VERSION in src/endless/provenance.ts, add the new number to `accept` in
// games/crete/bank/config.json, and record the new fingerprint here under it.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makePart, searchPart } from '../src/endless/generate.ts';
import type { Part, Request } from '../src/endless/generate.ts';
import { BANKS } from '../src/endless/bank.ts';
import { knownOf } from '../src/endless/gate.ts';
import { campaignLevels } from '../src/endless/campaign.ts';
import { hash } from '../src/endless/random.ts';
import { ENDLESS_VERSION, VERSIONS } from '../src/endless/provenance.ts';
import { readFileSync } from 'node:fs';

/** Each version's fingerprint of the pinned part. */
const PINS: Readonly<Record<number, number>> = { 1: 2177071660, 2: 3104804482, 3: 2308448240 };

const b = BANKS.hard[20]!;
const PINNED: Request = { seed: 'pin', tier: 9, grade: 'hard', depth: 7, run: [{ text: b.text, explored: b.explored, score: b.score }], budget: 12 * 150_000 };
const print = (p: Part) => hash('pin', p.found?.text ?? '', p.tries, p.spent);

test('the generator makes what its version says it makes', () => {
  // Hard's part 1, grown from a Medium search since version 3.
  const p = print(makePart(PINNED, 1, knownOf(campaignLevels())));
  assert.equal(p, PINS[ENDLESS_VERSION], `the generator changed (fingerprint ${p}): bump ENDLESS_VERSION and pin it`);
});

test('the generator still makes what version 2 made: its parts were all searches for drafts', () => {
  assert.ok(VERSIONS.includes(2));
  const p = print(searchPart(PINNED, 1, knownOf(campaignLevels())));
  assert.equal(p, PINS[2], `the search for a draft changed (fingerprint ${p}): version 2's levels no longer verify`);
});

test('the shared bank accepts the version the page runs', () => {
  const config = JSON.parse(readFileSync(new URL('../bank/config.json', import.meta.url), 'utf8')) as { accept: number[] };
  assert.ok(config.accept.includes(ENDLESS_VERSION));
});
