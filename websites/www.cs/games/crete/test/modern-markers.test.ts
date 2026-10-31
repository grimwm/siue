// The floating markers: who carries which colour, their size and bob, where they hang, and how they stay inside the view.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { OrthographicCamera, Vector3 } from 'three';
import { HAZARDS, OBJECTS } from '../src/puzzle/tiles.ts';
import {
  MARKER_COLOURS, MARKER_GAP, MARKER_HEIGHT, MARKER_MIN_PX, MARKER_RIM, MARKER_WIDTH, bob, contrast, keepInView, markerFor, markerRise, markerScale,
} from '../src/modern/markers.ts';
import type { MarkerKind } from '../src/modern/markers.ts';
import { placed } from '../src/modern/model-names.ts';
import { PITCHES } from '../src/modern/camera.ts';
import { createMarkers } from '../src/modern/scene/markers.ts';
import type { MarkerInfo } from '../src/modern/scene/markers.ts';
import { grid } from './puzzle-grid.ts';

const rest = (s: ReturnType<typeof grid>) => ({ player: s.player, minotaur: s.minotaur, hazards: s.hazards.map(h => ({ kind: h.kind, at: h.at })) });

test('with crystals over the items, the Minotaur is red, Theseus green, every hazard violet and every object but the block cyan', () => {
  const s = grid(['P*rbygfhkuzxcpO', 'owe..C.........', '..............M'], 'pages: a\nfacing: up up up\nmachines: ball-up');
  const kinds = new Map<string, MarkerKind | null>();
  for (const p of placed(s, rest(s))) if (!p.id?.startsWith('machine')) kinds.set(p.model, markerFor(p, 'cyan'));
  assert.equal(kinds.get('minotaur'), 'minotaur');
  assert.equal(kinds.get('theseus'), 'theseus');
  for (const h of Object.values(HAZARDS)) assert.equal(kinds.get(h.sprite), 'hazard', h.sprite);
  for (const o of Object.values(OBJECTS)) assert.equal(kinds.get(o.sprite), o.sprite === 'block' ? null : 'item', o.sprite);
  assert.equal(markerFor({ model: 'minotaur-stone', r: 0, c: 0, id: 'minotaur' }), 'minotaur');
  // On plates, as ships, only Theseus and the Minotaur keep theirs.
  for (const p of placed(s, rest(s))) {
    const k = markerFor(p, 'plate');
    assert.equal(k, p.model === 'theseus' ? 'theseus' : p.model === 'minotaur' ? 'minotaur' : null, p.model);
  }
  assert.equal(markerFor({ model: 'relic', r: 0, c: 0, id: 'o1' }), null, 'plates ship');
  assert.equal(markerFor({ model: 'cow-standing', r: 0, c: 0, id: 'cow' }), null);
  assert.equal(markerFor({ model: 'ball', r: 0, c: 0, id: 'machine5' }), null, 'a template on its machine has none');
});

test('the four colours are four different hues: red, green, violet, cyan', () => {
  const hue = (c: number) => {
    const r = (c >> 16) / 255, g = ((c >> 8) & 255) / 255, b = (c & 255) / 255;
    const mx = Math.max(r, g, b), d = mx - Math.min(r, g, b);
    const h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
    return (h * 60 + 360) % 360;
  };
  const h = Object.fromEntries(Object.entries(MARKER_COLOURS).map(([k, c]) => [k, hue(c)])) as Record<MarkerKind, number>;
  assert.ok(h.minotaur < 15 || h.minotaur > 345, `red ${h.minotaur}`);
  assert.ok(h.theseus > 100 && h.theseus < 160, `green ${h.theseus}`);
  assert.ok(h.hazard > 260 && h.hazard < 300, `violet ${h.hazard}`);
  assert.ok(h.item > 180 && h.item < 200, `cyan ${h.item}`);
});

/** The board's pale sand where a torch lights it most, and its dark stone wall tops, as they draw. */
const SAND = 0xf0e0c0, STONE = 0x30323f;

test('every marker stands out at least 3:1 from the dark stone, and its rim at least 3:1 from the palest sand', () => {
  for (const [kind, c] of Object.entries(MARKER_COLOURS)) assert.ok(contrast(c, STONE) >= 3, `${kind} on stone: ${contrast(c, STONE).toFixed(2)}`);
  assert.ok(contrast(MARKER_RIM, SAND) >= 3);
  assert.ok(contrast(0xffffff, 0x000000) > 20.9 && Math.abs(contrast(0x777777, 0x777777) - 1) < 1e-9, 'the WCAG ratio');
});

test('a marker never draws under 14 CSS px across: it grows where cells are small, never shrinks where they are large', () => {
  assert.equal(MARKER_MIN_PX, 14);
  for (const cellPx of [20, 26, 40, 54, 80, 140]) {
    assert.ok(MARKER_WIDTH * cellPx * markerScale(cellPx) >= 14 - 1e-9, `${cellPx}`);
    assert.ok(markerScale(cellPx) >= 1);
  }
  assert.equal(markerScale(140), 1);
});

test('a marker is small: a quarter to a third of a cell wide, under half a cell tall', () => {
  assert.ok(MARKER_WIDTH >= 0.25 && MARKER_WIDTH <= 1 / 3);
  assert.ok(MARKER_HEIGHT < 0.5);
});

