// Which views a piece offers. DOM-free.
import type { Kind, Score } from './score.ts';

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

/** The one-line legend under each view of a music piece. */
export const LEGENDS: Readonly<Record<Tab, readonly string[]>> = {
  story: ['star = a note', 'higher = higher note', 'bigger = louder', 'glow = energy'],
  roll: ['block = a note', 'higher = higher note', 'longer = held longer', 'colour = instrument'],
  sound: ['bottom = low sounds', 'top = high', 'brighter = louder'],
  sheet: ['five lines = a staff', 'higher on it = higher note'],
};

/** A sound piece's Story has layers, moments and the glow, no stars or pitch rows; every other view reads the same for both kinds. */
const SOUND_STORY: readonly string[] = ['row = a layer', 'coloured block = a moment', 'glow = strength over time'];

/** The legend for a view of a piece of this kind: only what that view draws. */
export function legendFor(tab: Tab, kind: Kind): readonly string[] {
  return kind === 'sound' && tab === 'story' ? SOUND_STORY : LEGENDS[tab];
}
