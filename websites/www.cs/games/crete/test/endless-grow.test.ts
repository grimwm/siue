// Growing a Hard level from a Medium one (src/endless/grow.ts, generate.ts's grownPart): the climb is drawn from its
// seed and its parent's text alone, so it grows the same level byte for byte every time; what it grows passes Hard's
// whole gate in Hard's band; a grown tuple (provenance.ts) is made again by making its parent again and replaying
// the climb, a Medium level's Hard child included, while a version 2 tuple is still made as version 2 made it.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { grow, sketchOf } from '../src/endless/grow.ts';
import { textOf } from '../src/endless/draft.ts';
import { growOf, makePart, placeOf, GROWN_STEPS } from '../src/endless/generate.ts';
import type { Made, Part, Request } from '../src/endless/generate.ts';
import { BANKS } from '../src/endless/bank.ts';
import { GRADE_BANDS, gateProblems, knownOf } from '../src/endless/gate.ts';
import { campaignLevels } from '../src/endless/campaign.ts';
import { measure, hidesWalls } from '../src/puzzle/difficulty.ts';
import { parse } from '../src/puzzle/level.ts';
import { ENDLESS_VERSION, childOf, grownOf, regenerate, remake, requestOf, sameMade, takes, tupleOf } from '../src/endless/provenance.ts';
import type { Tuple } from '../src/endless/provenance.ts';
import { createEndlessHost } from '../src/endless/host.ts';
import type { FromEndless } from '../src/endless/host.ts';

const known = knownOf(campaignLevels());
const HARD = { least: GRADE_BANDS.hard.plateau[0], most: GRADE_BANDS.hard.plateau[1], plateau: true };
/** A Medium level near the top of Medium's plateau that climbs into Hard's within a few dozen changes. */
const PARENT = BANKS.medium.filter(b => !hidesWalls(parse(b.text)) && b.score >= 80)[1]!;

test('a level\'s sketch reads back to its own text', () => {
  for (const b of [...BANKS.medium, ...BANKS.hard]) assert.equal(textOf(sketchOf(parse(b.text), b.text), ''), b.text);
});

test('a climb grows the same level every time, and what it grows passes Hard\'s whole gate in its band', () => {
  const a = grow(PARENT.text, { grade: 'hard', band: HARD }, ['exp', 1], GROWN_STEPS, known);
  const b = grow(PARENT.text, { grade: 'hard', band: HARD }, ['exp', 1], GROWN_STEPS, known);
  assert.deepEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b)), 'the same parent, seed and steps grow the same level');
  assert.ok(a.found, `the climb reaches Hard's band (best ${a.best} in ${a.tries} changes; pick another parent if the gate changed)`);
  assert.ok(a.found.score >= HARD.least && a.found.score <= HARD.most);
  assert.ok(a.kept >= 1 && a.found.score > PARENT.score, 'it climbed');
  assert.notEqual(a.found.text, PARENT.text);
  const level = parse(a.found.text);
  assert.deepEqual(gateProblems(level, measure(level), { grade: 'hard', band: HARD, previous: null }, known), [], 'the whole gate at Hard');
  const other = grow(PARENT.text, { grade: 'hard', band: HARD }, ['test', 2], 20, known);
  assert.notDeepEqual(other.found?.text ?? other.best, a.found.text, 'another seed climbs another way');
});

test('a climb that runs out of changes makes nothing; a parent already in the band is the level', () => {
  const none = grow(PARENT.text, { grade: 'hard', band: { least: 1000, most: 2000, plateau: true } }, ['test'], 5, known);
  assert.equal(none.found, null);
  assert.equal(none.tries, 5);
  const at = grow(PARENT.text, { grade: 'medium', band: { least: 0, most: 1000, plateau: true } }, ['test'], 50, known);
  assert.equal(at.found?.text, PARENT.text);
  assert.equal(at.tries, 0);
});

/** A stand-in for the parent's search: PARENT, found at once, as part k of any request. */
const parentSearch = (calls: { req: Request; k: number; hides?: boolean }[]) => (req: Request, k: number, _known: unknown, o?: { hides?: boolean }): Part => {
  calls.push({ req, k, hides: o?.hides });
  const found: Made = { text: PARENT.text, explored: PARENT.explored, shortest: PARENT.shortest, score: PARENT.score, line: PARENT.line, from: 'made', tries: 3, spent: 1000 };
  return { found, tries: 3, spent: 1000 };
};
const before = BANKS.hard.find(b => b.score >= HARD.least && !hidesWalls(parse(b.text)))!;
const plateauTuple = (k: number): Tuple => ({ ...tupleOf({ seed: 'grown1', tier: 9, grade: 'hard', depth: 8, run: [{ text: before.text, explored: before.explored, score: before.score }] }, k)! });
const NONE = { features: [] };

