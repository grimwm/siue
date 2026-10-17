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

type Field = Exclude<keyof StatusView, 'foeNote'>;
const STATS: { id: string; field: Field; label: string }[] = [
  { id: 'hud-hp', field: 'hp', label: 'HP' },
  { id: 'hud-turns', field: 'turns', label: 'Turns' },
  { id: 'hud-pages', field: 'pages', label: 'Pages' },
  { id: 'hud-score', field: 'score', label: 'Score' },
  { id: 'hud-fuses', field: 'fuses', label: 'Fuses' },
  { id: 'hud-bash', field: 'bash', label: 'Bash' },
  { id: 'hud-dist', field: 'foe', label: 'Minotaur' },
];

export function Status(p: StatusProps) {
  return (
    <>
      <dl class="hud">
        {STATS.map(s => (
          <div class="stat" key={s.id} title={s.field === 'foe' ? p.view.foeNote : undefined}>
            <dt>{s.field === 'foe' ? <><span aria-hidden="true">👹</span><span class="sr">{s.label}</span></> : s.label}</dt>
            <dd id={s.id}>{p.view[s.field]}</dd>
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
