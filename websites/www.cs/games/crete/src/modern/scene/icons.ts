/* The Island of Crete, modern look: the floating icons' look. Each is the first frame of its Classic sprite, cut
 * from the atlas with a soft dark halo round it, drawn as a billboard that faces the camera over everything else,
 * walls included. One material per sprite serves every icon of it. */
import { CanvasTexture, SRGBColorSpace, Sprite, SpriteMaterial } from 'three';
import type { Atlas } from '../../board-plan.ts';
import { ICON_SIZE } from '../icons.ts';

/** The halo's room round the sprite, in atlas pixels. */
const PAD = 8;
/** Drawn after the scene, so nothing in it hides an icon. */
const ON_TOP = 10;

export interface IconSheet {
  /** A billboard of `sprite`, ICON_SIZE wide, its foot at its origin; null when the atlas lacks the sprite. */
  make(sprite: string): Sprite | null;
  dispose(): void;
}

export function createIconSheet(atlas: Atlas, image: CanvasImageSource): IconSheet {
  const mats = new Map<string, SpriteMaterial>();
  const fw = atlas.cell, fh = atlas.cell + atlas.rise;

  function material(name: string): SpriteMaterial | null {
    const hit = mats.get(name);
    if (hit) return hit;
    const s = atlas.sprites[name];
    if (!s) return null;
    const cv = document.createElement('canvas');
    cv.width = fw + 2 * PAD;
    cv.height = fh + 2 * PAD;
    const g = cv.getContext('2d')!;
    // The halo: the sprite's own outline, blurred dark, twice for weight; then the sprite itself.
    g.shadowColor = 'rgba(8,5,3,0.9)';
    g.shadowBlur = 6;
    for (let i = 0; i < 2; i++) g.drawImage(image, s.x, s.y, fw, fh, PAD, PAD, fw, fh);
    g.shadowColor = 'transparent';
    g.drawImage(image, s.x, s.y, fw, fh, PAD, PAD, fw, fh);
    const map = new CanvasTexture(cv);
    map.colorSpace = SRGBColorSpace;
    const mat = new SpriteMaterial({ map, depthTest: false, depthWrite: false, transparent: true, fog: false });
    mats.set(name, mat);
    return mat;
  }

  return {
    make(name) {
      const mat = material(name);
      if (!mat) return null;
      const sp = new Sprite(mat);
      const w = ICON_SIZE * (fw + 2 * PAD) / fw;
      sp.scale.set(w, (w * (fh + 2 * PAD)) / (fw + 2 * PAD), 1);
      sp.center.set(0.5, 0);
      sp.renderOrder = ON_TOP;
      return sp;
    },
    dispose() {
      for (const m of mats.values()) { m.map?.dispose(); m.dispose(); }
      mats.clear();
    },
  };
}