test('a Hard search\'s odd parts are grown from a Medium search at the same place, and their tuples say so', () => {
  assert.deepEqual(growOf({ grade: 'hard' }, 1), { from: 'medium', seed: 'part', steps: GROWN_STEPS });
  assert.equal(growOf({ grade: 'hard' }, 2), null);
  assert.equal(growOf({ grade: 'medium' }, 1), null);
  const t = plateauTuple(3);
  assert.equal(t.v, ENDLESS_VERSION);
  assert.deepEqual(t.grow, { from: 'medium', seed: 'part', steps: GROWN_STEPS });
  assert.equal(plateauTuple(4).grow, undefined);
  assert.ok(takes(t));
  assert.equal(takes({ ...t, v: 2 }), false, 'version 2 grew nothing');
  assert.equal(takes({ ...t, grow: { ...t.grow!, from: 'hard' } }), false, 'a climb starts from an easier grade');
  assert.equal(takes({ ...t, grow: { ...t.grow!, steps: 1001 } }), false);
  assert.equal(takes({ ...t, grow: { ...t.grow!, seed: 'No' } }), false);
});

test('a grown tuple is made again by making its parent again and replaying the climb', () => {
  const t = plateauTuple(3);
  assert.equal(placeOf(requestOf(t)).hides, false, 'a plain place (pick another seed if the seed hides walls here)');
  assert.ok(placeOf(requestOf(t)).band.plateau);
  const calls: { req: Request; k: number; hides?: boolean }[] = [];
  const g = grownOf(t as Tuple & { grow: NonNullable<Tuple['grow']> }, known, parentSearch(calls));
  assert.deepEqual(calls.map(c => [c.req.grade, c.k, c.hides]), [['medium', 3, false]], 'the parent: part k at Medium, in the Hard place');
  assert.equal(g.parent?.text, PARENT.text);
  assert.ok(g.part.found?.grown, `the climb reached Hard's band (best ${g.climb?.best})`);
  const again = remake(t, known, parentSearch([]));
  assert.equal(again.grown, true);
  assert.ok(sameMade(again.made, regenerate(t, known, parentSearch([]))), 'byte for byte, every time');
  assert.equal(again.made!.text, g.part.found!.text);
  // Without its climb the same part is a plain search, as a version 2 tuple's always was.
  const plain: { req: Request; k: number }[] = [];
  const v2 = remake({ ...t, v: 2, grow: undefined }, known, parentSearch(plain));
  assert.equal(v2.grown, false);
  assert.equal(v2.made?.text, PARENT.text);
  assert.deepEqual(plain.map(c => [c.req.grade, c.k]), [['hard', 3]]);
});

test('makePart runs a grown part as the worker does, and the worker makes a tuple again as provenance does', () => {
  // A short budget: what matters is that the two paths agree.
  const req: Request = { ...plateauTuple(1), budget: 12 * 20_000 };
  const p = makePart(req, 1, known), q = makePart(req, 1, known);
  assert.deepEqual(p, q);
  const out: FromEndless[] = [];
  const host = createEndlessHost({ post: m => out.push(m), banks: BANKS, known: () => NONE, now: () => 0 });
  const easy: Tuple = { v: ENDLESS_VERSION, seed: 'prov2', tier: 3, grade: 'easy', depth: 2, k: 0, run: [BANKS.easy.find(b => b.score >= 50 && b.score <= 60)!].map(b => ({ text: b.text, explored: b.explored, score: b.score })) };
  host.receive({ type: 'tuple', id: 4, tuple: easy });
  const m = out.at(-1)!;
  assert.equal(m.type, 'remade');
  if (m.type === 'remade') {
    assert.ok(m.found);
    assert.ok(sameMade(m.found, regenerate(easy, NONE)));
  }
});

test('a Medium part\'s level is the parent of a Hard child whose own tuple makes it again', () => {
  const medium: Tuple = { ...plateauTuple(4), grade: 'medium' };
  const child = childOf(medium);
  assert.ok(child, 'the two places agree on hiding walls (pick another seed if not)');
  assert.deepEqual({ ...child, grow: undefined }, { ...medium, grade: 'hard', grow: undefined });
  assert.deepEqual(child.grow, growOf({ grade: 'hard' }, 1));
  assert.equal(childOf(plateauTuple(4)), null, 'a Hard tuple has none');
  assert.equal(childOf({ ...medium, v: 2 }), null);
  const calls: { req: Request; k: number; hides?: boolean }[] = [];
  const r = remake(medium, known, parentSearch(calls), true);
  assert.equal(r.made?.text, PARENT.text, 'the Medium level itself');
  assert.equal(calls.length, 1, 'one search for both');
  assert.ok(r.child, 'its climb reached Hard\'s band');
  assert.notEqual(r.child.made.text, PARENT.text);
  assert.deepEqual(r.child.tuple, child);
  assert.ok(sameMade(regenerate(child, known, parentSearch([])), r.child.made), 'the child\'s tuple makes it again: its parent\'s search, then the climb');
  assert.equal(remake(medium, known, parentSearch([])).child, null, 'only when asked');
});
