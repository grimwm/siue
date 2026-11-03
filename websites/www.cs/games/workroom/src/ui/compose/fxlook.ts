// How an effect looks on the timeline and in the palette: its family's colour and its glyph.
import { fxInfo } from '../../compose/djcatalogue.ts';
import type { Family } from '../../compose/djcatalogue.ts';
import type { FxClipEffect } from '../../score.ts';
import { FAMILY_GLYPH } from './Glyph.tsx';

export const FAMILY_COLOR: Readonly<Record<Family, string>> = {
  turntable: '#b07a4a', build: '#d4a72c', rhythm: '#d0645a', colour: '#a99be0', time: '#4fb0a8', voice: '#d0759a', live: '#7d9fd0',
};
/** An effect's colour: its family's. */
export const FX_COLOR = (e: FxClipEffect): string => FAMILY_COLOR[fxInfo(e).family];
const OWN_GLYPH: Partial<Record<FxClipEffect, string>> = { riser: 'riser', impact: 'hit', filter_sweep: 'sweep', crossfader: 'xfade', snare_roll: 'rhythm', vinyl: 'turntable' };
/** The glyph an effect wears on its chip and its blocks. */
export const fxGlyph = (e: FxClipEffect): string => OWN_GLYPH[e] ?? FAMILY_GLYPH[fxInfo(e).family] ?? 'plus';

