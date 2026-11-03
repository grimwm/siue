/* The Island of Crete: Chapter 7, "The Bronze Guard", in words. A draft for
 * the owner to edit: plain strings, one field per line. The levels that hold each
 * page name it in their `pages:` header. The quotations are word for word from
 * R. C. Seaton's 1912 Loeb translation of Apollonius of Rhodes's Argonautica, as
 * Theoi publishes it, and from J. G. Frazer's 1921 Loeb translation of
 * Apollodorus's Library, as Theoi publishes it. DOM-free. */
import type { ChapterLore } from './lore.ts';

export const CHAPTER_7: ChapterLore = {
  opening: {
    text: 'Here the halls are worn smooth by something heavy. A bronze ball rolls down them on its own, straight ahead, and turns back at whatever stops it; touch it and it costs you a heart. It stops the beast as well: neither can pass the other. You remember the guard of bronze who walked the shores of this island.',
    quote: {
      text: 'He was of the stock of bronze, of the men sprung from ash-trees, the last left among the sons of the gods; and the son of Cronos gave him to Europa to be the warder of Crete and to stride round the island thrice a day with his feet of bronze.',
      cite: 'Apollonius of Rhodes, Argonautica, 4.1641–1644, tr. R. C. Seaton (1912)',
    },
  },
  closing: {
    text: 'The rolling stops. Past the last hall the roof is open, and from high above comes a beating of wings and a shriek. Something has been in here before you, and has left nothing behind it but a smell of burning.',
    quote: {
      text: 'These were winged female creatures, and when a table was laid for Phineus, they flew down from the sky and snatched up most of the victuals, and what little they left stank so that nobody could touch it.',
      cite: 'Apollodorus, The Library, 1.9.21, tr. J. G. Frazer (1921)',
    },
  },
  pages: [
    {
      id: 'ch7-brazen',
      title: 'The Brazen Man',
      text: 'You remember that nobody could agree on what the guard of Crete had been. A man of bronze, the last of an old race; a gift of the smith of the gods to Minos; or, some said, a bull. On this island, it seems, every guard ends up a bull.',
      quote: {
        text: 'Some say that he was a man of the Brazen Race, others that he was given to Minos by Hephaestus; he was a brazen man, but some say that he was a bull.',
        cite: 'Apollodorus, The Library, 1.9.26, tr. J. G. Frazer (1921)',
      },
    },
    {
      id: 'ch7-vein',
      title: 'The Bronze Nail',
      text: 'You remember how the bronze guard was made, and how he was undone. All his life ran in one vein, shut with a single nail; draw the nail, and the giant fell. All that bronze, and one small way through it, for whoever looked.',
      quote: {
        text: 'He had a single vein extending from his neck to his ankles, and a bronze nail was rammed home at the end of the vein.',
        cite: 'Apollodorus, The Library, 1.9.26, tr. J. G. Frazer (1921)',
      },
    },
  ],
};
