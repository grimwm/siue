// The Island of Crete: a shared level's card, shown when a share link opens and from the menu during the level. It
// names the level, gives its rating (`rating…` until the page's own search is in) and the author's best to beat,
// with Play and Edit a copy. Q takes it to the title card (src/ui.ts owns every card, so the dialog is given no
// onDismiss).
import { render } from 'preact';
import { Dialog } from '../../../_kit/ui/dialog.tsx';
import { Button } from '../../../_kit/ui/button.tsx';
import type { Difficulty } from '../puzzle/difficulty.ts';
import { KEYS } from '../keys.ts';

export interface SharedCardProps {
  name: string;
  /** The rating in words, or null while it is worked out. */
  rating: string | null;
  /** The author's best, in moves; null when the author has none. */
  best: number | null;
  onPlay(): void;
  onEdit(): void;
}

const counted = (n: number, one: string) => `${n.toLocaleString('en-US')} ${one}${n === 1 ? '' : 's'}`;

/** A rating in words: chase or solo, the quickest win and the situations the solver searched. */
export function ratingText(d: Difficulty): string {
  const label = d.label === 'chase' ? 'Chase' : d.label === 'solo' ? 'Solo' : 'Chase or solo not known';
  const win = typeof d.shortest === 'number' ? `quickest win ${counted(d.shortest, 'move')}` : 'quickest win not known';
  return `${label} · ${win} · ${counted(d.explored, 'situation')}`;
}

export function SharedCard(p: SharedCardProps & { open: boolean }) {
  return (
    <Dialog open={p.open} id="shared-veil" veilClass="veil" panelClass="card" kicker="Shared level" kickerClass="kicker"
      titleId="shared-title" title={p.name} focusId="shared-play">
      <p id="shared-rating" class="runstats" aria-live="polite">{p.rating ?? 'rating…'}</p>
      {p.best !== null && <p id="shared-best" class="runstats">{`beat ${p.best}`}</p>}
      <div class="title-actions">
        <Button id="shared-play" keyLabel={KEYS.begin.label} onClick={p.onPlay}>▶ Play</Button>
        <Button id="shared-edit" onClick={p.onEdit}>Edit a copy</Button>
      </div>
    </Dialog>
  );
}

export function renderSharedCard(root: Element, props: SharedCardProps & { open: boolean }): void {
  render(<SharedCard {...props} />, root);
}
