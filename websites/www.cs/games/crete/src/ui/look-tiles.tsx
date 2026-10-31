// The Island of Crete: the two looks as pictures side by side, each above its name, the one drawn now outlined in
// gold. The new-game card shows them with a line under each; the menu's Board section shows them bare.
import { Button } from '../../../_kit/ui/button.tsx';
import type { Look } from '../settings.ts';

export interface LookTilesProps {
  look: Look;
  /** The tiles' ids: `${idPrefix}-modern` and `${idPrefix}-classic`. */
  idPrefix: string;
  /** The group's accessible name. */
  label: string;
  /** A line under each name. */
  blurbs?: boolean;
  onPick: (look: Look) => void;
}

const LOOKS: { look: Look; name: string; blurb: string; alt: string }[] = [
  { look: 'modern', name: 'Modern', blurb: 'Stone-and-sand 3D you can zoom', alt: 'The modern look: a 3D board of grey stone walls on pale sand flagstones' },
  { look: 'classic', name: 'Classic', blurb: 'Flat and top-down; runs on any computer', alt: 'The classic look: the flat, top-down tile board' },
];

export function LookTiles(p: LookTilesProps) {
  return (
    <div class="look-tiles" role="group" aria-label={p.label}>
      {LOOKS.map(l => (
        <Button key={l.look} id={`${p.idPrefix}-${l.look}`} class="look-tile" pressed={p.look === l.look} onClick={() => p.onPick(l.look)}>
          <img src={`fx/looks/${l.look}.jpg`} alt={l.alt} width={400} height={300} />
          <span class="look-name">{l.name}</span>
          {p.blurbs && <span class="look-blurb">{l.blurb}</span>}
        </Button>
      ))}
    </div>
  );
}
