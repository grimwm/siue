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

/** The one-line legend under each view of a music piece. */
export const LEGENDS: Readonly<Record<Tab, readonly string[]>> = {
  story: ['block = a note', 'star = a note', 'higher = higher note', 'bigger = louder', 'glow = energy'],
  roll: ['block = a note', 'higher = higher note', 'longer = held longer', 'colour = instrument'],
  sound: ['bottom = low sounds', 'top = high', 'brighter = louder'],
  sheet: ['five lines = a staff', 'higher on it = higher note'],
};

/** The stars of a music piece's Story (and the pitch and loudness they carry) exist only when the score has motifs. */
const STAR_ITEMS: readonly string[] = ['star = a note', 'higher = higher note', 'bigger = louder'];

/** The legend for a view of this piece: only what that view draws. A music Story always draws dimmed note blocks and the glow, and stars only when the score has motifs; a sound Story has layers, moments and the glow, plus note blocks only when the sound has notes. */
export function legendFor(tab: Tab, score: Score): readonly string[] {
  if (tab !== 'story') return LEGENDS[tab];
  if (score.kind === 'sound') {
    return ['row = a layer', 'coloured block = a moment', ...(score.notes.length > 0 ? ['block = a note'] : []), 'glow = strength over time'];
  }
  return ['block = a note', ...(score.motifs.length > 0 ? STAR_ITEMS : []), 'glow = energy'];
}
