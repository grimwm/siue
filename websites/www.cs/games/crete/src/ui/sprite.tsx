// The Island of Crete: a picture from the Classic atlas, for the Dictionary, its first cards and the banner. A piece
// that stands on the board is drawn on a floor tile; a terrain tile alone. `locked` draws it as a silhouette.
import { TERRAIN } from '../puzzle/tiles.ts';
import type { Atlas } from '../board-plan.ts';

const TERRAIN_SPRITES: ReadonlySet<string> = new Set(Object.values(TERRAIN).flatMap(t => t.sprites));

export interface SpriteProps {
  atlas: Atlas;
  name: string;
  /** Its width in CSS pixels; the height follows the atlas's cell and rise. */
  size: number;
  locked?: boolean;
}

export function Sprite(p: SpriteProps) {
  const { cell, rise } = p.atlas;
  const k = p.size / cell;
  const layer = (name: string, cls: string) => {
    const s = p.atlas.sprites[name];
    return s ? <span class={cls} style={{ width: `${cell}px`, height: `${cell + rise}px`, backgroundPosition: `-${s.x}px -${s.y}px`, transform: `scale(${k})` }} /> : null;
  };
  return (
    <span class={p.locked ? 'sprite locked' : 'sprite'} style={{ width: `${p.size}px`, height: `${Math.round((cell + rise) * k)}px` }} aria-hidden="true">
      {!TERRAIN_SPRITES.has(p.name) && layer('floor', 'sprite-layer sprite-floor')}
      {layer(p.name, 'sprite-layer')}
    </span>
  );
}
