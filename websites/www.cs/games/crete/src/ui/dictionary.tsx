// The Island of Crete: the Dictionary, opened from the menu beside the Lore book. Two tabs: Backpack, what Theseus
// holds now in this level with counts, and Entries, everything this browser has met, items then hazards, each with
// its picture, lore and what it does; what has not been met yet is a silhouette named "???". src/ui.ts builds the
// rows and owns Q (back to the menu) and the left and right keys (the tabs), so the dialog is given no onDismiss.
import { render } from 'preact';
import { Dialog } from '../../../_kit/ui/dialog.tsx';
import { Button } from '../../../_kit/ui/button.tsx';
import { KeyChip } from '../../../_kit/ui/key-chip.tsx';
import type { Atlas } from '../board-plan.ts';
import type { Entry, Held } from '../dictionary.ts';
import { KEYS } from '../keys.ts';
import { Sprite } from './sprite.tsx';

export type DictionaryTab = 'backpack' | 'entries';
export const DICTIONARY_TABS: readonly DictionaryTab[] = ['backpack', 'entries'];

export interface EntryRow { entry: Entry; met: boolean }

export interface DictionaryProps {
  open: boolean;
  tab: DictionaryTab;
  /** A level is open: the backpack is its try's. */
  inLevel: boolean;
  held: readonly Held[];
  rows: readonly EntryRow[];
  atlas: Atlas;
  onTab: (tab: DictionaryTab) => void;
  onClose: () => void;
}

const TAB_NAMES: Record<DictionaryTab, string> = { backpack: 'Backpack', entries: 'Entries' };

function Backpack(p: DictionaryProps) {
  if (p.held.length === 0) {
    return <p id="dict-empty" class="dict-empty">{p.inLevel ? 'You hold nothing yet. What you pick up in this level is listed here.' : 'No level is open. What you carry in one is listed here.'}</p>;
  }
  return (
    <ul class="dict-list" id="dict-backpack">
      {p.held.map(({ entry: e, count }) => (
        <li key={e.id} class="dict-row" data-entry={e.id}>
          <Sprite atlas={p.atlas} name={e.sprite} size={40} />
          <div class="dict-words">
            <p class="dict-name">{e.name}{count > 1 && <span class="dict-count">{` × ${count}`}</span>}{e.key && <KeyChip label={e.key} />}</p>
            <p class="dict-effect">{e.effect}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function Entries(p: DictionaryProps) {
  const group = (kind: Entry['kind'], title: string) => (
    <section class="dict-group" aria-labelledby={`dict-${kind}-h`}>
      <h3 id={`dict-${kind}-h`}>{title}</h3>
      <ul class="dict-list">
        {p.rows.filter(r => r.entry.kind === kind).map(({ entry: e, met }) => met ? (
          <li key={e.id} class="dict-row" data-entry={e.id}>
            <Sprite atlas={p.atlas} name={e.sprite} size={40} />
            <div class="dict-words">
              <p class="dict-name">{e.name}{e.key && <KeyChip label={e.key} />}</p>
              <p class="dict-lore">{e.lore}</p>
              <p class="dict-effect">{e.effect}</p>
            </div>
          </li>
        ) : (
          <li key={e.id} class="dict-row locked" data-entry={e.id} data-locked="true">
            <Sprite atlas={p.atlas} name={e.sprite} size={40} locked />
            <div class="dict-words"><p class="dict-name">???</p></div>
          </li>
        ))}
      </ul>
    </section>
  );
  const met = p.rows.filter(r => r.met).length;
  return (
    <div id="dict-entries">
      <p class="dict-tally">{`${met} of ${p.rows.length} met`}</p>
      {group('item', 'Items')}
      {group('hazard', 'Hazards and tiles')}
    </div>
  );
}

export function Dictionary(p: DictionaryProps) {
  return (
    <Dialog open={p.open} id="dict-veil" veilClass="veil" panelClass="card dict" kicker="The Island of Crete" kickerClass="kicker"
      titleId="dict-title" title="Dictionary" focusId={`dict-tab-${p.tab}`}
      close={<Button id="dict-close" class="close" label="Close the Dictionary" keyLabel={KEYS.menu.label} onClick={p.onClose}>✕</Button>}>
      <div class="chapter-tabs dict-tabs">
        {DICTIONARY_TABS.map(t => (
          <Button key={t} id={`dict-tab-${t}`} class="chapter-tab" pressed={t === p.tab} onClick={() => p.onTab(t)}>{TAB_NAMES[t]}</Button>
        ))}
      </div>
      {p.tab === 'backpack' ? <Backpack {...p} /> : <Entries {...p} />}
    </Dialog>
  );
}

export function renderDictionary(root: Element, props: DictionaryProps): void {
  render(<Dictionary {...props} />, root);
}
