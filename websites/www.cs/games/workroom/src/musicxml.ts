// MusicXML text handling that needs no parser. DOM-free.

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

/** The MusicXML with every part but the lane's removed: its <score-part> in the part list and its <part> in the score. The lane's part has the lane's id or, failing that, its name (laneName). Throws, in words for the page, when the text is not a MusicXML score or has no part for the lane. */
export function onlyLane(musicxml: string, laneId: string, laneName?: string): string {
  const target = partIdFor(musicxml, laneId, laneName) ?? laneId;
  if (/<score-timewise[\s>]/.test(musicxml)) throw new Error('This sheet music is laid out by time instead of by instrument, which this page cannot show one instrument at a time.');
  if (!/<score-partwise[\s>]/.test(musicxml)) throw new Error('The sheet music file is not valid MusicXML.');
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
  return DECLARATION.test(out) ? out : `${DECLARED}\n${out}`;
}
