/* Operation Tankity: where the battlefield camera looks. Pure, DOM-free.
 *
 * The camera is always centred across (the view is never narrower than the
 * field). Height decides the zoom: every live unit stays framed, and while a
 * volley flies the camera pulls back and up to take in the top of its arc,
 * down to ZOOM_FLOOR, with the ground anchored at the bottom. A shell above
 * what the floor can show gets a mark on the top edge (skyMarks). view.ts
 * eases the camera toward cameraTarget each frame with easeCamera. */

export interface CamPose { z: number; cx: number; cy: number }
interface Rising { y: number; vy: number }

/** The furthest back the units' height spread alone pulls the camera. */
export const UNIT_FLOOR = 0.45;
/** The furthest back a high volley pulls the camera. */
export const ZOOM_FLOOR = 0.35;
/** World units above a unit's ground point its body, bar and name reach. */
const UNIT_TOP = 56;
/** Room around the units, and above the top of a volley's arc. */
const PAD = 70;
export const SKY_PAD = 40;
/** The view's bottom edge never drops more than this below the field's floor. */
const FLOOR_SLACK = 8;
/** Ease rates per second: pulling back, coming home; gentler under reduced motion. */
const RATE_OUT = 3.5, RATE_IN = 1.5, CALM_OUT = 1.4, CALM_IN = 0.8;

/** The world rows the view shows at this pose, on a field h tall. */
export function viewEdges(cam: CamPose, h: number): { top: number; bottom: number } {
  const half = h / 2 / cam.z;
  return { top: cam.cy - half, bottom: cam.cy + half };
}

/** The highest row a shell reaches: the apex of its arc while it rises, else where it is. */
export function shellTop(s: Rising, g: number): number {
  return s.vy < 0 && g > 0 ? s.y - (s.vy * s.vy) / (2 * g) : s.y;
}

/** The top of the volley in flight: the highest arc any of its shells has
 *  reached or will reach, held until the volley has landed (no shells), then null. */
export function volleyTop(prev: number | null, shells: Iterable<Rising & { wkey: string }>, gravity: (wkey: string) => number): number | null {
  let top = prev, any = false;
  for (const s of shells) {
    any = true;
    const y = shellTop(s, gravity(s.wkey));
    top = top === null ? y : Math.min(top, y);
  }
  return any ? top : null;
}

/** Where the camera wants to be on a field w × h: the live units framed, and
 *  with a volley in the air (sky: its top row) the arc too, down to ZOOM_FLOOR.
 *  extra: rows of sky a tall canvas shows above the field at full size (a
 *  portrait screen); the arc may use them before the camera moves at all. */
export function cameraTarget(w: number, h: number, units: readonly { y: number }[], sky: number | null, extra = 0): CamPose {
  if (!units.length) return { z: 1, cx: w / 2, cy: h / 2 };
  let y0 = Infinity, y1 = -Infinity;
  for (const u of units) {
    y0 = Math.min(y0, u.y - UNIT_TOP);
    y1 = Math.max(y1, u.y);
  }
  const clampZ = (z: number, lo: number): number => Math.max(lo, Math.min(1, z));
  // No void under the ground: the bottom edge stays at the field's floor.
  const floorY = h + FLOOR_SLACK;
  let z = clampZ(h / Math.max(1, y1 - y0 + PAD * 2), UNIT_FLOOR);
  let cy = Math.min((y0 + y1) / 2, floorY - h / 2 / z);
  if (sky !== null) {
    const need = sky - SKY_PAD, bottom = Math.min(y1 + PAD, floorY);
    const above = (zz: number): number => (h / 2 + extra) / zz; // rows from the centre up to the canvas's top
    if (cy - above(z) > need) {
      const up = need + above(z);
      if (up + h / 2 / z >= bottom) cy = up; // a lift is enough: the units stay above the bottom edge
      else {
        // Pull back with the units anchored at the bottom; past the floor the sky gives.
        z = clampZ(Math.min((h + extra) / (bottom - need), z), ZOOM_FLOOR);
        cy = bottom - h / 2 / z;
      }
    }
  }
  return { z, cx: w / 2, cy };
}

/** One frame of easing toward the target, in place. The view's top and bottom
 *  edges each glide toward the target's, so every unit framed at both ends stays
 *  framed throughout; frame-rate independent, never overshooting. */
export function easeCamera(cam: CamPose, target: CamPose, dt: number, reduced: boolean, h: number): void {
  const half = h / 2 / cam.z, tHalf = h / 2 / target.z;
  const out = tHalf > half;
  const rate = reduced ? (out ? CALM_OUT : CALM_IN) : (out ? RATE_OUT : RATE_IN);
  const k = 1 - Math.exp(-rate * Math.max(0, dt));
  let top = cam.cy - half, bottom = cam.cy + half;
  top += (target.cy - tHalf - top) * k;
  bottom += (target.cy + tHalf - bottom) * k;
  const lift = Math.max(0, bottom - (h + FLOOR_SLACK));
  top -= lift; bottom -= lift;
  cam.z = h / (bottom - top);
  cam.cy = (top + bottom) / 2;
  cam.cx += (target.cx - cam.cx) * k;
}

export interface SkyMark { x: number; above: number }
/** The shells (from any of the lists) above the view's top row, each as its x and how
 *  far above it flies, written into out (entries reused, so a frame allocates nothing new). */
export function skyMarks(lists: readonly (readonly { x: number; y: number }[])[], top: number, out: SkyMark[]): SkyMark[] {
  let n = 0;
  for (const shells of lists) {
    for (const s of shells) {
      if (s.y >= top) continue;
      const m = out[n];
      if (m) { m.x = s.x; m.above = top - s.y; } else out.push({ x: s.x, above: top - s.y });
      n++;
    }
  }
  out.length = n;
  return out;
}
