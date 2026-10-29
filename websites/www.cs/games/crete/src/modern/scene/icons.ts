/* The Island of Crete, modern look: the floating icons' look. Each is the first frame of its Classic sprite, cut
 * from the atlas with a soft dark halo round it, drawn as a billboard that faces the camera over everything else,
 * walls included. The board draws icons over the finished picture, past the tone map and the paint, so their
 * colours and edges are Classic's. One material per sprite serves every icon of it. An image still loading
 * draws its icons once it arrives. */
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

/** True once `image` can be drawn: a still-loading or broken image element draws nothing. */
export function imageReady(image: CanvasImageSource): boolean {
  return !(image instanceof HTMLImageElement) || (image.complete && image.naturalWidth > 0);
}

/** `ready` is called when the image arrives after icons were made, so the board can draw them again. */
export function createIconSheet(atlas: Atlas, image: CanvasImageSource, ready: () => void): IconSheet {
  const mats = new Map<string, SpriteMaterial>();
  const pictures = new Map<string, HTMLCanvasElement>();
  const fw = atlas.cell, fh = atlas.cell + atlas.rise;

  function draw(name: string, cv: HTMLCanvasElement): void {
    const s = atlas.sprites[name];
    if (!s || !imageReady(image)) return;
    const g = cv.getContext('2d')!;
    g.clearRect(0, 0, cv.width, cv.height);
    // The halo: the sprite's own outline, blurred dark, twice for weight; then the sprite itself.
    g.shadowColor = 'rgba(8,5,3,0.9)';
    g.shadowBlur = 6;
    for (let i = 0; i < 2; i++) g.drawImage(image, s.x, s.y, fw, fh, PAD, PAD, fw, fh);
    g.shadowColor = 'transparent';
    g.drawImage(image, s.x, s.y, fw, fh, PAD, PAD, fw, fh);
  }

  function arrived(): void {
    for (const [name, cv] of pictures) {
      draw(name, cv);
      const map = mats.get(name)?.map;
      if (map) map.needsUpdate = true;
    }
    if (pictures.size) ready();
  }
  if (!imageReady(image) && image instanceof HTMLImageElement) image.addEventListener('load', arrived, { once: true });

  function material(name: string): SpriteMaterial | null {
    const hit = mats.get(name);
    if (hit) return hit;
    const s = atlas.sprites[name];
    if (!s) return null;
    const cv = document.createElement('canvas');
    cv.width = fw + 2 * PAD;
    cv.height = fh + 2 * PAD;
    draw(name, cv);
    pictures.set(name, cv);
    const map = new CanvasTexture(cv);
    map.colorSpace = SRGBColorSpace;
    const mat = new SpriteMaterial({ map, depthTest: false, depthWrite: false, transparent: true, fog: false, toneMapped: false });
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
      if (image instanceof HTMLImageElement) image.removeEventListener('load', arrived);
      pictures.clear();
      for (const m of mats.values()) { m.map?.dispose(); m.dispose(); }
      mats.clear();
    },
  };
}
