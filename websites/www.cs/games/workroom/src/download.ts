// The draft on screen as files to save: the audio the player plays, the sheet
// music when the piece has it, and the score, each named for the piece and the
// draft. DOM-free.
import type { AudioSource } from './score.ts';

export type DraftFile = AudioSource['file'] | 'score.musicxml' | 'score.json';
export interface DownloadLink { label: string; href: string; name: string }
/** piece and version name the draft; audio is the source the player plays (null: none plays); sheet: the score has score.musicxml. */
export interface DraftDownload { piece: string; version: number; audio: AudioSource | null; sheet: boolean }

/** The saved file's name: the piece, the draft and the file's own extension (crete-title-v3.webm). */
export function downloadName(piece: string, version: number, file: DraftFile): string {
  return `${piece}-v${version}${file.slice(file.lastIndexOf('.'))}`;
}

/** The links the page offers, in order: Audio, Sheet music, Score; url is the page's own draft-file route. */
export function downloadLinks(d: DraftDownload, url: (file: DraftFile) => string): DownloadLink[] {
  const files: [string, DraftFile][] = [];
  if (d.audio) files.push(['Audio', d.audio.file]);
  if (d.sheet) files.push(['Sheet music', 'score.musicxml']);
  files.push(['Score', 'score.json']);
  return files.map(([label, file]) => ({ label, href: url(file), name: downloadName(d.piece, d.version, file) }));
}
