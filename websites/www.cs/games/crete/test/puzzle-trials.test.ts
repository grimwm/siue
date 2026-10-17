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
import type { Level } from '../src/puzzle/level.ts';
import type { ObjectKind, Terrain } from '../src/puzzle/tiles.ts';

const SHORTEST: number[] = [10, 23, 36, 28, 23, 24, 22, 31];

/** The level with every object of these kinds taken off the board. */
const withoutObjects = (lv: Level, kinds: readonly ObjectKind[]): Level => ({ ...lv, objects: lv.objects.map(o => (o && kinds.includes(o) ? null : o)) });
/** The level with the terrain of these kinds replaced. */
const retile = (lv: Level, from: readonly Terrain[], to: Terrain): Level => ({ ...lv, terrain: lv.terrain.map(t => (from.includes(t) ? to : t)) });
const unsolved = (lv: Level) => !solve(initial(lv)).solved;

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
  const lv2 = trialLevel(1);
  assert.ok(lv2.relics >= 2 && lv2.terrain.includes('gate'));
  assert.ok(unsolved(withoutObjects(lv2, ['relic'])), 'the gate needs its relics');

  const lv3 = trialLevel(2);
  const t3 = solved(2);
  assert.ok(t3.events.filter(e => e.kind === 'opened').length >= 2 && t3.took.has('key-green'));
  for (const k of ['key-red', 'key-blue', 'key-green'] as const) assert.ok(unsolved(withoutObjects(lv3, [k])), `trial 3 needs ${k}`);

  const lv4 = trialLevel(3);
  const t4 = solved(3);
  assert.ok(t4.took.has('flippers') && t4.took.has('fire-boots'));
  assert.ok(unsolved(withoutObjects(lv4, ['flippers'])), 'trial 4 needs the flippers');
  assert.ok(unsolved(withoutObjects(lv4, ['fire-boots'])), 'trial 4 needs the fire boots');

  const lv5 = trialLevel(4);
  const t5 = solved(4);
  assert.ok(t5.took.has('skates') && t5.took.has('suction'));
  assert.ok(unsolved(withoutObjects(lv5, ['skates'])), 'trial 5 needs the skates');
  assert.ok(unsolved(withoutObjects(lv5, ['suction'])), 'trial 5 needs the suction boots');
  const alone = { ...lv5, minotaur: null };
  assert.ok(solve(initial(alone)).solved, 'trial 5 is winnable without the Minotaur');
  assert.ok(unsolved(withoutObjects(alone, ['skates'])), 'the ice needs the skates even without the Minotaur');
  assert.ok(unsolved(withoutObjects(alone, ['suction'])), 'the conveyor needs the suction boots even without the Minotaur');

  const lv6 = trialLevel(5);
  const t6 = solved(5);
  assert.ok(t6.kinds.has('pushed') && t6.kinds.has('flipped') && t6.kinds.has('sank'));
  assert.ok(unsolved(withoutObjects(lv6, ['block'])), 'trial 6 needs a block');
  const base6 = solve(initial(lv6));
  for (const to of ['floor', 'wall'] as const) {
    const r = solve(initial(retile(lv6, ['toggle-open', 'toggle-closed'], to)));
    assert.ok(!r.solved || r.line.length !== (base6.solved ? base6.line.length : -1), `the toggle walls matter (as ${to})`);
  }
  assert.ok(unsolved(retile(lv6, ['button'], 'wall')), 'trial 6 needs the plate');

  const lv7 = trialLevel(6);
  assert.ok(unsolved(withoutObjects(lv7, ['mirror', 'cow', 'cake'])), 'trial 7 needs a tool');
  assert.ok(unsolved(withoutObjects(lv7, ['cow'])), 'trial 7 needs the cow');
  assert.ok(unsolved(withoutObjects(lv7, ['mirror'])), 'trial 7 needs the mirror');
  assert.ok(lv7.objects.includes('cake'), 'trial 7 has a cake');
  assert.ok(lv7.terrain.includes('safe'));
  const t7 = solved(6);
  const noSafe = solve(initial({ ...lv7, terrain: lv7.terrain.map(t => (t === 'safe' ? 'floor' : t)) }));
  assert.ok(!noSafe.solved || noSafe.line.length > t7.line.length, 'the safe zones matter');
  assert.ok(t7.kinds.has('stoned') && t7.took.has('cow'));
  const t8 = solved(7);
  const others = [t8.kinds.has('opened'), t8.took.has('flippers') || t8.took.has('fire-boots'), t8.kinds.has('stoned')];
  const lv8 = trialLevel(7);
  assert.ok(t8.kinds.has('pushed'), 'the finale pushes its block');
  for (const k of ['key-red', 'mirror', 'block', 'flippers'] as const) assert.ok(unsolved(withoutObjects(lv8, [k])), `trial 8 needs ${k}`);
  assert.ok(others.filter(Boolean).length >= 3, 'the finale combines three more ideas');
});
