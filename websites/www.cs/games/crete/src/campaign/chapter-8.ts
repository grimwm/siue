/* The Island of Crete: Chapter 8, "The Harpies' Den", in words. A draft for
 * the owner to edit: plain strings, one field per line. The levels that hold each
 * page name it in their `pages:` header. The quotations are word for word from
 * R. C. Seaton's 1912 Loeb translation of Apollonius of Rhodes's Argonautica, from
 * H. G. Evelyn-White's 1914 Loeb translation of Hesiod's Theogony, and from J. G.
 * Frazer's 1921 Loeb translation of Apollodorus's Library. DOM-free. */
import type { ChapterLore } from './lore.ts';

export const CHAPTER_8: ChapterLore = {
  opening: {
    text: 'The roof is open here, and the wind comes down through it. Harpies nest in these halls: each flies straight on, turns left when something stops it, and flies over water as if it were floor. Deeper in, Talos\'s fire runs the halls, turning right where a Harpy turns left, and running through fire as you walk through dust. Touch either and it costs you a heart; and neither lets the beast pass.',
    quote: {
      text: 'And the Harpies and Iris parted. They entered their den in Minoan Crete; but she sped up to Olympus, soaring aloft on her swift wings.',
      cite: 'Apollonius of Rhodes, Argonautica, 2.298–300, tr. R. C. Seaton (1912)',
    },
  },
  closing: {
    text: 'The wind drops, and the wings are gone. Your pack is lighter than it was, though nothing flew near it; and on the floor ahead are the prints of small, quick feet, running off into the dark where the beast cannot follow.',
    quote: {
      text: 'He was laid in swaddling-bands on the winnowing fan, but he slipped out and made his way to Pieria and stole the kine which Apollo was herding.',
      cite: 'Apollodorus, The Library, 3.10.2, tr. J. G. Frazer (1921)',
    },
  },
  pages: [
    {
      id: 'ch8-storm',
      title: 'Storm-Swift',
      text: 'You remember who the Harpies were: sisters of the rainbow, named for the wind. One was Storm-swift and one Swift-flier, and no bird could leave them behind. No wonder the halls are never still.',
      quote: {
        text: 'And Thaumas wedded Electra the daughter of deep-flowing Ocean, and she bare him swift Iris and the long-haired Harpies, Aello (Storm-swift) and Ocypetes (Swift-flier) who on their swift wings keep pace with the blasts of the winds and the birds; for quick as time they dart along.',
        cite: 'Hesiod, Theogony, 265–269, tr. H. G. Evelyn-White (1914)',
      },
    },
    {
      id: 'ch8-lead',
      title: 'Melted Lead',
      text: 'You remember how the bronze guard fell: not to a sword, but to a scratch. A stone grazed his ankle, and what ran out of him was not blood but fire, like lead poured from a crucible. Some of it, it seems, runs through these halls still.',
      quote: {
        text: 'And as he was heaving massy rocks to stay them from reaching the haven, he grazed his ankle on a pointed crag; and the ichor gushed forth like melted lead; and not long thereafter did he stand towering on the jutting cliff.',
        cite: 'Apollonius of Rhodes, Argonautica, 4.1677–1681, tr. R. C. Seaton (1912)',
      },
    },
  ],
};
