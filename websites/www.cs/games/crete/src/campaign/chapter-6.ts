/* The Island of Crete: Chapter 6, "The Folding Halls", in words. A draft for
 * the owner to edit: plain strings, one field per line. The levels that hold each
 * page name it in their `pages:` header. The quotations are word for word from
 * Brookes More's 1922 translation of Ovid's Metamorphoses, as Perseus publishes
 * it, and from J. G. Frazer's 1921 Loeb translation of Apollodorus's Library, as
 * Theoi publishes it. DOM-free. */
import type { ChapterLore } from './lore.ts';

export const CHAPTER_6: ChapterLore = {
  opening: {
    text: 'Here the Labyrinth folds. Teleports are set in its floors: step into one and you step out of the next, far off, still walking the way you went in. The beast cannot follow; to him every one of them is wall. In the dark you remember a river that turns back to meet itself.',
    quote: {
      text: '…so sports the clear Maeander, in the fields of Phrygia winding doubtful; back and forth it meets itself, until the wandering stream fatigued, impedes its wearied waters\' flow; from source to sea, from sea to source involved.',
      cite: 'Ovid, Metamorphoses, 8.162–166, tr. Brookes More (1922)',
    },
  },
  closing: {
    text: 'The last fold opens onto a long, straight hall, and the floor of it is worn smooth in a single groove. Something heavy has rolled along it, back and forth, for a long time. You remember the bronze guard of Crete, who never rested.',
    quote: {
      text: 'This Talos kept guard, running round the island thrice every day…',
      cite: 'Apollodorus, The Library, 1.9.26, tr. J. G. Frazer (1921)',
    },
  },
  pages: [
    {
      id: 'ch6-sky',
      title: 'The Open Sky',
      text: 'You remember what was said of the man who built this place: that when Minos held him on Crete, he looked up. The king held the land and the sea; nobody held the air. Whoever folded these halls had stopped believing in walls.',
      quote: {
        text: 'The unconfined skies remain though Minos may be lord of all the world his sceptre is not regnant of the air, and by that untried way is our escape.',
        cite: 'Ovid, Metamorphoses, 8.186–187, tr. Brookes More (1922)',
      },
    },
    {
      id: 'ch6-arts',
      title: 'Arts Unknown',
      text: 'You remember how the story went on: shut in on the island, Daedalus set to work on a thing no one had made before. The teleports that carry you from hall to hall are the same kind of work, by the same hand.',
      quote: {
        text: 'This said, he turned his mind to arts unknown and nature unrevealed.',
        cite: 'Ovid, Metamorphoses, 8.188–189, tr. Brookes More (1922)',
      },
    },
  ],
};
