/* The Island of Crete, modern look: in the level editor, which pointers paint and which move the camera. One finger,
 * a pen or the left mouse button paints; two fingers always move the camera (pan, twist, pinch), and a finger that
 * was painting when the second came down hands its stroke back (the stroke so far is dropped) and joins the camera;
 * once fingers move the camera, every finger does until all are up. The right mouse button turns and tilts as the
 * left one does in play, and the middle one pans. A mouse moving with no button down hovers. DOM-free. */
import type { Ptr } from './gestures.ts';

export type Route =
  | { kind: 'paint'; x: number; y: number; first: boolean }
  | { kind: 'end' }
  | { kind: 'drop' }
  | { kind: 'hover'; x: number; y: number }
  | { kind: 'cam'; op: 'down' | 'move' | 'up' | 'cancel'; p: Ptr };

export interface PaintRouter {
  down(p: Ptr): Route[];
  move(p: Ptr): Route[];
  up(p: Ptr): Route[];
  cancel(id: number): Route[];
}

export function createPaintRouter(): PaintRouter {
  /** The pointer painting, at its last place. */
  let painter: Ptr | null = null;
  /** The pointers moving the camera. */
  const cam = new Set<number>();
  /** The right button turns and tilts (the gesture reader's primary drag); the middle one pans. */
  const forCam = (p: Ptr): Ptr => (p.type === 'mouse' ? { ...p, button: p.button === 2 ? 0 : 1 } : p);
  return {
    down(p) {
      if (p.type === 'mouse' && p.button !== 0) {
        cam.add(p.id);
        return [{ kind: 'cam', op: 'down', p: forCam(p) }];
      }
      if (p.type === 'mouse') {
        if (painter) return [];
        painter = { ...p };
        return [{ kind: 'paint', x: p.x, y: p.y, first: true }];
      }
      if (cam.size > 0) {
        cam.add(p.id);
        return [{ kind: 'cam', op: 'down', p }];
      }
      if (painter && painter.type !== 'mouse' && painter.id !== p.id) {
        const first = painter;
        painter = null;
        cam.add(first.id);
        cam.add(p.id);
        return [{ kind: 'drop' }, { kind: 'cam', op: 'down', p: first }, { kind: 'cam', op: 'down', p }];
      }
      if (painter) return [];
      painter = { ...p };
      return [{ kind: 'paint', x: p.x, y: p.y, first: true }];
    },
    move(p) {
      if (painter && painter.id === p.id) {
        painter.x = p.x;
        painter.y = p.y;
        return [{ kind: 'paint', x: p.x, y: p.y, first: false }];
      }
      if (cam.has(p.id)) return [{ kind: 'cam', op: 'move', p: forCam(p) }];
      return p.type === 'mouse' ? [{ kind: 'hover', x: p.x, y: p.y }] : [];
    },
    up(p) {
      if (painter && painter.id === p.id) {
        painter = null;
        return [{ kind: 'end' }];
      }
      if (cam.delete(p.id)) return [{ kind: 'cam', op: 'up', p: forCam(p) }];
      return [];
    },
    cancel(id) {
      if (painter && painter.id === id) {
        painter = null;
        return [{ kind: 'end' }];
      }
      if (cam.delete(id)) return [{ kind: 'cam', op: 'cancel', p: { id, x: 0, y: 0, type: 'touch', button: 0 } }];
      return [];
    },
  };
}
