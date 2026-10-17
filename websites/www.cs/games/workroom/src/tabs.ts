// Which views a piece offers. DOM-free.
import type { Score } from './score.ts';

export type Tab = 'story' | 'roll' | 'sound' | 'sheet';
export const TAB_LABELS: Readonly<Record<Tab, string>> = { story: 'Story', roll: 'Piano roll', sound: 'Sound picture', sheet: 'Sheet music' };

/** The views a piece offers, in this order: Story and Sound picture always; Piano roll only when the score has notes; Sheet music only for a music piece (a sound piece never shows it, even when it carries MusicXML). */
export function tabsFor(score: Score): Tab[] {
  const tabs: Tab[] = ['story'];
  if (score.notes.length > 0) tabs.push('roll');
  tabs.push('sound');
  if (score.kind === 'music') tabs.push('sheet');
  return tabs;
}

/** The wanted tab when the piece offers it, else 'story'. */
export function pickTab(tabs: readonly Tab[], wanted: Tab): Tab {
  return tabs.includes(wanted) ? wanted : 'story';
}
