// The draft on screen as files to save: the audio the player plays (the WAV
// built in the page for a draft played from its score), the sheet music when
// the piece has it, and the score, each named for the piece and the draft.
// DOM-free.
import type { AudioSource } from './score.ts';

export type DraftFile = AudioSource['file'] | 'audio.wav' | 'score.musicxml' | 'score.json';
export interface DownloadLink { label: string; href: string; name: string }
/** piece and version name the draft; audio is the source the player plays (null: none plays); wav is the address of the sound built in the page, offered in its place; sheet: the score has score.musicxml. */
export interface DraftDownload { piece: string; version: number; audio: AudioSource | null; wav?: string; sheet: boolean }

/** The saved file's name: the piece, the draft and the file's own extension (crete-title-v3.webm). */
export function downloadName(piece: string, version: number, file: DraftFile): string {
  return `${piece}-v${version}${file.slice(file.lastIndexOf('.'))}`;
}

/** The links the page offers, in order: Audio, Sheet music, Score; url is the page's own draft-file route. */
export function downloadLinks(d: DraftDownload, url: (file: DraftFile) => string): DownloadLink[] {
  const links: DownloadLink[] = [];
  const add = (label: string, file: DraftFile, href = url(file)): void => { links.push({ label, href, name: downloadName(d.piece, d.version, file) }); };
  if (d.wav !== undefined) add('Audio (WAV)', 'audio.wav', d.wav);
  else if (d.audio) add('Audio', d.audio.file);
  if (d.sheet) add('Sheet music', 'score.musicxml');
  add('Score', 'score.json');
  return links;
}
