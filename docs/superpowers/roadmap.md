# Roadmap

What comes next for Crete, the music workroom and the site's visitor statistics, in order, with the document
each step starts from. A step with a design but no plan gets its plan written
(`docs/superpowers/plans/`) when work on it begins.

## Crete

The vision and its parts are in `specs/2026-10-16-crete-redesign-vision.md`.
Live: the shell, the engine, the whole campaign, Chapters 1 to 10 (ten levels
each, story pages, the Lore book, and three endings chosen by the pages found; Chapter 3 is `plans/2026-11-01-crete-chapter-3.md`, Chapter 4
`plans/2026-11-01-crete-chapter-4.md`, Chapter 5
`plans/2026-11-01-crete-chapter-5.md`, Chapter 6
`plans/2026-11-02-crete-chapter-6.md`, Chapter 7
`plans/2026-11-02-crete-chapter-7.md`, Chapter 8
`plans/2026-11-02-crete-chapter-8.md`, Chapter 9
`plans/2026-11-02-crete-chapter-9.md`, Chapter 10
`plans/2026-11-03-crete-chapter-10.md`), full keyboard play
and swipes, the fast solver, the level editor, the title theme on every screen, and
two looks: Modern (painted 3D, one free camera steered from the compass, with view
tips) and Classic, chosen when a new game starts.

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
3. **Endless** — design `specs/2026-11-04-crete-endless-difficulty-design.md`, plan
   `plans/2026-11-04-crete-endless-difficulty.md` (the first build: `plans/2026-11-03-crete-endless.md`). Live: three
   difficulties, Easy, Medium and Hard, each with its own saved run, best and bank, named in seed links; corridor
   mazes made by a seeded generator on the same engine and checked by the solver in its own worker; a gate no habit
   player passes, with open space that earns its place and hidden walls at every depth; runs that climb by a
   difficulty score to each difficulty's plateau; and the editor's Check rating any level on the same scale with the
   same checks. The README's "Endless" and "The editor" sections describe it.
4. **The campaign to Endless's rules** — redraw the campaign levels that a habit player wins or that are over the
   open-space ceiling (the report in `test/difficulty.test.ts` lists them), then hold the campaign to both rules.
   Chapter 1 stays as it is. Needs a plan.

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

Composing in the editor (project 4, `specs/2026-10-31-composer-editor-design.md`) is live in all seven
phases, each with its plan in `plans/`:
- 4a, the instrument library and catalogue (27 instruments, VSCO-2 CE and VCSL);
- 4b, the core editor;
- 4c, sheet music, import and export;
- 4d, keyboards, Hum and Play Along;
- 4e, speed, loudness, Sound and Voice Effects;
- 4f, Vocal Tracks (25 MB a studio);
- 4g, DJ & Effects.

## Visitor statistics

Design `specs/2026-10-31-site-analytics-design.md`, plan `plans/2026-10-31-site-analytics.md`. Live: the
beacon on the faculty page and every game, the write-only endpoint, raw rows and daily aggregates kept
forever, the game events (Crete, Tankity, the CIC, Share and installs), the Visitors
dashboard on the admin hub, and the privacy note (`privacy.html`).

1. **New games** count on their own once their `build.json` builds `stats-page.ts` and their page loads
   `dist/stats.js`; a game's new events join `Collector::EVENTS`.
