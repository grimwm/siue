/* The Island of Crete: Chapter 9, "Daedalus's Workshop", in words. A draft for
 * the owner to edit: plain strings, one field per line. The levels that hold each
 * page name it in their `pages:` header. The quotations are word for word from
 * H. G. Evelyn-White's 1914 Loeb translation of the Homeric Hymn to Hermes, as
 * Project Gutenberg publishes it, and from J. G. Frazer's 1921 Loeb translation of
 * Apollodorus's Library, as Perseus publishes it. DOM-free. */
import type { ChapterLore } from './lore.ts';

export const CHAPTER_9: ChapterLore = {
  opening: {
    text: 'The small quick footprints lead down into Daedalus\'s workshop. A thief haunts these halls, a servant of Hermes: step where it waits and it takes all your gear, though never your keys or tools. Jars from the forge stand in the way, and burst at a touch, for a heart; a block pushed onto one bursts it for nothing, and the beast never steps on them. And the machines still run: press a red button, and its machine turns out another block, or another hazard.',
    quote: {
      text: 'For then she bare a son, of many shifts, blandly cunning, a robber, a cattle driver, a bringer of dreams, a watcher by night, a thief at the gates, one who was soon to show forth wonderful deeds among the deathless gods.',
      cite: 'Homeric Hymns, To Hermes, 13–16, tr. H. G. Evelyn-White (1914)',
    },
  },
  closing: {
    text: 'The machines fall still. On the last bench lie plans of every hall you have walked, drawn in a hand that is not Daedalus\'s, and the ink on the newest is still wet. Past the bench the floor slopes down toward the middle of the maze, and from there comes a breathing you know.',
    quote: {
      text: 'Now the Minotaur was confined in a labyrinth, in which he who entered could not find his way out; for many a winding turn shut off the secret outward way.',
      cite: 'Apollodorus, The Library, 3.15.8, tr. J. G. Frazer (1921)',
    },
  },
  pages: [
    {
      id: 'ch9-tracks',
      title: 'The Backward Tracks',
      text: 'You remember the oldest thief\'s trick. On the day he was born, Hermes drove Apollo\'s cattle off backwards, so that every track pointed home, and walked the other way himself. The prints in this dust point every way at once.',
      quote: {
        text: 'Also, he bethought him of a crafty ruse and reversed the marks of their hoofs, making the front behind and the hind before, while he himself walked the other way.',
        cite: 'Homeric Hymns, To Hermes, 76–78, tr. H. G. Evelyn-White (1914)',
      },
    },
    {
      id: 'ch9-inventor',
      title: 'The First Inventor',
      text: 'You remember what they said of the man who built this place: that he was the first to make images, figures so like the living that they seemed to walk. His workshop still turns out copies, one after another, as if it cannot stop.',
      quote: {
        text: 'The labyrinth was constructed by Daedalus, whose father was Eupalamus, son of Metion, and whose mother was Alcippe; for he was an excellent architect and the first inventor of images.',
        cite: 'Apollodorus, The Library, 3.15.8, tr. J. G. Frazer (1921)',
      },
    },
  ],
};
