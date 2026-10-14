// Where drones may stand: the playable box, the clear spots, the entry edges.
// src/playfield.ts is arithmetic on numbers the page measured, driven here
// with a seeded random source; no browser is involved.
import * as pf from '../src/playfield.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';


/** Mulberry32, so a failure repeats. */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const BOT = { w: 44, h: 56 };
const view = { scrollX: 0, scrollY: 0, width: 1280, height: 860, navBottom: 76 };

// The box: below the nav, inside a margin, wide enough for a whole drone.
const b = pf.visibleBounds(view, BOT);
await test('bounds-left-top', () => { assert.ok(b.left === 10 && b.top === 86, JSON.stringify(b)); });
await test('bounds-right-bottom', () => { assert.ok(b.right === 1280 - 44 - 10 && b.bottom === 860 - 56 - 10 - 6, JSON.stringify(b)); });
await test('bounds-follow-the-scroll', () => { assert.ok(pf.visibleBounds({ ...view, scrollY: 400 }, BOT).top === 486, ''); });
await test('bounds-clear-a-tall-nav', () => { assert.ok(pf.visibleBounds({ ...view, navBottom: 200 }, BOT).top === 210, ''); });
const tiny = pf.visibleBounds({ ...view, width: 20, height: 20 }, BOT);
await test('bounds-never-invert', () => { assert.ok(tiny.right >= tiny.left && tiny.bottom >= tiny.top, JSON.stringify(tiny)); });

// Clamp and containment.
const c = pf.clampToBounds(b, -50, 9999);
await test('clamp-pulls-in', () => { assert.ok(c.x === b.left && c.y === b.bottom, JSON.stringify(c)); });
await test('clamp-leaves-inside-alone', () => { assert.ok(pf.clampToBounds(b, 300, 300).x === 300, ''); });
await test('in-bounds-allows-two-pixels', () => { assert.ok(pf.isInBounds(b, b.left - 2, b.top) && !pf.isInBounds(b, b.left - 3, b.top), ''); });

// Rectangles.
const r1 = { left: 0, top: 0, right: 10, bottom: 10 };
await test('overlap-touching-edges-count', () => { assert.ok(pf.rectsOverlap(r1, { left: 10, top: 10, right: 20, bottom: 20 }), ''); });
await test('overlap-apart-does-not', () => { assert.ok(!pf.rectsOverlap(r1, { left: 11, top: 0, right: 20, bottom: 10 }), ''); });
await test('inflate-grows-every-side', () => { assert.ok(JSON.stringify(pf.inflate(r1, 5)) === '{"left":-5,"top":-5,"right":15,"bottom":15}', ''); });
await test('bot-rect-is-its-box', () => { assert.ok(JSON.stringify(pf.botPageRect(3, 4, BOT)) === '{"left":3,"top":4,"right":47,"bottom":60}', ''); });

// Safe spots: inside the page, clear of links.
const doc = { w: 1280, h: 2000 };
const link = pf.inflate({ left: 400, top: 300, right: 600, bottom: 340 }, 28);
await test('safe-spot-in-the-open', () => { assert.ok(pf.isSafeSpot(100, 200, [link], doc, BOT), ''); });
await test('unsafe-on-a-link', () => { assert.ok(!pf.isSafeSpot(450, 310, [link], doc, BOT), ''); });
await test('unsafe-next-to-a-link-within-the-pad', () => { assert.ok(!pf.isSafeSpot(360, 300, [link], doc, BOT), ''); });
await test('unsafe-above-the-nav-line', () => { assert.ok(!pf.isSafeSpot(100, 60, [], doc, BOT), ''); });
await test('unsafe-past-the-right-edge', () => { assert.ok(!pf.isSafeSpot(1240, 200, [], doc, BOT), ''); });
await test('unsafe-past-the-bottom', () => { assert.ok(!pf.isSafeSpot(100, 1950, [], doc, BOT), ''); });

