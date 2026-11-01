/* The Island of Crete: Chapter 4, "The False Walls", in words. A draft for the
 * owner to edit: plain strings, one field per line. The levels that hold each
 * page name it in their `pages:` header. Every quotation is word for word from
 * Bernadotte Perrin's 1914 Loeb translation of Plutarch's Life of Theseus, as
 * LacusCurtius publishes it. DOM-free. */
import type { ChapterLore } from './lore.ts';

export const CHAPTER_4: ChapterLore = {
  opening: {
    text: 'Here the Labyrinth lies to you. Some walls are painted stone that gives at a touch; some open floor is wall you cannot see until you walk into it. The beast is fooled by neither: what is wall to him stays wall until you open it. In the dark you remember what the Cretans said, that there was no beast in the Labyrinth at all.',
    quote: {
      text: '…clearly does not think that these youths were put to death by Minos, but that they spent the rest of their lives as slaves in Crete.',
      cite: 'Plutarch, Theseus, 16.2, tr. Bernadotte Perrin (1914)',
    },
  },
  closing: {
    text: 'The false walls fall behind you and the true ones close in. Whatever the Cretans said, you have heard him breathing in the dark and seen where his horns scored the stone. Ahead, the floor is laid with the snares of the man who built it all.',
    quote: {
      text: 'Two different natures, man and bull, were joined in him.',
      cite: 'Plutarch, Theseus, 15.2, tr. Bernadotte Perrin (1914)',
    },
  },
  pages: [
    {
      id: 'ch4-taurus',
      title: 'Taurus',
      text: 'You remember the general of Minos, who won the first games and kept the tribute in the Labyrinth: Taurus, whose name means the bull, a man the Cretans hated. Some told you he was the only beast in the Labyrinth. You have seen the hoofprints since.',
      quote: {
        text: '…his general, Taurus by name, who was not reasonable and gentle in his disposition, but treated the Athenian youth with arrogance and cruelty.',
        cite: 'Plutarch, Theseus, 16.1, tr. Bernadotte Perrin (1914)',
      },
    },
    {
      id: 'ch4-queen',
      title: 'The Queen',
      text: 'You remember a thing whispered in the palace at Knossos and hushed at once: that the general stood too close to the queen, Pasiphaë, and that what was born of her was half a bull. Whichever tale is true, something is walking these halls.',
      quote: {
        text: 'For his disposition made his power hateful, and he was accused of too great intimacy with Pasiphaë.',
        cite: 'Plutarch, Theseus, 19.2, tr. Bernadotte Perrin (1914)',
      },
    },
  ],
};
