// How a drone picks its gun (src/ai.ts aiHarm): the aim search finds the best
// aim per planning arc, then each loaded gun is scored by the harm it would do
// at its arc's landing, and the most harmful one fires. A gun whose burst would
// reach the drone itself is never chosen. server/ai.php room_ai_harm is the
// same; protocol/sim-vectors.json holds the two together.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { blastDamage, buildArsenal, mulberry32, unitHitBox } from '../src/sim.ts';
import { AI_SUB_SHARE, aiChoose, aiHarm, fallHarm } from '../src/ai.ts';

const GAME = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, '..', 'game.json'), 'utf8'));
const arsenal = buildArsenal(GAME.arsenal);

const drone = (x, extra = {}) => ({ id: 'D' + x, isPlayer: false, x, y: 400, hp: 100, angle: 45, power: 50, dirS: 1, fuel: 80, vy: 0, ammo: {}, ...extra });
const human = x => ({ id: 'P', isPlayer: true, x, y: 400, hp: 100, angle: 45, power: 50, dirS: -1, fuel: 80, vy: 0, ammo: {} });
const world = tanks => ({ tanks, terrain: Array(720).fill(400), wind: 0, round: 9, difficulty: 'normal', score: 0, jammer: 0, rng: mulberry32(7) });
/** A landing d px from the target's body centre, on the line toward the gunner. */
const near = (target, d) => { const b = unitHitBox(target); return { x: b.cx - d, y: b.cy, oob: false }; };

test('a plain burst scores the blast it would land on the target', () => {
  const self = drone(100), target = human(500), G = world([self, target]);
  assert.equal(aiHarm(G, arsenal, self, target, 'shell', near(target, 0)), 34);
  assert.equal(aiHarm(G, arsenal, self, target, 'shell', near(target, 20)), blastDamage(34, 20, 26));
  assert.equal(aiHarm(G, arsenal, self, target, 'shell', near(target, 41)), 0, 'past the reach');
  assert.equal(aiHarm(G, arsenal, self, target, 'shell', { x: 900, y: 400, oob: true }), 0, 'a shot off the board');
});

test('Mortar beats Shell on the same arc', () => {
  const self = drone(100), target = human(500), G = world([self, target]);
  const land = near(target, 15);
  assert.ok(aiHarm(G, arsenal, self, target, 'mortar', land) > aiHarm(G, arsenal, self, target, 'shell', land));
});

test('a gun whose burst would reach the drone itself is never chosen', () => {
  const self = drone(100), target = human(150), G = world([self, target]);
  const land = { x: 150, y: 400, oob: false };
  assert.equal(aiHarm(G, arsenal, self, target, 'heavy', land), -Infinity, 'radius 52 reaches 50 px back');
  assert.equal(aiHarm(G, arsenal, self, target, 'nuke', land), -Infinity);
  assert.equal(aiHarm(G, arsenal, self, target, 'babynuke', land), -Infinity, 'Baby Nuke is refused within its reach of the landing');
  assert.ok(aiHarm(G, arsenal, self, target, 'needle', land) > 0, 'a tiny blast is safe at 50 px');
});

test('Funky beats Shell on a near miss; its bomblets count a fixed share', () => {
  const self = drone(100), target = human(500), G = world([self, target]);
  const land = near(target, 45);
  assert.equal(aiHarm(G, arsenal, self, target, 'shell', land), 0);
  const funky = aiHarm(G, arsenal, self, target, 'funky', land);
  assert.ok(funky > 0, String(funky));
  const w = arsenal.weapons.funky;
  assert.equal(aiHarm(G, arsenal, self, target, 'funky', near(target, 0)), w.dmg + AI_SUB_SHARE * w.split * w.subDmg);
});

test('a hop gun counts its first burst and a share of the leaps after it', () => {
  const self = drone(100), target = human(500), G = world([self, target]);
  const w = arsenal.weapons.leapfrog;
  assert.equal(aiHarm(G, arsenal, self, target, 'leapfrog', near(target, 0)), w.dmg + AI_SUB_SHARE * (w.hops - 1) * w.subDmg);
});

test('pellets and cluster bomblets count each sub blast at the fan\'s spread', () => {
  const self = drone(100), target = human(220), G = world([self, target]);
  const buck = aiHarm(G, arsenal, self, target, 'buck', near(target, 0));
  assert.ok(buck > 17 && buck <= 3 * 17, String(buck));
  const cluster = aiHarm(G, arsenal, self, target, 'cluster', near(target, 0));
  assert.ok(cluster > 28 && cluster <= 4 * 28, String(cluster));
});

test('the fall term waits for terrain removal to drop units: it is 0', () => {
  const self = drone(100), target = human(500), G = world([self, target]);
  assert.equal(typeof fallHarm, 'function');
  for (const k of arsenal.order) assert.equal(fallHarm(G, arsenal, self, target, k, near(target, 0)), 0, k);
});

const choose = (ammo, s = 'hunter', targetX = 330) => {
  const self = drone(120, { ammo, s }), target = human(targetX);
  return aiChoose(world([self, target]), arsenal, self);
};

test('a drone fires its most harmful loaded gun on the best arc', () => {
  assert.equal(choose({ mortar: 2 }).wkey, 'mortar');
  assert.equal(choose({ buck: 2, mortar: 2 }).wkey, 'mortar', 'ties and lesser guns on the arc lose');
  assert.equal(choose({}).wkey, 'shell');
});

test('glory takes the most harmful gun of any arc', () => {
  assert.equal(choose({ mortar: 2, heavy: 2 }, 'glory').wkey, 'heavy');
});

test('a full round-9 rack still picks a loaded gun, and never one that reaches the drone', () => {
  const self = drone(120, { ammo: {}, s: 'hunter' });
  const G = world([self, human(170)]);
  const rack = Object.fromEntries(arsenal.order.filter(k => k !== 'shell').map(k => [k, 1]));
  self.ammo = rack;
  const c = aiChoose(G, arsenal, self);
  assert.ok(c.wkey === 'shell' || rack[c.wkey] > 0, c.wkey);
  assert.ok(arsenal.weapons[c.wkey].radius + 14 < 50, `${c.wkey} would reach its own drone 50 px away`);
});
