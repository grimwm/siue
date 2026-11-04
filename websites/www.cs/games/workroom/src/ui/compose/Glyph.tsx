// The composer's drawn icons: transport, editing and effect glyphs on a 24-unit grid, stroked in the current colour,
// so every button can show a picture beside (or instead of) its words.
import type { JSX } from 'preact';
import { cx } from '../console/cx.ts';

const S = (d: string) => <path d={d} />;
const F = (d: string) => <path d={d} fill="currentColor" stroke="none" />;

const GLYPHS: Record<string, () => JSX.Element | JSX.Element[]> = {
  play: () => F('M7 4.8v14.4a.8.8 0 0 0 1.2.7l11.3-7.2a.8.8 0 0 0 0-1.4L8.2 4.1A.8.8 0 0 0 7 4.8z'),
  stop: () => <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" stroke="none" />,
  rewind: () => [S('M6 5v14'), F('M19 5.8v12.4a.8.8 0 0 1-1.2.7L9.2 12.7a.8.8 0 0 1 0-1.4l8.6-6.2a.8.8 0 0 1 1.2.7z')],
  loop: () => [S('M4 12v-1a4 4 0 0 1 4-4h11'), S('M16 4l3 3-3 3'), S('M20 12v1a4 4 0 0 1-4 4H5'), S('M8 20l-3-3 3-3')],
  undo: () => [S('M9 5 4 10l5 5'), S('M4 10h10a5 5 0 0 1 0 10h-4')],
  redo: () => [S('M15 5l5 5-5 5'), S('M20 10H10a5 5 0 0 0 0 10h4')],
  more: () => [<circle cx="5" cy="12" r="1.6" fill="currentColor" />, <circle cx="12" cy="12" r="1.6" fill="currentColor" />, <circle cx="19" cy="12" r="1.6" fill="currentColor" />],
  split: () => [<circle cx="6" cy="6.5" r="2.6" />, <circle cx="6" cy="17.5" r="2.6" />, S('M8.3 7.8 20 16M8.3 16.2 20 8')],
  join: () => [<rect x="2.5" y="7" width="8" height="10" rx="2" />, <rect x="13.5" y="7" width="8" height="10" rx="2" />, S('M9 12h6')],
  dup: () => [<rect x="2.5" y="7" width="9" height="10" rx="2" />, <rect x="12.5" y="7" width="9" height="10" rx="2" stroke-dasharray="2.5 2" />, S('M17 10.5v3M15.5 12h3')],
  copy: () => [<rect x="8" y="8" width="12" height="12" rx="2" />, S('M5 15.5H4.5a1.5 1.5 0 0 1-1.5-1.5V5a1.5 1.5 0 0 1 1.5-1.5H14A1.5 1.5 0 0 1 15.5 5v.5')],
  paste: () => [S('M9 4.5H6.5A1.5 1.5 0 0 0 5 6v13.5A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H15'), <rect x="9" y="3" width="6" height="3.5" rx="1" />, S('M9 12h6M9 16h4')],
  select: () => [<rect x="3.5" y="3.5" width="17" height="17" rx="2" stroke-dasharray="3 2.6" />, F('M10 10l7.5 3-3.2 1.3L13 17.5z')],
  chord: () => [<ellipse cx="9" cy="17" rx="3" ry="2.2" fill="currentColor" transform="rotate(-20 9 17)" />, <ellipse cx="9" cy="11.5" rx="3" ry="2.2" fill="currentColor" transform="rotate(-20 9 11.5)" />, <ellipse cx="9" cy="6" rx="3" ry="2.2" fill="currentColor" transform="rotate(-20 9 6)" />, S('M11.8 16.4V3')],
  magnet: () => [S('M5 4v8a7 7 0 0 0 14 0V4h-4.5v8a2.5 2.5 0 0 1-5 0V4z'), S('M5 8h4.5M14.5 8H19')],
  flag: () => [S('M5 21V3.5'), <path d="M5 4h12l-3 4 3 4H5" fill="currentColor" fill-opacity=".25" />],
  pencil: () => [S('M4 20l1-4.5L15.5 5a2.1 2.1 0 0 1 3 3L8 18.5z'), S('M13.5 7l3 3')],
  spk: () => [<path d="M3.5 9.5h3.5l4.8-4v13l-4.8-4H3.5z" fill="currentColor" />, S('M15.5 9a4.2 4.2 0 0 1 0 6'), S('M18.3 6.3a8 8 0 0 1 0 11.4')],
  'spk-off': () => [<path d="M3.5 9.5h3.5l4.8-4v13l-4.8-4H3.5z" fill="currentColor" />, S('M15.5 9a4.2 4.2 0 0 1 0 6'), S('M18.3 6.3a8 8 0 0 1 0 11.4'), <path d="M3 3l18 18" stroke-width="2.4" />],
  grip: () => [4, 10].flatMap(x => [3, 9, 15].map(y => <circle cx={x * 24 / 14} cy={y * 24 / 18 + 0} r="1.9" fill="currentColor" stroke="none" />)),
  'chev-r': () => S('M9 6l6 6-6 6'),
  'chev-d': () => S('M6 9l6 6 6-6'),
  'chev-u': () => S('M6 15l6-6 6 6'),
  'chev-l': () => S('M15 6l-6 6 6 6'),
  expand: () => S('M7 5l5 5 5-5M7 13l5 5 5-5'),
  collapse: () => S('M7 11l5-5 5 5M7 19l5-5 5 5'),
  plus: () => S('M12 5v14M5 12h14'),
  'zoom-in': () => [<circle cx="10.5" cy="10.5" r="6.5" />, S('M15.5 15.5 20 20M8 10.5h5M10.5 8v5')],
  'zoom-out': () => [<circle cx="10.5" cy="10.5" r="6.5" />, S('M15.5 15.5 20 20M8 10.5h5')],
  keys: () => [<rect x="2.5" y="6" width="19" height="12" rx="2" />, S('M6.5 10h0M10 10h0M13.5 10h0M17 10h0M8 14.2h8')],
  trash: () => S('M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13M10 11v5.5M14 11v5.5'),
  eraser: () => [S('M4.5 15.5 13 7l5.5 5.5-6.5 6.5H8z'), S('M9 11l5.5 5.5M13 19.5h7')],
  close: () => S('M6 6l12 12M18 6 6 18'),
  check: () => S('M5 12.5l4.5 4.5L19 7.5'),
  mix: () => [S('M6 4v16M12 4v16M18 4v16'), <rect x="4" y="13" width="4" height="3" rx="1" fill="currentColor" />, <rect x="10" y="7" width="4" height="3" rx="1" fill="currentColor" />, <rect x="16" y="11" width="4" height="3" rx="1" fill="currentColor" />],
  roll: () => [<rect x="3" y="4" width="18" height="16" rx="2" />, <path d="M6 9h5M10 13h6M7 17h4" stroke-width="2.6" />],
  staff: () => [<path d="M3 6h18M3 10h18M3 14h18M3 18h18" stroke-width="1.2" />, <ellipse cx="10" cy="16" rx="2.6" ry="2" fill="currentColor" transform="rotate(-20 10 16)" />, S('M12.4 15.4V5')],
  save: () => [S('M5 4h11l3 3v13H5z'), S('M8 4v5h7V4'), <rect x="8" y="13" width="8" height="5" rx="1" />],
  mic: () => [<rect x="9" y="3" width="6" height="11" rx="3" />, S('M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M8.5 21h7')],
  riser: () => [<path d="M3 19h18V5z" fill="currentColor" fill-opacity=".25" stroke="none" />, S('M3 19 21 5M15 5h6v6')],
  sweep: () => [S('M3 8h8c5 0 6 11 10 11'), <path d="M3 19.5h18" opacity=".4" />],
  hit: () => <path d="M12 2.5l2 5.5 5.6-1.8-3.6 4.7 4.7 3.4-5.8.4.6 5.8L12 16.2l-3.5 4.3.6-5.8-5.8-.4 4.7-3.4-3.6-4.7L10 8z" fill="currentColor" fill-opacity=".25" />,
  xfade: () => S('M3 6c7 0 11 12 18 12M3 18c7 0 11-12 18-12'),
  turntable: () => [<circle cx="11" cy="12" r="8" />, <circle cx="11" cy="12" r="2" />, S('M19 4l2 2-5 7')],
  rhythm: () => S('M3 17h3V7h3v10h3V7h3v10h3V7h3'),
  colour: () => [<circle cx="9" cy="10" r="5" />, <circle cx="15" cy="10" r="5" />, <circle cx="12" cy="15" r="5" />],
  time: () => [<circle cx="12" cy="12" r="8.5" />, S('M12 7v5l3.5 2')],
  voice: () => [S('M4 12h2M8 8v8M12 5v14M16 8v8M20 11v2')],
  live: () => [<circle cx="7" cy="16" r="3" />, <circle cx="17" cy="16" r="3" />, S('M4 6h16M12 6v6')],
  build: () => [S('M3 19 21 5'), S('M15 5h6v6')],
  reel: () => [<circle cx="12" cy="12" r="9" />, <circle cx="12" cy="12" r="1.6" fill="currentColor" />, <circle cx="12" cy="6.8" r="1.9" />, <circle cx="16.5" cy="14.6" r="1.9" />, <circle cx="7.5" cy="14.6" r="1.9" />],
  dial: () => [<circle cx="12" cy="13" r="7" />, S('M12 13 8.5 9.5'), S('M3.5 6.5l1.6 1.4M20.5 6.5l-1.6 1.4M12 2.5v2.2')],
  sliders: () => [S('M4 7h10M18 7h2M4 17h4M12 17h8'), <circle cx="16" cy="7" r="2.2" />, <circle cx="10" cy="17" r="2.2" />],
  metro: () => [S('M9.5 3.5h5l4 17h-13z'), S('M12 15.5 17.5 6'), <path d="M8 15.5h8" stroke-width="1.4" />],
  song: () => [S('M9 18V6l10-2v12'), <circle cx="6.5" cy="18" r="2.5" />, <circle cx="16.5" cy="16" r="2.5" />],
};

/** One of the composer's icons, `size` pixels square; decorative (the button around it carries the name). */
export function Glyph(p: { name: string; size?: number; class?: string }) {
  const draw = GLYPHS[p.name] ?? GLYPHS['plus']!;
  const size = p.size ?? 20;
  return (
    <svg data-glyph={p.name} aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" class={cx('shrink-0', p.class)}
      fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">{draw()}</svg>
  );
}

/** The glyph each DJ & Effects family wears on its chips. */
export const FAMILY_GLYPH: Readonly<Record<string, string>> = {
  turntable: 'turntable', build: 'riser', rhythm: 'rhythm', colour: 'colour', time: 'time', voice: 'voice', live: 'xfade',
};
