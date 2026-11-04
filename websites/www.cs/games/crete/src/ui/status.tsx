// The Island of Crete: the status bar. src/ui.ts hands it finished words (src/status.ts); this draws them
// and reports a press of Menu. Each stat wears its own quiet colour (game.css): Hearts soft red, Relics gold, Gear
// teal, Best soft green, or amber once the moves are past it; Moves stays plain. Best shows only where the level's
// fewest moves are known. The level's stat reads "Ch. 1 • Level 3/10" with its "Level" label kept for a
// screen reader only.
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

const STATS: { id: string; field: 'trial' | 'hearts' | 'relics' | 'keys' | 'gear' | 'moves' | 'best'; label: string }[] = [
  { id: 'hud-trial', field: 'trial', label: 'Level' },
  { id: 'hud-hearts', field: 'hearts', label: 'Hearts' },
  { id: 'hud-relics', field: 'relics', label: 'Relics' },
  { id: 'hud-keys', field: 'keys', label: 'Keys' },
  { id: 'hud-gear', field: 'gear', label: 'Gear' },
  { id: 'hud-moves', field: 'moves', label: 'Moves' },
  { id: 'hud-best', field: 'best', label: 'Best' },
];

export function Status(p: StatusProps) {
  const note = (field: string): string | undefined =>
    field === 'hearts' ? p.view.heartsNote : field === 'keys' ? p.view.keysNote : field === 'trial' ? p.view.trialNote || undefined
      : field === 'best' ? p.view.bestNote || undefined : undefined;
  const cls = (field: string): string =>
    `stat stat-${field}${field === 'best' && p.view.over > 0 ? ' over' : ''}`;
  return (
    <>
      <dl class="hud">
        {STATS.filter(s => s.field !== 'best' || p.view.best).map(s => (
          <div class={cls(s.field)} key={s.id} title={note(s.field)}>
            <dt class={s.field === 'trial' ? 'sr' : undefined}>{s.label}</dt>
            <dd id={s.id} aria-label={s.field === 'trial' ? p.view.trialNote || undefined : undefined}>{p.view[s.field] || '–'}</dd>
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
