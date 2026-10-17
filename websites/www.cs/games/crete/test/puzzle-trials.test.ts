// Every trial parses, fits a phone, is solved within the cap, and teaches its idea; its shortest line is
// pinned so a rule change that alters a trial fails here.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TRIALS, trialLevel } from '../src/puzzle/trials.ts';
import { initial } from '../src/puzzle/state.ts';
import { solve } from '../src/puzzle/solver.ts';
import { step } from '../src/puzzle/step.ts';
import type { GameEvent } from '../src/puzzle/step.ts';
import { parse, serialize } from '../src/puzzle/level.ts';

const SHORTEST: number[] = [10, 23, 36, 28, 38, 24, 41, 38];

function solved(i: number) {
  const r = solve(initial(trialLevel(i)));
  assert.ok(r.solved, `trial ${i + 1} unsolved`);
  assert.ok(r.explored < 200_000, `trial ${i + 1} explored ${r.explored}`);
  const events: GameEvent[] = [];
  let s = initial(trialLevel(i));
  for (const a of r.line) { const x = step(s, a); s = x.state; events.push(...x.events); }
  assert.equal(s.outcome, 'won');
  return { line: r.line, events, kinds: new Set(events.map(e => e.kind)), took: new Set(events.flatMap(e => (e.kind === 'took' ? [e.what] : []))) };
}

test('eight trials, canonical text, at most 12 by 12, trial 1 at most 8 by 8', () => {
  assert.equal(TRIALS.length, 8);
  TRIALS.forEach((t, i) => {
    assert.equal(serialize(parse(t.text)), t.text, t.id);
    const lv = trialLevel(i);
    assert.ok(lv.rows <= 12 && lv.cols <= 12, t.id);
    assert.ok(lv.title && lv.intro, t.id);
    assert.ok(lv.minotaur, `${t.id} has a Minotaur`);
  });
  assert.ok(trialLevel(0).rows <= 8 && trialLevel(0).cols <= 8);
});

test('each shortest line is pinned', () => {
  assert.deepEqual(TRIALS.map((_, i) => solved(i).line.length), SHORTEST);
});

test('trial 1: walking straight to the exit gets you caught', () => {
  const lv = trialLevel(0);
  const free = solve(initial({ ...lv, minotaur: null }));
  assert.ok(free.solved);
  let s = initial(lv);
  const kinds: string[] = [];
  for (const a of free.line) { const x = step(s, a); s = x.state; kinds.push(...x.events.map(e => e.kind)); }
  assert.ok(kinds.includes('caught'));
});

test('trials 2 to 8 each need their idea', () => {
  assert.ok(trialLevel(1).relics >= 2 && trialLevel(1).terrain.includes('gate'));
  const t3 = solved(2);
  assert.ok(t3.events.filter(e => e.kind === 'opened').length >= 2 && t3.took.has('key-green'));
  const t4 = solved(3);
  assert.ok(t4.took.has('flippers') && t4.took.has('fire-boots'));
  const t5 = solved(4);
  assert.ok(t5.took.has('skates') && t5.took.has('suction') && t5.kinds.has('slid'));
  const t6 = solved(5);
  assert.ok(t6.kinds.has('pushed') && t6.kinds.has('flipped') && t6.kinds.has('sank'));
  const lv7 = trialLevel(6);
  const toolless = { ...lv7, objects: lv7.objects.map(o => (o === 'mirror' || o === 'cake' || o === 'cow' ? null : o)) };
  assert.equal(solve(initial(toolless)).solved, false, 'trial 7 needs a tool');
  assert.ok(lv7.terrain.includes('safe'));
  const t8 = solved(7);
  const ideas = [t8.kinds.has('opened'), t8.took.has('flippers') || t8.took.has('fire-boots'), t8.kinds.has('slid'), t8.kinds.has('pushed'), t8.events.some(e => e.kind === 'stoned')];
  assert.ok(ideas.filter(Boolean).length >= 4, 'the finale combines at least four ideas');
});
