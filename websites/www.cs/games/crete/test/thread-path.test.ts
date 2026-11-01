// Ariadne's thread is the squares Theseus crosses, one step at a time: every slid square is on it, and a teleport
// or a throw-back breaks it instead of cutting through walls. Each square points the way to step next, and a
// play-out walks exactly the thread.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createGame } from '../src/game.ts';
import { createFoundPages } from '../src/pages.ts';
import { CAMPAIGN_LEVELS } from '../src/campaign/chapters.ts';
import { createProgress } from '../src/progress.ts';
import { manualClock } from '../../_kit/test/clock.ts';
import { NEXT_SCALE, PULSE_S, arrowAt, nextArrow, pulseScale, threadPath } from '../src/thread-path.ts';
import type { ThreadCell } from '../src/thread-path.ts';
import { DIRS } from '../src/puzzle/tiles.ts';
import { grid, mv, WAIT } from './puzzle-grid.ts';
import { createThread } from '../src/modern/scene/thread.ts';
import type { Group, Mesh } from 'three';

function harness() {
  const m = manualClock();
  const game = createGame({
    sfx() {}, say() {}, progress: createProgress(null), pages: createFoundPages(null), levels: CAMPAIGN_LEVELS, timers: m.timers, clock: m.clock, reducedMotion: () => false, changed() {},
  });
  return { game, advance: m.advance };
}

/** Every pair of squares on the thread is one step apart, unless the second is a jump. */
function stepwise(t: readonly ThreadCell[], where: string): void {
  for (let i = 1; i < t.length; i++) {
    const d = Math.abs(t[i]!.r - t[i - 1]!.r) + Math.abs(t[i]!.c - t[i - 1]!.c);
    if (!t[i]!.jump) assert.equal(d, 1, `${where}: square ${i - 1} → ${i} is not one step: ${JSON.stringify(t[i - 1])} → ${JSON.stringify(t[i])}`);
  }
}

test('a slide and a force floor put every square crossed on the thread', () => {
  assert.deepEqual(threadPath(grid(['P===.#']), [mv('right')]), [{ r: 0, c: 0 }, { r: 0, c: 1 }, { r: 0, c: 2 }, { r: 0, c: 3 }, { r: 0, c: 4 }]);
  assert.deepEqual(threadPath(grid(['P.', 'v.', 'v.', '#.']), [mv('down')]), [{ r: 0, c: 0 }, { r: 1, c: 0 }, { r: 2, c: 0 }]);
});

test('a teleport breaks the thread; it never runs through the squares between', () => {
  // Into the left teleport heading right: out beyond the right one.
  const t = threadPath(grid(['P@#@..E']), [mv('right'), mv('right')]);
  stepwise(t, 'teleport');
  assert.deepEqual(t.map(c => [c.c, !!c.jump]), [[0, false], [1, false], [4, true], [5, false]]);
  assert.equal(arrowAt(t, 0), 'right');
  assert.equal(arrowAt(t, 1), null, 'no arrow into a jump');
  assert.equal(arrowAt(t, 2), 'right');
  assert.equal(arrowAt(t, 3), null, 'none at the end');
});

test('a catch that throws Theseus back breaks the thread at his landing square', () => {
  // He steps onto the Minotaur's square and is thrown back to the start.
  const s = grid(['P.M#', '####'], 'hearts: 2');
  const t = threadPath(s, [mv('right'), mv('right')]);
  stepwise(t, 'catch');
  assert.ok(t.some(c => c.jump), 'the throw-back is a jump');
});

test('the arrows point the way to step next', () => {
  const t: ThreadCell[] = [{ r: 1, c: 1 }, { r: 0, c: 1 }, { r: 0, c: 2 }, { r: 1, c: 2 }, { r: 1, c: 1 }];
  assert.deepEqual(t.map((_, i) => arrowAt(t, i)), ['up', 'right', 'down', 'left', null]);
});

test('every campaign level\'s thread steps square by square, from the start and after a few moves', () => {
  const h = harness();
  for (let i = 0; i < CAMPAIGN_LEVELS.count; i++) {
    const id = CAMPAIGN_LEVELS.id(i);
    h.game.open(i);
    h.game.route();
    const t = h.game.thread;
    assert.ok(t && t.length > 1, `${id}: a thread`);
    stepwise(t, `${id} start`);
    assert.deepEqual(t[0], h.game.run!.now.player, `${id}: it starts under Theseus`);
    // Three steps along it, then a step off it where there is one: the thread is drawn again from there.
    for (let k = 0; k < 3; k++) h.game.hint();
    const at = h.game.run!.now.player;
    const next = h.game.thread?.[1];
    for (const d of DIRS) {
      const before = h.game.run!.now;
      h.game.press(mv(d));
      if (h.game.run!.now !== before && !(next && h.game.run!.now.player.r === next.r && h.game.run!.now.player.c === next.c)) break;
      if (h.game.run!.now !== before) h.game.press('undo');
    }
    if (h.game.run!.now.outcome !== 'playing') continue;
    if (!h.game.thread) h.game.route();
    if (!h.game.thread) continue;
    stepwise(h.game.thread, `${id} after moves from ${JSON.stringify(at)}`);
    h.game.press(WAIT);
  }
});

