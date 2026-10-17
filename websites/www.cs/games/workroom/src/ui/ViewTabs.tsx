// The views a piece offers, as a tab list; the view under it is panelId('view').
import { TAB_LABELS } from '../tabs.ts';
import type { Tab } from '../tabs.ts';
import { Tabs } from './console/Tabs.tsx';

export interface ViewTabsProps { tabs: Tab[]; tab: Tab; onTab(t: Tab): void }

export function ViewTabs(p: ViewTabsProps) {
  return <Tabs label="Views" idPrefix="view" items={p.tabs.map(t => ({ id: t, label: TAB_LABELS[t] }))} value={p.tab} onChange={p.onTab} />;
}
