// The Island of Crete: the new-game card, between the title card's Play and the chapter card. It asks how the
// Labyrinth should look, Modern or Classic, as two pictures; a pick takes effect at once and is remembered, and the
// one drawn now is already picked. src/ui.ts owns the keys (Enter is Enter the halls, left and right pick, Q is
// Back), so the dialog is given no onDismiss.
import { render } from 'preact';
import { Dialog } from '../../../_kit/ui/dialog.tsx';
import { Button } from '../../../_kit/ui/button.tsx';
import { KEYS } from '../keys.ts';
import type { Look } from '../settings.ts';
import { LookTiles } from './look-tiles.tsx';

export interface LookPickProps {
  open: boolean;
  look: Look;
  onLook: (look: Look) => void;
  onEnter: () => void;
  onBack: () => void;
}

export function LookPick(p: LookPickProps) {
  return (
    <Dialog open={p.open} id="look-veil" veilClass="veil" panelClass="card look-pick" kicker="New game" kickerClass="kicker"
      titleId="look-title" title="How should the Labyrinth look?" focusId="pick-enter">
      <LookTiles look={p.look} idPrefix="pick" label="Look" blurbs onPick={p.onLook} />
      <p class="runstats">If the board runs slowly, pick Classic. You can switch at any time in the menu.</p>
      <div class="title-actions">
        <Button id="pick-enter" keyLabel={KEYS.begin.label} onClick={p.onEnter}>Enter the halls</Button>
        <Button id="pick-back" class="quiet" keyLabel={KEYS.menu.label} onClick={p.onBack}>Back</Button>
      </div>
    </Dialog>
  );
}

export function renderLookPick(root: Element, props: LookPickProps): void {
  render(<LookPick {...props} />, root);
}
