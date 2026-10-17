// MusicXML text handling that needs no parser. DOM-free.

const DECLARATION = /^<\?xml[\s?]/;
const DECLARED = '<?xml version="1.0" encoding="UTF-8"?>';
const ID = /\sid\s*=\s*(["'])(.*?)\1/;
// A part or score-part element: self-closing, or up to its own closing tag.
const PART = /<(score-part|part)((?:\s[^>]*?)?)(?:\/>|>[\s\S]*?<\/\1\s*>)/g;

/** The MusicXML with every part but the lane's removed: its <score-part> in the part list and its <part> in the score. Throws, in words for the page, when the text is not a MusicXML score or has no part with that id. */
export function onlyLane(musicxml: string, laneId: string): string {
  if (/<score-timewise[\s>]/.test(musicxml)) throw new Error('This sheet music is laid out by time instead of by instrument, which this page cannot show one instrument at a time.');
  if (!/<score-partwise[\s>]/.test(musicxml)) throw new Error('The sheet music file is not valid MusicXML.');
  let found = false;
  const out = musicxml.replace(/^[\uFEFF\s]+/, '').replace(PART, (whole, tag: string, attrs: string) => {
    const id = ID.exec(attrs)?.[2];
    if (id === laneId) {
      if (tag === 'part') found = true;
      return whole;
    }
    return '';
  });
  if (!found) throw new Error(`The sheet music has no part for ${laneId}.`);
  return DECLARATION.test(out) ? out : `${DECLARED}\n${out}`;
}
