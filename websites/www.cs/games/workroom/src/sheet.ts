// Sheet music: one lane of the piece's MusicXML drawn with OpenSheetMusicDisplay.
// This is its own bundle, loaded only when the Sheet music view opens.
import { OpenSheetMusicDisplay } from 'opensheetmusicdisplay';
import { onlyLane } from './musicxml.ts';
import { createSheet } from './sheetlife.ts';
import type { SheetHandle } from './sheetlife.ts';

/** A sheet-music view in el: show a lane, redraw on resize, dispose when done. OSMD's own resize handling is off; the handle owns the one listener. */
export function mountSheet(el: HTMLElement): SheetHandle {
  return createSheet(el, host => new OpenSheetMusicDisplay(host as HTMLElement, { autoResize: false, drawTitle: false }), window, onlyLane);
}

const mounted = new WeakMap<HTMLElement, SheetHandle>();

/** Renders one lane (the MusicXML part with that id) with OpenSheetMusicDisplay into el, replacing any earlier rendering there. */
export async function renderSheet(el: HTMLElement, musicxml: string, laneId: string): Promise<void> {
  let sheet = mounted.get(el);
  if (!sheet) { sheet = mountSheet(el); mounted.set(el, sheet); }
  await sheet.show(musicxml, laneId);
}
