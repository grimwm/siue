# Roadmap

What comes next for Crete and the music workroom, in order, with the document
each step starts from. A step with a design but no plan gets its plan written
(`docs/superpowers/plans/`) when work on it begins.

## Crete

The vision and its parts are in `specs/2026-10-16-crete-redesign-vision.md`.
Live: the shell, the engine, Chapter 1 (ten levels, story pages, the Lore book),
full keyboard play, the fast solver and the level editor.

1. **Nine new pieces** — design `specs/2026-10-21-crete-pieces-design.md`,
   plan `plans/2026-10-27-crete-pieces.md`. Live in the engine, both solvers,
   the art and the sound: the nine pieces and the three hazards are in the
   rules, the packing, the estimate, the pruning and the same-answers corpus,
   drawn on the board, voiced, logged and explained in the help. The game lives
   in `websites/www.cs/games/crete/`; its `test/pieces.test.ts` fails until a
   new kind is handled in `src/puzzle/pack.ts`, `heuristic.ts`, `prune.ts` and
   the same-answers corpus.
2. **The level editor** — design `specs/2026-10-21-crete-editor-design.md`
   (Part 2 there). Live on the game page at `games/crete/#edit`: painting,
   Check with Stop and a progress bar, Try it on the full game screen, Share as
   a link and opening a link, with the OPFS solve cache trimmed. The README's
   "The editor" section describes it. The next step is Chapter 2, built in it.
3. **Chapters 2 to 10**, one pull request each, built in the editor and
   exported to the repo. Every level passes the difficulty gate
   (`src/puzzle/difficulty.ts`); a level that is winnable but easy is refused.
   Each chapter gets its music once the first piece is done.
4. **Endless**: the seeded generator on the same engine, checked by the solver.

## Music workroom

Design `specs/2026-10-17-music-workroom-design.md`; the workroom and its
answering are live.

1. **The first piece: the Crete title theme.** Design
   `specs/2026-10-28-crete-title-theme-design.md`; the composing pipeline
   (`music/compose/`) and draft 1, a one-minute sketch, are built. Next: the
   owner publishes it, answers it in the workroom, and each later draft
   follows those notes until the owner says it is done. Then the theme goes
   into Crete under the title card and story pages (its own plan).
