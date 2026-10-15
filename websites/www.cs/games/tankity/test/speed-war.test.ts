// The game speed changes how fast a solo match plays, never how it ends: the
// same seed and the same shots give the same match at 1×, 2× and 4×, because
// a faster game runs more of the same fixed SOLO_STEP steps per frame
// (match.ts warFrame) and never a longer step. The frame below is main.ts's
// solo frame with the page left out: game time is the frame's time at the
// speed, for the name cards, the effects, the falls and the war.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { WAR_REST } from '../src/flow.ts';
import type { GameState } from '../src/game-types.ts';
import { harness, nth } from './match-harness.ts';
import type { Match } from './match-harness.ts';

/** The player's shots, in turn: [angle, power]. */
const SHOTS: readonly (readonly [number, number])[] = [[62, 58], [118, 64], [75, 71], [50, 49], [101, 80], [68, 66], [130, 55], [84, 62]];

/** Plays `seed` until the match ends or the player has fired every shot and
 * the war has handed the turn back; answers what the match came to and the
 * frames it took. */
function play(seed: string, speed: number, dt: number) {
  const { G, match } = harness({ difficulty: { get: () => 'normal' } });
  match.startSolo(seed);
  let acc = WAR_REST, shot = 0, frames = 0;
  for (; frames < 2_000_000 && !G.over; frames++) {
    const gdt = dt * speed;
    match.tickBanner(gdt);
    if (G.phase === 'banner') continue;
    if (G.phase === 'shop') { match.nextRound(); continue; }
    match.checkOneUps();
    match.decayFx(gdt);
    const war = G.phase === 'think' || G.phase === 'fly' || G.phase === 'settle';
    if (!war) match.fallTanks(gdt);
    if (G.phase === 'aim' && nth(G.tanks, 0).isPlayer && G.turn === 0) {
      if (shot === SHOTS.length) break;
      const [a, p] = SHOTS[shot++]!;
      nth(G.tanks, 0).angle = a;
      nth(G.tanks, 0).power = p;
      match.playerFire();
      acc = WAR_REST;
    } else if (war) {
      acc = match.warFrame(acc, gdt, speed);
    } else {
      acc = WAR_REST;
    }
  }
  return { end: endState(G, match), frames, shots: shot };
}

function endState(G: GameState, match: Match) {
  return {
    over: G.over, won: G.won, phase: G.phase, round: G.round, turn: G.turn, wind: G.wind,
    score: G.score, cash: G.cash, lives: G.lives, roundsWon: G.roundsWon, ammo: G.ammo,
    terrain: G.terrain.map(v => Math.round(v * 1e6) / 1e6),
    tanks: G.tanks.map(t => ({ id: t.id, x: t.x, y: t.y, hp: t.hp, angle: t.angle, power: t.power, fuel: t.fuel })),
    // The match's own dice: the next draw is the same only when every draw before it was.
    next: G.rng!(),
    falls: match.fallsPending(),
  };
}

for (const seed of ['speed-hills', 'scorched-4471']) {
  test(`${seed}: the same shots end the same at 1×, 2× and 4×`, () => {
    const one = play(seed, 1, 1 / 60);
    assert.ok(one.shots > 2, `the match ran ${one.shots} shots`);
    for (const speed of [2, 4]) {
      const fast = play(seed, speed, 1 / 60);
      assert.deepEqual(fast.end, one.end, `${speed}×`);
      // Fewer frames: the same war, sooner. Name cards and the settle wait round to a frame either way.
      assert.ok(fast.frames < one.frames * (1.2 / speed) + 60, `${speed}×: ${fast.frames} frames vs ${one.frames}`);
    }
  });
}

test('a slow 30 Hz screen at 4× ends the same as 60 Hz at 1×', () => {
  assert.deepEqual(play('speed-hills', 4, 1 / 30).end, play('speed-hills', 1, 1 / 60).end);
});
