/* The Island of Crete, modern look: what the level editor draws over its board, in a scene of its own drawn over the
 * finished picture as the floating markers are, so no wall hides it: a gold frame round the cell under the pointer,
 * and a letter in a dark tab on each cell the game would draw as something else (F, a fake wall drawn as wall; I, an
 * invisible wall drawn as floor), as the classic board marks them. */
import { CanvasTexture, Group, Mesh, MeshBasicMaterial, Path, Scene, Shape, ShapeGeometry, Sprite, SpriteMaterial, SRGBColorSpace } from 'three';
import { FY, cellX, cellZ } from './floor.ts';

export interface EditMarks {
  readonly scene: Scene;
  /** Frames cell (r, c), or nothing. */
  hover(at: { r: number; c: number } | null, cols: number, rows: number): void;
  /** Puts a letter on each listed cell. */
  marks(list: readonly { r: number; c: number; mark: string }[], cols: number, rows: number): void;
  /** True when there is nothing to draw. */
  empty(): boolean;
  dispose(): void;
}

const GOLD = 0xf0b429;
const FRAME = 0.08;
const LETTER = 0.5;

export function createEditMarks(): EditMarks {
  const scene = new Scene();
  const shape = new Shape();
  shape.moveTo(-0.5, -0.5).lineTo(0.5, -0.5).lineTo(0.5, 0.5).lineTo(-0.5, 0.5).lineTo(-0.5, -0.5);
  const inner = 0.5 - FRAME;
  const hole = new Path();
  hole.moveTo(-inner, -inner).lineTo(-inner, inner).lineTo(inner, inner).lineTo(inner, -inner).lineTo(-inner, -inner);
  shape.holes.push(hole);
  const frameGeo = new ShapeGeometry(shape);
  frameGeo.rotateX(-Math.PI / 2);
  const frameMat = new MeshBasicMaterial({ color: GOLD, depthTest: false, depthWrite: false, toneMapped: false, fog: false });
  const frame = new Mesh(frameGeo, frameMat);
  frame.visible = false;
  frame.renderOrder = 2;
  const letters = new Group();
  scene.add(frame, letters);
  const textures = new Map<string, SpriteMaterial>();

  /** The letter's tab, drawn once and shared by every cell that carries it. */
  function letterMat(mark: string): SpriteMaterial {
    const had = textures.get(mark);
    if (had) return had;
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const g = c.getContext('2d')!;
    g.fillStyle = 'rgba(1, 4, 9, 0.78)';
    g.fillRect(4, 4, 56, 56);
    g.fillStyle = '#f0b429';
    g.font = 'bold 44px system-ui, sans-serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(mark, 32, 35);
    const tex = new CanvasTexture(c);
    tex.colorSpace = SRGBColorSpace;
    const mat = new SpriteMaterial({ map: tex, depthTest: false, depthWrite: false, toneMapped: false, fog: false });
    textures.set(mark, mat);
    return mat;
  }

  return {
    scene,
    hover(at, cols, rows) {
      frame.visible = at !== null;
      if (at) frame.position.set(cellX(at.c, cols), FY + 0.01, cellZ(at.r, rows));
    },
    marks(list, cols, rows) {
      letters.clear();
      for (const m of list) {
        const s = new Sprite(letterMat(m.mark));
        s.scale.set(LETTER, LETTER, 1);
        s.position.set(cellX(m.c, cols), FY + 0.05, cellZ(m.r, rows));
        s.renderOrder = 3;
        letters.add(s);
      }
    },
    empty: () => !frame.visible && letters.children.length === 0,
    dispose() {
      letters.clear();
      frameGeo.dispose();
      frameMat.dispose();
      for (const m of textures.values()) { m.map?.dispose(); m.dispose(); }
      textures.clear();
    },
  };
}
