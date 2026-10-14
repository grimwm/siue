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

export interface Aloft extends Rising { x: number; wkey: string; rolling?: boolean }
/** Where shells can still hold the camera: the field's width, how far either
 *  side of its middle the view at ZOOM_FLOOR reaches, and (optional) the ground's
 *  row at x, under which a shell lies on the ground (a room replay's roller). */
export interface Reach { w: number; reach: number; ground?: (x: number) => number }
/** Rows above the ground within which a shell counts as lying on it (a roller rides ROLL_LIFT above). */
const ON_GROUND = 6;
/** Empty frames before a hold lets go: a shell the sim retires past the edge shows as a ghost a frame later. */
const HOLD_GRACE = 2;

/** The top of the volley in flight: the highest arc any of its shells has
 *  reached or will reach, held while a shell is still up, then null. lists[0]
 *  is the shells in play; the rest fly on past the field's edge (draw only)
 *  and hold only while they climb. A roller on the ground, or a shell the
 *  floor's view cannot reach sideways, holds nothing. */
export function volleyTop(prev: number | null, lists: readonly Iterable<Aloft>[], gravity: (wkey: string) => number, at?: Reach): number | null {
  let top = prev, any = false;
  for (let i = 0; i < lists.length; i++) {
    for (const s of lists[i]!) {
      if (s.rolling || (i > 0 && s.vy >= 0)) continue;
      if (at && Math.abs(s.x - at.w / 2) > at.reach) continue;
      if (at && at.ground && s.vy > -30 && s.y >= at.ground(s.x) - ON_GROUND) continue;
      any = true;
      const y = shellTop(s, gravity(s.wkey));
      top = top === null ? y : Math.min(top, y);
    }
  }
  return any ? top : null;
}

/** The volley's hold, stepped once a frame: its top row (null: none) and how many frames in a row had no shell up. */
export interface Hold { top: number | null; empty: number }
/** One frame of the hold: volleyTop over these lists, let go only after HOLD_GRACE empty frames in a row. */
export function stepHold(hold: Hold, lists: readonly Iterable<Aloft>[], gravity: (wkey: string) => number, at?: Reach): void {
  const top = volleyTop(hold.top, lists, gravity, at);
  if (top !== null) { hold.top = top; hold.empty = 0; return; }
  if (++hold.empty >= HOLD_GRACE) hold.top = null;
}

/** How far either side of the field's middle clouds drifting with the wind wrap: past what
 *  the view at ZOOM_FLOOR shows (reach: its half-width; 0 before the canvas is measured). */
export function cloudWrap(w: number, reach: number): number {
  return Math.max(reach, w / 2 / ZOOM_FLOOR) + 80;
}

/** Where the camera wants to be on a field w × h: the bottom edge on the
 *  field's floor (no valley, crater or scenery dips out of view), every live
 *  unit framed above it, and with a volley in the air (sky: its top row) the
 *  arc too, down to ZOOM_FLOOR. extra: rows of sky a tall canvas shows above
 *  the field at full size (a portrait screen); the arc and the units may use
 *  them before the camera pulls back at all. */
export function cameraTarget(w: number, h: number, units: readonly { y: number; drawY?: number }[], sky: number | null, extra = 0, out?: CamPose): CamPose {
  const floorY = h + FLOOR_SLACK;
  let need = Infinity; // the highest row that must show
  for (const u of units) need = Math.min(need, Math.min(u.y, u.drawY ?? u.y) - UNIT_TOP - PAD); // a fall shows above its rest
  let lo = UNIT_FLOOR;
  if (sky !== null && sky - SKY_PAD < need) {
    need = sky - SKY_PAD;
    lo = ZOOM_FLOOR;
  }
  const z = need === Infinity ? 1 : Math.max(lo, Math.min(1, (h + extra) / Math.max(1, floorY - need)));
  const pose = out || { z: 0, cx: 0, cy: 0 };
  pose.z = z; pose.cx = w / 2; pose.cy = floorY - h / 2 / z;
  return pose;
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