test('the bob goes a few hundredths of a cell down and back over a few seconds, and nothing under reduced motion', () => {
  const xs = Array.from({ length: 400 }, (_, i) => bob(i / 100, false));
  assert.ok(Math.max(...xs) <= 0 && Math.min(...xs) >= -0.05 && Math.min(...xs) < -0.02);
  assert.ok(Math.abs(bob(0, false) - bob(2.4, false)) < 1e-9);
  for (const t of [0, 0.3, 0.5, 1.7]) assert.equal(bob(t, true), 0);
});

/** The board's camera (board3d.ts applyCamera) looking at the origin at `pitch`, `yaw` degrees. */
function cameraAt(pitch: number, yaw: number): OrthographicCamera {
  const cam = new OrthographicCamera(-6, 6, 4, -4, 0.1, 200);
  const y = (yaw * Math.PI) / 180, p = (pitch * Math.PI) / 180, D = 40;
  cam.position.set(Math.sin(y) * Math.cos(p) * D, Math.sin(p) * D, Math.cos(y) * Math.cos(p) * D);
  cam.up.set(-Math.sin(y), 0, -Math.cos(y));
  cam.lookAt(0, 0, 0);
  cam.updateProjectionMatrix();
  cam.updateMatrixWorld();
  return cam;
}

/** A point's place on the screen in view units (cells) from the centre: right and up. */
const onScreen = (cam: OrthographicCamera, v: Vector3): [number, number] => {
  const n = v.clone().project(cam);
  return [n.x * 6, n.y * 4];
};

test('a marker hangs straight over its piece on screen in both views, its point inside the cell in Top-down', () => {
  const set = createMarkers();
  const tall = 1.6; // the Minotaur, the tallest
  for (const [view, yaw] of [['top', 0], ['angled', 15], ['angled', 105]] as const) {
    const cam = cameraAt(PITCHES[view], yaw);
    set.group.clear();
    const foot = new Vector3(2, 0.05, -1);
    const m = set.make('minotaur', foot, tall);
    set.place(cam, PITCHES[view], 0, true, 100);
    const [fx, fy] = onScreen(cam, foot);
    const [mx, my] = onScreen(cam, m.position);
    const head = onScreen(cam, foot.clone().setY(foot.y + tall))[1];
    assert.ok(Math.abs(mx - fx) < 1e-6, `${view} ${yaw}: straight over its foot`);
    assert.ok(Math.abs(my - head - MARKER_GAP) < 1e-6, `${view} ${yaw}: its point just over the head`);
    if (view === 'top') {
      // A cell spans sin(pitch) of a view unit deep in Top-down, square to the board.
      assert.ok(my - fy < Math.sin((PITCHES.top * Math.PI) / 180) / 2, `its point stays inside the cell: ${my - fy}`);
    }
  }
  set.dispose();
});

test('markerRise: a piece leaning back toward the camera lifts its marker by its lean seen from above', () => {
  const p = (PITCHES.top * Math.PI) / 180;
  assert.ok(Math.abs(markerRise(0.4, PITCHES.top, 0.3) - markerRise(0.4, PITCHES.top) - 0.3 * Math.sin(p)) < 1e-9);
  assert.equal(markerRise(0.4, PITCHES.top, 0), markerRise(0.4, PITCHES.top));
});

test('markerRise: in Top-down every piece\'s marker point stays inside its own cell; in Angled it clears the head', () => {
  const half = Math.sin((PITCHES.top * Math.PI) / 180) / 2;
  for (const h of [0.14, 0.5, 0.9, 1.2, 1.6]) {
    assert.ok(markerRise(h, PITCHES.top) < half, `h ${h}`);
    assert.ok(markerRise(h, PITCHES.angled) > h * Math.SQRT1_2, `h ${h}`);
  }
});

test('Theseus carries a marker, and markers of a kind share one geometry and one material', () => {
  const set = createMarkers();
  const a = set.make('theseus', new Vector3(), 1.2);
  const b = set.make('theseus', new Vector3(1, 0, 0), 1.2);
  const c = set.make('item', new Vector3(2, 0, 0), 0.3);
  assert.equal(a.geometry, c.geometry);
  assert.equal(a.material, b.material);
  assert.notEqual(a.material, c.material);
  assert.equal((a.userData as MarkerInfo).kind, 'theseus');
  assert.equal(markerFor({ model: 'theseus', r: 0, c: 0, id: 'theseus' }), 'theseus');
  set.dispose();
});

test('keepInView: a marker past the top or a side slides back inside the margin; one inside stays', () => {
  // A 10 × 6 view (5 and 3 from the centre), a 0.8 × 1 marker, a 0.1 margin.
  assert.deepEqual(keepInView(0, 0, 0.8, 1, 5, 3, 0.1), [0, 0]);
  const [, dy] = keepInView(1, 2.5, 0.8, 1, 5, 3, 0.1);
  assert.ok(Math.abs(2.5 + dy - 1.9) < 1e-9, 'its top sits 0.1 under the top edge');
  const [dx] = keepInView(4.9, 0, 0.8, 1, 5, 3, 0.1);
  assert.ok(Math.abs(4.9 + dx - 4.5) < 1e-9, 'its right side 0.1 inside the right edge');
  const [dxl] = keepInView(-5, 0, 0.8, 1, 5, 3, 0.1);
  assert.ok(Math.abs(-5 + dxl + 4.5) < 1e-9, 'and the left');
  const [, dyb] = keepInView(0, -3.2, 0.8, 1, 5, 3, 0.1);
  assert.ok(Math.abs(-3.2 + dyb + 2.9) < 1e-9, 'a point below the bottom comes up');
  assert.deepEqual(keepInView(3, 2, 0.8, 9, 5, 3, 0.1), [0, 0], 'a marker taller than the view is left be');
});
