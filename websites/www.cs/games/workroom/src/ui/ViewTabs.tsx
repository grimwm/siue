// One button per view the piece offers.
import { TAB_LABELS } from '../tabs.ts';
import type { Tab } from '../tabs.ts';

export interface ViewTabsProps { tabs: Tab[]; tab: Tab; onTab(t: Tab): void }

export function ViewTabs(p: ViewTabsProps) {
  return (
    <div class="view-tabs" role="group" aria-label="Views">
      {p.tabs.map(t => (
        <button type="button" class="view-tab" aria-pressed={t === p.tab} onClick={() => p.onTab(t)}>{TAB_LABELS[t]}</button>
      ))}
    </div>
  );
}
