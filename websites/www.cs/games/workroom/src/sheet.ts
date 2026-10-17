// Sheet music: one lane of the piece's MusicXML drawn with OpenSheetMusicDisplay.
// This is its own bundle, loaded only when the Sheet music view opens.
import { OpenSheetMusicDisplay } from 'opensheetmusicdisplay';

/** The MusicXML with every part but the lane's removed (its <score-part> and its <part>). */
export function onlyLane(musicxml: string, laneId: string): string {
  const doc = new DOMParser().parseFromString(musicxml, 'application/xml');
  if (doc.getElementsByTagName('parsererror').length > 0) throw new Error('The sheet music file is not valid MusicXML.');
  const parts = [...doc.getElementsByTagName('score-part'), ...doc.getElementsByTagName('part')];
  if (!parts.some(el => el.getAttribute('id') === laneId)) throw new Error(`The sheet music has no part for ${laneId}.`);
  for (const el of parts) if (el.getAttribute('id') !== laneId) el.remove();
  return new XMLSerializer().serializeToString(doc);
}

/** Renders one lane (the MusicXML part with that id) with OpenSheetMusicDisplay into el. */
export async function renderSheet(el: HTMLElement, musicxml: string, laneId: string): Promise<void> {
  const osmd = new OpenSheetMusicDisplay(el, { autoResize: true, drawTitle: false });
  await osmd.load(onlyLane(musicxml, laneId));
  osmd.render();
}
