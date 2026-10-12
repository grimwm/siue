// The Island of Crete: the inventory panel. src/ui.ts builds each row from the
// run's state; this draws the rows and reports which item to use.
import { render } from 'preact';
import { Panel } from '../../../_kit/ui/panel.tsx';
import { Button } from '../../../_kit/ui/button.tsx';
import { KeyChip } from '../../../_kit/ui/key-chip.tsx';
import type { ItemKind } from '../engine.ts';

export interface InventoryRow {
  kind: ItemKind;
  emoji: string;
  name: string;
  key: string;
  count: number;
  desc: string;
  disabled: boolean;
}

export interface InventoryProps {
  rows: InventoryRow[];
  onUse: (kind: ItemKind) => void;
}

export function Inventory(p: InventoryProps) {
  return (
    <Panel class="panel" titleId="inv-h" title="Inventory — use with Z / X / C">
      <ul id="inventory" class="inv">
        {p.rows.map(r => (
          <li key={r.kind}>
            <span>
              <span class="name">{`${r.emoji} ${r.name} × ${r.count} `}<KeyChip label={r.key} /></span>
              <span class="desc">{r.desc}</span>
            </span>
            <Button disabled={r.disabled} onClick={() => p.onUse(r.kind)}>{`Use (${r.key})`}</Button>
          </li>
        ))}
      </ul>
      <p class="hint">
        Using an item costs your turn: the Minotaur still moves twice, unless a Mirror Shard freezes it.
      </p>
    </Panel>
  );
}

export function renderInventory(root: Element, props: InventoryProps): void {
  render(<Inventory {...props} />, root);
}
