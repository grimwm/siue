// The Island of Crete: the status bar. src/ui.ts hands it finished words (src/status.ts); this draws them
// and reports a press of Menu.
import { render } from 'preact';
import { Button } from '../../../_kit/ui/button.tsx';
import { KeyChip } from '../../../_kit/ui/key-chip.tsx';
import type { StatusView } from '../status.ts';

export interface StatusProps {
  view: StatusView;
  /** The Menu button's key tab (the key table's Q). */
  menuKey: string;
  onMenu: () => void;
}

const STATS: { id: string; field: 'trial' | 'hearts' | 'relics' | 'keys' | 'gear' | 'moves'; label: string }[] = [
  { id: 'hud-trial', field: 'trial', label: 'Trial' },
  { id: 'hud-hearts', field: 'hearts', label: 'Hearts' },
  { id: 'hud-relics', field: 'relics', label: 'Relics' },
  { id: 'hud-keys', field: 'keys', label: 'Keys' },
  { id: 'hud-gear', field: 'gear', label: 'Gear' },
  { id: 'hud-moves', field: 'moves', label: 'Moves' },
];

export function Status(p: StatusProps) {
  const note = (field: string): string | undefined =>
    field === 'hearts' ? p.view.heartsNote : field === 'keys' ? p.view.keysNote : undefined;
  return (
    <>
      <dl class="hud">
        {STATS.map(s => (
          <div class="stat" key={s.id} title={note(s.field)}>
            <dt>{s.label}</dt>
            <dd id={s.id}>{p.view[s.field] || '–'}</dd>
          </div>
        ))}
      </dl>
      <Button id="btn-menu" class="menu-btn" onClick={p.onMenu}>
        Menu<KeyChip variant="tab" label={p.menuKey} at="menu" decorative />
      </Button>
    </>
  );
}

export function renderStatus(root: Element, props: StatusProps): void {
  render(<Status {...props} />, root);
}
