/* The Island of Crete: Chapter 1, "The Outer Halls", in words. A draft for the
 * owner to edit: plain strings, one field per line. The levels that hold each
 * page name it in their `pages:` header. DOM-free. */
import type { ChapterLore } from './lore.ts';

export const CHAPTER_1: ChapterLore = {
  opening: {
    text: "You are inside, Theseus, with Ariadne's thread in your hand and the door shut behind you. This is not the Labyrinth yet. These are its outer halls, built by Daedalus to wear down each year's tribute before it ever reaches the beast. The beast hunts here all the same. Find the way through.",
    quote: {
      text: '…these young men and women, on being brought to Crete, were destroyed by the Minotaur in the Labyrinth, or else wandered about at their own will and, being unable to find an exit, perished there…',
      cite: 'Plutarch, Theseus, 15.2, tr. Bernadotte Perrin (1914)',
    },
  },
  closing: {
    text: 'The last hall ends at a gate with no lock on this side. The air behind it is colder, and the thread in your hand is shorter than the dark beyond. Everything until now was the proving ground. The Labyrinth begins here.',
    quote: {
      text: 'So Daedalus contrived innumerous paths, and windings vague, so intricate that he, the architect, hardly could retrace his steps.',
      cite: 'Ovid, Metamorphoses, 8.166–168, tr. Brookes More (1922)',
    },
  },
  pages: [
    {
      id: 'ch1-tribute-marks',
      title: "A Tribute's Marks",
      text: 'Scratched into the wall by someone who came before you: He does not tire, and you will. Let him catch you once, where the floor is marked, and he loses you. I learned it too late to use it twice.',
      quote: {
        text: 'He had the face of a bull, but the rest of him was human; and Minos, in compliance with certain oracles, shut him up and guarded him in the Labyrinth.',
        cite: 'Apollodorus, The Library, 3.1.4, tr. J. G. Frazer (1921)',
      },
    },
    {
      id: 'ch1-chalk',
      title: 'Chalk',
      text: 'The same hand, fainter: I marked every turn in chalk. In the morning my marks were on walls I had never passed. Trust nothing you counted yesterday. The halls move at night.',
      quote: {
        text: 'And at his suggestion she gave Theseus a clue when he went in; Theseus fastened it to the door, and, drawing it after him, entered in.',
        cite: 'Apollodorus, The Library, Epitome 1.9, tr. J. G. Frazer (1921)',
      },
    },
  ],
};
