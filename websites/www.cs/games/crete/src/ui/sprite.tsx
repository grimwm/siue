// The Island of Crete: an entry's picture in the look the board shows. In Classic, a sprite from the Classic atlas: a
// piece that stands on the board on a floor tile, a terrain tile alone. In Modern, the entry's icon pre-rendered from
// its Modern model (fx/sprites/modern-icons.{webp,json}, made by tools/modern-icons.mjs). A family (the four keys)
// draws its members two by two in the same square. `locked` draws either as a silhouette.
import { TERRAIN } from '../puzzle/tiles.ts';
import type { Atlas } from '../board-plan.ts';
import { ENTRY } from '../dictionary.ts';
import type { Entry } from '../dictionary.ts';
import type { IconSheet } from '../icons-models.ts';
import type { Look } from '../settings.ts';

const TERRAIN_SPRITES: ReadonlySet<string> = new Set(Object.values(TERRAIN).flatMap(t => t.sprites));

/** What a picture is drawn from: the look, the Classic atlas and the Modern icons (Classic's sprite stands in
 *  without them). */
export interface Pics { look: Look; atlas: Atlas; icons?: IconSheet }

export interface PictureProps {
  pics: Pics;
  entry: Entry;
  /** Its width in CSS pixels. */
  size: number;
  locked?: boolean;
}

export function Picture(p: PictureProps) {
  if (p.entry.members) {
    const half = Math.floor(p.size / 2);
    return (
      <span class="sprite-family" style={{ width: `${p.size}px` }} aria-hidden="true">
        {p.entry.members.map(id => <Picture key={id} pics={p.pics} entry={ENTRY[id]!} size={half} locked={p.locked} />)}
      </span>
    );
  }
  const icon = p.pics.look === 'modern' ? p.pics.icons?.icons[p.entry.id] : undefined;
  if (icon && p.pics.icons) {
    const k = p.size / p.pics.icons.cell;
    return (
      <span class={p.locked ? 'sprite icon-modern locked' : 'sprite icon-modern'} data-look="modern" style={{ width: `${p.size}px`, height: `${p.size}px` }} aria-hidden="true">
        <span class="sprite-layer modern-layer" style={{
          width: `${p.size}px`, height: `${p.size}px`, backgroundPosition: `-${icon.x * k}px -${icon.y * k}px`,
          backgroundSize: `${p.pics.icons.width * k}px ${p.pics.icons.height * k}px`,
        }} />
      </span>
    );
  }
  return <Sprite atlas={p.pics.atlas} name={p.entry.sprite} size={p.size} locked={p.locked} />;
}

interface SpriteProps { atlas: Atlas; name: string; size: number; locked?: boolean | undefined }

function Sprite(p: SpriteProps) {
  const { cell, rise } = p.atlas;
  const k = p.size / cell;
  const layer = (name: string, cls: string) => {
    const s = p.atlas.sprites[name];
    return s ? <span class={cls} style={{ width: `${cell}px`, height: `${cell + rise}px`, backgroundPosition: `-${s.x}px -${s.y}px`, transform: `scale(${k})` }} /> : null;
  };
  return (
    <span class={p.locked ? 'sprite locked' : 'sprite'} data-look="classic" style={{ width: `${p.size}px`, height: `${Math.round((cell + rise) * k)}px` }} aria-hidden="true">
      {!TERRAIN_SPRITES.has(p.name) && layer('floor', 'sprite-layer sprite-floor')}
      {layer(p.name, 'sprite-layer')}
    </span>
  );
}
