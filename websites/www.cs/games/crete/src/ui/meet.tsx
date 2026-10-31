// The Island of Crete: the first card. The first time Theseus picks up a kind of item, or touches an active tile,
// play waits on this card: its picture in the board's look, its name, a line of lore and what it does. Go On (Enter)
// closes it, as do Space, ✕ and Q; src/ui.ts owns those keys, so the dialog is given no onDismiss.
import { render } from 'preact';
import { Dialog } from '../../../_kit/ui/dialog.tsx';
import { Button } from '../../../_kit/ui/button.tsx';
import type { Entry } from '../dictionary.ts';
import { KEYS } from '../keys.ts';
import { Picture } from './sprite.tsx';
import type { Pics } from './sprite.tsx';

export interface MeetCardProps {
  open: boolean;
  entry: Entry | null;
  pics: Pics;
  onClose: () => void;
}

export function MeetCard(p: MeetCardProps) {
  const e = p.entry;
  return (
    <Dialog open={p.open && !!e} id="meet-veil" veilClass="veil" panelClass="card meet" kicker={e?.kind === 'item' ? 'A first find' : 'A first touch'}
      kickerClass="kicker" titleId="meet-title" title={e?.name ?? ''} focusId="meet-go" describedBy="meet-effect"
      close={<Button id="meet-close" class="close" label="Close" keyLabel={KEYS.menu.label} onClick={p.onClose}>✕</Button>}>
      {e && (
        <div class="meet-body">
          <Picture pics={p.pics} entry={e} size={64} />
          <div class="meet-words">
            <p id="meet-lore" class="meet-lore">{e.lore}</p>
            <p id="meet-effect" class="meet-effect">{e.effect}</p>
          </div>
        </div>
      )}
      <p class="meet-note">It is in the Dictionary now, under the menu.</p>
      <Button id="meet-go" keyLabel={KEYS.begin.label} onClick={p.onClose}>Go On</Button>
    </Dialog>
  );
}

export function renderMeetCard(root: Element, props: MeetCardProps): void {
  render(<MeetCard {...props} />, root);
}
