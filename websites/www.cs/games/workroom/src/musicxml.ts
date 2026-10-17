// MusicXML text handling that needs no parser. DOM-free.

const ID = /\sid\s*=\s*(["'])(.*?)\1/;
// A part or score-part element: self-closing, or up to its own closing tag.
const PART = /<(score-part|part)((?:\s[^>]*?)?)(?:\/>|>[\s\S]*?<\/\1\s*>)/g;

/** The MusicXML with every part but the lane's removed: its <score-part> in the part list and its <part> in the score. Throws, in words for the page, when the text is not a MusicXML score or has no part with that id. */
export function onlyLane(musicxml: string, laneId: string): string {
  if (!/<score-(partwise|timewise)[\s>]/.test(musicxml)) throw new Error('The sheet music file is not valid MusicXML.');
  let found = false;
  const out = musicxml.replace(PART, (whole, tag: string, attrs: string) => {
    const id = ID.exec(attrs)?.[2];
    if (id === laneId) {
      if (tag === 'part') found = true;
      return whole;
    }
    return '';
  });
  if (!found) throw new Error(`The sheet music has no part for ${laneId}.`);
  return out;
}
