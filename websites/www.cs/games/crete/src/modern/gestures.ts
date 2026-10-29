/* The Island of Crete, modern look: pointer gestures as camera operations. A reader holds only the pointers
 * down and the last tap; the caller owns the camera and applies the operations. One finger or the primary
 * mouse button turns, two fingers pan and twist, the middle or right mouse button pans, and a quick double
 * tap resets. DOM-free. */

export type CamOp = { kind: 'turn'; deg: number } | { kind: 'pan'; dx: number; dy: number } | { kind: 'reset' };

export interface Ptr {
  id: number;
  x: number;
  y: number;
  type: 'mouse' | 'touch' | 'pen';
  button: number;
}

export interface Gestures {
  down(p: Ptr): CamOp[];
  move(p: Ptr): CamOp[];
  up(p: Ptr): CamOp[];
  cancel(id: number): void;
}

interface Held {
  x: number;
  y: number;
  x0: number;
  y0: number;
  t0: number;
  type: Ptr['type'];
  button: number;
}

interface Two {
  ang: number;
  mx: number;
  my: number;
}

const TURN_PER_PX = 0.35;
const TAP_MS = 280;
const TAP_PX = 12;
const DOUBLE_MS = 320;
const DOUBLE_PX = 40;

export function createGestures(now: () => number): Gestures {
  const held = new Map<number, Held>();
  let two: Two | null = null;
  let lastTap: { t: number; x: number; y: number } | null = null;

  const twoInfo = (): Two => {
    const [a, b] = [...held.values()];
    if (!a || !b) return { ang: 0, mx: 0, my: 0 };
    return { ang: Math.atan2(b.y - a.y, b.x - a.x), mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2 };
  };

  return {
    down(p) {
      held.set(p.id, { x: p.x, y: p.y, x0: p.x, y0: p.y, t0: now(), type: p.type, button: p.button });
      two = held.size === 2 ? twoInfo() : null;
      return [];
    },
    move(p) {
      const h = held.get(p.id);
      if (!h) return [];
      const dx = p.x - h.x;
      const dy = p.y - h.y;
      h.x = p.x;
      h.y = p.y;
      const ops: CamOp[] = [];
      if (held.size === 1) {
        if (h.type === 'mouse' && (h.button === 1 || h.button === 2)) {
          if (dx !== 0 || dy !== 0) ops.push({ kind: 'pan', dx, dy });
        } else if (dx !== 0) ops.push({ kind: 'turn', deg: -dx * TURN_PER_PX });
      } else if (held.size === 2 && two) {
        const nowInfo = twoInfo();
        let da = nowInfo.ang - two.ang;
        if (da > Math.PI) da -= 2 * Math.PI;
        if (da < -Math.PI) da += 2 * Math.PI;
        if (da !== 0) ops.push({ kind: 'turn', deg: (da * 180) / Math.PI });
        const mdx = nowInfo.mx - two.mx;
        const mdy = nowInfo.my - two.my;
        if (mdx !== 0 || mdy !== 0) ops.push({ kind: 'pan', dx: mdx, dy: mdy });
        two = nowInfo;
      }
      return ops;
    },
    up(p) {
      const h = held.get(p.id);
      if (!h) return [];
      held.delete(p.id);
      two = null;
      if (h.type === 'mouse' || held.size !== 0) return [];
      const t = now();
      if (t - h.t0 >= TAP_MS || Math.hypot(p.x - h.x0, p.y - h.y0) >= TAP_PX) return [];
      if (lastTap && t - lastTap.t < DOUBLE_MS && Math.hypot(p.x - lastTap.x, p.y - lastTap.y) < DOUBLE_PX) {
        lastTap = null;
        return [{ kind: 'reset' }];
      }
      lastTap = { t, x: p.x, y: p.y };
      return [];
    },
    cancel(id) {
      held.delete(id);
      two = null;
    },
  };
}
