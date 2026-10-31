// MusicXML text handling that needs no parser. DOM-free.
import type { Family } from './score.ts';

const DECLARATION = /^<\?xml[\s?]/;
const DECLARED = '<?xml version="1.0" encoding="UTF-8"?>';
const ID = /\sid\s*=\s*(["'])(.*?)\1/;
// A part or score-part element: self-closing, or up to its own closing tag.
const PART = /<(score-part|part)((?:\s[^>]*?)?)(?:\/>|>[\s\S]*?<\/\1\s*>)/g;

const PART_NAME = /<part-name\b[^>]*>([\s\S]*?)<\/part-name\s*>/;

/** The id of the part for the lane: the lane's own id when a part has it, else the part whose <part-name> is the lane's name (notation programs often number parts P1, P2, keeping only the name); null when neither is found. */
function partIdFor(musicxml: string, laneId: string, laneName?: string): string | null {
  let byName: string | null = null;
  for (const m of musicxml.matchAll(PART)) {
    if (m[1] !== 'score-part') continue;
    const id = ID.exec(m[2] ?? '')?.[2];
    if (id === laneId) return laneId;
    if (byName === null && id !== undefined && laneName !== undefined && PART_NAME.exec(m[0])?.[1]?.trim() === laneName) byName = id;
  }
  return byName;
}

function partwise(musicxml: string): void {
  if (/<score-timewise[\s>]/.test(musicxml)) throw new Error('This sheet music is laid out by time instead of by instrument, which this page cannot show one instrument at a time.');
  if (!/<score-partwise[\s>]/.test(musicxml)) throw new Error('The sheet music file is not valid MusicXML.');
}

const declared = (out: string): string => (DECLARATION.test(out) ? out : `${DECLARED}\n${out}`);

/** The MusicXML with every part but the lane's removed: its <score-part> in the part list and its <part> in the score. The lane's part has the lane's id or, failing that, its name (laneName). Throws, in words for the page, when the text is not a MusicXML score or has no part for the lane. */
export function onlyLane(musicxml: string, laneId: string, laneName?: string): string {
  const target = partIdFor(musicxml, laneId, laneName) ?? laneId;
  partwise(musicxml);
  let found = false;
  const out = musicxml.replace(/^[\uFEFF\s]+/, '').replace(PART, (whole, tag: string, attrs: string) => {
    const id = ID.exec(attrs)?.[2];
    if (id === target) {
      if (tag === 'part') found = true;
      return whole;
    }
    return '';
  });
  if (!found) throw new Error(`The sheet music has no part for ${laneId}.`);
  return declared(out);
}

/** Where each family sits in a conductor's score, top to bottom: woodwinds, brass, percussion, harp, keyboards, voices, strings, then sounds that are not instruments. */
export const SCORE_ORDER: Readonly<Record<Family, number>> = {
  woodwinds: 0, brass: 1, percussion: 2, bells: 2, impact: 2, harp: 3, keys: 4, synth: 4, electronic: 4, choir: 5, voice: 5, strings: 6,
  ambience: 7, whoosh: 7, foley: 7, ui: 7,
};

/** Every part, its <score-part> and its <part> both in standard score order by their lanes' families (lanes of one family, and parts with no lane after them all, keep their order). A score that groups its parts (<part-group>) keeps its own order, since the groups are positional. Throws, in words for the page, when the text is not a MusicXML score. */
export function fullScore(musicxml: string, lanes: readonly { id: string; name: string; family: Family }[]): string {
  partwise(musicxml);
  const text = musicxml.replace(/^[\uFEFF\s]+/, '');
  if (/<part-group[\s>/]/.test(text)) return declared(text);
  const rank = new Map<string, number>();
  lanes.forEach((l, i) => {
    const id = partIdFor(text, l.id, l.name);
    if (id !== null && !rank.has(id)) rank.set(id, SCORE_ORDER[l.family] * 1000 + i);
  });
  const sorted = (tag: string): string[] => {
    const found = [...text.matchAll(PART)].filter(m => m[1] === tag).map((m, i) => ({ whole: m[0], key: rank.get(ID.exec(m[2] ?? '')?.[2] ?? '') ?? 1e9 + i }));
    return found.sort((a, b) => a.key - b.key).map(f => f.whole);
  };
  const queue = { 'score-part': sorted('score-part'), part: sorted('part') };
  return declared(text.replace(PART, (_whole, tag: 'score-part' | 'part') => queue[tag].shift() ?? ''));
}

const BEAT_UNIT: Readonly<Record<number, string>> = { 1: 'whole', 2: 'half', 4: 'quarter', 8: 'eighth', 16: '16th' };
const escapeXml = (t: string): string => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** The score as a printed first page shows it: the piece's title as its movement title (replacing any), and, when no part has a tempo mark, the piece's opening tempo on the first bar of the first part. */
export function titled(musicxml: string, title: string, tempo: { bpm: number; unit: number } | null): string {
  partwise(musicxml);
  const heading = `<movement-title>${escapeXml(title)}</movement-title>`;
  let out = musicxml.replace(/<movement-title\b[^>]*>[\s\S]*?<\/movement-title\s*>|<movement-title\s*\/>/, () => heading);
  if (!out.includes(heading)) {
    const at = out.search(/<(identification|defaults|credit|part-list)[\s>/]/);
    out = at < 0 ? out : `${out.slice(0, at)}${heading}\n  ${out.slice(at)}`;
  }
  const unit = tempo ? BEAT_UNIT[tempo.unit] : undefined;
  if (tempo && unit && !/<metronome[\s>]/.test(out)) {
    const mark = `<direction placement="above"><direction-type><metronome><beat-unit>${unit}</beat-unit><per-minute>${tempo.bpm}</per-minute></metronome></direction-type><sound tempo="${Math.round((tempo.bpm * 4) / tempo.unit * 1000) / 1000}"/></direction>`;
    out = out.replace(/(<part[\s>][^]*?<measure\b[^>]*>)(\s*<attributes>[\s\S]*?<\/attributes\s*>)?/, (_m, open: string, attrs: string | undefined) => `${open}${attrs ?? ''}${mark}`);
  }
  return declared(out);
}
