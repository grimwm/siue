# Roadmap

What comes next for Crete and the music workroom, in order, with the document
each step starts from. A step with a design but no plan gets its plan written
(`docs/superpowers/plans/`) when work on it begins.

## Crete

The vision and its parts are in `specs/2026-10-16-crete-redesign-vision.md`.
Live: the shell, the engine, Chapter 1 (ten levels, story pages, the Lore book),
full keyboard play, and the fast solver.

1. **Nine new pieces** — design `specs/2026-10-21-crete-pieces-design.md`,
   plan `plans/2026-10-27-crete-pieces.md`. The rules and both solvers are
   done: every piece is in the engine, the packing, the estimate, the pruning
   and the same-answers corpus. The art and the sounds are in progress. The
   game lives in `websites/www.cs/games/crete/`; its `test/pieces.test.ts`
   fails until a new kind is handled in `src/puzzle/pack.ts`, `heuristic.ts`,
   `prune.ts` and the same-answers corpus.
2. **The level editor** — design `specs/2026-10-21-crete-editor-design.md`
   (Part 2 there); no plan yet. Also lands here, held over from the fast
   solver:
   - A Stop for a running proof: `src/solver-client.ts` cancels a search only
     by starting a newer one, so the editor needs a `cancel()`, plus the
     progress bar Check and Share show while it runs.
   - Eviction for the OPFS solve cache (`src/puzzle/cache.ts` never removes an
     entry).
3. **Chapters 2 to 10**, one pull request each, built in the editor and
   exported to the repo. Every level passes the difficulty gate
   (`src/puzzle/difficulty.ts`); a level that is winnable but easy is refused.
   Each chapter gets its music once the first piece is done.
4. **Endless**: the seeded generator on the same engine, checked by the solver.

## Music workroom

Design `specs/2026-10-17-music-workroom-design.md`; the workroom and its
answering are live.

1. **Notes do not show and cannot be added** on the live site after
   `make music-setup` and entering the passphrase. Find out why first.
2. **A failed Discard of the browser's saved draft** says "Could not reach the
   server"; it should say the draft could not be discarded.
3. **The shared-origin question** is still open: whether the workroom shares an
   origin with the games.
4. **The first piece**, likely the Crete title theme.
