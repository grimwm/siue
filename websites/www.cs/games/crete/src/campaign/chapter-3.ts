/* The Island of Crete: Chapter 3, "The Closing Ways", in words. A draft for the
 * owner to edit: plain strings, one field per line. The levels that hold each
 * page name it in their `pages:` header. Every quotation is word for word from
 * Bernadotte Perrin's 1914 Loeb translation of Plutarch's Life of Theseus, as
 * LacusCurtius publishes it. DOM-free. */
import type { ChapterLore } from './lore.ts';

export const CHAPTER_3: ChapterLore = {
  opening: {
    text: 'Past the inner gate the floor itself keeps watch. Some stones bear you once, then rise into wall the moment you step off them, so every way you take is a way you cannot take back. The beast will not tread on them at all. In the dark you remember Crete: the harbour at Knossos, the crowds, and the king who had sent for you.',
    quote: {
      text: '…the Labyrinth was a dungeon, with no other inconvenience than that its prisoners could not escape…',
      cite: 'Plutarch, Theseus, 16.1, tr. Bernadotte Perrin (1914)',
    },
  },
  closing: {
    text: 'The closing ways end in a ring of walls that were floor a moment ago. Behind you there is no road back, only the thread. Ahead the passages turn inward, toward the heart of the Labyrinth, and you remember the king on his high seat, who judged the tribute and kept the beast.',
    quote: {
      text: 'And yet they say that Minos was a king and lawgiver, and that Rhadamanthus was a judge under him, and a guardian of the principles of justice defined by him.',
      cite: 'Plutarch, Theseus, 16.3, tr. Bernadotte Perrin (1914)',
    },
  },
  pages: [
    {
      id: 'ch3-games',
      title: 'The Games of Minos',
      text: 'You remember the games Minos held for his dead son: the wrestling ground, the dust, the champion who had never lost. You threw him. Over the cheering you saw the king\'s daughter among the women in the stand, and she did not look away.',
      quote: {
        text: 'And since it was the custom in Crete for women to view the games, Ariadne was present, and was smitten with the appearance of Theseus, as well as filled with admiration for his athletic prowess, when he conquered all his opponents.',
        cite: 'Plutarch, Theseus, 19.3, tr. Bernadotte Perrin (1914)',
      },
    },
    {
      id: 'ch3-thread',
      title: 'The Thread',
      text: 'You remember the night before you went in. Ariadne came to the prison door with a ball of thread and told you what no tribute had ever been told: tie it at the entrance, keep it in your hand, and it will lead you out again. It is the thread you are holding now.',
      quote: {
        text: '…he got from Ariadne, who had fallen in love with him, the famous thread, and that having been instructed by her how to make his way through the intricacies of the Labyrinth…',
        cite: 'Plutarch, Theseus, 19.1, tr. Bernadotte Perrin (1914)',
      },
    },
  ],
};