// Entry spots: thirty, ten per edge, all in the box, reproducible by seed.
const spots = pf.candidateSpots(b, seeded(7));
const perEdge = (e: string) => spots.filter(s => s.edge === e).length;
await test('thirty-entry-spots', () => { assert.ok(spots.length === 30 && perEdge('left') === 10 && perEdge('right') === 10 && perEdge('bottom') === 10, JSON.stringify(spots.map(s => s.edge))); });
await test('entry-spots-inside-the-box', () => { assert.ok(spots.every(s => pf.isInBounds(b, s.x, s.y)), ''); });
await test('entry-spots-hug-their-edge', () => { assert.ok(spots.filter(s => s.edge === 'left').every(s => s.x === b.left)
  && spots.filter(s => s.edge === 'right').every(s => s.x === b.right), ''); });
await test('entry-spots-are-shuffled', () => {
  const first = spots[0];
  assert.ok(first);
  assert.ok(spots.slice(0, 10).some(s => s.edge !== first.edge), '');
});
await test('entry-spots-repeat-by-seed', () => { assert.ok(JSON.stringify(pf.candidateSpots(b, seeded(7))) === JSON.stringify(spots), ''); });

// Finding a spot: a clear one near the drone, back into view when it is off screen.
const field = { bounds: b, forbidden: [link], doc, bot: BOT };
let unsafePatrols = 0;
for (let seed = 1; seed <= 40; seed++) {
  const rng = seeded(seed);
  const patrol = pf.findSafeSpot(field, { x: 500, y: 320 }, rng);
  if (!patrol || !pf.isSafeSpot(patrol.x, patrol.y, field.forbidden, doc, BOT) || !pf.isInBounds(b, patrol.x, patrol.y)) {
    unsafePatrols++;
    await test(`find-safe-spot-near-seed-${seed}`, () => { assert.ok(false, JSON.stringify(patrol)); });
  }
}
await test('find-safe-spot-near-always-clear', () => { assert.ok(unsafePatrols === 0, ''); });
const patrolSpot = pf.findSafeSpot(field, { x: 300, y: 500 }, seeded(3));
await test('patrol-step-stays-near', () => { assert.ok(patrolSpot); assert.ok(patrolSpot.edge === 'patrol' && Math.abs(patrolSpot.x - 300) <= 100 && Math.abs(patrolSpot.y - 500) <= 70, JSON.stringify(patrolSpot)); });
const back = pf.findSafeSpot(field, { x: -900, y: 5000 }, seeded(3));
await test('off-screen-drone-is-sent-back-into-view', () => { assert.ok(back); assert.ok(back.edge === 'return' && pf.isInBounds(b, back.x, back.y), JSON.stringify(back)); });
const entry = pf.findSafeSpot(field, null, seeded(3));
await test('no-drone-means-an-entry-edge', () => { assert.ok(entry); assert.ok(['left', 'right', 'bottom'].includes(entry.edge), JSON.stringify(entry)); });
const walled = { ...field, forbidden: [{ left: -1e6, top: -1e6, right: 1e6, bottom: 1e6 }] };
await test('nowhere-to-stand-is-null', () => { assert.ok(pf.findSafeSpot(walled, null, seeded(3)) === null && pf.randomVisibleSpot(walled, seeded(3)) === null, ''); });
await test('same-seed-same-spot', () => { assert.ok(JSON.stringify(pf.findSafeSpot(field, { x: 300, y: 500 }, seeded(9))) === JSON.stringify(pf.findSafeSpot(field, { x: 300, y: 500 }, seeded(9))), ''); });

// Where the march begins: just outside the box on the entry side.
await test('march-from-the-left', () => { assert.ok(JSON.stringify(pf.marchOrigin(b, { x: b.left, y: 300, edge: 'left' }, BOT)) === JSON.stringify({ x: b.left - 44 + 6, y: 300 }), ''); });
await test('march-from-the-right', () => { assert.ok(JSON.stringify(pf.marchOrigin(b, { x: b.right, y: 300, edge: 'right' }, BOT)) === JSON.stringify({ x: b.right + 44 - 6, y: 300 }), ''); });
await test('march-from-below', () => { assert.ok(JSON.stringify(pf.marchOrigin(b, { x: 500, y: b.bottom, edge: 'bottom' }, BOT)) === JSON.stringify({ x: 500, y: b.bottom + 56 - 6 }), ''); });
