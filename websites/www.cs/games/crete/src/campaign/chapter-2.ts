/* The Island of Crete: Chapter 2, "The Winding Ways", in words. A draft for the
 * owner to edit: plain strings, one field per line. The levels that hold each
 * page name it in their `pages:` header. Every quotation is word for word from
 * Bernadotte Perrin's 1914 Loeb translation of Plutarch's Life of Theseus, as
 * LacusCurtius publishes it. DOM-free. */
import type { ChapterLore } from './lore.ts';

export const CHAPTER_2: ChapterLore = {
  opening: {
    text: 'Beyond the gate the ways grow narrow. They wind and double back, and their floors are strewn with loose stone that shifts underfoot. A man can cross it; the beast will not set a hoof on it. In the dark you remember Athens, and the day the lots were drawn.',
    quote: {
      text: '…they sent heralds and made their supplication and entered into an agreement to send him every nine years a tribute of seven youths and as many maidens.',
      cite: 'Plutarch, Theseus, 15.1, tr. Bernadotte Perrin (1914)',
    },
  },
  closing: {
    text: 'The winding ways end at an inner gate, older than the first and darker. The thread runs on beneath it, deeper into the Labyrinth than any tribute has gone and come back. Somewhere past it is the beast, and beyond the beast, the ship and its sails.',
    quote: {
      text: '…but now Theseus encouraged his father and loudly boasted that he would master the Minotaur…',
      cite: 'Plutarch, Theseus, 17.4, tr. Bernadotte Perrin (1914)',
    },
  },
  pages: [
    {
      id: 'ch2-lots',
      title: 'The Lots',
      text: 'You remember the market place in Athens: the fathers standing with their sons, the lots not yet cast, and the anger at your father, who had no son of his own in the draw. Before the first lot was drawn, you stepped forward. Nobody chose you for this.',
      quote: {
        text: 'These things troubled Theseus, who, thinking it right not to disregard but to share in the fortune of his fellow-citizens, came forward and offered himself independently of the lot.',
        cite: 'Plutarch, Theseus, 17.2, tr. Bernadotte Perrin (1914)',
      },
    },
    {
      id: 'ch2-black-sail',
      title: 'The Black Sail',
      text: 'The ship that brought you here sailed under black, as every tribute ship has. On the shore your father pressed a second sail into the pilot\'s hands, a white one, and made him promise what it would mean.',
      quote: {
        text: '…he gave the pilot another sail, a white one, ordering him, if he returned with Theseus safe, to hoist the white sail, but otherwise to sail with the black one, and so indicate the affliction.',
        cite: 'Plutarch, Theseus, 17.4, tr. Bernadotte Perrin (1914)',
      },
    },
  ],
};
