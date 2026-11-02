/* The Island of Crete: Chapter 5, "The Snares of Daedalus", in words. A draft for
 * the owner to edit: plain strings, one field per line. The levels that hold each
 * page name it in their `pages:` header. Every quotation is word for word from
 * Bernadotte Perrin's 1914 Loeb translation of Plutarch's Life of Theseus, as
 * LacusCurtius publishes it. DOM-free. */
import type { ChapterLore } from './lore.ts';

export const CHAPTER_5: ChapterLore = {
  opening: {
    text: 'Here the floor itself is a trap. Daedalus laid snares in these halls: step into one and it holds you fast until something weighs down a brown button bound to it. The snares hold the beast as surely as they hold you. In the dark you remember that the man who built them did not stay to see them used.',
    quote: {
      text: '…when Daedalus fled from Crete in a merchant-vessel to Athens, Minos, contrary to the decrees, pursued him with his ships of war…',
      cite: 'Plutarch, Theseus, 19.4, tr. Bernadotte Perrin (1914)',
    },
  },
  closing: {
    text: 'The last snare closes on nothing, and you walk on. Ahead the passages begin to turn back on themselves: a hall you leave by one door, you enter again by another. The Labyrinth is learning to fold.',
    quote: {
      text: '…being an imitation of the circling passages in the Labyrinth, and consisting of certain rhythmic involutions and evolutions.',
      cite: 'Plutarch, Theseus, 21.1, tr. Bernadotte Perrin (1914)',
    },
  },
  pages: [
    {
      id: 'ch5-kinsman',
      title: 'The Kinsman',
      text: 'You remember a story told in Athens about the man who built this place: that he was no stranger, but of your own house, and that when Crete demanded him back, Athens would not give him up. If it is true, these snares were laid by your own blood.',
      quote: {
        text: '…declining to surrender Daedalus, who was his kinsman and cousin, being the son of Merope, the daughter of Erechtheus.',
        cite: 'Plutarch, Theseus, 19.5, tr. Bernadotte Perrin (1914)',
      },
    },
    {
      id: 'ch5-gate',
      title: 'The Gate',
      text: 'You remember another telling, in which you came to Crete not as tribute but with ships of your own, with Daedalus to guide you, and fought your way in at the gate of the Labyrinth. Whichever is true, the gate ahead is shut, and the snares lie before it.',
      quote: {
        text: 'Then joining battle with them at the gate of the Labyrinth, he slew Deucalion and his body-guard.',
        cite: 'Plutarch, Theseus, 19.6, tr. Bernadotte Perrin (1914)',
      },
    },
  ],
};
