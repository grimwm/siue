/* The Island of Crete: Chapter 10, "The Heart of the Labyrinth", the campaign's last chapter, in words. A draft for
 * the owner to edit: plain strings, one field per line. The levels that hold each page name it in their `pages:`
 * header. The quotations are word for word from Nathaniel Hawthorne's Tanglewood Tales (1853) and Leonard C.
 * Smithers's 1894 prose translation of Catullus, as Project Gutenberg publishes them, and from J. G. Frazer's 1921
 * Loeb translation of Apollodorus, as Perseus publishes it. The closing card's endings, chosen by the story pages
 * found, are ours alone, as the vision asks of the meta chapters. DOM-free. */
import type { ChapterLore } from './lore.ts';

export const CHAPTER_10: ChapterLore = {
  opening: {
    text: 'The floor slopes down, and the breathing grows louder. Nothing new waits in the heart of the Labyrinth: only everything it has taught you, all at once, and him. The snares and the wooden cow, the mirror and the folds, the jars from the forge and the thief. And on every wall, in the same wet ink, someone is drawing the halls a step ahead of you.',
    quote: {
      text: 'And at last, in an open space, at the very center of the labyrinth, he did discern the hideous creature.',
      cite: 'Nathaniel Hawthorne, Tanglewood Tales, The Minotaur (1853)',
    },
  },
  closing: {
    text: 'In the open space at the very middle he turns and lowers his horns, and this time you do not run. The old stories say Theseus slew him; here he never dies, but the snare holds him, and you walk out along the thread while he bellows behind you. By the last gate stands a desk. On it lies a plan of this very hall, half drawn, and a pen still wet. The hand that drew every hall you walked was never Daedalus\'s: someone is still making this Labyrinth, a level at a time, for you to walk. The thread runs out into daylight. The drawing goes on.',
    quote: {
      text: 'Thence backwards he retraced his steps \'midst great laud, guiding his errant footsteps by means of a tenuous thread, lest when outcoming from tortuous labyrinthines his efforts be frustrated by unobservant wandering.',
      cite: 'Catullus, Poem 64, 112–115, tr. Leonard C. Smithers (1894)',
    },
    endings: [
      {
        pages: 'all',
        title: 'The True Ending: The Maker\'s Notes',
        text: 'You lay every page you found beside the last plan, and they fit: they were the maker\'s notes all along, the whole story, owned. The game ships, the beast keeps to his maze, and the review gives it five stars.',
      },
      {
        pages: 'some',
        title: 'Out, but Thin',
        text: 'The pages you found are enough to know the maze was made, not why. The game ships, and something still rustles in its code.',
      },
      {
        pages: 'none',
        title: 'The Hallway Ending',
        text: 'You escaped with no pages and no proof. Nobody believes the maze was real. The creature waits for your sequel.',
      },
    ],
  },
  pages: [
    {
      id: 'ch10-last-part',
      title: 'The Last Part',
      text: 'You remember how the old book tells it, short and plain: he found the beast in the last part of the maze, struck him down with his bare fists, and followed the thread out. Old books are sure of their endings. This one is still being written.',
      quote: {
        text: 'And having found the Minotaur in the last part of the labyrinth, he killed him by smiting him with his fists; and drawing the clue after him made his way out again.',
        cite: 'Apollodorus, The Library, Epitome 1.9, tr. J. G. Frazer (1921)',
      },
    },
    {
      id: 'ch10-oak',
      title: 'The Fallen Oak',
      text: 'You remember the poet\'s picture: the beast thrown down like an oak a storm tears up by the roots. Poets love a storm. But you have learned this maze: nothing here dies. It is held, and turned to stone, and lured away, and left behind.',
      quote: {
        text: '…so did Theseus fling down the conquered body of the brute, tossing its horns in vain towards the skies.',
        cite: 'Catullus, Poem 64, 110–111, tr. Leonard C. Smithers (1894)',
      },
    },
  ],
};
