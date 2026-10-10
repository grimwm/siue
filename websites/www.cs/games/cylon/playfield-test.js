// Where drones may stand: the playable box, the clear spots, the entry edges.
// Run here: `node playfield-test.js`. js/playfield.js (compiled from
// src/playfield.ts) is arithmetic on numbers the page measured, driven here
// with a seeded random source; no browser is involved.
import * as pf from './js/playfield.js';

let failed = 0;
const check = (name, ok, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${ok ? '' : ` :: ${detail}`}`);
  if (!ok) failed++;
};

/** Mulberry32, so a failure repeats. */
function seeded(seed) {
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
check('bounds-left-top', b.left === 10 && b.top === 86, JSON.stringify(b));
check('bounds-right-bottom', b.right === 1280 - 44 - 10 && b.bottom === 860 - 56 - 10 - 6, JSON.stringify(b));
check('bounds-follow-the-scroll', pf.visibleBounds({ ...view, scrollY: 400 }, BOT).top === 486, '');
check('bounds-clear-a-tall-nav', pf.visibleBounds({ ...view, navBottom: 200 }, BOT).top === 210, '');
const tiny = pf.visibleBounds({ ...view, width: 20, height: 20 }, BOT);
check('bounds-never-invert', tiny.right >= tiny.left && tiny.bottom >= tiny.top, JSON.stringify(tiny));

// Clamp and containment.
const c = pf.clampToBounds(b, -50, 9999);
check('clamp-pulls-in', c.x === b.left && c.y === b.bottom, JSON.stringify(c));
check('clamp-leaves-inside-alone', pf.clampToBounds(b, 300, 300).x === 300, '');
check('in-bounds-allows-two-pixels', pf.isInBounds(b, b.left - 2, b.top) && !pf.isInBounds(b, b.left - 3, b.top), '');

// Rectangles.
const r1 = { left: 0, top: 0, right: 10, bottom: 10 };
check('overlap-touching-edges-count', pf.rectsOverlap(r1, { left: 10, top: 10, right: 20, bottom: 20 }), '');
check('overlap-apart-does-not', !pf.rectsOverlap(r1, { left: 11, top: 0, right: 20, bottom: 10 }), '');
check('inflate-grows-every-side', JSON.stringify(pf.inflate(r1, 5)) === '{"left":-5,"top":-5,"right":15,"bottom":15}', '');
check('bot-rect-is-its-box', JSON.stringify(pf.botPageRect(3, 4, BOT)) === '{"left":3,"top":4,"right":47,"bottom":60}', '');

// Safe spots: inside the page, clear of links.
const doc = { w: 1280, h: 2000 };
const link = pf.inflate({ left: 400, top: 300, right: 600, bottom: 340 }, 28);
check('safe-spot-in-the-open', pf.isSafeSpot(100, 200, [link], doc, BOT), '');
check('unsafe-on-a-link', !pf.isSafeSpot(450, 310, [link], doc, BOT), '');
check('unsafe-next-to-a-link-within-the-pad', !pf.isSafeSpot(360, 300, [link], doc, BOT), '');
check('unsafe-above-the-nav-line', !pf.isSafeSpot(100, 60, [], doc, BOT), '');
check('unsafe-past-the-right-edge', !pf.isSafeSpot(1240, 200, [], doc, BOT), '');
check('unsafe-past-the-bottom', !pf.isSafeSpot(100, 1950, [], doc, BOT), '');

// Entry spots: thirty, ten per edge, all in the box, reproducible by seed.
const spots = pf.candidateSpots(b, seeded(7));
const perEdge = e => spots.filter(s => s.edge === e).length;
check('thirty-entry-spots', spots.length === 30 && perEdge('left') === 10 && perEdge('right') === 10 && perEdge('bottom') === 10, JSON.stringify(spots.map(s => s.edge)));
check('entry-spots-inside-the-box', spots.every(s => pf.isInBounds(b, s.x, s.y)), '');
check('entry-spots-hug-their-edge', spots.filter(s => s.edge === 'left').every(s => s.x === b.left)
  && spots.filter(s => s.edge === 'right').every(s => s.x === b.right), '');
check('entry-spots-are-shuffled', spots.slice(0, 10).some(s => s.edge !== spots[0].edge), '');
check('entry-spots-repeat-by-seed', JSON.stringify(pf.candidateSpots(b, seeded(7))) === JSON.stringify(spots), '');

// Finding a spot: a clear one near the drone, back into view when it is off screen.
const field = { bounds: b, forbidden: [link], doc, bot: BOT };
for (let seed = 1; seed <= 40; seed++) {
  const rng = seeded(seed);
  const patrol = pf.findSafeSpot(field, { x: 500, y: 320 }, rng);
  if (!patrol || !pf.isSafeSpot(patrol.x, patrol.y, field.forbidden, doc, BOT) || !pf.isInBounds(b, patrol.x, patrol.y)) {
    check(`find-safe-spot-near-seed-${seed}`, false, JSON.stringify(patrol));
  }
}
check('find-safe-spot-near-always-clear', failed === 0, '');
const patrolSpot = pf.findSafeSpot(field, { x: 300, y: 500 }, seeded(3));
check('patrol-step-stays-near', patrolSpot.edge === 'patrol' && Math.abs(patrolSpot.x - 300) <= 100 && Math.abs(patrolSpot.y - 500) <= 70, JSON.stringify(patrolSpot));
const back = pf.findSafeSpot(field, { x: -900, y: 5000 }, seeded(3));
check('off-screen-drone-is-sent-back-into-view', back.edge === 'return' && pf.isInBounds(b, back.x, back.y), JSON.stringify(back));
const entry = pf.findSafeSpot(field, null, seeded(3));
check('no-drone-means-an-entry-edge', ['left', 'right', 'bottom'].includes(entry.edge), JSON.stringify(entry));
const walled = { ...field, forbidden: [{ left: -1e6, top: -1e6, right: 1e6, bottom: 1e6 }] };
check('nowhere-to-stand-is-null', pf.findSafeSpot(walled, null, seeded(3)) === null && pf.randomVisibleSpot(walled, seeded(3)) === null, '');
check('same-seed-same-spot', JSON.stringify(pf.findSafeSpot(field, { x: 300, y: 500 }, seeded(9))) === JSON.stringify(pf.findSafeSpot(field, { x: 300, y: 500 }, seeded(9))), '');

// Where the march begins: just outside the box on the entry side.
check('march-from-the-left', JSON.stringify(pf.marchOrigin(b, { x: b.left, y: 300, edge: 'left' }, BOT)) === JSON.stringify({ x: b.left - 44 + 6, y: 300 }), '');
check('march-from-the-right', JSON.stringify(pf.marchOrigin(b, { x: b.right, y: 300, edge: 'right' }, BOT)) === JSON.stringify({ x: b.right + 44 - 6, y: 300 }), '');
check('march-from-below', JSON.stringify(pf.marchOrigin(b, { x: 500, y: b.bottom, edge: 'bottom' }, BOT)) === JSON.stringify({ x: 500, y: b.bottom + 56 - 6 }), '');

console.log(failed ? `PLAYFIELD-FAIL ${failed}` : 'PLAYFIELD-OK');
process.exit(failed ? 1 : 0);
