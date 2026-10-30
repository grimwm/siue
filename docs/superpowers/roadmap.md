# Roadmap

What comes next for Crete and the music workroom, in order, with the document
each step starts from. A step with a design but no plan gets its plan written
(`docs/superpowers/plans/`) when work on it begins.

## Crete

The vision and its parts are in `specs/2026-10-16-crete-redesign-vision.md`.
Live: the shell, the engine, Chapters 1 and 2 (ten levels each, story pages, the
Lore book), full keyboard play and swipes, the fast solver, the level editor,
the title theme on every screen, and two looks: Modern (painted 3D, Top-down by
default, or Angled) and Classic, chosen when a new game starts.

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
   "The editor" section describes it.
3. **Chapters 3 to 10**, one pull request each, built in the editor and
   exported to the repo. Every level passes the difficulty gate
   (`src/puzzle/difficulty.ts`); a level that is winnable but easy is refused.
   Each chapter gets its music once the first piece is done.
4. **Endless**: the seeded generator on the same engine, checked by the solver.

## Music workroom

Designs `specs/2026-10-17-music-workroom-design.md` (the workroom and its
answering) and `specs/2026-10-29-music-studios-design.md` (studios for
everyone, in four projects). Live: the workroom, its answering, the owner's MCP
server, the browser renderer and the shared FLAC sample library (a score-only
draft plays, draws its sound picture and downloads in the browser). The Crete
title theme is finished and plays in Crete on every screen.

1. **Studios for everyone** (project 2) — plan
   `plans/2026-10-29-music-studios.md`: accounts for any `@siue.edu` address,
   per-account storage and limits, the notes key made on the page, AI keys,
   start over, and the admin view of accounts.
2. **The MCP server for everyone and AI sealing keys** (project 3) — the live
   connection and the `SIUEN2` note format; its plan is written when work on it
   begins.
3. **Composing in the editor** (project 4) — its own design first, then its
   plan.
