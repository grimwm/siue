# Roadmap

What comes next for Crete, the music workroom and the site's visitor statistics, in order, with the document
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
everyone, in four projects). Live: the workroom and its answering, the browser
renderer and the shared FLAC sample library (project 1); studios for every
`@siue.edu` address with notes keys, AI keys, start over and the admin view
(project 2, `plans/2026-10-29-music-studios.md`), with change passphrase,
forgot passphrase and emailed confirmation (`plans/2026-10-30-studio-keys.md`);
and the studio MCP server with AI sealing keys, pairing and `SIUEN2` notes, so
any studio connects its own AI app (project 3, `plans/2026-10-31-studio-mcp.md`).
The Crete title theme is finished and plays in Crete on every screen.

1. **Composing in the editor** (project 4) — in design; its plan follows the
   design.

## Visitor statistics

Design `specs/2026-10-31-site-analytics-design.md`, plan `plans/2026-10-31-site-analytics.md`. Live: the
beacon on the faculty page and every game, the write-only endpoint, raw rows and daily aggregates kept
forever, the game events (Crete, Tankity, the CIC, Share and installs), the Visitors
dashboard on the admin hub, and the privacy note (`privacy.html`).

1. **New games** count on their own once their `build.json` builds `stats-page.ts` and their page loads
   `dist/stats.js`; a game's new events join `Collector::EVENTS`.
