/* Operation Tankity: how often a drone hits, measured with the real sim.
 *
 * One drone brackets a stationary player tank on seeded hills and wind, and
 * every volley counts as a hit when it takes armor off the player. The rates
 * the difficulty table is tuned against (test/ai-hitrate.test.mjs) come from
 * here. Pure: no page, and the same seeds give the same numbers. */
import { aiChoose } from './ai.ts';
import type { Difficulty } from './ai.ts';
import { ROOM_W, fireWeapon, genTerrain, hashSeed, mulberry32, settleFalls, spawnSpots, stepShells, surfY } from './sim.ts';
import type { Arsenal, Tank, World } from './sim.ts';

/** P(hit) per shot in a bracket: [0] the ranging shot, [1] after one correction, and so on. */
export type HitRates = number[];

/** The hills, wind and the two units' spots of case `i` on a field w wide, the same for every round and difficulty. */
function dealCase(i: number, w: number): { terrain: number[]; wind: number; px: number; dx: number; w: number } {
  const rng = mulberry32(hashSeed('hitrate-case-' + i));
  const { terrain } = genTerrain(rng, w);
  const wind = Math.round((rng() * 2 - 1) * 8);
  const [px, dx] = spawnSpots(4, rng, w);
  return { terrain, wind, px: px!, dx: dx!, w };
}

/* A world holding just the two units: the player cannot die, has no tricks,
   and the drone carries only the Shell so every shot is the aim's doing. */
function caseWorld(c: ReturnType<typeof dealCase>, round: number, difficulty: Difficulty, seed: string): World {
  const terrain = c.terrain.slice();
  const unit = (id: string, isPlayer: boolean, x: number): Tank => ({
    id, isPlayer, x, y: surfY(terrain, x), angle: 62, power: 55, hp: 1e9, fuel: 0,
    dirS: x < c.w / 2 ? 1 : -1, ammo: isPlayer ? undefined : { shell: Infinity }, s: isPlayer ? undefined : 'hunter',
  });
  return {
    tanks: [unit('tank', true, c.px), unit('drone', false, c.dx)], terrain, wind: c.wind, round,
    rng: mulberry32(hashSeed(seed)), shells: [], score: 0, cash: 0, ammo: { shell: Infinity }, selected: 'shell',
    shield: false, bunker: 0, laststand: false, jammer: 0, difficulty,
  };
}

/** The drone's hit rate per shot index over `cases` seeded cases at one round and difficulty. */
export function measureHitRates(arsenal: Arsenal, round: number, difficulty: Difficulty, cases: number, shots = 3, w = ROOM_W): HitRates {
  const hits = new Array<number>(shots).fill(0);
  for (let i = 0; i < cases; i++) {
    const world = caseWorld(dealCase(i, w), round, difficulty, `hitrate-aim-${i}-${round}`);
    const [player, drone] = world.tanks as [Tank, Tank];
    for (let k = 0; k < shots; k++) {
      const choice = aiChoose(world, arsenal, drone);
      drone.angle = choice.angle;
      drone.power = choice.power;
      const before = player.hp;
      fireWeapon(world, arsenal, drone, choice.wkey);
      for (let f = 0; world.shells.length && f < 5000; f++) stepShells(world, arsenal, 1 / 60);
      if (player.hp < before) hits[k]! += 1; // a hit is the shell's, not a fall's
      settleFalls(world, arsenal);
    }
  }
  return hits.map(h => h / cases);
}