test('a play-out walks exactly the thread, a throw-back included', () => {
  const h = harness();
  for (const id of ['trial-1', 'trial-7']) {
    const i = Array.from({ length: CAMPAIGN_LEVELS.count }, (_, k) => CAMPAIGN_LEVELS.id(k)).indexOf(id);
    h.game.open(i);
    h.game.route();
    const t = h.game.thread!;
    h.game.auto();
    for (let n = 0; n < 2000 && h.game.playing; n++) h.advance(100);
    const run = h.game.run!;
    assert.equal(run.now.outcome, 'won', `${id}: the play-out wins`);
    // Each turn's square, in order, is a square of the thread, at or after the last one found.
    let k = 0;
    for (const s of [...run.past, run.now]) {
      while (k < t.length && (t[k]!.r !== s.player.r || t[k]!.c !== s.player.c)) k++;
      assert.ok(k < t.length, `${id}: the play-out left the thread at ${JSON.stringify(s.player)}`);
    }
    assert.equal(k, t.length - 1, `${id}: it ends where the thread ends`);
  }
});

test('Modern lays an arrow on each square that has a next step, the next one apart and gold, and no cord across a jump', () => {
  const th = createThread();
  // Two steps right, a jump down two rows, one step left.
  const t: ThreadCell[] = [{ r: 0, c: 0 }, { r: 0, c: 1 }, { r: 0, c: 2 }, { r: 2, c: 2, jump: true }, { r: 2, c: 1 }];
  assert.equal(th.set(t, 3, 3), true);
  const kids = th.group.children;
  assert.equal(kids.length, 4, 'the cord, the arrows\' dark edges, their fills, and the next step\'s arrow');
  const [cord, edges, fills] = (kids.slice(0, 3) as Mesh[]).map(m => m.geometry.getAttribute('position'));
  // An arrowhead is two triangles, six corners unindexed: one per square that steps on, past Theseus's own.
  assert.equal(fills!.count, 2 * 6);
  assert.equal(edges!.count, 2 * 6);
  const next = kids[3] as Group;
  assert.deepEqual(th.next(), { dir: 'right', scale: NEXT_SCALE });
  for (const m of next.children as Mesh[]) assert.equal((m.material as { depthTest: boolean }).depthTest, false, 'drawn through Theseus');
  assert.equal(th.pulse(PULSE_S / 2), true);
  assert.ok(Math.abs(th.next()!.scale - NEXT_SCALE * 1.1) < 1e-9, 'it swells by a tenth at the top of its breath');
  // No cord vertex lies between the rows the jump skips.
  for (let i = 0; i < cord!.count; i++) {
    const z = cord!.getZ(i);
    assert.ok(Math.abs(z) > 0.5, `cord at z ${z} crosses the jump`);
  }
  assert.equal(th.set(t, 3, 3), false, 'the same thread again changes nothing');
  th.dispose();
});

test('the next step is the arrow on Theseus\'s square, or the way his first step goes when it lands on a jump', () => {
  assert.equal(nextArrow([{ r: 1, c: 1 }, { r: 0, c: 1 }, { r: 0, c: 2 }]), 'up');
  assert.equal(nextArrow([{ r: 1, c: 1 }]), null, 'no thread, no next step');
  assert.equal(nextArrow([{ r: 1, c: 1 }, { r: 3, c: 3, jump: true }]), null, 'a jump with no way recorded');
  assert.equal(nextArrow([{ r: 1, c: 1, way: 'left' }, { r: 3, c: 3, jump: true }]), 'left');
});

test('the next step breathes once a PULSE_S, from rest to a tenth bigger and back', () => {
  assert.equal(pulseScale(0), 1);
  assert.ok(Math.abs(pulseScale(PULSE_S / 2) - 1.1) < 1e-9);
  assert.ok(Math.abs(pulseScale(PULSE_S) - 1) < 1e-9);
  assert.equal(PULSE_S, 1.2);
  assert.equal(NEXT_SCALE, 1.4);
});

test('the next step moves on as Theseus walks the Route: the thread is drawn again from where he stands', () => {
  const h = harness();
  h.game.open(0);
  h.game.route();
  const first = h.game.thread!;
  const way = nextArrow(first);
  assert.ok(way, 'a next step from the start');
  const from = h.game.run!.now.player;
  h.game.press(mv(way!));
  h.game.finishAnim();
  const now = h.game.thread!;
  const at = h.game.run!.now.player;
  assert.notDeepEqual(at, from, 'he took the step');
  assert.equal(now[0]!.r, at.r);
  assert.equal(now[0]!.c, at.c, 'the thread starts again under him');
  assert.ok(nextArrow(now), 'and its next step is the arrow on his new square');
});
